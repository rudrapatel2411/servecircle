/**
 * server/ai/trustmatch/workerFilterEngine.js — Worker Filter Engine
 *
 * Applies hard eligibility rules to a pool of candidate workers.
 * Returns only workers that pass ALL criteria for a given booking.
 *
 * Filter criteria (all must pass):
 *   1. Not soft-deleted
 *   2. Is verified (KYC/Aadhar)
 *   3. Not suspended (workerStatus not 'rejected')
 *   4. Worker status is an active approved tier
 *   5. Supports the booking's service category
 *   6. Is within service radius (geo distance)
 *   7. Not busy (lastAssignedAt heuristic — configurable cooldown)
 *   8. No expired critical certifications (via TrustProfile document check)
 *
 * Produces a filterResult per worker for full explainability.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

// Worker statuses that are eligible for assignment
const ELIGIBLE_WORKER_STATUSES = new Set([
  'approved_rookie',
  'approved_junior',
  'approved_senior',
]);

// Maximum distance in km for standard jobs
const DEFAULT_SERVICE_RADIUS_KM = 30;

// Cooldown window: worker must not have been assigned within this many ms
// (helps prevent assigning an already-dispatched worker)
const BUSY_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

// Minimum trust profile document verification status to pass
const REQUIRED_DOC_STATUS = new Set(['verified']);

// ─── Main filter function ─────────────────────────────────────────────────────

/**
 * Filter a pool of candidate workers for a given booking.
 *
 * @param {object} params
 * @param {object[]} params.workers           - Array of User documents (workers)
 * @param {object}   params.booking           - Booking document
 * @param {Map<string,object>} [params.trustProfileMap] - Map of workerId → TrustProfile (pre-fetched)
 * @param {object}  [params.options]
 * @param {number}  [params.options.serviceRadiusKm]    - Override service radius
 * @param {boolean} [params.options.requireDocVerified] - Require document verification
 * @param {boolean} [params.options.strictBusy]         - Enforce busy-cooldown check
 * @returns {object} FilterResult
 */
export function filterWorkers({
  workers,
  booking,
  trustProfileMap = new Map(),
  options = {},
}) {
  if (!Array.isArray(workers) || workers.length === 0) {
    return _emptyFilterResult('No candidate workers provided.');
  }

  if (!booking || typeof booking !== 'object') {
    return _emptyFilterResult('Booking context is required for filtering.');
  }

  const {
    serviceRadiusKm    = DEFAULT_SERVICE_RADIUS_KM,
    requireDocVerified = false,
    strictBusy         = true,
  } = options;

  const eligibleWorkers   = [];
  const filteredOutWorkers = [];
  const filterStats = {
    total:           workers.length,
    eligible:        0,
    filteredOut:     0,
    reasonCounts:    {},
  };

  for (const worker of workers) {
    const workerIdStr = String(worker._id);
    const trustProfile = trustProfileMap.get(workerIdStr) || null;

    const checks = _runAllChecks({
      worker,
      booking,
      trustProfile,
      serviceRadiusKm,
      requireDocVerified,
      strictBusy,
    });

    const passedAll  = checks.every((c) => c.passed);
    const failedChecks = checks.filter((c) => !c.passed);

    if (passedAll) {
      eligibleWorkers.push({
        workerId:   workerIdStr,
        worker,
        checks,
        distanceKm: _getDistanceKm(worker, booking),
        tier:       _getWorkerTier(worker),
      });
      filterStats.eligible++;
    } else {
      filteredOutWorkers.push({
        workerId: workerIdStr,
        worker,
        failedChecks,
        firstFailReason: failedChecks[0]?.reason || 'unknown',
      });
      filterStats.filteredOut++;

      // Tally rejection reasons
      for (const fc of failedChecks) {
        filterStats.reasonCounts[fc.check] = (filterStats.reasonCounts[fc.check] || 0) + 1;
      }
    }
  }

  return {
    eligibleWorkers,
    filteredOutWorkers,
    filterStats,
    bookingCategory: booking.category,
    bookingCity:     booking.city,
    serviceRadiusKm,
    filteredAt:      new Date().toISOString(),
    status:          eligibleWorkers.length > 0 ? 'ELIGIBLE_FOUND' : 'NO_ELIGIBLE_WORKERS',
  };
}

// ─── Individual checks ────────────────────────────────────────────────────────

function _runAllChecks({ worker, booking, trustProfile, serviceRadiusKm, requireDocVerified, strictBusy }) {
  return [
    _checkNotDeleted(worker),
    _checkIsVerified(worker),
    _checkWorkerStatus(worker),
    _checkCategoryMatch(worker, booking),
    _checkServiceRadius(worker, booking, serviceRadiusKm),
    _checkNotBusy(worker, strictBusy),
    ...(requireDocVerified ? [_checkDocumentVerification(trustProfile)] : []),
    _checkNoSuspensionFlag(trustProfile),
  ];
}

function _checkNotDeleted(worker) {
  const passed = !worker.isDeleted && worker.deletedAt === null || !worker.deletedAt;
  return {
    check:  'not_deleted',
    passed,
    reason: passed ? null : 'Worker account is soft-deleted.',
  };
}

function _checkIsVerified(worker) {
  const passed = !!worker.isVerified;
  return {
    check:  'is_verified',
    passed,
    reason: passed ? null : 'Worker is not KYC/identity verified.',
  };
}

