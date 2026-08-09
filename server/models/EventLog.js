/**
 * EventLog.js — Phase 2 AI Data Foundation
 *
 * Immutable, append-only event log.
 * The single source of truth for all historical actions.
 *
 * NEVER update or delete EventLog records.
 * All writes go through eventService.logEvent().
 */

import mongoose from 'mongoose';

const eventLogSchema = new mongoose.Schema(
  {
    // Unique event identifier (UUID-style: timestamp + random)
    eventId: { type: String, required: true, unique: true },

    // What happened
    eventType: { type: String, required: true, trim: true }, // e.g. 'BOOKING_CREATED'

    // Which resource this event is about
    entityType: { type: String, required: true, trim: true }, // 'Booking' | 'User' | 'Review' | 'Service' etc.
    entityId:   { type: mongoose.Schema.Types.ObjectId },

    // Who triggered this event
    actorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String, trim: true }, // 'customer' | 'worker' | 'admin' | 'system'

    // Related entity IDs (for fast querying)
    bookingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    serviceId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    workerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // When this event occurred (authoritative timestamp)
    timestamp: { type: Date, default: Date.now, required: true },

    // State before and after (for state machine events)
    previousState: { type: String },
    currentState:  { type: String },

    // Arbitrary structured data specific to the event type
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // HTTP request context
    requestId:  { type: String },
    ipAddress:  { type: String },
    userAgent:  { type: String },
    deviceInfo: { type: mongoose.Schema.Types.Mixed },

    // Geographic context (if available)
    location: {
      type:        { type: String, enum: ['Point'] },
      coordinates: [Number], // [lng, lat]
    },

    // Outcome
    success:       { type: Boolean, default: true },
    failureReason: { type: String },
  },
  {
    // No updatedAt — events are immutable by design
    timestamps: { createdAt: 'timestamp', updatedAt: false },
    // Capped collection option not used because we need indexed queries
  }
);

// ─── Immutability enforcement ────────────────────────────────────────────────
// Block all update operations at the Mongoose middleware level.
const BLOCKED_OPS = [
  'update', 'updateOne', 'updateMany',
  'findOneAndUpdate', 'findOneAndReplace',
  'replaceOne',
];
BLOCKED_OPS.forEach((op) => {
  eventLogSchema.pre(op, function () {
    throw new Error('EventLog records are immutable — updates are not permitted.');
  });
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
eventLogSchema.index({ entityType: 1, entityId: 1 });
eventLogSchema.index({ bookingId: 1 });
eventLogSchema.index({ actorId: 1 });
eventLogSchema.index({ customerId: 1 });
eventLogSchema.index({ workerId: 1 });
eventLogSchema.index({ eventType: 1 });
eventLogSchema.index({ timestamp: -1 });
eventLogSchema.index({ 'location': '2dsphere' }, { sparse: true });

export default mongoose.model('EventLog', eventLogSchema);
