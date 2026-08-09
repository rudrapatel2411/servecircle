/**
 * server/ai/intelligence/demandEngine.js — Demand Engine
 *
 * Deterministic demand analysis and volume forecasting based on:
 *   - Hourly demand snapshots (DemandHistory records)
 *   - Real-time pending booking volume
 *   - Geographic area & service category demand density
 *   - Day of week & hour of day seasonal curves
 *
 * Output: Demand level, expected volume, and suggested dispatch priority.
 */

export const DEMAND_LEVELS = {
  VERY_LOW:  { label: 'Very Low',  minScore: 0,  maxScore: 20, priority: 'STANDARD'  },
  LOW:       { label: 'Low',       minScore: 21, maxScore: 40, priority: 'STANDARD'  },
  MEDIUM:    { label: 'Medium',    minScore: 41, maxScore: 65, priority: 'STANDARD'  },
  HIGH:      { label: 'High',      minScore: 66, maxScore: 85, priority: 'PRIORITY'  },
  VERY_HIGH: { label: 'Very High', minScore: 86, maxScore: 100, priority: 'IMMEDIATE' },
};

// Standard hour-of-day multipliers (0-23) based on platform demand benchmarks
const HOUR_DEMAND_CURVE = [
  0.3, 0.2, 0.1, 0.1, 0.2, 0.4, // 00:00 - 05:00 (Very low)
  0.7, 1.2, 1.6, 1.8, 1.5, 1.3, // 06:00 - 11:00 (Morning peak)
  1.1, 1.0, 0.9, 1.1, 1.4, 1.7, // 12:00 - 17:00 (Afternoon / Evening peak)
  1.8, 1.5, 1.2, 0.9, 0.6, 0.4  // 18:00 - 23:00 (Evening unwind)
];

// Day-of-week demand multipliers (0=Sun, 6=Sat)
const DAY_DEMAND_CURVE = [1.4, 0.9, 0.9, 1.0, 1.0, 1.2, 1.5]; // Weekend spikes

// ─── Health Metadata ──────────────────────────────────────────────────────────
export function health() {
  return {
    loaded: true,
    ready: true,
    version: '1.0.0',
    supportedFeatures: [
      'historical-hourly-volume',
      'active-booking-density',
      'seasonal-hour-curve',
      'weekend-demand-multiplier',
      'dispatch-priority-recommendation',
    ],
  };
}

// ─── Core Engine Function ─────────────────────────────────────────────────────

/**
 * Analyze demand for a given area, category, and time context.
 *
 * @param {object} params
 * @param {object[]} [params.demandHistoryRecords] - Recent DemandHistory docs
 * @param {number}   [params.currentBookingsCount] - Active/pending bookings count
 * @param {string}   [params.city]                 - City name
 * @param {string}   [params.area]                 - Area/neighbourhood
 * @param {string}   [params.serviceCategory]      - Service category
 * @param {Date|string|number} [params.time]       - Hour (0-23) or Date object
 * @param {number}   [params.dayOfWeek]            - Day (0=Sun..6=Sat)
 * @returns {object} DemandAnalysisResult
 */
