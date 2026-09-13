/**
 * server/ai/trustmatch/trustEngine.js — Trust Engine
 *
 * Evaluates a single worker's trust signals and produces an explainable
 * trust assessment. This is NOT a final trust score — it is a structured
 * evaluation of all available trust-related data signals.
 *
 * Trust Dimensions:
 *   1. Identity Trust    — verified identity / documents
 *   2. Performance Trust — completion, acceptance, complaint, refund rates
 *   3. Behavioural Trust — admin warnings, fraud flags, wallet integrity
 *   4. Community Trust   — ratings, repeat customers, skill history
 *   5. Account Trust     — account age, profile completeness
 *
 * Output: TrustAssessment per worker (not a number — a structured verdict).
 */

// ─── Trust verdict thresholds ─────────────────────────────────────────────────
export const TRUST_VERDICTS = {
  TRUSTED:        { label: 'Trusted',         minSignals: 4, badge: '🛡️ VERIFIED TRUSTED'  },
  GENERALLY_SAFE: { label: 'Generally Safe',  minSignals: 2, badge: '✅ GENERALLY SAFE'     },
  NEEDS_REVIEW:   { label: 'Needs Review',    minSignals: 0, badge: '⚠️ NEEDS REVIEW'       },
  FLAGGED:        { label: 'Flagged',         minSignals: -1, badge: '🚩 FLAGGED'           },
};

// ─── Core trust evaluator ─────────────────────────────────────────────────────

/**
 * Evaluate trust signals for a single worker.
 *
 * @param {object} params
 * @param {object} params.worker          - User document
 * @param {object} [params.trustProfile]  - TrustProfile document
 * @param {object} [params.metrics]       - WorkerMetrics document
 * @param {object} [params.skillHistory]  - WorkerSkillHistory (category-specific)
 * @returns {object} TrustAssessment
 */
export function evaluateTrust({ worker, trustProfile = null, metrics = null, skillHistory = null }) {
  const dimensions = {
    identityTrust:     _assessIdentityTrust(worker, trustProfile),
    performanceTrust:  _assessPerformanceTrust(metrics, trustProfile),
    behaviouralTrust:  _assessBehaviouralTrust(trustProfile),
    communityTrust:    _assessCommunityTrust(worker, metrics, skillHistory, trustProfile),
    accountTrust:      _assessAccountTrust(worker, trustProfile),
  };

  // Count positive trust signals
  const positiveSignals = Object.values(dimensions).filter((d) => d.verdict === 'POSITIVE').length;
  const negativeSignals = Object.values(dimensions).filter((d) => d.verdict === 'NEGATIVE').length;
  const neutralSignals  = Object.values(dimensions).filter((d) => d.verdict === 'NEUTRAL').length;

  // Check for hard flags (any FLAGGED dimension → overall FLAGGED)
  const hasFlaggedDimension = Object.values(dimensions).some((d) => d.isFlagged);

  const overallVerdict = hasFlaggedDimension
    ? TRUST_VERDICTS.FLAGGED
    : positiveSignals >= 4
      ? TRUST_VERDICTS.TRUSTED
      : positiveSignals >= 2
        ? TRUST_VERDICTS.GENERALLY_SAFE
        : TRUST_VERDICTS.NEEDS_REVIEW;

  // Build trust flags list
  const trustFlags = _collectTrustFlags(trustProfile, worker);

  // Build positive trust signals
  const trustPositives = _collectTrustPositives(worker, trustProfile, metrics);

  return {
    workerId:         String(worker._id),
    workerName:       worker.name || null,
    overallVerdict:   overallVerdict.label,
    overallBadge:     overallVerdict.badge,
    dimensions,
    signalSummary: {
      positive: positiveSignals,
      negative: negativeSignals,
      neutral:  neutralSignals,
    },
    trustFlags,
    trustPositives,
    hasFlaggedDimension,
    evaluatedAt: new Date().toISOString(),
  };
}

// ─── Dimension assessors ──────────────────────────────────────────────────────

function _assessIdentityTrust(worker, trustProfile) {
  const checks = [];

  // KYC/Aadhar
  const isVerified = !!worker.isVerified;
  checks.push({ check: 'kyc_verified', passed: isVerified, label: isVerified ? 'Identity verified (KYC)' : 'Identity not verified' });

  // Identity verification from trust profile
  const idVStatus = trustProfile?.identityVerification?.status;
  checks.push({ check: 'identity_verification', passed: idVStatus === 'verified', label: `Identity verification: ${idVStatus || 'none'}` });

  // Document verification
  const docStatus = trustProfile?.documentVerification?.status;
  checks.push({ check: 'document_verification', passed: docStatus === 'verified', label: `Document verification: ${docStatus || 'none'}` });

  // Skill verification
  const skillStatus = trustProfile?.skillVerification?.status;
  checks.push({ check: 'skill_verification', passed: skillStatus === 'verified', label: `Skill verification: ${skillStatus || 'none'}` });

  const passedCount = checks.filter((c) => c.passed).length;
  return {
    dimension: 'identityTrust',
    label:     'Identity & Verification',
    verdict:   passedCount >= 3 ? 'POSITIVE' : passedCount >= 1 ? 'NEUTRAL' : 'NEGATIVE',
    isFlagged: false,
    checks,
    summary:   `${passedCount}/4 identity checks passed.`,
  };
}

