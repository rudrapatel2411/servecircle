/**
 * server/ai/trustmatch/trustMatchManager.js — TrustMatch Orchestrator
 *
 * Single entry point for all TrustMatch operations.
 * Orchestrates the full pipeline:
 *
 *   Input (booking + candidate workers) →
 *   Worker Filter →
 *   [Parallel] Worker Scoring + Trust Assessment + Preference Profile →
 *   Recommendation Generation →
 *   Worker Ranking →
 *   TrustMatch Response
 *
 * Implements:
 *   - Parallel scoring via Promise.all
 *   - Worker metrics caching (in-memory, 60s TTL)
 *   - Feature Store reuse
 *   - Full EventLog integration
 *   - Stateless architecture
 */

import { filterWorkers }                            from './workerFilterEngine.js';
import { scoreWorker }                              from './workerScoringEngine.js';
import { evaluateTrust }                            from './trustEngine.js';
import { buildPreferenceProfile, computeWorkerPreferenceAdjustment } from './customerPreferenceEngine.js';
import { generateWorkerRecommendation, rankRecommendations }         from './recommendationEngine.js';
import { rankWorkers, getTopWorkers }               from './workerRankingEngine.js';
import { logEvent, EVENT_TYPES, ENTITY_TYPES }      from '../../services/eventService.js';

// Mongoose models
import User             from '../../models/User.js';
import WorkerMetrics    from '../../models/WorkerMetrics.js';
import TrustProfile     from '../../models/TrustProfile.js';
import WorkerSkillHistory from '../../models/WorkerSkillHistory.js';
import CustomerMetrics  from '../../models/CustomerMetrics.js';
import CustomerBehaviour from '../../models/CustomerBehaviour.js';
import Booking          from '../../models/Booking.js';

// ─── TrustMatch Event Types ───────────────────────────────────────────────────
export const TRUSTMATCH_EVENT_TYPES = {
  TRUSTMATCH_STARTED:   'TRUSTMATCH_STARTED',
  TRUSTMATCH_COMPLETED: 'TRUSTMATCH_COMPLETED',
  TRUSTMATCH_FAILED:    'TRUSTMATCH_FAILED',
  WORKER_RANKED:        'WORKER_RANKED',
  WORKER_FILTERED:      'WORKER_FILTERED',
};

// ─── In-memory cache ──────────────────────────────────────────────────────────
const metricsCache     = new Map();
const trustProfileCache = new Map();
const CACHE_TTL_MS     = 60_000;
const MAX_CACHE_SIZE   = 1000;

function _getCached(cache, key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return item.data;
}

function _setCached(cache, key, data) {
  if (cache.size >= MAX_CACHE_SIZE) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, { ts: Date.now(), data });
}

// ─── Main Pipeline ────────────────────────────────────────────────────────────

/**
 * Run the full TrustMatch pipeline for a booking.
 *
 * @param {object} params
 * @param {string|object} params.booking           - Booking _id string or populated document
 * @param {object[]}      [params.candidateWorkers]- Pre-fetched worker documents (optional — fetched if omitted)
 * @param {object}        [params.customerData]    - { metrics, behaviour } (optional — fetched if omitted)
 * @param {object}        [params.options]
 * @param {number}        [params.options.maxResults]
 * @param {boolean}       [params.options.excludeFlagged]
 * @param {number}        [params.options.serviceRadiusKm]
 * @param {boolean}       [params.options.requireDocVerified]
 * @param {object}        [params.actor]            - Requesting user { _id, role }
 * @param {object}        [params.reqCtx]           - Request context
 * @param {boolean}       [params.bypassCache]
 * @returns {Promise<object>} TrustMatch result
 */
