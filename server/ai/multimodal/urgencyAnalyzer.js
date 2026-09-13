/**
 * server/ai/multimodal/urgencyAnalyzer.js — Urgency Analyzer
 *
 * Classifies request urgency as:
 *   EMERGENCY | HIGH | MEDIUM | LOW
 *
 * Based on: keywords, booking context, time, service category.
 * Rule-based only. No ML. No LLM.
 */

// ─── Urgency level definitions ────────────────────────────────────────────────
export const URGENCY_LEVELS = {
  EMERGENCY: { label: 'Emergency',   score: 4, slaHours: 2,  dispatchPriority: 'IMMEDIATE' },
  HIGH:      { label: 'High',        score: 3, slaHours: 6,  dispatchPriority: 'PRIORITY'  },
  MEDIUM:    { label: 'Medium',      score: 2, slaHours: 24, dispatchPriority: 'STANDARD'  },
  LOW:       { label: 'Low',         score: 1, slaHours: 72, dispatchPriority: 'FLEXIBLE'  },
};

// ─── Keyword-based urgency signals ────────────────────────────────────────────
const EMERGENCY_KEYWORDS = new Set([
  'emergency', 'urgent', 'immediately', 'asap', 'right now', 'fire', 'flood',
  'gas leak', 'gas', 'smoke', 'electrocution', 'shock', 'injury', 'danger',
  'critical', 'burst pipe', 'sewage overflow', 'no water', 'complete outage',
  'overflowing', 'sparking', 'burning smell', 'structural', 'collapse',
]);

const HIGH_KEYWORDS = new Set([
  'today', 'tonight', 'few hours', 'quickly', 'fast', 'not working',
  'broken', 'stopped', 'no hot water', 'toilet blocked', 'drain blocked',
  'power out', 'no electricity', 'short circuit', 'tripped',
]);

const MEDIUM_KEYWORDS = new Set([
  'tomorrow', 'this week', 'weekend', 'soon', 'need it fixed',
  'repair needed', 'leaking slowly', 'dripping', 'slow drain',
]);

const LOW_KEYWORDS = new Set([
  'whenever', 'no rush', 'anytime', 'whenever possible', 'routine',
  'maintenance', 'annual service', 'scheduled', 'next month',
]);

// ─── Category inherent urgency ────────────────────────────────────────────────
// Some categories have higher baseline urgency
const CATEGORY_BASE_URGENCY = {
  electrical: 2, // Electrical issues are inherently more dangerous
  plumbing:   1,
  appliance:  0,
  cleaning:   0,
  carpentry:  0,
  painting:   0,
  security:   1,
  moving:     0,
};

// ─── Problem ID emergency overrides ──────────────────────────────────────────
// Some specific problems are always emergency or high
const PROBLEM_URGENCY_OVERRIDES = {
  ELEC_002: 'EMERGENCY', // Short circuit
  ELEC_004: 'HIGH',      // Wiring problem
  PLMB_001: 'HIGH',      // Pipe leak (may need immediate shutoff)
  PLMB_007: 'HIGH',      // Sewage problem
  SECU_001: 'HIGH',      // Lock issue (security concern)
};

// ─── Time-based urgency boosters ─────────────────────────────────────────────
// If booking is scheduled very soon, bump urgency
function _getTimeBoost(scheduledAt) {
  if (!scheduledAt) return 0;
  const now    = Date.now();
  const sched  = new Date(scheduledAt).getTime();
  const diffHr = (sched - now) / (1000 * 3600);

  if (diffHr < 0)  return 3; // Already overdue
  if (diffHr < 2)  return 2; // Under 2 hours
  if (diffHr < 6)  return 1; // Under 6 hours
  return 0;
}

// ─── Core Classifier ─────────────────────────────────────────────────────────

/**
 * Classify urgency from a UnifiedContext and optional problem analysis.
 *
 * @param {object} params
 * @param {object} params.unifiedContext   - UnifiedContext from contextBuilder
 * @param {object} [params.problemAnalysis] - Output of problemAnalyzer.analyzeProblem()
 * @param {object} [params.serviceResolution] - Output of serviceResolver.resolveService()
 * @returns {object} Urgency classification result
 */
