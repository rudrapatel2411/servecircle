/**
 * server/ai/predictionEngine.js — Prediction Engine
 *
 * Delegates predictions to registered model classes.
 * Each model returns the standardized prediction response format.
 */

import { loadModelInstance } from './modelManager.js';
import { isRegisteredModel } from './models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Execute prediction via the registered model class.
 *
 * @param {string} modelName
 * @param {object} featureVector
 * @returns {Promise<object>} Standardized Prediction Output
 */
export async function runPrediction(modelName, featureVector) {
  if (!isRegisteredModel(modelName)) {
    throw new AppError(`No prediction model registered for "${modelName}".`, StatusCodes.BAD_REQUEST);
  }

  const modelInstance = await loadModelInstance(modelName);
  const result = await modelInstance.predict(featureVector);
  return result;
}

/**
 * Execute direct prediction with raw model input (bypasses feature extraction).
 *
 * @param {string} modelName
 * @param {object} input
 * @returns {Promise<object>} Standardized Prediction Output
 */
export async function runDirectPrediction(modelName, input) {
  if (!isRegisteredModel(modelName)) {
    throw new AppError(`No prediction model registered for "${modelName}".`, StatusCodes.BAD_REQUEST);
  }

  const modelInstance = await loadModelInstance(modelName);
  const result = await modelInstance.predict(input);
  return result;
}
