/**
 * server/ai/multimodal/multimodalManager.js — Multimodal Pipeline Orchestrator
 *
 * The single entry point for all multimodal AI processing.
 * Orchestrates the full pipeline:
 *
 *   Input (text/image/voice) →
 *   Context Builder →
 *   Problem Analyzer →
 *   Service Resolver →
 *   Urgency Analyzer →
 *   Recommendation Pipeline →
 *   Unified Output
 *
 * Implements caching, stateless processing, and automatic EventLog integration.
 *
 * Integration:
 *   - Plugs into InferenceService via runMultimodalInference()
 *   - Logs all events via EventLog
 */

import { buildUnifiedContext, validateUnifiedContext } from './contextBuilder.js';
import { analyzeProblem }       from './problemAnalyzer.js';
import { resolveService }       from './serviceResolver.js';
import { classifyUrgency }      from './urgencyAnalyzer.js';
import { generateRecommendation } from './recommendationPipeline.js';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../../services/eventService.js';
import { AIProviderManager } from '../providers/AIProviderManager.js';

// ─── Multimodal Event Types ───────────────────────────────────────────────────
// These extend the base EVENT_TYPES defined in eventService.js
export const MULTIMODAL_EVENT_TYPES = {
  MULTIMODAL_REQUEST:       'MULTIMODAL_REQUEST',
  IMAGE_CONTEXT_CREATED:    'IMAGE_CONTEXT_CREATED',
  VOICE_CONTEXT_CREATED:    'VOICE_CONTEXT_CREATED',
  TEXT_CONTEXT_CREATED:     'TEXT_CONTEXT_CREATED',
  PROBLEM_ANALYZED:         'PROBLEM_ANALYZED',
  SERVICE_RESOLVED:         'SERVICE_RESOLVED',
  URGENCY_CLASSIFIED:       'URGENCY_CLASSIFIED',
  RECOMMENDATION_GENERATED: 'RECOMMENDATION_GENERATED',
  MULTIMODAL_FAILED:        'MULTIMODAL_FAILED',
};

// ─── In-memory context cache ──────────────────────────────────────────────────
const contextCache = new Map();
const CACHE_TTL_MS   = 60_000; // 60 seconds
const MAX_CACHE_SIZE = 500;

function _getCached(key) {
  const item = contextCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    contextCache.delete(key);
    return null;
  }
  return item.data;
}

function _setCached(key, data) {
  if (contextCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = contextCache.keys().next().value;
    contextCache.delete(oldestKey);
  }
  contextCache.set(key, { timestamp: Date.now(), data });
}

function _buildCacheKey(params) {
  const { text, bookingId, customerId, category } = params;
  const textHash = text ? text.slice(0, 50).replace(/\s+/g, '_') : '';
  return `mmgr_${bookingId || ''}_${customerId || ''}_${category || ''}_${textHash}`;
}

// ─── Core Pipeline ────────────────────────────────────────────────────────────

/**
 * Run the full multimodal AI pipeline.
 *
 * @param {object} params
 * @param {string|object} [params.text]         - Text input
 * @param {object}        [params.image]        - Image input
 * @param {object}        [params.voice]        - Voice/audio input
 * @param {object}        [params.bookingCtx]   - Booking context
 * @param {object}        [params.customerCtx]  - Customer context
 * @param {object}        [params.workerCtx]    - Worker context
 * @param {object}        [params.requestCtx]   - HTTP request context
 * @param {object}        [params.actor]        - Requesting user { _id, role }
 * @param {boolean}       [params.bypassCache]  - Skip cache lookup
 * @returns {Promise<object>} Full multimodal pipeline result
 */
