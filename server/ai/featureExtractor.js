/**
 * server/ai/featureExtractor.js — Feature Extraction Pipeline
 *
 * Extracts structured features from MongoDB models across 10 domains:
 *   1. Booking Features
 *   2. Worker Features
 *   3. Customer Features
 *   4. Trust Features
 *   5. Demand Features
 *   6. Timeline Features
 *   7. Complaint Features
 *   8. Review Features
 *   9. Geo Features
 *  10. Service Features
 *
 * Produces ONE standardized feature vector object.
 * Implements in-memory TTL caching to prevent redundant database queries.
 */

import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import TrustProfile from '../models/TrustProfile.js';
import WorkerMetrics from '../models/WorkerMetrics.js';
import CustomerMetrics from '../models/CustomerMetrics.js';
import ComplaintMetrics from '../models/ComplaintMetrics.js';
import DemandHistory from '../models/DemandHistory.js';
import WorkerSkillHistory from '../models/WorkerSkillHistory.js';
import CustomerBehaviour from '../models/CustomerBehaviour.js';
import Review from '../models/Review.js';
import { FEATURE_LIMITS } from '../config/aiConfig.js';

// Multimodal context features (Phase 3 Batch 3)
import { buildUnifiedContext } from './multimodal/contextBuilder.js';
import { analyzeProblem }     from './multimodal/problemAnalyzer.js';

// In-memory cache: key -> { timestamp, data }
const featureCache = new Map();

function getCached(key) {
  const item = featureCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > FEATURE_LIMITS.CACHE_TTL_MS) {
    featureCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  if (featureCache.size >= FEATURE_LIMITS.MAX_CACHE_ITEMS) {
    const oldestKey = featureCache.keys().next().value;
    featureCache.delete(oldestKey);
  }
  featureCache.set(key, { timestamp: Date.now(), data });
}

/**
 * Extract unified Feature Vector for a entity context.
 *
 * @param {object} params
 * @param {string} [params.bookingId]
 * @param {string} [params.workerId]
 * @param {string} [params.customerId]
 * @param {string} [params.serviceName]
 * @param {boolean} [params.bypassCache=false]
 * @returns {Promise<object>} Standardized Feature Vector
 */
