/**
 * CustomerBehaviour.js — Phase 2 Batch 2
 *
 * Deep behavioural signal collection per customer.
 * One document per customer (upsert pattern).
 * Updated automatically on booking, review, and cancellation events.
 */

import mongoose from 'mongoose';

const customerBehaviourSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ─── Booking Frequency ────────────────────────────────────────────────────
    bookingFrequency: {
      weekly:   { type: Number, default: 0 }, // avg bookings per week (rolling 90 days)
      monthly:  { type: Number, default: 0 }, // avg bookings per month
    },

    // ─── Time Preferences ─────────────────────────────────────────────────────
    preferredTime: {
      morning:   { type: Number, default: 0 }, // 06:00-12:00
      afternoon: { type: Number, default: 0 }, // 12:00-17:00
      evening:   { type: Number, default: 0 }, // 17:00-21:00
      night:     { type: Number, default: 0 }, // 21:00-06:00
    },

    // ─── Day Preferences ──────────────────────────────────────────────────────
    preferredDays: {
      monday:    { type: Number, default: 0 },
      tuesday:   { type: Number, default: 0 },
      wednesday: { type: Number, default: 0 },
      thursday:  { type: Number, default: 0 },
      friday:    { type: Number, default: 0 },
      saturday:  { type: Number, default: 0 },
      sunday:    { type: Number, default: 0 },
    },

    // ─── Category Preferences ─────────────────────────────────────────────────
    preferredCategories: [
      {
        category: { type: String },
        count:    { type: Number, default: 0 },
        lastUsed: { type: Date },
      },
    ],

    // ─── Worker Preferences ───────────────────────────────────────────────────
    preferredWorkers: [
      {
        workerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        count:       { type: Number, default: 0 },
        avgRatingGiven: { type: Number, default: 0 },
      },
    ],

    // ─── Budget Signals ───────────────────────────────────────────────────────
    averageBudget: { type: Number, default: 0 },
    minBudget:     { type: Number, default: 0 },
    maxBudget:     { type: Number, default: 0 },

    // ─── Emergency Usage ──────────────────────────────────────────────────────
    emergencyUsage: {
      count:    { type: Number, default: 0 },
      rate:     { type: Number, default: 0 }, // emergencies / total
    },

    // ─── Repeat Bookings ──────────────────────────────────────────────────────
    repeatBookings: {
      sameServiceCount:  { type: Number, default: 0 }, // same service re-booked
      sameWorkerCount:   { type: Number, default: 0 }, // same worker re-booked
    },

    // ─── Cancellation Pattern ─────────────────────────────────────────────────
    cancellationPattern: {
      total:        { type: Number, default: 0 },
      rate:         { type: Number, default: 0 }, // cancellations / total bookings
      commonReason: { type: String },
      // Time-of-cancel pattern (minutes before scheduled time)
      avgCancelLeadTimeMs: { type: Number, default: 0 },
    },

    // ─── Review Pattern ───────────────────────────────────────────────────────
    reviewPattern: {
      totalReviews:  { type: Number, default: 0 },
      reviewRate:    { type: Number, default: 0 }, // reviews / completions
      avgRatingGiven:{ type: Number, default: 0 },
      tendencyToRate:{ type: String, enum: ['always', 'sometimes', 'rarely', 'never'], default: 'never' },
    },

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

customerBehaviourSchema.index({ customerId: 1 }, { unique: true });
customerBehaviourSchema.index({ 'emergencyUsage.rate': -1 });
customerBehaviourSchema.index({ averageBudget: -1 });

export default mongoose.model('CustomerBehaviour', customerBehaviourSchema);
