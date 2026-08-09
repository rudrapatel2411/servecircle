/**
 * server/ai/modelRegistry.js — Central Model Registry
 *
 * Infrastructure registry storing metadata for all platform ML models.
 * Metadata is sourced dynamically from model classes — no duplicated definitions.
 */

import { getAllModelMetadata, isRegisteredModel } from './models/index.js';

const registry = new Map();

function bootstrapRegistry() {
  getAllModelMetadata().forEach((meta) => {
    const now = new Date().toISOString();
    registry.set(meta.modelName, {
      ...meta,
      createdAt: now,
      lastUpdated: now,
    });
  });
}

bootstrapRegistry();

/**
 * Get model metadata by modelName.
 * @param {string} modelName
 * @returns {object|null} Model Metadata
 */
export function getModel(modelName) {
  return registry.get(modelName) || null;
}

/**
 * List all registered models.
 * @returns {object[]} Model Metadata list
 */
export function listModels() {
  return Array.from(registry.values());
}

/**
 * Register or update model metadata.
 * @param {object} modelMeta
 */
export function registerModel(modelMeta) {
  if (!modelMeta.modelName) throw new Error('modelName is required for registration');
  const now = new Date().toISOString();
  const existing = registry.get(modelMeta.modelName) || {};

  const updated = {
    ...existing,
    ...modelMeta,
    version: modelMeta.version || existing.version || 'v1.0.0-architecture',
    status: modelMeta.status || existing.status || 'active',
    lastUpdated: now,
    createdAt: existing.createdAt || now,
  };

  registry.set(modelMeta.modelName, updated);
  return updated;
}

/**
 * Refresh registry entry from live model instance metadata.
 * @param {string} modelName
 * @param {object} liveMetadata
 * @returns {object}
 */
export function syncModelMetadata(modelName, liveMetadata) {
  if (!isRegisteredModel(modelName)) {
    throw new Error(`Cannot sync unregistered model "${modelName}".`);
  }
  return registerModel({
    ...liveMetadata,
    modelName,
  });
}