function _assessPerformanceTrust(metrics, trustProfile) {
  const checks = [];

  // Completion rate
  const completionRate = metrics?.completionRate ?? trustProfile?.completionRate ?? null;
  const compOk = completionRate !== null && completionRate >= 0.80;
  checks.push({ check: 'completion_rate', passed: compOk, value: completionRate, label: completionRate !== null ? `Completion: ${Math.round(completionRate * 100)}%` : 'No completion data' });

  // Complaint rate
  const complaintRate = trustProfile?.complaintRate ?? null;
  const complOk = complaintRate !== null && complaintRate <= 0.05;
  checks.push({ check: 'complaint_rate', passed: complOk, value: complaintRate, label: complaintRate !== null ? `Complaints: ${Math.round(complaintRate * 100)}%` : 'No complaint data' });

  // Refund rate
  const refundRate = trustProfile?.refundRate ?? null;
  const refundOk = refundRate !== null && refundRate <= 0.03;
  checks.push({ check: 'refund_rate', passed: refundOk, value: refundRate, label: refundRate !== null ? `Refunds: ${Math.round(refundRate * 100)}%` : 'No refund data' });

  // Acceptance rate
  const acceptanceRate = metrics?.acceptanceRate ?? trustProfile?.acceptanceRate ?? null;
  const acceptOk = acceptanceRate !== null && acceptanceRate >= 0.70;
  checks.push({ check: 'acceptance_rate', passed: acceptOk, value: acceptanceRate, label: acceptanceRate !== null ? `Acceptance: ${Math.round(acceptanceRate * 100)}%` : 'No acceptance data' });

  const passedCount = checks.filter((c) => c.passed).length;
  const hasData     = checks.some((c) => c.value !== null);

  return {
    dimension: 'performanceTrust',
    label:     'Performance Reliability',
    verdict:   !hasData ? 'NEUTRAL' : passedCount >= 3 ? 'POSITIVE' : passedCount >= 1 ? 'NEUTRAL' : 'NEGATIVE',
    isFlagged: false,
    checks,
    summary:   hasData ? `${passedCount}/4 performance benchmarks met.` : 'No performance data available.',
  };
}

function _assessBehaviouralTrust(trustProfile) {
  const checks = [];
  let isFlagged = false;

  // Admin warnings
  const warningCount = trustProfile?.adminWarnings?.count || 0;
  const noWarnings   = warningCount === 0;
  checks.push({ check: 'no_admin_warnings', passed: noWarnings, value: warningCount, label: noWarnings ? 'No admin warnings' : `${warningCount} admin warning(s)` });
  if (warningCount >= 3) isFlagged = true;

  // Fraud flags
  const fraudFlags = trustProfile?.fraudFlags || {};
  const noFraud    = !fraudFlags.otpAbuse && !fraudFlags.suspiciousPatterns && (fraudFlags.reportedByCustomers || 0) === 0;
  checks.push({ check: 'no_fraud_flags', passed: noFraud, value: fraudFlags, label: noFraud ? 'No fraud flags' : 'Fraud/abuse flags detected' });
  if (!noFraud) isFlagged = true;

  // Wallet flags
  const walletFlags = trustProfile?.walletFlags || {};
  const noWallet    = !walletFlags.unusualWithdrawal && !walletFlags.suspiciousTopup;
  checks.push({ check: 'no_wallet_flags', passed: noWallet, value: walletFlags, label: noWallet ? 'No wallet irregularities' : 'Wallet irregularities detected' });

  const passedCount = checks.filter((c) => c.passed).length;

  return {
    dimension: 'behaviouralTrust',
    label:     'Behavioural Integrity',
    verdict:   isFlagged ? 'NEGATIVE' : passedCount === 3 ? 'POSITIVE' : 'NEUTRAL',
    isFlagged,
    checks,
    summary:   isFlagged
      ? 'Behavioural flags detected — manual review recommended.'
      : `${passedCount}/3 behavioural checks passed.`,
  };
}

