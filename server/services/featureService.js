/**
 * featureService.js — Phase 2 Batch 2
 *
 * Generates ML-ready FeatureStore records after each booking closes.
 * Also updates DemandHistory, WorkerGeoHistory, WorkerSkillHistory,
 * CustomerBehaviour, and TrustProfile as part of booking lifecycle.
 *
 * All functions are fire-and-forget — failures are logged, never rethrown.
 */

import Booking from '../models/Booking.js';
import WorkerMetrics from '../models/WorkerMetrics.js';
import CustomerMetrics from '../models/CustomerMetrics.js';
import TrustProfile from '../models/TrustProfile.js';
import WorkerSkillHistory from '../models/WorkerSkillHistory.js';
import WorkerGeoHistory from '../models/WorkerGeoHistory.js';
import CustomerBehaviour from '../models/CustomerBehaviour.js';
import DemandHistory from '../models/DemandHistory.js';
import FeatureStore from '../models/FeatureStore.js';
import ComplaintMetrics from '../models/ComplaintMetrics.js';

// ─── TRUST PROFILE ────────────────────────────────────────────────────────────

/**
 * Sync TrustProfile from WorkerMetrics after each significant event.
 * Data-only: no score calculation.
 */
export async function syncTrustProfile(workerId) {
  try {
    const wm = await WorkerMetrics.findOne({ workerId }).lean();
    if (!wm) return;

    const now = new Date();

    await TrustProfile.updateOne(
      { workerId },
      {
        $set: {
          completionRate:          wm.successRate        || 0,
          acceptanceRate:          wm.acceptanceRate     || 0,
          rejectionRate:           wm.totalAssignments > 0
            ? (wm.totalRejections || 0) / wm.totalAssignments : 0,
          cancellationRate:        wm.totalAssignments > 0
            ? (wm.totalCancellations || 0) / wm.totalAssignments : 0,
          repeatCustomerRate:      wm.uniqueCustomers > 0
            ? (wm.repeatCustomers || 0) / wm.uniqueCustomers : 0,
          averageRating:           wm.avgRatingOverall   || 0,
          'ratingBreakdown.overall':        wm.avgRatingOverall        || 0,
          'ratingBreakdown.quality':        wm.avgRatingQuality        || 0,
          'ratingBreakdown.punctuality':    wm.avgRatingPunctuality    || 0,
          'ratingBreakdown.communication':  wm.avgRatingCommunication  || 0,
          'ratingBreakdown.professionalism':wm.avgRatingProfessionalism|| 0,
          'ratingBreakdown.cleanliness':    wm.avgRatingCleanliness    || 0,
          'ratingBreakdown.valueForMoney':  wm.avgRatingValue          || 0,
          averageArrivalTimeMs:    wm.avgArrivalTimeMs    || 0,
          averageResponseTimeMs:   wm.avgResponseTimeMs   || 0,
          averageCompletionTimeMs: wm.avgCompletionTimeMs || 0,
          lastUpdated: now,
        },
        $setOnInsert: { workerId },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[FeatureService] syncTrustProfile failed:', err.message);
  }
}

/**
 * Update TrustProfile when worker is verified/approved/suspended by admin.
 */
export async function updateTrustVerification(workerId, workerStatus, user) {
  try {
    const isVerified = ['approved_rookie', 'approved_junior', 'approved_senior'].includes(workerStatus);
    const isSuspended = workerStatus === 'suspended';

    const updates = { lastUpdated: new Date() };
    if (isVerified) {
      updates['identityVerification.status'] = 'verified';
      updates['identityVerification.verifiedAt'] = new Date();
      updates['skillVerification.status'] = 'verified';
      updates['skillVerification.verifiedAt'] = new Date();
    }
    if (isSuspended) {
      updates['adminWarnings.count'] = 1; // will be incremented if already exists
    }

    // Compute profile completeness from user
    if (user) {
      let complete = 0;
      if (user.name)            complete += 15;
      if (user.phone)           complete += 15;
      if (user.email)           complete += 15;
      if (user.avatar)          complete += 10;
      if (user.city)            complete += 10;
      if (user.skills?.length)  complete += 15;
      if (user.serviceCategory) complete += 10;
      if (user.experience)      complete += 10;
      updates.profileCompleteness = Math.min(complete, 100);
    }

    await TrustProfile.updateOne(
      { workerId },
      { $set: updates, $setOnInsert: { workerId } },
      { upsert: true }
    );
  } catch (err) {
    console.error('[FeatureService] updateTrustVerification failed:', err.message);
  }
}

/**
 * Record complaint-related trust signal on worker's TrustProfile.
 */
export async function recordTrustComplaint(workerId) {
  try {
    const wm = await WorkerMetrics.findOne({ workerId }).lean();
    const complaintRate = wm && wm.totalCompletions > 0
      ? (wm.totalComplaints || 0) / wm.totalCompletions : 0;

    await TrustProfile.updateOne(
      { workerId },
      { $set: { complaintRate, lastUpdated: new Date() }, $setOnInsert: { workerId } },
      { upsert: true }
    );
  } catch (err) {
    console.error('[FeatureService] recordTrustComplaint failed:', err.message);
  }
}

// ─── WORKER SKILL HISTORY ────────────────────────────────────────────────────

/**
 * Record a completed job in WorkerSkillHistory.
 */
export async function recordSkillCompletion(workerId, service, category, completionTimeMs, customerId) {
  try {
    const filter = { workerId, service, category };

    const existing = await WorkerSkillHistory.findOne(filter);
    if (!existing) {
      await WorkerSkillHistory.create({
        ...filter,
        jobCount: 1,
        successCount: 1,
        _sumDurationMs: completionTimeMs || 0,
        averageDurationMs: completionTimeMs || 0,
        lastPerformed: new Date(),
        uniqueCustomerIds: customerId ? [customerId] : [],
        uniqueCustomers: customerId ? 1 : 0,
      });
      return;
    }

    const newJobCount = existing.jobCount + 1;
    const newSumDuration = (existing._sumDurationMs || 0) + (completionTimeMs || 0);

    const inc = { jobCount: 1, successCount: 1 };
    if (completionTimeMs) inc._sumDurationMs = completionTimeMs;

    await WorkerSkillHistory.updateOne(filter, {
      $inc: inc,
      $set: {
        averageDurationMs: completionTimeMs ? newSumDuration / newJobCount : existing.averageDurationMs,
        lastPerformed: new Date(),
        lastUpdated: new Date(),
      },
    });

    // Track unique vs repeat customers
    if (customerId) {
      const alreadySeen = existing.uniqueCustomerIds.some(
        (id) => id.toString() === customerId.toString()
      );
      if (!alreadySeen) {
        await WorkerSkillHistory.updateOne(filter, {
          $push: { uniqueCustomerIds: customerId },
        });
      } else {
        await WorkerSkillHistory.updateOne(filter, { $inc: { repeatCustomers: 1 } });
      }
    }
  } catch (err) {
    console.error('[FeatureService] recordSkillCompletion failed:', err.message);
  }
}

/**
 * Update skill rating after a review is submitted.
 */
export async function recordSkillRating(workerId, service, category, rating) {
  try {
    if (!rating) return;
    const filter = { workerId, service, category };

    const existing = await WorkerSkillHistory.findOne(filter);
    if (!existing) return;

    const n = existing._ratingCount || 0;
    const newAvg = (existing._sumRating + rating) / (n + 1);

    await WorkerSkillHistory.updateOne(filter, {
      $inc: { _ratingCount: 1, _sumRating: rating },
      $set: { averageRating: newAvg, lastUpdated: new Date() },
    });
  } catch (err) {
    console.error('[FeatureService] recordSkillRating failed:', err.message);
  }
}

/**
 * Increment photo evidence counts.
 */
export async function recordSkillPhotos(workerId, service, category, beforeCount, afterCount) {
  try {
    await WorkerSkillHistory.updateOne(
      { workerId, service, category },
      {
        $inc: {
          beforePhotosCount: beforeCount || 0,
          afterPhotosCount:  afterCount  || 0,
        },
        $setOnInsert: { workerId, service, category },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[FeatureService] recordSkillPhotos failed:', err.message);
  }
}

// ─── WORKER GEO HISTORY ──────────────────────────────────────────────────────

/**
 * Append a geo record after a booking reaches arrived/completed state.
 */
export async function appendGeoHistory(workerId, bookingId, city, serviceCategory, service) {
  try {
    await WorkerGeoHistory.create({
      workerId,
      bookingId,
      city: city || 'unknown',
      serviceCategory: serviceCategory || '',
      service: service || '',
      timestamp: new Date(),
    });
  } catch (err) {
    // May duplicate on retry — ignore duplicate key errors
    if (err.code !== 11000) {
      console.error('[FeatureService] appendGeoHistory failed:', err.message);
    }
  }
}

// ─── CUSTOMER BEHAVIOUR ──────────────────────────────────────────────────────

/**
 * Update CustomerBehaviour on new booking.
 */
export async function recordBehaviourBooking(customerId, booking) {
  try {
    const scheduled = booking.scheduledDate ? new Date(booking.scheduledDate) : new Date();
    const hour = scheduled.getHours();
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const dayKey = dayNames[scheduled.getDay()];

    // Time bucket
    let timeKey = 'night';
    if (hour >= 6  && hour < 12) timeKey = 'morning';
    if (hour >= 12 && hour < 17) timeKey = 'afternoon';
    if (hour >= 17 && hour < 21) timeKey = 'evening';

    const inc = {
      [`preferredTime.${timeKey}`]: 1,
      [`preferredDays.${dayKey}`]:  1,
    };
    if (booking.isEmergency) {
      inc['emergencyUsage.count'] = 1;
    }

    await CustomerBehaviour.updateOne(
      { customerId },
      {
        $inc: inc,
        $set:  { lastUpdated: new Date() },
        $setOnInsert: { customerId },
      },
      { upsert: true }
    );

    // Update category preference
    const existing = await CustomerBehaviour.findOne({ customerId });
    if (existing) {
      const catEntry = existing.preferredCategories.find(c => c.category === booking.category);
      if (catEntry) {
        await CustomerBehaviour.updateOne(
          { customerId, 'preferredCategories.category': booking.category },
          { $inc: { 'preferredCategories.$.count': 1 }, $set: { 'preferredCategories.$.lastUsed': new Date() } }
        );
      } else {
        await CustomerBehaviour.updateOne(
          { customerId },
          { $push: { preferredCategories: { category: booking.category, count: 1, lastUsed: new Date() } } }
        );
      }

      // Recalculate emergency rate
      const totalBookings = (await CustomerMetrics.findOne({ customerId })?.totalBookings) || 1;
      await CustomerBehaviour.updateOne(
        { customerId },
        { $set: { 'emergencyUsage.rate': (existing.emergencyUsage?.count || 0) / totalBookings } }
      );
    }
  } catch (err) {
    console.error('[FeatureService] recordBehaviourBooking failed:', err.message);
  }
}

/**
 * Update cancellation pattern on customer cancellation.
 */
export async function recordBehaviourCancellation(customerId, reason) {
  try {
    const b = await CustomerBehaviour.findOne({ customerId });
    const totalBookings = (await CustomerMetrics.findOne({ customerId }))?.totalBookings || 1;
    const newCancelTotal = (b?.cancellationPattern?.total || 0) + 1;

    await CustomerBehaviour.updateOne(
      { customerId },
      {
        $inc: { 'cancellationPattern.total': 1 },
        $set: {
          'cancellationPattern.rate': newCancelTotal / totalBookings,
          'cancellationPattern.commonReason': reason || undefined,
          lastUpdated: new Date(),
        },
        $setOnInsert: { customerId },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[FeatureService] recordBehaviourCancellation failed:', err.message);
  }
}

/**
 * Update review pattern after customer submits a review.
 */
export async function recordBehaviourReview(customerId, rating, completedBookings) {
  try {
    const b = await CustomerBehaviour.findOne({ customerId });
    const newTotal = (b?.reviewPattern?.totalReviews || 0) + 1;
    const n = b?.reviewPattern?.totalReviews || 0;
    const newAvg = ((b?.reviewPattern?.avgRatingGiven || 0) * n + rating) / (n + 1);
    const rate = completedBookings > 0 ? newTotal / completedBookings : 0;

    let tendency = 'never';
    if (rate > 0.8) tendency = 'always';
    else if (rate > 0.4) tendency = 'sometimes';
    else if (rate > 0.1) tendency = 'rarely';

    await CustomerBehaviour.updateOne(
      { customerId },
      {
        $inc: { 'reviewPattern.totalReviews': 1 },
        $set: {
          'reviewPattern.avgRatingGiven': newAvg,
          'reviewPattern.reviewRate':     rate,
          'reviewPattern.tendencyToRate': tendency,
          lastUpdated: new Date(),
        },
        $setOnInsert: { customerId },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[FeatureService] recordBehaviourReview failed:', err.message);
  }
}

// ─── DEMAND HISTORY ──────────────────────────────────────────────────────────

/**
 * Increment demand bucket for a booking event.
 */
export async function recordDemand(booking, eventType) {
  try {
    const now = booking.createdAt ? new Date(booking.createdAt) : new Date();
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const hour = now.getUTCHours();
    const city = booking.city || 'unknown';
    const serviceCategory = booking.category || 'unknown';

    const filter = { city, serviceCategory, date, hour };

    const inc = { bookingCount: 1 };
    if (eventType === 'completed') { inc.completedCount = 1; inc.assignedCount = 1; }
    if (eventType === 'cancelled') inc.cancelledCount = 1;
    if (eventType === 'emergency') inc.emergencyCount = 1;
    if (eventType === 'assigned')  inc.assignedCount  = 1;
    if (eventType === 'unassigned')inc.unassignedCount = 1;

    // Price rolling average
    const priceInc = {};
    if (booking.amount) {
      priceInc._sumPrice = booking.amount;
    }

    await DemandHistory.updateOne(
      filter,
      {
        $inc: { ...inc, ...priceInc },
        $setOnInsert: { city, serviceCategory, subCategory: booking.subCategory || '', date, hour },
      },
      { upsert: true }
    );

    // Recalculate average price
    if (booking.amount) {
      const d = await DemandHistory.findOne(filter);
      if (d && d.bookingCount > 0) {
        await DemandHistory.updateOne(filter, {
          $set: { averagePrice: d._sumPrice / d.bookingCount },
        });
      }
    }
  } catch (err) {
    if (err.code !== 11000) {
      console.error('[FeatureService] recordDemand failed:', err.message);
    }
  }
}

// ─── COMPLAINT METRICS ───────────────────────────────────────────────────────

/**
 * Update ComplaintMetrics on complaint creation.
 */
export async function recordComplaintCreated(complaint) {
  try {
    const againstRole = complaint.againstRole || 'worker'; // 'worker' | 'customer'
    const category    = complaint.category || 'other';

    const globalInc = {
      totalComplaints:   1,
      pendingComplaints: 1,
      [`${againstRole}Complaints`]: 1,
    };

    // Global document
    await ComplaintMetrics.updateOne(
      { entityType: 'global', entityId: null },
      {
        $inc: globalInc,
        $set: { lastUpdated: new Date() },
        $setOnInsert: { entityType: 'global', entityId: null },
      },
      { upsert: true }
    );
    await _incrementCategory('global', null, category);

    // Per-entity document (whoever is complained against)
    if (complaint.againstUser) {
      await ComplaintMetrics.updateOne(
        { entityType: againstRole, entityId: complaint.againstUser },
        {
          $inc: { totalComplaints: 1, pendingComplaints: 1 },
          $set: { lastUpdated: new Date() },
          $setOnInsert: { entityType: againstRole, entityId: complaint.againstUser },
        },
        { upsert: true }
      );
      await _incrementCategory(againstRole, complaint.againstUser, category);

      // If against worker — update TrustProfile complaint signal
      if (againstRole === 'worker') {
        await recordTrustComplaint(complaint.againstUser);
      }
    }
  } catch (err) {
    console.error('[FeatureService] recordComplaintCreated failed:', err.message);
  }
}

/**
 * Update ComplaintMetrics on complaint resolution.
 */
export async function recordComplaintResolved(complaint, resolutionTimeMs) {
  try {
    const againstRole = complaint.againstRole || 'worker';

    const globalDoc = await ComplaintMetrics.findOne({ entityType: 'global' });
    const n = globalDoc?.resolvedComplaints || 0;
    const newSumMs = (globalDoc?._sumResolutionTimeMs || 0) + (resolutionTimeMs || 0);
    const newAvgMs = n + 1 > 0 ? newSumMs / (n + 1) : 0;

    await ComplaintMetrics.updateOne(
      { entityType: 'global', entityId: null },
      {
        $inc: { resolvedComplaints: 1, _sumResolutionTimeMs: resolutionTimeMs || 0 },
        $set: { averageResolutionTimeMs: newAvgMs, lastUpdated: new Date() },
        ...(complaint.status === 'dismissed' ? { $inc: { falseComplaints: 1 } } : {}),
      }
    );

    if (complaint.againstUser) {
      await ComplaintMetrics.updateOne(
        { entityType: againstRole, entityId: complaint.againstUser },
        {
          $inc: { resolvedComplaints: 1 },
          $set: { lastUpdated: new Date() },
        }
      );
    }
  } catch (err) {
    console.error('[FeatureService] recordComplaintResolved failed:', err.message);
  }
}

// ─── FEATURE STORE ───────────────────────────────────────────────────────────

/**
 * Generate a ML feature record when a booking is closed.
 * Fetches point-in-time snapshots from metrics/trust models.
 */
export async function generateFeatureRecord(bookingId) {
  try {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking || booking.status !== 'closed') return;

    // Prevent duplicate
    const exists = await FeatureStore.findOne({ bookingId });
    if (exists) return;

    const [wm, cm, tp] = await Promise.all([
      WorkerMetrics.findOne({ workerId: booking.worker }).lean(),
      CustomerMetrics.findOne({ customerId: booking.customer }).lean(),
      TrustProfile.findOne({ workerId: booking.worker }).lean(),
    ]);

    const scheduled = booking.scheduledDate ? new Date(booking.scheduledDate) : null;
    const closedAt  = booking.closedAt  ? new Date(booking.closedAt)  : new Date();
    const createdAt = booking.createdAt ? new Date(booking.createdAt) : null;

    const milestones = (booking.timeline || []).map(t => t.event);

    await FeatureStore.create({
      bookingId:  booking._id,
      customerId: booking.customer,
      workerId:   booking.worker,
      city:       booking.city || 'unknown',
      category:   booking.category,
      price:      booking.amount,
      isEmergency:booking.isEmergency || false,
      scheduledHour:      scheduled ? scheduled.getHours()   : null,
      scheduledDayOfWeek: scheduled ? scheduled.getDay()     : null,
      arrivalTimeMs:   booking.arrivedAt  && booking.acceptedAt  ? new Date(booking.arrivedAt).getTime()  - new Date(booking.acceptedAt).getTime()  : null,
      responseTimeMs:  booking.acceptedAt && booking.assignedAt  ? new Date(booking.acceptedAt).getTime() - new Date(booking.assignedAt).getTime()  : null,
      completionTimeMs:booking.completedAt && booking.startedAt  ? new Date(booking.completedAt).getTime() - new Date(booking.startedAt).getTime() : null,
      ratingBreakdown: booking.ratingBreakdown || {},
      workerMetricsSnapshot: wm ? {
        completionRate:    wm.successRate       || 0,
        acceptanceRate:    wm.acceptanceRate    || 0,
        avgRating:         wm.avgRatingOverall  || 0,
        totalCompletions:  wm.totalCompletions  || 0,
        avgResponseTimeMs: wm.avgResponseTimeMs || 0,
        avgArrivalTimeMs:  wm.avgArrivalTimeMs  || 0,
      } : {},
      customerMetricsSnapshot: cm ? {
        totalBookings:    cm.totalBookings    || 0,
        completedBookings:cm.completedBookings|| 0,
        avgSpend:         cm.avgSpendPerJob   || 0,
        isRepeat:         cm.isRepeatCustomer || false,
      } : {},
      trustProfileSnapshot: tp ? {
        completionRate:  tp.completionRate  || 0,
        complaintRate:   tp.complaintRate   || 0,
        refundRate:      tp.refundRate      || 0,
        averageRating:   tp.averageRating   || 0,
        adminWarnings:   tp.adminWarnings?.count || 0,
      } : {},
      complaintSnapshot: { hadComplaint: false },
      timelineSummary: {
        milestones,
        totalDurationMs: createdAt ? closedAt.getTime() - createdAt.getTime() : null,
      },
      targetLabel: null,
    });
  } catch (err) {
    if (err.code !== 11000) {
      console.error('[FeatureService] generateFeatureRecord failed:', err.message);
    }
  }
}

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

async function _incrementCategory(entityType, entityId, category) {
  const query = entityId
    ? { entityType, entityId }
    : { entityType: 'global', entityId: null };

  const doc = await ComplaintMetrics.findOne(query);
  if (!doc) return;

  const existing = doc.complaintCategories.find(c => c.category === category);
  if (existing) {
    await ComplaintMetrics.updateOne(
      { ...query, 'complaintCategories.category': category },
      { $inc: { 'complaintCategories.$.count': 1 } }
    );
  } else {
    await ComplaintMetrics.updateOne(query, {
      $push: { complaintCategories: { category, count: 1 } },
    });
  }
}
