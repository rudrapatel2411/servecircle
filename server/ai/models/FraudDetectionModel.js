import BasePredictionModel from './BasePredictionModel.js';
import { MODEL_NAMES, MODEL_VERSIONS } from '../../config/aiConfig.js';

export const modelMetadata = {
  modelName: MODEL_NAMES.FRAUD_DETECTION,
  version: MODEL_VERSIONS[MODEL_NAMES.FRAUD_DETECTION],
  status: 'active',
  description: 'Flags anomalous worker or customer transactions and OTP abuses.',
  inputFeatures: [
    'trust.adminWarningCount',
    'trust.complaintRate',
    'customer.cancellationRate',
    'booking.amount',
  ],
  outputSchema: {
    riskLevel: 'string (low|medium|high|critical)',
    isFlagged: 'boolean',
    confidence: 'number (0-1)',
  },
};

class FraudDetectionModel extends BasePredictionModel {
  constructor() {
    super(modelMetadata.modelName, modelMetadata.version);
  }

  getSupportedFeatures() {
    return ['fraud-detection', 'anomaly-scoring', 'trust-signal-analysis'];
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
    return mapped.adminWarningCount !== undefined
      && mapped.complaintRate !== undefined
      && mapped.cancellationRate !== undefined;
  }

  validateOutput(output) {
    return !!(
      output
      && output.predictionId
      && output.prediction
      && typeof output.prediction.riskLevel === 'string'
      && typeof output.prediction.isFlagged === 'boolean'
      && typeof output.confidence === 'number'
    );
  }

  _mapInput(input) {
    const f = input?.features || input;
    return {
      adminWarningCount: f.trust?.adminWarningCount ?? 0,
      complaintRate: f.trust?.complaintRate ?? 0,
      cancellationRate: f.customer?.cancellationRate ?? 0,
      bookingAmount: f.booking?.amount ?? 0,
    };
  }

  async predict(input) {
    this.assertValidInput(input);
    const startTime = Date.now();
    const { adminWarningCount, complaintRate, cancellationRate } = this._mapInput(input);

    let riskLevel = 'low';
    let isFlagged = false;

    if (adminWarningCount > 2 || complaintRate > 0.3) {
      riskLevel = 'critical';
      isFlagged = true;
    } else if (adminWarningCount > 0 || cancellationRate > 0.4 || complaintRate > 0.15) {
      riskLevel = 'medium';
      isFlagged = true;
    } else if (cancellationRate > 0.25) {
      riskLevel = 'high';
      isFlagged = true;
    }

    const confidenceMap = { low: 0.92, medium: 0.85, high: 0.88, critical: 0.95 };
    const confidence = confidenceMap[riskLevel];
    const executionTime = Date.now() - startTime;

    const result = this.formatPrediction(
      {
        riskLevel,
        isFlagged,
        confidence,
        label: `Risk Level: ${riskLevel.toUpperCase()}${isFlagged ? ' (FLAGGED)' : ''}`,
      },
      confidence,
      `Warnings: ${adminWarningCount}, Complaint Rate: ${complaintRate}, Cancel Rate: ${cancellationRate}`,
      executionTime
    );

    this.assertValidOutput(result);
    return result;
  }
}

export default new FraudDetectionModel();
