/**
 * eventService.js — Phase 2 AI Data Foundation
 *
 * The ONLY way to create EventLog entries.
 * Routes must NEVER create EventLog records directly.
 *
 * Architecture:
 *   businessService → eventService.logEvent() → EventLog
 *
 * Design rules:
 *   - Fire-and-forget: log failures are caught and console.error'd, NOT rethrown
 *   - Never block the business operation on event logging
 *   - eventId is deterministic per request for idempotency
 */

import crypto from 'crypto';
import EventLog from '../models/EventLog.js';
import ActivityLog from '../models/ActivityLog.js';

// ─── Event Type Constants ─────────────────────────────────────────────────────
export const EVENT_TYPES = {
  // Booking lifecycle
  BOOKING_CREATED:     'BOOKING_CREATED',
  BOOKING_ASSIGNED:    'BOOKING_ASSIGNED',
  BOOKING_ACCEPTED:    'BOOKING_ACCEPTED',
  BOOKING_REJECTED:    'BOOKING_REJECTED',
  BOOKING_EN_ROUTE:    'BOOKING_EN_ROUTE',
  BOOKING_ARRIVED:     'BOOKING_ARRIVED',
  BOOKING_STARTED:     'BOOKING_STARTED',
  BOOKING_COMPLETED:   'BOOKING_COMPLETED',
  BOOKING_PAID:        'BOOKING_PAID',
  BOOKING_CLOSED:      'BOOKING_CLOSED',
  BOOKING_CANCELLED:   'BOOKING_CANCELLED',
  BOOKING_UPDATED:     'BOOKING_UPDATED',

  // OTP events
  OTP_GENERATED:       'OTP_GENERATED',
  OTP_VERIFIED:        'OTP_VERIFIED',
  OTP_FAILED:          'OTP_FAILED',
  OTP_LOCKED:          'OTP_LOCKED',
  OTP_REGENERATED:     'OTP_REGENERATED',

  // Review events
  REVIEW_ADDED:        'REVIEW_ADDED',
  REVIEW_EDITED:       'REVIEW_EDITED',
  REVIEW_DELETED:      'REVIEW_DELETED',
  REVIEW_RESTORED:     'REVIEW_RESTORED',

  // User events
  USER_REGISTERED:     'USER_REGISTERED',
  USER_LOGGED_IN:      'USER_LOGGED_IN',
  USER_LOGGED_OUT:     'USER_LOGGED_OUT',
  USER_PROFILE_UPDATED:'USER_PROFILE_UPDATED',
  USER_DELETED:        'USER_DELETED',
  USER_RESTORED:       'USER_RESTORED',
  USER_PASSWORD_CHANGED:'USER_PASSWORD_CHANGED',
  SUBSCRIPTION_CHANGED:'SUBSCRIPTION_CHANGED',

  // Worker events
  WORKER_VERIFIED:           'WORKER_VERIFIED',
  WORKER_REJECTED:           'WORKER_REJECTED',
  WORKER_STATUS_UPDATED:     'WORKER_STATUS_UPDATED',
  WORKER_SUSPENDED:          'WORKER_SUSPENDED',
  WORKER_QR_SCANNED:         'WORKER_QR_SCANNED',
  WORKER_VERIFICATION_FAILED:'WORKER_VERIFICATION_FAILED',
  ID_CARD_GENERATED:         'ID_CARD_GENERATED',
  QR_REGENERATED:            'QR_REGENERATED',

  // Service events
  SERVICE_CREATED:     'SERVICE_CREATED',
  SERVICE_UPDATED:     'SERVICE_UPDATED',
  SERVICE_DELETED:     'SERVICE_DELETED',
  SERVICE_TOGGLED:     'SERVICE_TOGGLED',

  // Wallet events
  WALLET_TOPUP:        'WALLET_TOPUP',
  WALLET_DEDUCTION:    'WALLET_DEDUCTION',

  // Complaint events
  COMPLAINT_CREATED:   'COMPLAINT_CREATED',
  COMPLAINT_UPDATED:   'COMPLAINT_UPDATED',
  COMPLAINT_RESOLVED:  'COMPLAINT_RESOLVED',

  // AI / ML events (Phase 3 — Inference Pipeline)
  AI_FEATURE_EXTRACTED:    'AI_FEATURE_EXTRACTED',
  AI_INFERENCE_COMPLETED:  'AI_INFERENCE_COMPLETED',
  AI_INFERENCE_FAILED:     'AI_INFERENCE_FAILED',
  
  // AI Problem & Vision Analysis events (Phase 4)
  AI_PROBLEM_ANALYZED:     'AI_PROBLEM_ANALYZED',
  AI_PROBLEM_FAILED:       'AI_PROBLEM_FAILED',
  AI_IMAGE_ANALYZED:       'AI_IMAGE_ANALYZED',
  AI_IMAGE_FAILED:         'AI_IMAGE_FAILED',
  AI_MULTIMODAL_ANALYZED:  'AI_MULTIMODAL_ANALYZED',
  AI_MULTIMODAL_FAILED:     'AI_MULTIMODAL_FAILED',

  // Enterprise AI Infrastructure events (Phase 4B)
  AI_REQUEST_STARTED:      'AI_REQUEST_STARTED',
  AI_REQUEST_COMPLETED:    'AI_REQUEST_COMPLETED',
  AI_REQUEST_FAILED:       'AI_REQUEST_FAILED',
  AI_CACHE_HIT:            'AI_CACHE_HIT',
  AI_CACHE_MISS:           'AI_CACHE_MISS',
  AI_RETRY:                'AI_RETRY',
  AI_TIMEOUT:              'AI_TIMEOUT',
  AI_QUOTA_WARNING:        'AI_QUOTA_WARNING',
  AI_ANALYSIS_STORED:      'AI_ANALYSIS_STORED',

  // Multimodal Pipeline events (Phase 3 Batch 3)
  MULTIMODAL_REQUEST:       'MULTIMODAL_REQUEST',
  IMAGE_CONTEXT_CREATED:    'IMAGE_CONTEXT_CREATED',
  VOICE_CONTEXT_CREATED:    'VOICE_CONTEXT_CREATED',
  TEXT_CONTEXT_CREATED:     'TEXT_CONTEXT_CREATED',
  PROBLEM_ANALYZED:         'PROBLEM_ANALYZED',
  SERVICE_RESOLVED:         'SERVICE_RESOLVED',
  URGENCY_CLASSIFIED:       'URGENCY_CLASSIFIED',
  RECOMMENDATION_GENERATED: 'RECOMMENDATION_GENERATED',
  MULTIMODAL_FAILED:        'MULTIMODAL_FAILED',

  // TrustMatch Intelligence Engine events (Phase 3 Batch 4)
  TRUSTMATCH_STARTED:       'TRUSTMATCH_STARTED',
  TRUSTMATCH_COMPLETED:     'TRUSTMATCH_COMPLETED',
  TRUSTMATCH_FAILED:        'TRUSTMATCH_FAILED',
  WORKER_RANKED:            'WORKER_RANKED',
  WORKER_FILTERED:          'WORKER_FILTERED',

  // Intelligence Suite events (Phase 3 Batch 5)
  FAIRPRICE_ANALYZED:     'FAIRPRICE_ANALYZED',
  DEMAND_ANALYZED:        'DEMAND_ANALYZED',
  FRAUD_ANALYZED:         'FRAUD_ANALYZED',
  ETA_PREDICTED:          'ETA_PREDICTED',
  CANCELLATION_ANALYZED:  'CANCELLATION_ANALYZED',
  INTELLIGENCE_COMPLETED: 'INTELLIGENCE_COMPLETED',
  INTELLIGENCE_FAILED:    'INTELLIGENCE_FAILED',

  // Admin events
  ADMIN_ACTION:        'ADMIN_ACTION',
};

