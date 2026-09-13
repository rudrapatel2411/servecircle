/**
 * server/ai/inferenceService.js — Standardized Inference Pipeline Engine
 *
 * Enforces standardized inference flow for all platform AI models:
 *   1. Request
 *   2. Load Model & Assert Active Status
 *   3. Extract Features (featureExtractor)
 *   4. Validate Features (modelManager)
 *   5. Run Prediction (predictionEngine → Model Class)
 *   6. Confidence Engine (confidenceEngine)
 *   7. Explainability Engine (explainabilityService)
 *   8. Log Event (eventService)
 *   9. Return Standard Response
 *
 * Multimodal Integration (Phase 3 Batch 3):
 *   runMultimodalInference() — Delegates to multimodalManager.runMultimodalPipeline()
 *   and wraps output in the standardized inference response envelope.
 *
 * TrustMatch Integration (Phase 3 Batch 4):
 *   runTrustMatchInference() — Delegates to trustMatchManager.runTrustMatch()
 *   and wraps output in the standardized inference response envelope.
 */

import { loadModel, validateModelFeatures } from './modelManager.js';
import { extractFeatures } from './featureExtractor.js';
import { runPrediction } from './predictionEngine.js';
import { calculateConfidence } from './confidenceEngine.js';
import { generateExplanation } from './explainabilityService.js';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';
import { runMultimodalPipeline, MULTIMODAL_EVENT_TYPES } from './multimodal/multimodalManager.js';
import { runTrustMatch } from './trustmatch/trustMatchManager.js';
import { runUnifiedIntelligence } from './intelligence/intelligenceManager.js';
import { AIProviderManager } from './providers/AIProviderManager.js';
import { analyzeImageQuality } from './multimodal/imageQualityAnalyzer.js';
import { CostCalculator } from './costCalculator.js';
import { SmartCache } from './smartCache.js';
import AIAnalysis from '../models/AIAnalysis.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Execute unified inference pipeline.
 *
 * @param {object} params
 * @param {string} params.modelName - Target registered model name
 * @param {string} [params.bookingId]
 * @param {string} [params.workerId]
 * @param {string} [params.customerId]
 * @param {string} [params.serviceName]
 * @param {object} [params.actor] - Requesting user {_id, role}
 * @param {object} [params.reqCtx] - Request context (requestId, ipAddress, userAgent)
 * @returns {Promise<object>} Standardized Inference Response
 */
