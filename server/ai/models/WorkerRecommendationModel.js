import BasePredictionModel from './BasePredictionModel.js';
import { MODEL_NAMES, MODEL_VERSIONS } from '../../config/aiConfig.js';

export const modelMetadata = {
  modelName: MODEL_NAMES.WORKER_RECOMMENDATION,
  version: MODEL_VERSIONS[MODEL_NAMES.WORKER_RECOMMENDATION],
  status: 'active',
  description: 'Top-N candidate worker recommendation engine for booking dispatch.',
  inputFeatures: [
    'worker.completionRate',
    'trust.averageRating',
    'worker.workerStatus',
    'worker.rating',
  ],
  outputSchema: {
    candidateWorkerIds: 'array',
    topChoiceWorkerId: 'string',
    confidence: 'number (0-1)',
  },
};

class WorkerRecommendationModel extends BasePredictionModel {
  constructor() {
    super(modelMetadata.modelName, modelMetadata.version);
  }

  getSupportedFeatures() {
    return ['worker-ranking', 'dispatch-recommendation', 'proximity-scoring'];
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
    return mapped.completionRate !== undefined && mapped.rating !== undefined;
  }

  validateOutput(output) {
    return !!(
      output
      && output.predictionId
      && output.prediction
      && Array.isArray(output.prediction.candidateWorkerIds)
      && typeof output.prediction.topChoiceWorkerId === 'string'
      && typeof output.confidence === 'number'
    );
  }

  _mapInput(input) {
    const f = input?.features || input;
    const context = input?.context || f.context || {};
    return {
      workerId: context.workerId ?? f.worker?.workerId ?? 'candidate_1',
      completionRate: f.worker?.completionRate ?? 0.5,
      rating: f.trust?.averageRating ?? f.worker?.rating ?? 3.5,
      distance: f.geo?.distanceKm ?? 10,
      workerStatus: f.worker?.workerStatus ?? 'available',
    };
  }

  async predict(input) {
    this.assertValidInput(input);
    const startTime = Date.now();
    const { workerId, completionRate, rating, distance, workerStatus } = this._mapInput(input);

    const score = (completionRate * 0.4) + ((rating / 5) * 0.4) + (Math.max(0, 1 - distance / 50) * 0.2);
    const isEligible = workerStatus === 'available' || workerStatus === 'online';
    const topChoiceWorkerId = isEligible && score >= 0.4 ? String(workerId) : String(workerId);
    const candidateWorkerIds = isEligible ? [topChoiceWorkerId] : [];
    const confidence = Math.round((0.65 + score * 0.3) * 1000) / 1000;

    const executionTime = Date.now() - startTime;
    const result = this.formatPrediction(
      {
        candidateWorkerIds,
        topChoiceWorkerId,
        confidence,
        label: `Recommended Worker: ${topChoiceWorkerId}`,
      },
      confidence,
      `Worker: ${workerId}, Score: ${Math.round(score * 100)}%, Status: ${workerStatus}`,
      executionTime
    );

    this.assertValidOutput(result);
    return result;
  }
}

export default new WorkerRecommendationModel();
