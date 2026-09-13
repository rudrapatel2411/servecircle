/**
 * CustomerMetrics.js — Phase 2 AI Data Foundation
 *
 * One document per customer. Tracks behavioural patterns automatically.
 * metricsService is the only writer — never update from routes.
 */

import mongoose from 'mongoose';

const customerMetricsSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ─── Booking Counters ────────────────────────────────────────────────────
    totalBookings:     { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    emergencyBookings: { type: Number, default: 0 },

    // ─── Spend Analysis ──────────────────────────────────────────────────────
    totalSpend:       { type: Number, default: 0 },   // in rupees
    avgSpendPerJob:   { type: Number, default: 0 },
    highestSpend:     { type: Number, default: 0 },
    lowestSpend:      { type: Number, default: 0 },

    // ─── Frequency ───────────────────────────────────────────────────────────
    firstBookingAt:   { type: Date },
    lastBookingAt:    { type: Date },
    avgDaysBetweenBookings: { type: Number, default: 0 },

    // ─── Category Preferences ────────────────────────────────────────────────
    favoriteCategories: [
      {
        category: { type: String },
        count:    { type: Number, default: 0 },
      },
    ],

    // ─── Worker Preferences ──────────────────────────────────────────────────
    preferredWorkers: [
      {
        workerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        bookingsCount: { type: Number, default: 0 },
      },
    ],

    // ─── Review Behaviour ────────────────────────────────────────────────────
    totalReviews:     { type: Number, default: 0 },
    avgRatingGiven:   { type: Number, default: 0 },
    _sumRatingGiven:  { type: Number, default: 0 }, // for rolling average

    // ─── Retention Signals ───────────────────────────────────────────────────
    isRepeatCustomer: { type: Boolean, default: false }, // >1 completed booking
    repeatServiceCount: { type: Number, default: 0 },   // same service booked again

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

customerMetricsSchema.index({ totalSpend: -1 });
customerMetricsSchema.index({ totalBookings: -1 });
customerMetricsSchema.index({ lastBookingAt: -1 });


export default mongoose.model('CustomerMetrics', customerMetricsSchema);
