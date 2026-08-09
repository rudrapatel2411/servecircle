import express from 'express';
import multer from 'multer';
import { StatusCodes } from 'http-status-codes';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { runMultimodalInference } from '../ai/inferenceService.js';
import { validateImage } from '../ai/multimodal/imageProcessor.js';
import { resolveService } from '../ai/multimodal/serviceResolver.js';
import Service from '../models/Service.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_IMAGE_SIZE_BYTES || String(20 * 1024 * 1024), 10) },
});

function safeJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function buildContextText(text, conversation = []) {
  const recent = Array.isArray(conversation) ? conversation.slice(-6) : [];
  const turns = recent
    .filter((item) => item?.role !== 'assistant' && typeof item?.content === 'string' && item.content.trim())
    .map((item) => `Customer: ${item.content.trim()}`)
    .join('\n');

  if (!turns) return text;
  return `Conversation context for analysis only:\n${turns}\n\nLatest customer message:\n${text || ''}`;
}

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Normalize common Hindi/Gujarati romanized spelling mistakes and variants
 * so that keyword matching still works even with typos.
 *
 * Examples:
 *   "leakej" → "leakage"    "plumar" → "plumber"
 *   "bijili" → "bijli"      "pani tapakna" stays "pani tapakna"
 *   "electrisian" → "electrician"
 */
function spellNormalize(text = '') {
  let t = String(text).toLowerCase();

  // ── Plumbing variants ────────────────────────────────────────────────────────
  t = t.replace(/\bleakej[a-z]*/g, 'leakage');
  t = t.replace(/\bleakig[a-z]*/g, 'leaking');
  t = t.replace(/\blikage\b/g, 'leakage');
  t = t.replace(/\bleakege\b/g, 'leakage');
  t = t.replace(/\bnanal\b/g, 'nal');         // nal = tap pipe
  t = t.replace(/\bnala\b/g, 'drain');         // nala = drain
  t = t.replace(/\bplumber?s?\b/g, 'plumber');
  t = t.replace(/\bplumar\b/g, 'plumber');
  t = t.replace(/\bplambur\b/g, 'plumber');
  t = t.replace(/\bpaipa\b/g, 'pipe');
  t = t.replace(/\bpipe?s\b/g, 'pipe');
  t = t.replace(/\bpani\b/g, 'pani');          // water
  t = t.replace(/\bpaani\b/g, 'pani');
  t = t.replace(/\bwatar\b/g, 'water');
  t = t.replace(/\btapak[a-z]*/g, 'tapak');    // dripping
  t = t.replace(/\btopak\b/g, 'tapak');
  t = t.replace(/\btoilit\b/g, 'toilet');
  t = t.replace(/\btoilet[s]?\b/g, 'toilet');
  t = t.replace(/\bdrain[ij]+ng?\b/g, 'drain');
  t = t.replace(/\bgizer\b/g, 'geyser');
  t = t.replace(/\bgeysar\b/g, 'geyser');
  t = t.replace(/\bgeyser\b/g, 'geyser');

  // ── Electrical variants ───────────────────────────────────────────────────────
  t = t.replace(/\bbijili\b/g, 'bijli');       // electricity
  t = t.replace(/\bbijjli\b/g, 'bijli');
  t = t.replace(/\bbijale\b/g, 'bijli');       // Gujarati variant
  t = t.replace(/\bvijali\b/g, 'bijli');
  t = t.replace(/\blight[s]?\b/g, 'light');
  t = t.replace(/\blite\b/g, 'light');
  t = t.replace(/\belectrisian\b/g, 'electrician');
  t = t.replace(/\belectrican\b/g, 'electrician');
  t = t.replace(/\belectritian\b/g, 'electrician');
  t = t.replace(/\belectricean\b/g, 'electrician');
  t = t.replace(/\belectric[ak]l?\b/g, 'electrical');
  t = t.replace(/\bswich\b/g, 'switch');
  t = t.replace(/\bswitsh\b/g, 'switch');
  t = t.replace(/\bsocet\b/g, 'socket');
  t = t.replace(/\bsoket\b/g, 'socket');
  t = t.replace(/\bshort.?circit\b/g, 'short circuit');
  t = t.replace(/\bspark[s]?\b/g, 'spark');

  // ── Appliance variants ───────────────────────────────────────────────────────
  t = t.replace(/\bfrij\b/g, 'fridge');
  t = t.replace(/\bfrig\b/g, 'fridge');
  t = t.replace(/\bwashing machen\b/g, 'washing machine');
  t = t.replace(/\bwoshing machine\b/g, 'washing machine');
  t = t.replace(/\bair.?conditionar\b/g, 'ac');
  t = t.replace(/\bair.?condition[ea]r\b/g, 'ac');
  t = t.replace(/\ba\.?c\.?\b/g, 'ac');

  // ── Carpentry/door variants ──────────────────────────────────────────────────
  t = t.replace(/\bdor\b/g, 'door');
  t = t.replace(/\bdarwaja\b/g, 'door');       // darwaza = door Hindi
  t = t.replace(/\bdarwaza\b/g, 'door');
  t = t.replace(/\bkidki\b/g, 'window');       // khidki = window
  t = t.replace(/\bkhidki\b/g, 'window');
  t = t.replace(/\balmirah\b/g, 'wardrobe');
  t = t.replace(/\balmira\b/g, 'wardrobe');

  // ── Security/lock variants ───────────────────────────────────────────────────
  t = t.replace(/\block[s]?\b/g, 'lock');
  t = t.replace(/\blok\b/g, 'lock');
  t = t.replace(/\bchabi\b/g, 'key');          // chaabi = key
  t = t.replace(/\bchaabi\b/g, 'key');
  t = t.replace(/\bchavi\b/g, 'key');          // Gujarati

  // ── Cleaning variants ────────────────────────────────────────────────────────
  t = t.replace(/\bsafaai\b/g, 'safai');       // cleaning
  t = t.replace(/\bsafai\b/g, 'cleaning');
  t = t.replace(/\bcockroch\b/g, 'cockroach');
  t = t.replace(/\bkackroch\b/g, 'cockroach');

  // ── General corrections ──────────────────────────────────────────────────────
  t = t.replace(/\bprobem\b/g, 'problem');
  t = t.replace(/\bprobelm\b/g, 'problem');
  t = t.replace(/\bproblem\b/g, 'problem');
  t = t.replace(/\brepare\b/g, 'repair');
  t = t.replace(/\brepir\b/g, 'repair');
  t = t.replace(/\bservise\b/g, 'service');
  t = t.replace(/\bservis\b/g, 'service');
  t = t.replace(/\bnahi chal[a-z]*/g, 'nahi chal raha');
  t = t.replace(/\bkaam nhi\b/g, 'kaam nahi');
  t = t.replace(/\bnhi\b/g, 'nahi');
  t = t.replace(/\bnai\b/g, 'nahi');           // nai = nahi in Hinglish

  return t;
}

