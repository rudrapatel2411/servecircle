/**
 * ActivityLog.js — Phase 2 AI Data Foundation
 *
 * Per-user activity tracking. Records what users do in the app.
 * Different from EventLog: ActivityLog is about behaviour patterns,
 * not system-state transitions.
 *
 * TTL index auto-purges entries older than 90 days.
 */

import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role:      { type: String, required: true }, // 'customer' | 'worker' | 'admin'

    // Human-readable action label
    action:    { type: String, required: true, trim: true }, // e.g. 'VIEW_BOOKING', 'SEARCH_SERVICE'

    // Which feature area this action belongs to
    module:    { type: String, trim: true }, // e.g. 'bookings', 'services', 'wallet'

    // Optional reference to the document being acted on
    targetId:  { type: mongoose.Schema.Types.ObjectId },
    targetRef: { type: String }, // Collection name of targetId

    // When the action happened
    timestamp: { type: Date, default: Date.now, index: true },

    // How long the action took (ms) — for latency analysis
    duration:  { type: Number },

    // Client environment
    device:    { type: String }, // 'mobile' | 'tablet' | 'desktop'
    platform:  { type: String }, // 'ios' | 'android' | 'web'
    browser:   { type: String },
    userAgent: { type: String },

    // IP-derived location (city-level, not GPS)
    location: {
      country: { type: String },
      city:    { type: String },
    },

    // HTTP context
    requestId: { type: String },
    ipAddress: { type: String },
  },
  {
    timestamps: false, // uses custom 'timestamp' field
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ role: 1, action: 1 });
activityLogSchema.index({ module: 1 });
// TTL: auto-delete entries older than 90 days (field index already defined in schema)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7_776_000 });


export default mongoose.model('ActivityLog', activityLogSchema);
