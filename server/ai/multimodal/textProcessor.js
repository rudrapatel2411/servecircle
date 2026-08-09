/**
 * server/ai/multimodal/textProcessor.js — Text Processing Module
 *
 * Implements rule-based text validation, normalization, keyword extraction,
 * language detection, and context extraction.
 *
 * NO NLP libraries. NO LLM. NO ML. Rule-based only.
 *
 * Pipeline:
 *   validateText() → normalize() → keywordExtraction() → languageDetection() → contextExtraction()
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_TEXT_LENGTH      = 10_000; // characters
const MIN_TEXT_LENGTH      = 1;
const MAX_KEYWORDS         = 20;

// ─── Service-domain keyword dictionary ───────────────────────────────────────
const SERVICE_KEYWORDS = {
  plumbing: [
    'pipe', 'pipes', 'leak', 'leaking', 'water', 'tap', 'faucet', 'drain', 'drainage',
    'clog', 'clogged', 'blocked', 'blockage', 'flush', 'toilet', 'overflow', 'burst',
    'plumber', 'plumbing', 'sewage', 'tank', 'geyser', 'pressure',
  ],
  electrical: [
    'electric', 'electrical', 'power', 'wire', 'wiring', 'circuit', 'fuse', 'tripped',
    'outlet', 'socket', 'switch', 'short', 'sparks', 'sparking', 'shock', 'voltage',
    'breaker', 'lights', 'light', 'bulb', 'meter', 'mcb', 'plug', 'blackout',
  ],
  cleaning: [
    'clean', 'cleaning', 'dirty', 'dust', 'stain', 'mold', 'mould', 'sweep', 'mop',
    'scrub', 'bathroom', 'kitchen', 'floor', 'carpet', 'sofa', 'couch', 'deep clean',
    'pest', 'cockroach', 'termite', 'rat', 'insect', 'disinfect',
  ],
  carpentry: [
    'wood', 'wooden', 'carpenter', 'carpentry', 'furniture', 'door', 'window', 'hinge',
    'drawer', 'shelf', 'shelves', 'cabinet', 'wardrobe', 'frame', 'board', 'nail',
    'screw', 'broken', 'repair', 'fix',
  ],
  painting: [
    'paint', 'painting', 'painter', 'wall', 'ceiling', 'brush', 'roller', 'primer',
    'coat', 'color', 'colour', 'texture', 'whitewash', 'distemper', 'enamel',
  ],
  appliance: [
    'ac', 'air conditioner', 'fridge', 'refrigerator', 'washing machine', 'geyser',
    'microwave', 'oven', 'fan', 'cooler', 'tv', 'television', 'appliance', 'repair',
    'service', 'not working', 'stopped', 'broken',
  ],
  security: [
    'lock', 'locks', 'locksmith', 'door lock', 'key', 'keys', 'deadbolt', 'padlock',
    'cctv', 'camera', 'alarm', 'security', 'safe', 'lost key',
  ],
  moving: [
    'move', 'moving', 'shift', 'shifting', 'relocate', 'relocation', 'pack', 'packing',
    'unpack', 'cargo', 'transport', 'heavy', 'furniture move', 'house shift',
  ],
};

// Flatten keywords to a single lookup map: keyword → service category
const KEYWORD_CATEGORY_MAP = (() => {
  const map = {};
  for (const [category, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    for (const kw of keywords) {
      map[kw] = category;
    }
  }
  return map;
})();

// ─── Urgency keywords ─────────────────────────────────────────────────────────
const URGENCY_KEYWORDS = {
  emergency: ['emergency', 'urgent', 'immediately', 'asap', 'right now', 'now', 'critical', 'danger', 'fire', 'flood', 'gas leak'],
  high:      ['today', 'tonight', 'few hours', 'quickly', 'fast', 'soon', 'broken', 'not working', 'stopped'],
  medium:    ['tomorrow', 'this week', 'weekend', 'when available', 'need it fixed'],
  low:       ['whenever', 'no rush', 'whenever possible', 'anytime', 'routine', 'maintenance'],
};

// ─── Language detection patterns ──────────────────────────────────────────────
const LANGUAGE_PATTERNS = [
  { language: 'hi', name: 'Hindi',   pattern: /[\u0900-\u097F]/ },
  { language: 'mr', name: 'Marathi', pattern: /[\u0900-\u097F]/ },  // Shares Devanagari
  { language: 'bn', name: 'Bengali', pattern: /[\u0980-\u09FF]/ },
  { language: 'ta', name: 'Tamil',   pattern: /[\u0B80-\u0BFF]/ },
  { language: 'te', name: 'Telugu',  pattern: /[\u0C00-\u0C7F]/ },
  { language: 'kn', name: 'Kannada', pattern: /[\u0C80-\u0CFF]/ },
  { language: 'ml', name: 'Malayalam', pattern: /[\u0D00-\u0D7F]/ },
  { language: 'gu', name: 'Gujarati', pattern: /[\u0A80-\u0AFF]/ },
  { language: 'pa', name: 'Punjabi', pattern: /[\u0A00-\u0A7F]/ },
  { language: 'ar', name: 'Arabic',  pattern: /[\u0600-\u06FF]/ },
  { language: 'zh', name: 'Chinese', pattern: /[\u4E00-\u9FFF]/ },
  { language: 'ja', name: 'Japanese', pattern: /[\u3040-\u309F\u30A0-\u30FF]/ },
  { language: 'ko', name: 'Korean',  pattern: /[\uAC00-\uD7AF]/ },
];

// ─── Common English stop words ────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
  'them', 'his', 'her', 'its', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'can', 'could', 'a', 'an', 'the', 'and',
  'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'up', 'down', 'as', 'into', 'through', 'during', 'this', 'that', 'these',
  'those', 'so', 'if', 'then', 'than', 'there', 'here', 'when', 'where', 'what',
  'how', 'not', 'no', 'very', 'just', 'about', 'also', 'please', 'need', 'want',
  'get', 'got', 'like', 'know', 'think', 'see', 'use', 'go', 'come', 'some',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'out', 'over',
  'same', 'such', 'own', 'before', 'after', 'above', 'below',
]);

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate a text input for processing eligibility.
 *
 * @param {string|object} textInput - Raw text string or object with a text field
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateText(textInput) {
  const errors   = [];
  const warnings = [];

  const rawText = typeof textInput === 'string'
    ? textInput
    : (textInput?.text || textInput?.content || null);

  if (rawText === null || rawText === undefined) {
    return { isValid: false, errors: ['Text input is required.'], warnings };
  }

  if (typeof rawText !== 'string') {
    return { isValid: false, errors: ['Text input must be a string.'], warnings };
  }

  const trimmed = rawText.trim();

  if (trimmed.length < MIN_TEXT_LENGTH) {
    errors.push('Text input is empty.');
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    errors.push(`Text input exceeds maximum length of ${MAX_TEXT_LENGTH} characters (received ${trimmed.length}).`);
  }

  // Warn on potentially harmful characters
  if (/[<>{}]/.test(trimmed)) {
    warnings.push('Text contains HTML-like or template characters which will be stripped during normalization.');
  }

  // Warn on very short text
  if (trimmed.length > 0 && trimmed.length < 10) {
    warnings.push('Text is very short; context extraction may be limited.');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalize text: trim, lowercase, strip HTML, collapse whitespace, remove special chars.
 *
 * @param {string} text
 * @returns {string} Normalized text
 */
