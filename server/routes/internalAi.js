/**
 * routes/internalAi.js — Internal AI Infrastructure APIs
 *
 * Pattern: Request → protect → authorize('admin') → AI Module → Response
 *
 * Endpoints:
 *   GET  /api/internal/ai/models                  — List all registered AI models
 *   GET  /api/internal/ai/models/:name            — Get model metadata
 *   GET  /api/internal/ai/models/:name/health     — Get model health status
 *   POST /api/internal/ai/models/:name/predict    — Direct model prediction
 *   POST /api/internal/ai/extract-features        — Extract raw feature vector
 *   POST /api/internal/ai/validate-features       — Validate features against model schema
 *   POST /api/internal/ai/inference                 — Run full inference pipeline
 *   POST /api/internal/ai/explain                 — Generate explainability breakdown
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { extractFeatures } from '../ai/featureExtractor.js';
import { loadModel, validateModelFeatures, getModelHealth, loadModelInstance } from '../ai/modelManager.js';
import { runInference, runProblemAnalysis } from '../ai/inferenceService.js';
import { runDirectPrediction } from '../ai/predictionEngine.js';
import { generateExplanation } from '../ai/explainabilityService.js';
import { getModel, listModels } from '../ai/modelRegistry.js';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';

const router = express.Router();

// Protected internal route group: Admin / System internal only
router.use(protect, authorize('admin'));

// GET /internal/ai/models — List registered models & metadata
router.get(
  '/models',
  asyncHandler(async (req, res) => {
    const models = listModels();
    res.json({ count: models.length, models });
  })
);

// GET /internal/ai/models/:name — Get single model metadata
router.get(
  '/models/:name',
  asyncHandler(async (req, res) => {
    const { name } = req.params;
    const model = getModel(name);
    if (!model) {
      throw new AppError(`Model "${name}" is not registered.`, StatusCodes.NOT_FOUND);
    }

    const instance = await loadModelInstance(name);
    const liveMetadata = instance.getMetadata();

    res.json({
      status: 'success',
      model: {
        ...model,
        supportedFeatures: liveMetadata.supportedFeatures,
      },
    });
  })
);

// GET /internal/ai/models/:name/health — Model health check
router.get(
  '/models/:name/health',
  asyncHandler(async (req, res) => {
    const { name } = req.params;
    const health = await getModelHealth(name);

    res.json({
      status: 'success',
      health,
    });
  })
);

// POST /internal/ai/models/:name/predict — Direct model prediction
router.post(
  '/models/:name/predict',
  asyncHandler(async (req, res) => {
    const { name } = req.params;
    const { input, bookingId, workerId, customerId, serviceName } = req.body || {};

    loadModel(name);

    let predictionInput = input;
    if (!predictionInput) {
      predictionInput = await extractFeatures({
        bookingId,
        workerId,
        customerId,
        serviceName,
      });
    }

    const result = await runDirectPrediction(name, predictionInput);

    logEvent({
      eventType: EVENT_TYPES.AI_INFERENCE_COMPLETED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId: req.user._id,
      actorRole: 'admin',
      metadata: {
        modelName: name,
        predictionId: result.predictionId,
        source: 'direct_predict',
      },
      ...req.reqCtx,
    });

    res.json({
      status: 'success',
      ...result,
    });
  })
);

// POST /internal/ai/extract-features — Feature extraction endpoint
router.post(
  '/extract-features',
  asyncHandler(async (req, res) => {
    const { bookingId, workerId, customerId, serviceName, bypassCache } = req.body || {};

    const featureVector = await extractFeatures({
      bookingId,
      workerId,
      customerId,
      serviceName,
      bypassCache,
    });

    logEvent({
      eventType: EVENT_TYPES.AI_FEATURE_EXTRACTED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId: req.user._id,
      actorRole: 'admin',
      metadata: { bookingId, workerId, customerId, serviceName },
      ...req.reqCtx,
    });

    res.json({
      status: 'success',
      featureVector,
    });
  })
);

// POST /internal/ai/validate-features — Validate feature vector against model
router.post(
  '/validate-features',
  asyncHandler(async (req, res) => {
    const { modelName, bookingId, workerId, customerId, serviceName } = req.body || {};

    if (!modelName) {
      throw new AppError('modelName is required for feature validation', StatusCodes.BAD_REQUEST);
    }

    const model = loadModel(modelName);
    const featureVector = await extractFeatures({ bookingId, workerId, customerId, serviceName });
    const validation = validateModelFeatures(model, featureVector);

    res.json({
      status: 'success',
      modelName,
      validation,
    });
  })
);

// POST /internal/ai/inference — Execute full standardized inference pipeline
router.post(
  '/inference',
  asyncHandler(async (req, res) => {
    const { modelName, bookingId, workerId, customerId, serviceName } = req.body || {};

    if (!modelName) {
      throw new AppError('modelName is required for inference', StatusCodes.BAD_REQUEST);
    }

    const result = await runInference({
      modelName,
      bookingId,
      workerId,
      customerId,
      serviceName,
      actor: req.user,
      reqCtx: req.reqCtx,
    });

    res.json(result);
  })
);

// POST /internal/ai/explain — Generate explainability analysis
router.post(
  '/explain',
  asyncHandler(async (req, res) => {
    const { modelName, bookingId, workerId, customerId, serviceName } = req.body || {};

    if (!modelName) {
      throw new AppError('modelName is required for explainability', StatusCodes.BAD_REQUEST);
    }

    const result = await runInference({
      modelName,
      bookingId,
      workerId,
      customerId,
      serviceName,
      actor: req.user,
      reqCtx: req.reqCtx,
    });

    res.json({
      status: 'success',
      explainability: result.explainability,
    });
  })
);

// POST /internal/ai/problem-analysis — Real text intelligence
router.post(
  '/problem-analysis',
  asyncHandler(async (req, res) => {
    const { text, bookingId, customerId, workerId } = req.body || {};

    if (!text) {
      throw new AppError('text is required for problem analysis', StatusCodes.BAD_REQUEST);
    }

    const result = await runProblemAnalysis({
      text,
      bookingId,
      customerId,
      workerId,
      actor: req.user,
      reqCtx: req.reqCtx,
    });

    res.json(result);
  })
);

// ─── Phase 4B: Enterprise Admin APIs ──────────────────────────────────────────

import { AIUsageService }  from '../ai/services/aiUsageService.js';
import { AIHealthService } from '../ai/services/aiHealthService.js';
import { SmartCache }      from '../ai/smartCache.js';
import { AIProviderManager } from '../ai/providers/AIProviderManager.js';
import { ProviderRegistry } from '../ai/providers/ProviderRegistry.js';

// GET /api/internal/ai/analytics — Dashboard analytics & metrics
router.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    const analytics = await AIUsageService.getDashboardMetrics();
    res.json({
      status: 'success',
      analytics,
    });
  })
);

// GET /api/internal/ai/health — Infrastructure health monitoring snapshot
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const health = await AIHealthService.getHealthStatus();
    res.json({
      status: 'success',
      health,
    });
  })
);

// GET /api/internal/ai/history — Historical AI execution audit trail
router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const { feature, provider, bookingId, customerId, status, page, limit } = req.query;
    const historyData = await AIUsageService.getHistory({
      feature,
      provider,
      bookingId,
      customerId,
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
    res.json({
      status: 'success',
      ...historyData,
    });
  })
);

// GET /api/internal/ai/cost — Financial token cost analysis
router.get(
  '/cost',
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const costData = await AIUsageService.getCostAnalytics({ startDate, endDate });
    res.json({
      status: 'success',
      cost: costData,
    });
  })
);

// GET /api/internal/ai/cache — SmartCache statistics
router.get(
  '/cache',
  asyncHandler(async (req, res) => {
    const stats = SmartCache.getStats();
    res.json({
      status: 'success',
      cacheStats: stats,
    });
  })
);

// DELETE /api/internal/ai/cache — Flush SmartCache
router.delete(
  '/cache',
  asyncHandler(async (req, res) => {
    const clearedCount = SmartCache.clear();
    res.json({
      status: 'success',
      message: `Flushed ${clearedCount} item(s) from AI SmartCache.`,
      clearedCount,
    });
  })
);

// GET /api/internal/ai/providers — AI Providers status & registry info
router.get(
  '/providers',
  asyncHandler(async (req, res) => {
    const activeProvider = AIProviderManager.getActiveProviderName() || 'gemini';
    const activeHealth   = AIProviderManager.getHealthSnapshot();
    const registered     = ProviderRegistry.listRegisteredProviders();

    res.json({
      status: 'success',
      activeProvider,
      health: activeHealth,
      registeredProviders: registered,
    });
  })
);

export default router;
