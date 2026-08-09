/**
 * server/ai/trustmatch/recommendationEngine.js — Recommendation Engine
 *
 * Combines component scores + customer preference adjustments into:
 *   recommendationScore (0–100)
 *   recommendationLevel (Highly Recommended | Recommended | Acceptable | Not Recommended)
 *   topStrengths
 *   topWeaknesses
 *   missingData
 *   reasonSummary
 *
 * Deterministic. No ML. Fully explainable.
 * Weight configuration is explicit and can be tuned without code changes.
 */

// ─── Score weights ────────────────────────────────────────────────────────────
// Total weight = 100. Each component contributes a weighted portion.
// Weights are designed to be tunable — future ML will replace this table.

const SCORE_WEIGHTS = {
  // Core performance (total: 50)
  completionScore:     15,
  ratingScore:         15,
  complaintScore:      10,
  cancellationScore:   10,

  // Reliability & speed (total: 20)
  acceptanceScore:      8,
  responseTimeScore:    6,
  arrivalTimeScore:     6,

  // Proximity & experience (total: 20)
  distanceScore:       10,
  experienceScore:      5,
  skillHistoryScore:    5,

  // Trust & safety (total: 10)
  trustProfileScore:    4,
  adminPenaltyScore:    3,
  walletFlagScore:      2,
  repeatCustomerScore:  1,
};

// Sanity check: weights should sum to 100
const WEIGHT_SUM = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
if (WEIGHT_SUM !== 100) {
  console.warn(`[RecommendationEngine] Score weights sum to ${WEIGHT_SUM}, expected 100.`);
}

// ─── Recommendation level thresholds ─────────────────────────────────────────
export const RECOMMENDATION_LEVELS = {
  HIGHLY_RECOMMENDED: { label: 'Highly Recommended', minScore: 78, badge: '⭐ TOP PICK'  },
  RECOMMENDED:        { label: 'Recommended',         minScore: 58, badge: '✅ RECOMMENDED' },
  ACCEPTABLE:         { label: 'Acceptable',           minScore: 38, badge: '👍 ACCEPTABLE' },
  NOT_RECOMMENDED:    { label: 'Not Recommended',      minScore: 0,  badge: '⚠️ CAUTION'   },
};

// ─── Component metadata for explanation ──────────────────────────────────────
const COMPONENT_LABELS = {
  completionScore:     { name: 'Completion Rate',      category: 'performance' },
  acceptanceScore:     { name: 'Acceptance Rate',      category: 'reliability' },
  cancellationScore:   { name: 'Low Cancellation',     category: 'reliability' },
  complaintScore:      { name: 'Low Complaints',       category: 'performance' },
  ratingScore:         { name: 'Customer Rating',      category: 'performance' },
  responseTimeScore:   { name: 'Response Speed',       category: 'reliability' },
  arrivalTimeScore:    { name: 'Arrival Punctuality',  category: 'reliability' },
  distanceScore:       { name: 'Proximity',            category: 'logistics'   },
  experienceScore:     { name: 'Experience Level',     category: 'experience'  },
  repeatCustomerScore: { name: 'Customer Loyalty',     category: 'experience'  },
  skillHistoryScore:   { name: 'Skill History',        category: 'experience'  },
  trustProfileScore:   { name: 'Trust Verification',  category: 'safety'      },
  adminPenaltyScore:   { name: 'Admin Record',         category: 'safety'      },
  walletFlagScore:     { name: 'Wallet Integrity',     category: 'safety'      },
};

// Score thresholds for strength/weakness classification
const STRENGTH_THRESHOLD  = 75;
const WEAKNESS_THRESHOLD  = 40;

// ─── Core recommendation function ────────────────────────────────────────────

/**
 * Generate a recommendation for a single scored worker.
 *
 * @param {object} params
 * @param {object} params.scoreCard          - WorkerScoreCard from workerScoringEngine
 * @param {object} [params.preferenceAdjustment] - From customerPreferenceEngine
 * @param {object} [params.booking]          - Booking context
 * @returns {object} WorkerRecommendation
 */
