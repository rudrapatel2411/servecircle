/**
 * server/ai/trustmatch/customerPreferenceEngine.js — Customer Preference Engine
 *
 * Derives customer preference signals from historical behaviour.
 * If history exists, produces preference boosts/penalties for workers.
 * If no history exists, returns neutral preferences.
 *
 * Preferences evaluated:
 *   - Previously booked worker (repeat preference)
 *   - Preferred service categories
 *   - Preferred booking time slots
 *   - Preferred budget range
 *   - Preferred language (future-ready placeholder)
 *
 * Output: PreferenceProfile + per-worker preference adjustment scores.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

// Boost applied to previously preferred worker (additive, on final recommendation score)
const REPEAT_WORKER_BOOST        = 10;
const CATEGORY_MATCH_BOOST       = 5;
const TIME_SLOT_MATCH_BOOST      = 3;
const BUDGET_IN_RANGE_BOOST      = 4;
const BUDGET_OUT_OF_RANGE_PENALTY = -5;

// Minimum bookings before preferences are considered meaningful
const MIN_BOOKINGS_FOR_PREFERENCE = 3;

// ─── Preference Profile Builder ───────────────────────────────────────────────

/**
 * Build a customer preference profile from historical data.
 *
 * @param {object} params
 * @param {object}  [params.customerMetrics]  - CustomerMetrics document
 * @param {object}  [params.customerBehaviour]- CustomerBehaviour document
 * @param {object}  [params.booking]          - Current booking context
 * @returns {object} CustomerPreferenceProfile
 */
export function buildPreferenceProfile({
  customerMetrics   = null,
  customerBehaviour = null,
  booking           = null,
}) {
  const hasHistory = _hasSignificantHistory(customerMetrics);

  if (!hasHistory) {
    return {
      hasHistory:       false,
      isNeutral:        true,
      preferredWorkerIds: [],
      preferredCategories: [],
      preferredTimeSlot: null,
      budgetRange:       null,
      preferredLanguage: null,
      repeatWorkerBoost: REPEAT_WORKER_BOOST,
      note:             'Insufficient booking history — preferences are neutral.',
      builtAt:          new Date().toISOString(),
    };
  }

  // ── Extract preferred workers ──
  const preferredWorkerIds = _extractPreferredWorkers(customerMetrics, customerBehaviour);

  // ── Extract preferred categories ──
  const preferredCategories = _extractPreferredCategories(customerMetrics, customerBehaviour);

  // ── Extract preferred time slot ──
  const preferredTimeSlot = _extractPreferredTimeSlot(customerBehaviour);

  // ── Extract budget range ──
  const budgetRange = _extractBudgetRange(customerMetrics);

  // ── Check current booking time match ──
  const currentBookingTimeSlot = _classifyTimeSlot(booking?.scheduledDate);

  return {
    hasHistory:          true,
    isNeutral:           false,
    totalBookings:       customerMetrics.totalBookings,
    preferredWorkerIds,
    preferredCategories,
    preferredTimeSlot,
    currentBookingTimeSlot,
    timeSlotMatchBoost:  preferredTimeSlot === currentBookingTimeSlot ? TIME_SLOT_MATCH_BOOST : 0,
    budgetRange,
    preferredLanguage:   null, // placeholder — requires language tagging in booking history
    repeatWorkerBoost:   REPEAT_WORKER_BOOST,
    categoryMatchBoost:  CATEGORY_MATCH_BOOST,
    builtAt:             new Date().toISOString(),
  };
}

// ─── Per-worker preference adjustment ────────────────────────────────────────

/**
 * Compute a preference adjustment score for a specific worker.
 *
 * @param {object} params
 * @param {string} params.workerId          - Worker's ID string
 * @param {object} params.preferenceProfile - From buildPreferenceProfile()
 * @param {object} [params.booking]         - Current booking document
 * @param {object} [params.worker]          - Worker User document
 * @returns {object} PreferenceAdjustment
 */
