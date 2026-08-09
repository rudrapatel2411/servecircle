/**
 * server/ai/trustmatch/workerScoringEngine.js — Worker Scoring Engine
 *
 * Produces deterministic, explainable component scores (0–100) for each
 * eligible worker based on available data signals.
 *
 * Component Scores (each 0–100):
 *   completionScore      — based on completion rate
 *   acceptanceScore      — based on acceptance rate
 *   cancellationScore    — based on cancellation rate (inverted)
 *   complaintScore       — based on complaint rate (inverted)
 *   ratingScore          — based on average rating + breakdown
 *   responseTimeScore    — based on avg response time
 *   arrivalTimeScore     — based on avg arrival time
 *   distanceScore        — based on km distance from booking
 *   experienceScore      — based on completed jobs + account age
 *   repeatCustomerScore  — based on repeat customer rate
 *   skillHistoryScore    — based on skill-specific job count + rating
 *   trustProfileScore    — based on verification + profile completeness
 *   adminPenaltyScore    — inverted penalty from warnings + fraud flags
 *   walletFlagScore      — inverted penalty from wallet signals
 *
 * NO final aggregated trust score here — that is in recommendationEngine.
 * Everything transparent, deterministic, and explainable.
 */

// ─── Scoring constants ────────────────────────────────────────────────────────

// Target benchmarks for full scores
const BENCH = {
  completionRate:    { ideal: 0.95,  poor: 0.50 },
  acceptanceRate:    { ideal: 0.90,  poor: 0.40 },
  cancellationRate:  { ideal: 0.02,  bad:  0.20 },   // lower is better
  complaintRate:     { ideal: 0.01,  bad:  0.10 },   // lower is better
  rating:            { ideal: 5.0,   poor: 3.0  },
  responseTimeMs:    { ideal: 180_000, bad: 1_800_000 }, // 3 min ideal, 30 min bad
  arrivalTimeMs:     { ideal: 900_000, bad: 5_400_000 }, // 15 min ideal, 90 min bad
  distanceKm:        { ideal: 3,  acceptable: 10, bad: 25 },
  completedJobs:     { rookie: 15, junior: 50, senior: 200 },
  accountAgeDays:    { min: 30, ideal: 365 },
  repeatCustomerRate:{ ideal: 0.30, poor: 0.05 },
  skillJobCount:     { ideal: 50, poor: 5 },
  profileCompleteness: { ideal: 90, poor: 50 },
};

// ─── Main scoring function ────────────────────────────────────────────────────

/**
 * Score a single eligible worker for a specific booking.
 *
 * @param {object} params
 * @param {object} params.worker          - User document
 * @param {object} [params.metrics]       - WorkerMetrics document
 * @param {object} [params.trustProfile]  - TrustProfile document
 * @param {object} [params.skillHistory]  - WorkerSkillHistory for this category
 * @param {number} [params.distanceKm]    - Pre-computed geo distance
 * @param {object} [params.booking]       - Booking document (for category context)
 * @returns {object} WorkerScoreCard
 */
export function scoreWorker({
  worker,
  metrics       = null,
  trustProfile  = null,
  skillHistory  = null,
  distanceKm    = null,
  booking       = null,
}) {
  const workerIdStr = String(worker._id);

  // ── Compute all component scores ──
  const completionScore     = _scoreCompletion(metrics, trustProfile);
  const acceptanceScore     = _scoreAcceptance(metrics, trustProfile);
  const cancellationScore   = _scoreCancellation(metrics, trustProfile);
  const complaintScore      = _scoreComplaint(metrics, trustProfile);
  const ratingScore         = _scoreRating(worker, metrics, trustProfile);
  const responseTimeScore   = _scoreResponseTime(metrics, trustProfile);
  const arrivalTimeScore    = _scoreArrivalTime(metrics, trustProfile);
  const distanceScore       = _scoreDistance(distanceKm);
  const experienceScore     = _scoreExperience(worker, metrics);
  const repeatCustomerScore = _scoreRepeatCustomers(metrics, trustProfile);
  const skillHistoryScore   = _scoreSkillHistory(skillHistory);
  const trustProfileScore   = _scoreTrustProfile(trustProfile);
  const adminPenaltyScore   = _scoreAdminPenalty(trustProfile);
  const walletFlagScore     = _scoreWalletFlags(trustProfile);

  const componentScores = {
    completionScore,
    acceptanceScore,
    cancellationScore,
    complaintScore,
    ratingScore,
    responseTimeScore,
    arrivalTimeScore,
    distanceScore,
    experienceScore,
    repeatCustomerScore,
    skillHistoryScore,
    trustProfileScore,
    adminPenaltyScore,
    walletFlagScore,
  };

  // Data availability tracking
  const dataAvailability = {
    hasMetrics:      !!metrics,
    hasTrustProfile: !!trustProfile,
    hasSkillHistory: !!skillHistory,
    hasDistance:     distanceKm !== null,
    hasRatingBreakdown: !!(metrics?.avgRatingQuality || trustProfile?.ratingBreakdown?.quality),
  };

  return {
    workerId:          workerIdStr,
    workerName:        worker.name || null,
    workerTier:        _getWorkerTier(worker),
    componentScores,
    dataAvailability,
    rawSignals:        _extractRawSignals(worker, metrics, trustProfile, skillHistory, distanceKm),
    scoredAt:          new Date().toISOString(),
  };
}