export async function runTrustMatch({
  booking,
  candidateWorkers = null,
  customerData     = null,
  options          = {},
  actor            = {},
  reqCtx           = {},
  bypassCache      = false,
}) {
  const startTime  = Date.now();
  const sessionId  = _generateSessionId();

  // ── Resolve booking document ──
  const bookingDoc = typeof booking === 'string' || (booking && booking._id === undefined)
    ? await Booking.findOne({ bookingId: booking }).lean()
    : booking;

  if (!bookingDoc) {
    throw new Error(`Booking not found: ${booking}`);
  }

  const bookingId  = String(bookingDoc._id || bookingDoc.bookingId);
  const customerId = String(bookingDoc.customer);

  // ── Log TRUSTMATCH_STARTED ──
  logEvent({
    eventType:  TRUSTMATCH_EVENT_TYPES.TRUSTMATCH_STARTED,
    entityType: ENTITY_TYPES.BOOKING,
    entityId:   bookingId,
    actorId:    actor._id,
    actorRole:  actor.role || 'system',
    metadata: {
      sessionId,
      category: bookingDoc.category,
      city:     bookingDoc.city,
      isEmergency: bookingDoc.isEmergency,
      customerId,
    },
    ...reqCtx,
  });

  try {
    // ── Step 1: Fetch candidate workers if not provided ──
    const workers = candidateWorkers
      ?? await _fetchCandidateWorkers(bookingDoc);

    // ── Step 2: Batch-fetch TrustProfiles (parallel, cached) ──
    const workerIds         = workers.map((w) => String(w._id));
    const trustProfileMap   = await _batchFetchTrustProfiles(workerIds, bypassCache);

    // ── Step 3: Worker Filter ──
    const filterResult = filterWorkers({
      workers,
      booking: bookingDoc,
      trustProfileMap,
      options: {
        serviceRadiusKm:    options.serviceRadiusKm,
        requireDocVerified: options.requireDocVerified || false,
        strictBusy:         true,
      },
    });

    // Log WORKER_FILTERED
    logEvent({
      eventType:  TRUSTMATCH_EVENT_TYPES.WORKER_FILTERED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingId,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata: {
        sessionId,
        total:      filterResult.filterStats.total,
        eligible:   filterResult.filterStats.eligible,
        filteredOut:filterResult.filterStats.filteredOut,
        reasons:    filterResult.filterStats.reasonCounts,
      },
      ...reqCtx,
    });

    if (filterResult.eligibleWorkers.length === 0) {
      return _noWorkersResult({ sessionId, bookingDoc, filterResult, startTime });
    }

    // ── Step 4: Fetch metrics + skill history (parallel per worker) ──
    const eligibleWorkers = filterResult.eligibleWorkers;
    const eligibleIds     = eligibleWorkers.map((ew) => String(ew.worker._id));

    const [metricsMap, skillHistoryMap] = await Promise.all([
      _batchFetchWorkerMetrics(eligibleIds, bypassCache),
      _batchFetchSkillHistory(eligibleIds, bookingDoc.category, bypassCache),
    ]);

    // ── Step 5: Fetch customer preference data ──
    const { custMetrics, custBehaviour } = customerData
      ?? await _fetchCustomerData(customerId, bypassCache);

    const preferenceProfile = buildPreferenceProfile({
      customerMetrics:   custMetrics,
      customerBehaviour: custBehaviour,
      booking:           bookingDoc,
    });

    // ── Step 6: Parallel scoring + trust assessment ──
    // All computation is synchronous (no I/O inside scorers)
    const scoringResults = await Promise.all(
      eligibleWorkers.map(async (ew) => {
        const workerIdStr    = String(ew.worker._id);
        const metrics        = metricsMap.get(workerIdStr)        || null;
        const trustProfile   = trustProfileMap.get(workerIdStr)   || null;
        const skillHistory   = skillHistoryMap.get(workerIdStr)   || null;
        const distanceKm     = ew.distanceKm;

        // All three run synchronously — no await
        const scoreCard     = scoreWorker({ worker: ew.worker, metrics, trustProfile, skillHistory, distanceKm, booking: bookingDoc });
        const trustAssessment = evaluateTrust({ worker: ew.worker, trustProfile, metrics, skillHistory });
        const prefAdjustment  = computeWorkerPreferenceAdjustment({
          workerId: workerIdStr,
          preferenceProfile,
          booking:  bookingDoc,
          worker:   ew.worker,
        });

        return { scoreCard, trustAssessment, prefAdjustment };
      })
    );

    // ── Step 7: Generate recommendations ──
    const recommendations = scoringResults.map(({ scoreCard, trustAssessment, prefAdjustment }) =>
      generateWorkerRecommendation({
        scoreCard,
        preferenceAdjustment: prefAdjustment,
        booking: bookingDoc,
      })
    );

    // ── Step 8: Rank workers ──
    const rankingResult = rankWorkers({
      recommendations,
      scoreCards:       scoringResults.map((r) => r.scoreCard),
      trustAssessments: scoringResults.map((r) => r.trustAssessment),
      filterResult,
      booking:          bookingDoc,
      options: {
        maxResults:    options.maxResults || 10,
        excludeFlagged: options.excludeFlagged !== false,
      },
    });

    const latencyMs  = Date.now() - startTime;
    const topWorkers = getTopWorkers(rankingResult, 3);

    // Log WORKER_RANKED for each ranked worker
    for (const worker of rankingResult.rankedWorkers) {
      logEvent({
        eventType:  TRUSTMATCH_EVENT_TYPES.WORKER_RANKED,
        entityType: ENTITY_TYPES.USER,
        entityId:   worker.workerId,
        actorId:    actor._id,
        actorRole:  actor.role || 'system',
        metadata: {
          sessionId,
          bookingId,
          rank:               worker.rank,
          recommendationScore:worker.recommendationScore,
          recommendationLevel:worker.recommendationLevel,
          trustVerdict:       worker.trustVerdict,
          confidence:         worker.confidence?.score,
        },
        ...reqCtx,
      });
    }

    // ── Assemble final response ──
    const result = _assembleFinalResponse({
      sessionId,
      bookingDoc,
      filterResult,
      rankingResult,
      topWorkers,
      preferenceProfile,
      latencyMs,
    });

    // Log TRUSTMATCH_COMPLETED
    logEvent({
      eventType:  TRUSTMATCH_EVENT_TYPES.TRUSTMATCH_COMPLETED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingId,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata: {
        sessionId,
        latencyMs,
        totalCandidates: workers.length,
        eligible:        filterResult.filterStats.eligible,
        ranked:          rankingResult.totalRanked,
        topScore:        rankingResult.rankingStats?.highestScore,
        topWorkerId:     topWorkers[0]?.workerId || null,
      },
      ...reqCtx,
    });

    return result;

  } catch (err) {
    const latencyMs = Date.now() - startTime;

    logEvent({
      eventType:  TRUSTMATCH_EVENT_TYPES.TRUSTMATCH_FAILED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingId,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata: {
        sessionId,
        error:    err.message,
        latencyMs,
      },
      success:       false,
      failureReason: err.message,
      ...reqCtx,
    });

    throw err;
  }
}

