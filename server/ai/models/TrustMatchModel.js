import BasePredictionModel from './BasePredictionModel.js';
import { MODEL_NAMES, MODEL_VERSIONS } from '../../config/aiConfig.js';

export const modelMetadata = {
  modelName: MODEL_NAMES.TRUST_MATCH,
  version: MODEL_VERSIONS[MODEL_NAMES.TRUST_MATCH],
  status: 'active',
  description: 'Ranks workers for customer bookings based on skill, distance, and trust signals.',
  inputFeatures: [
    'worker.completionRate',
    'trust.averageRating',
    'worker.rating',
    'worker.completedJobs',
  ],
  outputSchema: {
    matchScore: 'number (0-100)',
    recommendation: 'string (Strong Match|Potential Match|Poor Match)',
    confidence: 'number (0-1)',
  },
};

class TrustMatchModel extends BasePredictionModel {
  constructor() {
    super(modelMetadata.modelName, modelMetadata.version);
  }

  getSupportedFeatures() {
    return ['trust-scoring', 'proximity-matching', 'completion-rate-analysis'];
  }

  getMetadata() {
    return {
      ...modelMetadata,
      supportedFeatures: this.getSupportedFeatures(),
    };
  }

  validateInput(input) {
    if (!input || typeof input !== 'object') return false;
    const mapped = this._mapInput(input);
    const required = ['rating', 'distance', 'completionRate'];
    return required.every((field) => mapped[field] !== undefined && mapped[field] !== null);
  }

  validateOutput(output) {
    return !!(
      output
      && output.predictionId
      && output.prediction
      && typeof output.prediction.matchScore === 'number'
      && typeof output.prediction.recommendation === 'string'
      && typeof output.confidence === 'number'
    );
  }

  _mapInput(input) {
    const f = input?.features || input;
    return {
      workerMetrics: f.worker || {},
      trustProfile: f.trust || {},
      rating: f.trust?.averageRating ?? f.worker?.rating ?? 3.5,
      distance: f.geo?.distanceKm ?? 5,
      completionRate: f.worker?.completionRate ?? 0.5,
    };
  }

  async predict(input) {
    this.assertValidInput(input);
    const startTime = Date.now();
    const { rating, distance, completionRate } = this._mapInput(input);

    let matchScore = 0;
    if (rating >= 4.5) matchScore += 40;
    else if (rating >= 4.0) matchScore += 20;

    if (completionRate >= 0.95) matchScore += 30;
    else if (completionRate >= 0.8) matchScore += 15;

    if (distance <= 5) matchScore += 30;
    else if (distance <= 15) matchScore += 15;
    else matchScore -= 10;

    matchScore = Math.max(0, Math.min(100, matchScore));

    const recommendation = matchScore >= 70
      ? 'Strong Match'
      : matchScore >= 40
        ? 'Potential Match'
        : 'Poor Match';
    const confidence = Math.round((0.7 + (matchScore / 100) * 0.25) * 1000) / 1000;

    const executionTime = Date.now() - startTime;
    const result = this.formatPrediction(
      {
        matchScore,
        recommendation,
        confidence,
        label: `Match Score: ${matchScore} — ${recommendation}`,
      },
      confidence,
      `Rating: ${rating}, Distance: ${distance}km, Completion: ${Math.round(completionRate * 100)}%`,
      executionTime
    );

    this.assertValidOutput(result);
    return result;
  }
}

export default new TrustMatchModel();
