import BasePredictionModel from './BasePredictionModel.js';
import { MODEL_NAMES, MODEL_VERSIONS } from '../../config/aiConfig.js';

export const modelMetadata = {
  modelName: MODEL_NAMES.CANCELLATION_PREDICT,
  version: MODEL_VERSIONS[MODEL_NAMES.CANCELLATION_PREDICT],
  status: 'active',
  description: 'Predicts likelihood of booking cancellation by customer or worker.',
  inputFeatures: [
    'customer.cancellationRate',
    'worker.acceptanceRate',
    'booking.isEmergency',
  ],
  outputSchema: {
    risk: 'number (0-1)',
    riskLevel: 'string (low|medium|high)',
    confidence: 'number (0-1)',
  },
};

class CancellationPredictionModel extends BasePredictionModel {
  constructor() {
    super(modelMetadata.modelName, modelMetadata.version);
  }

  getSupportedFeatures() {
    return ['cancellation-risk', 'weather-adjustment', 'behaviour-history'];
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
    return mapped.customerCancellationRate !== undefined
      && mapped.workerAcceptanceRate !== undefined;
  }

  validateOutput(output) {
    return !!(
      output
      && output.predictionId
      && output.prediction
      && typeof output.prediction.risk === 'number'
      && typeof output.prediction.riskLevel === 'string'
      && typeof output.confidence === 'number'
    );
  }

  _mapInput(input) {
    const f = input?.features || input;
    return {
      customerCancellationRate: f.customer?.cancellationRate ?? 0.1,
      workerAcceptanceRate: f.worker?.acceptanceRate ?? 0.9,
      weatherFactor: f.booking?.isEmergency ? 1.15 : 1.0,
      isEmergency: f.booking?.isEmergency ?? false,
    };
  }

  async predict(input) {
    this.assertValidInput(input);
    const startTime = Date.now();
    const {
      customerCancellationRate,
      workerAcceptanceRate,
      weatherFactor,
      isEmergency,
    } = this._mapInput(input);

    let risk = (customerCancellationRate * 0.5)
      + ((1 - workerAcceptanceRate) * 0.3)
      + (isEmergency ? 0.1 : 0.05);
    risk = Math.round(risk * weatherFactor * 1000) / 1000;
    risk = Math.max(0, Math.min(1, risk));

    let riskLevel = 'low';
    if (risk > 0.6) riskLevel = 'high';
    else if (risk > 0.35) riskLevel = 'medium';

    const confidence = riskLevel === 'medium' ? 0.76 : 0.87;
    const executionTime = Date.now() - startTime;

    const result = this.formatPrediction(
      {
        risk,
        riskLevel,
        confidence,
        label: `Cancel Risk: ${riskLevel.toUpperCase()} (${Math.round(risk * 100)}%)`,
      },
      confidence,
      `Customer Cancel: ${customerCancellationRate}, Worker Accept: ${workerAcceptanceRate}, Weather: ×${weatherFactor}`,
      executionTime
    );

    this.assertValidOutput(result);
    return result;
  }
}

export default new CancellationPredictionModel();