// ─── Entity Type Constants ────────────────────────────────────────────────────
export const ENTITY_TYPES = {
  BOOKING:  'Booking',
  USER:     'User',
  REVIEW:   'Review',
  SERVICE:  'Service',
  WALLET:   'Wallet',
  COMPLAINT:'Complaint',
  OTP:      'OTP',
  SYSTEM:   'System',
};


// ─── logEvent ────────────────────────────────────────────────────────────────
/**
 * Log a single event to the EventLog collection.
 *
 * @param {object} payload
 * @param {string} payload.eventType      - EVENT_TYPES constant
 * @param {string} payload.entityType     - ENTITY_TYPES constant
 * @param {*}      payload.entityId       - MongoDB ObjectId of the entity
 * @param {*}      [payload.actorId]      - Who triggered the event
 * @param {string} [payload.actorRole]    - Role of the actor
 * @param {*}      [payload.bookingId]    - Related booking
 * @param {*}      [payload.customerId]   - Related customer
 * @param {*}      [payload.workerId]     - Related worker
 * @param {*}      [payload.serviceId]    - Related service
 * @param {string} [payload.previousState]
 * @param {string} [payload.currentState]
 * @param {object} [payload.metadata]
 * @param {string} [payload.requestId]
 * @param {string} [payload.ipAddress]
 * @param {string} [payload.userAgent]
 * @param {boolean}[payload.success]
 * @param {string} [payload.failureReason]
 * @returns {Promise<void>}  — fire-and-forget, never throws
 */
