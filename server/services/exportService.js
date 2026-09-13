/**
 * exportService.js — Phase 2 Batch 2
 *
 * Admin-only dataset export service.
 * Supports JSON and CSV formats for all ML training collections.
 *
 * Usage: GET /api/admin/export/:collection?format=csv&limit=1000
 */

import WorkerMetrics from '../models/WorkerMetrics.js';
import CustomerMetrics from '../models/CustomerMetrics.js';
import TrustProfile from '../models/TrustProfile.js';
import ComplaintMetrics from '../models/ComplaintMetrics.js';
import DemandHistory from '../models/DemandHistory.js';
import FeatureStore from '../models/FeatureStore.js';
import WorkerSkillHistory from '../models/WorkerSkillHistory.js';
import CustomerBehaviour from '../models/CustomerBehaviour.js';

const EXPORT_COLLECTIONS = {
  worker_metrics:      WorkerMetrics,
  customer_metrics:    CustomerMetrics,
  trust_profiles:      TrustProfile,
  complaint_metrics:   ComplaintMetrics,
  demand_history:      DemandHistory,
  feature_store:       FeatureStore,
  worker_skill_history:WorkerSkillHistory,
  customer_behaviour:  CustomerBehaviour,
};

/**
 * Fetch records from an exportable collection.
 *
 * @param {string} collection  — key from EXPORT_COLLECTIONS
 * @param {object} opts
 * @param {number} opts.limit  — max records (default: 5000, max: 50000)
 * @param {number} opts.skip   — pagination offset
 * @param {object} opts.filter — additional MongoDB filter
 * @returns {Promise<object[]>}
 */
export async function fetchExportData(collection, { limit = 5000, skip = 0, filter = {} } = {}) {
  const Model = EXPORT_COLLECTIONS[collection];
  if (!Model) {
    throw new Error(`Unknown export collection: "${collection}". Valid: ${Object.keys(EXPORT_COLLECTIONS).join(', ')}`);
  }

  const safeLimit = Math.min(parseInt(limit) || 5000, 50000);
  return Model.find(filter).lean().skip(skip).limit(safeLimit);
}

/**
 * Convert an array of documents to CSV format.
 *
 * @param {object[]} records
 * @returns {string} CSV string
 */
export function toCSV(records) {
  if (!records || records.length === 0) return '';

  // Flatten nested objects one level deep for CSV compatibility
  const flattenRecord = (doc, prefix = '') => {
    const result = {};
    for (const [key, value] of Object.entries(doc)) {
      // Skip internal Mongoose fields and arrays of objects
      if (key === '__v') continue;
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Flatten one level
        const nested = flattenRecord(value, fullKey);
        Object.assign(result, nested);
      } else if (Array.isArray(value)) {
        // Serialize arrays as JSON string
        result[fullKey] = JSON.stringify(value);
      } else {
        result[fullKey] = value instanceof Date ? value.toISOString() : value;
      }
    }
    return result;
  };

  const flat = records.map(r => flattenRecord(r));

  // Collect all unique headers
  const headers = [...new Set(flat.flatMap(r => Object.keys(r)))];

  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const str = String(v);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(','),
    ...flat.map(r => headers.map(h => escape(r[h])).join(',')),
  ];

  return lines.join('\n');
}

/**
 * List all available export collections with record counts.
 *
 * @returns {Promise<object>}
 */
export async function getExportManifest() {
  const manifest = {};
  await Promise.all(
    Object.entries(EXPORT_COLLECTIONS).map(async ([key, Model]) => {
      try {
        manifest[key] = { count: await Model.countDocuments() };
      } catch {
        manifest[key] = { count: 0, error: 'count failed' };
      }
    })
  );
  return manifest;
}

export const VALID_COLLECTIONS = Object.keys(EXPORT_COLLECTIONS);
