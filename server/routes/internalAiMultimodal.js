/**
 * routes/internalAiMultimodal.js — Internal Multimodal AI Pipeline APIs
 *
 * Pattern: Request → protect → authorize('admin') → Multimodal Pipeline → Response
 *
 * Endpoints:
 *   POST /api/internal/ai/context      — Build UnifiedContext from multimodal inputs
 *   POST /api/internal/ai/problem      — Analyze problem from UnifiedContext
 *   POST /api/internal/ai/service      — Resolve service from problem analysis
 *   POST /api/internal/ai/urgency      — Classify urgency from context
 *   POST /api/internal/ai/recommend    — Full pipeline: context → recommendation
 */

import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { runImageAnalysis, runMultimodalInference } from '../ai/inferenceService.js';

import { buildUnifiedContext, validateUnifiedContext } from '../ai/multimodal/contextBuilder.js';
import { analyzeProblem }                             from '../ai/multimodal/problemAnalyzer.js';
import { resolveService, getSupportedServices }       from '../ai/multimodal/serviceResolver.js';
import { classifyUrgency }                            from '../ai/multimodal/urgencyAnalyzer.js';
import { generateRecommendation }                     from '../ai/multimodal/recommendationPipeline.js';
import {
  runMultimodalPipeline,
  buildContext,
  clearMultimodalCache,
  getCacheStats,
  MULTIMODAL_EVENT_TYPES,
} from '../ai/multimodal/multimodalManager.js';

import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_IMAGE_SIZE_BYTES || String(20 * 1024 * 1024), 10) },
});

// Helper to safely parse JSON strings from form-data fields
function _safeJsonParse(val, fallback = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (err) {
    return fallback;
  }
}

// All multimodal internal routes require admin authentication
router.use(protect, authorize('admin'));

// ─── POST /internal/ai/context ────────────────────────────────────────────────
/**
 * Build a unified context from multimodal inputs.
 * Body: { text?, image?, voice?, bookingCtx?, customerCtx?, workerCtx? }
 */
router.post(
  '/context',
  asyncHandler(async (req, res) => {
    const { text, image, voice, bookingCtx, customerCtx, workerCtx } = req.body || {};

    if (!text && !image && !voice) {
      throw new AppError(
        'At least one input modality is required: text, image, or voice.',
        StatusCodes.BAD_REQUEST
      );
    }

    const unifiedContext = buildUnifiedContext({
      text,
      image,
      voice,
      bookingCtx:  bookingCtx  || {},
      customerCtx: customerCtx || {},
      workerCtx:   workerCtx   || {},
      requestCtx:  req.reqCtx  || {},
    });

    const validation = validateUnifiedContext(unifiedContext);

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.MULTIMODAL_REQUEST,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    req.user._id,
      actorRole:  'admin',
      metadata: {
        contextId:    unifiedContext.contextId,
        modalities:   unifiedContext.modalities.active,
        bookingId:    bookingCtx?.bookingId || null,
        customerId:   customerCtx?.customerId || null,
      },
      ...req.reqCtx,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      unifiedContext,
      validation,
    });
  })
);

// ─── POST /internal/ai/problem ────────────────────────────────────────────────
/**
 * Analyze problem from a UnifiedContext (pass full context or build inline).
 * Body: { unifiedContext? } OR { text?, image?, voice?, bookingCtx?, customerCtx? }
 */
router.post(
  '/problem',
  asyncHandler(async (req, res) => {
    const { unifiedContext: existingCtx, text, image, voice, bookingCtx, customerCtx, workerCtx } = req.body || {};

    let unifiedContext = existingCtx;

    if (!unifiedContext) {
      if (!text && !image && !voice) {
        throw new AppError(
          'Provide either a prebuilt unifiedContext or at least one modality (text, image, voice).',
          StatusCodes.BAD_REQUEST
        );
      }
      unifiedContext = buildUnifiedContext({
        text, image, voice,
        bookingCtx:  bookingCtx  || {},
        customerCtx: customerCtx || {},
        workerCtx:   workerCtx   || {},
        requestCtx:  req.reqCtx  || {},
      });
    }

    const problemAnalysis = analyzeProblem(unifiedContext);

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.PROBLEM_ANALYZED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    req.user._id,
      actorRole:  'admin',
      metadata: {
        contextId:       unifiedContext.contextId,
        problemCategory: problemAnalysis.problemCategory,
        confidence:      problemAnalysis.confidence,
      },
      ...req.reqCtx,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      problemAnalysis,
      unifiedContext,
    });
  })
);

