/**
 * server/ai/multimodal/contextBuilder.js — Unified Context Builder
 *
 * Aggregates image, voice, and text contexts into a single standardized
 * Unified Context object consumed by downstream AI pipeline modules.
 *
 * Input:  ImageContext + VoiceContext + TextContext + booking/customer metadata
 * Output: UnifiedContext with all standardized fields
 *
 * Fields in Unified Context:
 *   service, category, subCategory, description, location,
 *   customer, booking, worker, attachments, language, metadata
 */

import { buildImageContext } from './imageProcessor.js';
import { buildVoiceContext } from './voiceProcessor.js';
import { contextExtraction } from './textProcessor.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const SUPPORTED_MODALITIES = new Set(['text', 'image', 'voice']);

// ─── Unified Context Builder ──────────────────────────────────────────────────

/**
 * Build a Unified Context from one or more multimodal inputs.
 *
 * @param {object} params
 * @param {string|object} [params.text]        - Raw text input or TextContext already built
 * @param {object}        [params.image]       - Image input object or ImageContext already built
 * @param {object}        [params.voice]       - Audio input object or VoiceContext already built
 * @param {object}        [params.bookingCtx]  - Booking metadata { bookingId, status, service, category, subCategory, scheduledAt, city, address, location }
 * @param {object}        [params.customerCtx] - Customer metadata { customerId, name, phone, language, tier }
 * @param {object}        [params.workerCtx]   - Worker metadata { workerId, name, skills, rating }
 * @param {object}        [params.requestCtx]  - Request metadata { requestId, ipAddress, userAgent, timestamp }
 * @param {string}        [params.contextId]   - Override context ID
 * @returns {object} Standardized UnifiedContext
 */
export function buildUnifiedContext({
  text,
  image,
  voice,
  bookingCtx   = {},
  customerCtx  = {},
  workerCtx    = {},
  requestCtx   = {},
  contextId,
} = {}) {
  const unifiedContextId = contextId || _generateContextId('uctx');
  const timestamp        = new Date().toISOString();

  // ── 1. Process each modality ──
  const processedModalities = {
    text:  null,
    image: null,
    voice: null,
  };

  const modalityErrors = [];

  if (text !== undefined && text !== null) {
    try {
      const textCtx = _isPrebuiltContext(text, 'TEXT')
        ? text
        : contextExtraction(text, { contextId: `${unifiedContextId}_txt`, customerId: customerCtx.customerId, bookingId: bookingCtx.bookingId });
      processedModalities.text = textCtx;
    } catch (err) {
      modalityErrors.push({ modality: 'text', error: err.message });
    }
  }

  if (image !== undefined && image !== null) {
    try {
      const imageCtx = _isPrebuiltContext(image, 'IMAGE')
        ? image
        : buildImageContext(image, { contextId: `${unifiedContextId}_img`, uploadedBy: customerCtx.customerId, bookingId: bookingCtx.bookingId });
      processedModalities.image = imageCtx;
    } catch (err) {
      modalityErrors.push({ modality: 'image', error: err.message });
    }
  }

  if (voice !== undefined && voice !== null) {
    try {
      const voiceCtx = _isPrebuiltContext(voice, 'VOICE')
        ? voice
        : buildVoiceContext(voice, { contextId: `${unifiedContextId}_voice`, uploadedBy: customerCtx.customerId, bookingId: bookingCtx.bookingId });
      processedModalities.voice = voiceCtx;
    } catch (err) {
      modalityErrors.push({ modality: 'voice', error: err.message });
    }
  }

  // ── 2. Determine active modalities ──
  const activeModalities = Object.entries(processedModalities)
    .filter(([, ctx]) => ctx !== null)
    .map(([modality]) => modality);

  if (activeModalities.length === 0 && modalityErrors.length === 0) {
    modalityErrors.push({ modality: 'all', error: 'No input modality provided (text, image, or voice).' });
  }

  // ── 3. Derive unified fields from available contexts ──
  const derived = _deriveUnifiedFields(processedModalities, bookingCtx, customerCtx);

  // ── 4. Build standardized Unified Context ──
  return {
    contextId:       unifiedContextId,
    contextVersion:  '1.0.0',

    // ── Service identification fields ──
    service:         derived.service,
    category:        derived.category,
    subCategory:     derived.subCategory,
    description:     derived.description,

    // ── Location fields ──
    location:        _buildLocationField(bookingCtx, processedModalities),

    // ── Entity fields ──
    customer:        _buildCustomerField(customerCtx),
    booking:         _buildBookingField(bookingCtx),
    worker:          _buildWorkerField(workerCtx),

    // ── Attachments (all modality contexts) ──
    attachments: {
      text:  processedModalities.text,
      image: processedModalities.image,
      voice: processedModalities.voice,
    },

    // ── Language ──
    language:        derived.language,

    // ── Modality summary ──
    modalities: {
      active:   activeModalities,
      count:    activeModalities.length,
      hasText:  processedModalities.text  !== null,
      hasImage: processedModalities.image !== null,
      hasVoice: processedModalities.voice !== null,
    },

    // ── Metadata ──
    metadata: {
      contextId:       unifiedContextId,
      createdAt:       timestamp,
      requestId:       requestCtx.requestId   || null,
      ipAddress:       requestCtx.ipAddress   || null,
      userAgent:       requestCtx.userAgent   || null,
      processedAt:     timestamp,
      modalityErrors,
      isComplete:      modalityErrors.length === 0 && activeModalities.length > 0,
      dataQualityScore: _computeDataQualityScore(processedModalities, derived),
      source:          'multimodal_pipeline_v1',
    },

    processingStatus: modalityErrors.length > 0 ? 'PARTIAL' : 'COMPLETE',
    createdAt: timestamp,
  };
}

