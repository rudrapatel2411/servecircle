/**
 * server/ai/providers/PromptBuilder.js — Phase 4 Batch 1
 *
 * Standardized prompt construction for every AI request in the platform.
 *
 * Rules:
 *   - Every prompt MUST request strict JSON-only output.
 *   - No free-form text responses allowed.
 *   - All schema shapes are documented via JSDoc.
 *   - Business logic never constructs raw prompt strings — it calls PromptBuilder.
 */

// ─── System Preamble ──────────────────────────────────────────────────────────
const JSON_ONLY_PREAMBLE = `You are a structured AI response engine for ServeCircle.
CRITICAL RULES:
1. Respond with VALID JSON ONLY. No prose, no markdown, no code fences.
2. Every response must be a complete, parseable JSON object.
3. Never include explanatory text outside the JSON structure.
4. If you cannot fulfill the request, return: {"error": "reason", "code": "ERROR_CODE"}`;

// ─── Public API ───────────────────────────────────────────────────────────────

export class PromptBuilder {

  /**
   * Build a prompt to analyze a home service problem from an image.
   *
   * Expected JSON response schema:
   * {
   *   "problemCategory": string,       // e.g. "Electrical", "Plumbing"
   *   "detectedIssues": string[],      // List of identified problems
   *   "severity": "low"|"medium"|"high"|"critical",
   *   "recommendedService": string,    // Specific service name
   *   "requiredSkills": string[],
   *   "estimatedUrgency": "immediate"|"same_day"|"scheduled",
   *   "safetyWarnings": string[],      // Empty if none
   *   "confidence": number,            // 0.0 – 1.0
   *   "reasoning": string              // One-line explanation
   * }
   *
   * @param {object} context
   * @param {string} [context.serviceCategory]
   * @param {string} [context.location]
   * @param {string} [context.customerDescription]
   * @returns {string}
   */
  static buildImagePrompt({ serviceCategory = '', location = '', customerDescription = '' } = {}) {
    return `${JSON_ONLY_PREAMBLE}

TASK: Analyze the attached home service problem image.
${serviceCategory     ? `Service Category: ${serviceCategory}`      : ''}
${location            ? `Location: ${location}`                      : ''}
${customerDescription ? `Customer Description: "${customerDescription}"` : ''}

Respond ONLY with this JSON:
{
  "problemCategory": "<category>",
  "detectedIssues": ["<issue1>", "<issue2>"],
  "severity": "<low|medium|high|critical>",
  "recommendedService": "<service name>",
  "requiredSkills": ["<skill1>"],
  "estimatedUrgency": "<immediate|same_day|scheduled>",
  "safetyWarnings": [],
  "confidence": 0.0,
  "reasoning": "<one-line explanation>"
}`;
  }

  /**
   * Build a prompt to diagnose a home service problem from a text description.
   *
   * Expected JSON response schema:
   * {
   *   "problemType": string,
   *   "likelyCauses": string[],
   *   "severity": "low"|"medium"|"high"|"critical",
   *   "recommendedServices": [{ "name": string, "priority": number }],
   *   "diyAdvice": string|null,          // null if professional required
   *   "professionalRequired": boolean,
   *   "estimatedCostRange": { "min": number, "max": number, "currency": "INR" },
   *   "urgency": "immediate"|"same_day"|"scheduled",
   *   "confidence": number
   * }
   *
   * @param {object} context
   * @param {string} context.description    - Customer's problem description
   * @param {string} [context.category]
   * @param {string} [context.location]
   * @returns {string}
   */
  static buildProblemPrompt({ description, category = '', location = '' } = {}) {
    return `${JSON_ONLY_PREAMBLE}

TASK: Diagnose the following home service problem.
Customer Description: "${description}"
${category ? `Category: ${category}` : ''}
${location ? `Location: ${location}` : ''}

Respond ONLY with this JSON:
{
  "problemType": "<type>",
  "likelyCauses": ["<cause1>"],
  "severity": "<low|medium|high|critical>",
  "recommendedServices": [{ "name": "<service>", "priority": 1 }],
  "diyAdvice": null,
  "professionalRequired": true,
  "estimatedCostRange": { "min": 0, "max": 0, "currency": "INR" },
  "urgency": "<immediate|same_day|scheduled>",
  "confidence": 0.0
}`;
  }

