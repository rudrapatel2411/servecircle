/**
 * DocumentHistory.js — Phase 2 AI Data Foundation
 *
 * Immutable version snapshots of important documents.
 * Created whenever a Booking, User, Worker, Service, Review, or Complaint changes.
 *
 * Records are NEVER updated or deleted — append-only.
 * Each document gets monotonically increasing version numbers.
 */

import mongoose from 'mongoose';

const documentHistorySchema = new mongoose.Schema(
  {
    // Which collection this snapshot belongs to
    collection: { type: String, required: true, trim: true }, // 'bookings' | 'users' | 'reviews' | 'services' etc.

    // The ID of the document being versioned
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // Monotonically increasing version number per document
    version: { type: Number, required: true },

    // Which fields changed in this version (array of field path strings)
    changedFields: [{ type: String }],

    // Previous values of changed fields
    oldValues: { type: mongoose.Schema.Types.Mixed, default: {} },

    // New values of changed fields
    newValues: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Full document snapshot at this version
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Who made the change
    changedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedByRole: { type: String },

    // Why the change was made (operation context)
    changeReason: { type: String },

    timestamp: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: false,
    suppressReservedKeysWarning: true,
  }
);


// Compound unique: each version of each document is unique
documentHistorySchema.index({ collection: 1, documentId: 1, version: 1 }, { unique: true });
documentHistorySchema.index({ documentId: 1, timestamp: -1 });
documentHistorySchema.index({ changedBy: 1 });
documentHistorySchema.index({ timestamp: -1 });

// Block updates — history is immutable
const BLOCKED = ['update', 'updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne'];
BLOCKED.forEach((op) => {
  documentHistorySchema.pre(op, function () {
    throw new Error('DocumentHistory records are immutable — updates are not permitted.');
  });
});

export default mongoose.model('DocumentHistory', documentHistorySchema);