/**
 * Run TrustMatch for a specific worker against a booking.
 * Useful for per-worker evaluation without ranking a full pool.
 *
 * @param {object} params
 * @param {object} params.worker         - Worker User document
 * @param {object} params.booking        - Booking document
 * @param {object} [params.actor]
 * @param {object} [params.reqCtx]
 * @returns {Promise<object>} Single worker TrustMatch result
 */
export async function runWorkerTrustMatch({ worker, booking, actor = {}, reqCtx = {} }) {
  const workerId = String(worker._id);

  const [metrics, trustProfile, skillHistory] = await Promise.all([
    _fetchWorkerMetrics(workerId),
    _fetchTrustProfile(workerId),
    _fetchSkillHistoryForWorker(workerId, booking?.category),
  ]);

  const scoreCard       = scoreWorker({ worker, metrics, trustProfile, skillHistory, distanceKm: null, booking });
  const trustAssessment = evaluateTrust({ worker, trustProfile, metrics, skillHistory });

  const prefAdjustment = { workerId, totalAdjustment: 0, adjustments: [], isNeutral: true };
  const recommendation  = generateWorkerRecommendation({ scoreCard, preferenceAdjustment: prefAdjustment, booking });

  return {
    status: 'success',
    workerId,
    workerName:       worker.name,
    scoreCard,
    trustAssessment,
    recommendation,
    preferenceAdjustment: prefAdjustment,
    evaluatedAt:      new Date().toISOString(),
  };
}

