/**
 * server/ai/modelManager.js — Model Lifecycle Manager
 *
 * Provides lifecycle management for registered ML models:
 *   - Lazy singleton load & active status check
 *   - Model version updates
 *   - Status toggling (active / staging / deprecated)
 *   - Feature validation against model schema
 */

import { getModel, listModels, registerModel } from './modelRegistry.js';
import { getModelInstance, isRegisteredModel } from './models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Load model metadata by name and assert it is active.
 *
 * @param {string} modelName
 * @returns {object} Model Metadata
 */
export function loadModel(modelName) {
  const model = getModel(modelName);
  if (!model) {
    throw new AppError(`Model "${modelName}" is not registered in ModelRegistry.`, StatusCodes.NOT_FOUND);
  }
  if (model.status !== 'active') {
    throw new AppError(`Model "${modelName}" is currently in status "${model.status}" and cannot serve inferences.`, StatusCodes.SERVICE_UNAVAILABLE);
  }
  return model;
}

/**
 * Lazily load singleton model instance and assert registry status is active.
 *
 * @param {string} modelName
 * @returns {Promise<BasePredictionModel>}
 */
export async function loadModelInstance(modelName) {
  loadModel(modelName);
  if (!isRegisteredModel(modelName)) {
    throw new AppError(`Model "${modelName}" has no runtime instance.`, StatusCodes.NOT_FOUND);
  }
  return getModelInstance(modelName);
}

/**
 * Validate extracted features against model's inputFeatures requirement.
 *
 * @param {object} model - Loaded model metadata
 * @param {object} featureVector - Standardized feature vector
 * @returns {object} Validation result { isValid, missingFeatures }
 */
export function validateModelFeatures(model, featureVector) {
  const required = model.inputFeatures || [];
  const missing = [];

  required.forEach((path) => {
    const parts = path.split('.');
    let curr = featureVector?.features;
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

  return {
    isValid: missing.length === 0,
    missingFeatures: missing,
    requiredFeatures: required,
  };
}

/**
 * Update a model's status or version.
 *
 * @param {string} modelName
 * @param {object} updates
 * @returns {object} Updated model metadata
 */
export function updateModelStatus(modelName, { status, version, description }) {
  const model = getModel(modelName);
  if (!model) {
    throw new AppError(`Model "${modelName}" not found.`, StatusCodes.NOT_FOUND);
  }
  return registerModel({
    modelName,
    ...(status ? { status } : {}),
    ...(version ? { version } : {}),
    ...(description ? { description } : {}),
  });
}

/**
 * Get model health from live singleton instance.
 *
 * @param {string} modelName
 * @returns {Promise<object>}
 */
export async function getModelHealth(modelName) {
  const instance = await loadModelInstance(modelName);
  const health = await instance.health();
  const metadata = instance.getMetadata();
  return {
    modelName,
    ...health,
    supportedFeatures: metadata.supportedFeatures || instance.getSupportedFeatures(),
  };
}

/**
 * List all active model registrations.
 * @returns {object[]}
 */
export function getActiveModels() {
  return listModels().filter((m) => m.status === 'active');
}
