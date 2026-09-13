/**
 * server/ai/explainabilityService.js — Prediction Explainability Engine
 *
 * Provides transparent reasoning for every AI prediction.
 * Output schema:
 *   - topContributingFeatures: [{ feature, weight, impact }]
 *   - missingFeatures: [string]
 *   - dataQualityScore: number [0.0 - 1.0]
 *   - modelVersion: string
 *   - predictionConfidence: object (from confidenceEngine)
 *   - reasonSummary: string
 */

import { FEATURE_LIMITS } from '../config/aiConfig.js';

/**
 * Generate standardized explainability payload.
 *
 * @param {object} params
 * @param {string} params.modelName
 * @param {string} params.modelVersion
 * @param {object} params.predictionOutput
 * @param {object} params.confidence
 * @param {object} params.featureVector
 * @param {string[]} [params.expectedFeatures=[]]
 * @returns {object} Explainability Breakdown
 */
export function generateExplanation({
  modelName,
  modelVersion,
  predictionOutput,
  confidence,
  featureVector,
  expectedFeatures = [],
}) {
  const missingFeatures = _detectMissingFeatures(featureVector, expectedFeatures);
  const dataQualityScore = _calculateDataQualityScore(featureVector, missingFeatures, expectedFeatures);
  const topContributingFeatures = _calculateFeatureContributions(modelName, featureVector, predictionOutput);
  const reasonSummary = _generateReasonSummary(modelName, predictionOutput, confidence, dataQualityScore);

  return {
    modelName,
    modelVersion,
    dataQualityScore,
    isDataQualitySufficient: dataQualityScore >= FEATURE_LIMITS.MIN_DATA_QUALITY_SCORE,
    predictionConfidence: confidence,
    topContributingFeatures,
    missingFeatures,
    reasonSummary,
    timestamp: new Date().toISOString(),
  };
}

function _detectMissingFeatures(fv, expected) {
  if (!expected || expected.length === 0) return [];
  const missing = [];
  expected.forEach((path) => {
    const parts = path.split('.');
    let curr = fv?.features;
    for (const p of parts) {
      if (curr && typeof curr === 'object' && p in curr) {
        curr = curr[p];
      } else {
        curr = undefined;
        break;
      }
    }
    if (curr === undefined || curr === null) {
      missing.push(path);
    }
  });
  return missing;
}

function _calculateDataQualityScore(fv, missing, expected) {
  if (!expected || expected.length === 0) return 0.85; // baseline for auto-discovery
  const total = expected.length;
  const present = total - missing.length;
  const ratio = present / total;
  return Math.round(ratio * 100) / 100;
}

function _calculateFeatureContributions(modelName, fv, prediction) {
  // Configured structural contribution patterns per model domain
  const feats = fv?.features || {};
  const contributions = [];

  if (feats.worker?.completionRate !== undefined) {
    contributions.push({
      feature: 'worker.completionRate',
      weight: 0.35,
      impact: feats.worker.completionRate > 0.8 ? 'positive' : 'negative',
      value: feats.worker.completionRate,
    });
  }

  if (feats.trust?.averageRating !== undefined) {
    contributions.push({
      feature: 'trust.averageRating',
      weight: 0.25,
      impact: feats.trust.averageRating >= 4.0 ? 'positive' : 'negative',
      value: feats.trust.averageRating,
    });
  }

  if (feats.geo?.distanceKm !== undefined && feats.geo?.distanceKm !== null) {
    contributions.push({
      feature: 'geo.distanceKm',
      weight: 0.20,
      impact: feats.geo.distanceKm <= 10 ? 'positive' : 'negative',
      value: `${feats.geo.distanceKm} km`,
    });
  }

  if (feats.customer?.totalBookings !== undefined) {
    contributions.push({
      feature: 'customer.totalBookings',
      weight: 0.10,
      impact: feats.customer.totalBookings > 3 ? 'positive' : 'neutral',
      value: feats.customer.totalBookings,
    });
  }

  if (feats.complaint?.totalComplaints !== undefined) {
    contributions.push({
      feature: 'complaint.totalComplaints',
      weight: 0.10,
      impact: feats.complaint.totalComplaints === 0 ? 'positive' : 'negative',
      value: feats.complaint.totalComplaints,
    });
  }

  return contributions.sort((a, b) => b.weight - a.weight);
}

function _generateReasonSummary(modelName, prediction, confidence, qualityScore) {
  const resultStr = prediction?.label || prediction?.recommendation || prediction?.predictedValue || 'evaluated';
  return `Model [${modelName}] predicted "${resultStr}" with ${confidence?.level || 'Medium'} confidence (Score: ${confidence?.score || 0.5}). Feature quality score is ${Math.round(qualityScore * 100)}%.`;
}