// ─── DB fetch helpers ─────────────────────────────────────────────────────────

async function _fetchCandidateWorkers(booking) {
  // Fetch workers in same city, same category, not deleted, verified, approved
  const query = {
    role:         'worker',
    isVerified:   true,
    isDeleted:    { $ne: true },
    workerStatus: { $in: ['approved_rookie', 'approved_junior', 'approved_senior'] },
  };

  if (booking.city) query.city = booking.city;
  if (booking.category) query.serviceCategory = booking.category;

  return User.find(query).limit(100).lean();
}

async function _batchFetchWorkerMetrics(workerIds, bypassCache) {
  const resultMap   = new Map();
  const toFetch     = [];

  for (const id of workerIds) {
    const cached = bypassCache ? null : _getCached(metricsCache, id);
    if (cached) {
      resultMap.set(id, cached);
    } else {
      toFetch.push(id);
    }
  }

  if (toFetch.length > 0) {
    const docs = await WorkerMetrics.find({ workerId: { $in: toFetch } }).lean();
    for (const doc of docs) {
      const key = String(doc.workerId);
      _setCached(metricsCache, key, doc);
      resultMap.set(key, doc);
    }
  }

  return resultMap;
}

async function _batchFetchTrustProfiles(workerIds, bypassCache) {
  const resultMap = new Map();
  const toFetch   = [];

  for (const id of workerIds) {
    const cached = bypassCache ? null : _getCached(trustProfileCache, id);
    if (cached) {
      resultMap.set(id, cached);
    } else {
      toFetch.push(id);
    }
  }

  if (toFetch.length > 0) {
    const docs = await TrustProfile.find({ workerId: { $in: toFetch } }).lean();
    for (const doc of docs) {
      const key = String(doc.workerId);
      _setCached(trustProfileCache, key, doc);
      resultMap.set(key, doc);
    }
  }

  return resultMap;
}

async function _batchFetchSkillHistory(workerIds, category, bypassCache) {
  const resultMap = new Map();
  if (!category) return resultMap;

  const docs = await WorkerSkillHistory.find({
    workerId: { $in: workerIds },
    category: { $regex: new RegExp(category, 'i') },
  }).lean();

  for (const doc of docs) {
    resultMap.set(String(doc.workerId), doc);
  }

  return resultMap;
}

async function _fetchWorkerMetrics(workerId) {
  const cached = _getCached(metricsCache, workerId);
  if (cached) return cached;
  const doc = await WorkerMetrics.findOne({ workerId }).lean();
  if (doc) _setCached(metricsCache, workerId, doc);
  return doc;
}

async function _fetchTrustProfile(workerId) {
  const cached = _getCached(trustProfileCache, workerId);
  if (cached) return cached;
  const doc = await TrustProfile.findOne({ workerId }).lean();
  if (doc) _setCached(trustProfileCache, workerId, doc);
  return doc;
}

async function _fetchSkillHistoryForWorker(workerId, category) {
  if (!category) return null;
  return WorkerSkillHistory.findOne({
    workerId,
    category: { $regex: new RegExp(category, 'i') },
  }).lean();
}

async function _fetchCustomerData(customerId, bypassCache) {
  const [custMetrics, custBehaviour] = await Promise.all([
    CustomerMetrics.findOne({ customerId }).lean(),
    CustomerBehaviour.findOne({ customerId }).lean(),
  ]);
  return { custMetrics, custBehaviour };
}

// ─── Response assembler ───────────────────────────────────────────────────────

