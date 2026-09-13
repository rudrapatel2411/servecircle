/**
 * metricsService.js — Phase 2 AI Data Foundation
 *
 * Maintains WorkerMetrics and CustomerMetrics automatically.
 * Called by bookingService after each state transition.
 *
 * Rules:
 *   - All writes are upserts (creates doc if it doesn't exist)
 *   - All counter updates use $inc for atomicity
 *   - Averages are recalculated using accumulated sums
 *   - Fire-and-forget from callers — failures are logged, not rethrown
 */

import WorkerMetrics from '../models/WorkerMetrics.js';
import CustomerMetrics from '../models/CustomerMetrics.js';

// ─── WORKER METRICS ───────────────────────────────────────────────────────────

/**
 * Ensure a WorkerMetrics document exists for this worker.
 * All upserts below handle creation automatically, but this can be called
 * proactively on worker verification.
 */
export async function ensureWorkerMetrics(workerId) {
  await WorkerMetrics.updateOne(
    { workerId },
    { $setOnInsert: { workerId } },
    { upsert: true }
  );
}

/**
 * Record a new assignment for a worker.
 */
export async function recordWorkerAssignment(workerId) {
  try {
    await WorkerMetrics.updateOne(
      { workerId },
      {
        $inc: { totalAssignments: 1 },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { workerId },
      },
      { upsert: true }
    );
    await _recalcRates(workerId);
  } catch (err) {
    console.error('[MetricsService] recordWorkerAssignment failed:', err.message);
  }
}

/**
 * Record a booking acceptance by the worker.
 * Optionally records response time (ms from assignment to acceptance).
 */
export async function recordWorkerAcceptance(workerId, responseTimeMs) {
  try {
    const update = {
      $inc: { totalAcceptances: 1 },
      $set: { lastUpdated: new Date() },
      $setOnInsert: { workerId },
    };
    if (responseTimeMs != null) {
      update.$inc._sumResponseTimeMs = responseTimeMs;
      update.$inc._timingSamples = 1;
    }
    await WorkerMetrics.updateOne({ workerId }, update, { upsert: true });
    if (responseTimeMs != null) await _recalcTimings(workerId);
    await _recalcRates(workerId);
  } catch (err) {
    console.error('[MetricsService] recordWorkerAcceptance failed:', err.message);
  }
}

/**
 * Record a rejection by the worker.
 */
export async function recordWorkerRejection(workerId) {
  try {
    await WorkerMetrics.updateOne(
      { workerId },
      {
        $inc: { totalRejections: 1 },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { workerId },
      },
      { upsert: true }
    );
    await _recalcRates(workerId);
  } catch (err) {
    console.error('[MetricsService] recordWorkerRejection failed:', err.message);
  }
}

/**
 * Record worker arriving at site.
 * Optionally records arrival time (ms from accepted to arrived).
 */
export async function recordWorkerArrival(workerId, arrivalTimeMs) {
  try {
    const update = {
      $set: { lastUpdated: new Date() },
      $setOnInsert: { workerId },
    };
    if (arrivalTimeMs != null) {
      update.$inc = { _sumArrivalTimeMs: arrivalTimeMs };
    }
    await WorkerMetrics.updateOne({ workerId }, update, { upsert: true });
    if (arrivalTimeMs != null) await _recalcTimings(workerId);
  } catch (err) {
    console.error('[MetricsService] recordWorkerArrival failed:', err.message);
  }
}

/**
 * Record job completion by worker.
 * Records completion time (ms from started to completed).
 */
export async function recordWorkerCompletion(workerId, completionTimeMs, customerId, category, jobCompletedAt) {
  try {
    const inc = {
      totalCompletions: 1,
      ...(completionTimeMs != null ? { _sumCompletionTimeMs: completionTimeMs, _timingSamples: 1 } : {}),
    };
    await WorkerMetrics.updateOne(
      { workerId },
      {
        $inc: inc,
        $set: { lastJobAt: jobCompletedAt || new Date(), lastUpdated: new Date() },
        $setOnInsert: { workerId },
      },
      { upsert: true }
    );
    // Track unique vs repeat customers
    await _trackCustomerUniqueness(workerId, customerId);
    // Track category breakdown
    if (category) await _updateCategoryBreakdown(workerId, category);
    if (completionTimeMs != null) await _recalcTimings(workerId);
    await _recalcRates(workerId);
  } catch (err) {
    console.error('[MetricsService] recordWorkerCompletion failed:', err.message);
  }
}

/**
 * Record a worker cancellation.
 */
export async function recordWorkerCancellation(workerId) {
  try {
    await WorkerMetrics.updateOne(
      { workerId },
      {
        $inc: { totalCancellations: 1 },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { workerId },
      },
      { upsert: true }
    );
    await _recalcRates(workerId);
  } catch (err) {
    console.error('[MetricsService] recordWorkerCancellation failed:', err.message);
  }
}