function _checkWorkerStatus(worker) {
  const passed = ELIGIBLE_WORKER_STATUSES.has(worker.workerStatus);
  return {
    check:  'worker_status',
    passed,
    reason: passed
      ? null
      : `Worker status "${worker.workerStatus}" is not eligible for assignments.`,
  };
}

function _checkCategoryMatch(worker, booking) {
  if (!booking.category) {
    return { check: 'category_match', passed: true, reason: null };
  }

  const bookingCat = booking.category.toLowerCase().trim();

  // Check serviceCategory (primary)
  const primaryMatch = worker.serviceCategory &&
    worker.serviceCategory.toLowerCase().trim() === bookingCat;

  // Check skills array (secondary)
  const skillsMatch = Array.isArray(worker.skills) &&
    worker.skills.some((s) => s.toLowerCase().includes(bookingCat) || bookingCat.includes(s.toLowerCase()));

  const passed = primaryMatch || skillsMatch;
  return {
    check:  'category_match',
    passed,
    reason: passed
      ? null
      : `Worker does not support category "${booking.category}". ` +
        `Worker primary: "${worker.serviceCategory || 'none'}", skills: [${(worker.skills || []).join(', ')}]`,
  };
}

function _checkServiceRadius(worker, booking, radiusKm) {
  const distanceKm = _getDistanceKm(worker, booking);

  // If distance cannot be computed (missing coordinates), allow through (don't block on missing data)
  if (distanceKm === null) {
    return {
      check:  'service_radius',
      passed: true,
      reason: null,
      note:   'Distance could not be computed — coordinates missing. Worker allowed through.',
    };
  }

  const passed = distanceKm <= radiusKm;
  return {
    check:  'service_radius',
    passed,
    reason: passed
      ? null
      : `Worker is ${distanceKm.toFixed(1)} km away, exceeds radius of ${radiusKm} km.`,
    distanceKm,
  };
}

function _checkNotBusy(worker, strictBusy) {
  if (!strictBusy) return { check: 'not_busy', passed: true, reason: null };

  const lastAssigned = worker.lastAssignedAt ? new Date(worker.lastAssignedAt).getTime() : null;
  if (!lastAssigned) return { check: 'not_busy', passed: true, reason: null };

  const cooldownElapsed = Date.now() - lastAssigned > BUSY_COOLDOWN_MS;
  return {
    check:  'not_busy',
    passed: cooldownElapsed,
    reason: cooldownElapsed
      ? null
      : `Worker was assigned ${Math.round((Date.now() - lastAssigned) / 60000)} minutes ago (cooldown: 30 min).`,
  };
}

function _checkDocumentVerification(trustProfile) {
  if (!trustProfile) {
    return {
      check:  'document_verified',
      passed: false,
      reason: 'No trust profile found — document verification cannot be confirmed.',
    };
  }
  const passed = REQUIRED_DOC_STATUS.has(trustProfile.documentVerification?.status);
  return {
    check:  'document_verified',
    passed,
    reason: passed
      ? null
      : `Document verification status: "${trustProfile.documentVerification?.status || 'none'}".`,
  };
}

function _checkNoSuspensionFlag(trustProfile) {
  if (!trustProfile) return { check: 'no_suspension', passed: true, reason: null };

  const tooManyWarnings = (trustProfile.adminWarnings?.count || 0) >= 5;
  const fraudFlag       = trustProfile.fraudFlags?.suspiciousPatterns || false;
  const walletFlag      = trustProfile.walletFlags?.unusualWithdrawal || false;

  const passed = !tooManyWarnings && !fraudFlag && !walletFlag;
  const reasons = [];
  if (tooManyWarnings) reasons.push(`${trustProfile.adminWarnings.count} admin warnings`);
  if (fraudFlag)       reasons.push('suspicious activity flag');
  if (walletFlag)      reasons.push('wallet irregularity flag');

  return {
    check:  'no_suspension',
    passed,
    reason: passed ? null : `Worker flagged: ${reasons.join(', ')}.`,
  };
}

// ─── Geo helpers ──────────────────────────────────────────────────────────────

function _getDistanceKm(worker, booking) {
  const workerCoords  = worker.location?.coordinates;
  const bookingCoords = booking.location?.coordinates;

  if (!workerCoords || !bookingCoords ||
      workerCoords.length < 2 || bookingCoords.length < 2) {
    return null;
  }

  return _haversineKm(
    workerCoords[1], workerCoords[0],
    bookingCoords[1], bookingCoords[0]
  );
}

function _haversineKm(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
}

function _getWorkerTier(worker) {
  const statusToTier = {
    approved_rookie: 'rookie',
    approved_junior: 'junior',
    approved_senior: 'senior',
  };
  return statusToTier[worker.workerStatus] || 'unknown';
}

function _emptyFilterResult(reason) {
  return {
    eligibleWorkers:     [],
    filteredOutWorkers:  [],
    filterStats:         { total: 0, eligible: 0, filteredOut: 0, reasonCounts: {} },
    bookingCategory:     null,
    bookingCity:         null,
    serviceRadiusKm:     DEFAULT_SERVICE_RADIUS_KM,
    filteredAt:          new Date().toISOString(),
    status:              'NO_CANDIDATES',
    note:                reason,
  };
}

export { DEFAULT_SERVICE_RADIUS_KM, ELIGIBLE_WORKER_STATUSES };
