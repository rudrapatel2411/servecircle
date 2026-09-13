/**
 * server/ai/intelligence/etaEngine.js — ETA Engine
 *
 * Estimates worker arrival time (ETA in minutes & arrival window) using:
 *   - Geographic distance (Haversine km)
 *   - Average urban travel speed heuristic (20 km/h urban baseline)
 *   - Worker historical response & dispatch latency
 *   - Historical category arrival times
 *   - Emergency express dispatch priority adjustments
 *
 * NO external traffic APIs. Rule-based deterministic calculations.
 */

const DEFAULT_URBAN_SPEED_KMH = 22; // 22 km/h average city transit speed
const BASE_PREP_TIME_MINUTES = 10;   // 10 mins baseline dispatch prep
const EMERGENCY_PREP_TIME_MINUTES = 3; // 3 mins emergency express prep

// ─── Health Metadata ──────────────────────────────────────────────────────────
export function health() {
  return {
    loaded: true,
    ready: true,
    version: '1.0.0',
    supportedFeatures: [
      'urban-speed-model',
      'historical-arrival-blend',
      'worker-dispatch-latency-adjustment',
      'emergency-priority-acceleration',
      'arrival-window-bounds',
    ],
  };
}

// ─── Core Engine Function ─────────────────────────────────────────────────────

/**
 * Estimate arrival time (ETA) for a booking worker assignment.
 *
 * @param {object} params
 * @param {number} [params.distanceKm]                - Worker distance to location in km
 * @param {number} [params.historicalArrivalTimeMs]  - Historical category/area avg arrival time (ms)
 * @param {number} [params.workerResponseHistoryMs]   - Worker's avg response/dispatch time (ms)
 * @param {boolean} [params.isEmergency]              - Emergency flag
 * @param {Date|string} [params.scheduledDate]        - Booking scheduled time
 * @returns {object} EtaPredictionResult
 */
export function predictEta({
  distanceKm                = null,
  historicalArrivalTimeMs  = null,
  workerResponseHistoryMs   = null,
  isEmergency              = false,
  scheduledDate            = null,
} = {}) {
  const factors = [];

  // 1. Calculate Travel Time from Distance
  const dist = typeof distanceKm === 'number' && distanceKm >= 0 ? distanceKm : 5.0; // fallback 5km
  const travelTimeMinutes = Math.round((dist / DEFAULT_URBAN_SPEED_KMH) * 60);

  factors.push({
    factor: 'Urban Transit Travel Time',
    minutes: travelTimeMinutes,
    reason: `Estimated ${travelTimeMinutes} mins travel for ${dist.toFixed(1)} km at avg urban speed ${DEFAULT_URBAN_SPEED_KMH} km/h.`,
  });

  // 2. Dispatch Prep & Response Time
  let prepMinutes = isEmergency ? EMERGENCY_PREP_TIME_MINUTES : BASE_PREP_TIME_MINUTES;

  if (typeof workerResponseHistoryMs === 'number' && workerResponseHistoryMs > 0) {
    const historicalResponseMins = Math.round(workerResponseHistoryMs / 60000);
    prepMinutes = Math.round((prepMinutes + historicalResponseMins) / 2);
    factors.push({
      factor: 'Worker Historical Dispatch Prep',
      minutes: prepMinutes,
      reason: `Blended worker historical response time (${historicalResponseMins} mins avg).`,
    });
  } else {
    factors.push({
      factor: 'Baseline Dispatch Prep',
      minutes: prepMinutes,
      reason: isEmergency
        ? 'Express 3 min emergency prep window.'
        : 'Standard 10 min worker dispatch prep window.',
    });
  }

  // 3. Blend Historical Arrival Signal (if available)
  let rawEtaMinutes = travelTimeMinutes + prepMinutes;

  if (typeof historicalArrivalTimeMs === 'number' && historicalArrivalTimeMs > 0) {
    const histArrivalMins = Math.round(historicalArrivalTimeMs / 60000);
    // Blend 70% distance model + 30% historical average
    const blended = Math.round(rawEtaMinutes * 0.70 + histArrivalMins * 0.30);
    factors.push({
      factor: 'Historical Category Arrival Blend',
      minutes: blended - rawEtaMinutes,
      reason: `Adjusted using area/category historical average arrival time of ${histArrivalMins} mins.`,
    });
    rawEtaMinutes = blended;
  }

  // Ensure reasonable minimum (at least 5 mins)
  const estimatedArrivalMinutes = Math.max(5, rawEtaMinutes);

  // 4. Calculate Arrival Window Bounds (+/- 25% or min 5 mins)
  const windowBufferMinutes = Math.max(5, Math.round(estimatedArrivalMinutes * 0.20));
  const minMinutes = Math.max(3, estimatedArrivalMinutes - windowBufferMinutes);
  const maxMinutes = estimatedArrivalMinutes + windowBufferMinutes;

  // Format arrival window timestamp
  const now = new Date();
  const etaMinDate = new Date(now.getTime() + minMinutes * 60000);
  const etaMaxDate = new Date(now.getTime() + maxMinutes * 60000);

  const formattedMin = _formatTime(etaMinDate);
  const formattedMax = _formatTime(etaMaxDate);

  const arrivalWindow = {
    minMinutes,
    maxMinutes,
    formatted: `${minMinutes}–${maxMinutes} mins (${formattedMin} - ${formattedMax})`,
    estimatedMinTime: etaMinDate.toISOString(),
    estimatedMaxTime: etaMaxDate.toISOString(),
  };

  // Determine Confidence
  const hasHist = typeof historicalArrivalTimeMs === 'number' && historicalArrivalTimeMs > 0;
  const hasWorkerHist = typeof workerResponseHistoryMs === 'number' && workerResponseHistoryMs > 0;

  const confidenceScore = hasHist && hasWorkerHist ? 0.90 : distanceKm !== null ? 0.80 : 0.65;
  const etaConfidence = confidenceScore >= 0.85 ? 'HIGH' : confidenceScore >= 0.75 ? 'MEDIUM' : 'LOW';

  return {
    estimatedArrivalMinutes,
    arrivalWindow,
    etaConfidence,
    confidence: {
      score: confidenceScore,
      level: etaConfidence,
    },
    factors,
    context: {
      distanceKm: dist,
      isEmergency: !!isEmergency,
      hasHistoricalData: hasHist,
    },
    predictedAt: new Date().toISOString(),
  };
}

function _formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
