/**
 * historyService.js — Phase 2 AI Data Foundation (PostgreSQL / Prisma)
 *
 * Creates immutable DocumentHistory snapshots whenever important
 * documents change. Called by business services after successful
 * mutations.
 *
 * Rules:
 *   - Always append, never overwrite
 *   - Version numbers are monotonically increasing per documentId
 *   - Stored in PostgreSQL `DocumentHistory` model
 */

import { prisma } from '../config/prisma.js';

/**
 * Capture a document state snapshot.
 *
 * @param {object} params
 * @param {string}   params.collection    — Collection/table name e.g. 'bookings'
 * @param {*}        params.documentId    — Unique ID of the document/row
 * @param {object}   params.before        — Document state BEFORE the change
 * @param {object}   params.after         — Document state AFTER the change
 * @param {*}        [params.changedBy]   — User ID who made the change
 * @param {string}   [params.changedByRole]
 * @param {string}   [params.changeReason]
 * @returns {Promise<void>}  — fire-and-forget, never throws
 */
export async function captureSnapshot({ collection, documentId, before, after, changedBy, changedByRole, changeReason }) {
  if (!documentId) return;
  try {
    const docIdStr = String(documentId?.id || documentId?._id || documentId);
    const lastEntry = await prisma.documentHistory.findFirst({
      where: { collection, documentId: docIdStr },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const version = (lastEntry?.version ?? 0) + 1;

    // Strip OTPs from snapshot for security
    const safeAfter = { ...after };
    delete safeAfter.startOtp;
    delete safeAfter.endOtp;

    await prisma.documentHistory.create({
      data: {
        collection: collection || 'bookings',
        documentId: docIdStr,
        version,
        snapshot: safeAfter,
        changedById: changedBy ? String(changedBy) : null,
        changedByRole: changedByRole || null,
        changeReason: changeReason || null,
      },
    });
  } catch (err) {
    console.error('[HistoryService] captureSnapshot failed:', err.message);
  }
}

/**
 * Retrieve the full version history of a document.
 */
export async function getHistory(collection, documentId, { limit = 50, skip = 0 } = {}) {
  if (!documentId) return [];
  const docIdStr = String(documentId?.id || documentId?._id || documentId);
  try {
    return await prisma.documentHistory.findMany({
      where: { collection, documentId: docIdStr },
      orderBy: { version: 'desc' },
      skip,
      take: limit,
    });
  } catch {
    return [];
  }
}

/**
 * Get the full snapshot at a specific version.
 */
export async function getVersion(collection, documentId, version) {
  if (!documentId) return null;
  const docIdStr = String(documentId?.id || documentId?._id || documentId);
  try {
    return await prisma.documentHistory.findFirst({
      where: { collection, documentId: docIdStr, version },
    });
  } catch {
    return null;
  }
}

/**
 * Convenience: diff two consecutive versions.
 */
export async function getDiff(collection, documentId, version) {
  if (!documentId) return null;
  const docIdStr = String(documentId?.id || documentId?._id || documentId);
  try {
    const entry = await prisma.documentHistory.findFirst({
      where: { collection, documentId: docIdStr, version },
    });
    if (!entry) return null;
    return { fullSnapshot: entry.fullSnapshot, version: entry.version };
  } catch {
    return null;
  }
}
