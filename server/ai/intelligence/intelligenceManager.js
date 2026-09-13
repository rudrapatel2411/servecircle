/**
 * server/ai/intelligence/intelligenceManager.js — Unified Intelligence Manager
 *
 * Single orchestrator for the platform Intelligence Suite.
 * Coordinates execution across all 5 engines:
 *   1. FairPrice Engine    (estimateFairPrice)
 *   2. Demand Engine       (analyzeDemand)
 *   3. Fraud Intelligence  (analyzeFraud)
 *   4. ETA Engine          (predictEta)
 *   5. Cancellation Engine (predictCancellation)
 *
 * Implements:
 *   - Parallel engine evaluation via Promise.all
 *   - Automatic EventLog dispatches for each engine phase
 *   - Reuse of FeatureStore, WorkerMetrics, CustomerMetrics, TrustProfile, DemandHistory
 *   - In-memory TTL caching for intelligence reports (60s TTL)
 *   - Suite health aggregation (getSuiteHealth)
 */

import { estimateFairPrice, health as fairPriceHealth } from './fairPriceEngine.js';
import { analyzeDemand,     health as demandHealth }    from './demandEngine.js';
import { analyzeFraud,      health as fraudHealth }     from './fraudEngine.js';
import { predictEta,        health as etaHealth }       from './etaEngine.js';
import { predictCancellation, health as cancellationHealth } from './cancellationEngine.js';

import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../../services/eventService.js';

// Mongoose Models
import Booking           from '../../models/Booking.js';
import Service           from '../../models/Service.js';
import User              from '../../models/User.js';
import WorkerMetrics     from '../../models/WorkerMetrics.js';
import CustomerMetrics   from '../../models/CustomerMetrics.js';
import CustomerBehaviour from '../../models/CustomerBehaviour.js';
import TrustProfile      from '../../models/TrustProfile.js';
import DemandHistory     from '../../models/DemandHistory.js';
import FeatureStore      from '../../models/FeatureStore.js';

// ─── Intelligence Event Types ─────────────────────────────────────────────────
export const INTELLIGENCE_EVENT_TYPES = {
  FAIRPRICE_ANALYZED:     'FAIRPRICE_ANALYZED',
  DEMAND_ANALYZED:        'DEMAND_ANALYZED',
  FRAUD_ANALYZED:         'FRAUD_ANALYZED',
  ETA_PREDICTED:          'ETA_PREDICTED',
  CANCELLATION_ANALYZED:  'CANCELLATION_ANALYZED',
  INTELLIGENCE_COMPLETED: 'INTELLIGENCE_COMPLETED',
  INTELLIGENCE_FAILED:    'INTELLIGENCE_FAILED',
};

// ─── In-memory Cache ──────────────────────────────────────────────────────────
const intelligenceCache = new Map();
const CACHE_TTL_MS      = 60_000; // 60 seconds
const MAX_CACHE_SIZE    = 500;

function _getCached(key) {
  const item = intelligenceCache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL_MS) {
    intelligenceCache.delete(key);
    return null;
  }
  return item.data;
}

function _setCached(key, data) {
  if (intelligenceCache.size >= MAX_CACHE_SIZE) {
    intelligenceCache.delete(intelligenceCache.keys().next().value);
  }
  intelligenceCache.set(key, { ts: Date.now(), data });
}

// ─── Core Orchestrator ────────────────────────────────────────────────────────

/**
 * Execute the complete Intelligence Suite pipeline for a booking context.
 *
 * @param {object} params
 * @param {string|object} params.booking           - Booking _id, bookingId string, or document
 * @param {object}        [params.worker]          - Worker document (if assigned)
 * @param {object}        [params.customer]        - Customer document
 * @param {object}        [params.requestMeta]     - Device/IP metadata for fraud analysis
 * @param {object}        [params.actor]           - Requesting user { _id, role }
 * @param {object}        [params.reqCtx]          - Express request context
 * @param {boolean}       [params.bypassCache]     - Bypass report cache
 * @returns {Promise<object>} Unified Intelligence Report
 */
