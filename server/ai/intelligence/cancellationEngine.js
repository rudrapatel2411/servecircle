/**
 * server/ai/intelligence/cancellationEngine.js — Cancellation Engine
 *
 * Deterministically predicts booking cancellation risk score (0-100) based on:
 *   - Worker historical cancellation & rejection rates
 *   - Customer historical cancellation pattern & lead times
 *   - Booking timing (late night, early morning, short lead-time)
 *   - Emergency booking stress factors
 *   - Off-peak / unassigned risk heuristics
 *
 * Output: Risk score (0-100), risk level (LOW/MEDIUM/HIGH/CRITICAL), top reasons, and confidence.
 */

export const CANCELLATION_RISK_LEVELS = {
  LOW:      { label: 'LOW',      minScore: 0,  maxScore: 25 },
  MEDIUM:   { label: 'MEDIUM',   minScore: 26, maxScore: 50 },
  HIGH:     { label: 'HIGH',     minScore: 51, maxScore: 75 },
  CRITICAL: { label: 'CRITICAL', minScore: 76, maxScore: 100 },
};

// ─── Health Metadata ──────────────────────────────────────────────────────────
export function health() {
  return {
    loaded: true,
    ready: true,
    version: '1.0.0',
    supportedFeatures: [
      'worker-cancellation-rate-risk',
      'customer-cancellation-pattern-risk',
      'short-lead-time-risk',
      'off-peak-slot-risk',
      'emergency-fulfillment-stress-risk',
    ],
  };
}

// ─── Core Engine Function ─────────────────────────────────────────────────────

/**
 * Predict cancellation risk for a booking context.
 *
 * @param {object} params
 * @param {object} [params.workerHistory]    - Worker metrics/trust profile cancellation stats
 * @param {object} [params.customerHistory]  - Customer metrics/behaviour cancellation stats
 * @param {boolean} [params.isEmergency]     - Emergency flag
 * @param {Date|string} [params.scheduledDate]- Scheduled booking time
 * @param {Date|string} [params.createdAt]   - Booking creation time
 * @returns {object} CancellationPredictionResult
 */
export function predictCancellation({
  workerHistory    = null,
  customerHistory  = null,
  isEmergency      = false,
  scheduledDate    = new Date(),
  createdAt        = new Date(),
} = {}) {
  const topReasons = [];
  let cumulativeRiskScore = 0;

  // 1. Worker Cancellation Signal
  const workerCancelRate = workerHistory?.cancellationRate
    ?? workerHistory?.metricsCancelRate
    ?? null;

  if (typeof workerCancelRate === 'number') {
    if (workerCancelRate >= 0.25) {
      cumulativeRiskScore += 35;
      topReasons.push({
        factor: 'High Worker Cancellation Rate',
        riskIncrease: 35,
        description: `Assigned worker has a high cancellation rate of ${Math.round(workerCancelRate * 100)}%.`,
      });
    } else if (workerCancelRate >= 0.12) {
      cumulativeRiskScore += 18;
      topReasons.push({
        factor: 'Elevated Worker Cancellation Rate',
        riskIncrease: 18,
        description: `Worker has a cancellation rate of ${Math.round(workerCancelRate * 100)}%.`,
      });
    }
  }

  // 2. Customer Cancellation Signal
  const custCancelRate = customerHistory?.cancellationPattern?.rate
    ?? (customerHistory && customerHistory.totalBookings > 0
        ? customerHistory.cancelledBookings / customerHistory.totalBookings
        : null);

  if (typeof custCancelRate === 'number') {
    if (custCancelRate >= 0.40) {
      cumulativeRiskScore += 35;
      topReasons.push({
        factor: 'High Customer Cancellation Pattern',
        riskIncrease: 35,
        description: `Customer historically cancels ${Math.round(custCancelRate * 100)}% of bookings.`,
      });
    } else if (custCancelRate >= 0.20) {
      cumulativeRiskScore += 18;
      topReasons.push({
        factor: 'Elevated Customer Cancellation Pattern',
        riskIncrease: 18,
        description: `Customer has a cancellation rate of ${Math.round(custCancelRate * 100)}%.`,
      });
    }
  }

  // 3. Short Lead Time / Immediate Dispatch Stress
  const schedTime = new Date(scheduledDate).getTime();
  const createTime = new Date(createdAt).getTime();
  const leadMinutes = !isNaN(schedTime) && !isNaN(createTime)
    ? Math.round((schedTime - createTime) / 60000)
    : 60;

  if (leadMinutes > 0 && leadMinutes < 30) {
    cumulativeRiskScore += 20;
    topReasons.push({
      factor: 'Short Lead Time Window',
      riskIncrease: 20,
      description: `Very short lead time (${leadMinutes} mins between booking and scheduled time).`,
    });
  }

  // 4. Night Slot Risk (21:00 - 06:00)
  const d = new Date(scheduledDate);
  const hour = isNaN(d.getTime()) ? new Date().getHours() : d.getHours();
  if (hour >= 21 || hour < 6) {
    cumulativeRiskScore += 15;
    topReasons.push({
      factor: 'Night Time Slot Risk',
      riskIncrease: 15,
      description: `Booking scheduled during late night / early morning hours (${hour}:00).`,
    });
  }

  // 5. Emergency Fulfillment Stress
  if (isEmergency) {
    cumulativeRiskScore += 10;
    topReasons.push({
      factor: 'Emergency Urgency Stress',
      riskIncrease: 10,
      description: 'Emergency bookings carry higher cancellation risk if worker dispatch is delayed.',
    });
  }

  // If no risk factors detected, set baseline minimal risk
  if (topReasons.length === 0) {
    cumulativeRiskScore = 5; // minimal baseline risk
    topReasons.push({
      factor: 'Baseline Low Risk',
      riskIncrease: 5,
      description: 'Clean booking history with standard scheduling window.',
    });
  }

  const riskScore = Math.min(100, Math.round(cumulativeRiskScore));
  const riskLevelObj = _classifyRiskLevel(riskScore);
  const riskLevel = riskLevelObj.label;

  const confidenceScore = (workerHistory !== null || customerHistory !== null) ? 0.90 : 0.75;
  const confidenceLevel = confidenceScore >= 0.85 ? 'HIGH' : 'MEDIUM';

  return {
    riskScore,
    riskLevel,
    topReasons,
    confidence: {
      score: confidenceScore,
      level: confidenceLevel,
    },
    context: {
      isEmergency: !!isEmergency,
      leadMinutes,
      scheduledHour: hour,
    },
    predictedAt: new Date().toISOString(),
  };
}

function _classifyRiskLevel(score) {
  if (score >= CANCELLATION_RISK_LEVELS.CRITICAL.minScore) return CANCELLATION_RISK_LEVELS.CRITICAL;
  if (score >= CANCELLATION_RISK_LEVELS.HIGH.minScore)     return CANCELLATION_RISK_LEVELS.HIGH;
  if (score >= CANCELLATION_RISK_LEVELS.MEDIUM.minScore)   return CANCELLATION_RISK_LEVELS.MEDIUM;
  return CANCELLATION_RISK_LEVELS.LOW;
}