  /**
   * Build a prompt to generate service recommendations for a customer.
   *
   * Expected JSON response schema:
   * {
   *   "recommendations": [
   *     {
   *       "rank": number,
   *       "serviceName": string,
   *       "category": string,
   *       "reason": string,
   *       "estimatedPrice": { "min": number, "max": number, "currency": "INR" },
   *       "priority": "high"|"medium"|"low",
   *       "confidence": number
   *     }
   *   ],
   *   "totalRecommendations": number,
   *   "basedOn": string   // Brief note on recommendation basis
   * }
   *
   * @param {object} context
   * @param {string[]} [context.pastServices]      - Previous service categories
   * @param {string}   [context.location]
   * @param {string}   [context.currentIssue]
   * @param {number}   [context.maxResults]
   * @returns {string}
   */
  static buildRecommendationPrompt({
    pastServices = [],
    location = '',
    currentIssue = '',
    maxResults = 5,
  } = {}) {
    return `${JSON_ONLY_PREAMBLE}

TASK: Generate home service recommendations for a ServeCircle customer.
${pastServices.length ? `Past Services: ${pastServices.join(', ')}` : ''}
${location            ? `Customer Location: ${location}`             : ''}
${currentIssue        ? `Current Issue: "${currentIssue}"`           : ''}
Maximum Recommendations: ${maxResults}
Currency: INR (Indian Rupees)

Respond ONLY with this JSON:
{
  "recommendations": [
    {
      "rank": 1,
      "serviceName": "<name>",
      "category": "<category>",
      "reason": "<why recommended>",
      "estimatedPrice": { "min": 0, "max": 0, "currency": "INR" },
      "priority": "<high|medium|low>",
      "confidence": 0.0
    }
  ],
  "totalRecommendations": ${maxResults},
  "basedOn": "<brief basis>"
}`;
  }

  /**
   * Build a prompt for vision-based analysis with a custom instruction.
   *
   * Expected JSON response schema: defined by caller via responseSchema.
   * Falls back to a generic schema if none provided.
   *
   * @param {object} context
   * @param {string} context.instruction       - Specific analysis instruction
   * @param {object} [context.responseSchema]  - Desired JSON output shape (as comment/description)
   * @param {string} [context.context]         - Additional context
   * @returns {string}
   */
  static buildVisionPrompt({ instruction, responseSchema = null, context = '' } = {}) {
    const schemaNote = responseSchema
      ? `Required JSON schema:\n${JSON.stringify(responseSchema, null, 2)}`
      : `{
  "analysisType": "<type>",
  "findings": ["<finding1>"],
  "confidence": 0.0,
  "summary": "<one-line summary>",
  "recommendations": []
}`;

    return `${JSON_ONLY_PREAMBLE}

TASK: ${instruction}
${context ? `Context: ${context}` : ''}

Respond ONLY with this JSON:
${schemaNote}`;
  }

  /**
   * Build a general-purpose JSON-enforced prompt.
   * Use when no specialized builder fits the use case.
   *
   * @param {string}  task         - Description of what to do
   * @param {string}  [schema]     - JSON schema string (optional)
   * @param {object}  [variables]  - Key-value pairs injected into the prompt
   * @returns {string}
   */
  static buildGenericJsonPrompt(task, schema = '', variables = {}) {
    const varBlock = Object.entries(variables)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join('\n');

    return `${JSON_ONLY_PREAMBLE}

TASK: ${task}
${varBlock ? `\nContext:\n${varBlock}` : ''}
${schema   ? `\nRespond ONLY with this JSON schema:\n${schema}` : '\nRespond with a valid JSON object.'}`;
  }

  // ─── Phase 4 Batch 2: Real Text Intelligence ────────────────────────────────

