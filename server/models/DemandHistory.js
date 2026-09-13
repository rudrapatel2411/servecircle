/**
 * DemandHistory.js — Phase 2 Batch 2
 *
 * Hourly demand snapshot per city/area/service/category.
 * One record per (city, serviceCategory, date, hour).
 * Enables future demand forecasting models.
 *
 * Append-only: records are created once per time bucket.
 * Counts are incremented atomically.
 */

import mongoose from 'mongoose';

const demandHistorySchema = new mongoose.Schema(
  {
    // Location dimensions
    city:    { type: String, required: true, trim: true },
    area:    { type: String, trim: true }, // sub-city area/neighbourhood

    // Service dimensions
    serviceCategory: { type: String, required: true, trim: true },
    subCategory:     { type: String, trim: true },

    // Time dimensions
    date: { type: Date, required: true }, // start-of-day UTC
    hour: { type: Number, required: true, min: 0, max: 23 }, // 0-23

    // Booking Counts
    bookingCount:   { type: Number, default: 0 }, // created in this bucket
    completedCount: { type: Number, default: 0 },
    cancelledCount: { type: Number, default: 0 },
    emergencyCount: { type: Number, default: 0 },

    // Price signals
    averagePrice: { type: Number, default: 0 },
    _sumPrice:    { type: Number, default: 0 }, // for rolling avg

    // Timing signals
    averageArrivalTimeMs: { type: Number, default: 0 },
    _sumArrivalTimeMs:    { type: Number, default: 0 },

    // Worker availability signals
    assignedCount:   { type: Number, default: 0 }, // bookings that got workers
    unassignedCount: { type: Number, default: 0 }, // pending (no worker found)
  },
  { timestamps: false }
);

// Compound unique: one record per time bucket per location/service
demandHistorySchema.index(
  { city: 1, serviceCategory: 1, date: 1, hour: 1 },
  { unique: true }
);
demandHistorySchema.index({ date: -1 });
demandHistorySchema.index({ city: 1, date: -1 });
demandHistorySchema.index({ serviceCategory: 1, date: -1 });

export default mongoose.model('DemandHistory', demandHistorySchema);