/**
 * Detect language from text — supports Hindi (Devanagari + Romanized),
 * Gujarati (native script + Romanized), and English.
 *
 * Returns: 'hindi' | 'gujarati' | 'english'
 */
function detectLanguage(text = '') {
  const raw = String(text);
  const lower = raw.toLowerCase();

  // ── Script-based detection (most reliable) ────────────────────────────────────
  if (/[\u0A80-\u0AFF]/.test(raw)) return 'gujarati';  // Gujarati script
  if (/[\u0900-\u097F]/.test(raw)) return 'hindi';      // Devanagari script

  // ── Gujarati romanized patterns ───────────────────────────────────────────────
  const gujaratiPatterns = [
    /\b(gujarati|kem cho|tame|shu|vaat|kari shako|moklo|tamari|chhe|nathi|joie|avo|jao|karo|che|kem|su che|tamne|taro|bahu|badhu|kevi)\b/,
    /\b(pani joie|koi problem|tamne koi|mane madad|ghar ma|mara ghar|tamari ghar)\b/,
  ];
  if (gujaratiPatterns.some(p => p.test(lower))) return 'gujarati';

  // ── Hindi romanized patterns ──────────────────────────────────────────────────
  const hindiPatterns = [
    /\b(hai|hain|nahi|nai|nhi|main|mein|aap|apka|apni|karo|karna|karta|karti|chahiye|chahie|bata|batao|sakta|sakti|sakte|hoga|hogi|hote|bhi|toh|tto|yeh|ye|woh|wo|iska|uska|mera|tera|mujhe|aapko|hume|humko|kyun|kyon|kaise|kitna|kab|kahan|kya|agar|lekin|aur|par|pe|mein|se|ko|ka|ki|ke|ne)\b/,
    /\b(bijli|pani|ghar|kamra|chhat|deewar|darwaza|khidki|almirah|nalka|nali|paani|tapak|toota|toot|band|jam|jam gaya|chalu|chal raha|nahi chal|kaam nahi|help karo|bata do|samjha do|theek karo|theek karna|kab aayenge|kharcha|kitne mein|kitna lagega)\b/,
    /\b(kal|aaj|subah|shaam|raat|abhi|jaldi|urgent|turant|please|plz|pls|bhai|yaar|sir|madam)\b/,
  ];
  if (hindiPatterns.some(p => p.test(lower))) return 'hindi';

  // ── Hinglish heuristic: short text with mixed cues ────────────────────────────
  const hinglishCues = /\b(nahi|nai|hain|karo|theek|toh|matlab|samjhe|achha|thik|bol|sab|bas|kuch|abhi|yahan|wahan)\b/.test(lower);
  if (hinglishCues) return 'hindi';

  return 'english';
}

