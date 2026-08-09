/**
 * server/ai/confidenceEngine.js — Confidence Scoring Engine
 *
 * Evaluates prediction confidence based on feature completeness,
 * historical data volume, and score certainty.
 *
 * Output Bands:
 *   - Very Low  (0.0 - 0.2)
 *   - Low       (0.2 - 0.4)
 *   - Medium    (0.4 - 0.7)
 *   - High      (0.7 - 0.9)
 *   - Very High (0.9 - 1.0)
 */

import { CONFIDENCE_LEVELS, CONFIDENCE_THRESHOLDS } from '../config/aiConfig.js';

/**
 * Calculate standardized confidence score and band label.
 *
 * @param {object} params
 * @param {number} params.rawScore - Base numeric output score [0.0 - 1.0]
 * @param {object} params.featureVector - Extracted feature vector
 * @param {string[]} [params.requiredFeatures=[]] - Required feature keys
 * @returns {object} Confidence Assessment
 */
export function calculateConfidence({ rawScore = 0.5, featureVector = {}, requiredFeatures = [] }) {
  let penalty = 0;
  const missingRequired = [];
  const presentCount = _countPresentFeatures(featureVector);

  // 1. Missing required features penalty
  requiredFeatures.forEach((key) => {
    if (!_hasFeatureKey(featureVector, key)) {
      missingRequired.push(key);
      penalty += 0.15;
    }
  });

  // 2. Data volume check (worker completed jobs / customer bookings)
  const workerJobs = featureVector?.features?.worker?.completedJobs || 0;
  const customerBookings = featureVector?.features?.customer?.totalBookings || 0;

  if (workerJobs < 3) penalty += 0.1;
  if (customerBookings < 2) penalty += 0.05;

  // 3. Raw score proximity penalty (boundary uncertainty)
  const scoreDistance = Math.abs(rawScore - 0.5); // closer to 0.5 = higher uncertainty
  const uncertaintyBonus = scoreDistance * 0.2;

  // Final adjusted confidence score
  const finalScore = Math.max(0.0, Math.min(1.0, rawScore - penalty + uncertaintyBonus));
  const roundedScore = Math.round(finalScore * 1000) / 1000;

  // Determine band label
  const band = _determineBand(roundedScore);

  return {
    score: roundedScore,
    level: band.label,
    isAcceptableConfidence: roundedScore >= CONFIDENCE_THRESHOLDS.MINIMUM_ACCEPTABLE_SCORE,
    isHighConfidence: roundedScore >= CONFIDENCE_THRESHOLDS.HIGH_CONFIDENCE_SCORE,
    factors: {
      rawScore,
      penalty: Math.round(penalty * 1000) / 1000,
      missingRequired,
      featureCount: presentCount,
    },
  };
}

function _determineBand(score) {
  if (score >= CONFIDENCE_LEVELS.VERY_HIGH.minScore) return CONFIDENCE_LEVELS.VERY_HIGH;
  if (score >= CONFIDENCE_LEVELS.HIGH.minScore)      return CONFIDENCE_LEVELS.HIGH;
  if (score >= CONFIDENCE_LEVELS.MEDIUM.minScore)    return CONFIDENCE_LEVELS.MEDIUM;
  if (score >= CONFIDENCE_LEVELS.LOW.minScore)       return CONFIDENCE_LEVELS.LOW;
  return CONFIDENCE_LEVELS.VERY_LOW;
}

function _countPresentFeatures(fv) {
  if (!fv || !fv.features) return 0;
  let count = 0;
  Object.values(fv.features).forEach((domain) => {
    if (domain && typeof domain === 'object') {
      Object.values(domain).forEach((val) => {
        if (val !== null && val !== undefined && val !== false && val !== 'none') {
          count++;
        }
      });
    }
  });
  return count;
}

function _hasFeatureKey(fv, path) {
  if (!fv || !fv.features) return false;
  const parts = path.split('.');
  let curr = fv.features;
  for (const p of parts) {
    if (curr && typeof curr === 'object' && p in curr) {
      curr = curr[p];
    } else {
      return false;
    }
  }
  return curr !== null && curr !== undefined;
}
