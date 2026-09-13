/**
 * WorkerGeoHistory.js — Phase 2 Batch 2
 *
 * Append-only geographic history per worker.
 * Each completed booking appends one record here.
 * Never overwrite — pure insert-only collection.
 */

import mongoose from 'mongoose';

const workerGeoHistorySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },

    // Customer address location (job site)
    location: {
      type:        { type: String, enum: ['Point'] },
      coordinates: [Number], // [lng, lat]
    },

    // Human-readable location info
    city:    { type: String, trim: true },
    area:    { type: String, trim: true },

    // Job context
    serviceCategory: { type: String, trim: true },
    service:         { type: String, trim: true },

    // Travel data (populated from worker last known location if available)
    travelDistanceKm: { type: Number }, // km from worker location to job
    travelDurationMs: { type: Number }, // ms

    timestamp: { type: Date, default: Date.now, required: true },
  },
  { timestamps: false }
);

// Block updates — geo history is append-only
const BLOCKED = ['update', 'updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne'];
BLOCKED.forEach((op) => {
  workerGeoHistorySchema.pre(op, function () {
    throw new Error('WorkerGeoHistory records are immutable — updates are not permitted.');
  });
});

// Indexes
workerGeoHistorySchema.index({ workerId: 1, timestamp: -1 });
workerGeoHistorySchema.index({ bookingId: 1 });
workerGeoHistorySchema.index({ city: 1, serviceCategory: 1 });
workerGeoHistorySchema.index({ location: '2dsphere' }, { sparse: true });

export default mongoose.model('WorkerGeoHistory', workerGeoHistorySchema);