export async function runUnifiedIntelligence({
  booking,
  worker      = null,
  customer    = null,
  requestMeta = {},
  actor       = {},
  reqCtx      = {},
  bypassCache = false,
}) {
  const startTime  = Date.now();
  const reportId   = _generateReportId();

  // ── Step 0: Resolve Booking Document ──
  let bookingDoc = booking;
  if (typeof booking === 'string' || (booking && booking._id === undefined)) {
    bookingDoc = await Booking.findOne({
      $or: [{ bookingId: booking }, { _id: booking.length === 24 ? booking : undefined }].filter(Boolean),
    }).lean();
  }

  if (!bookingDoc) {
    throw new Error(`Booking not found for intelligence analysis: ${booking}`);
  }

  const bookingIdStr  = String(bookingDoc._id || bookingDoc.bookingId);
  const customerIdStr = String(bookingDoc.customer);
  const workerIdStr   = bookingDoc.worker ? String(bookingDoc.worker) : (worker ? String(worker._id) : null);

  // ── Cache Lookup ──
  const cacheKey = `intel_${bookingIdStr}_${workerIdStr || 'none'}`;
  if (!bypassCache) {
    const cached = _getCached(cacheKey);
    if (cached) return { ...cached, _fromCache: true };
  }

  try {
    // ── Step 1: Parallel Database Pre-fetching ──
    const [
      serviceDoc,
      customerMetricsDoc,
      customerBehaviourDoc,
      workerMetricsDoc,
      trustProfileDoc,
      demandHistoryRecords,
      featureStoreDoc,
      recentBookings,
    ] = await Promise.all([
      Service.findOne({ name: { $regex: new RegExp(`^${bookingDoc.service}$`, 'i') } }).lean(),
      CustomerMetrics.findOne({ customerId: customerIdStr }).lean(),
      CustomerBehaviour.findOne({ customerId: customerIdStr }).lean(),
      workerIdStr ? WorkerMetrics.findOne({ workerId: workerIdStr }).lean() : Promise.resolve(null),
      workerIdStr ? TrustProfile.findOne({ workerId: workerIdStr }).lean() : Promise.resolve(null),
      DemandHistory.find({ city: bookingDoc.city || 'Mumbai', serviceCategory: bookingDoc.category }).limit(10).lean(),
      FeatureStore.findOne({ bookingId: bookingDoc._id }).lean(),
      Booking.find({ customer: customerIdStr }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    // Worker document resolution if missing
    let workerDoc = worker;
    if (!workerDoc && workerIdStr) {
      workerDoc = await User.findById(workerIdStr).lean();
    }

    const distanceKm = featureStoreDoc?.distanceKm
      ?? (workerDoc?.location?.coordinates && bookingDoc?.location?.coordinates
          ? _haversineKm(
              workerDoc.location.coordinates[1], workerDoc.location.coordinates[0],
              bookingDoc.location.coordinates[1], bookingDoc.location.coordinates[0]
            )
          : 5.0);

    const workerTier = workerDoc?.workerStatus === 'approved_senior'
      ? 'senior'
      : workerDoc?.workerStatus === 'approved_rookie'
        ? 'rookie'
        : 'junior';

    // ── Step 2: Run Engines in Parallel ──
    const [
      fairPrice,
      demandAnalysis,
      fraudAnalysis,
      etaPrediction,
      cancellationPrediction,
    ] = await Promise.all([
      // 1. FairPrice Engine
      Promise.resolve(
        estimateFairPrice({
          service:          bookingDoc.service,
          category:         bookingDoc.category,
          subCategory:      bookingDoc.subCategory || serviceDoc?.subCategory,
          basePrice:        serviceDoc?.basePrice || bookingDoc.amount,
          historicalPrices: demandHistoryRecords.map((r) => r.averagePrice).filter(Boolean),
          distanceKm,
          workerTier,
          isEmergency:      bookingDoc.isEmergency,
          scheduledDate:    bookingDoc.scheduledDate,
        })
      ),

      // 2. Demand Engine
      Promise.resolve(
        analyzeDemand({
          demandHistoryRecords,
          currentBookingsCount: demandHistoryRecords[0]?.bookingCount || 2,
          city:            bookingDoc.city || 'Mumbai',
          area:            bookingDoc.address,
          serviceCategory: bookingDoc.category,
          time:            bookingDoc.scheduledDate,
        })
      ),

      // 3. Fraud Engine
      Promise.resolve(
        analyzeFraud({
          customer:          customer,
          worker:            workerDoc,
          customerMetrics:   customerMetricsDoc,
          customerBehaviour: customerBehaviourDoc,
          trustProfile:      trustProfileDoc,
          booking:           bookingDoc,
          recentBookings,
          requestMeta,
        })
      ),

      // 4. ETA Engine
      Promise.resolve(
        predictEta({
          distanceKm,
          historicalArrivalTimeMs: demandHistoryRecords[0]?.averageArrivalTimeMs || workerMetricsDoc?.avgArrivalTimeMs,
          workerResponseHistoryMs:  workerMetricsDoc?.avgResponseTimeMs,
          isEmergency:              bookingDoc.isEmergency,
          scheduledDate:            bookingDoc.scheduledDate,
        })
      ),

      // 5. Cancellation Engine
      Promise.resolve(
        predictCancellation({
          workerHistory:   workerMetricsDoc || trustProfileDoc,
          customerHistory: customerBehaviourDoc || customerMetricsDoc,
          isEmergency:     bookingDoc.isEmergency,
          scheduledDate:   bookingDoc.scheduledDate,
          createdAt:       bookingDoc.createdAt,
        })
      ),
    ]);

    // ── Step 3: Dispatch Section 10 Individual EventLogs ──
    logEvent({
      eventType:  INTELLIGENCE_EVENT_TYPES.FAIRPRICE_ANALYZED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingIdStr,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata:   { reportId, estimatedPrice: fairPrice.estimatedPrice, range: `${fairPrice.minimumPrice}-${fairPrice.maximumPrice}` },
      ...reqCtx,
    });

    logEvent({
      eventType:  INTELLIGENCE_EVENT_TYPES.DEMAND_ANALYZED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingIdStr,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata:   { reportId, demandLevel: demandAnalysis.demandLevel, priority: demandAnalysis.suggestedDispatchPriority },
      ...reqCtx,
    });

    logEvent({
      eventType:  INTELLIGENCE_EVENT_TYPES.FRAUD_ANALYZED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingIdStr,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata:   { reportId, riskLevel: fraudAnalysis.riskLevel, action: fraudAnalysis.recommendedAction },
      ...reqCtx,
    });

    logEvent({
      eventType:  INTELLIGENCE_EVENT_TYPES.ETA_PREDICTED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingIdStr,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata:   { reportId, etaMinutes: etaPrediction.estimatedArrivalMinutes, window: etaPrediction.arrivalWindow.formatted },
      ...reqCtx,
    });

    logEvent({
      eventType:  INTELLIGENCE_EVENT_TYPES.CANCELLATION_ANALYZED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingIdStr,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata:   { reportId, riskScore: cancellationPrediction.riskScore, riskLevel: cancellationPrediction.riskLevel },
      ...reqCtx,
    });

    // ── Step 4: Calculate Overall Confidence & Synthesize Recommendations ──
    const confidenceScores = [
      fairPrice.confidence.score,
      demandAnalysis.confidence.score,
      fraudAnalysis.confidence.score,
      etaPrediction.confidence.score,
      cancellationPrediction.confidence.score,
    ];
    const avgConfidenceScore = Math.round((confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) * 100) / 100;
    const overallConfidenceLevel = avgConfidenceScore >= 0.85 ? 'HIGH' : avgConfidenceScore >= 0.75 ? 'MEDIUM' : 'LOW';

    const overallConfidence = {
      score: avgConfidenceScore,
      level: overallConfidenceLevel,
    };

    const summary = _buildSummary({ bookingDoc, fairPrice, demandAnalysis, fraudAnalysis, etaPrediction, cancellationPrediction });
    const recommendations = _buildRecommendations({ fairPrice, demandAnalysis, fraudAnalysis, etaPrediction, cancellationPrediction });

    const latencyMs = Date.now() - startTime;

    // ── Assemble Unified Intelligence Report ──
    const report = {
      status: 'success',
      reportId,
      suiteVersion: '1.0.0',
      latencyMs,
      timestamp: new Date().toISOString(),

      // Core Engine Outputs
      fairPrice,
      demandAnalysis,
      fraudAnalysis,
      etaPrediction,
      cancellationPrediction,

      // Unified Synthesized Wrap
      overallConfidence,
      summary,
      recommendations,

      // Context Meta
      context: {
        bookingId: bookingIdStr,
        service:   bookingDoc.service,
        category:  bookingDoc.category,
        city:      bookingDoc.city,
        customerId: customerIdStr,
        workerId:  workerIdStr,
      },
    };

    // Cache Report
    _setCached(cacheKey, report);

    // Log INTELLIGENCE_COMPLETED
    logEvent({
      eventType:  INTELLIGENCE_EVENT_TYPES.INTELLIGENCE_COMPLETED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingIdStr,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata: {
        reportId,
        latencyMs,
        estimatedPrice: fairPrice.estimatedPrice,
        demandLevel:    demandAnalysis.demandLevel,
        fraudRisk:      fraudAnalysis.riskLevel,
        etaMinutes:     etaPrediction.estimatedArrivalMinutes,
        cancelRisk:     cancellationPrediction.riskLevel,
      },
      ...reqCtx,
    });

    return report;

  } catch (err) {
    const latencyMs = Date.now() - startTime;

    logEvent({
      eventType:  INTELLIGENCE_EVENT_TYPES.INTELLIGENCE_FAILED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId:   bookingIdStr,
      actorId:    actor._id,
      actorRole:  actor.role || 'system',
      metadata:   { reportId, error: err.message, latencyMs },
      success:       false,
      failureReason: err.message,
      ...reqCtx,
    });

    throw err;
  }
}

// ─── Individual Engine Direct Evaluators ──────────────────────────────────────

export function runFairPriceOnly(params)     { return estimateFairPrice(params); }
export function runDemandOnly(params)        { return analyzeDemand(params); }
export function runFraudOnly(params)         { return analyzeFraud(params); }
export function runEtaOnly(params)           { return predictEta(params); }
export function runCancellationOnly(params) { return predictCancellation(params); }

// ─── Health Verification (Section 12) ─────────────────────────────────────────

export function getSuiteHealth() {
  return {
    status: 'healthy',
    suiteVersion: '1.0.0',
    engines: {
      fairPrice:    fairPriceHealth(),
      demand:       demandHealth(),
      fraud:        fraudHealth(),
      eta:          etaHealth(),
      cancellation: cancellationHealth(),
    },
    cacheStats: {
      size: intelligenceCache.size,
      maxSize: MAX_CACHE_SIZE,
      ttlMs: CACHE_TTL_MS,
    },
  };
}

export function clearIntelligenceCache() {
  intelligenceCache.clear();
}

// ─── Internal Synthesizers ────────────────────────────────────────────────────

function _buildSummary({ bookingDoc, fairPrice, demandAnalysis, fraudAnalysis, etaPrediction, cancellationPrediction }) {
  const parts = [];

  parts.push(`Booking for "${bookingDoc.service}" in ${bookingDoc.city || 'Mumbai'}.`);
  parts.push(`Fair price estimated at ₹${fairPrice.estimatedPrice} (Range ₹${fairPrice.minimumPrice}-₹${maximumPrice(fairPrice)}).`);
  parts.push(`Demand level is ${demandAnalysis.demandLevel} with ${demandAnalysis.suggestedDispatchPriority} dispatch priority.`);
  parts.push(`Fraud risk is ${fraudAnalysis.riskLevel} (action: ${fraudAnalysis.recommendedAction}).`);
  parts.push(`ETA estimated at ${etaPrediction.estimatedArrivalMinutes} mins.`);
  parts.push(`Cancellation risk is ${cancellationPrediction.riskLevel} (${cancellationPrediction.riskScore}/100).`);

  return parts.join(' ');
}

function maximumPrice(fp) {
  return fp.maximumPrice || fp.estimatedPrice;
}

function _buildRecommendations({ fairPrice, demandAnalysis, fraudAnalysis, etaPrediction, cancellationPrediction }) {
  const recs = [];

  // Price recommendation
  recs.push(`Set customer price to ₹${fairPrice.estimatedPrice}.`);

  // Dispatch recommendation
  if (demandAnalysis.suggestedDispatchPriority === 'IMMEDIATE') {
    recs.push('High demand area — trigger immediate priority worker dispatch.');
  } else if (demandAnalysis.suggestedDispatchPriority === 'PRIORITY') {
    recs.push('Elevated demand — assign priority dispatch queue.');
  }

  // Security recommendation
  if (fraudAnalysis.recommendedAction === 'BLOCK') {
    recs.push('CRITICAL RISK: Block booking and mandate admin verification.');
  } else if (fraudAnalysis.recommendedAction === 'VERIFY_REQUIRED') {
    recs.push('High risk detected — require OTP verification before worker dispatch.');
  }

  // Cancellation mitigation recommendation
  if (cancellationPrediction.riskLevel === 'HIGH' || cancellationPrediction.riskLevel === 'CRITICAL') {
    recs.push(`High cancellation risk (${cancellationPrediction.riskScore}/100) — send booking confirmation reminder.`);
  }

  return recs;
}

function _haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
}

function _generateReportId() {
  return `intel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