export function analyzeDemand({
  demandHistoryRecords = [],
  currentBookingsCount = 0,
  city                 = 'Mumbai',
  area                 = null,
  serviceCategory      = 'General',
  time                 = new Date(),
  dayOfWeek            = null,
} = {}) {
  const factors = [];

  // Determine hour (0-23) and dayOfWeek (0-6)
  let hour = 12;
  let day  = 0;

  if (typeof time === 'number' && time >= 0 && time <= 23) {
    hour = time;
    day  = typeof dayOfWeek === 'number' ? dayOfWeek : new Date().getDay();
  } else {
    const d = new Date(time);
    hour = isNaN(d.getTime()) ? new Date().getHours() : d.getHours();
    day  = isNaN(d.getTime()) ? new Date().getDay() : d.getDay();
  }

  // 1. Seasonal baseline score from hour & day curves
  const hourMult = HOUR_DEMAND_CURVE[hour] ?? 1.0;
  const dayMult  = DAY_DEMAND_CURVE[day]  ?? 1.0;
  const combinedSeasonalMult = hourMult * dayMult;

  let baseDemandScore = Math.round(50 * combinedSeasonalMult);

  factors.push({
    factor: 'Time & Day Pattern',
    multiplier: combinedSeasonalMult,
    contribution: baseDemandScore - 50,
    explanation: `Hour ${hour}:00 (mult: ${hourMult}) on day ${day} (mult: ${dayMult}).`,
  });

  // 2. Active Pending Bookings Density
  const pendingCount = Math.max(0, Number(currentBookingsCount) || 0);
  let activeBonus = 0;
  if (pendingCount > 0) {
    activeBonus = Math.min(35, Math.round(pendingCount * 4));
    factors.push({
      factor: 'Active Pending Bookings',
      contribution: activeBonus,
      explanation: `${pendingCount} active/pending bookings in current area context.`,
    });
  }

  // 3. Historical Demand Records Signal
  let historicalVolumeAvg = 0;
  let historyBonus = 0;

  if (Array.isArray(demandHistoryRecords) && demandHistoryRecords.length > 0) {
    const volumes = demandHistoryRecords.map((r) => r.bookingCount || 0);
    historicalVolumeAvg = Math.round(
      (volumes.reduce((a, b) => a + b, 0) / volumes.length) * 10
    ) / 10;

    if (historicalVolumeAvg >= 10)     historyBonus = 20;
    else if (historicalVolumeAvg >= 5) historyBonus = 10;
    else if (historicalVolumeAvg <= 1) historyBonus = -10;

    factors.push({
      factor: 'Historical Demand Snapshot',
      contribution: historyBonus,
      explanation: `Avg historical hourly volume of ${historicalVolumeAvg} bookings from ${demandHistoryRecords.length} records.`,
    });
  } else {
    factors.push({
      factor: 'Historical Demand Snapshot',
      contribution: 0,
      explanation: 'No historical DemandHistory snapshots available for this specific bucket.',
    });
  }

  // Calculate final Demand Score (0 - 100)
  const rawScore = baseDemandScore + activeBonus + historyBonus;
  const demandScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Classify Demand Level
  const demandLevelObj = _classifyDemandLevel(demandScore);
  const demandLevel    = demandLevelObj.label;
  const suggestedDispatchPriority = demandLevelObj.priority;

  // Expected booking volume calculation
  const expectedBookingVolume = Math.max(
    1,
    Math.round((historicalVolumeAvg || 3) * combinedSeasonalMult + pendingCount * 0.5)
  );

  // Confidence calculation
  const hasHistory = Array.isArray(demandHistoryRecords) && demandHistoryRecords.length >= 3;
  const confidenceScore = hasHistory ? 0.90 : 0.75;
  const confidenceLevel = confidenceScore >= 0.85 ? 'HIGH' : 'MEDIUM';

  return {
    demandLevel,
    demandScore,
    expectedBookingVolume,
    suggestedDispatchPriority,
    factors,
    confidence: {
      score: confidenceScore,
      level: confidenceLevel,
    },
    context: {
      city,
      area,
      serviceCategory,
      hour,
      dayOfWeek: day,
      activeBookingsCount: pendingCount,
    },
    analyzedAt: new Date().toISOString(),
  };
}

function _classifyDemandLevel(score) {
  if (score >= DEMAND_LEVELS.VERY_HIGH.minScore) return DEMAND_LEVELS.VERY_HIGH;
  if (score >= DEMAND_LEVELS.HIGH.minScore)      return DEMAND_LEVELS.HIGH;
  if (score >= DEMAND_LEVELS.MEDIUM.minScore)    return DEMAND_LEVELS.MEDIUM;
  if (score >= DEMAND_LEVELS.LOW.minScore)       return DEMAND_LEVELS.LOW;
  return DEMAND_LEVELS.VERY_LOW;
}
