/**
 * WorkerSkillHistory.js — Phase 2 Batch 2
 *
 * Per-worker, per-skill performance tracking.
 * One document per (workerId, service, category) combination.
 * Updated automatically after each booking completion or review.
 */

import mongoose from 'mongoose';

const workerSkillHistorySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Which skill/service this record tracks
    service:  { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    skill:    { type: String, trim: true }, // specific sub-skill if available

    // ─── Job Counts ───────────────────────────────────────────────────────────
    jobCount:     { type: Number, default: 0 },
    successCount: { type: Number, default: 0 }, // completed without complaint
    failureCount: { type: Number, default: 0 }, // complained / cancelled by worker

    // ─── Quality ─────────────────────────────────────────────────────────────
    averageRating:   { type: Number, default: 0 },
    _sumRating:      { type: Number, default: 0 }, // for rolling avg
    _ratingCount:    { type: Number, default: 0 },

    // ─── Duration ────────────────────────────────────────────────────────────
    averageDurationMs:{ type: Number, default: 0 },
    _sumDurationMs:   { type: Number, default: 0 }, // for rolling avg

    // ─── Customer Data ────────────────────────────────────────────────────────
    repeatCustomers:    { type: Number, default: 0 },
    uniqueCustomerIds:  [{ type: mongoose.Schema.Types.ObjectId }],

    // ─── Photo Evidence Counts ────────────────────────────────────────────────
    beforePhotosCount: { type: Number, default: 0 },
    afterPhotosCount:  { type: Number, default: 0 },

    lastPerformed: { type: Date },
    lastUpdated:   { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound unique: one record per worker per service/category
workerSkillHistorySchema.index({ workerId: 1, service: 1, category: 1 }, { unique: true });
workerSkillHistorySchema.index({ workerId: 1, averageRating: -1 });
workerSkillHistorySchema.index({ category: 1, averageRating: -1 });

export default mongoose.model('WorkerSkillHistory', workerSkillHistorySchema);
