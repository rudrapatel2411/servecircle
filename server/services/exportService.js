/**
 * exportService.js — Phase 2 Batch 2 (PostgreSQL / Prisma)
 *
 * Admin-only dataset export service.
 * Supports JSON and CSV formats for all ML analytics collections.
 *
 * Usage: GET /api/admin/export/:collection?format=csv&limit=1000
 */

import { prisma } from '../config/prisma.js';

export const VALID_COLLECTIONS = [
  'worker_metrics',
  'customer_metrics',
  'trust_profiles',
  'complaint_metrics',
  'demand_history',
  'feature_store',
  'worker_skill_history',
  'customer_behaviour',
];

/**
 * Fetch records from an exportable collection stored in PostgreSQL AnalyticsRecord.
 *
 * @param {string} collection
 * @param {object} opts
 * @param {number} opts.limit
 * @param {number} opts.skip
 * @returns {Promise<object[]>}
 */
export async function fetchExportData(collection, { limit = 5000, skip = 0 } = {}) {
  const norm = collection.replace(/_/g, '').toLowerCase();
  const safeLimit = Math.min(parseInt(limit) || 5000, 50000);

  try {
    const records = await prisma.analyticsRecord.findMany({
      where: {
        collection: { contains: norm, mode: 'insensitive' },
      },
      skip,
      take: safeLimit,
    });
    return records.map((r) => r.data);
  } catch (err) {
    console.error('[ExportService] fetchExportData failed:', err.message);
    return [];
  }
}

/**
 * Convert an array of documents to CSV format.
 *
 * @param {object[]} records
 * @returns {string} CSV string
 */
export function toCSV(records) {
  if (!records || records.length === 0) return '';

  const flattenRecord = (doc, prefix = '') => {
    const result = {};
    for (const [key, value] of Object.entries(doc)) {
      if (key === '__v') continue;
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const nested = flattenRecord(value, fullKey);
        Object.assign(result, nested);
      } else if (Array.isArray(value)) {
        result[fullKey] = JSON.stringify(value);
      } else {
        result[fullKey] = value instanceof Date ? value.toISOString() : value;
      }
    }
    return result;
  };

  const flat = records.map((r) => flattenRecord(r));
  const headers = [...new Set(flat.flatMap((r) => Object.keys(r)))];

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
    ...flat.map((r) => headers.map((h) => escape(r[h])).join(',')),
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
    VALID_COLLECTIONS.map(async (key) => {
      const norm = key.replace(/_/g, '').toLowerCase();
      try {
        const count = await prisma.analyticsRecord.count({
          where: { collection: { contains: norm, mode: 'insensitive' } },
        });
        manifest[key] = { count };
      } catch {
        manifest[key] = { count: 0 };
      }
    })
  );
  return manifest;
}
