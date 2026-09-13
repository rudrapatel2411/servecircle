/**
 * historyService.js — Phase 2 AI Data Foundation
 *
 * Creates immutable DocumentHistory snapshots whenever important
 * documents change. Called by business services after successful
 * mutations.
 *
 * Rules:
 *   - Always append, never overwrite
 *   - Version numbers are monotonically increasing per documentId
 *   - Only the diff (changedFields, oldValues, newValues) is required;
 *     full snapshot is optional but stored for ML training convenience
 */

import DocumentHistory from '../models/DocumentHistory.js';

/**
 * Capture an immutable version snapshot of a document change.
 *
 * @param {object} params
 * @param {string}   params.collection    — Collection name e.g. 'bookings'
 * @param {*}        params.documentId    — MongoDB ObjectId of the document
 * @param {object}   params.before        — Document state BEFORE the change
 * @param {object}   params.after         — Document state AFTER the change
 * @param {*}        [params.changedBy]   — User ID who made the change
 * @param {string}   [params.changedByRole]
 * @param {string}   [params.changeReason]
 * @returns {Promise<void>}  — fire-and-forget, never throws
 */
export async function captureSnapshot({ collection, documentId, before, after, changedBy, changedByRole, changeReason }) {
  try {
    // Compute next version number atomically
    const lastEntry = await DocumentHistory
      .findOne({ collection, documentId })
      .sort({ version: -1 })
      .select('version')
      .lean();
    const version = (lastEntry?.version ?? 0) + 1;

    // Compute which fields changed
    const changedFields = [];
    const oldValues = {};
    const newValues = {};

    const allKeys = new Set([
      ...Object.keys(before || {}),
      ...Object.keys(after || {}),
    ]);

    for (const key of allKeys) {
      // Skip internal Mongoose fields and OTP secrets
      if (['__v', 'startOtp', 'endOtp'].includes(key)) continue;

      const oldVal = before?.[key];
      const newVal = after?.[key];

      // Simple deep-equality check (JSON stringify handles dates, nested objects)
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changedFields.push(key);
        oldValues[key] = oldVal;
        newValues[key] = newVal;
      }
    }

    if (changedFields.length === 0 && version > 1) return; // Nothing actually changed

    // Strip OTPs from snapshot for security
    const safeAfter = { ...after };
    delete safeAfter.startOtp;
    delete safeAfter.endOtp;

    await DocumentHistory.create({
      collection,
      documentId,
      version,
      changedFields,
      oldValues,
      newValues,
      snapshot: safeAfter,
      changedBy,
      changedByRole,
      changeReason,
    });
  } catch (err) {
    // History capture must never crash the application
    console.error('[HistoryService] captureSnapshot failed:', err.message);
  }
}

/**
 * Retrieve the full version history of a document.
 *
 * @param {string} collection
 * @param {*}      documentId
 * @param {object} [opts]
 * @param {number} [opts.limit]   — max records (default: 50)
 * @param {number} [opts.skip]    — pagination offset
 * @returns {Promise<object[]>}
 */
export async function getHistory(collection, documentId, { limit = 50, skip = 0 } = {}) {
  return DocumentHistory
    .find({ collection, documentId })
    .sort({ version: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

/**
 * Get the full snapshot at a specific version.
 *
 * @param {string} collection
 * @param {*}      documentId
 * @param {number} version
 * @returns {Promise<object|null>}
 */
export async function getVersion(collection, documentId, version) {
  return DocumentHistory.findOne({ collection, documentId, version }).lean();
}

/**
 * Convenience: diff two consecutive versions.
 *
 * @param {string} collection
 * @param {*}      documentId
 * @param {number} version
 * @returns {Promise<{changedFields, oldValues, newValues}|null>}
 */
export async function getDiff(collection, documentId, version) {
  const entry = await DocumentHistory.findOne({ collection, documentId, version }).lean();
  if (!entry) return null;
  return { changedFields: entry.changedFields, oldValues: entry.oldValues, newValues: entry.newValues };
}