export async function runMultimodalPipeline({
  text,
  image,
  voice,
  bookingCtx   = {},
  customerCtx  = {},
  workerCtx    = {},
  requestCtx   = {},
  actor        = {},
  bypassCache  = false,
} = {}) {
  const startTime = Date.now();
  const pipelineId = _generatePipelineId();

  // ── Cache check ──
  const cacheKey = _buildCacheKey({ text, bookingId: bookingCtx.bookingId, customerId: customerCtx.customerId, category: bookingCtx.category });
  if (!bypassCache && !image && !voice) {
    const cached = _getCached(cacheKey);
    if (cached) {
      return { ...cached, _fromCache: true };
    }
  }

  // ── Step 0: Log pipeline request ──
  logEvent({
    eventType:  MULTIMODAL_EVENT_TYPES.MULTIMODAL_REQUEST,
    entityType: ENTITY_TYPES.SYSTEM,
    actorId:    actor._id,
    actorRole:  actor.role || 'system',
    metadata: {
      pipelineId,
      modalities: {
        hasText:  !!text,
        hasImage: !!image,
        hasVoice: !!voice,
      },
      bookingId:  bookingCtx.bookingId || null,
      customerId: customerCtx.customerId || null,
    },
    ...requestCtx,
  });

  try {
    // ── Step 1: Build Unified Context ──
    const unifiedContext = buildUnifiedContext({
      text,
      image,
      voice,
      bookingCtx,
      customerCtx,
      workerCtx,
      requestCtx,
    });

    const contextValidation = validateUnifiedContext(unifiedContext);

    // Log modality-specific context creation events
    if (unifiedContext.modalities.hasText) {
      logEvent({
        eventType:  MULTIMODAL_EVENT_TYPES.TEXT_CONTEXT_CREATED,
        entityType: ENTITY_TYPES.SYSTEM,
        actorId:    actor._id,
        actorRole:  actor.role || 'system',
        metadata: {
          pipelineId,
          contextId:    unifiedContext.contextId,
          wordCount:    unifiedContext.attachments?.text?.wordCount || 0,
          language:     unifiedContext.language,
          isValid:      unifiedContext.attachments?.text?.isValid,
        },
        ...requestCtx,
      });
    }

    if (unifiedContext.modalities.hasImage) {
      logEvent({
        eventType:  MULTIMODAL_EVENT_TYPES.IMAGE_CONTEXT_CREATED,
        entityType: ENTITY_TYPES.SYSTEM,
        actorId:    actor._id,
        actorRole:  actor.role || 'system',
        metadata: {
          pipelineId,
          contextId: unifiedContext.contextId,
          mimeType:  unifiedContext.attachments?.image?.metadata?.format?.mimeType,
          hasGps:    !!unifiedContext.attachments?.image?.metadata?.gps,
          isValid:   unifiedContext.attachments?.image?.isValid,
        },
        ...requestCtx,
      });
    }

    if (unifiedContext.modalities.hasVoice) {
      logEvent({
        eventType:  MULTIMODAL_EVENT_TYPES.VOICE_CONTEXT_CREATED,
        entityType: ENTITY_TYPES.SYSTEM,
        actorId:    actor._id,
        actorRole:  actor.role || 'system',
        metadata: {
          pipelineId,
          contextId:       unifiedContext.contextId,
          durationSeconds: unifiedContext.attachments?.voice?.metadata?.audio?.durationSeconds,
          format:          unifiedContext.attachments?.voice?.metadata?.format?.mimeType,
          isValid:         unifiedContext.attachments?.voice?.isValid,
        },
        ...requestCtx,
      });
    }

    // ── Step 2: Real Gemini Vision Multimodal Inference (ONE Request) ──
    let aiAnalysis = null;
    try {
      const rawImage = image?.base64 || (typeof image === 'string' ? image : null);
      const mimeType = image?.mimeType || 'image/jpeg';
      const textStr  = typeof text === 'string' ? text : (text?.content || text?.description || '');

      aiAnalysis = await AIProviderManager.analyzeMultimodalProblem({
        text: textStr,
        image: rawImage,
        mimeType,
        bookingContext: bookingCtx,
        customerContext: customerCtx,
        location: unifiedContext.location?.city || bookingCtx?.location || customerCtx?.address || '',
        serviceHistory: customerCtx?.serviceHistory || [],
        customerLanguage: unifiedContext.language || customerCtx?.preferredLanguage || 'English',
      });

      logEvent({
        eventType:  EVENT_TYPES.AI_MULTIMODAL_ANALYZED,
        entityType: ENTITY_TYPES.SYSTEM,
        actorId:    actor._id,
        actorRole:  actor.role || 'system',
        metadata: {
          pipelineId,
          problemCategory: aiAnalysis?.problemCategory,
          urgency: aiAnalysis?.urgency,
          confidence: aiAnalysis?.confidence,
        },
        ...requestCtx,
      });
    } catch (err) {
      console.warn(`[multimodalManager] Real AI Multimodal call fallback: ${err.message}`);
    }

    // ── Step 3: Problem Analysis ──
    const problemAnalysis = analyzeProblem(unifiedContext, aiAnalysis);

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.PROBLEM_ANALYZED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata: {
        pipelineId,
        contextId:       unifiedContext.contextId,
        problemCategory: problemAnalysis.problemCategory,
        confidence:      problemAnalysis.confidence,
        problemCount:    problemAnalysis.possibleProblems?.length || 0,
        missingInfoCount:problemAnalysis.missingInformation?.length || 0,
      },
      ...requestCtx,
    });

    // ── Step 3: Service Resolution ──
    const serviceResolution = resolveService(problemAnalysis);

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.SERVICE_RESOLVED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata: {
        pipelineId,
        contextId:           unifiedContext.contextId,
        service:             serviceResolution.service,
        category:            serviceResolution.category,
        subCategory:         serviceResolution.subCategory,
        requiredWorkerSkill: serviceResolution.requiredWorkerSkill,
        resolved:            serviceResolution.resolved,
      },
      ...requestCtx,
    });

    // ── Step 4: Urgency Classification ──
    const urgencyResult = classifyUrgency({
      unifiedContext,
      problemAnalysis,
      serviceResolution,
    });

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.URGENCY_CLASSIFIED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata: {
        pipelineId,
        contextId:       unifiedContext.contextId,
        urgencyLevel:    urgencyResult.urgencyLevel,
        urgencyScore:    urgencyResult.urgencyScore,
        dispatchPriority:urgencyResult.dispatchPriority,
        slaHours:        urgencyResult.slaHours,
      },
      ...requestCtx,
    });

    // ── Step 5: Recommendation Generation ──
    const recommendation = generateRecommendation({
      unifiedContext,
      problemAnalysis,
      serviceResolution,
      urgencyResult,
    });

    const latencyMs = Date.now() - startTime;

    // ── Compose Final Result ──
    const result = {
      status:         'success',
      pipelineId,
      pipelineVersion:'1.0.0',
      latencyMs,
      timestamp:      new Date().toISOString(),

      // Core outputs
      unifiedContext,
      problemAnalysis,
      serviceResolution,
      urgencyResult,
      recommendation,

      // Summary for easy consumption
      summary: {
        contextId:           unifiedContext.contextId,
        activeModalities:    unifiedContext.modalities.active,
        problemCategory:     problemAnalysis.problemCategory,
        topProblem:          problemAnalysis.possibleProblems?.[0]?.name || null,
        resolvedService:     serviceResolution.service,
        requiredSkill:       serviceResolution.requiredWorkerSkill,
        urgencyLevel:        urgencyResult.urgencyLevel,
        dispatchPriority:    urgencyResult.dispatchPriority,
        slaDeadline:         urgencyResult.slaDeadline,
        overallConfidence:   recommendation.confidence?.overall,
        missingInfoCount:    problemAnalysis.missingInformation?.length || 0,
        additionalQCount:    recommendation.additionalQuestions?.length || 0,
        contextValid:        contextValidation.isValid,
      },
    };

    // Cache result (text-only pipelines)
    if (!image && !voice) {
      _setCached(cacheKey, result);
    }

    return result;

  } catch (err) {
    const latencyMs = Date.now() - startTime;

    logEvent({
      eventType:  MULTIMODAL_EVENT_TYPES.MULTIMODAL_FAILED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata: {
        pipelineId,
        error:    err.message,
        latencyMs,
        bookingId: bookingCtx.bookingId || null,
      },
      success:       false,
      failureReason: err.message,
      ...requestCtx,
    });

    throw err;
  }
}

