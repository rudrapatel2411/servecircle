/**
 * server/ai/intelligence/fairPriceEngine.js — FairPrice Engine
 *
 * Computes deterministic fair price estimation for a service booking based on:
 *   - Base price / historical prices
 *   - Service category & subcategory multipliers
 *   - Distance (travel fee surcharge)
 *   - Worker Tier (senior vs rookie/junior rate adjustments)
 *   - Emergency flag (surge pricing multiplier)
 *   - Time of booking (peak hour / night hour surcharges)
 *
 * NO randomness. NO ML. Rule-based architecture ready for future model substitution.
 */

// ─── Pricing Constants ────────────────────────────────────────────────────────
const BASE_FALLBACK_PRICE = 500; // INR fallback if service base price unavailable

const TIER_MULTIPLIERS = {
  rookie: 0.90,  // 10% discount for rookie trainees
  junior: 1.00,  // Standard base rate
  senior: 1.20,  // 20% premium for senior certified workers
};

const TIME_SURCHARGES = {
  night:     0.25, // +25% between 21:00 and 06:00
  peakHours: 0.15, // +15% during 08:00-10:00 and 17:00-19:00
  regular:   0.00,
};

const EMERGENCY_SURCHARGE_MULTIPLIER = 1.35; // +35% for emergency instant dispatch
const DISTANCE_BASE_FREE_KM = 5;
const DISTANCE_FEE_PER_KM = 15; // ₹15 per km beyond 5 km

// ─── Health Metadata ──────────────────────────────────────────────────────────
export function health() {
  return {
    loaded: true,
    ready: true,
    version: '1.0.0',
    supportedFeatures: [
      'base-price-benchmark',
      'worker-tier-multiplier',
      'emergency-surge',
      'distance-travel-fee',
      'time-of-day-surcharge',
    ],
  };
}

// ─── Core Engine Function ─────────────────────────────────────────────────────

/**
 * Estimate fair price for a booking request.
 *
 * @param {object} params
 * @param {string} [params.service]            - Service name
 * @param {string} [params.category]           - Service category
 * @param {string} [params.subCategory]        - Subcategory
 * @param {number} [params.basePrice]          - Catalog base price if available
 * @param {number[]} [params.historicalPrices] - Array of historical prices for service
 * @param {number} [params.distanceKm]         - Distance from worker/hub to location
 * @param {string} [params.workerTier]         - 'rookie' | 'junior' | 'senior'
 * @param {boolean} [params.isEmergency]       - Emergency flag
 * @param {Date|string} [params.scheduledDate] - Scheduled date/time
 * @returns {object} FairPriceResult
 */
