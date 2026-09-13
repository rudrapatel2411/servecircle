/**
 * server/ai/intelligence/fraudEngine.js — Fraud Intelligence Engine
 *
 * Pure rule-based fraud detection engine enforcing security & integrity checks:
 *   1. Repeated Cancellations (high cancellation rate / rapid cancels)
 *   2. Abnormal Wallet Activity (unusual withdrawals, rapid top-ups)
 *   3. Repeated Complaints (high complaint rate, customer dispute patterns)
 *   4. Multiple Failed OTPs (locked OTPs, high failed attempt counts)
 *   5. Suspicious Booking Frequency (unusually high bookings per day)
 *   6. Duplicate Device / IP Usage (multiple accounts sharing device fingerprint)
 *   7. Impossible Travel Pattern (geographically impossible consecutive bookings)
 *
 * NO Machine Learning. Fully deterministic and explainable.
 */

export const FRAUD_RISK_LEVELS = {
  LOW:      { label: 'LOW',      minScore: 0,  maxScore: 25, defaultAction: 'ALLOW'           },
  MEDIUM:   { label: 'MEDIUM',   minScore: 26, maxScore: 50, defaultAction: 'MONITOR'         },
  HIGH:     { label: 'HIGH',     minScore: 51, maxScore: 75, defaultAction: 'VERIFY_REQUIRED' },
  CRITICAL: { label: 'CRITICAL', minScore: 76, maxScore: 100, defaultAction: 'BLOCK'           },
};

// ─── Health Metadata ──────────────────────────────────────────────────────────
export function health() {
  return {
    loaded: true,
    ready: true,
    version: '1.0.0',
    supportedFeatures: [
      'cancellation-pattern-analysis',
      'wallet-anomaly-detection',
      'complaint-frequency-check',
      'otp-abuse-detection',
      'velocity-frequency-check',
      'device-fingerprint-dedup',
      'impossible-travel-check',
    ],
  };
}

// ─── Core Engine Function ─────────────────────────────────────────────────────

/**
 * Detect fraud signals and calculate risk score.
 *
 * @param {object} params
 * @param {object} [params.customer]           - User document (customer)
 * @param {object} [params.worker]             - User document (worker)
 * @param {object} [params.customerMetrics]    - CustomerMetrics document
 * @param {object} [params.customerBehaviour]  - CustomerBehaviour document
 * @param {object} [params.trustProfile]       - TrustProfile document
 * @param {object} [params.booking]            - Current booking document
 * @param {object[]} [params.recentBookings]   - Array of recent booking documents
 * @param {object} [params.requestMeta]        - { deviceFingerprint, ipAddress, userAgent }
 * @returns {object} FraudAnalysisResult
 */