// ─── POST /internal/ai/service ────────────────────────────────────────────────
/**
 * Resolve service from a problem analysis.
 * Body: { problemAnalysis? } OR full pipeline inputs
 */
router.post(
  '/service',
  asyncHandler(async (req, res) => {
    const { problemAnalysis: existingAnalysis, unifiedContext: existingCtx, text, image, voice, bookingCtx, customerCtx, workerCtx } = req.body || {};

    let problemAnalysis = existingAnalysis;
    let unifiedContext  = existingCtx;

    if (!problemAnalysis) {
      if (!unifiedContext) {
        if (!text && !image && !voice) {
          throw new AppError(
            'Provide problemAnalysis, unifiedContext, or at least one modality input.',
            StatusCodes.BAD_REQUEST
          );
        }
        unifiedContext = buildUnifiedContext({
          text, image, voice,
          bookingCtx:  bookingCtx  || {},
          customerCtx: customerCtx || {},
          workerCtx:   workerCtx   || {},
          requestCtx:  req.reqCtx  || {},
        });
      }
      problemAnalysis = analyzeProblem(unifiedContext);
    }

    const serviceResolution = resolveService(problemAnalysis);

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.SERVICE_RESOLVED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    req.user._id,
      actorRole:  'admin',
      metadata: {
        service:             serviceResolution.service,
        category:            serviceResolution.category,
        subCategory:         serviceResolution.subCategory,
        requiredWorkerSkill: serviceResolution.requiredWorkerSkill,
        resolved:            serviceResolution.resolved,
      },
      ...req.reqCtx,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      serviceResolution,
      problemAnalysis,
    });
  })
);

// ─── POST /internal/ai/urgency ────────────────────────────────────────────────
/**
 * Classify urgency from a UnifiedContext + optional problem/service analysis.
 * Body: { unifiedContext?, problemAnalysis?, serviceResolution? } OR inline inputs
 */
router.post(
  '/urgency',
  asyncHandler(async (req, res) => {
    const {
      unifiedContext: existingCtx,
      problemAnalysis: existingAnalysis,
      serviceResolution: existingResolution,
      text, image, voice, bookingCtx, customerCtx, workerCtx,
    } = req.body || {};

    let unifiedContext   = existingCtx;
    let problemAnalysis  = existingAnalysis;
    let serviceResolution= existingResolution;

    if (!unifiedContext) {
      if (!text && !image && !voice) {
        throw new AppError(
          'Provide unifiedContext or at least one modality input (text, image, voice).',
          StatusCodes.BAD_REQUEST
        );
      }
      unifiedContext = buildUnifiedContext({
        text, image, voice,
        bookingCtx:  bookingCtx  || {},
        customerCtx: customerCtx || {},
        workerCtx:   workerCtx   || {},
        requestCtx:  req.reqCtx  || {},
      });
    }

    if (!problemAnalysis) {
      problemAnalysis = analyzeProblem(unifiedContext);
    }

    if (!serviceResolution) {
      serviceResolution = resolveService(problemAnalysis);
    }

    const urgencyResult = classifyUrgency({ unifiedContext, problemAnalysis, serviceResolution });

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.URGENCY_CLASSIFIED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    req.user._id,
      actorRole:  'admin',
      metadata: {
        contextId:        unifiedContext.contextId,
        urgencyLevel:     urgencyResult.urgencyLevel,
        urgencyScore:     urgencyResult.urgencyScore,
        dispatchPriority: urgencyResult.dispatchPriority,
        slaHours:         urgencyResult.slaHours,
      },
      ...req.reqCtx,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      urgencyResult,
    });
  })
);

// ─── POST /internal/ai/recommend ─────────────────────────────────────────────
/**
 * Run the full multimodal pipeline and return recommendation.
 * Body: { text?, image?, voice?, bookingCtx?, customerCtx?, workerCtx?, bypassCache? }
 */
router.post(
  '/recommend',
  asyncHandler(async (req, res) => {
    const {
      text, image, voice,
      bookingCtx, customerCtx, workerCtx,
      bypassCache,
    } = req.body || {};

    if (!text && !image && !voice) {
      throw new AppError(
        'At least one input modality is required: text, image, or voice.',
        StatusCodes.BAD_REQUEST
      );
    }

    const result = await runMultimodalPipeline({
      text,
      image,
      voice,
      bookingCtx:  bookingCtx  || {},
      customerCtx: customerCtx || {},
      workerCtx:   workerCtx   || {},
      requestCtx:  req.reqCtx  || {},
      actor:       req.user,
      bypassCache: !!bypassCache,
    });

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.RECOMMENDATION_GENERATED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    req.user._id,
      actorRole:  'admin',
      metadata: {
        pipelineId:      result.pipelineId,
        contextId:       result.summary?.contextId,
        urgencyLevel:    result.summary?.urgencyLevel,
        resolvedService: result.summary?.resolvedService,
        confidence:      result.summary?.overallConfidence,
        latencyMs:       result.latencyMs,
        fromCache:       result._fromCache || false,
      },
      ...req.reqCtx,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      ...result,
    });
  })
);

