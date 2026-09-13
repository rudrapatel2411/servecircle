/**
 * server/ai/trustmatch/workerRankingEngine.js — Worker Ranking Engine
 *
 * Produces the final ranked list of workers with full explainability.
 * This is the last step before the response is assembled by trustMatchManager.
 *
 * Input:  Ranked recommendations + trust assessments + filter results
 * Output: RankedWorkerList with positions, tier groupings, and reason summaries
 *
 * Ranking is deterministic:
 *   Primary:   recommendationScore DESC
 *   Secondary: distanceScore DESC (prefer closer)
 *   Tertiary:  experienceScore DESC (prefer experienced)
 *   Quaternary: workerTier DESC (senior > junior > rookie)
 *
 * No randomness. No ML. Fully reproducible.
 */

// ─── Tier ordering for tie-breaking ──────────────────────────────────────────
const TIER_ORDER = { senior: 3, junior: 2, rookie: 1, unknown: 0 };

// ─── Main ranking function ────────────────────────────────────────────────────

/**
 * Produce the final ranked worker list.
 *
 * @param {object} params
 * @param {object[]} params.recommendations   - Array of WorkerRecommendation objects (from recommendationEngine)
 * @param {object[]} params.scoreCards        - Array of WorkerScoreCard objects (from workerScoringEngine)
 * @param {object[]} params.trustAssessments  - Array of TrustAssessment objects (from trustEngine)
 * @param {object}   params.filterResult      - FilterResult from workerFilterEngine
 * @param {object}   [params.booking]         - Booking context
 * @param {object}   [params.options]
 * @param {number}   [params.options.maxResults]       - Max workers to return (default 10)
 * @param {boolean}  [params.options.excludeFlagged]   - Exclude flagged workers (default true)
 * @param {string}   [params.options.minRecommendationLevel] - Min level to include
 * @returns {object} RankedWorkerList
 */
export function rankWorkers({
  recommendations,
  scoreCards,
  trustAssessments,
  filterResult,
  booking   = null,
  options   = {},
}) {
  const {
    maxResults             = 10,
    excludeFlagged         = true,
    minRecommendationLevel = null,
  } = options;

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return _emptyRankingResult('No worker recommendations provided to rank.');
  }

  // ── Build lookup maps ──
  const scoreCardMap     = _buildMap(scoreCards,       'workerId');
  const trustMap         = _buildMap(trustAssessments, 'workerId');

  // ── Merge data per worker ──
  let candidates = recommendations.map((rec) => {
    const scoreCard    = scoreCardMap.get(rec.workerId);
    const trustAssessment = trustMap.get(rec.workerId);

    return {
      ...rec,
      scoreCard,
      trustAssessment,
      distanceScore:   scoreCard?.componentScores?.distanceScore?.score   ?? 0,
      experienceScore: scoreCard?.componentScores?.experienceScore?.score ?? 0,
      distanceKm:      scoreCard?.rawSignals?.distanceKm ?? null,
      tierOrder:       TIER_ORDER[rec.workerTier] || 0,
    };
  });

  // ── Apply filters ──
  if (excludeFlagged) {
    candidates = candidates.filter((c) => !c.trustAssessment?.hasFlaggedDimension);
  }

  if (minRecommendationLevel) {
    const allowedLevels = _getAllowedLevels(minRecommendationLevel);
    candidates = candidates.filter((c) => allowedLevels.has(c.recommendationLevel));
  }

  // ── Sort: primary → recommendationScore DESC ──
  // Secondary → distanceScore DESC
  // Tertiary  → experienceScore DESC
  // Quaternary→ tierOrder DESC
  candidates.sort((a, b) => {
    if (b.recommendationScore !== a.recommendationScore) {
      return b.recommendationScore - a.recommendationScore;
    }
    if (b.distanceScore !== a.distanceScore) {
      return b.distanceScore - a.distanceScore;
    }
    if (b.experienceScore !== a.experienceScore) {
      return b.experienceScore - a.experienceScore;
    }
    return b.tierOrder - a.tierOrder;
  });

  // ── Apply maxResults cap ──
  const ranked = candidates.slice(0, maxResults);

  // ── Assign final rank positions ──
  const rankedWithPositions = ranked.map((candidate, index) => ({
    rank:          index + 1,
    rankLabel:     _getRankLabel(index),
    workerId:      candidate.workerId,
    workerName:    candidate.workerName,
    workerTier:    candidate.workerTier,
    distanceKm:    candidate.distanceKm,

    // Scores
    recommendationScore: candidate.recommendationScore,
    recommendationLevel: candidate.recommendationLevel,
    recommendationBadge: candidate.recommendationBadge,

    // Explainability
    topStrengths:      candidate.topStrengths,
    topWeaknesses:     candidate.topWeaknesses,
    missingData:       candidate.missingData,
    reasonSummary:     candidate.reasonSummary,
    confidence:        candidate.confidence,
    scoreContributions:candidate.scoreContributions,

    // Trust
    trustVerdict:     candidate.trustAssessment?.overallVerdict  || null,
    trustBadge:       candidate.trustAssessment?.overallBadge    || null,
    trustFlags:       candidate.trustAssessment?.trustFlags       || [],
    trustPositives:   candidate.trustAssessment?.trustPositives   || [],
    trustDimensions:  candidate.trustAssessment?.dimensions       || null,

    // Customer preference
    preferenceAdjustment: candidate.preferenceAdjustment,

    // Component scores (for detailed view)
    componentScores: candidate.scoreCard?.componentScores || null,
  }));

  // ── Group by recommendation level ──
  const groupedByLevel = _groupByLevel(rankedWithPositions);

  // ── Build ranking stats ──
  const rankingStats = _buildRankingStats(rankedWithPositions, candidates.length, recommendations.length);

  return {
    rankedWorkers:   rankedWithPositions,
    groupedByLevel,
    rankingStats,
    totalCandidates: recommendations.length,
    totalFiltered:   filterResult?.filterStats?.filteredOut || 0,
    totalRanked:     rankedWithPositions.length,
    totalExcluded:   candidates.length - rankedWithPositions.length,
    booking: {
      bookingId: booking?._id || booking?.bookingId || null,
      category:  booking?.category || null,
      city:      booking?.city || null,
    },
    options: { maxResults, excludeFlagged, minRecommendationLevel },
    rankedAt: new Date().toISOString(),
    status:   rankedWithPositions.length > 0 ? 'RANKED' : 'NO_ELIGIBLE_WORKERS',
  };
}

