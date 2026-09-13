/**
 * routes/internalAiIntelligence.js — Internal Intelligence Suite APIs
 *
 * All routes require admin authentication.
 * All logic is routed through intelligenceManager or engine functions (no business logic in routes).
 *
 * Endpoints:
 *   POST /api/internal/ai/intelligence    — Full unified intelligence report for a booking
 *   POST /api/internal/ai/fair-price      — FairPrice estimation
 *   POST /api/internal/ai/demand          — Demand analysis
 *   POST /api/internal/ai/fraud           — Fraud risk analysis
 *   POST /api/internal/ai/eta             — ETA prediction
 *   POST /api/internal/ai/cancellation    — Cancellation risk prediction
 *   GET  /api/internal/ai/intelligence/health — Suite health status
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

import {
  runUnifiedIntelligence,
  runFairPriceOnly,
  runDemandOnly,
  runFraudOnly,
  runEtaOnly,
  runCancellationOnly,
  getSuiteHealth,
  clearIntelligenceCache,
} from '../ai/intelligence/intelligenceManager.js';

import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Protect all internal intelligence routes with Admin role auth
router.use(protect, authorize('admin'));

// ─── GET /internal/ai/intelligence/health ────────────────────────────────────
/**
 * Suite Health Status
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const healthStatus = getSuiteHealth();
    res.status(StatusCodes.OK).json({
      status: 'success',
      ...healthStatus,
    });
  })
);

// ─── POST /internal/ai/intelligence ──────────────────────────────────────────
/**
 * Run full Unified Intelligence Suite for a booking.
 * Body: { bookingId, requestMeta?, bypassCache? }
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { bookingId, requestMeta = {}, bypassCache = false } = req.body || {};

    if (!bookingId) {
      throw new AppError('bookingId is required.', StatusCodes.BAD_REQUEST);
    }

    const report = await runUnifiedIntelligence({
      booking: bookingId,
      requestMeta,
      actor:   req.user,
      reqCtx:  req.reqCtx || {},
      bypassCache,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      ...report,
    });
  })
);

// ─── POST /internal/ai/fair-price ────────────────────────────────────────────
/**
 * Estimate FairPrice directly.
 * Body: { service, category, subCategory, basePrice, historicalPrices, distanceKm, workerTier, isEmergency, scheduledDate }
 */
router.post(
  '/fair-price',
  asyncHandler(async (req, res) => {
    const params = req.body || {};
    const result = runFairPriceOnly(params);

    res.status(StatusCodes.OK).json({
      status: 'success',
      fairPrice: result,
    });
  })
);

// ─── POST /internal/ai/demand ────────────────────────────────────────────────
/**
 * Analyze Demand directly.
 * Body: { currentBookingsCount, city, area, serviceCategory, time, dayOfWeek }
 */
router.post(
  '/demand',
  asyncHandler(async (req, res) => {
    const params = req.body || {};
    const result = runDemandOnly(params);

    res.status(StatusCodes.OK).json({
      status: 'success',
      demandAnalysis: result,
    });
  })
);

// ─── POST /internal/ai/fraud ─────────────────────────────────────────────────
/**
 * Analyze Fraud risk directly.
 * Body: { customer, worker, customerMetrics, trustProfile, booking, recentBookings, requestMeta }
 */
router.post(
  '/fraud',
  asyncHandler(async (req, res) => {
    const params = req.body || {};
    const result = runFraudOnly(params);

    res.status(StatusCodes.OK).json({
      status: 'success',
      fraudAnalysis: result,
    });
  })
);

// ─── POST /internal/ai/eta ───────────────────────────────────────────────────
/**
 * Predict ETA directly.
 * Body: { distanceKm, historicalArrivalTimeMs, workerResponseHistoryMs, isEmergency, scheduledDate }
 */
router.post(
  '/eta',
  asyncHandler(async (req, res) => {
    const params = req.body || {};
    const result = runEtaOnly(params);

    res.status(StatusCodes.OK).json({
      status: 'success',
      etaPrediction: result,
    });
  })
);

// ─── POST /internal/ai/cancellation ─────────────────────────────────────────
/**
 * Predict Cancellation risk directly.
 * Body: { workerHistory, customerHistory, isEmergency, scheduledDate, createdAt }
 */
router.post(
  '/cancellation',
  asyncHandler(async (req, res) => {
    const params = req.body || {};
    const result = runCancellationOnly(params);

    res.status(StatusCodes.OK).json({
      status: 'success',
      cancellationPrediction: result,
    });
  })
);

// ─── DELETE /internal/ai/intelligence/cache ──────────────────────────────────
/**
 * Clear Intelligence Cache
 */
router.delete(
  '/cache',
  asyncHandler(async (req, res) => {
    clearIntelligenceCache();
    logEvent({
      eventType:  EVENT_TYPES.ADMIN_ACTION,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    req.user._id,
      actorRole:  'admin',
      metadata:   { action: 'INTELLIGENCE_CACHE_CLEARED' },
      ...req.reqCtx,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Intelligence report cache cleared.',
    });
  })
);

export default router;