  /**
   * Build a prompt for deep text analysis of a customer's problem description.
   *
   * @param {string} text - The raw customer problem description.
   * @returns {string}
   */
  static buildProblemAnalysisPrompt(text) {
    return `${JSON_ONLY_PREAMBLE}

TASK: Analyze the following customer problem description and extract structured information.

Customer Text: "${text}"

=== LANGUAGE & SPELLING INSTRUCTIONS ===
The customer may have written in:
- English (standard or with typos)
- Hindi (Devanagari script OR romanized e.g. "bijli nahi aa rahi", "pani tapak raha hai")
- Gujarati (native script OR romanized e.g. "pani aave chhe", "nal tuti gayi")
- Hinglish (mixed Hindi + English e.g. "mera pipe leak ho raha hai", "AC kaam nahi kar raha")

SPELLING TOLERANCE RULES:
1. Treat spelling mistakes as the most likely intended word.
   Examples: "leakej" → leakage, "bijili" → bijli, "plumar" → plumber, "gizer" → geyser, "frij" → fridge, "soket" → socket, "electrisian" → electrician
2. Understand romanized Hindi/Gujarati words as home service terms:
   - pani/paani = water, tapak/tapakna = drip/leak, bijli = electricity, nal/nalka = tap/pipe, nali = drain, darwaza = door, khidki = window, chabi = key, almirah = wardrobe, ghar = home, chhat = ceiling, deewar = wall
3. If text seems garbled, infer the most plausible home-service problem from context.

=== VALID SERVICE TAXONOMY ===
problemCategory MUST be one of: "plumbing", "electrical", "cleaning", "carpentry", "painting", "appliance", "security", "moving"

INSTRUCTIONS:
1. Identify the core problem (ignore spelling mistakes, understand intent).
2. Determine the service category from the taxonomy above ONLY.
3. Estimate urgency (low, medium, high, critical).
4. Provide a confidence score (0.0 to 1.0).
5. Write followUpQuestions in the SAME language the customer used (Hindi if they wrote Hindi, Gujarati if Gujarati, English if English).
6. The JSON schema must strictly match the following shape.

Respond ONLY with this JSON:
{
  "problemCategory": "<string — must be from valid taxonomy>",
  "problemType": "<string>",
  "serviceCategory": "<string>",
  "urgency": "<string>",
  "confidence": 0.0,
  "reasoning": "<string — always in English>",
  "detectedLanguage": "<english|hindi|gujarati|hinglish>",
  "possibleCauses": ["<string>"],
  "recommendedActions": ["<string>"],
  "requiredWorkerSkill": "<string>",
  "estimatedDuration": "<string>",
  "estimatedDifficulty": "<string>",
  "needsImage": true,
  "needsMoreInformation": false,
  "followUpQuestions": ["<string — in customer's language>"]
}`;
  }

  /**
   * Build prompt for real Gemini Vision image analysis.
   * Anchors Gemini to the platform taxonomy to prevent category hallucination.
   *
   * @param {object} context
   * @returns {string}
   */
  static buildVisionAnalysisPrompt({ serviceCategory = '', location = '', customerDescription = '' } = {}) {
    return `${JSON_ONLY_PREAMBLE}

TASK: Analyze the attached image for home service diagnosis on the ServeCircle platform.

Context:
${serviceCategory     ? `- Service Category Hint: ${serviceCategory}` : ''}
${location            ? `- Location: ${location}`                     : ''}
${customerDescription ? `- Customer Note: "${customerDescription}"`   : ''}

=== VALID SERVICE TAXONOMY (YOU MUST ONLY USE THESE) ===
You MUST set "problemCategory" to EXACTLY one of the allowed platform categories:
- plumbing, electrical, cleaning, carpentry, painting, appliance, security, moving, travel, food, pet, health, society, events, vehicle, emergency, or out_of_scope.

CRITICAL CLASSIFICATION RULES:
- Ceiling dripping water / wet ceiling patch / wall seepage → "plumbing" (NOT "cleaning")
- Car / Bike / Vehicle → "vehicle"
- Pet / Animal → "pet"
- Food / Kitchen dish → "food"
- Driver / Car interior with driver → "travel"
- If image is unrelated to home services (selfie, food photo, nature), use "out_of_scope".

INSTRUCTIONS:
1. Carefully inspect every visible detail of the image.
2. Identify: Problem Category (from taxonomy above ONLY), Problem Type, Visible Objects, Visible Damage, Possible Causes, Urgency (low, medium, high, critical), Damage Severity (Minor, Moderate, Major, Critical), Confidence (0.0–1.0), Recommended Worker Skill, Estimated Difficulty (easy, medium, hard), Estimated Duration.
3. SAFETY & RELEVANCE CHECK: If image is non-service-related, return "Unknown Problem" with confidence 0.1.

Respond ONLY with this JSON schema:
{
  "problemCategory": "",
  "problemType": "",
  "serviceCategory": "",
  "visibleObjects": [],
  "visibleDamage": [],
  "possibleCauses": [],
  "urgency": "medium",
  "damageSeverity": "Moderate",
  "confidence": 0.0,
  "recommendedWorkerSkill": "",
  "estimatedDifficulty": "",
  "estimatedDuration": "",
  "needsMoreImages": false,
  "needsMoreInformation": false,
  "followUpQuestions": [],
  "safetyWarnings": [],
  "decisionPath": ["Visual Feature Extraction", "Taxonomy Classification", "Damage Severity Assessment"],
  "evidence": []
}`;
  }

