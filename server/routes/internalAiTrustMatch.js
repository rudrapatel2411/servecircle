/**
 * routes/internalAiTrustMatch.js — Internal TrustMatch Intelligence Engine APIs
 *
 * All routes require admin authentication.
 *
 * POST /api/internal/ai/trustmatch              — Full TrustMatch pipeline for a booking
 * GET  /api/internal/ai/trustmatch/:bookingId   — Last TrustMatch result for a booking
 * GET  /api/internal/ai/trustmatch/worker/:workerId — Single worker TrustMatch evaluation
 * GET  /api/internal/ai/trustmatch/cache/stats  — Cache statistics
 * DELETE /api/internal/ai/trustmatch/cache      — Clear TrustMatch cache
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

import {
  runTrustMatch,
  runWorkerTrustMatch,
  clearTrustMatchCache,
  getTrustMatchCacheStats,
  TRUSTMATCH_EVENT_TYPES,
} from '../ai/trustmatch/trustMatchManager.js';

import { filterWorkers }                         from '../ai/trustmatch/workerFilterEngine.js';
import { scoreWorker }                           from '../ai/trustmatch/workerScoringEngine.js';
import { evaluateTrust }                         from '../ai/trustmatch/trustEngine.js';
import { buildPreferenceProfile }                from '../ai/trustmatch/customerPreferenceEngine.js';
import { RECOMMENDATION_LEVELS, SCORE_WEIGHTS }  from '../ai/trustmatch/recommendationEngine.js';

import { logEvent, EVENT_TYPES, ENTITY_TYPES }  from '../services/eventService.js';

import Booking          from '../models/Booking.js';
import User             from '../models/User.js';
import WorkerMetrics    from '../models/WorkerMetrics.js';
import TrustProfile     from '../models/TrustProfile.js';
import WorkerSkillHistory from '../models/WorkerSkillHistory.js';
import CustomerMetrics  from '../models/CustomerMetrics.js';
import CustomerBehaviour from '../models/CustomerBehaviour.js';

const router = express.Router();

// All routes require admin auth
router.use(protect, authorize('admin'));

// ─── POST /internal/ai/trustmatch ─────────────────────────────────────────────
/**
 * Run the full TrustMatch pipeline for a booking.
 * Body: { bookingId, options? }
 *   options.maxResults          — max workers to return (default 10)
 *   options.excludeFlagged      — exclude flagged workers (default true)
 *   options.serviceRadiusKm     — override service radius
 *   options.requireDocVerified  — require document verification
 *   options.bypassCache         — skip caches
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { bookingId, options = {}, bypassCache = false } = req.body || {};

    if (!bookingId) {
      throw new AppError('bookingId is required.', StatusCodes.BAD_REQUEST);
    }

    // Find booking
    const booking = await Booking.findOne({
      $or: [
        { bookingId },
        { _id: bookingId.length === 24 ? bookingId : undefined },
      ].filter(Boolean),
    }).lean();

    if (!booking) {
      throw new AppError(`Booking not found: ${bookingId}`, StatusCodes.NOT_FOUND);
    }

    const result = await runTrustMatch({
      booking,
      options,
      actor:      req.user,
      reqCtx:     req.reqCtx || {},
      bypassCache,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      ...result,
    });
  })
);

// ─── GET /internal/ai/trustmatch/worker/:workerId ────────────────────────────
/**
 * Evaluate a single worker against an optional booking context.
 * Query: ?bookingId=xxx
 */
router.get(
  '/worker/:workerId',
  asyncHandler(async (req, res) => {
    const { workerId } = req.params;
    const { bookingId } = req.query;

    const worker = await User.findById(workerId).lean();
    if (!worker || worker.role !== 'worker') {
      throw new AppError(`Worker not found: ${workerId}`, StatusCodes.NOT_FOUND);
    }

    let booking = null;
    if (bookingId) {
      booking = await Booking.findOne({ bookingId }).lean()
        ?? await Booking.findById(bookingId).lean();
    }

    const result = await runWorkerTrustMatch({
      worker,
      booking,
      actor:  req.user,
      reqCtx: req.reqCtx || {},
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      ...result,
    });
  })
);

// ─── GET /internal/ai/trustmatch/:bookingId ───────────────────────────────────
/**
 * Run a fresh TrustMatch evaluation for a specific bookingId (GET convenience).
 * Query: ?maxResults=5&excludeFlagged=true
 */
router.get(
  '/:bookingId',
  asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const maxResults    = parseInt(req.query.maxResults, 10) || 10;
    const excludeFlagged = req.query.excludeFlagged !== 'false';

    const booking = await Booking.findOne({ bookingId }).lean()
      ?? await Booking.findById(bookingId).lean();

    if (!booking) {
      throw new AppError(`Booking not found: ${bookingId}`, StatusCodes.NOT_FOUND);
    }

    const result = await runTrustMatch({
      booking,
      options: { maxResults, excludeFlagged },
      actor:   req.user,
      reqCtx:  req.reqCtx || {},
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      ...result,
    });
  })
);

// ─── GET /internal/ai/trustmatch/config/weights ──────────────────────────────
/**
 * Return current score weights and recommendation level thresholds.
 * Useful for admin transparency and future tuning UI.
 */
router.get(
  '/config/weights',
  asyncHandler(async (req, res) => {
    res.json({
      status: 'success',
      scoreWeights:          SCORE_WEIGHTS,
      recommendationLevels:  RECOMMENDATION_LEVELS,
      weightSum:             Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0),
    });
  })
);

// ─── GET /internal/ai/trustmatch/cache/stats ─────────────────────────────────
router.get(
  '/cache/stats',
  asyncHandler(async (req, res) => {
    const stats = getTrustMatchCacheStats();
    res.json({ status: 'success', cache: stats });
  })
);

// ─── DELETE /internal/ai/trustmatch/cache ────────────────────────────────────
router.delete(
  '/cache',
  asyncHandler(async (req, res) => {
    const before = getTrustMatchCacheStats();
    clearTrustMatchCache();
    const after  = getTrustMatchCacheStats();

    logEvent({
      eventType:  EVENT_TYPES.ADMIN_ACTION,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    req.user._id,
      actorRole:  'admin',
      metadata:   { action: 'TRUSTMATCH_CACHE_CLEARED', before, after },
      ...req.reqCtx,
    });

    res.json({ status: 'success', message: 'TrustMatch cache cleared.', before, after });
  })
);

export default router;