/**
 * Score multiple workers in parallel (synchronous — no I/O here).
 *
 * @param {object[]} scoringInputs - Array of { worker, metrics, trustProfile, skillHistory, distanceKm, booking }
 * @returns {object[]} Array of WorkerScoreCards
 */
export function scoreWorkers(scoringInputs) {
  if (!Array.isArray(scoringInputs)) return [];
  return scoringInputs.map((input) => scoreWorker(input));
}

// ─── Component scorers ────────────────────────────────────────────────────────

function _scoreCompletion(metrics, trustProfile) {
  const rate = metrics?.completionRate
    ?? trustProfile?.completionRate
    ?? null;

  if (rate === null) return { score: 50, confidence: 'LOW', signal: 'no_data', raw: null };

  const score = _linearScale(rate, BENCH.completionRate.poor, BENCH.completionRate.ideal, 0, 100);
  return {
    score,
    confidence: 'HIGH',
    signal:     rate >= BENCH.completionRate.ideal ? 'excellent' : rate >= 0.7 ? 'good' : 'poor',
    raw:        rate,
    label:      `${Math.round(rate * 100)}% completion rate`,
  };
}

function _scoreAcceptance(metrics, trustProfile) {
  const rate = metrics?.acceptanceRate
    ?? trustProfile?.acceptanceRate
    ?? null;

  if (rate === null) return { score: 50, confidence: 'LOW', signal: 'no_data', raw: null };

  const score = _linearScale(rate, BENCH.acceptanceRate.poor, BENCH.acceptanceRate.ideal, 0, 100);
  return {
    score,
    confidence: 'HIGH',
    signal:     rate >= BENCH.acceptanceRate.ideal ? 'excellent' : rate >= 0.65 ? 'good' : 'poor',
    raw:        rate,
    label:      `${Math.round(rate * 100)}% acceptance rate`,
  };
}

function _scoreCancellation(metrics, trustProfile) {
  const rate = trustProfile?.cancellationRate
    ?? (metrics
        ? metrics.totalCancellations / Math.max(1, metrics.totalAssignments)
        : null);

  if (rate === null) return { score: 70, confidence: 'LOW', signal: 'no_data', raw: null };

  // Inverted: lower cancellation → higher score
  const score = _linearScale(
    rate,
    BENCH.cancellationRate.bad,
    BENCH.cancellationRate.ideal,
    0, 100
  );
  return {
    score,
    confidence: 'HIGH',
    signal:     rate <= BENCH.cancellationRate.ideal ? 'excellent' : rate >= 0.1 ? 'poor' : 'acceptable',
    raw:        rate,
    label:      `${Math.round(rate * 100)}% cancellation rate`,
  };
}

function _scoreComplaint(metrics, trustProfile) {
  const rate = trustProfile?.complaintRate
    ?? (metrics
        ? metrics.totalComplaints / Math.max(1, metrics.totalCompletions)
        : null);

  if (rate === null) return { score: 70, confidence: 'LOW', signal: 'no_data', raw: null };

  // Inverted: lower complaint rate → higher score
  const score = _linearScale(
    rate,
    BENCH.complaintRate.bad,
    BENCH.complaintRate.ideal,
    0, 100
  );
  return {
    score,
    confidence: 'HIGH',
    signal:     rate <= BENCH.complaintRate.ideal ? 'excellent' : rate >= 0.05 ? 'poor' : 'acceptable',
    raw:        rate,
    label:      `${Math.round(rate * 100)}% complaint rate`,
  };
}