  /**
   * Build prompt for real Gemini Multimodal analysis (text + image + context combined).
   * Anchors Gemini to the platform taxonomy to prevent category hallucination.
   *
   * @param {object} context
   * @returns {string}
   */
  static buildMultimodalAnalysisPrompt({ text = '', bookingContext = {}, customerContext = {}, location = '', serviceHistory = [], customerLanguage = '' } = {}) {
    const lang = (customerLanguage || customerContext?.preferredLanguage || 'English').trim();

    return `${JSON_ONLY_PREAMBLE}

TASK: Perform unified multimodal analysis combining text, image, and context for ServeCircle home service request.

Input Information:
- Customer Text: "${text}"
- Location: "${location || bookingContext?.location || customerContext?.address || ''}"
- Booking Context: ${JSON.stringify(bookingContext)}
- Customer Context: ${JSON.stringify(customerContext)}
- Service History: ${JSON.stringify(serviceHistory)}
- Customer Language: "${lang}"

=== VALID SERVICE TAXONOMY (YOU MUST ONLY USE THESE) ===
1. "plumbing"   — Leaking pipes, dripping taps, ceiling seepage, water leak, blocked drain, toilet, geyser.
2. "electrical" — MCB, short circuit, switchboard, wires, lights, sockets, power cut.
3. "cleaning"   — Home deep cleaning, bathroom cleaning, sofa/carpet clean, pest control.
4. "carpentry"  — Furniture repair, door/window repair, wardrobe, shelves, hinges.
5. "painting"   — Wall painting, whitewash, peeling paint, wallpaper.
6. "appliance"  — AC servicing/repair, fridge, washing machine, microwave, TV, water purifier.
7. "security"   — Lock repair, locksmith, lost keys, CCTV, door handles, alarm system.
8. "moving"     — Packers & movers, house shifting, office relocation, furniture transport.
9. "travel"     — Outstation driver, personal chauffeur, airport drop & pick, car rental, carpool.
10. "food"      — Home cook, personal chef, tiffin service, catering.
11. "pet"       — Pet grooming, vet doctor, dog walker, pet sitting, pet boarding.
12. "health"    — Home nursing, caretaker, physiotherapist, home doctor visit, elder care.
13. "society"   — Society maintenance, security guard, gatekeeper.
14. "events"    — Birthday party decor, event planner, DJ & sound, photographer.
15. "vehicle"   — Car wash, car detailing, bike repair, auto mechanic.
16. "emergency" — Immediate breakdown, fire, gas leak, severe pipe burst.
17. "out_of_scope" — Services NOT offered on home/lifestyle platform (e.g. loans, stock trading, flight pilot, lawyer court case).

CRITICAL CLASSIFICATION RULES:
- Driver / Chauffeur / Airport drop / Cab → "travel" (NEVER "plumbing" or "cleaning"!)
- Cook / Home chef / Tiffin / Catering → "food"
- Pet bath / Vet doctor / Dog walk → "pet"
- Nursing / Physio / Elder care / Home doctor → "health"
- Party decor / DJ / Photographer / Birthday → "events"
- Car wash / Bike mechanic / Tyre repair → "vehicle"
- Ceiling water / Seepage / Pipe leak → "plumbing"
- AC / Fridge / Washing machine body or motor → "appliance"
- If the customer asks for a service NOT on our platform (e.g. lawyer, real estate agent, stock market advisor, pilot) → "out_of_scope".

INSTRUCTIONS:
1. Carefully inspect text and image. Select problemCategory from the VALID SERVICE TAXONOMY above ONLY.
2. Provide urgency (low, medium, high, critical), damageSeverity (Minor, Moderate, Major, Critical), confidence (0.0–1.0), requiredWorkerSkill, estimatedDuration.
3. REASONING LOCALIZATION:
   - "reasoningEnglish": One-sentence concise technical reasoning in English.
   - "reasoningLocalized": Same reasoning in customer's language (Hindi/Gujarati/English based on "${lang}").
4. UNRELATED / UNSAFE / OUT OF SCOPE: If text or image is non-service-related or out of scope, return problemCategory "out_of_scope", confidence <= 0.3, needsMoreInformation true.

Respond ONLY with this JSON schema:
{
  "problemCategory": "",
  "problemType": "",
  "serviceCategory": "",
  "urgency": "",
  "damageSeverity": "Moderate",
  "confidence": 0.0,
  "reasoningEnglish": "",
  "reasoningLocalized": "",
  "possibleCauses": [],
  "recommendedActions": [],
  "requiredWorkerSkill": "",
  "estimatedDuration": "",
  "estimatedDifficulty": "",
  "requiredMaterials": [],
  "needsImage": false,
  "needsMoreInformation": false,
  "followUpQuestions": [],
  "safetyWarnings": [],
  "decisionPath": ["Multimodal Context Fusion", "Taxonomy Classification", "Unified Intelligence Resolution"],
  "evidence": []
}`;
  }
}