export function classifyIntent({ text = '', hasImage = false, conversation = [] } = {}) {
  // Apply spell normalization before matching
  const normalized = normalizeText(spellNormalize(text));
  const priorText = normalizeText(spellNormalize(conversation.map((item) => item.content).join(' ')));
  const hasServiceHistory = /\b(leak|pipe|water|pani|ac|cooling|fan|switch|socket|light|lock|door|sink|tap|geyser|fridge|washing|clean|repair|plumber|electrician|leakage|toot|nahi|problem|issue|service|bijli|bijjli|socket|tapak|nali|nalka|darwaza|almirah)\b/.test(priorText);

  if (hasImage) return 'SERVICE_PROBLEM';

  const generalPatterns = [
    /^(hi|hello|hey|namaste|kem cho|hola|namaskar|salam)$/,
    /\b(how are you|what can you do|can you help|help me|need some help|i need help|services do you provide|thank|thanks|thank you|ok|okay|bye|shukriya|dhanyavad|shukriyo)\b/,
    /\b(can you speak|speak hindi|speak gujarati|hindi mein|gujarati ma|vaat kari shako|baat kar sakte|hindi me bolo|gujarati ma vaat karo)\b/,
  ];
  const isGeneral = generalPatterns.some((pattern) => pattern.test(normalized));
  if (isGeneral) {
    return 'GENERAL_CONVERSATION';
  }

  const correctionWithServiceSignal = /^(no|nahi|nai|nhi|na|nahi bhai)\b/.test(normalized) && /\b(water|pani|paani|leak|leakage|pipe|tap|sink|ac|washing|roof|bijli|socket|door|lock)\b/.test(normalized);
  if (correctionWithServiceSignal) return 'SERVICE_PROBLEM';

  const followUpPatterns = /^(yes|no|ha|haan|ji|ji ha|ji haan|nahi|na|only|sirf|bas|thodu|thoda|continuous|when|jab|tap|running|not sure|pata nahi|khabar nathi|thodi der|baad mein|abhi|haan bhai|ok bhai|theek hai)\b/;
  if (hasServiceHistory && (followUpPatterns.test(normalized) || normalized.length <= 36)) {
    return 'FOLLOW_UP';
  }

  // Service keywords for ALL ServeCircle platform hubs: English, Hindi/Hinglish, Gujarati
  const serviceKeywordsEN = /\b(leak|leaking|leakage|pipe|water|tap|sink|bathroom|toilet|drain|ac|cooling|fan|socket|switch|light|power|sparks|mcb|wire|lock|door|key|geyser|fridge|washing machine|repair|broken|cleaning|pest|cockroach|seepage|short circuit|driver|chauffeur|airport|cab|commute|carpool|cook|chef|tiffin|catering|pet|dog|cat|vet|grooming|nurse|nursing|doctor|physio|physiotherapy|physiotherapist|caretaker|elder|health|society|security guard|birthday|party|event|dj|photographer|car wash|detailing|mechanic|shifting|moving|relocation|packers|emergency)\b/.test(normalized);
  const serviceKeywordsHI = /\b(pani|paani|tapak|bijli|bijjli|nali|nalka|nal|darwaza|khidki|kidki|chabi|chaabi|gizer|geysar|frij|safai|safaai|kida|chuha|toot|kharab|kharaab|band ho|nahi chal|kaam nahi|nahi aa rahi|problem hai|theek karo|repair karo|service chahiye|driver|driver chahiye|gaadi chalane|gadi chalana|outstation driver|khana|rasoi|tiffin|kutta|billi|dawa|doctor|nurse|caretaker|security guard|bday|party|dj|car wash|gadi wash|mechanic|puncture|shifting|samaan shifting|relocation|physio)\b/.test(normalized);
  const serviceKeywordsGU = /\b(pani|nali|nal|door|khidki|chaabi|tamaro|tamari|ghar ma problem|mara ghar|koi toot|saru nathi|joie che|madad joie|electrician joie|plumber joie|repair joie|safai joie|driver joie|gadi chalavva|chauffeur|rasoi|khana|pet|vet|doctor|nurse|bday|party|gadi wash|car wash|mechanic|shifting|physio)\b/.test(normalized);

  if (serviceKeywordsEN || serviceKeywordsHI || serviceKeywordsGU) return 'SERVICE_PROBLEM';

  return normalized ? 'OUT_OF_SCOPE' : 'GENERAL_CONVERSATION';
}

function hasLeakageSignal(text = '') {
  // Apply spell normalization so "leakej", "tapakna", "paani tapak rahi" etc. are caught
  const normalized = normalizeText(spellNormalize(text));
  return /\b(water leakage|water leak|water leaking|water aa raha|pani leak|paani leak|pani tapak|paani tapak|pani aa raha|paani aa raha|leakage|leak|leaking|tapak|nal se pani|nali se pani|chhat se pani|seepage|seeped|nala overflow)\b/.test(normalized);
}

function priorLeakageContext(conversation = []) {
  return Array.isArray(conversation) && conversation
    .filter((item) => item?.role !== 'assistant')
    .some((item) => hasLeakageSignal(item.content));
}