function _scoreRating(worker, metrics, trustProfile) {
  // Collect all available rating sources
  const sources = [
    worker.rating,
    metrics?.avgRatingOverall,
    trustProfile?.averageRating,
    trustProfile?.ratingBreakdown?.overall,
  ].filter((r) => typeof r === 'number' && r > 0);

  if (sources.length === 0) return { score: 50, confidence: 'LOW', signal: 'no_data', raw: null };

  // Weighted average (prefer metrics > trustProfile > user.rating)
  const avgRating = sources.reduce((a, b) => a + b, 0) / sources.length;

  // Rating breakdown bonus (up to +8 points if all sub-dimensions high)
  let breakdownBonus = 0;
  const breakdown = metrics || trustProfile?.ratingBreakdown;
  if (breakdown) {
    const dims = [
      breakdown.avgRatingQuality        ?? breakdown.ratingBreakdown?.quality,
      breakdown.avgRatingPunctuality     ?? breakdown.ratingBreakdown?.punctuality,
      breakdown.avgRatingCommunication   ?? breakdown.ratingBreakdown?.communication,
      breakdown.avgRatingProfessionalism ?? breakdown.ratingBreakdown?.professionalism,
    ].filter((d) => typeof d === 'number' && d > 0);
    if (dims.length > 0) {
      const avgDim = dims.reduce((a, b) => a + b, 0) / dims.length;
      breakdownBonus = Math.round((avgDim / 5) * 8);
    }
  }

  const baseScore = _linearScale(avgRating, BENCH.rating.poor, BENCH.rating.ideal, 0, 92);
  const score = Math.min(100, baseScore + breakdownBonus);

  return {
    score,
    confidence: sources.length >= 2 ? 'HIGH' : 'MEDIUM',
    signal:     avgRating >= 4.5 ? 'excellent' : avgRating >= 4.0 ? 'good' : avgRating >= 3.5 ? 'acceptable' : 'poor',
    raw:        Math.round(avgRating * 100) / 100,
    label:      `${avgRating.toFixed(1)}/5.0 average rating`,
    sourcesUsed: sources.length,
    breakdownBonus,
  };
}

function _scoreResponseTime(metrics, trustProfile) {
  const timeMs = metrics?.avgResponseTimeMs
    ?? trustProfile?.averageResponseTimeMs
    ?? null;

  if (!timeMs || timeMs === 0) return { score: 60, confidence: 'LOW', signal: 'no_data', raw: null };

  // Lower is better — invert scale
  const score = _linearScale(
    timeMs,
    BENCH.responseTimeMs.bad,
    BENCH.responseTimeMs.ideal,
    0, 100
  );
  return {
    score,
    confidence: 'MEDIUM',
    signal:     timeMs <= BENCH.responseTimeMs.ideal ? 'excellent' : timeMs <= 600_000 ? 'good' : 'slow',
    raw:        timeMs,
    label:      `${Math.round(timeMs / 60000)} min avg response time`,
  };
}

function _scoreArrivalTime(metrics, trustProfile) {
  const timeMs = metrics?.avgArrivalTimeMs
    ?? trustProfile?.averageArrivalTimeMs
    ?? null;

  if (!timeMs || timeMs === 0) return { score: 60, confidence: 'LOW', signal: 'no_data', raw: null };

  // Lower is better — invert scale
  const score = _linearScale(
    timeMs,
    BENCH.arrivalTimeMs.bad,
    BENCH.arrivalTimeMs.ideal,
    0, 100
  );
  return {
    score,
    confidence: 'MEDIUM',
    signal:     timeMs <= BENCH.arrivalTimeMs.ideal ? 'excellent' : timeMs <= 1_800_000 ? 'good' : 'slow',
    raw:        timeMs,
    label:      `${Math.round(timeMs / 60000)} min avg arrival time`,
  };
}

function _scoreDistance(distanceKm) {
  if (distanceKm === null) return { score: 60, confidence: 'LOW', signal: 'no_data', raw: null };

  let score;
  if (distanceKm <= BENCH.distanceKm.ideal)      score = 100;
  else if (distanceKm <= BENCH.distanceKm.acceptable) score = _linearScale(distanceKm, BENCH.distanceKm.ideal, BENCH.distanceKm.acceptable, 100, 70);
  else if (distanceKm <= BENCH.distanceKm.bad)   score = _linearScale(distanceKm, BENCH.distanceKm.acceptable, BENCH.distanceKm.bad, 70, 20);
  else                                            score = 10;

  return {
    score,
    confidence: 'HIGH',
    signal:     distanceKm <= 3 ? 'very_close' : distanceKm <= 10 ? 'nearby' : distanceKm <= 20 ? 'moderate' : 'far',
    raw:        distanceKm,
    label:      `${distanceKm.toFixed(1)} km from booking location`,
  };
}