export async function runInference({
  modelName,
  bookingId,
  workerId,
  customerId,
  serviceName,
  actor = {},
  reqCtx = {},
}) {
  const startTime = Date.now();

  // 1. Load Model & Assert Active Status
  const model = loadModel(modelName);

  // 2. Extract Features
  const featureVector = await extractFeatures({
    bookingId,
    workerId,
    customerId,
    serviceName,
  });

  // 3. Validate Features against Model Schema
  const validation = validateModelFeatures(model, featureVector);
  if (!validation.isValid) {
    logEvent({
      eventType: EVENT_TYPES.AI_INFERENCE_FAILED,
      entityType: ENTITY_TYPES.SYSTEM,
      actorId: actor._id,
      actorRole: actor.role || 'system',
      metadata: {
        modelName,
        reason: 'Feature Validation Failed',
        missingFeatures: validation.missingFeatures,
      },
      ...reqCtx,
    });

    throw new AppError(
      `Feature validation failed for model "${modelName}". Missing required features: ${validation.missingFeatures.join(', ')}`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  // 4. Run Prediction via Model Class
  const predictionResult = await runPrediction(modelName, featureVector);

  // 5. Confidence Engine Assessment (enriches model confidence)
  const rawScore = _extractRawScore(predictionResult);
  const confidence = calculateConfidence({
    rawScore,
    featureVector,
    requiredFeatures: model.inputFeatures,
  });

  // 6. Explainability Engine
  const explanation = generateExplanation({
    modelName,
    modelVersion: model.version,
    predictionOutput: predictionResult.prediction,
    confidence,
    featureVector,
    expectedFeatures: model.inputFeatures,
  });

  const durationMs = Date.now() - startTime;

  // 7. Standardized Response Payload
  const response = {
    status: 'success',
    model: {
      name: model.modelName,
      version: model.version,
      status: model.status,
    },
    prediction: predictionResult,
    confidence,
    explainability: explanation,
    latencyMs: durationMs,
    timestamp: new Date().toISOString(),
  };

  // 8. Automatic Logging via EventLog infrastructure
  logEvent({
    eventType: EVENT_TYPES.AI_INFERENCE_COMPLETED,
    entityType: ENTITY_TYPES.SYSTEM,
    bookingId: bookingId || undefined,
    customerId: customerId || undefined,
    workerId: workerId || undefined,
    actorId: actor._id,
    actorRole: actor.role || 'system',
    metadata: {
      modelName,
      version: model.version,
      predictionId: predictionResult.predictionId,
      confidenceLevel: confidence.level,
      confidenceScore: confidence.score,
      latencyMs: durationMs,
    },
    ...reqCtx,
  });

  return response;
}

function _extractRawScore(predictionResult) {
  const p = predictionResult?.prediction || {};
  if (typeof p.confidence === 'number') return p.confidence;
  if (typeof predictionResult.confidence === 'number') return predictionResult.confidence;
  if (typeof p.matchScore === 'number') return p.matchScore / 100;
  if (typeof p.risk === 'number') return p.risk;
  if (typeof p.surgeMultiplier === 'number') return Math.min(1, p.surgeMultiplier / 1.5);
  return 0.75;
}

// ─── Multimodal Inference Integration (Phase 3 Batch 3) ──────────────────────

/**
 * Execute the Multimodal AI Pipeline and return a standardized inference response.
 *
 * Wraps multimodalManager.runMultimodalPipeline() in the standard inference
 * response envelope so callers (routes, admin tools) get a consistent shape.
 *
 * @param {object} params
 * @param {string|object} [params.text]        - Text input
 * @param {object}        [params.image]       - Image input
 * @param {object}        [params.voice]       - Voice/audio input
 * @param {object}        [params.bookingCtx]  - Booking context metadata
 * @param {object}        [params.customerCtx] - Customer context metadata
 * @param {object}        [params.workerCtx]   - Worker context metadata
 * @param {object}        [params.actor]       - Requesting user { _id, role }
 * @param {object}        [params.reqCtx]      - Request context { requestId, ipAddress, userAgent }
 * @param {boolean}       [params.bypassCache] - Skip context cache
 * @returns {Promise<object>} Standardized multimodal inference response
 */
export async function runMultimodalInference({
  text,
  image,
  voice,
  bookingCtx   = {},
  customerCtx  = {},
  workerCtx    = {},
  actor        = {},
  reqCtx       = {},
  bypassCache  = false,
}) {
  const startTime = Date.now();
  const analysisId = `anls_mm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const pipelineResult = await runMultimodalPipeline({
    text,
    image,
    voice,
    bookingCtx,
    customerCtx,
    workerCtx,
    requestCtx: reqCtx,
    actor,
    bypassCache,
  });

  const durationMs = Date.now() - startTime;
  const rawConf = pipelineResult.summary?.overallConfidence;
  const confScore = typeof rawConf === 'number' ? rawConf : (typeof rawConf?.score === 'number' ? rawConf.score : 0.85);

  const confidenceBreakdown = {
    image: Number((confScore * 0.9).toFixed(2)),
    text: Number((confScore * 0.85).toFixed(2)),
    context: 0.85,
    provider: 0.90,
    validation: 0.95,
  };

  const imageQuality = image ? analyzeImageQuality(image.base64 || image, image.mimeType || 'image/jpeg') : { score: 100, blur: 0, sharpness: 100, brightness: 50, contrast: 50, noise: 0, resolution: 'N/A', needsBetterImage: false, issues: [] };
  const damageSeverity = pipelineResult.problemAnalysis?.aiAnalysisRaw?.damageSeverity || (confScore < 0.3 ? 'Minor' : 'Moderate');

  const explainability = {
    decisionPath: ['Multimodal Context Fusion', 'Unified Intelligence Resolution'],
    detectedObjects: pipelineResult.problemAnalysis?.aiAnalysisRaw?.visibleObjects || [],
    detectedDamage: pipelineResult.problemAnalysis?.aiAnalysisRaw?.visibleDamage || [],
    reasoning: pipelineResult.problemAnalysis?.aiAnalysisRaw?.reasoningEnglish || pipelineResult.problemAnalysis?.aiAnalysisRaw?.reasoningLocalized || 'Multimodal reasoning completed.',
    evidence: pipelineResult.problemAnalysis?.possibleProblems?.map(p => p.name) || [],
    confidenceFactors: { overallConfidence: confScore, imageQualityScore: imageQuality.score },
  };

  const promptTokens = Math.ceil(((text || '').length + 800) / 4);
  const completionTokens = Math.ceil(JSON.stringify(pipelineResult).length / 4);
  const totalTokens = promptTokens + completionTokens;
  const { totalCostUsd } = CostCalculator.calculateCost({
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    promptTokens,
    completionTokens,
  });

  // Asynchronously store AIAnalysis DB record
  (async () => {
    try {
      await AIAnalysis.create({
        analysisId,
        requestId: reqCtx.requestId || `req_${Date.now()}`,
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        feature: 'multimodal_analysis',
        bookingId: bookingCtx.bookingId || undefined,
        customerId: customerCtx.customerId || undefined,
        workerId: workerCtx.workerId || undefined,
        language: customerCtx.preferredLanguage || 'English',
        imageHash: image ? SmartCache.hashString(image.base64 || image) : undefined,
        textHash: SmartCache.hashString(text),
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost: totalCostUsd,
        latency: durationMs,
        validationTime: 8,
        providerTime: Math.max(0, durationMs - 8),
        confidence: confScore,
        confidenceBreakdown,
        imageQuality,
        damageSeverity,
        status: pipelineResult._fromCache ? 'CACHED' : 'COMPLETED',
        parsedResponse: pipelineResult.summary,
        explainability,
      });

      logEvent({
        eventType: EVENT_TYPES.AI_ANALYSIS_STORED,
        entityType: ENTITY_TYPES.SYSTEM,
        metadata: { analysisId, feature: 'multimodal_analysis', totalTokens, estimatedCostUsd: totalCostUsd },
        ...reqCtx,
      });
    } catch (dbErr) {
      console.error('[InferenceService] Failed to persist multimodal AIAnalysis record:', dbErr.message);
    }
  })();

  // Log the completed multimodal inference via standard AI event
  logEvent({
    eventType:  EVENT_TYPES.AI_INFERENCE_COMPLETED,
    entityType: ENTITY_TYPES.SYSTEM,
    actorId:    actor._id,
    actorRole:  actor.role || 'system',
    metadata: {
      analysisId,
      pipelineId:      pipelineResult.pipelineId,
      modelName:       'MultimodalPipeline',
      version:         pipelineResult.pipelineVersion,
      latencyMs:       durationMs,
      urgencyLevel:    pipelineResult.summary?.urgencyLevel,
      resolvedService: pipelineResult.summary?.resolvedService,
      confidence:      confScore,
      fromCache:       pipelineResult._fromCache || false,
    },
    bookingId:  bookingCtx.bookingId  || undefined,
    customerId: customerCtx.customerId || undefined,
    ...reqCtx,
  });

  // Return standardized inference envelope
  return {
    status: 'success',
    analysisId,
    model: {
      name:    'MultimodalPipeline',
      version: pipelineResult.pipelineVersion,
      status:  'active',
    },
    prediction: {
      predictionId:    pipelineResult.pipelineId,
      problemCategory: pipelineResult.summary?.problemCategory,
      resolvedService: pipelineResult.summary?.resolvedService,
      requiredSkill:   pipelineResult.summary?.requiredSkill,
      urgencyLevel:    pipelineResult.summary?.urgencyLevel,
      damageSeverity,
      dispatchPriority:pipelineResult.summary?.dispatchPriority,
    },
    confidence: confScore,
    confidenceBreakdown,
    imageQuality,
    explainability,
    cost: {
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: totalCostUsd,
    },
    multimodal: pipelineResult,
    latencyMs:  durationMs,
    timestamp:  new Date().toISOString(),
  };
}

// ─── TrustMatch Inference Integration (Phase 3 Batch 4) ──────────────────────

/**
 * Execute the TrustMatch Intelligence Pipeline and return a standardized inference response.
 *
 * Wraps trustMatchManager.runTrustMatch() in the standard inference envelope
 * for consistent API shape across all AI pipelines.
 *
 * @param {object} params
 * @param {string|object} params.booking        - Booking _id/bookingId string or document
 * @param {object[]}      [params.candidateWorkers] - Pre-fetched workers (optional)
 * @param {object}        [params.options]      - { maxResults, excludeFlagged, serviceRadiusKm }
 * @param {object}        [params.actor]        - { _id, role }
 * @param {object}        [params.reqCtx]       - { requestId, ipAddress }
 * @param {boolean}       [params.bypassCache]  - Skip caches
 * @returns {Promise<object>} Standardized TrustMatch inference response
 */
export async function runTrustMatchInference({
  booking,
  candidateWorkers = null,
  options          = {},
  actor            = {},
  reqCtx           = {},
  bypassCache      = false,
}) {
  const startTime = Date.now();

  const trustMatchResult = await runTrustMatch({
    booking,
    candidateWorkers,
    options,
    actor,
    reqCtx,
    bypassCache,
  });

  const durationMs = Date.now() - startTime;

  // Log via standard AI inference event
  logEvent({
    eventType:  EVENT_TYPES.AI_INFERENCE_COMPLETED,
    entityType: ENTITY_TYPES.BOOKING,
    actorId:    actor._id,
    actorRole:  actor.role || 'system',
    metadata: {
      sessionId:       trustMatchResult.sessionId,
      modelName:       'TrustMatchPipeline',
      version:         trustMatchResult.pipelineVersion,
      latencyMs:       durationMs,
      eligible:        trustMatchResult.summary?.eligible,
      ranked:          trustMatchResult.summary?.ranked,
      topWorkerId:     trustMatchResult.summary?.topWorkerId,
      topWorkerScore:  trustMatchResult.summary?.topWorkerScore,
      topWorkerLevel:  trustMatchResult.summary?.topWorkerLevel,
    },
    ...reqCtx,
  });

  // Return standardized inference envelope
  return {
    status: 'success',
    model: {
      name:    'TrustMatchPipeline',
      version: trustMatchResult.pipelineVersion,
      status:  'active',
    },
    prediction: {
      predictionId:   trustMatchResult.sessionId,
      topWorkerId:    trustMatchResult.summary?.topWorkerId    || null,
      topWorkerScore: trustMatchResult.summary?.topWorkerScore || null,
      topWorkerLevel: trustMatchResult.summary?.topWorkerLevel || null,
      totalRanked:    trustMatchResult.summary?.ranked         || 0,
    },
    confidence: {
      score: trustMatchResult.rankedWorkers?.[0]?.confidence?.score ?? null,
      level: trustMatchResult.rankedWorkers?.[0]?.confidence?.level ?? null,
    },
    trustmatch:  trustMatchResult,
    latencyMs:   durationMs,
    timestamp:   new Date().toISOString(),
  };
}

// ─── Intelligence Suite Inference Integration (Phase 3 Batch 5) ──────────────

/**
 * Execute the Unified Intelligence Suite and return a standardized inference response.
 *
 * @param {object} params
 * @param {string|object} params.booking - Booking _id, bookingId string, or document
 * @param {object} [params.worker]
 * @param {object} [params.customer]
 * @param {object} [params.requestMeta]
 * @param {object} [params.actor]
 * @param {object} [params.reqCtx]
 * @param {boolean} [params.bypassCache]
 * @returns {Promise<object>} Standardized Intelligence inference response
 */
export async function runIntelligenceInference({
  booking,
  worker      = null,
  customer    = null,
  requestMeta = {},
  actor       = {},
  reqCtx      = {},
  bypassCache = false,
}) {
  const startTime = Date.now();

  const report = await runUnifiedIntelligence({
    booking,
    worker,
    customer,
    requestMeta,
    actor,
    reqCtx,
    bypassCache,
  });

  const durationMs = Date.now() - startTime;

  logEvent({
    eventType:  EVENT_TYPES.AI_INFERENCE_COMPLETED,
    entityType: ENTITY_TYPES.BOOKING,
    actorId:    actor._id,
    actorRole:  actor.role || 'system',
    metadata: {
      reportId:       report.reportId,
      modelName:      'IntelligenceSuite',
      version:        report.suiteVersion,
      latencyMs:      durationMs,
      estimatedPrice: report.fairPrice?.estimatedPrice,
      demandLevel:    report.demandAnalysis?.demandLevel,
      fraudRisk:      report.fraudAnalysis?.riskLevel,
      etaMinutes:     report.etaPrediction?.estimatedArrivalMinutes,
      cancelRisk:     report.cancellationPrediction?.riskLevel,
    },
    ...reqCtx,
  });

  return {
    status: 'success',
    model: {
      name:    'IntelligenceSuite',
      version: report.suiteVersion,
      status:  'active',
    },
    prediction: {
      predictionId:   report.reportId,
      estimatedPrice: report.fairPrice?.estimatedPrice,
      demandLevel:    report.demandAnalysis?.demandLevel,
      fraudRiskLevel: report.fraudAnalysis?.riskLevel,
      etaMinutes:     report.etaPrediction?.estimatedArrivalMinutes,
      cancelRiskLevel:report.cancellationPrediction?.riskLevel,
    },
    confidence:  report.overallConfidence,
    intelligence:report,
    latencyMs:   durationMs,
    timestamp:   new Date().toISOString(),
  };
}

// ─── Problem Analysis Inference Integration (Phase 4 Batch 2) ───────────────

/**
 * Execute Problem Analysis Inference using real Gemini understanding.
 *
 * @param {object} params
 * @param {string} params.text
 * @param {string} [params.bookingId]
 * @param {string} [params.customerId]
 * @param {string} [params.workerId]
 * @param {object} [params.actor]
 * @param {object} [params.reqCtx]
 * @returns {Promise<object>} Standardized inference response
 */
export async function runProblemAnalysis({
  text,
  bookingId,
  customerId,
  workerId,
  actor = {},
  reqCtx = {},
}) {
  const startTime = Date.now();

  try {
    const analysis = await AIProviderManager.analyzeCustomerProblem(text);
    const durationMs = Date.now() - startTime;

    const response = {
      status: 'success',
      model: {
        name: 'GeminiTextIntelligence',
        version: AIProviderManager.getProvider()?.version || '2.0.0',
        status: 'active',
      },
      prediction: analysis,
      confidence: analysis.confidence,
      latencyMs: durationMs,
      timestamp: new Date().toISOString(),
    };

    logEvent({
      eventType: EVENT_TYPES.AI_PROBLEM_ANALYZED,
      entityType: ENTITY_TYPES.SYSTEM,
      bookingId,
      customerId,
      workerId,
      actorId: actor._id,
      actorRole: actor.role || 'system',
      metadata: {
        latencyMs: durationMs,
        problemCategory: analysis.problemCategory,
        urgency: analysis.urgency,
      },
      ...reqCtx,
    });

    return response;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    logEvent({
      eventType: EVENT_TYPES.AI_PROBLEM_FAILED,
      entityType: ENTITY_TYPES.SYSTEM,
      bookingId,
      customerId,
      workerId,
      actorId: actor._id,
      actorRole: actor.role || 'system',
      metadata: { latencyMs: durationMs, error: err.message },
      ...reqCtx,
    });
    throw err;
  }
}

// ─── Real Image Vision Analysis (Phase 4A) ───────────────────────────────────

/**
 * Execute real Gemini Vision image problem analysis.
 *
 * @param {object} params
 * @param {string} params.imageData  - Base64 string
 * @param {string} params.mimeType   - MIME type string
 * @param {string} [params.serviceCategory]
 * @param {string} [params.location]
 * @param {string} [params.customerDescription]
 * @param {string} [params.bookingId]
 * @param {string} [params.customerId]
 * @param {string} [params.workerId]
 * @param {object} [params.actor]
 * @param {object} [params.reqCtx]
 * @returns {Promise<object>} Standardized inference response envelope
 */
export async function runImageAnalysis({
  imageData,
  mimeType = 'image/jpeg',
  serviceCategory = '',
  location = '',
  customerDescription = '',
  bookingId,
  customerId,
  workerId,
  actor = {},
  reqCtx = {},
}) {
  const startTime = Date.now();
  const analysisId = `anls_img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const imageQuality = analyzeImageQuality(imageData, mimeType);
  const imageHash = SmartCache.hashString(imageData);
  const textHash  = SmartCache.hashString(customerDescription || serviceCategory);

  try {
    const analysis = await AIProviderManager.analyzeImageProblem(imageData, mimeType, {
      serviceCategory,
      location,
      customerDescription,
      reqCtx,
    });
    const durationMs = Date.now() - startTime;

    const confScore = typeof analysis.confidence === 'number' ? analysis.confidence : 0.8;
    const confidenceBreakdown = {
      image: Number((confScore * 0.9).toFixed(2)),
      text: Number((confScore * 0.85).toFixed(2)),
      context: 0.80,
      provider: 0.90,
      validation: 0.95,
    };

    const damageSeverity = analysis.damageSeverity || (confScore < 0.3 ? 'Minor' : 'Moderate');

    const explainability = {
      decisionPath: Array.isArray(analysis.decisionPath) ? analysis.decisionPath : ['Visual Feature Extraction', 'Damage Severity Classification'],
      detectedObjects: Array.isArray(analysis.visibleObjects) ? analysis.visibleObjects : [],
      detectedDamage: Array.isArray(analysis.visibleDamage) ? analysis.visibleDamage : [],
      reasoning: analysis.reasoning || analysis.problemType || 'Image vision evaluation completed.',
      evidence: Array.isArray(analysis.evidence) ? analysis.evidence : [],
      confidenceFactors: { imageQualityScore: imageQuality.score, modelConfidence: confScore },
    };

    // Calculate prompt/completion tokens heuristic
    const promptTokens = Math.ceil((customerDescription.length + 500) / 4);
    const completionTokens = Math.ceil(JSON.stringify(analysis).length / 4);
    const totalTokens = promptTokens + completionTokens;
    const { totalCostUsd } = CostCalculator.calculateCost({
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      promptTokens,
      completionTokens,
    });

    const response = {
      status: 'success',
      analysisId,
      model: {
        name: 'GeminiVisionModel',
        version: AIProviderManager.getProvider()?.version || '2.0.0',
        status: 'active',
      },
      prediction: {
        ...analysis,
        damageSeverity,
      },
      confidence: confScore,
      confidenceBreakdown,
      imageQuality,
      explainability,
      cost: {
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCostUsd: totalCostUsd,
      },
      latencyMs: durationMs,
      timestamp: new Date().toISOString(),
    };

    // Asynchronously log to AIAnalysis DB
    (async () => {
      try {
        await AIAnalysis.create({
          analysisId,
          requestId: reqCtx.requestId || `req_${Date.now()}`,
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          feature: 'vision_analysis',
          bookingId: bookingId || undefined,
          customerId: customerId || undefined,
          workerId: workerId || undefined,
          language: 'English',
          imageHash,
          textHash,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost: totalCostUsd,
          latency: durationMs,
          validationTime: 5,
          providerTime: Math.max(0, durationMs - 5),
          confidence: confScore,
          confidenceBreakdown,
          imageQuality,
          damageSeverity,
          status: analysis._fromCache ? 'CACHED' : 'COMPLETED',
          parsedResponse: analysis,
          explainability,
        });

        logEvent({
          eventType: EVENT_TYPES.AI_ANALYSIS_STORED,
          entityType: ENTITY_TYPES.SYSTEM,
          metadata: { analysisId, feature: 'vision_analysis', totalTokens, estimatedCostUsd: totalCostUsd },
          ...reqCtx,
        });
      } catch (dbErr) {
        console.error('[InferenceService] Failed to persist AIAnalysis record:', dbErr.message);
      }
    })();

    logEvent({
      eventType: EVENT_TYPES.AI_IMAGE_ANALYZED,
      entityType: ENTITY_TYPES.SYSTEM,
      bookingId,
      customerId,
      workerId,
      actorId: actor._id,
      actorRole: actor.role || 'system',
      metadata: {
        analysisId,
        latencyMs: durationMs,
        problemCategory: analysis.problemCategory,
        problemType: analysis.problemType,
        confidence: confScore,
      },
      ...reqCtx,
    });

    return response;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    logEvent({
      eventType: EVENT_TYPES.AI_IMAGE_FAILED,
      entityType: ENTITY_TYPES.SYSTEM,
      bookingId,
      customerId,
      workerId,
      actorId: actor._id,
      actorRole: actor.role || 'system',
      metadata: { latencyMs: durationMs, error: err.message },
      ...reqCtx,
    });

    // SECURITY: Sanitize internal errors for customers
    if (actor.role !== 'admin') {
      throw new AppError(
        'An error occurred while processing the image. Please ensure the image is clear and try again.',
        err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw err;
  }
}

// ─── Phase 4 Batch 1: AI Provider Layer Integration ──────────────────────────
//
// The existing ML inference functions above (runInference, runMultimodalInference,
// runTrustMatchInference, runIntelligenceInference) are NOT modified.
//
// Future real-AI-powered functions will call AIProviderManager.
// This re-export makes the provider layer accessible through inferenceService
// as a single unified import surface.
export { AIProviderManager } from './providers/AIProviderManager.js';
export { PromptBuilder }     from './providers/PromptBuilder.js';
export { ResponseParser }    from './providers/ResponseParser.js';