export function analyzeFraud({
  customer          = null,
  worker            = null,
  customerMetrics   = null,
  customerBehaviour = null,
  trustProfile      = null,
  booking           = null,
  recentBookings    = [],
  requestMeta       = {},
} = {}) {
  const riskReasons = [];
  let cumulativeRiskScore = 0;

  // ── Rule 1: Failed OTP Abuse ──
  const otpLocked = booking?.startOtpLocked || booking?.endOtpLocked || false;
  const startAttempts = booking?.startOtpAttempts || 0;
  const endAttempts = booking?.endOtpAttempts || 0;

  if (otpLocked) {
    cumulativeRiskScore += 35;
    riskReasons.push({
      rule: 'MULTIPLE_FAILED_OTPS_LOCKED',
      severity: 'HIGH',
      points: 35,
      description: 'Booking OTP verification is locked due to repeated incorrect attempts.',
    });
  } else if (startAttempts >= 3 || endAttempts >= 3) {
    cumulativeRiskScore += 20;
    riskReasons.push({
      rule: 'HIGH_OTP_FAILURES',
      severity: 'MEDIUM',
      points: 20,
      description: `Elevated OTP failure attempts (start: ${startAttempts}, end: ${endAttempts}).`,
    });
  }

  // ── Rule 2: Repeated Cancellations ──
  const custCancelRate = customerBehaviour?.cancellationPattern?.rate
    ?? (customerMetrics && customerMetrics.totalBookings > 0
        ? customerMetrics.cancelledBookings / customerMetrics.totalBookings
        : 0);

  if (custCancelRate >= 0.50 && (customerMetrics?.totalBookings || 0) >= 4) {
    cumulativeRiskScore += 30;
    riskReasons.push({
      rule: 'EXCESSIVE_CUSTOMER_CANCELLATIONS',
      severity: 'HIGH',
      points: 30,
      description: `Customer has an abnormally high cancellation rate of ${Math.round(custCancelRate * 100)}%.`,
    });
  } else if (custCancelRate >= 0.30 && (customerMetrics?.totalBookings || 0) >= 3) {
    cumulativeRiskScore += 15;
    riskReasons.push({
      rule: 'ELEVATED_CUSTOMER_CANCELLATIONS',
      severity: 'MEDIUM',
      points: 15,
      description: `Customer cancellation rate is ${Math.round(custCancelRate * 100)}%.`,
    });
  }

  // Worker cancellation rate check
  const workerCancelRate = trustProfile?.cancellationRate || 0;
  if (workerCancelRate >= 0.20) {
    cumulativeRiskScore += 20;
    riskReasons.push({
      rule: 'EXCESSIVE_WORKER_CANCELLATIONS',
      severity: 'MEDIUM',
      points: 20,
      description: `Worker has an elevated cancellation rate of ${Math.round(workerCancelRate * 100)}%.`,
    });
  }

  // ── Rule 3: Abnormal Wallet Activity ──
  const walletFlags = trustProfile?.walletFlags || {};
  if (walletFlags.unusualWithdrawal) {
    cumulativeRiskScore += 25;
    riskReasons.push({
      rule: 'ABNORMAL_WALLET_WITHDRAWAL',
      severity: 'HIGH',
      points: 25,
      description: 'Worker trust profile flagged for unusual wallet withdrawal patterns.',
    });
  }
  if (walletFlags.suspiciousTopup) {
    cumulativeRiskScore += 20;
    riskReasons.push({
      rule: 'SUSPICIOUS_WALLET_TOPUP',
      severity: 'MEDIUM',
      points: 20,
      description: 'Suspicious wallet top-up transactions detected.',
    });
  }

  // ── Rule 4: Repeated Complaints & Fraud Flags ──
  const fraudFlags = trustProfile?.fraudFlags || {};
  if (fraudFlags.otpAbuse) {
    cumulativeRiskScore += 30;
    riskReasons.push({
      rule: 'FLAGGED_OTP_ABUSE',
      severity: 'HIGH',
      points: 30,
      description: 'Account flagged for historical OTP abuse.',
    });
  }
  if (fraudFlags.suspiciousPatterns) {
    cumulativeRiskScore += 35;
    riskReasons.push({
      rule: 'FLAGGED_SUSPICIOUS_PATTERNS',
      severity: 'HIGH',
      points: 35,
      description: 'Account flagged by admin for suspicious behavioural patterns.',
    });
  }
  if ((fraudFlags.reportedByCustomers || 0) >= 2) {
    cumulativeRiskScore += 25;
    riskReasons.push({
      rule: 'REPEATED_CUSTOMER_REPORTS',
      severity: 'HIGH',
      points: 25,
      description: `Reported by ${fraudFlags.reportedByCustomers} customers for non-compliance/fraud.`,
    });
  }

  // ── Rule 5: Suspicious Booking Velocity ──
  if (Array.isArray(recentBookings) && recentBookings.length >= 5) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const bookings24h = recentBookings.filter((b) => new Date(b.createdAt || b.scheduledDate) > oneDayAgo);
    if (bookings24h.length >= 8) {
      cumulativeRiskScore += 30;
      riskReasons.push({
        rule: 'SUSPICIOUS_BOOKING_VELOCITY',
        severity: 'HIGH',
        points: 30,
        description: `Unusually high velocity: ${bookings24h.length} bookings created within 24 hours.`,
      });
    }
  }

  // ── Rule 6: Duplicate Device / IP Usage ──
  if (requestMeta.duplicateDeviceDetected || requestMeta.sharedDeviceCount > 2) {
    cumulativeRiskScore += 25;
    riskReasons.push({
      rule: 'DUPLICATE_DEVICE_FINGERPRINT',
      severity: 'HIGH',
      points: 25,
      description: 'Multiple active user accounts share the exact same device fingerprint.',
    });
  }

  // ── Rule 7: Impossible Travel Pattern ──
  if (Array.isArray(recentBookings) && recentBookings.length >= 2) {
    const travelCheck = _checkImpossibleTravel(recentBookings);
    if (travelCheck.isImpossible) {
      cumulativeRiskScore += 40;
      riskReasons.push({
        rule: 'IMPOSSIBLE_TRAVEL_PATTERN',
        severity: 'CRITICAL',
        points: 40,
        description: travelCheck.reason,
      });
    }
  }

  // Calculate final Risk Score (0-100)
  const riskScore = Math.min(100, Math.round(cumulativeRiskScore));

  // Determine Risk Level & Recommended Action
  const riskLevelObj = _classifyRiskLevel(riskScore);
  const riskLevel        = riskLevelObj.label;
  const recommendedAction = riskLevelObj.defaultAction;

  // Compute confidence
  const confidenceScore = 0.95; // High confidence rule-based engine

  return {
    riskScore,
    riskLevel,
    recommendedAction,
    riskReasons,
    confidence: {
      score: confidenceScore,
      level: 'HIGH',
    },
    signalsEvaluated: {
      hasOtpCheck: true,
      hasCancellationCheck: true,
      hasWalletCheck: true,
      hasComplaintCheck: true,
      hasVelocityCheck: Array.isArray(recentBookings) && recentBookings.length > 0,
      hasTravelCheck: Array.isArray(recentBookings) && recentBookings.length >= 2,
    },
    evaluatedAt: new Date().toISOString(),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _classifyRiskLevel(score) {
  if (score >= FRAUD_RISK_LEVELS.CRITICAL.minScore) return FRAUD_RISK_LEVELS.CRITICAL;
  if (score >= FRAUD_RISK_LEVELS.HIGH.minScore)     return FRAUD_RISK_LEVELS.HIGH;
  if (score >= FRAUD_RISK_LEVELS.MEDIUM.minScore)   return FRAUD_RISK_LEVELS.MEDIUM;
  return FRAUD_RISK_LEVELS.LOW;
}

function _checkImpossibleTravel(recentBookings) {
  // Compare timestamps and coordinates of 2 most recent completed/in-progress bookings
  const valid = recentBookings
    .filter((b) => b.location?.coordinates?.length === 2 && b.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (valid.length < 2) return { isImpossible: false };

  const b1 = valid[0];
  const b2 = valid[1];

  const t1 = new Date(b1.createdAt).getTime();
  const t2 = new Date(b2.createdAt).getTime();
  const diffHours = Math.abs(t1 - t2) / (1000 * 60 * 60);

  if (diffHours <= 0) return { isImpossible: false };

  const distKm = _haversineKm(
    b1.location.coordinates[1], b1.location.coordinates[0],
    b2.location.coordinates[1], b2.location.coordinates[0]
  );

  const speedKmH = distKm / diffHours;

  // Speed over 200 km/h between ground service bookings is physically impossible
  if (distKm > 50 && speedKmH > 200) {
    return {
      isImpossible: true,
      reason: `Geographically impossible travel: ${distKm.toFixed(1)} km apart within ${Math.round(diffHours * 60)} minutes (${Math.round(speedKmH)} km/h).`,
    };
  }

  return { isImpossible: false };
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
