import BasePredictionModel from './BasePredictionModel.js';
import { MODEL_NAMES, MODEL_VERSIONS } from '../../config/aiConfig.js';

export const modelMetadata = {
  modelName: MODEL_NAMES.DEMAND_FORECAST,
  version: MODEL_VERSIONS[MODEL_NAMES.DEMAND_FORECAST],
  status: 'active',
  description: 'Forecasts hourly booking volume by city and service category.',
  inputFeatures: [
    'demand.bookingCount',
    'demand.averagePrice',
    'booking.isEmergency',
  ],
  outputSchema: {
    expectedDemandLevel: 'string (low|medium|high)',
    surgeMultiplier: 'number',
    confidence: 'number (0-1)',
  },
};

class DemandForecastModel extends BasePredictionModel {
  constructor() {
    super(modelMetadata.modelName, modelMetadata.version);
  }

  getSupportedFeatures() {
    return ['demand-forecasting', 'surge-pricing', 'time-of-day-analysis'];
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
    return mapped.bookingCount !== undefined && mapped.scheduledHour !== undefined;
  }

  validateOutput(output) {
    return !!(
      output
      && output.predictionId
      && output.prediction
      && typeof output.prediction.expectedDemandLevel === 'string'
      && typeof output.prediction.surgeMultiplier === 'number'
      && typeof output.confidence === 'number'
    );
  }

  _mapInput(input) {
    const f = input?.features || input;
    return {
      bookingCount: f.demand?.bookingCount ?? 0,
      averagePrice: f.demand?.averagePrice ?? 0,
      scheduledHour: f.booking?.scheduledHour ?? 12,
      scheduledDayOfWeek: f.booking?.scheduledDayOfWeek ?? 1,
    };
  }

  async predict(input) {
    this.assertValidInput(input);
    const startTime = Date.now();
    const { bookingCount, scheduledHour } = this._mapInput(input);

    let expectedDemandLevel = 'medium';
    let surgeMultiplier = 1.0;

    if (bookingCount > 20 || (scheduledHour >= 9 && scheduledHour <= 18)) {
      expectedDemandLevel = 'high';
      surgeMultiplier = 1.15;
    } else if (bookingCount < 5 && (scheduledHour < 6 || scheduledHour > 22)) {
      expectedDemandLevel = 'low';
      surgeMultiplier = 0.9;
    }

    const confidence = expectedDemandLevel === 'medium' ? 0.75 : 0.88;
    const executionTime = Date.now() - startTime;

    const result = this.formatPrediction(
      {
        expectedDemandLevel,
        surgeMultiplier,
        confidence,
        label: `Demand: ${expectedDemandLevel.toUpperCase()} (×${surgeMultiplier})`,
      },
      confidence,
      `Bookings: ${bookingCount}, Hour: ${scheduledHour}`,
      executionTime
    );

    this.assertValidOutput(result);
    return result;
  }
}

export default new DemandForecastModel();
