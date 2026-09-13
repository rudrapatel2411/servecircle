import 'dotenv/config';
import mongoose from 'mongoose';
import { runImageAnalysis, runMultimodalInference, AIProviderManager } from '../ai/inferenceService.js';
import { SmartCache } from '../ai/smartCache.js';
import { RetryEngine } from '../ai/retryEngine.js';
import { CostCalculator } from '../ai/costCalculator.js';
import { analyzeImageQuality } from '../ai/multimodal/imageQualityAnalyzer.js';
import { AIUsageService } from '../ai/services/aiUsageService.js';
import { AIHealthService } from '../ai/services/aiHealthService.js';
import AIAnalysis from '../models/AIAnalysis.js';

const SAMPLE_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function runPhase4BTests() {
  console.log('====================================================');
  console.log('Phase 4B – Enterprise AI Platform Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let totalTests = 0;

  // 1. Initialize MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle');
    console.log('✅ MongoDB connected for AIAnalysis verification.\n');
  } catch (err) {
    console.log('⚠️ MongoDB connection issue — continuing with in-memory fallbacks.\n');
  }

  // 2. Initialize Provider Manager
  try {
    await AIProviderManager.initialize();
    console.log('✅ AIProviderManager initialized successfully.\n');
  } catch (err) {
    console.warn('⚠️ Provider init warning:', err.message);
  }

  const actor = { _id: new mongoose.Types.ObjectId(), role: 'admin' };
  const reqCtx = { requestId: 'req_test_123', ipAddress: '127.0.0.1', userAgent: 'EnterpriseTestRunner' };

  // ─── TEST 1: SmartCache Hashing & Hits/Misses ──────────────────────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] SmartCache Hashing, Hit/Miss Stats`);
  SmartCache.clear();
  const key1 = SmartCache.generateKey({ imageHash: 'img123', textHash: 'txt123', model: 'gemini-2.0-flash', language: 'English' });
  SmartCache.set(key1, { test: 'cached_data' });
  const hitData = SmartCache.get(key1, reqCtx);
  const missData = SmartCache.get('non_existent_key', reqCtx);
  const stats = SmartCache.getStats();

  if (hitData?.test === 'cached_data' && !missData && stats.hits === 1 && stats.misses === 1) {
    console.log(`  ✅ Passed: SmartCache hit/miss working (hitRate: ${stats.hitRatePercent}%)\n`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: SmartCache behavior incorrect.\n`);
  }

  // ─── TEST 2: RetryEngine Strategy ──────────────────────────────────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] RetryEngine Exponential Backoff & Non-Retryable Rejection`);
  let attempts = 0;
  try {
    await RetryEngine.execute(
      async () => {
        attempts++;
        if (attempts < 2) {
          const err = new Error('429 RESOURCE_EXHAUSTED');
          err.statusCode = 429;
          throw err;
        }
        return 'success_after_retry';
      },
      { maxRetries: 2, initialDelayMs: 50, context: 'TestRetry' }
    );

    if (attempts === 2) {
      console.log('  ✅ Passed: Successfully retried transient 429 error and succeeded.\n');
      passed++;
    } else {
      console.log(`  ❌ FAIL: Retry count unexpected (${attempts}).\n`);
    }
  } catch (err) {
    console.log(`  ❌ FAIL: RetryEngine threw error: ${err.message}\n`);
  }

  // ─── TEST 3: RetryEngine Non-Retryable Rejection (401 Unauthorized) ────────
  totalTests++;
  console.log(`[TEST ${totalTests}] RetryEngine Immediate Rejection for 401/400 Error`);
  let unauthAttempts = 0;
  try {
    await RetryEngine.execute(
      async () => {
        unauthAttempts++;
        const err = new Error('401 Unauthorized API key');
        err.statusCode = 401;
        throw err;
      },
      { maxRetries: 3, initialDelayMs: 50, context: 'TestUnauth' }
    );
  } catch (err) {
    if (unauthAttempts === 1) {
      console.log('  ✅ Passed: Rejected non-retryable 401 error immediately without retrying.\n');
      passed++;
    } else {
      console.log(`  ❌ FAIL: Retried 401 error (${unauthAttempts} attempts).\n`);
    }
  }

  // ─── TEST 4: CostCalculator Pricing Interface ──────────────────────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] CostCalculator Token & USD Estimation`);
  const costRes = CostCalculator.calculateCost({
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    promptTokens: 1000,
    completionTokens: 500,
  });

  if (costRes.totalCostUsd > 0 && costRes.provider === 'gemini') {
    console.log(`  ✅ Passed: Calculated total cost ($${costRes.totalCostUsd} USD for 1500 tokens)\n`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: Cost calculation failed.\n`);
  }

  // ─── TEST 5: Image Quality Analyzer ────────────────────────────────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] Image Quality Analyzer Metrics & Score`);
  const quality = analyzeImageQuality(SAMPLE_JPEG_BASE64, 'image/jpeg');

  if (typeof quality.score === 'number' && typeof quality.blur === 'number' && typeof quality.needsBetterImage === 'boolean') {
    console.log(`  ✅ Passed: Quality score: ${quality.score}/100 | Blur: ${quality.blur} | Res: ${quality.resolution}\n`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: Image quality analysis output incomplete.\n`);
  }

  // ─── TEST 6: AI Health Service ──────────────────────────────────────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] AI Health Service Monitoring Snapshot`);
  const health = await AIHealthService.getHealthStatus();

  if (health.status && typeof health.averageLatencyMs === 'number' && health.quotaStatus) {
    console.log(`  ✅ Passed: Health status: ${health.status} | Provider: ${health.provider} | Quota: ${health.quotaStatus}\n`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: AI Health Service snapshot invalid.\n`);
  }

  // ─── TEST 7: Full Vision Analysis & AIAnalysis Persistence ───────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] Vision Analysis with AIAnalysis DB Persistence`);
  try {
    const visionRes = await runImageAnalysis({
      imageData: SAMPLE_JPEG_BASE64,
      mimeType: 'image/jpeg',
      serviceCategory: 'Plumbing',
      customerDescription: 'Kitchen pipe leak under sink',
      actor,
      reqCtx,
    });

    if (visionRes.status === 'success' && visionRes.analysisId && visionRes.confidenceBreakdown && visionRes.explainability) {
      console.log(`  ✅ Passed: Vision analysis completed (analysisId: ${visionRes.analysisId}, Latency: ${visionRes.latencyMs}ms)\n`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: Vision analysis output envelope incomplete.\n`);
    }
  } catch (err) {
    console.log(`  ❌ FAIL: Vision analysis failed (${err.message}).\n`);
  }

  // ─── TEST 8: Multimodal Inference & Token/Cost Metrics ─────────────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] Multimodal Inference with Token/Cost Tracking`);
  try {
    const mmRes = await runMultimodalInference({
      text: 'AC is leaking water and not cooling.',
      image: { base64: SAMPLE_JPEG_BASE64, mimeType: 'image/jpeg' },
      customerCtx: { preferredLanguage: 'Gujarati' },
      actor,
      reqCtx,
    });

    if (mmRes.status === 'success' && mmRes.cost?.totalTokens > 0) {
      console.log(`  ✅ Passed: Multimodal inference completed (Tokens: ${mmRes.cost.totalTokens}, Cost: $${mmRes.cost.estimatedCostUsd})\n`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: Multimodal response missing cost/token envelope.\n`);
    }
  } catch (err) {
    console.log(`  ❌ FAIL: Multimodal inference failed (${err.message}).\n`);
  }

  // ─── TEST 9: AI Usage Analytics & Dashboard Aggregation ────────────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] AI Usage Service Dashboard Metrics Aggregation`);
  const metrics = await AIUsageService.getDashboardMetrics();

  if (typeof metrics.todaysRequests === 'number' && typeof metrics.successRatePercent === 'number') {
    console.log(`  ✅ Passed: Today's Requests: ${metrics.todaysRequests} | SuccessRate: ${metrics.successRatePercent}% | AvgConf: ${metrics.avgConfidence}\n`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: Dashboard metrics aggregation invalid.\n`);
  }

  // ─── TEST 10: AI Analysis History Query ─────────────────────────────────────
  totalTests++;
  console.log(`[TEST ${totalTests}] AI Analysis History Pagination & Query`);
  const history = await AIUsageService.getHistory({ page: 1, limit: 10 });

  if (typeof history.total === 'number' && Array.isArray(history.history)) {
    console.log(`  ✅ Passed: History total records: ${history.total} (Page ${history.page}/${history.pages})\n`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: History query failed.\n`);
  }

  console.log('====================================================');
  console.log(`Phase 4B Test Results: ${passed} / ${totalTests} Passed.`);
  console.log('====================================================\n');

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  process.exit(passed === totalTests ? 0 : 1);
}

runPhase4BTests();
