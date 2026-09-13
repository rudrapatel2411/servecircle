/**
 * BasePredictionModel — Abstract base for all platform prediction models.
 *
 * Every model must inherit this class and implement predict(), validateInput(),
 * validateOutput(), and getMetadata().
 */

import { randomUUID } from 'node:crypto';
import { AppError } from '../../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

export default class BasePredictionModel {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.isLoaded = false;
  }

  async load() {
    this.isLoaded = true;
    return true;
  }

  async predict(_input) {
    throw new Error('Method predict() must be implemented');
  }

  validateInput(_input) {
    throw new Error('Method validateInput() must be implemented');
  }

  validateOutput(_output) {
    throw new Error('Method validateOutput() must be implemented');
  }

  async health() {
    return {
      loaded: this.isLoaded,
      ready: this.isLoaded,
      version: this.version,
      supportedFeatures: this.getSupportedFeatures(),
    };
  }

  getSupportedFeatures() {
    return [];
  }

  getMetadata() {
    return {
      modelName: this.name,
      version: this.version,
      type: 'PredictionModel',
      supportedFeatures: this.getSupportedFeatures(),
    };
  }

  metadata() {
    return this.getMetadata();
  }

  formatPrediction(prediction, confidence, inputSummary, executionTime = 0) {
    return {
      predictionId: randomUUID(),
      modelName: this.name,
      modelVersion: this.version,
      prediction,
      confidence,
      confidenceLevel: this.calculateConfidenceLevel(confidence),
      inputSummary,
      executionTime,
      timestamp: new Date().toISOString(),
    };
  }

  calculateConfidenceLevel(confidence) {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  }

  assertValidInput(input) {
    const isValid = this.validateInput(input);
    if (!isValid) {
      throw new AppError(
        `Invalid input for model "${this.name}". Required fields are missing or malformed.`,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  assertValidOutput(output) {
    const isValid = this.validateOutput(output);
    if (!isValid) {
      throw new AppError(
        `Model "${this.name}" produced an invalid prediction output.`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