export function routeLeakageService({ text = '', conversation = [] } = {}) {
  const normalized = normalizeText(text);
  const hasCurrentLeakage = hasLeakageSignal(text);
  const hasPriorLeakage = priorLeakageContext(conversation);
  const sourceAnswer = hasPriorLeakage && /\b(pipe|tap|sink|bathroom|kitchen|ac|washing machine|washer|roof|ceiling)\b/.test(normalized);

  if (!hasCurrentLeakage && !sourceAnswer) return null;

  const sourceText = `${normalized} ${hasPriorLeakage ? ' prior leakage' : ''}`;

  if (/\b(ac|air conditioner)\b/.test(sourceText)) {
    return buildLeakageGuard({
      problemCategory: 'appliance',
      problemId: 'APPL_001',
      problemName: 'AC Water Leakage',
      confidence: 0.82,
    });
  }

  if (/\b(washing machine|washer)\b/.test(sourceText)) {
    return buildLeakageGuard({
      problemCategory: 'appliance',
      problemName: 'Washing Machine Water Leakage',
      confidence: 0.76,
    });
  }

  if (/\b(pipe|tap|faucet|sink|bathroom|kitchen sink|drain)\b/.test(sourceText)) {
    return buildLeakageGuard({
      problemCategory: 'plumbing',
      problemId: /\b(tap|faucet)\b/.test(sourceText) ? 'PLMB_004' : 'PLMB_001',
      problemName: /\b(tap|faucet)\b/.test(sourceText) ? 'Tap/Faucet Leakage' : 'Pipe Leakage',
      confidence: 0.86,
    });
  }

  if (/\b(roof|ceiling)\b/.test(sourceText)) {
    return {
      intent: 'FOLLOW_UP',
      message: 'Samajh gaya. Roof/ceiling se water aa raha hai. Kya ye rain seepage hai, bathroom se seepage hai, ya pipe line upar se pass hoti hai?',
      showServiceRecommendation: false,
      followUpQuestions: [
        'Rain ke time hi leakage hoti hai?',
        'Ceiling ke upar bathroom ya water line hai?',
        'Kya photo bhej sakte hain?',
      ],
    };
  }

  return {
    intent: 'FOLLOW_UP',
    message: 'Samajh gaya. Water leakage hai. Leakage kahan se ho rahi hai - pipe, tap, sink, bathroom, AC ya kisi aur jagah?',
    showServiceRecommendation: false,
    followUpQuestions: [
      'Pipe se leak ho raha hai',
      'Tap ya sink se leak ho raha hai',
      'AC se water leak ho raha hai',
    ],
  };
}

function buildLeakageGuard({ problemCategory, problemId = null, problemName, confidence }) {
  return {
    guardOnly: true,
    expectedCategory: problemCategory,
    fallback: buildResolvedRoute({ problemCategory, problemId, problemName, confidence }),
  };
}

function buildResolvedRoute({ problemCategory, problemId = null, problemName, confidence }) {
  const serviceResolution = resolveService({
    contextId: `leak_${Date.now()}`,
    problemCategory,
    possibleProblems: problemId ? [{ id: problemId, name: problemName, matchCount: 10 }] : [{ id: `ROUTE_${problemCategory}`, name: problemName, matchCount: 8 }],
    confidence: { score: confidence, level: confidence >= 0.8 ? 'HIGH' : 'MEDIUM' },
    aiAnalysisRaw: {
      problemType: problemName,
      serviceCategory: problemCategory,
      urgency: 'medium',
      confidence,
      recommendedActions: problemCategory === 'plumbing'
        ? ['Turn off the nearest water supply if leakage is active.', 'Keep the area dry until the worker arrives.']
        : ['Switch off the appliance if water is near electrical parts.', 'Avoid using it until inspected.'],
      needsMoreInformation: false,
      followUpQuestions: [],
    },
    missingInformation: [],
    status: 'ANALYZED',
  });

  return {
    intent: 'SERVICE_PROBLEM',
    message: problemCategory === 'plumbing'
      ? 'Samajh gaya. Leakage source plumbing side ka lag raha hai. Iske liye plumbing service suitable lag rahi hai.'
      : `Samajh gaya. ${problemName} appliance issue lag raha hai, cleaning nahi. Iske liye appliance repair suitable lag rahi hai.`,
    showServiceRecommendation: true,
    followUpQuestions: [],
    analysis: {
      status: 'success',
      confidence,
      multimodal: {
        problemAnalysis: {
          problemCategory,
          possibleProblems: [{ name: problemName }],
          confidence: { score: confidence, level: confidence >= 0.8 ? 'HIGH' : 'MEDIUM' },
          aiAnalysisRaw: {
            problemType: problemName,
            recommendedActions: serviceResolution.safetyPrecautions || [],
            followUpQuestions: [],
          },
        },
        serviceResolution,
        recommendation: {
          recommendedService: {
            name: serviceResolution.service,
            category: serviceResolution.category,
            priceRangeInr: serviceResolution.priceRangeInr,
            estimatedDurationLabel: serviceResolution.estimatedDurationLabel,
            safetyPrecautions: serviceResolution.safetyPrecautions || [],
          },
          requiredSkill: { primary: serviceResolution.requiredWorkerSkill },
          confidence: { overall: { score: confidence, level: confidence >= 0.8 ? 'HIGH' : 'MEDIUM' } },
        },
        summary: {
          problemCategory,
          topProblem: problemName,
          resolvedService: serviceResolution.service,
          requiredSkill: serviceResolution.requiredWorkerSkill,
          urgencyLevel: 'MEDIUM',
          overallConfidence: { score: confidence, level: confidence >= 0.8 ? 'HIGH' : 'MEDIUM' },
        },
      },
    },
  };
}

