/**
 * server/ai/multimodal/problemAnalyzer.js — Problem Analyzer
 *
 * Consumes a UnifiedContext and returns a deterministic problem analysis:
 *   problemCategory, possibleProblems, confidence, requiredFeatures, missingInformation
 *
 * Rule-based only. No ML. No LLM.
 */

// ─── Problem taxonomy ─────────────────────────────────────────────────────────

const PROBLEM_TAXONOMY = {
  plumbing: {
    displayName: 'Plumbing',
    possibleProblems: [
      { id: 'PLMB_001', name: 'Pipe Leak',          keywords: ['leak', 'leaking', 'dripping', 'pipe', 'burst', 'water leak'] },
      { id: 'PLMB_002', name: 'Blocked Drain',       keywords: ['clog', 'clogged', 'blocked', 'drain', 'drainage', 'slow drain'] },
      { id: 'PLMB_003', name: 'Toilet Issue',        keywords: ['toilet', 'flush', 'commode', 'overflow', 'running toilet'] },
      { id: 'PLMB_004', name: 'Tap/Faucet Problem',  keywords: ['tap', 'faucet', 'dripping tap', 'running tap'] },
      { id: 'PLMB_005', name: 'Geyser/Water Heater', keywords: ['geyser', 'water heater', 'hot water', 'heater'] },
      { id: 'PLMB_006', name: 'Water Pressure Issue', keywords: ['pressure', 'low pressure', 'no water'] },
      { id: 'PLMB_007', name: 'Sewage Problem',      keywords: ['sewage', 'sewer', 'smell', 'odor'] },
    ],
    requiredFeatures: ['location', 'description'],
    recommendedFeatures: ['image', 'accessDetails'],
  },
  electrical: {
    displayName: 'Electrical',
    possibleProblems: [
      { id: 'ELEC_001', name: 'Power Outage',        keywords: ['no power', 'blackout', 'power cut', 'no electricity'] },
      { id: 'ELEC_002', name: 'Short Circuit',       keywords: ['short', 'short circuit', 'tripped', 'breaker', 'fuse', 'sparks'] },
      { id: 'ELEC_003', name: 'Faulty Outlet/Switch', keywords: ['outlet', 'socket', 'switch', 'not working', 'plug'] },
      { id: 'ELEC_004', name: 'Wiring Problem',      keywords: ['wire', 'wiring', 'exposed wire', 'burning smell'] },
      { id: 'ELEC_005', name: 'Light Fixture Issue', keywords: ['light', 'bulb', 'lamp', 'flickering'] },
      { id: 'ELEC_006', name: 'MCB/Switchboard',     keywords: ['mcb', 'switchboard', 'distribution box', 'db box'] },
    ],
    requiredFeatures: ['location', 'description'],
    recommendedFeatures: ['image', 'safetyConfirmation'],
  },
  cleaning: {
    displayName: 'Cleaning',
    possibleProblems: [
      { id: 'CLNG_001', name: 'General Home Cleaning',   keywords: ['clean', 'dirty', 'dust'] },
      { id: 'CLNG_002', name: 'Deep Cleaning',           keywords: ['deep clean', 'thorough', 'disinfect'] },
      { id: 'CLNG_003', name: 'Bathroom Cleaning',       keywords: ['bathroom', 'toilet clean', 'basin'] },
      { id: 'CLNG_004', name: 'Kitchen Cleaning',        keywords: ['kitchen', 'chimney', 'oven clean'] },
      { id: 'CLNG_005', name: 'Carpet/Sofa Cleaning',    keywords: ['carpet', 'sofa', 'couch', 'upholstery'] },
      { id: 'CLNG_006', name: 'Pest Control',            keywords: ['pest', 'cockroach', 'rat', 'termite', 'insect', 'bed bug'] },
      { id: 'CLNG_007', name: 'Move-in/Move-out Clean',  keywords: ['move', 'vacant', 'empty house'] },
    ],
    requiredFeatures: ['location', 'propertySize'],
    recommendedFeatures: ['image'],
  },
  carpentry: {
    displayName: 'Carpentry',
    possibleProblems: [
      { id: 'CARP_001', name: 'Furniture Repair',   keywords: ['furniture', 'broken', 'fix', 'chair', 'table'] },
      { id: 'CARP_002', name: 'Door/Window Repair', keywords: ['door', 'window', 'hinge', 'lock', 'frame'] },
      { id: 'CARP_003', name: 'Wardrobe/Cabinet',   keywords: ['wardrobe', 'cabinet', 'drawer', 'shelf', 'shelves'] },
      { id: 'CARP_004', name: 'New Installation',   keywords: ['install', 'new', 'build', 'assemble'] },
    ],
    requiredFeatures: ['location', 'description'],
    recommendedFeatures: ['image', 'dimensions'],
  },
  painting: {
    displayName: 'Painting',
    possibleProblems: [
      { id: 'PNTG_001', name: 'Interior Painting',  keywords: ['interior', 'inside', 'room', 'wall'] },
      { id: 'PNTG_002', name: 'Exterior Painting',  keywords: ['exterior', 'outside', 'facade', 'balcony'] },
      { id: 'PNTG_003', name: 'Touch-up',           keywords: ['touch', 'patch', 'peel', 'crack'] },
      { id: 'PNTG_004', name: 'Texture/Design',     keywords: ['texture', 'design', 'wallpaper', 'stencil'] },
    ],
    requiredFeatures: ['location', 'area', 'colorPreference'],
    recommendedFeatures: ['image'],
  },
  appliance: {
    displayName: 'Appliance Repair',
    possibleProblems: [
      { id: 'APPL_001', name: 'AC Repair',              keywords: ['ac', 'air conditioner', 'cooling', 'not cooling'] },
      { id: 'APPL_002', name: 'Refrigerator Repair',    keywords: ['fridge', 'refrigerator', 'freezer'] },
      { id: 'APPL_003', name: 'Washing Machine Repair', keywords: ['washing machine', 'washer', 'laundry'] },
      { id: 'APPL_004', name: 'Microwave/Oven Repair',  keywords: ['microwave', 'oven', 'cooking'] },
      { id: 'APPL_005', name: 'TV/Entertainment',       keywords: ['tv', 'television', 'led', 'display'] },
      { id: 'APPL_006', name: 'Water Purifier',         keywords: ['purifier', 'ro', 'filter', 'water filter'] },
    ],
    requiredFeatures: ['location', 'applianceBrand', 'description'],
    recommendedFeatures: ['image', 'warrantyInfo'],
  },
  security: {
    displayName: 'Security & Locks',
    possibleProblems: [
      { id: 'SECU_001', name: 'Lock Repair/Replace',    keywords: ['lock', 'deadbolt', 'stuck lock'] },
      { id: 'SECU_002', name: 'Key Duplication/Lost',   keywords: ['key', 'lost key', 'duplicate'] },
      { id: 'SECU_003', name: 'CCTV Installation',      keywords: ['cctv', 'camera', 'surveillance'] },
      { id: 'SECU_004', name: 'Alarm System',           keywords: ['alarm', 'security system'] },
    ],
    requiredFeatures: ['location', 'description'],
    recommendedFeatures: ['image'],
  },
  moving: {
    displayName: 'Moving & Relocation',
    possibleProblems: [
      { id: 'MOVE_001', name: 'Home Shifting',          keywords: ['home shift', 'house move', 'relocate', 'shifting'] },
      { id: 'MOVE_002', name: 'Office Relocation',      keywords: ['office move', 'office shift'] },
      { id: 'MOVE_003', name: 'Furniture Transportation', keywords: ['furniture', 'heavy items', 'sofa move'] },
      { id: 'MOVE_004', name: 'Packing Services',       keywords: ['pack', 'packing', 'box', 'wrapping'] },
    ],
    requiredFeatures: ['fromLocation', 'toLocation', 'estimatedVolume'],
    recommendedFeatures: ['image'],
  },
  travel: {
    displayName: 'Travel & Driver Services',
    possibleProblems: [
      { id: 'TRVL_001', name: 'Outstation Driver / Chauffeur', keywords: ['driver', 'chauffeur', 'outstation driver', 'car driver', 'personal driver'] },
      { id: 'TRVL_002', name: 'Airport Drop & Pick',      keywords: ['airport', 'flight drop', 'airport pickup', 'airport transfer'] },
      { id: 'TRVL_003', name: 'Luxury Car Rental',        keywords: ['car rental', 'luxury rental', 'wedding car'] },
      { id: 'TRVL_004', name: 'Commute / Carpool',        keywords: ['commute', 'carpool', 'school commute', 'daily commute'] },
    ],
    requiredFeatures: ['location', 'description'],
    recommendedFeatures: ['travelDate'],
  },
  food: {
    displayName: 'Food & Kitchen Services',
    possibleProblems: [
      { id: 'FOOD_001', name: 'Home Cook / Personal Chef', keywords: ['cook', 'chef', 'home cook', 'khana', 'rasoi', 'cooking'] },
      { id: 'FOOD_002', name: 'Tiffin Service',           keywords: ['tiffin', 'meal box', 'daily tiffin', 'lunch box'] },
      { id: 'FOOD_003', name: 'Catering Service',         keywords: ['catering', 'party food', 'bulk food', 'buffet'] },
    ],
    requiredFeatures: ['location', 'dietaryPreference'],
    recommendedFeatures: ['numberOfPeople'],
  },
  pet: {
    displayName: 'Pet Care Services',
    possibleProblems: [
      { id: 'PET_001', name: 'Pet Grooming',             keywords: ['pet grooming', 'dog bath', 'cat grooming', 'pet hair cut'] },
      { id: 'PET_002', name: 'Vet / Home Doctor',        keywords: ['vet', 'vet doctor', 'pet doctor', 'dog illness'] },
      { id: 'PET_003', name: 'Dog Walker / Pet Sitting', keywords: ['dog walker', 'pet sitter', 'dog walking', 'pet boarding'] },
    ],
    requiredFeatures: ['location', 'petType'],
    recommendedFeatures: ['image'],
  },
  health: {
    displayName: 'Health & Wellness',
    possibleProblems: [
      { id: 'HLTH_001', name: 'Home Nursing Care',       keywords: ['nurse', 'nursing', 'patient care', 'elder care', 'caretaker'] },
      { id: 'HLTH_002', name: 'Home Physiotherapy',      keywords: ['physio', 'physiotherapy', 'back pain', 'rehab'] },
      { id: 'HLTH_003', name: 'Home Doctor Visit',       keywords: ['doctor', 'doctor visit', 'medical checkup', 'home doctor'] },
    ],
    requiredFeatures: ['location', 'patientCondition'],
    recommendedFeatures: ['medicalHistory'],
  },
  society: {
    displayName: 'Society Management & Security',
    possibleProblems: [
      { id: 'SOC_001', name: 'Society Maintenance',     keywords: ['society maintenance', 'society bill', 'flat maintenance'] },
      { id: 'SOC_002', name: 'Security Guard Service',   keywords: ['security guard', 'gatekeeper', 'watchman'] },
    ],
    requiredFeatures: ['location', 'societyName'],
    recommendedFeatures: ['description'],
  },
  events: {
    displayName: 'Events & Celebrations',
    possibleProblems: [
      { id: 'EVNT_001', name: 'Birthday & Event Decor',  keywords: ['birthday', 'event decor', 'balloon decor', 'party planner'] },
      { id: 'EVNT_002', name: 'DJ & Sound System',       keywords: ['dj', 'sound system', 'music for party', 'speakers'] },
      { id: 'EVNT_003', name: 'Event Photographer',      keywords: ['photographer', 'event photography', 'candid camera'] },
    ],
    requiredFeatures: ['location', 'eventDate', 'eventType'],
    recommendedFeatures: ['guestCount'],
  },
  vehicle: {
    displayName: 'Vehicle Services',
    possibleProblems: [
      { id: 'VEH_001', name: 'Car Washing & Detailing',  keywords: ['car wash', 'car detailing', 'foam wash', 'bike wash'] },
      { id: 'VEH_002', name: 'Car & Bike Repair',        keywords: ['mechanic', 'car repair', 'bike repair', 'breakdown', 'tyre puncture'] },
    ],
    requiredFeatures: ['location', 'vehicleModel'],
    recommendedFeatures: ['image'],
  },
  emergency: {
    displayName: 'Emergency Services',
    possibleProblems: [
      { id: 'EMRG_001', name: 'Urgent Repair SOS',      keywords: ['urgent repair', 'sos', 'emergency fix', 'gas leak', 'pipe burst'] },
    ],
    requiredFeatures: ['location', 'contactPhone'],
    recommendedFeatures: ['image'],
  },
};

