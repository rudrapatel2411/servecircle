/**
 * Model instance factory — lazy singleton loading for all prediction models.
 */

import { MODEL_NAMES } from '../../config/aiConfig.js';
import { modelMetadata as trustMatchMetadata } from './TrustMatchModel.js';
import { modelMetadata as fairPriceMetadata } from './FairPriceModel.js';
import { modelMetadata as demandForecastMetadata } from './DemandForecastModel.js';
import { modelMetadata as fraudDetectionMetadata } from './FraudDetectionModel.js';
import { modelMetadata as workerRecommendationMetadata } from './WorkerRecommendationModel.js';
import { modelMetadata as arrivalPredictionMetadata } from './ArrivalPredictionModel.js';
import { modelMetadata as cancellationPredictionMetadata } from './CancellationPredictionModel.js';
import { modelMetadata as problemClassificationMetadata } from './ProblemClassificationModel.js';

const MODEL_LOADERS = {
  [MODEL_NAMES.TRUST_MATCH]: () => import('./TrustMatchModel.js'),
  [MODEL_NAMES.FAIR_PRICE]: () => import('./FairPriceModel.js'),
  [MODEL_NAMES.DEMAND_FORECAST]: () => import('./DemandForecastModel.js'),
  [MODEL_NAMES.FRAUD_DETECTION]: () => import('./FraudDetectionModel.js'),
  [MODEL_NAMES.WORKER_RECOMMENDATION]: () => import('./WorkerRecommendationModel.js'),
  [MODEL_NAMES.ARRIVAL_PREDICTION]: () => import('./ArrivalPredictionModel.js'),
  [MODEL_NAMES.CANCELLATION_PREDICT]: () => import('./CancellationPredictionModel.js'),
  [MODEL_NAMES.PROBLEM_CLASSIFY]: () => import('./ProblemClassificationModel.js'),
};

export const ALL_MODEL_METADATA = [
  trustMatchMetadata,
  fairPriceMetadata,
  demandForecastMetadata,
  fraudDetectionMetadata,
  workerRecommendationMetadata,
  arrivalPredictionMetadata,
  cancellationPredictionMetadata,
  problemClassificationMetadata,
];

const instances = new Map();

/**
 * Lazily load and cache a singleton model instance.
 * @param {string} modelName
 * @returns {Promise<BasePredictionModel>}
 */
export async function getModelInstance(modelName) {
  if (instances.has(modelName)) {
    return instances.get(modelName);
  }

  const loader = MODEL_LOADERS[modelName];
  if (!loader) {
    throw new Error(`No model loader registered for "${modelName}".`);
  }

  const module = await loader();
  const instance = module.default;

  if (!instance.isLoaded) {
    await instance.load();
  }

  instances.set(modelName, instance);
  return instance;
}

/**
 * Return all statically declared model metadata (single source of truth).
 * @returns {object[]}
 */
export function getAllModelMetadata() {
  return ALL_MODEL_METADATA.map((meta) => ({ ...meta }));
}

/**
 * Check whether a model name is registered.
 * @param {string} modelName
 * @returns {boolean}
 */
export function isRegisteredModel(modelName) {
  return modelName in MODEL_LOADERS;
}

/**
 * Clear cached instances (for testing).
 */
export function clearModelInstances() {
  instances.clear();
}