// ─── Context-only Pipeline (no analysis) ─────────────────────────────────────

/**
 * Build only the UnifiedContext from inputs (no downstream analysis).
 * Useful when inputs arrive asynchronously.
 *
 * @param {object} params - Same as runMultimodalPipeline
 * @returns {object} UnifiedContext
 */
export function buildContext({ text, image, voice, bookingCtx = {}, customerCtx = {}, workerCtx = {}, requestCtx = {}, actor = {} } = {}) {
  logEvent({
    eventType:  MULTIMODAL_EVENT_TYPES.MULTIMODAL_REQUEST,
    entityType: ENTITY_TYPES.SYSTEM,
    actorId:    actor._id,
    actorRole:  actor.role || 'system',
    metadata:   { action: 'BUILD_CONTEXT_ONLY', bookingId: bookingCtx.bookingId || null },
    ...requestCtx,
  });

  return buildUnifiedContext({ text, image, voice, bookingCtx, customerCtx, workerCtx, requestCtx });
}

// ─── Cache Management ─────────────────────────────────────────────────────────

/** Clear the multimodal context cache */
export function clearMultimodalCache() {
  contextCache.clear();
}

/** Get cache stats */
export function getCacheStats() {
  return {
    size:    contextCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlMs:   CACHE_TTL_MS,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _generatePipelineId() {
  return `mm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