export function computeWorkerPreferenceAdjustment({
  workerId,
  preferenceProfile,
  booking = null,
  worker  = null,
}) {
  if (!preferenceProfile || preferenceProfile.isNeutral) {
    return {
      workerId,
      totalAdjustment: 0,
      adjustments:     [],
      isNeutral:       true,
      reason:          'No customer preference history available.',
    };
  }

  const adjustments = [];
  let totalAdjustment = 0;

  // ── Check repeat worker preference ──
  const isPreferredWorker = preferenceProfile.preferredWorkerIds.some(
    (id) => String(id) === String(workerId)
  );
  if (isPreferredWorker) {
    adjustments.push({
      type:        'repeat_worker',
      value:       REPEAT_WORKER_BOOST,
      description: 'Customer has previously booked this worker.',
    });
    totalAdjustment += REPEAT_WORKER_BOOST;
  }

  // ── Category match ──
  if (booking?.category) {
    const categoryPreferred = preferenceProfile.preferredCategories.some(
      (c) => c.category?.toLowerCase() === booking.category.toLowerCase()
    );
    if (categoryPreferred) {
      adjustments.push({
        type:        'category_preference',
        value:       CATEGORY_MATCH_BOOST,
        description: `Customer frequently books "${booking.category}" services.`,
      });
      totalAdjustment += CATEGORY_MATCH_BOOST;
    }
  }

  // ── Budget compatibility ──
  if (preferenceProfile.budgetRange && booking?.amount) {
    const { min, max } = preferenceProfile.budgetRange;
    const inRange = booking.amount >= min * 0.7 && booking.amount <= max * 1.3; // 30% tolerance
    if (inRange) {
      adjustments.push({
        type:        'budget_match',
        value:       BUDGET_IN_RANGE_BOOST,
        description: `Booking amount ₹${booking.amount} aligns with customer's typical budget (₹${min}–₹${max}).`,
      });
      totalAdjustment += BUDGET_IN_RANGE_BOOST;
    } else if (booking.amount > max * 2) {
      adjustments.push({
        type:        'budget_mismatch',
        value:       BUDGET_OUT_OF_RANGE_PENALTY,
        description: `Booking amount ₹${booking.amount} significantly exceeds customer's typical budget.`,
      });
      totalAdjustment += BUDGET_OUT_OF_RANGE_PENALTY;
    }
  }

  // ── Time slot match ──
  if (preferenceProfile.timeSlotMatchBoost > 0) {
    adjustments.push({
      type:        'time_slot_preference',
      value:       preferenceProfile.timeSlotMatchBoost,
      description: `Booking time matches customer's preferred time slot (${preferenceProfile.preferredTimeSlot}).`,
    });
    totalAdjustment += preferenceProfile.timeSlotMatchBoost;
  }

  return {
    workerId,
    totalAdjustment: Math.round(totalAdjustment),
    adjustments,
    isNeutral:       adjustments.length === 0,
    reason:          adjustments.length === 0
      ? 'No applicable preference signals for this worker.'
      : `${adjustments.length} preference signal(s) applied.`,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _hasSignificantHistory(customerMetrics) {
  if (!customerMetrics) return false;
  return (customerMetrics.totalBookings || 0) >= MIN_BOOKINGS_FOR_PREFERENCE;
}

function _extractPreferredWorkers(customerMetrics, customerBehaviour) {
  const fromMetrics = (customerMetrics?.preferredWorkers || [])
    .filter((pw) => pw.bookingsCount >= 2)
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5)
    .map((pw) => pw.workerId);

  const fromBehaviour = (customerBehaviour?.preferredWorkers || [])
    .filter((pw) => pw.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((pw) => pw.workerId);

  // Merge and deduplicate
  const merged = [...fromMetrics, ...fromBehaviour];
  const seen   = new Set();
  return merged.filter((id) => {
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function _extractPreferredCategories(customerMetrics, customerBehaviour) {
  const fromMetrics = (customerMetrics?.favoriteCategories || [])
    .filter((c) => c.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const fromBehaviour = (customerBehaviour?.preferredCategories || [])
    .filter((c) => c.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Merge by category name
  const categoryMap = new Map();
  for (const c of [...fromMetrics, ...fromBehaviour]) {
    const key = c.category?.toLowerCase();
    if (!key) continue;
    const existing = categoryMap.get(key);
    if (!existing || c.count > existing.count) {
      categoryMap.set(key, c);
    }
  }
  return [...categoryMap.values()];
}

function _extractPreferredTimeSlot(customerBehaviour) {
  if (!customerBehaviour?.preferredTime) return null;

  const slots = customerBehaviour.preferredTime;
  const sorted = Object.entries(slots).sort(([, a], [, b]) => b - a);
  if (sorted.length === 0 || sorted[0][1] === 0) return null;
  return sorted[0][0]; // 'morning' | 'afternoon' | 'evening' | 'night'
}

function _extractBudgetRange(customerMetrics) {
  if (!customerMetrics) return null;
  const avg = customerMetrics.avgSpendPerJob || 0;
  const min = customerMetrics.lowestSpend   || 0;
  const max = customerMetrics.highestSpend  || 0;
  if (avg === 0) return null;
  return { min, max, avg };
}

function _classifyTimeSlot(scheduledDate) {
  if (!scheduledDate) return null;
  const hour = new Date(scheduledDate).getHours();
  if (hour >= 6  && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}