function applyLeakageGuard(result, guard) {
  if (!guard?.guardOnly) return null;

  const category = result?.multimodal?.serviceResolution?.problemCategory
    || result?.multimodal?.problemAnalysis?.problemCategory
    || '';
  const serviceName = normalizeText(result?.multimodal?.serviceResolution?.service || '');
  const confidence = getConfidenceScore(result);
  const isWrongCleaning = category === 'cleaning' || serviceName.includes('cleaning');
  const isUnknown = !category || category === 'Unknown Problem' || category === 'unknown problem';
  const isLowConfidence = confidence > 0 && confidence < 0.5;

  if (isWrongCleaning || isUnknown || isLowConfidence) {
    return guard.fallback;
  }

  return null;
}

/**
 * General service category guard for image-based pipeline results.
 * Detects hallucinated categories (e.g., "cleaning" for water leak images)
 * and returns a corrected fallback for any service type.
 *
 * Applied to ALL image analyses as a final safety layer.
 *
 * @param {object} result - Full runMultimodalInference result
 * @param {boolean} hasImage - Whether the request included an image
 * @returns {object|null} Corrected response or null if result is valid
 */
function applyServiceCategoryGuard(result, hasImage) {
  if (!hasImage) return null;

  const problemAnalysis  = result?.multimodal?.problemAnalysis  || {};
  const serviceResolution = result?.multimodal?.serviceResolution || {};
  const aiRaw = problemAnalysis.aiAnalysisRaw || {};

  const category    = (serviceResolution.problemCategory || problemAnalysis.problemCategory || '').toLowerCase();
  const serviceName = normalizeText(serviceResolution.service || '');
  const confidence  = getConfidenceScore(result);

  // Build a combined signal string from all AI output fields for cross-checking
  const allSignals = normalizeText([
    aiRaw.problemType     || '',
    aiRaw.serviceCategory || '',
    aiRaw.reasoningEnglish || '',
    ...(Array.isArray(aiRaw.visibleDamage)   ? aiRaw.visibleDamage   : []),
    ...(Array.isArray(aiRaw.visibleObjects)   ? aiRaw.visibleObjects   : []),
    ...(Array.isArray(aiRaw.possibleCauses)   ? aiRaw.possibleCauses   : []),
    ...(Array.isArray(aiRaw.recommendedActions) ? aiRaw.recommendedActions : []),
  ].join(' '));

  const WATER_SIGNAL = /\b(water|leak|seepage|pipe|drain|tap|pani|paani|sewage|toilet|geyser|overflow|drip|tapak|plumb|ceiling water|wet|damp|moisture)\b/.test(allSignals);
  const ELEC_SIGNAL  = /\b(electric|wire|socket|switch|mcb|circuit|spark|bijli|switchboard|fuse|breaker|outlet)\b/.test(allSignals);
  const APPL_SIGNAL  = /\b(ac|air condition|fridge|refrigerator|washing machine|microwave|television|tv|purifier|appliance)\b/.test(allSignals);

  // Guard 1: "cleaning" service suggested but water/pipe signals present → plumbing correction
  if ((category === 'cleaning' || serviceName.includes('cleaning')) && WATER_SIGNAL && !APPL_SIGNAL) {
    console.warn('[customerAi] applyServiceCategoryGuard: cleaning override → plumbing (water signals detected)');
    const correction = buildResolvedRoute({
      problemCategory: 'plumbing',
      problemId: 'PLMB_001',
      problemName: 'Water Leak / Seepage',
      confidence: Math.max(confidence, 0.72),
    });
    return {
      ...correction,
      message: 'Photo dekh kar lag raha hai ki yeh paani ka leak/seepage issue hai. Iske liye plumbing service suitable lag rahi hai.',
      _guardApplied: 'cleaning_to_plumbing',
    };
  }

  // Guard 2: "cleaning" suggested but electrical signals present → electrical correction
  if ((category === 'cleaning' || serviceName.includes('cleaning')) && ELEC_SIGNAL && !WATER_SIGNAL) {
    console.warn('[customerAi] applyServiceCategoryGuard: cleaning override → electrical (electrical signals detected)');
    const correction = buildResolvedRoute({
      problemCategory: 'electrical',
      problemId: 'ELEC_001',
      problemName: 'Electrical Issue',
      confidence: Math.max(confidence, 0.70),
    });
    return {
      ...correction,
      message: 'Photo dekh kar lag raha hai ki yeh electrical issue hai. Iske liye electrician service suitable lag rahi hai.',
      _guardApplied: 'cleaning_to_electrical',
    };
  }

  // Guard 3: "cleaning" suggested but appliance signals present → appliance correction
  if ((category === 'cleaning' || serviceName.includes('cleaning')) && APPL_SIGNAL) {
    console.warn('[customerAi] applyServiceCategoryGuard: cleaning override → appliance (appliance signals detected)');
    const correction = buildResolvedRoute({
      problemCategory: 'appliance',
      problemId: 'APPL_001',
      problemName: 'Appliance Issue',
      confidence: Math.max(confidence, 0.68),
    });
    return {
      ...correction,
      message: 'Photo dekh kar lag raha hai ki yeh appliance issue hai. Iske liye appliance repair service suitable lag rahi hai.',
      _guardApplied: 'cleaning_to_appliance',
    };
  }

  // Guard 4: Unknown/unresolved category with low confidence → ask for more info
  const KNOWN_CATEGORIES = ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'appliance', 'security', 'moving'];
  if ((!category || !KNOWN_CATEGORIES.includes(category)) && confidence < 0.5) {
    return {
      intent: 'FOLLOW_UP',
      message: 'Photo mujhe clearly nahi samajh aayi. Kya aap problem ka thoda aur detail bata sakte hain ya ek aur photo bhej sakte hain?',
      showServiceRecommendation: false,
      followUpQuestions: [
        'Problem kaunse room/jagah mein hai?',
        'Kya yeh water/bijli/appliance se related hai?',
        'Ek aur clear photo bhejein',
      ],
      _guardApplied: 'unknown_category_low_confidence',
    };
  }

  return null;
}

