import BasePredictionModel from './BasePredictionModel.js';
import { MODEL_NAMES, MODEL_VERSIONS } from '../../config/aiConfig.js';

export const modelMetadata = {
  modelName: MODEL_NAMES.FAIR_PRICE,
  version: MODEL_VERSIONS[MODEL_NAMES.FAIR_PRICE],
  status: 'active',
  description: 'Dynamic baseline price estimator considering category, area, and demand.',
  inputFeatures: [
    'demand.averagePrice',
    'service.basePrice',
    'booking.amount',
    'worker.workerStatus',
  ],
  outputSchema: {
    estimatedPrice: 'number',
    minimumPrice: 'number',
    maximumPrice: 'number',
    confidence: 'number (0-1)',
  },
};

class FairPriceModel extends BasePredictionModel {
  constructor() {
    super(modelMetadata.modelName, modelMetadata.version);
  }

  getSupportedFeatures() {
    return ['dynamic-pricing', 'tier-adjustment', 'distance-fee'];
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
    return mapped.category !== undefined
      && mapped.historicalAverage !== undefined
      && mapped.workerTier !== undefined
      && mapped.distance !== undefined;
  }

  validateOutput(output) {
    return !!(
      output
      && output.predictionId
      && output.prediction
      && typeof output.prediction.estimatedPrice === 'number'
      && typeof output.prediction.minimumPrice === 'number'
      && typeof output.prediction.maximumPrice === 'number'
      && typeof output.confidence === 'number'
    );
  }

  _mapInput(input) {
    const f = input?.features || input;
    return {
      category: f.service?.category ?? f.context?.category ?? 'general',
      historicalAverage: f.demand?.averagePrice ?? f.service?.basePrice ?? f.booking?.amount ?? 500,
      workerTier: _mapWorkerTier(f.worker?.workerStatus),
      distance: f.geo?.distanceKm ?? 0,
    };
  }

  async predict(input) {
    this.assertValidInput(input);
    const startTime = Date.now();
    const { category, historicalAverage, workerTier, distance } = this._mapInput(input);

    let multiplier = 1.0;
    if (workerTier === 'Premium') multiplier = 1.2;
    else if (workerTier === 'Standard') multiplier = 1.0;
    else multiplier = 0.8;

    const distanceFee = distance * 0.5;
    const estimatedPrice = Math.round((historicalAverage * multiplier) + distanceFee);
    const minimumPrice = Math.round(estimatedPrice * 0.9);
    const maximumPrice = Math.round(estimatedPrice * 1.1);
    const confidence = 0.9;

    const executionTime = Date.now() - startTime;
    const result = this.formatPrediction(
      {
        estimatedPrice,
        minimumPrice,
        maximumPrice,
        confidence,
        label: `Fair Price: ₹${estimatedPrice} (${category}, ${workerTier})`,
      },
      confidence,
      `Category: ${category}, Avg: ₹${historicalAverage}, Tier: ${workerTier}, Dist: ${distance}km`,
      executionTime
    );

    this.assertValidOutput(result);
    return result;
  }
}

function _mapWorkerTier(workerStatus) {
  if (workerStatus === 'expert' || workerStatus === 'pro') return 'Premium';
  if (workerStatus === 'rookie' || workerStatus === 'none') return 'Basic';
  return 'Standard';
}

export default new FairPriceModel();