export async function extractFeatures({
  bookingId,
  workerId,
  customerId,
  serviceName,
  bypassCache = false,
} = {}) {
  const cacheKey = `fv_${bookingId || ''}_${workerId || ''}_${customerId || ''}_${serviceName || ''}`;
  if (!bypassCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  // Fetch underlying records concurrently
  const [
    bookingDoc,
    workerDoc,
    customerDoc,
    serviceDoc,
    trustDoc,
    workerMetricsDoc,
    customerMetricsDoc,
    complaintMetricsDoc,
    customerBehaviourDoc,
    workerSkillDoc,
    reviewsDocs,
  ] = await Promise.all([
    bookingId ? Booking.findById(bookingId).lean() : null,
    workerId ? User.findById(workerId).lean() : null,
    customerId ? User.findById(customerId).lean() : null,
    serviceName ? Service.findOne({ name: serviceName }).lean() : null,
    workerId ? TrustProfile.findOne({ workerId }).lean() : null,
    workerId ? WorkerMetrics.findOne({ workerId }).lean() : null,
    customerId ? CustomerMetrics.findOne({ customerId }).lean() : null,
    ComplaintMetrics.findOne({ entityType: 'global' }).lean(),
    customerId ? CustomerBehaviour.findOne({ customerId }).lean() : null,
    (workerId && serviceName) ? WorkerSkillHistory.findOne({ workerId, service: serviceName }).lean() : null,
    workerId ? Review.find({ worker: workerId }).limit(10).lean() : [],
  ]);

  // Infer missing contextual IDs from booking if available
  const activeWorkerId = workerId || bookingDoc?.worker;
  const activeCustomerId = customerId || bookingDoc?.customer;
  const activeCategory = bookingDoc?.category || serviceDoc?.category || 'unknown';
  const activeCity = bookingDoc?.city || workerDoc?.city || 'Mumbai';

  // Fetch DemandHistory based on inferred location/category
  const demandDoc = await DemandHistory.findOne({
    city: activeCity,
    serviceCategory: activeCategory,
  }).sort({ date: -1 }).lean();

  // Build domain feature sub-vectors
  const bookingFeatures   = _extractBookingFeatures(bookingDoc);
  const workerFeatures    = _extractWorkerFeatures(workerDoc, workerMetricsDoc);
  const customerFeatures  = _extractCustomerFeatures(customerDoc, customerMetricsDoc, customerBehaviourDoc);
  const trustFeatures     = _extractTrustFeatures(trustDoc);
  const demandFeatures    = _extractDemandFeatures(demandDoc);
  const timelineFeatures  = _extractTimelineFeatures(bookingDoc);
  const complaintFeatures = _extractComplaintFeatures(complaintMetricsDoc);
  const reviewFeatures    = _extractReviewFeatures(reviewsDocs);
  const geoFeatures       = _extractGeoFeatures(bookingDoc, workerDoc);
  const serviceFeatures   = _extractServiceFeatures(serviceDoc, workerSkillDoc);

  const featureVector = {
    extractedAt: new Date().toISOString(),
    context: {
      bookingId: bookingId || null,
      workerId: activeWorkerId ? String(activeWorkerId) : null,
      customerId: activeCustomerId ? String(activeCustomerId) : null,
      serviceName: serviceName || bookingDoc?.service || null,
      city: activeCity,
      category: activeCategory,
    },
    features: {
      booking:   bookingFeatures,
      worker:    workerFeatures,
      customer:  customerFeatures,
      trust:     trustFeatures,
      demand:    demandFeatures,
      timeline:  timelineFeatures,
      complaint: complaintFeatures,
      review:    reviewFeatures,
      geo:       geoFeatures,
      service:   serviceFeatures,
    },
  };

  setCached(cacheKey, featureVector);
  return featureVector;
}

// ─── DOMAIN FEATURE EXTRACTORS ───────────────────────────────────────────────

function _extractBookingFeatures(booking) {
  if (!booking) return { exists: false, amount: 0, status: 'none', isEmergency: false };
  const scheduled = booking.scheduledDate ? new Date(booking.scheduledDate) : null;
  return {
    exists: true,
    amount: booking.amount || 0,
    status: booking.status || 'pending',
    isEmergency: !!booking.isEmergency,
    scheduledHour: scheduled ? scheduled.getHours() : null,
    scheduledDayOfWeek: scheduled ? scheduled.getDay() : null,
    paymentStatus: booking.paymentStatus || 'pending',
    paymentMethod: booking.paymentMethod || null,
  };
}

function _extractWorkerFeatures(worker, metrics) {
  if (!worker) return { exists: false, isVerified: false, workerStatus: 'none', completionRate: 0 };
  return {
    exists: true,
    isVerified: !!worker.isVerified,
    workerStatus: worker.workerStatus || 'rookie',
    rating: worker.rating || 0,
    completedJobs: worker.completedJobs || 0,
    experienceYears: worker.experience || 0,
    completionRate: metrics?.successRate || 0,
    acceptanceRate: metrics?.acceptanceRate || 0,
    totalAssignments: metrics?.totalAssignments || 0,
    avgArrivalTimeMs: metrics?.avgArrivalTimeMs || 0,
  };
}

function _extractCustomerFeatures(customer, metrics, behaviour) {
  if (!customer) return { exists: false, totalBookings: 0, totalSpend: 0 };
  return {
    exists: true,
    totalBookings: metrics?.totalBookings || 0,
    totalSpend: metrics?.totalSpend || 0,
    avgSpendPerJob: metrics?.avgSpendPerJob || 0,
    isRepeatCustomer: !!metrics?.isRepeatCustomer,
    emergencyRate: behaviour?.emergencyUsage?.rate || 0,
    cancellationRate: behaviour?.cancellationPattern?.rate || 0,
    reviewRate: behaviour?.reviewPattern?.reviewRate || 0,
  };
}

function _extractTrustFeatures(trust) {
  if (!trust) return { exists: false, identityVerified: false, profileCompleteness: 0, complaintRate: 0 };
  return {
    exists: true,
    identityVerified: trust.identityVerification?.status === 'verified',
    skillVerified: trust.skillVerification?.status === 'verified',
    profileCompleteness: trust.profileCompleteness || 0,
    completionRate: trust.completionRate || 0,
    acceptanceRate: trust.acceptanceRate || 0,
    complaintRate: trust.complaintRate || 0,
    refundRate: trust.refundRate || 0,
    averageRating: trust.averageRating || 0,
    adminWarningCount: trust.adminWarnings?.count || 0,
  };
}

function _extractDemandFeatures(demand) {
  if (!demand) return { exists: false, bookingCount: 0, averagePrice: 0 };
  return {
    exists: true,
    city: demand.city,
    serviceCategory: demand.serviceCategory,
    bookingCount: demand.bookingCount || 0,
    completedCount: demand.completedCount || 0,
    cancelledCount: demand.cancelledCount || 0,
    averagePrice: demand.averagePrice || 0,
  };
}

function _extractTimelineFeatures(booking) {
  if (!booking || !booking.timeline) return { milestoneCount: 0, milestones: [] };
  return {
    milestoneCount: booking.timeline.length,
    milestones: booking.timeline.map((t) => t.event),
    createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : null,
    jobStartedAt: booking.jobStartedAt ? new Date(booking.jobStartedAt).toISOString() : null,
    jobCompletedAt: booking.jobCompletedAt ? new Date(booking.jobCompletedAt).toISOString() : null,
  };
}

function _extractComplaintFeatures(complaintMetrics) {
  if (!complaintMetrics) return { totalComplaints: 0, resolvedComplaints: 0 };
  return {
    totalComplaints: complaintMetrics.totalComplaints || 0,
    resolvedComplaints: complaintMetrics.resolvedComplaints || 0,
    pendingComplaints: complaintMetrics.pendingComplaints || 0,
    avgResolutionTimeMs: complaintMetrics.averageResolutionTimeMs || 0,
  };
}

function _extractReviewFeatures(reviews) {
  if (!reviews || reviews.length === 0) return { count: 0, avgRating: 0 };
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return {
    count: reviews.length,
    avgRating: sum / reviews.length,
    recentComments: reviews.map((r) => r.comment).filter(Boolean).slice(0, 3),
  };
}

function _extractGeoFeatures(booking, worker) {
  const bookingCoords = booking?.location?.coordinates || null;
  const workerCoords = worker?.location?.coordinates || null;
  let distanceKm = null;

  if (bookingCoords && workerCoords && bookingCoords.length === 2 && workerCoords.length === 2) {
    distanceKm = _haversineDistance(
      workerCoords[1], workerCoords[0],
      bookingCoords[1], bookingCoords[0]
    );
  }

  return {
    hasBookingLocation: !!bookingCoords,
    hasWorkerLocation: !!workerCoords,
    distanceKm: distanceKm ? Math.round(distanceKm * 100) / 100 : null,
    city: booking?.city || worker?.city || null,
  };
}

function _extractServiceFeatures(service, skillHistory) {
  if (!service) return { exists: false, basePrice: 0 };
  return {
    exists: true,
    name: service.name,
    category: service.category,
    basePrice: service.basePrice || 0,
    estimatedDurationMinutes: service.estimatedDuration || 60,
    isActive: !!service.isActive,
    workerSkillJobCount: skillHistory?.jobCount || 0,
    workerSkillAvgRating: skillHistory?.averageRating || 0,
  };
}

function _haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Clear feature cache for testing or manual invalidate */
export function clearFeatureCache() {
  featureCache.clear();
}

// ─── Multimodal Feature Extraction (Phase 3 Batch 3) ───────────────────────

/**
 * Extend the standard feature vector with multimodal signals.
 *
 * Builds a UnifiedContext from optional multimodal inputs (text, image, voice)
 * and merges the resulting high-level features (problem category, urgency signals,
 * language, GPS from image) into the base feature vector.
 *
 * This does NOT call any external models. Rule-based extraction only.
 *
 * @param {object} params
 * @param {string} [params.bookingId]
 * @param {string} [params.workerId]
 * @param {string} [params.customerId]
 * @param {string} [params.serviceName]
 * @param {string|object} [params.text]      - Raw text from customer
 * @param {object}        [params.image]     - Image input metadata
 * @param {object}        [params.voice]     - Voice input metadata
 * @param {boolean}       [params.bypassCache]
 * @returns {Promise<object>} Enhanced feature vector with multimodal features sub-key
 */
export async function extractMultimodalFeatures({
  bookingId,
  workerId,
  customerId,
  serviceName,
  text,
  image,
  voice,
  bypassCache = false,
} = {}) {
  // Get base features from standard extraction pipeline
  const baseVector = await extractFeatures({ bookingId, workerId, customerId, serviceName, bypassCache });

  // If no multimodal inputs provided, return base vector unchanged
  if (!text && !image && !voice) {
    return { ...baseVector, multimodal: null };
  }

  // Build a lightweight UnifiedContext for feature augmentation
  const unifiedCtx = buildUnifiedContext({
    text,
    image,
    voice,
    bookingCtx: {
      bookingId,
      service:  serviceName || baseVector.context.serviceName,
      category: baseVector.context.category,
      city:     baseVector.context.city,
    },
    customerCtx: {
      customerId: customerId || baseVector.context.customerId,
    },
  });

  // Run problem analysis for structured category signal
  const problemAnalysis = analyzeProblem(unifiedCtx);

  // Compose multimodal feature sub-vector
  const multimodalFeatures = {
    hasMultimodalInput:  true,
    activeModalities:    unifiedCtx.modalities.active,
    modalityCount:       unifiedCtx.modalities.count,
    hasText:             unifiedCtx.modalities.hasText,
    hasImage:            unifiedCtx.modalities.hasImage,
    hasVoice:            unifiedCtx.modalities.hasVoice,

    // Text-derived features
    textWordCount:       unifiedCtx.attachments?.text?.wordCount || 0,
    detectedLanguage:    unifiedCtx.language,
    inferredCategory:    unifiedCtx.attachments?.text?.inferred?.serviceCategory || null,
    urgencyKeywordCount: unifiedCtx.attachments?.text?.keywords?.urgency?.length || 0,
    serviceKeywordCount: unifiedCtx.attachments?.text?.keywords?.service?.length || 0,

    // Image-derived features
    imageHasGps:         !!unifiedCtx.attachments?.image?.metadata?.gps,
    imageGps:            unifiedCtx.attachments?.image?.metadata?.gps || null,
    imageFormat:         unifiedCtx.attachments?.image?.metadata?.format?.mimeType || null,
    imageValid:          unifiedCtx.attachments?.image?.isValid || false,

    // Voice-derived features
    voiceDurationSeconds:unifiedCtx.attachments?.voice?.metadata?.audio?.durationSeconds || null,
    voiceQualityLevel:   unifiedCtx.attachments?.voice?.metadata?.quality?.level || null,
    voiceValid:          unifiedCtx.attachments?.voice?.isValid || false,

    // Problem analysis signals
    problemCategory:     problemAnalysis.problemCategory,
    problemConfidence:   problemAnalysis.confidence,
    topProblemId:        problemAnalysis.possibleProblems?.[0]?.id || null,
    missingInfoCount:    problemAnalysis.missingInformation?.length || 0,
    dataQualityScore:    unifiedCtx.metadata?.dataQualityScore || 0,

    contextId:           unifiedCtx.contextId,
    extractedAt:         new Date().toISOString(),
  };

  return {
    ...baseVector,
    multimodal: multimodalFeatures,
  };
}
