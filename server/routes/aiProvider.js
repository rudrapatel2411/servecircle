/**
 * server/routes/aiProvider.js — Phase 4 Batch 1
 *
 * REST endpoints for AI Provider Layer health and status.
 *
 * Endpoints:
 *   GET  /api/ai/health          — Live health check on active provider
 *   GET  /api/ai/status          — Cached health snapshot (no API call)
 *   GET  /api/ai/providers       — List all registered providers
 *   POST /api/ai/switch          — Hot-switch active provider (admin only)
 *   POST /api/ai/test/text       — Test text generation (admin only)
 *   POST /api/ai/test/parse      — Test ResponseParser JSON parsing
 */

import express from 'express';
import { protect, authorize }      from '../middleware/auth.js';
import { asyncHandler }            from '../middleware/asyncHandler.js';
import { AppError }                from '../middleware/errorHandler.js';
import { StatusCodes }             from 'http-status-codes';
import { AIProviderManager }       from '../ai/providers/AIProviderManager.js';
import { ResponseParser }          from '../ai/providers/ResponseParser.js';
import { PromptBuilder }           from '../ai/providers/PromptBuilder.js';

const router = express.Router();

// ─── GET /api/ai/health ─────────────────────────────────────────────────────
// Runs a live health probe against the active provider.
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const result = await AIProviderManager.health();
    const httpStatus = result.ready ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
    res.status(httpStatus).json({
      status: result.ready ? 'ok' : 'degraded',
      ai:     result,
      timestamp: new Date().toISOString(),
    });
  })
);

// ─── GET /api/ai/status ─────────────────────────────────────────────────────
// Returns the last cached health snapshot — no API call.
router.get(
  '/status',
  asyncHandler(async (req, res) => {
    const snapshot = AIProviderManager.getHealthSnapshot();
    res.json({
      status:        snapshot.ready ? 'ok' : 'not_ready',
      activeProvider: AIProviderManager.getActiveProviderName(),
      health:        snapshot,
      timestamp:     new Date().toISOString(),
    });
  })
);

// ─── GET /api/ai/providers ─────────────────────────────────────────────────
// List all registered providers and their status.
router.get(
  '/providers',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const providers = AIProviderManager.getRegisteredProviders();
    res.json({
      providers,
      active:    AIProviderManager.getActiveProviderName(),
      total:     providers.length,
    });
  })
);

// ─── POST /api/ai/switch ────────────────────────────────────────────────────
// Hot-switch the active provider (admin only).
router.post(
  '/switch',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { provider } = req.body || {};
    if (!provider) throw new AppError('provider name is required in request body', StatusCodes.BAD_REQUEST);

    await AIProviderManager.switchProvider(provider);
    const health = AIProviderManager.getHealthSnapshot();

    res.json({
      message:  `Provider switched to "${provider}" successfully.`,
      health,
    });
  })
);

// ─── POST /api/ai/test/text ─────────────────────────────────────────────────
// Test that the active provider can generate text. Admin only.
router.post(
  '/test/text',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { prompt = 'Respond with JSON: {"status": "ok", "message": "Gemini is working"}' } = req.body || {};

    const start = Date.now();
    const raw   = await AIProviderManager.generateText(prompt);
    const ms    = Date.now() - start;

    const parsed = ResponseParser.safeParse(raw);

    res.json({
      success:     true,
      provider:    AIProviderManager.getActiveProviderName(),
      prompt,
      raw,
      parsed:      parsed.data,
      parseOk:     parsed.success,
      latencyMs:   ms,
    });
  })
);

// ─── POST /api/ai/test/parse ────────────────────────────────────────────────
// Test the ResponseParser with a provided raw string. Admin only.
router.post(
  '/test/parse',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { raw, requiredFields = [] } = req.body || {};
    if (!raw) throw new AppError('raw string is required', StatusCodes.BAD_REQUEST);

    const result = ResponseParser.safeParse(raw, { requiredFields, context: 'admin-test' });
    res.json(result);
  })
);

export default router;
