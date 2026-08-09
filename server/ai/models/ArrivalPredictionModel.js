import BasePredictionModel from './BasePredictionModel.js';
import { MODEL_NAMES, MODEL_VERSIONS } from '../../config/aiConfig.js';

export const modelMetadata = {
  modelName: MODEL_NAMES.ARRIVAL_PREDICTION,
  version: MODEL_VERSIONS[MODEL_NAMES.ARRIVAL_PREDICTION],
  status: 'active',
  description: 'Estimates worker arrival time (ETA) from acceptance to arrival.',
  inputFeatures: [
    'worker.avgArrivalTimeMs',
    'booking.isEmergency',
    'timeline.milestoneCount',
  ],
  outputSchema: {
    estimatedArrivalMinutes: 'number',
    confidence: 'number (0-1)',
  },
};

class ArrivalPredictionModel extends BasePredictionModel {
  constructor() {
    super(modelMetadata.modelName, modelMetadata.version);
  }

  getSupportedFeatures() {
    return ['eta-prediction', 'traffic-adjustment', 'worker-history'];
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
    return mapped.distance !== undefined && mapped.avgArrivalMinutes !== undefined;
  }

  validateOutput(output) {
    return !!(
      output
      && output.predictionId
      && output.prediction
      && typeof output.prediction.estimatedArrivalMinutes === 'number'
      && typeof output.confidence === 'number'
    );
  }

  _mapInput(input) {
    const f = input?.features || input;
    const avgArrivalMs = f.worker?.avgArrivalTimeMs ?? 15 * 60 * 1000;
    return {
      distance: f.geo?.distanceKm ?? 5,
      avgArrivalMinutes: Math.round(avgArrivalMs / (60 * 1000)),
      trafficFactor: f.booking?.isEmergency ? 1.25 : 1.0,
    };
  }

  async predict(input) {
    this.assertValidInput(input);
    const startTime = Date.now();
    const { distance, avgArrivalMinutes, trafficFactor } = this._mapInput(input);

    const baseMinutes = Math.round(distance * 3 + avgArrivalMinutes);
    const estimatedArrivalMinutes = Math.round(baseMinutes * trafficFactor);
    const confidence = distance <= 10 ? 0.88 : distance <= 25 ? 0.78 : 0.65;

    const executionTime = Date.now() - startTime;
    const result = this.formatPrediction(
      {
        estimatedArrivalMinutes,
        confidence,
        label: `ETA: ${estimatedArrivalMinutes} mins`,
      },
      confidence,
      `Distance: ${distance}km, Avg History: ${avgArrivalMinutes}min, Traffic: ×${trafficFactor}`,
      executionTime
    );

    this.assertValidOutput(result);
    return result;
  }
}

export default new ArrivalPredictionModel();