export function normalize(text) {
  if (typeof text !== 'string') return '';

  let normalized = text;

  // Strip HTML tags
  normalized = normalized.replace(/<[^>]*>/g, ' ');

  // Replace non-printable and control characters
  normalized = normalized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');

  // Normalize unicode whitespace
  normalized = normalized.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]/g, ' ');

  // Collapse multiple whitespace into single space
  normalized = normalized.replace(/\s+/g, ' ');

  // Trim
  normalized = normalized.trim();

  // Lowercase (preserving non-ASCII characters for scripts)
  normalized = normalized.toLowerCase();

  return normalized;
}

// ─── Keyword Extraction ───────────────────────────────────────────────────────

/**
 * Extract domain-relevant and general keywords from text.
 *
 * @param {string} text - Already normalized text
 * @returns {{ serviceKeywords: object[], generalKeywords: string[], urgencyKeywords: string[] }}
 */
export function keywordExtraction(text) {
  if (!text || typeof text !== 'string') {
    return { serviceKeywords: [], generalKeywords: [], urgencyKeywords: [] };
  }

  const serviceKeywords = [];
  const urgencyKeywords = [];
  const seenKeywords    = new Set();

  // ── Multi-word phrase matching (longest match first) ──
  const sortedPhrases = Object.keys(KEYWORD_CATEGORY_MAP).sort((a, b) => b.length - a.length);
  for (const phrase of sortedPhrases) {
    if (text.includes(phrase) && !seenKeywords.has(phrase)) {
      seenKeywords.add(phrase);
      serviceKeywords.push({
        keyword:  phrase,
        category: KEYWORD_CATEGORY_MAP[phrase],
        type:     'service',
      });
      if (serviceKeywords.length >= MAX_KEYWORDS) break;
    }
  }

  // ── Urgency keyword matching ──
  for (const [level, phrases] of Object.entries(URGENCY_KEYWORDS)) {
    for (const phrase of phrases) {
      if (text.includes(phrase)) {
        urgencyKeywords.push({ keyword: phrase, urgencyLevel: level });
      }
    }
  }

  // ── General keyword extraction (tokenize, filter stop words) ──
  const tokens = text
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  // Count term frequency
  const termFreq = {};
  for (const token of tokens) {
    termFreq[token] = (termFreq[token] || 0) + 1;
  }

  // Sort by frequency, return top N
  const generalKeywords = Object.entries(termFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_KEYWORDS)
    .map(([word, count]) => ({ word, count }));

  return { serviceKeywords, generalKeywords, urgencyKeywords };
}

// ─── Language Detection ───────────────────────────────────────────────────────

/**
 * Detect language from text using Unicode script patterns (rule-based).
 *
 * @param {string} text - Raw or normalized text
 * @returns {{ language: string, name: string, confidence: string, script: string }}
 */
