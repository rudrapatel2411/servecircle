/**
 * ComplaintMetrics.js — Phase 2 Batch 2
 *
 * Global and per-worker/customer complaint analytics.
 * One GLOBAL document (entityType: 'global') and one per worker.
 * Updated automatically on complaint create/resolve.
 */

import mongoose from 'mongoose';

const complaintMetricsSchema = new mongoose.Schema(
  {
    // 'global' doc for platform-wide stats, or workerId/customerId for per-entity
    entityType: {
      type: String,
      enum: ['global', 'worker', 'customer'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }, // null for global

    // ─── Volume ──────────────────────────────────────────────────────────────
    totalComplaints:    { type: Number, default: 0 },
    resolvedComplaints: { type: Number, default: 0 },
    pendingComplaints:  { type: Number, default: 0 },
    falseComplaints:    { type: Number, default: 0 }, // flagged as invalid by admin

    // ─── By Role ─────────────────────────────────────────────────────────────
    workerComplaints:   { type: Number, default: 0 }, // complaints filed against workers
    customerComplaints: { type: Number, default: 0 }, // complaints filed against customers

    // ─── Timing ──────────────────────────────────────────────────────────────
    // Average ms from createdAt → resolvedAt
    averageResolutionTimeMs: { type: Number, default: 0 },
    _sumResolutionTimeMs:    { type: Number, default: 0 }, // for rolling average

    // ─── Category Breakdown ───────────────────────────────────────────────────
    complaintCategories: [
      {
        category: { type: String },
        count:    { type: Number, default: 0 },
      },
    ],

    // ─── Repeat Complaint Pattern ────────────────────────────────────────────
    repeatComplaintPattern: {
      usersWithMultipleComplaints: { type: Number, default: 0 },
      maxComplaintsFromSingleUser: { type: Number, default: 0 },
    },

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound index: one doc per entity
complaintMetricsSchema.index({ entityType: 1, entityId: 1 }, { unique: true, sparse: true });
complaintMetricsSchema.index({ totalComplaints: -1 });

export default mongoose.model('ComplaintMetrics', complaintMetricsSchema);