export function generalMessage(text = '') {
  const normalized = normalizeText(spellNormalize(text));
  const language = detectLanguage(text);

  // ── Language preference requests ───────────────────────────────────────────
  if (/\b(gujarati|gujarati ma|vaat kari shako|gujarati me bolo)\b/.test(normalized)) {
    return 'Ha, bilkul! Tame Gujarati ma vaat kari shako cho. Tamari ghar-service problem mane janavo, athva photo moklo. Hu plumbing, electrical, cleaning, carpentry — koi pan service mate madad kari shakish.';
  }
  if (/\b(hindi|hindi mein|baat kar sakte|hindi me bolo|hindi me batao)\b/.test(normalized)) {
    return 'Bilkul! Main Hindi mein baat kar sakta hoon. Aap ghar mein kisi bhi cheez ki problem bataiye — pani ka leak, bijli ki problem, AC kharab, darwaza toot gaya, ya kuch aur. Main sahi service dhundh kar dunga.';
  }

  // ── What can you do / help requests ───────────────────────────────────────
  if (/\b(what can you do|services do you provide|kya kar sakte|kya help|madad karo|help chahiye|kya karte ho|kya services)\b/.test(normalized)) {
    if (language === 'gujarati') return 'Hu home-service problem samajva, sahi service identify karva ane booking sudhi lai java help kari shaku chu. Plumbing, electrical, cleaning, carpentry, painting, appliance repair, security, moving — badhi services mate photo moklo ya type karo.';
    if (language === 'hindi') return 'Main aapki ghar ki kisi bhi problem ko samjhkar sahi service dhundh sakta hoon. Plumbing, bijli, cleaning, carpentry, AC/fridge repair, lock service, ya shifting — bas photo bhejiye ya problem type kariye.';
    return 'I can understand home-service problems, analyze photos, ask follow-up questions, recommend the right service, and take you to booking. Try: plumbing, electrical, cleaning, carpentry, painting, appliance repair, or moving services.';
  }

  // ── Thank you ──────────────────────────────────────────────────────────────
  if (/\b(thank|thanks|thank you|shukriya|dhanyavad|shukriyo|aabhar)\b/.test(normalized)) {
    if (language === 'gujarati') return 'Welcome! Biji koi service help joie hoy to mane janavo. Hu hamesha yahan chu.';
    if (language === 'hindi') return 'Welcome! Aur kisi service mein help chahiye ho to kabhi bhi puchh sakte hain.';
    return 'You are welcome! Let me know anytime you need help with a service.';
  }

  // ── Bye ────────────────────────────────────────────────────────────────────
  if (/\b(bye|goodbye|alvida|phir milenge|ok bye)\b/.test(normalized)) {
    if (language === 'hindi') return 'Theek hai! Phir kab bhi zaroorat ho, main yahan hoon.';
    if (language === 'gujarati') return 'Theek chhe! Phir koi jaroor pade to mane yaad karo.';
    return 'Bye! I am here whenever you need help with a home service.';
  }

  // ── Default greeting ───────────────────────────────────────────────────────
  if (language === 'gujarati') return 'Hello! Hu ServeCircle AI chu. Tamari ghar ni koi pan problem type karo — ya photo moklo. Plumbing, electrical, cleaning, carpentry, appliance repair — badha mate help karis.';
  if (language === 'hindi') return 'Hello! Main ServeCircle AI hoon. Aap ghar ki koi bhi problem type kar sakte hain ya photo bhej sakte hain — plumbing, bijli, cleaning, carpentry, ya appliance repair. Aapki language mein baat kar sakta hoon.';
  return 'Hey! I am ServeCircle AI. Tell me what needs fixing at home, or send a photo. I understand English, Hindi, and Gujarati.';
}

function getConfidenceScore(result) {
  const overall = result?.multimodal?.recommendation?.confidence?.overall;
  if (typeof overall?.score === 'number') return overall.score;
  if (typeof result?.confidence === 'number') return result.confidence;
  if (typeof result?.multimodal?.problemAnalysis?.confidence?.score === 'number') return result.multimodal.problemAnalysis.confidence.score;
  return 0;
}

function shouldShowRecommendation(result) {
  const multimodal = result?.multimodal || {};
  const problem = multimodal.problemAnalysis || {};
  const service = multimodal.serviceResolution || {};
  const confidence = getConfidenceScore(result);
  if (!service.resolved || !service.service) return false;
  if (problem.problemCategory === 'Unknown Problem') return false;
  if (problem.aiAnalysisRaw?.needsMoreInformation && confidence < 0.8) return false;
  return confidence >= 0.5;
}