function _scoreExperience(worker, metrics) {
  const completedJobs = worker.completedJobs
    ?? metrics?.totalCompletions
    ?? 0;

  let jobScore;
  if (completedJobs >= BENCH.completedJobs.senior)     jobScore = 100;
  else if (completedJobs >= BENCH.completedJobs.junior) jobScore = _linearScale(completedJobs, BENCH.completedJobs.junior, BENCH.completedJobs.senior, 60, 100);
  else if (completedJobs >= BENCH.completedJobs.rookie) jobScore = _linearScale(completedJobs, BENCH.completedJobs.rookie, BENCH.completedJobs.junior, 30, 60);
  else                                                  jobScore = _linearScale(completedJobs, 0, BENCH.completedJobs.rookie, 0, 30);

  // Tier bonus
  const tierBonus = { approved_senior: 10, approved_junior: 5, approved_rookie: 0 };
  const bonus = tierBonus[worker.workerStatus] || 0;

  return {
    score:      Math.min(100, Math.round(jobScore + bonus)),
    confidence: 'HIGH',
    signal:     completedJobs >= 200 ? 'expert' : completedJobs >= 50 ? 'experienced' : completedJobs >= 15 ? 'intermediate' : 'beginner',
    raw:        { completedJobs, workerStatus: worker.workerStatus },
    label:      `${completedJobs} completed jobs (${worker.workerStatus || 'unknown'})`,
  };
}

function _scoreRepeatCustomers(metrics, trustProfile) {
  const rate = trustProfile?.repeatCustomerRate
    ?? (metrics && metrics.uniqueCustomers > 0
        ? metrics.repeatCustomers / metrics.uniqueCustomers
        : null);

  if (rate === null) return { score: 50, confidence: 'LOW', signal: 'no_data', raw: null };

  const score = _linearScale(rate, BENCH.repeatCustomerRate.poor, BENCH.repeatCustomerRate.ideal, 20, 100);
  return {
    score,
    confidence: 'MEDIUM',
    signal:     rate >= 0.30 ? 'excellent' : rate >= 0.15 ? 'good' : 'developing',
    raw:        rate,
    label:      `${Math.round(rate * 100)}% repeat customer rate`,
  };
}

function _scoreSkillHistory(skillHistory) {
  if (!skillHistory) return { score: 50, confidence: 'LOW', signal: 'no_data', raw: null };

  const jobCount   = skillHistory.jobCount || 0;
  const avgRating  = skillHistory.averageRating || 0;

  const jobScore    = _linearScale(jobCount, BENCH.skillJobCount.poor, BENCH.skillJobCount.ideal, 0, 60);
  const ratingScore = avgRating > 0 ? _linearScale(avgRating, 3, 5, 0, 40) : 0;

  const score = Math.min(100, Math.round(jobScore + ratingScore));
  return {
    score,
    confidence: jobCount >= 5 ? 'HIGH' : 'MEDIUM',
    signal:     jobCount >= 50 ? 'specialist' : jobCount >= 10 ? 'experienced' : 'limited',
    raw:        { jobCount, avgRating },
    label:      `${jobCount} jobs in this skill category, avg rating ${avgRating.toFixed(1)}`,
  };
}

function _scoreTrustProfile(trustProfile) {
  if (!trustProfile) return { score: 40, confidence: 'LOW', signal: 'no_data', raw: null };

  let score = 0;

  // Identity verification (40 pts)
  if (trustProfile.identityVerification?.status === 'verified')  score += 20;
  if (trustProfile.documentVerification?.status === 'verified')  score += 10;
  if (trustProfile.skillVerification?.status   === 'verified')   score += 10;

  // Profile completeness (30 pts)
  const completeness = trustProfile.profileCompleteness || 0;
  score += _linearScale(completeness, BENCH.profileCompleteness.poor, BENCH.profileCompleteness.ideal, 0, 30);

  // Refund rate penalty (up to -15)
  const refundRate = trustProfile.refundRate || 0;
  if (refundRate > 0.05) score -= Math.min(15, Math.round(refundRate * 100));

  // Account age (up to 20 pts)
  const ageDays = trustProfile.accountAge || 0;
  score += Math.min(20, _linearScale(ageDays, BENCH.accountAgeDays.min, BENCH.accountAgeDays.ideal, 0, 20));

  return {
    score:      Math.max(0, Math.min(100, Math.round(score))),
    confidence: 'HIGH',
    signal:     score >= 80 ? 'high_trust' : score >= 50 ? 'moderate_trust' : 'low_trust',
    raw: {
      identityVerified:  trustProfile.identityVerification?.status === 'verified',
      documentVerified:  trustProfile.documentVerification?.status === 'verified',
      skillVerified:     trustProfile.skillVerification?.status === 'verified',
      profileCompleteness: trustProfile.profileCompleteness,
      refundRate:        trustProfile.refundRate,
    },
    label: `Trust profile: ${trustProfile.identityVerification?.status || 'none'} identity, ${completeness}% complete`,
  };
}