export function languageDetection(text) {
  if (!text || typeof text !== 'string') {
    return { language: 'unknown', name: 'Unknown', confidence: 'none', script: 'unknown' };
  }

  // Check Unicode script patterns
  for (const { language, name, pattern } of LANGUAGE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        language,
        name,
        confidence: 'medium',
        script:     _getScriptName(language),
        note:       'Detected via Unicode script range. Hindi/Marathi cannot be distinguished without dictionary.',
      };
    }
  }

  // Default: English (ASCII/Latin)
  const latinRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
  if (latinRatio > 0.6) {
    return { language: 'en', name: 'English', confidence: 'high', script: 'Latin' };
  }

  // Mixed / Unknown
  return { language: 'unknown', name: 'Unknown', confidence: 'low', script: 'mixed' };
}

// ─── Context Extraction ───────────────────────────────────────────────────────

/**
 * Extract structured context from text — the main pipeline function.
 * Chains all sub-processors and returns a unified text context.
 *
 * @param {string|object} textInput - Raw input
 * @param {object} [options]
 * @param {string} [options.contextId]
 * @param {string} [options.customerId]
 * @param {string} [options.bookingId]
 * @returns {object} TextContext with extracted information
 */
export function contextExtraction(textInput, options = {}) {
  const rawText = typeof textInput === 'string'
    ? textInput
    : (textInput?.text || textInput?.content || '');

  const validation     = validateText(rawText);
  const normalizedText = normalize(rawText);
  const { serviceKeywords, generalKeywords, urgencyKeywords } = keywordExtraction(normalizedText);
  const languageInfo   = languageDetection(rawText);

  // ── Infer service category from keywords ──
  const categoryCounts = {};
  for (const { category } of serviceKeywords) {
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }
  const topCategory = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  // ── Infer urgency from urgency keywords ──
  const topUrgency = urgencyKeywords.find((u) => u.urgencyLevel === 'emergency')?.urgencyLevel
    || urgencyKeywords.find((u) => u.urgencyLevel === 'high')?.urgencyLevel
    || urgencyKeywords.find((u) => u.urgencyLevel === 'medium')?.urgencyLevel
    || urgencyKeywords.find((u) => u.urgencyLevel === 'low')?.urgencyLevel
    || null;

  // ── Extract locations (very basic: capitalized words after "in", "at", "near") ──
  const locationHints = _extractLocationHints(normalizedText);

  // ── Extract numbers that might be dimensions or quantities ──
  const numericMentions = _extractNumericMentions(normalizedText);

  const { contextId, customerId, bookingId } = options;

  return {
    contextType: 'TEXT',
    contextId:   contextId || _generateContextId('txt'),
    isValid:     validation.isValid,
    validationErrors:   validation.errors,
    validationWarnings: validation.warnings,
    raw:         rawText,
    normalized:  normalizedText,
    characterCount: rawText.length,
    wordCount:      normalizedText.split(/\s+/).filter(Boolean).length,
    language:    languageInfo,
    keywords: {
      service:  serviceKeywords,
      general:  generalKeywords,
      urgency:  urgencyKeywords,
    },
    inferred: {
      serviceCategory: topCategory,
      urgencyLevel:    topUrgency,
      locationHints,
      numericMentions,
    },
    attachment: {
      customerId: customerId || null,
      bookingId:  bookingId  || null,
      submittedAt: new Date().toISOString(),
    },
    processingStatus: validation.isValid ? 'PROCESSED' : 'INVALID',
    createdAt: new Date().toISOString(),
  };
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function _extractLocationHints(text) {
  // Naive rule: words following 'in', 'at', 'near', 'from', 'sector', 'phase', 'block'
  const hints = [];
  const locationTriggers = ['in', 'at', 'near', 'from', 'sector', 'phase', 'block', 'area', 'street', 'road', 'lane'];
  const words = text.split(/\s+/);

  for (let i = 0; i < words.length - 1; i++) {
    if (locationTriggers.includes(words[i]) && words[i + 1] && words[i + 1].length > 2) {
      hints.push(words[i + 1].replace(/[^a-z0-9]/g, ''));
    }
  }

  return [...new Set(hints)].slice(0, 5);
}

function _extractNumericMentions(text) {
  const matches = text.match(/\b\d+(\.\d+)?\s*(sqft|sq ft|sq\.ft|feet|foot|meter|metre|inch|m²|sqm|litre|liter|kg|ton|unit|floor|floors|room|rooms|bedroom|bathroom|storey)\b/gi) || [];
  return matches.slice(0, 10);
}

function _getScriptName(language) {
  const scriptMap = {
    hi: 'Devanagari', mr: 'Devanagari', bn: 'Bengali', ta: 'Tamil',
    te: 'Telugu', kn: 'Kannada', ml: 'Malayalam', gu: 'Gujarati',
    pa: 'Gurmukhi', ar: 'Arabic', zh: 'CJK', ja: 'Japanese', ko: 'Hangul',
  };
  return scriptMap[language] || 'Latin';
}

function _generateContextId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