export function generateWorkerRecommendation({
  scoreCard,
  preferenceAdjustment = null,
  booking = null,
}) {
  if (!scoreCard || !scoreCard.componentScores) {
    return _errorRecommendation('Invalid scoreCard provided.');
  }

  const { componentScores, dataAvailability, workerId, workerName, workerTier } = scoreCard;

  // ── Step 1: Weighted base score ──
  let weightedSum  = 0;
  let appliedWeight = 0;

  const scoreContributions = {};

  for (const [component, weight] of Object.entries(SCORE_WEIGHTS)) {
    const scoreObj = componentScores[component];
    if (!scoreObj) continue;

    const rawScore = typeof scoreObj === 'object' ? scoreObj.score : scoreObj;
    const contribution = (rawScore * weight) / 100;
    weightedSum  += contribution;
    appliedWeight += weight;
    scoreContributions[component] = {
      rawScore,
      weight,
      contribution: Math.round(contribution * 10) / 10,
    };
  }

  // Normalize if not all components were available
  const baseScore = appliedWeight > 0
    ? (weightedSum / appliedWeight) * 100
    : 50;

  // ── Step 2: Apply customer preference adjustment ──
  const prefAdjustment = preferenceAdjustment?.totalAdjustment || 0;
  const finalScore     = Math.max(0, Math.min(100, Math.round(baseScore + prefAdjustment)));

  // ── Step 3: Determine recommendation level ──
  const level = _determineLevel(finalScore);

  // ── Step 4: Identify strengths and weaknesses ──
  const { topStrengths, topWeaknesses } = _identifyStrengthsWeaknesses(componentScores);

  // ── Step 5: Missing data assessment ──
  const missingData = _identifyMissingData(dataAvailability, componentScores);

  // ── Step 6: Confidence calculation ──
  const confidence = _calculateConfidence(dataAvailability, componentScores, missingData);

  // ── Step 7: Human-readable reason summary ──
  const reasonSummary = _buildReasonSummary({
    level,
    finalScore,
    topStrengths,
    topWeaknesses,
    workerTier,
    preferenceAdjustment,
  });

  return {
    workerId,
    workerName,
    workerTier,
    recommendationScore:  finalScore,
    baseScore:            Math.round(baseScore),
    preferenceAdjustment: prefAdjustment,
    recommendationLevel:  level.label,
    recommendationBadge:  level.badge,
    topStrengths,
    topWeaknesses,
    missingData,
    confidence,
    reasonSummary,
    scoreContributions,
    weights:              SCORE_WEIGHTS,
    generatedAt:          new Date().toISOString(),
  };
}

/**
 * Rank multiple worker recommendations by recommendationScore (descending).
 *
 * @param {object[]} recommendations - Array of WorkerRecommendation objects
 * @returns {object[]} Sorted & ranked recommendations
 */