function _scoreAdminPenalty(trustProfile) {
  if (!trustProfile) return { score: 100, confidence: 'LOW', signal: 'no_data', raw: null };

  const warningCount = trustProfile.adminWarnings?.count || 0;
  const fraudFlags   = trustProfile.fraudFlags || {};

  let penalty = 0;
  if (warningCount >= 1) penalty += Math.min(40, warningCount * 10);
  if (fraudFlags.otpAbuse)            penalty += 20;
  if (fraudFlags.suspiciousPatterns)  penalty += 30;
  if (fraudFlags.reportedByCustomers > 0) penalty += Math.min(20, fraudFlags.reportedByCustomers * 5);

  return {
    score:      Math.max(0, 100 - penalty),
    confidence: 'HIGH',
    signal:     penalty === 0 ? 'clean' : penalty <= 20 ? 'minor_issues' : 'significant_issues',
    raw:        { warningCount, fraudFlags },
    label:      warningCount === 0 ? 'No admin warnings' : `${warningCount} admin warning(s)`,
  };
}

function _scoreWalletFlags(trustProfile) {
  if (!trustProfile) return { score: 100, confidence: 'LOW', signal: 'no_data', raw: null };

  const walletFlags = trustProfile.walletFlags || {};
  let penalty = 0;

  if (walletFlags.unusualWithdrawal) penalty += 25;
  if (walletFlags.suspiciousTopup)   penalty += 20;

  return {
    score:      Math.max(0, 100 - penalty),
    confidence: 'HIGH',
    signal:     penalty === 0 ? 'clean' : 'flagged',
    raw:        walletFlags,
    label:      penalty === 0 ? 'No wallet flags' : 'Wallet irregularities detected',
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Linear interpolation: maps value in [fromLow, fromHigh] to [toLow, toHigh].
 * Clamps to [toLow, toHigh].
 * NOTE: Works in BOTH directions (high-good AND high-bad/inverted).
 * If fromLow > fromHigh, it automatically inverts (e.g. for time scores).
 */
function _linearScale(value, fromLow, fromHigh, toLow, toHigh) {
  if (fromHigh === fromLow) return toLow;
  const ratio = (value - fromLow) / (fromHigh - fromLow);
  const result = toLow + ratio * (toHigh - toLow);
  const [minOut, maxOut] = toLow < toHigh ? [toLow, toHigh] : [toHigh, toLow];
  return Math.round(Math.max(minOut, Math.min(maxOut, result)));
}

function _getWorkerTier(worker) {
  const map = { approved_senior: 'senior', approved_junior: 'junior', approved_rookie: 'rookie' };
  return map[worker.workerStatus] || 'unknown';
}

function _extractRawSignals(worker, metrics, trustProfile, skillHistory, distanceKm) {
  return {
    completedJobs:        worker.completedJobs ?? metrics?.totalCompletions ?? 0,
    rating:               worker.rating ?? 0,
    workerStatus:         worker.workerStatus,
    isVerified:           worker.isVerified,
    isProBadge:           worker.isProBadge || false,
    metricsCompletionRate: metrics?.completionRate ?? null,
    metricsAcceptanceRate: metrics?.acceptanceRate ?? null,
    metricsAvgRating:      metrics?.avgRatingOverall ?? null,
    metricsAvgResponseMs:  metrics?.avgResponseTimeMs ?? null,
    metricsAvgArrivalMs:   metrics?.avgArrivalTimeMs ?? null,
    metricsRepeatCustomers:metrics?.repeatCustomers ?? null,
    trustCompletionRate:   trustProfile?.completionRate ?? null,
    trustComplaintRate:    trustProfile?.complaintRate ?? null,
    trustRefundRate:       trustProfile?.refundRate ?? null,
    trustAdminWarnings:    trustProfile?.adminWarnings?.count ?? 0,
    skillJobCount:         skillHistory?.jobCount ?? null,
    skillAvgRating:        skillHistory?.averageRating ?? null,
    distanceKm,
  };
}
