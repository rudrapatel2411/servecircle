/**
 * WorkerMetrics.js — Phase 2 AI Data Foundation
 *
 * One document per worker. All metrics are maintained automatically
 * by metricsService after each relevant booking event.
 *
 * Never update this directly from routes.
 * metricsService is the only writer.
 */

import mongoose from 'mongoose';

const workerMetricsSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ─── Assignment & Completion Counters ───────────────────────────────────
    totalAssignments:  { type: Number, default: 0 },
    totalAcceptances:  { type: Number, default: 0 },
    totalRejections:   { type: Number, default: 0 },
    totalCompletions:  { type: Number, default: 0 },
    totalCancellations:{ type: Number, default: 0 },
    totalNoShows:      { type: Number, default: 0 }, // arrived but didn't start within threshold

    // ─── OTP Failures (signals reliability) ────────────────────────────────
    totalOtpFailures:  { type: Number, default: 0 },

    // ─── Timing Metrics (milliseconds) ─────────────────────────────────────
    // Average time from assignment to acceptance
    avgResponseTimeMs: { type: Number, default: 0 },
    // Average time from accepted to arrived
    avgArrivalTimeMs:  { type: Number, default: 0 },
    // Average time from started to completed
    avgCompletionTimeMs: { type: Number, default: 0 },

    // Accumulated sums for rolling average calculation
    _sumResponseTimeMs:   { type: Number, default: 0 },
    _sumArrivalTimeMs:    { type: Number, default: 0 },
    _sumCompletionTimeMs: { type: Number, default: 0 },
    _timingSamples:       { type: Number, default: 0 },

    // ─── Rating Breakdown ───────────────────────────────────────────────────
    avgRatingOverall:        { type: Number, default: 0 },
    avgRatingQuality:        { type: Number, default: 0 },
    avgRatingPunctuality:    { type: Number, default: 0 },
    avgRatingCommunication:  { type: Number, default: 0 },
    avgRatingProfessionalism:{ type: Number, default: 0 },
    avgRatingCleanliness:    { type: Number, default: 0 },
    avgRatingValue:          { type: Number, default: 0 },
    totalRatings:            { type: Number, default: 0 },

    // ─── Customer Behaviour ─────────────────────────────────────────────────
    repeatCustomers:       { type: Number, default: 0 },
    uniqueCustomers:       { type: Number, default: 0 },
    uniqueCustomerIds:     [{ type: mongoose.Schema.Types.ObjectId }], // for dedup

    // ─── Complaints ─────────────────────────────────────────────────────────
    totalComplaints:       { type: Number, default: 0 },
    resolvedComplaints:    { type: Number, default: 0 },

    // ─── Calculated Rates ───────────────────────────────────────────────────
    successRate:           { type: Number, default: 0 }, // completions / assignments
    acceptanceRate:        { type: Number, default: 0 }, // acceptances / assignments
    completionRate:        { type: Number, default: 0 }, // completions / acceptances

    // ─── Category Performance ───────────────────────────────────────────────
    categoryBreakdown: [
      {
        category:    { type: String },
        completions: { type: Number, default: 0 },
        avgRating:   { type: Number, default: 0 },
      },
    ],

    // ─── Last activity timestamp ────────────────────────────────────────────
    lastJobAt:    { type: Date },
    lastUpdated:  { type: Date, default: Date.now },
  },
  { timestamps: false }
);

workerMetricsSchema.index({ successRate: -1 });
workerMetricsSchema.index({ avgRatingOverall: -1 });
workerMetricsSchema.index({ totalCompletions: -1 });


export default mongoose.model('WorkerMetrics', workerMetricsSchema);