// ─── Merge Contexts ───────────────────────────────────────────────────────────

/**
 * Merge an additional modality context into an existing UnifiedContext.
 * Useful for asynchronous modality resolution (e.g., voice uploaded after text).
 *
 * @param {object} unifiedContext - Existing UnifiedContext
 * @param {object} additionalCtx  - New modality context (must have contextType)
 * @returns {object} Updated UnifiedContext
 */
export function mergeModalityContext(unifiedContext, additionalCtx) {
  if (!unifiedContext || !additionalCtx) return unifiedContext;

  const modality = additionalCtx.contextType?.toLowerCase();
  if (!SUPPORTED_MODALITIES.has(modality)) {
    return unifiedContext;
  }

  const updatedContext = {
    ...unifiedContext,
    attachments: {
      ...unifiedContext.attachments,
      [modality]: additionalCtx,
    },
    modalities: {
      ...unifiedContext.modalities,
      active:   [...new Set([...unifiedContext.modalities.active, modality])],
      [`has${modality.charAt(0).toUpperCase() + modality.slice(1)}`]: true,
    },
    metadata: {
      ...unifiedContext.metadata,
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  // Recompute count
  updatedContext.modalities.count = updatedContext.modalities.active.length;

  return updatedContext;
}

/**
 * Validate that a UnifiedContext has required fields.
 *
 * @param {object} unifiedContext
 * @returns {{ isValid: boolean, missingFields: string[] }}
 */
export function validateUnifiedContext(unifiedContext) {
  const required = ['contextId', 'modalities', 'attachments', 'metadata', 'createdAt'];
  const missingFields = required.filter((f) => !(f in unifiedContext));

  const hasAnyInput = unifiedContext.modalities?.count > 0;
  if (!hasAnyInput) {
    missingFields.push('modalities.count (at least one modality required)');
  }

  return { isValid: missingFields.length === 0, missingFields };
}

// ─── Field Derivation Helpers ─────────────────────────────────────────────────

function _deriveUnifiedFields(modalities, bookingCtx, customerCtx) {
  const { text, image, voice } = modalities;

  // Service & category: prefer booking context, then text inference
  const service    = bookingCtx.service    || text?.inferred?.serviceCategory || null;
  const category   = bookingCtx.category   || text?.inferred?.serviceCategory || null;
  const subCategory = bookingCtx.subCategory || null;

  // Description: compose from text content
  const description = text?.normalized
    || text?.raw
    || (bookingCtx.notes || null);

  // Language: prefer text detection, then customerCtx
  const language = text?.language?.language
    || customerCtx.language
    || 'en';

  return { service, category, subCategory, description, language };
}

function _buildLocationField(bookingCtx, modalities) {
  // Try GPS from image if available
  const imageGps = modalities.image?.metadata?.gps;

  return {
    city:         bookingCtx.city     || null,
    address:      bookingCtx.address  || null,
    coordinates:  bookingCtx.location?.coordinates
      ? { lat: bookingCtx.location.coordinates[1], lng: bookingCtx.location.coordinates[0] }
      : (imageGps ? { lat: imageGps.latitude, lng: imageGps.longitude } : null),
    gpsSource:    imageGps ? 'image_exif' : (bookingCtx.location ? 'booking' : null),
    pincode:      bookingCtx.pincode   || null,
    state:        bookingCtx.state     || null,
    country:      bookingCtx.country   || 'IN',
  };
}

function _buildCustomerField(customerCtx) {
  return {
    customerId:    customerCtx.customerId    || null,
    name:          customerCtx.name          || null,
    phone:         customerCtx.phone         || null,
    preferredLanguage: customerCtx.language  || null,
    tier:          customerCtx.tier          || 'standard',
    isRepeat:      customerCtx.isRepeat      || false,
  };
}

function _buildBookingField(bookingCtx) {
  return {
    bookingId:   bookingCtx.bookingId   || null,
    status:      bookingCtx.status      || null,
    service:     bookingCtx.service     || null,
    category:    bookingCtx.category    || null,
    scheduledAt: bookingCtx.scheduledAt || null,
    isEmergency: bookingCtx.isEmergency || false,
    amount:      bookingCtx.amount      || null,
  };
}

function _buildWorkerField(workerCtx) {
  if (!workerCtx || !workerCtx.workerId) return null;
  return {
    workerId: workerCtx.workerId || null,
    name:     workerCtx.name    || null,
    skills:   workerCtx.skills  || [],
    rating:   workerCtx.rating  || null,
  };
}

function _computeDataQualityScore(modalities, derived) {
  let score = 0;
  const weights = { text: 0.4, image: 0.3, voice: 0.3 };

  if (modalities.text?.isValid)  score += weights.text;
  if (modalities.image?.isValid) score += weights.image;
  if (modalities.voice?.isValid) score += weights.voice;

  // Bonus: inferred category increases quality
  if (derived.category)     score = Math.min(1, score + 0.05);
  if (derived.description)  score = Math.min(1, score + 0.05);
  if (derived.language !== 'unknown') score = Math.min(1, score + 0.05);

  return Math.round(score * 100) / 100;
}

function _isPrebuiltContext(ctx, expectedType) {
  return ctx && typeof ctx === 'object' && ctx.contextType === expectedType;
}

function _generateContextId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