// ─── Confidence scoring ───────────────────────────────────────────────────────

function _computeConfidence({ matchedKeywords, hasImage, hasVoice, hasLocation, hasDescription }) {
  let score = 0;

  if (matchedKeywords >= 3) score += 0.40;
  else if (matchedKeywords === 2) score += 0.25;
  else if (matchedKeywords === 1) score += 0.15;

  if (hasDescription) score += 0.20;
  if (hasLocation)    score += 0.15;
  if (hasImage)       score += 0.15;
  if (hasVoice)       score += 0.10;

  const normalized = Math.min(1.0, score);

  return {
    score: Math.round(normalized * 100) / 100,
    level: normalized >= 0.8 ? 'HIGH'
         : normalized >= 0.5 ? 'MEDIUM'
         : normalized >= 0.2 ? 'LOW'
         : 'VERY_LOW',
  };
}

// ─── Core analyzer ───────────────────────────────────────────────────────────

/**
 * Analyze a UnifiedContext and return a structured problem analysis.
 *
 * @param {object} unifiedContext - Output of contextBuilder.buildUnifiedContext()
 * @returns {object} Problem Analysis result
 */
/**
 * Analyze a UnifiedContext and return a structured problem analysis.
 * Fuses rule-based taxonomy with real AI analysis when provided.
 *
 * @param {object} unifiedContext - Output of contextBuilder.buildUnifiedContext()
 * @param {object} [aiAnalysis]   - Output of real Gemini Provider vision/multimodal analysis
 * @returns {object} Problem Analysis result
 */