export async function logEvent(payload) {
  try {
    const eventId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    await EventLog.create({ eventId, ...payload });
  } catch (err) {
    // Event logging must never crash the application
    console.error('[EventService] Failed to log event:', err.message, payload?.eventType);
  }
}

// ─── logActivity ─────────────────────────────────────────────────────────────
/**
 * Log a user activity entry. Fire-and-forget.
 *
 * @param {object} payload
 * @param {*}      payload.userId
 * @param {string} payload.role
 * @param {string} payload.action
 * @param {string} [payload.module]
 * @param {*}      [payload.targetId]
 * @param {string} [payload.requestId]
 * @param {string} [payload.ipAddress]
 * @param {string} [payload.userAgent]
 * @param {number} [payload.duration]
 */
export async function logActivity(payload) {
  try {
    await ActivityLog.create(payload);
  } catch (err) {
    console.error('[EventService] Failed to log activity:', err.message);
  }
}

// ─── logBookingEvent ─────────────────────────────────────────────────────────
/**
 * Convenience wrapper for booking lifecycle events.
 * Extracts all IDs from the booking document automatically.
 *
 * @param {string} eventType
 * @param {object} booking   — Mongoose booking document (populated or plain)
 * @param {object} actor     — { _id, role }
 * @param {object} [reqCtx]  — { requestId, ipAddress, userAgent }
 * @param {object} [meta]    — Additional metadata
 */
export async function logBookingEvent(eventType, booking, actor, reqCtx = {}, meta = {}) {
  await logEvent({
    eventType,
    entityType: ENTITY_TYPES.BOOKING,
    entityId:   booking._id,
    actorId:    actor?._id,
    actorRole:  actor?.role,
    bookingId:  booking._id,
    customerId: booking.customer?._id || booking.customer,
    workerId:   booking.worker?._id   || booking.worker,
    previousState: meta.previousState,
    currentState:  booking.status,
    metadata: {
      bookingId: booking.bookingId,
      service:   booking.service,
      category:  booking.category,
      amount:    booking.amount,
      ...meta,
    },
    ...reqCtx,
    success: meta.success !== false,
    failureReason: meta.failureReason,
  });
}

// ─── logOtpEvent ─────────────────────────────────────────────────────────────
/**
 * Convenience wrapper for OTP events.
 */
export async function logOtpEvent(eventType, booking, actor, otpType, success, reqCtx = {}) {
  await logEvent({
    eventType,
    entityType: ENTITY_TYPES.OTP,
    entityId:   booking._id,
    actorId:    actor?._id,
    actorRole:  actor?.role,
    bookingId:  booking._id,
    customerId: booking.customer?._id || booking.customer,
    workerId:   booking.worker?._id   || booking.worker,
    metadata:   { otpType, bookingId: booking.bookingId },
    success,
    failureReason: success ? undefined : `${otpType} OTP verification failed`,
    ...reqCtx,
  });
}