// ─── GET /internal/ai/multimodal/services ────────────────────────────────────
/**
 * List all supported services in the service resolution taxonomy.
 */
router.get(
  '/supported-services',
  asyncHandler(async (req, res) => {
    const services = getSupportedServices();
    res.json({
      status: 'success',
      count:  services.length,
      services,
    });
  })
);

// ─── DELETE /internal/ai/multimodal/cache ────────────────────────────────────
/**
 * Clear the multimodal context cache.
 */
router.delete(
  '/cache',
  asyncHandler(async (req, res) => {
    const statsBefore = getCacheStats();
    clearMultimodalCache();
    const statsAfter  = getCacheStats();

    logEvent({
      eventType:  EVENT_TYPES.ADMIN_ACTION,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    req.user._id,
      actorRole:  'admin',
      metadata:   { action: 'MULTIMODAL_CACHE_CLEARED', statsBefore, statsAfter },
      ...req.reqCtx,
    });

    res.json({
      status: 'success',
      message: 'Multimodal context cache cleared.',
      statsBefore,
      statsAfter,
    });
  })
);

// ─── POST /internal/ai/image-analysis ───────────────────────────────────────
/**
 * Real Gemini Vision image problem analysis endpoint.
 * Accepts multipart/form-data ('image' file) or JSON body ({ image: base64 }).
 */
router.post(
  '/image-analysis',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    let imageData = null;
    let mimeType = 'image/jpeg';

    if (req.file) {
      imageData = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (req.body?.image) {
      imageData = String(req.body.image).replace(/^data:[^;]+;base64,/, '');
      mimeType = req.body.mimeType || 'image/jpeg';
    }

    if (!imageData) {
      throw new AppError(
        'An image file (multipart/form-data field "image") or base64 image string is required.',
        StatusCodes.BAD_REQUEST
      );
    }

    const serviceCategory     = req.body?.serviceCategory || '';
    const location            = req.body?.location || '';
    const customerDescription = req.body?.customerDescription || req.body?.text || '';

    const result = await runImageAnalysis({
      imageData,
      mimeType,
      serviceCategory,
      location,
      customerDescription,
      bookingId:  req.body?.bookingId,
      customerId: req.body?.customerId,
      workerId:   req.body?.workerId,
      actor:      req.user,
      reqCtx:     req.reqCtx || {},
    });

    res.status(StatusCodes.OK).json(result);
  })
);

// ─── POST /internal/ai/multimodal-analysis ──────────────────────────────────
/**
 * Real Gemini Vision Multimodal analysis endpoint.
 * Accepts multipart/form-data ('image' file + fields) or JSON body.
 */
router.post(
  '/multimodal-analysis',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    let imageData = null;
    let mimeType = 'image/jpeg';

    if (req.file) {
      imageData = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (req.body?.image) {
      imageData = String(req.body.image).replace(/^data:[^;]+;base64,/, '');
      mimeType = req.body.mimeType || 'image/jpeg';
    }

    const text            = req.body?.text || '';
    const bookingContext  = _safeJsonParse(req.body?.bookingContext, {});
    const customerContext = _safeJsonParse(req.body?.customerContext, {});
    const location        = req.body?.location || bookingContext?.location || customerContext?.address || '';

    if (!text && !imageData) {
      throw new AppError(
        'At least one input (text or image) is required for multimodal analysis.',
        StatusCodes.BAD_REQUEST
      );
    }

    const result = await runMultimodalInference({
      text,
      image: imageData ? { base64: imageData, mimeType } : null,
      bookingCtx:  bookingContext,
      customerCtx: customerContext,
      actor:       req.user,
      reqCtx:      req.reqCtx || {},
      bypassCache: req.body?.bypassCache === 'true' || req.body?.bypassCache === true,
    });

    res.status(StatusCodes.OK).json(result);
  })
);

// ─── GET /internal/ai/multimodal/cache/stats ─────────────────────────────────
/**
 * Get multimodal cache statistics.
 */
router.get(
  '/cache/stats',
  asyncHandler(async (req, res) => {
    const stats = getCacheStats();
    res.json({ status: 'success', cache: stats });
  })
);

export default router;