export function estimateFairPrice({
  service = 'General Service',
  category = 'General',
  subCategory = null,
  basePrice = null,
  historicalPrices = [],
  distanceKm = 0,
  workerTier = 'junior',
  isEmergency = false,
  scheduledDate = new Date(),
} = {}) {
  const priceFactors = [];

  // 1. Determine Benchmark Base Price
  let rawBase = basePrice;
  if (!rawBase || rawBase <= 0) {
    if (Array.isArray(historicalPrices) && historicalPrices.length > 0) {
      const validPrices = historicalPrices.filter((p) => typeof p === 'number' && p > 0);
      if (validPrices.length > 0) {
        rawBase = Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length);
        priceFactors.push({
          factor: 'Historical Price Average',
          adjustment: 0,
          reason: `Derived base price ₹${rawBase} from ${validPrices.length} historical bookings.`,
        });
      }
    }
  }
  if (!rawBase || rawBase <= 0) {
    rawBase = BASE_FALLBACK_PRICE;
    priceFactors.push({
      factor: 'Fallback Base Price',
      adjustment: 0,
      reason: `Default fallback base price ₹${rawBase} applied.`,
    });
  } else if (!priceFactors.some((f) => f.factor === 'Historical Price Average')) {
    priceFactors.push({
      factor: 'Catalog Base Price',
      adjustment: 0,
      reason: `Standard catalog price ₹${rawBase} for "${service}".`,
    });
  }

  let runningTotal = rawBase;

  // 2. Worker Tier Multiplier
  const tierKey = (workerTier || 'junior').toLowerCase();
  const tierMult = TIER_MULTIPLIERS[tierKey] ?? 1.00;
  const tierDelta = Math.round(rawBase * (tierMult - 1));
  if (tierDelta !== 0) {
    runningTotal += tierDelta;
    priceFactors.push({
      factor: 'Worker Tier Rate',
      adjustment: tierDelta,
      reason: tierDelta > 0
        ? `+₹${tierDelta} premium for ${tierKey} worker.`
        : `-₹${Math.abs(tierDelta)} discount for ${tierKey} trainee worker.`,
    });
  }

  // 3. Emergency Surge
  if (isEmergency) {
    const surgeAmount = Math.round(runningTotal * (EMERGENCY_SURCHARGE_MULTIPLIER - 1));
    runningTotal += surgeAmount;
    priceFactors.push({
      factor: 'Emergency Dispatch Surge',
      adjustment: surgeAmount,
      reason: `+₹${surgeAmount} (+35%) emergency express dispatch fee.`,
    });
  }

  // 4. Time of Day Surcharge
  const dateObj = scheduledDate ? new Date(scheduledDate) : new Date();
  const hour = isNaN(dateObj.getTime()) ? new Date().getHours() : dateObj.getHours();

  let timeMultiplier = TIME_SURCHARGES.regular;
  let timeReason = null;

  if (hour >= 21 || hour < 6) {
    timeMultiplier = TIME_SURCHARGES.night;
    timeReason = `+25% night service fee (slot: ${hour}:00).`;
  } else if ((hour >= 8 && hour < 10) || (hour >= 17 && hour < 19)) {
    timeMultiplier = TIME_SURCHARGES.peakHours;
    timeReason = `+15% peak hour demand surcharge (slot: ${hour}:00).`;
  }

  if (timeMultiplier > 0) {
    const timeAmount = Math.round(rawBase * timeMultiplier);
    runningTotal += timeAmount;
    priceFactors.push({
      factor: 'Time Slot Surcharge',
      adjustment: timeAmount,
      reason: timeReason,
    });
  }

  // 5. Distance Travel Surcharge
  const dist = typeof distanceKm === 'number' && distanceKm > 0 ? distanceKm : 0;
  if (dist > DISTANCE_BASE_FREE_KM) {
    const extraKm = Math.ceil(dist - DISTANCE_BASE_FREE_KM);
    const travelFee = extraKm * DISTANCE_FEE_PER_KM;
    runningTotal += travelFee;
    priceFactors.push({
      factor: 'Travel Distance Fee',
      adjustment: travelFee,
      reason: `+₹${travelFee} for ${extraKm} km beyond ${DISTANCE_BASE_FREE_KM} km free radius (₹${DISTANCE_FEE_PER_KM}/km).`,
    });
  }

  // Calculate final bounds
  const estimatedPrice = Math.max(100, Math.round(runningTotal / 10) * 10); // round to nearest 10
  const minimumPrice   = Math.max(100, Math.round((estimatedPrice * 0.85) / 10) * 10);
  const maximumPrice   = Math.round((estimatedPrice * 1.25) / 10) * 10;

  // Compute confidence
  const hasHist = Array.isArray(historicalPrices) && historicalPrices.length >= 5;
  const confidenceScore = hasHist ? 0.92 : basePrice ? 0.85 : 0.70;
  const confidenceLevel = confidenceScore >= 0.85 ? 'HIGH' : 'MEDIUM';

  const priceExplanation = _generateExplanation({
    estimatedPrice,
    minimumPrice,
    maximumPrice,
    service,
    priceFactors,
  });

  return {
    estimatedPrice,
    minimumPrice,
    maximumPrice,
    currency: 'INR',
    priceFactors,
    priceExplanation,
    confidence: {
      score: confidenceScore,
      level: confidenceLevel,
    },
    context: {
      service,
      category,
      subCategory,
      workerTier,
      isEmergency: !!isEmergency,
      distanceKm: dist,
      scheduledHour: hour,
    },
    calculatedAt: new Date().toISOString(),
  };
}

function _generateExplanation({ estimatedPrice, minimumPrice, maximumPrice, service, priceFactors }) {
  const parts = [`Estimated fair price for ${service} is ₹${estimatedPrice} (range ₹${minimumPrice}–₹${maximumPrice}).`];
  const activeAdjustments = priceFactors.filter((f) => f.adjustment !== 0);
  if (activeAdjustments.length > 0) {
    const adjText = activeAdjustments.map((a) => a.reason).join(' ');
    parts.push(`Price breakdown factors: ${adjText}`);
  } else {
    parts.push('Standard baseline catalog rate applied without surcharges.');
  }
  return parts.join(' ');
}