function _assembleFinalResponse({ sessionId, bookingDoc, filterResult, rankingResult, topWorkers, preferenceProfile, latencyMs }) {
  return {
    status:      'success',
    sessionId,
    pipelineVersion: '1.0.0',
    latencyMs,
    timestamp:   new Date().toISOString(),

    // Primary output
    recommendedWorkers: rankingResult.rankedWorkers,
    workerScores: rankingResult.rankedWorkers.map((w) => ({
      workerId:            w.workerId,
      workerName:          w.workerName,
      componentScores:     w.componentScores,
      recommendationScore: w.recommendationScore,
    })),
    scoreBreakdown: rankingResult.rankedWorkers.map((w) => ({
      workerId:          w.workerId,
      scoreContributions:w.scoreContributions,
      weights:           w.scoreContributions ? Object.keys(w.scoreContributions).reduce((obj, k) => {
        obj[k] = w.scoreContributions[k].weight;
        return obj;
      }, {}) : {},
    })),
    ranking: rankingResult.rankedWorkers.map((w) => ({
      rank:               w.rank,
      rankLabel:          w.rankLabel,
      workerId:           w.workerId,
      workerName:         w.workerName,
      workerTier:         w.workerTier,
      recommendationScore:w.recommendationScore,
      recommendationLevel:w.recommendationLevel,
      distanceKm:         w.distanceKm,
    })),
    reasonSummary: rankingResult.rankedWorkers.map((w) => ({
      workerId:          w.workerId,
      reasonSummary:     w.reasonSummary,
      topStrengths:      w.topStrengths,
      topWeaknesses:     w.topWeaknesses,
    })),
    confidence:    rankingResult.rankedWorkers.map((w) => ({
      workerId:  w.workerId,
      confidence:w.confidence,
    })),

    // Summary
    summary: {
      sessionId,
      bookingId:         String(bookingDoc._id || bookingDoc.bookingId),
      category:          bookingDoc.category,
      city:              bookingDoc.city,
      totalCandidates:   filterResult.filterStats.total,
      filteredOut:       filterResult.filterStats.filteredOut,
      eligible:          filterResult.filterStats.eligible,
      ranked:            rankingResult.totalRanked,
      topWorkerId:       topWorkers[0]?.workerId || null,
      topWorkerScore:    topWorkers[0]?.recommendationScore || null,
      topWorkerLevel:    topWorkers[0]?.recommendationLevel || null,
      rankingStats:      rankingResult.rankingStats,
      customerHasPreferences: !preferenceProfile.isNeutral,
    },

    // Grouped view
    groupedByLevel: rankingResult.groupedByLevel,
  };
}

function _noWorkersResult({ sessionId, bookingDoc, filterResult, startTime }) {
  return {
    status:             'no_eligible_workers',
    sessionId,
    pipelineVersion:    '1.0.0',
    latencyMs:          Date.now() - startTime,
    timestamp:          new Date().toISOString(),
    recommendedWorkers: [],
    workerScores:       [],
    scoreBreakdown:     [],
    ranking:            [],
    reasonSummary:      [],
    confidence:         [],
    summary: {
      sessionId,
      bookingId:       String(bookingDoc._id || bookingDoc.bookingId),
      category:        bookingDoc.category,
      city:            bookingDoc.city,
      totalCandidates: filterResult.filterStats.total,
      filteredOut:     filterResult.filterStats.filteredOut,
      eligible:        0,
      ranked:          0,
      topWorkerId:     null,
      topWorkerScore:  null,
      topWorkerLevel:  null,
      rankingStats:    { avgScore: 0, highestScore: 0, lowestScore: 0, levelCounts: {}, flaggedCount: 0, totalBeforeFilters: filterResult.filterStats.total, totalAfterFilters: 0, totalRanked: 0 },
      filterReasons:   filterResult.filterStats.reasonCounts,
    },
    groupedByLevel: { 'Highly Recommended': [], 'Recommended': [], 'Acceptable': [], 'Not Recommended': [] },
  };
}

// ─── Cache management ─────────────────────────────────────────────────────────

export function clearTrustMatchCache() {
  metricsCache.clear();
  trustProfileCache.clear();
}

export function getTrustMatchCacheStats() {
  return {
    metricsCache:      { size: metricsCache.size,     ttlMs: CACHE_TTL_MS, maxSize: MAX_CACHE_SIZE },
    trustProfileCache: { size: trustProfileCache.size, ttlMs: CACHE_TTL_MS, maxSize: MAX_CACHE_SIZE },
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function _generateSessionId() {
  return `tm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