/**
 * Record an OTP failure for a worker.
 */
export async function recordWorkerOtpFailure(workerId) {
  try {
    await WorkerMetrics.updateOne(
      { workerId },
      {
        $inc: { totalOtpFailures: 1 },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { workerId },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[MetricsService] recordWorkerOtpFailure failed:', err.message);
  }
}

/**
 * Update worker's average rating after a new review is added.
 *
 * @param {string} workerId
 * @param {object} ratingBreakdown — { overall, quality, punctuality, communication, professionalism, cleanliness, valueForMoney }
 */
export async function updateWorkerRating(workerId, ratingBreakdown) {
  try {
    const metrics = await WorkerMetrics.findOne({ workerId });
    if (!metrics) {
      await WorkerMetrics.create({
        workerId,
        totalRatings: 1,
        avgRatingOverall:        ratingBreakdown.overall        || 0,
        avgRatingQuality:        ratingBreakdown.quality        || 0,
        avgRatingPunctuality:    ratingBreakdown.punctuality    || 0,
        avgRatingCommunication:  ratingBreakdown.communication  || 0,
        avgRatingProfessionalism:ratingBreakdown.professionalism|| 0,
        avgRatingCleanliness:    ratingBreakdown.cleanliness    || 0,
        avgRatingValue:          ratingBreakdown.valueForMoney  || 0,
      });
      return;
    }

    const n = metrics.totalRatings;
    // Rolling average formula: newAvg = (oldAvg * n + newValue) / (n + 1)
    const calc = (old, val) => val != null ? (old * n + val) / (n + 1) : old;

    await WorkerMetrics.updateOne(
      { workerId },
      {
        $inc: { totalRatings: 1 },
        $set: {
          avgRatingOverall:        calc(metrics.avgRatingOverall,        ratingBreakdown.overall),
          avgRatingQuality:        calc(metrics.avgRatingQuality,        ratingBreakdown.quality),
          avgRatingPunctuality:    calc(metrics.avgRatingPunctuality,    ratingBreakdown.punctuality),
          avgRatingCommunication:  calc(metrics.avgRatingCommunication,  ratingBreakdown.communication),
          avgRatingProfessionalism:calc(metrics.avgRatingProfessionalism,ratingBreakdown.professionalism),
          avgRatingCleanliness:    calc(metrics.avgRatingCleanliness,    ratingBreakdown.cleanliness),
          avgRatingValue:          calc(metrics.avgRatingValue,          ratingBreakdown.valueForMoney),
          lastUpdated: new Date(),
        },
      }
    );
  } catch (err) {
    console.error('[MetricsService] updateWorkerRating failed:', err.message);
  }
}

// ─── CUSTOMER METRICS ────────────────────────────────────────────────────────

/**
 * Ensure a CustomerMetrics document exists for this customer.
 */
export async function ensureCustomerMetrics(customerId) {
  await CustomerMetrics.updateOne(
    { customerId },
    { $setOnInsert: { customerId } },
    { upsert: true }
  );
}

/**
 * Record a new booking created by a customer.
 */
export async function recordCustomerBooking(customerId, amount, category, isEmergency, bookingDate) {
  try {
    const update = {
      $inc: {
        totalBookings:     1,
        totalSpend:        amount || 0,
        emergencyBookings: isEmergency ? 1 : 0,
      },
      $set: {
        lastBookingAt: bookingDate || new Date(),
        lastUpdated:   new Date(),
      },
      $setOnInsert: { customerId },
    };

    const metrics = await CustomerMetrics.findOne({ customerId });
    if (!metrics?.firstBookingAt) {
      update.$set.firstBookingAt = bookingDate || new Date();
    }

    await CustomerMetrics.updateOne({ customerId }, update, { upsert: true });
    await _updateCategoryPreference(customerId, category);
    await _recalcCustomerAverages(customerId);
  } catch (err) {
    console.error('[MetricsService] recordCustomerBooking failed:', err.message);
  }
}

/**
 * Record a completed booking for the customer.
 */
export async function recordCustomerCompletion(customerId, workerId) {
  try {
    await CustomerMetrics.updateOne(
      { customerId },
      {
        $inc: { completedBookings: 1 },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { customerId },
      },
      { upsert: true }
    );
    await _updatePreferredWorker(customerId, workerId);
    // Mark as repeat customer if they've completed more than 1 booking
    const metrics = await CustomerMetrics.findOne({ customerId });
    if (metrics && metrics.completedBookings > 1) {
      await CustomerMetrics.updateOne({ customerId }, { $set: { isRepeatCustomer: true } });
    }
  } catch (err) {
    console.error('[MetricsService] recordCustomerCompletion failed:', err.message);
  }
}

/**
 * Record a cancellation by the customer.
 */
export async function recordCustomerCancellation(customerId) {
  try {
    await CustomerMetrics.updateOne(
      { customerId },
      {
        $inc: { cancelledBookings: 1 },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { customerId },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[MetricsService] recordCustomerCancellation failed:', err.message);
  }
}

/**
 * Update customer rating behaviour when they submit a review.
 */
export async function recordCustomerReview(customerId, rating) {
  try {
    const metrics = await CustomerMetrics.findOneAndUpdate(
      { customerId },
      {
        $inc: { totalReviews: 1, _sumRatingGiven: rating },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { customerId },
      },
      { upsert: true, new: true }
    );
    const avg = metrics._sumRatingGiven / metrics.totalReviews;
    await CustomerMetrics.updateOne({ customerId }, { $set: { avgRatingGiven: avg } });
  } catch (err) {
    console.error('[MetricsService] recordCustomerReview failed:', err.message);
  }
}

// ─── PRIVATE HELPERS ──────────────────────────────────────────────────────────

async function _recalcRates(workerId) {
  const m = await WorkerMetrics.findOne({ workerId });
  if (!m) return;
  const successRate    = m.totalAssignments > 0 ? m.totalCompletions  / m.totalAssignments  : 0;
  const acceptanceRate = m.totalAssignments > 0 ? m.totalAcceptances  / m.totalAssignments  : 0;
  const completionRate = m.totalAcceptances > 0 ? m.totalCompletions  / m.totalAcceptances  : 0;
  await WorkerMetrics.updateOne({ workerId }, {
    $set: { successRate, acceptanceRate, completionRate }
  });
}

async function _recalcTimings(workerId) {
  const m = await WorkerMetrics.findOne({ workerId });
  if (!m || m._timingSamples === 0) return;
  await WorkerMetrics.updateOne({ workerId }, {
    $set: {
      avgResponseTimeMs:    m._sumResponseTimeMs   / m._timingSamples,
      avgArrivalTimeMs:     m._sumArrivalTimeMs    / m._timingSamples,
      avgCompletionTimeMs:  m._sumCompletionTimeMs / m._timingSamples,
    },
  });
}

async function _trackCustomerUniqueness(workerId, customerId) {
  if (!customerId) return;
  const m = await WorkerMetrics.findOne({ workerId });
  if (!m) return;
  const alreadySeen = m.uniqueCustomerIds.some(
    (id) => id.toString() === customerId.toString()
  );
  if (!alreadySeen) {
    await WorkerMetrics.updateOne({ workerId }, {
      $inc: { uniqueCustomers: 1 },
      $push: { uniqueCustomerIds: customerId },
    });
  } else {
    await WorkerMetrics.updateOne({ workerId }, {
      $inc: { repeatCustomers: 1 },
    });
  }
}

async function _updateCategoryBreakdown(workerId, category) {
  const m = await WorkerMetrics.findOne({ workerId });
  if (!m) return;
  const existing = m.categoryBreakdown.find((c) => c.category === category);
  if (existing) {
    await WorkerMetrics.updateOne(
      { workerId, 'categoryBreakdown.category': category },
      { $inc: { 'categoryBreakdown.$.completions': 1 } }
    );
  } else {
    await WorkerMetrics.updateOne(
      { workerId },
      { $push: { categoryBreakdown: { category, completions: 1, avgRating: 0 } } }
    );
  }
}

async function _updateCategoryPreference(customerId, category) {
  if (!category) return;
  const m = await CustomerMetrics.findOne({ customerId });
  if (!m) return;
  const existing = m.favoriteCategories.find((c) => c.category === category);
  if (existing) {
    await CustomerMetrics.updateOne(
      { customerId, 'favoriteCategories.category': category },
      { $inc: { 'favoriteCategories.$.count': 1 } }
    );
  } else {
    await CustomerMetrics.updateOne(
      { customerId },
      { $push: { favoriteCategories: { category, count: 1 } } }
    );
  }
}

async function _updatePreferredWorker(customerId, workerId) {
  if (!workerId) return;
  const m = await CustomerMetrics.findOne({ customerId });
  if (!m) return;
  const existing = m.preferredWorkers.find(
    (w) => w.workerId?.toString() === workerId?.toString()
  );
  if (existing) {
    await CustomerMetrics.updateOne(
      { customerId, 'preferredWorkers.workerId': workerId },
      { $inc: { 'preferredWorkers.$.bookingsCount': 1 } }
    );
  } else {
    await CustomerMetrics.updateOne(
      { customerId },
      { $push: { preferredWorkers: { workerId, bookingsCount: 1 } } }
    );
  }
}

async function _recalcCustomerAverages(customerId) {
  const m = await CustomerMetrics.findOne({ customerId });
  if (!m || m.totalBookings === 0) return;
  await CustomerMetrics.updateOne({ customerId }, {
    $set: {
      avgSpendPerJob: m.totalSpend / m.totalBookings,
    }
  });
}