function cleanCustomerLabel(value, fallback) {
  const label = String(value || '').trim();
  if (!label) return fallback;
  const lower = label.toLowerCase();
  if (lower.includes('conversation context') || lower.includes('previous conversation') || lower.includes('latest customer message')) {
    return fallback;
  }
  if (label.length > 90) return fallback;
  return label;
}

function buildAssistantMessage({ result, intent, hasImage, originalText }) {
  const multimodal = result?.multimodal || {};
  const problem = multimodal.problemAnalysis || {};
  const service = multimodal.serviceResolution || {};
  const raw = problem.aiAnalysisRaw || {};
  const language = detectLanguage(originalText || raw.reasoningLocalized || '');
  const problemName = cleanCustomerLabel(raw.problemType || problem.possibleProblems?.[0]?.name || multimodal.summary?.topProblem, 'this issue');
  const serviceName = cleanCustomerLabel(service.service || raw.serviceCategory, 'the right service');
  const needsMore = raw.needsMoreInformation || raw.needsImage || problem.missingInformation?.length > 2;
  const questions = raw.followUpQuestions || multimodal.recommendation?.additionalQuestions?.map((q) => q.question) || [];

  if (needsMore && questions.length > 0 && !shouldShowRecommendation(result)) {
    return language === 'gujarati'
      ? `Samajh gayu. ${problemName} lage che. Thodi vadhu mahiti joiye: ${questions[0]}`
      : language === 'hindi'
      ? `Samajh gaya. ${problemName} lag raha hai. Thodi aur information chahiye: ${questions[0]}`
      : `Got it. This looks like ${problemName}. I need one more detail: ${questions[0]}`;
  }

  if (hasImage) {
    return language === 'gujarati'
      ? `Photo joi ne lage che ke ${problemName} che. Aa mate ${serviceName} suitable lage che.`
      : language === 'hindi'
      ? `Photo dekhkar lag raha hai ki ${problemName} hai. Iske liye ${serviceName} suitable lagti hai.`
      : `From the photo, this looks like ${problemName}. ${serviceName} seems like the right fit.`;
  }

  if (intent === 'FOLLOW_UP') {
    return language === 'gujarati'
      ? `Thanks, samajh gayu. Aa detail thi ${serviceName} match vadhu clear thay che.`
      : language === 'hindi'
      ? `Thanks, samajh gaya. Is detail se ${serviceName} ka match zyada clear ho gaya.`
      : `Thanks, that helps. This points more clearly to ${serviceName}.`;
  }

  return language === 'gujarati'
    ? `Samajh gayu. ${problemName} mate hu tamari help karu chu. ${serviceName} suitable lage che.`
    : language === 'hindi'
    ? `Samajh gaya. ${problemName} ke liye main help kar sakta hoon. ${serviceName} suitable lagti hai.`
    : `Got it. I can help with ${problemName}. ${serviceName} looks like the right service.`;
}

function sanitizeError(err) {
  const message = String(err?.message || '').toLowerCase();
  if (message.includes('quota') || message.includes('rate')) {
    return 'AI is busy right now. Please retry in a bit or browse services manually.';
  }
  if (message.includes('image') || message.includes('mime') || message.includes('unsupported')) {
    return 'Please upload a clear JPG, PNG, or WEBP image under the allowed size.';
  }
  if (message.includes('timeout') || message.includes('network')) {
    return 'Network issue while analyzing. Please retry once.';
  }
  return 'AI analysis is unavailable right now. You can still browse and book services manually.';
}