export function rankRecommendations(recommendations) {
  if (!Array.isArray(recommendations)) return [];

  return recommendations
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .map((rec, index) => ({
      ...rec,
      rank:       index + 1,
      rankLabel:  index === 0 ? 'Best Match' : index === 1 ? '2nd Best' : index === 2 ? '3rd Best' : `#${index + 1}`,
    }));
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _determineLevel(score) {
  if (score >= RECOMMENDATION_LEVELS.HIGHLY_RECOMMENDED.minScore) return RECOMMENDATION_LEVELS.HIGHLY_RECOMMENDED;
  if (score >= RECOMMENDATION_LEVELS.RECOMMENDED.minScore)        return RECOMMENDATION_LEVELS.RECOMMENDED;
  if (score >= RECOMMENDATION_LEVELS.ACCEPTABLE.minScore)         return RECOMMENDATION_LEVELS.ACCEPTABLE;
  return RECOMMENDATION_LEVELS.NOT_RECOMMENDED;
}

function _identifyStrengthsWeaknesses(componentScores) {
  const strengths  = [];
  const weaknesses = [];

  for (const [component, scoreObj] of Object.entries(componentScores)) {
    const score  = typeof scoreObj === 'object' ? scoreObj.score : scoreObj;
    const label  = COMPONENT_LABELS[component];
    if (!label) continue;

    if (score >= STRENGTH_THRESHOLD) {
      strengths.push({
        component,
        name:  label.name,
        score,
        category: label.category,
        label: typeof scoreObj === 'object' ? scoreObj.label : null,
      });
    } else if (score < WEAKNESS_THRESHOLD && score !== null) {
      weaknesses.push({
        component,
        name:  label.name,
        score,
        category: label.category,
        label: typeof scoreObj === 'object' ? scoreObj.label : null,
      });
    }
  }

  // Sort strengths desc, weaknesses asc
  strengths.sort((a, b)  => b.score - a.score);
  weaknesses.sort((a, b) => a.score - b.score);

  return {
    topStrengths:  strengths.slice(0, 4),
    topWeaknesses: weaknesses.slice(0, 4),
  };
}

function _identifyMissingData(dataAvailability, componentScores) {
  const missing = [];

  if (!dataAvailability.hasMetrics)       missing.push({ field: 'workerMetrics',  impact: 'HIGH',   note: 'Performance metrics unavailable — scoring uses defaults.' });
  if (!dataAvailability.hasTrustProfile)  missing.push({ field: 'trustProfile',   impact: 'MEDIUM', note: 'Trust verification signals unavailable.' });
  if (!dataAvailability.hasSkillHistory)  missing.push({ field: 'skillHistory',   impact: 'MEDIUM', note: 'No skill-specific history for this category.' });
  if (!dataAvailability.hasDistance)      missing.push({ field: 'distanceKm',     impact: 'LOW',    note: 'Worker GPS location not available — proximity not scored.' });
  if (!dataAvailability.hasRatingBreakdown) missing.push({ field: 'ratingBreakdown', impact: 'LOW', note: 'Detailed rating breakdown unavailable.' });

  // Check for no-data component scores
  for (const [component, scoreObj] of Object.entries(componentScores)) {
    if (typeof scoreObj === 'object' && scoreObj.signal === 'no_data') {
      if (!missing.find((m) => m.field === component)) {
        missing.push({ field: component, impact: 'LOW', note: `${COMPONENT_LABELS[component]?.name || component} data not available.` });
      }
    }
  }

  return missing;
}

function _calculateConfidence(dataAvailability, componentScores, missingData) {
  const highImpactMissing  = missingData.filter((m) => m.impact === 'HIGH').length;
  const medImpactMissing   = missingData.filter((m) => m.impact === 'MEDIUM').length;
  const noDataComponents   = Object.values(componentScores).filter((s) => typeof s === 'object' && s.signal === 'no_data').length;

  let score = 1.0;
  score -= highImpactMissing  * 0.20;
  score -= medImpactMissing   * 0.08;
  score -= noDataComponents   * 0.03;

  const normalized = Math.max(0.2, Math.min(1.0, score));
  const level = normalized >= 0.8 ? 'HIGH' : normalized >= 0.5 ? 'MEDIUM' : 'LOW';

  return {
    score: Math.round(normalized * 100) / 100,
    level,
    highImpactMissingCount: highImpactMissing,
    dataAvailability,
  };
}

function _buildReasonSummary({ level, finalScore, topStrengths, topWeaknesses, workerTier, preferenceAdjustment }) {
  const parts = [`Score: ${finalScore}/100 (${level.label}).`];

  if (topStrengths.length > 0) {
    const strengthNames = topStrengths.slice(0, 3).map((s) => s.name).join(', ');
    parts.push(`Key strengths: ${strengthNames}.`);
  }

  if (topWeaknesses.length > 0) {
    const weaknessNames = topWeaknesses.slice(0, 2).map((w) => w.name).join(', ');
    parts.push(`Areas of concern: ${weaknessNames}.`);
  }

  if (workerTier) {
    parts.push(`Worker tier: ${workerTier}.`);
  }

  if (preferenceAdjustment?.totalAdjustment > 0) {
    parts.push(`Customer preference boost applied (+${preferenceAdjustment.totalAdjustment} pts).`);
  }

  return parts.join(' ');
}

function _errorRecommendation(message) {
  return {
    workerId:             null,
    workerName:           null,
    workerTier:           null,
    recommendationScore:  0,
    baseScore:            0,
    preferenceAdjustment: 0,
    recommendationLevel:  RECOMMENDATION_LEVELS.NOT_RECOMMENDED.label,
    recommendationBadge:  RECOMMENDATION_LEVELS.NOT_RECOMMENDED.badge,
    topStrengths:         [],
    topWeaknesses:        [],
    missingData:          [{ field: 'scoreCard', impact: 'HIGH', note: message }],
    confidence:           { score: 0, level: 'LOW' },
    reasonSummary:        message,
    scoreContributions:   {},
    weights:              SCORE_WEIGHTS,
    generatedAt:          new Date().toISOString(),
    error:                message,
  };
}

export { SCORE_WEIGHTS };