export function classifyUrgency({ unifiedContext, problemAnalysis, serviceResolution } = {}) {
  if (!unifiedContext) {
    return _errorResult('UnifiedContext is required for urgency classification.');
  }

  const signals = [];
  let urgencyScore = 0;

  // ── 1. Keyword signals from text ──
  const textContext = unifiedContext.attachments?.text;
  const urgencyKeywords = textContext?.keywords?.urgency || [];
  const description    = (unifiedContext.description || '').toLowerCase();

  for (const { keyword, urgencyLevel } of urgencyKeywords) {
    const kw = keyword.toLowerCase();
    if (EMERGENCY_KEYWORDS.has(kw)) {
      urgencyScore += 4;
      signals.push({ source: 'keyword', keyword: kw, contribution: 4, level: 'EMERGENCY' });
    } else if (HIGH_KEYWORDS.has(kw)) {
      urgencyScore += 3;
      signals.push({ source: 'keyword', keyword: kw, contribution: 3, level: 'HIGH' });
    } else if (MEDIUM_KEYWORDS.has(kw)) {
      urgencyScore += 2;
      signals.push({ source: 'keyword', keyword: kw, contribution: 2, level: 'MEDIUM' });
    } else if (LOW_KEYWORDS.has(kw)) {
      urgencyScore += 0;
      signals.push({ source: 'keyword', keyword: kw, contribution: 0, level: 'LOW' });
    }
  }

  // Raw description scan for emergency keywords not caught by extraction
  for (const kw of EMERGENCY_KEYWORDS) {
    if (description.includes(kw)) {
      const alreadyCounted = signals.some((s) => s.keyword === kw);
      if (!alreadyCounted) {
        urgencyScore += 4;
        signals.push({ source: 'description_scan', keyword: kw, contribution: 4, level: 'EMERGENCY' });
      }
    }
  }

  // ── 2. Booking context ──
  const booking = unifiedContext.booking;
  if (booking?.isEmergency) {
    urgencyScore += 5;
    signals.push({ source: 'booking_flag', detail: 'isEmergency=true', contribution: 5, level: 'EMERGENCY' });
  }

  // Time-based boost from scheduled date
  const timeBoost = _getTimeBoost(booking?.scheduledAt);
  if (timeBoost > 0) {
    urgencyScore += timeBoost;
    signals.push({ source: 'time', detail: `scheduledAt within threshold`, contribution: timeBoost, level: _scoreToLevel(timeBoost) });
  }

  // ── 3. Category base urgency ──
  const category = unifiedContext.category || problemAnalysis?.problemCategory;
  if (category && CATEGORY_BASE_URGENCY[category] !== undefined) {
    const catScore = CATEGORY_BASE_URGENCY[category];
    if (catScore > 0) {
      urgencyScore += catScore;
      signals.push({ source: 'category', category, contribution: catScore });
    }
  }

  // ── 4. Problem ID override ──
  const topProblem = problemAnalysis?.possibleProblems?.[0];
  if (topProblem && PROBLEM_URGENCY_OVERRIDES[topProblem.id]) {
    const overrideLevel = PROBLEM_URGENCY_OVERRIDES[topProblem.id];
    const overrideScore = URGENCY_LEVELS[overrideLevel].score;
    // Only apply if the override is higher than current score
    if (overrideScore > urgencyScore) {
      const diff = overrideScore - urgencyScore;
      urgencyScore = overrideScore;
      signals.push({ source: 'problem_override', problemId: topProblem.id, level: overrideLevel, contribution: diff });
    }
  }

  // ── 5. Determine final level ──
  const level = _scoreToClassifiedLevel(urgencyScore);
  const levelDef = URGENCY_LEVELS[level];

  return {
    contextId:         unifiedContext.contextId,
    urgencyLevel:      level,
    urgencyLabel:      levelDef.label,
    urgencyScore,
    dispatchPriority:  levelDef.dispatchPriority,
    slaHours:          levelDef.slaHours,
    slaDeadline:       _computeSlaDeadline(levelDef.slaHours),
    signals,
    inputSummary: {
      category,
      isEmergency:    booking?.isEmergency || false,
      scheduledAt:    booking?.scheduledAt || null,
      topProblemId:   topProblem?.id || null,
      keywordsScanned: urgencyKeywords.length,
    },
    recommendations: _buildUrgencyRecommendations(level),
    classifiedAt: new Date().toISOString(),
    status: 'CLASSIFIED',
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _scoreToLevel(score) {
  if (score >= 4) return 'EMERGENCY';
  if (score >= 3) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}

function _scoreToClassifiedLevel(score) {
  if (score >= 4) return 'EMERGENCY';
  if (score >= 3) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}

function _computeSlaDeadline(hours) {
  const deadline = new Date(Date.now() + hours * 3600 * 1000);
  return deadline.toISOString();
}

function _buildUrgencyRecommendations(level) {
  const recs = {
    EMERGENCY: [
      'Dispatch nearest available worker immediately.',
      'Notify customer of ETA within 5 minutes.',
      'Alert on-call supervisor.',
      'Consider safety risks before dispatch.',
    ],
    HIGH: [
      'Assign worker within the hour.',
      'Send SMS confirmation to customer.',
      'Monitor job progress closely.',
    ],
    MEDIUM: [
      'Schedule within next business day.',
      'Confirm booking via notification.',
      'Worker can plan their route in advance.',
    ],
    LOW: [
      'Schedule at customer\'s convenience.',
      'Bundle with other jobs in the area.',
      'Regular follow-up not required.',
    ],
  };
  return recs[level] || [];
}

function _errorResult(message) {
  return {
    contextId:        null,
    urgencyLevel:     'LOW',
    urgencyLabel:     'Low',
    urgencyScore:     0,
    dispatchPriority: 'FLEXIBLE',
    slaHours:         72,
    slaDeadline:      _computeSlaDeadline(72),
    signals:          [],
    recommendations:  [],
    classifiedAt:     new Date().toISOString(),
    status:           'ERROR',
    error:            message,
  };
}