function _assessCommunityTrust(worker, metrics, skillHistory, trustProfile) {
  const checks = [];

  // Average rating
  const avgRating = worker.rating ?? metrics?.avgRatingOverall ?? trustProfile?.averageRating ?? null;
  const ratingOk  = avgRating !== null && avgRating >= 4.0;
  checks.push({ check: 'rating_threshold', passed: ratingOk, value: avgRating, label: avgRating !== null ? `Avg rating: ${avgRating.toFixed(1)}/5.0` : 'No rating data' });

  // Total completions
  const completions = worker.completedJobs ?? metrics?.totalCompletions ?? 0;
  const expOk       = completions >= 15;
  checks.push({ check: 'experience_threshold', passed: expOk, value: completions, label: `${completions} completed jobs` });

  // Repeat customers
  const repeatRate = trustProfile?.repeatCustomerRate ?? null;
  const repeatOk   = repeatRate !== null && repeatRate >= 0.10;
  checks.push({ check: 'repeat_customers', passed: repeatOk, value: repeatRate, label: repeatRate !== null ? `${Math.round(repeatRate * 100)}% repeat customer rate` : 'No repeat data' });

  // Pro badge
  const hasPro = !!worker.isProBadge;
  checks.push({ check: 'pro_badge', passed: hasPro, value: hasPro, label: hasPro ? 'Pro badge awarded' : 'No pro badge' });

  const passedCount = checks.filter((c) => c.passed).length;

  return {
    dimension: 'communityTrust',
    label:     'Community Standing',
    verdict:   passedCount >= 3 ? 'POSITIVE' : passedCount >= 1 ? 'NEUTRAL' : 'NEGATIVE',
    isFlagged: false,
    checks,
    summary:   `${passedCount}/4 community trust signals positive.`,
  };
}

function _assessAccountTrust(worker, trustProfile) {
  const checks = [];

  // Account age
  const ageDays  = trustProfile?.accountAge ?? null;
  const ageOk    = ageDays !== null && ageDays >= 90;
  checks.push({ check: 'account_age', passed: ageOk, value: ageDays, label: ageDays !== null ? `Account age: ${ageDays} days` : 'Account age unknown' });

  // Profile completeness
  const completeness = trustProfile?.profileCompleteness ?? null;
  const completeOk   = completeness !== null && completeness >= 70;
  checks.push({ check: 'profile_completeness', passed: completeOk, value: completeness, label: completeness !== null ? `Profile: ${completeness}% complete` : 'Profile completeness unknown' });

  // Active tier
  const isActiveTier = ['approved_junior', 'approved_senior'].includes(worker.workerStatus);
  checks.push({ check: 'active_tier', passed: isActiveTier, value: worker.workerStatus, label: `Worker tier: ${worker.workerStatus}` });

  const passedCount = checks.filter((c) => c.passed).length;

  return {
    dimension: 'accountTrust',
    label:     'Account Maturity',
    verdict:   passedCount >= 2 ? 'POSITIVE' : passedCount >= 1 ? 'NEUTRAL' : 'NEGATIVE',
    isFlagged: false,
    checks,
    summary:   `${passedCount}/3 account maturity checks passed.`,
  };
}

// ─── Trust flags & positives ──────────────────────────────────────────────────

function _collectTrustFlags(trustProfile, worker) {
  const flags = [];
  if (!trustProfile) return flags;

  if ((trustProfile.adminWarnings?.count || 0) > 0) {
    flags.push({ type: 'admin_warning', severity: 'MEDIUM', message: `${trustProfile.adminWarnings.count} admin warning(s) on record.` });
  }
  if (trustProfile.fraudFlags?.otpAbuse) {
    flags.push({ type: 'otp_abuse', severity: 'HIGH', message: 'OTP abuse pattern detected.' });
  }
  if (trustProfile.fraudFlags?.suspiciousPatterns) {
    flags.push({ type: 'suspicious_patterns', severity: 'HIGH', message: 'Suspicious activity patterns detected.' });
  }
  if ((trustProfile.fraudFlags?.reportedByCustomers || 0) > 0) {
    flags.push({ type: 'customer_reports', severity: 'MEDIUM', message: `Reported by ${trustProfile.fraudFlags.reportedByCustomers} customer(s).` });
  }
  if (trustProfile.walletFlags?.unusualWithdrawal) {
    flags.push({ type: 'wallet_withdrawal', severity: 'MEDIUM', message: 'Unusual wallet withdrawal detected.' });
  }
  if (trustProfile.walletFlags?.suspiciousTopup) {
    flags.push({ type: 'wallet_topup', severity: 'MEDIUM', message: 'Suspicious wallet top-up detected.' });
  }

  return flags;
}

function _collectTrustPositives(worker, trustProfile, metrics) {
  const positives = [];

  if (worker.isVerified)                                              positives.push('KYC/Identity Verified');
  if (worker.isProBadge)                                              positives.push('Pro Badge Awarded');
  if (trustProfile?.identityVerification?.status === 'verified')      positives.push('Identity Verification Complete');
  if (trustProfile?.documentVerification?.status === 'verified')      positives.push('Documents Verified');
  if (trustProfile?.skillVerification?.status === 'verified')         positives.push('Skills Verified');
  if ((trustProfile?.adminWarnings?.count || 0) === 0)                positives.push('Zero Admin Warnings');
  if (worker.workerStatus === 'approved_senior')                       positives.push('Senior Worker Tier');
  if ((metrics?.totalCompletions || worker.completedJobs || 0) >= 50) positives.push('50+ Completed Jobs');
  if ((metrics?.avgRatingOverall || worker.rating || 0) >= 4.5)       positives.push('Excellent Rating (4.5+)');

  return positives;
}