export function analyzeProblem(unifiedContext, aiAnalysis = null) {
  if (!unifiedContext || typeof unifiedContext !== 'object') {
    return _errorAnalysis('Invalid or missing UnifiedContext.');
  }

  const description = unifiedContext.description || '';
  const textKeywords = _flattenKeywords(unifiedContext.attachments?.text?.keywords);
  const categoryHint = unifiedContext.category || unifiedContext.service;
  const hasImage     = !!unifiedContext.modalities?.hasImage && unifiedContext.attachments?.image?.isValid;
  const hasVoice     = !!unifiedContext.modalities?.hasVoice && unifiedContext.attachments?.voice?.isValid;
  const hasLocation  = !!(unifiedContext.location?.city || unifiedContext.location?.address);
  const hasDescription = !!description;

  // If real AI analysis is provided, prioritize AI category detection
  let problemCategory = null;
  let bestMatchCount  = 0;
  let categoryScores  = {};

  if (aiAnalysis?.problemCategory) {
    problemCategory = _normalizeCategoryFromAI(aiAnalysis);
  }

  // Fallback to keyword matching if AI didn't find category
  if (!problemCategory) {
    for (const [category, taxonomy] of Object.entries(PROBLEM_TAXONOMY)) {
      let matchCount = 0;
      for (const problem of taxonomy.possibleProblems) {
        for (const kw of problem.keywords) {
          if (textKeywords.has(kw) || description.toLowerCase().includes(kw)) {
            matchCount++;
          }
        }
      }
      categoryScores[category] = matchCount;
      if (matchCount > bestMatchCount) {
        bestMatchCount  = matchCount;
        problemCategory = category;
      }
    }
  }

  // Override with explicit category hint if available
  if (categoryHint && PROBLEM_TAXONOMY[categoryHint]) {
    problemCategory = categoryHint;
  }

  // Handle Unrecognized Content / Safety Fallback
  if (!problemCategory || aiAnalysis?.problemCategory === 'Unknown Problem') {
    return {
      contextId:       unifiedContext.contextId,
      problemCategory: 'Unknown Problem',
      categoryDisplay: 'Manual Review Required',
      possibleProblems: aiAnalysis?.possibleCauses ? aiAnalysis.possibleCauses.map((c, i) => ({ id: `UNK_${i}`, name: c })) : [],
      confidence:      aiAnalysis ? { score: aiAnalysis.confidence, level: aiAnalysis.confidence >= 0.5 ? 'MEDIUM' : 'VERY_LOW' } : { score: 0.05, level: 'VERY_LOW' },
      requiredFeatures: ['description', 'image'],
      missingInformation: _getMissingInfo(unifiedContext, null),
      categoryScores,
      safetyWarnings: aiAnalysis?.safetyWarnings || ['Unrecognized problem content. Requires manual review.'],
      aiAnalysisRaw: aiAnalysis || null,
      analyzedAt: new Date().toISOString(),
      status: 'CATEGORY_UNDETERMINED',
    };
  }

  const taxonomy = PROBLEM_TAXONOMY[problemCategory] || { displayName: problemCategory, possibleProblems: [], requiredFeatures: [] };

  // Match specific problems
  const matchedProblems = [];
  if (taxonomy.possibleProblems) {
    for (const problem of taxonomy.possibleProblems) {
      let kwMatches = 0;
      for (const kw of problem.keywords) {
        if (textKeywords.has(kw) || description.toLowerCase().includes(kw)) {
          kwMatches++;
        }
      }
      if (kwMatches > 0) {
        matchedProblems.push({ ...problem, matchCount: kwMatches });
      }
    }
  }

  if (aiAnalysis?.problemType) {
    matchedProblems.unshift({
      id: `AI_${Date.now().toString(36)}`,
      name: aiAnalysis.problemType,
      matchCount: 10,
      source: 'GeminiVision'
    });
  }

  matchedProblems.sort((a, b) => b.matchCount - a.matchCount);

  const possibleProblems = matchedProblems.length > 0
    ? matchedProblems
    : (taxonomy.possibleProblems ? taxonomy.possibleProblems.map((p) => ({ ...p, matchCount: 0 })) : []);

  const confidenceScore = aiAnalysis && typeof aiAnalysis.confidence === 'number'
    ? aiAnalysis.confidence
    : _computeConfidence({ matchedKeywords: bestMatchCount, hasImage, hasVoice, hasLocation, hasDescription }).score;

  const confidenceLevel = confidenceScore >= 0.8 ? 'HIGH'
    : confidenceScore >= 0.5 ? 'MEDIUM'
    : confidenceScore >= 0.2 ? 'LOW'
    : 'VERY_LOW';

  const requiredFeatures  = taxonomy.requiredFeatures || [];
  const missingInformation = _getMissingInfo(unifiedContext, taxonomy);

  return {
    contextId:       unifiedContext.contextId,
    problemCategory,
    categoryDisplay: taxonomy.displayName || problemCategory,
    possibleProblems,
    confidence:      { score: confidenceScore, level: confidenceLevel },
    requiredFeatures,
    recommendedFeatures: taxonomy.recommendedFeatures || [],
    missingInformation,
    categoryScores,
    safetyWarnings: aiAnalysis?.safetyWarnings || [],
    aiAnalysisRaw: aiAnalysis || null,
    inputSummary: {
      hasText:       unifiedContext.modalities?.hasText,
      hasImage,
      hasVoice,
      hasLocation,
      hasDescription,
      textWordCount: unifiedContext.attachments?.text?.wordCount || 0,
    },
    analyzedAt: new Date().toISOString(),
    status: 'ANALYZED',
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _flattenKeywords(keywordsObj) {
  const set = new Set();
  if (!keywordsObj) return set;

  const allKws = [
    ...(keywordsObj.service || []).map((k) => k.keyword),
    ...(keywordsObj.general || []).map((k) => k.word),
    ...(keywordsObj.urgency || []).map((k) => k.keyword),
  ];
  for (const kw of allKws) {
    if (kw) set.add(kw.toLowerCase());
  }
  return set;
}

function _getMissingInfo(unifiedContext, taxonomy) {
  const missing = [];

  if (!unifiedContext.description) {
    missing.push({ field: 'description', message: 'Problem description is missing.' });
  }
  if (!unifiedContext.location?.city && !unifiedContext.location?.address) {
    missing.push({ field: 'location', message: 'Service location is missing.' });
  }
  if (!unifiedContext.customer?.customerId) {
    missing.push({ field: 'customer', message: 'Customer identity is not established.' });
  }
  if (taxonomy) {
    for (const feat of taxonomy.requiredFeatures) {
      const mappedField = _mapFeatureToContextField(feat, unifiedContext);
      if (!mappedField.present) {
        missing.push({ field: feat, message: `Required field "${feat}" is missing.` });
      }
    }
  }

  return missing;
}

function _mapFeatureToContextField(feature, ctx) {
  const fieldMap = {
    location:       () => !!(ctx.location?.city || ctx.location?.address),
    description:    () => !!ctx.description,
    image:          () => ctx.modalities?.hasImage,
    fromLocation:   () => !!ctx.location?.city,
    toLocation:     () => !!(ctx.booking?.destination),
    propertySize:   () => !!(ctx.booking?.propertySize),
    area:           () => !!(ctx.booking?.area),
    applianceBrand: () => !!(ctx.booking?.applianceBrand),
    estimatedVolume:() => !!(ctx.booking?.estimatedVolume),
    colorPreference:() => !!(ctx.booking?.colorPreference),
    accessDetails:  () => !!(ctx.booking?.accessDetails),
    dimensions:     () => !!(ctx.booking?.dimensions),
  };
  const check = fieldMap[feature];
  return { present: check ? check() : false };
}

function _errorAnalysis(message) {
  return {
    contextId:        null,
    problemCategory:  null,
    categoryDisplay:  null,
    possibleProblems: [],
    confidence:       { score: 0, level: 'VERY_LOW' },
    requiredFeatures: [],
    missingInformation: [{ field: 'context', message }],
    categoryScores:   {},
    analyzedAt:       new Date().toISOString(),
    status:           'ERROR',
    error:            message,
  };
}

// ─── AI Category Normalizer ────────────────────────────────────────────────────

/**
 * Normalize a raw AI-returned problemCategory to a valid PROBLEM_TAXONOMY key.
 * Cross-references multiple fields (skill, visibleDamage, possibleCauses,
 * reasoningEnglish) to override hallucinated categories.
 *
 * @param {object} aiAnalysis - Parsed AI analysis object from GeminiProvider
 * @returns {string|null} Normalized taxonomy key or null if unrecognized
 */
function _normalizeCategoryFromAI(aiAnalysis) {
  if (!aiAnalysis) return null;

  const VALID_KEYS = Object.keys(PROBLEM_TAXONOMY);

  const rawCat    = String(aiAnalysis.problemCategory || '').toLowerCase().trim();
  const skill     = String(aiAnalysis.recommendedWorkerSkill || aiAnalysis.requiredWorkerSkill || '').toLowerCase();
  const type      = String(aiAnalysis.problemType || '').toLowerCase();
  const svc       = String(aiAnalysis.serviceCategory || '').toLowerCase();
  const reasoning = String(aiAnalysis.reasoningEnglish || '').toLowerCase();

  const damageText = [
    ...(Array.isArray(aiAnalysis.visibleDamage)  ? aiAnalysis.visibleDamage  : []),
    ...(Array.isArray(aiAnalysis.visibleObjects)  ? aiAnalysis.visibleObjects  : []),
    ...(Array.isArray(aiAnalysis.possibleCauses)  ? aiAnalysis.possibleCauses  : []),
    ...(Array.isArray(aiAnalysis.recommendedActions) ? aiAnalysis.recommendedActions : []),
  ].join(' ').toLowerCase();

  const allSignals = `${rawCat} ${skill} ${type} ${svc} ${damageText} ${reasoning}`;

  // ── Signal patterns ──────────────────────────────────────────────────────────
  const WATER_SIGNALS = /\b(water|leak|seepage|pipe|drain|tap|faucet|pani|paani|sewage|toilet|geyser|overflow|drip|tapak|nala|plumb|plumber|ceiling water|wet ceiling|moisture|damp)\b/;
  const ELEC_SIGNALS  = /\b(electric|electrician|wire|socket|switch|mcb|circuit|spark|power|bijli|current|switchboard|outlet|fuse|breaker)\b/;
  const APPL_SIGNALS  = /\b(ac|air.?condition|fridge|refrigerator|washing.?machine|microwave|oven|television|tv|purifier|appliance|ac_tech)\b/;
  const CARP_SIGNALS  = /\b(carpenter|carpentry|door|window|furniture|hinge|drawer|wardrobe|shelf|wood|cabinet)\b/;
  const PAINT_SIGNALS = /\b(paint|painter|peeling|wallpaper|discolor)\b/;
  const SECU_SIGNALS  = /\b(locksmith|lock|key|cctv|camera|alarm|security)\b/;
  const MOVE_SIGNALS  = /\b(moving|shifting|relocation|pack|relocate)\b/;
  const TRVL_SIGNALS  = /\b(driver|chauffeur|outstation|airport|cab|commute|carpool|car driver|ride|travel)\b/;
  const FOOD_SIGNALS  = /\b(cook|chef|kitchen|khana|tiffin|catering|meal|food|rasoi)\b/;
  const PET_SIGNALS   = /\b(pet|dog|cat|grooming|vet|animal|puppy|kitten)\b/;
  const HLTH_SIGNALS  = /\b(nurse|nursing|doctor|physio|patient|elder|caretaker|medical)\b/;
  const SOC_SIGNALS   = /\b(society|maintenance bill|gatekeeper|watchman)\b/;
  const EVNT_SIGNALS  = /\b(birthday|party|event|dj|balloon|decor|celebration|wedding)\b/;
  const VEH_SIGNALS   = /\b(car wash|bike wash|mechanic|car repair|bike repair|puncture|auto mechanic)\b/;

  const isWater = WATER_SIGNALS.test(allSignals);
  const isElec  = ELEC_SIGNALS.test(allSignals);
  const isAppl  = APPL_SIGNALS.test(allSignals);
  const isCarp  = CARP_SIGNALS.test(allSignals);
  const isPaint = PAINT_SIGNALS.test(allSignals);
  const isSecu  = SECU_SIGNALS.test(allSignals);
  const isMove  = MOVE_SIGNALS.test(allSignals);
  const isTrvl  = TRVL_SIGNALS.test(allSignals);
  const isFood  = FOOD_SIGNALS.test(allSignals);
  const isPet   = PET_SIGNALS.test(allSignals);
  const isHlth  = HLTH_SIGNALS.test(allSignals);
  const isSoc   = SOC_SIGNALS.test(allSignals);
  const isEvnt  = EVNT_SIGNALS.test(allSignals);
  const isVeh   = VEH_SIGNALS.test(allSignals);

  // ── Rule A: Travel / Driver signals ──────────────────────────────────────────
  if (isTrvl && !isWater && !isElec && !isAppl) return 'travel';

  // ── Rule B: Food / Cook signals ──────────────────────────────────────────────
  if (isFood && !isWater && !isElec && !isAppl) return 'food';

  // ── Rule C: Pet signals ──────────────────────────────────────────────────────
  if (isPet && !isWater) return 'pet';

  // ── Rule D: Health signals ───────────────────────────────────────────────────
  if (isHlth && !isWater && !isElec) return 'health';

  // ── Rule E: Vehicle signals ──────────────────────────────────────────────────
  if (isVeh && !isWater && !isElec) return 'vehicle';

  // ── Rule F: Event signals ────────────────────────────────────────────────────
  if (isEvnt && !isWater && !isElec) return 'events';

  // ── Rule G: Society signals ──────────────────────────────────────────────────
  if (isSoc) return 'society';

  // ── Rule H: "cleaning" with water signals → plumbing ────────────────────────
  if ((rawCat === 'cleaning' || rawCat.includes('clean')) && isWater && !isAppl) {
    return 'plumbing';
  }

  // ── Rule I: Worker skill matches ──────────────────────────────────────────────
  if (/\bplumb/.test(skill)) return 'plumbing';
  if (/\belectric/.test(skill)) return 'electrical';
  if (/\b(ac_tech|appliance)/.test(skill)) return 'appliance';
  if (/\b(driver|chauffeur)/.test(skill)) return 'travel';
  if (/\b(cook|chef)/.test(skill)) return 'food';
  if (/\b(pet|vet)/.test(skill)) return 'pet';
  if (/\b(nurse|doctor|physio)/.test(skill)) return 'health';

  // ── Rule J: Exact taxonomy match ─────────────────────────────────────────────
  if (VALID_KEYS.includes(rawCat)) return rawCat;

  // ── Rule K: Fuzzy taxonomy match ─────────────────────────────────────────────
  for (const key of VALID_KEYS) {
    const meta = PROBLEM_TAXONOMY[key];
    if (rawCat.includes(key) || rawCat.includes(meta.displayName.toLowerCase())) {
      return key;
    }
  }

  // ── Rule L: Signal-based inference ───────────────────────────────────────────
  if (isTrvl)  return 'travel';
  if (isFood)  return 'food';
  if (isPet)   return 'pet';
  if (isHlth)  return 'health';
  if (isVeh)   return 'vehicle';
  if (isEvnt)  return 'events';
  if (isSoc)   return 'society';
  if (isAppl)  return 'appliance';
  if (isWater && !isElec) return 'plumbing';
  if (isElec)  return 'electrical';
  if (isCarp)  return 'carpentry';
  if (isPaint) return 'painting';
  if (isSecu)  return 'security';
  if (isMove)  return 'moving';

  // ── Fallback: Unknown / Out of Scope ────────────────────────────────────────
  if (rawCat && rawCat !== 'unknown problem') {
    return rawCat;
  }
  return null;
}
