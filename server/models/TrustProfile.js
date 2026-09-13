/**
 * TrustProfile.js — Phase 2 Batch 2
 *
 * Data-only trust signal collection per worker.
 * NO trust score calculation here — raw data only for future ML model.
 *
 * Updated automatically by metricsService on every relevant event.
 * One document per worker (upsert pattern).
 */

import mongoose from 'mongoose';

const trustProfileSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ─── Identity & Verification ─────────────────────────────────────────────
    identityVerification: {
      status: { type: String, enum: ['none', 'submitted', 'verified', 'rejected'], default: 'none' },
      verifiedAt: { type: Date },
    },
    documentVerification: {
      status: { type: String, enum: ['none', 'submitted', 'verified', 'rejected'], default: 'none' },
      verifiedAt: { type: Date },
    },
    skillVerification: {
      status: { type: String, enum: ['none', 'submitted', 'verified', 'rejected'], default: 'none' },
      verifiedAt: { type: Date },
    },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 }, // percentage 0-100

    // ─── Rate Signals ────────────────────────────────────────────────────────
    completionRate:     { type: Number, default: 0 },  // completions / assignments
    acceptanceRate:     { type: Number, default: 0 },  // acceptances / assignments
    rejectionRate:      { type: Number, default: 0 },  // rejections  / assignments
    cancellationRate:   { type: Number, default: 0 },  // cancellations / assignments
    complaintRate:      { type: Number, default: 0 },  // complaints / completions
    refundRate:         { type: Number, default: 0 },  // refunds / completions
    repeatCustomerRate: { type: Number, default: 0 },  // repeat / unique customers

    // ─── Rating Signals ──────────────────────────────────────────────────────
    averageRating: { type: Number, default: 0 },
    ratingBreakdown: {
      overall:        { type: Number, default: 0 },
      quality:        { type: Number, default: 0 },
      punctuality:    { type: Number, default: 0 },
      communication:  { type: Number, default: 0 },
      professionalism:{ type: Number, default: 0 },
      cleanliness:    { type: Number, default: 0 },
      valueForMoney:  { type: Number, default: 0 },
    },

    // ─── Time Signals ────────────────────────────────────────────────────────
    averageArrivalTimeMs:   { type: Number, default: 0 }, // ms from accepted → arrived
    averageResponseTimeMs:  { type: Number, default: 0 }, // ms from assigned → accepted
    averageCompletionTimeMs:{ type: Number, default: 0 }, // ms from started → completed

    // ─── Risk Signals ────────────────────────────────────────────────────────
    walletFlags: {
      unusualWithdrawal:  { type: Boolean, default: false },
      suspiciousTopup:    { type: Boolean, default: false },
    },
    fraudFlags: {
      otpAbuse:           { type: Boolean, default: false },
      reportedByCustomers:{ type: Number,  default: 0 },
      suspiciousPatterns: { type: Boolean, default: false },
    },
    adminWarnings: {
      count: { type: Number, default: 0 },
      lastWarningAt: { type: Date },
      reasons: [{ type: String }],
    },

    // ─── Account Metadata ────────────────────────────────────────────────────
    accountAge: { type: Number, default: 0 }, // days since registration

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Indexes
trustProfileSchema.index({ completionRate: -1 });
trustProfileSchema.index({ averageRating: -1 });


export default mongoose.model('TrustProfile', trustProfileSchema);
