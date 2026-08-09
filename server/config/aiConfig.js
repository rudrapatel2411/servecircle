/**
 * aiConfig.js — Centralized AI/ML Configuration
 *
 * Defines model names, versions, confidence thresholds, feature limits,
 * validation constraints, and caching parameters.
 */

export const MODEL_NAMES = {
  TRUST_MATCH:          'TrustMatch',
  FAIR_PRICE:           'FairPrice',
  DEMAND_FORECAST:      'DemandForecast',
  FRAUD_DETECTION:      'FraudDetection',
  WORKER_RECOMMENDATION:'WorkerRecommendation',
  ARRIVAL_PREDICTION:   'ArrivalPrediction',
  CANCELLATION_PREDICT: 'CancellationPrediction',
  PROBLEM_CLASSIFY:     'ProblemClassification',
};

export const MODEL_VERSIONS = {
  [MODEL_NAMES.TRUST_MATCH]:          'v1.0.0-architecture',
  [MODEL_NAMES.FAIR_PRICE]:           'v1.0.0-architecture',
  [MODEL_NAMES.DEMAND_FORECAST]:      'v1.0.0-architecture',
  [MODEL_NAMES.FRAUD_DETECTION]:      'v1.0.0-architecture',
  [MODEL_NAMES.WORKER_RECOMMENDATION]:'v1.0.0-architecture',
  [MODEL_NAMES.ARRIVAL_PREDICTION]:   'v1.0.0-architecture',
  [MODEL_NAMES.CANCELLATION_PREDICT]: 'v1.0.0-architecture',
  [MODEL_NAMES.PROBLEM_CLASSIFY]:     'v1.0.0-architecture',
};

export const CONFIDENCE_LEVELS = {
  VERY_LOW:  { label: 'Very Low',  minScore: 0.0, maxScore: 0.2 },
  LOW:       { label: 'Low',       minScore: 0.2, maxScore: 0.4 },
  MEDIUM:    { label: 'Medium',    minScore: 0.4, maxScore: 0.7 },
  HIGH:      { label: 'High',      minScore: 0.7, maxScore: 0.9 },
  VERY_HIGH: { label: 'Very High', minScore: 0.9, maxScore: 1.0 },
};

export const CONFIDENCE_THRESHOLDS = {
  MINIMUM_ACCEPTABLE_SCORE: 0.4, // Below 0.4 → Low/Very Low flags
  HIGH_CONFIDENCE_SCORE:    0.7,
};

export const FEATURE_LIMITS = {
  CACHE_TTL_MS: 30_000, // 30 seconds feature extraction cache
  MAX_CACHE_ITEMS: 1000,
  MIN_DATA_QUALITY_SCORE: 0.5,
};

export const VALIDATION_CONSTRAINTS = {
  PRICE_MIN: 0,
  PRICE_MAX: 1_000_000,
  RATING_MIN: 0,
  RATING_MAX: 5,
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
};

export const INFERENCE_SETTINGS = {
  TIMEOUT_MS: 5000,
  LOG_INFERENCES: true,
};