router.post(
  '/chat',
  optionalAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (req.user && req.user.role && req.user.role !== 'customer') {
      throw new AppError('This AI assistant is available only for customers.', StatusCodes.FORBIDDEN);
    }

    const text = String(req.body?.text || '').trim();
    const conversation = safeJson(req.body?.conversation, []);
    const customerContext = safeJson(req.body?.customerContext, {});
    const bookingContext = safeJson(req.body?.bookingContext, {});

    let image = null;
    if (req.file) {
      image = {
        base64: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype || 'image/jpeg',
        fileName: req.file.originalname,
        sizeBytes: req.file.size,
      };

      const validation = validateImage(image);
      if (!validation.isValid) {
        throw new AppError(validation.errors[0] || 'Invalid image upload.', StatusCodes.BAD_REQUEST);
      }
    }

    if (!text && !image) {
      throw new AppError('Please enter a message or attach a photo.', StatusCodes.BAD_REQUEST);
    }

    const intent = classifyIntent({ text, hasImage: !!image, conversation });
    if (intent === 'GENERAL_CONVERSATION' || intent === 'OUT_OF_SCOPE') {
      const lang = detectLanguage(text);
      let outOfScopeMessage = 'Filhal yeh service ServeCircle par available nahi hai. Main home repairs, cleaning, driver & travel, food & cook, pet care, relocation, vehicle wash, health care, aur events me help kar sakta hoon. Aap inme se koi zaroorat batayein!';
      if (lang === 'gujarati') {
        outOfScopeMessage = 'Aha service filhal ServeCircle par available nathi. Hu home repairs, cleaning, driver & travel, food, pet care, relocation, vehicle services mate help kari shaku chu. Tame emathi koi jaroorat janavo!';
      } else if (lang === 'english') {
        outOfScopeMessage = "Currently, ServeCircle doesn't offer this specific service. We provide Home Repairs, Cleaning, Travel & Driver, Food & Cook, Pet Care, Health & Wellness, Relocation, and Vehicle Services. Feel free to tell me what you need from these!";
      }

      return res.status(StatusCodes.OK).json({
        status: 'success',
        intent,
        message: intent === 'OUT_OF_SCOPE'
          ? outOfScopeMessage
          : generalMessage(text),
        showServiceRecommendation: false,
        followUpQuestions: [
          'Driver & Travel Services',
          'Home Repairs & Plumbing',
          'Home Deep Cleaning & Pest Control',
        ],
      });
    }

    const leakageRoute = !image ? routeLeakageService({ text, conversation }) : null;
    if (leakageRoute && !leakageRoute.guardOnly) {
        return res.status(StatusCodes.OK).json({
          status: 'success',
          ...leakageRoute,
        });
    }

    try {
      const result = await runMultimodalInference({
        text: buildContextText(text, conversation),
        image,
        bookingCtx: bookingContext,
        customerCtx: {
          ...customerContext,
          customerId: req.user?._id || customerContext.customerId || 'demo-customer',
          preferredLanguage: customerContext.preferredLanguage || 'auto',
        },
        actor: req.user || { _id: 'demo-customer', role: 'customer' },
        reqCtx: req.reqCtx || {},
        bypassCache: false,
      });

      const guardedRoute = applyLeakageGuard(result, leakageRoute);
      const serviceGuard = !guardedRoute ? applyServiceCategoryGuard(result, !!image) : null;
      const finalGuard   = guardedRoute || serviceGuard;

      const payload = finalGuard ? {
        status: 'success',
        ...finalGuard,
      } : {
        status: 'success',
        intent,
        message: buildAssistantMessage({ result, intent, hasImage: !!image, originalText: text }),
        showServiceRecommendation: shouldShowRecommendation(result),
        followUpQuestions: result?.multimodal?.problemAnalysis?.aiAnalysisRaw?.followUpQuestions
          || result?.multimodal?.recommendation?.additionalQuestions?.map((q) => q.question)
          || [],
        analysis: result,
      };

      const recommendedService = payload.analysis?.multimodal?.recommendation?.recommendedService || payload.recommendedService || payload.analysis?.recommendedService || payload.multimodal?.recommendation?.recommendedService;
      if (recommendedService) {
        const queryName = recommendedService.name || '';
        const queryCat = recommendedService.category || '';
        
        let dbService = await Service.findOne({ name: queryName }).lean();
        
        if (!dbService) {
          // Fallback mapper for Atlas production DB services
          const n = (queryName + ' ' + queryCat).toLowerCase();
          if (n.includes('plumb') || n.includes('leak') || n.includes('pipe') || n.includes('drain') || n.includes('toilet') || n.includes('tap')) {
            dbService = await Service.findOne({ name: 'Plumbing' }).lean();
          } else if (n.includes('electric') || n.includes('wire') || n.includes('switch') || n.includes('power')) {
            dbService = await Service.findOne({ name: 'Electrical Work' }).lean();
          } else if (n.includes('ac ') || n.includes('appliance') || n.includes('fridge') || n.includes('washing')) {
            dbService = await Service.findOne({ name: 'AC & Appliance Repair' }).lean();
          } else if (n.includes('paint') || n.includes('wall')) {
            dbService = await Service.findOne({ name: 'Painting' }).lean();
          } else if (n.includes('clean') || n.includes('hygiene') || n.includes('sweep')) {
            dbService = await Service.findOne({ name: 'Home Deep Cleaning' }).lean();
          } else if (n.includes('pest') || n.includes('termite') || n.includes('cockroach')) {
            dbService = await Service.findOne({ name: 'Pest Control' }).lean();
          } else if (n.includes('carpent') || n.includes('wood') || n.includes('furniture') || n.includes('door') || n.includes('window')) {
            dbService = await Service.findOne({ name: 'Carpentry' }).lean();
          } else if (n.includes('car ') || n.includes('engine') || n.includes('four wheeler')) {
            dbService = await Service.findOne({ name: 'Car Repair' }).lean();
          } else if (n.includes('bike') || n.includes('motorcycle') || n.includes('two wheeler')) {
            dbService = await Service.findOne({ name: 'Bike Repair' }).lean();
          }
        }
        
        if (dbService) {
          recommendedService.serviceId = dbService._id.toString();
          recommendedService.serviceName = dbService.name;
          recommendedService.name = dbService.name;
          recommendedService.estimatedPrice = dbService.basePrice || dbService.price || 499.0;
        }
      }

      res.status(StatusCodes.OK).json(payload);
    } catch (err) {
      res.status(err.statusCode || StatusCodes.SERVICE_UNAVAILABLE).json({
        status: 'error',
        message: sanitizeError(err),
        retryable: true,
      });
    }
  })
);

export default router;