/**
 * Get the top N workers from a ranking result (convenience helper).
 *
 * @param {object} rankingResult - Output of rankWorkers()
 * @param {number} [n=3]
 * @returns {object[]}
 */
export function getTopWorkers(rankingResult, n = 3) {
  return (rankingResult.rankedWorkers || []).slice(0, n);
}

/**
 * Get ranking summary for a single worker.
 *
 * @param {object} rankingResult - Output of rankWorkers()
 * @param {string} workerId
 * @returns {object|null}
 */
export function getWorkerRankPosition(rankingResult, workerId) {
  return (rankingResult.rankedWorkers || []).find(
    (w) => String(w.workerId) === String(workerId)
  ) || null;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _buildMap(array, keyField) {
  const map = new Map();
  if (!Array.isArray(array)) return map;
  for (const item of array) {
    if (item && item[keyField]) {
      map.set(String(item[keyField]), item);
    }
  }
  return map;
}

function _getRankLabel(index) {
  if (index === 0) return '🥇 Best Match';
  if (index === 1) return '🥈 2nd Best';
  if (index === 2) return '🥉 3rd Best';
  return `#${index + 1}`;
}

function _getAllowedLevels(minLevel) {
  const hierarchy = ['Highly Recommended', 'Recommended', 'Acceptable', 'Not Recommended'];
  const minIdx    = hierarchy.indexOf(minLevel);
  if (minIdx === -1) return new Set(hierarchy);
  return new Set(hierarchy.slice(0, minIdx + 1));
}

function _groupByLevel(rankedWorkers) {
  const groups = {
    'Highly Recommended': [],
    'Recommended':        [],
    'Acceptable':         [],
    'Not Recommended':    [],
  };

  for (const worker of rankedWorkers) {
    const level = worker.recommendationLevel;
    if (groups[level]) {
      groups[level].push({ rank: worker.rank, workerId: worker.workerId, workerName: worker.workerName, recommendationScore: worker.recommendationScore });
    }
  }

  return groups;
}

function _buildRankingStats(ranked, totalCandidates, totalRecommendations) {
  const scores = ranked.map((r) => r.recommendationScore);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const highlyRecommended = ranked.filter((r) => r.recommendationLevel === 'Highly Recommended').length;
  const recommended       = ranked.filter((r) => r.recommendationLevel === 'Recommended').length;
  const acceptable        = ranked.filter((r) => r.recommendationLevel === 'Acceptable').length;
  const notRecommended    = ranked.filter((r) => r.recommendationLevel === 'Not Recommended').length;
  const flagged           = ranked.filter((r) => r.trustFlags?.length > 0).length;

  return {
    avgScore,
    highestScore:       scores.length > 0 ? Math.max(...scores) : 0,
    lowestScore:        scores.length > 0 ? Math.min(...scores) : 0,
    levelCounts: {
      highlyRecommended,
      recommended,
      acceptable,
      notRecommended,
    },
    flaggedCount:       flagged,
    totalBeforeFilters: totalRecommendations,
    totalAfterFilters:  totalCandidates,
    totalRanked:        ranked.length,
  };
}

function _emptyRankingResult(reason) {
  return {
    rankedWorkers:   [],
    groupedByLevel:  { 'Highly Recommended': [], 'Recommended': [], 'Acceptable': [], 'Not Recommended': [] },
    rankingStats:    { avgScore: 0, highestScore: 0, lowestScore: 0, levelCounts: {}, flaggedCount: 0, totalBeforeFilters: 0, totalAfterFilters: 0, totalRanked: 0 },
    totalCandidates: 0,
    totalFiltered:   0,
    totalRanked:     0,
    totalExcluded:   0,
    booking:         null,
    options:         {},
    rankedAt:        new Date().toISOString(),
    status:          'NO_CANDIDATES',
    note:            reason,
  };
}
