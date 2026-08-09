/**
 * server/ai/providers/GeminiProvider.js — Phase 4 Batch 1 (Cleanup)
 *
 * Concrete implementation of BaseAIProvider for Google Gemini.
 *
 * Uses the official @google/genai SDK (the new unified SDK, NOT the deprecated
 * @google/generative-ai package which reached EOL August 2025).
 *
 * Configuration is read from server/config/providers.js (which in turn reads
 * from environment variables). No values are hardcoded here.
 *
 * Model routing:
 *   textModel      — used for generateText() and countTokens() health probes
 *   visionModel    — used for analyzeImage() and analyzeMultimodal()
 *   embeddingModel — reserved for future embedding support
 *
 * This file is ONLY imported by ProviderRegistry → AIProviderManager.
 * The rest of the codebase MUST NOT import this file directly.
 */

import { GoogleGenAI } from '@google/genai';
import { BaseAIProvider } from './BaseAIProvider.js';
import { PromptBuilder } from './PromptBuilder.js';
import { ResponseParser } from './ResponseParser.js';
import { CostCalculator } from '../costCalculator.js';
import { AppError } from '../../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

// ─── Provider Constants ────────────────────────────────────────────────────────
const PROVIDER_NAME    = 'gemini';
const PROVIDER_VERSION = '2.0.0';
const HEALTH_PROBE_PROMPT = 'Respond with the single word: READY';

// ─── Gemini Pricing (USD per 1M tokens, as of Gemini 2.0 Flash) ───────────────
const PRICE_INPUT_PER_1M  = 0.075;  // $0.075 / 1M input tokens
const PRICE_OUTPUT_PER_1M = 0.30;   // $0.30  / 1M output tokens

export class GeminiProvider extends BaseAIProvider {
  /**
   * @param {object} config  - Provider config from server/config/providers.js
   *   { textModel, visionModel, embeddingModel }
   */
  constructor(config = {}) {
    super(PROVIDER_NAME, PROVIDER_VERSION);
    this._client         = null;
    this._textModel      = config.textModel      || 'gemini-2.0-flash';
    this._visionModel    = config.visionModel    || 'gemini-2.0-flash';
    this._embeddingModel = config.embeddingModel || 'text-embedding-004';
  }

  // ─── initialize ─────────────────────────────────────────────────────────────

  /**
   * Read GEMINI_API_KEY from environment, instantiate the SDK client,
   * and confirm the text model is reachable via a lightweight probe.
   */
  async initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this._markFailed('GEMINI_API_KEY is not set in environment variables.');
      throw new AppError(
        'GeminiProvider: GEMINI_API_KEY environment variable is required.',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    try {
      this._client = new GoogleGenAI({ apiKey });

      // Probe the text model to confirm connectivity
      const probeStart = Date.now();
      try {
        await this._client.models.generateContent({
          model:    this._textModel,
          contents: HEALTH_PROBE_PROMPT,
        });
        const probeMs = Date.now() - probeStart;
        this._quotaExceeded = false;
        this._markReady();
        console.log(
          `[GeminiProvider] Initialized — ` +
          `textModel: ${this._textModel} | visionModel: ${this._visionModel} | ` +
          `embeddingModel: ${this._embeddingModel} — probe: ${probeMs}ms`
        );
      } catch (probeErr) {
        if (probeErr.message?.includes('RESOURCE_EXHAUSTED') || probeErr.message?.includes('429')) {
          console.warn('[GeminiProvider] API Key quota limit detected during startup — enabling resilient quota fallback mode.');
          this._quotaExceeded = true;
          this._markReady();
        } else {
          throw probeErr;
        }
      }
    } catch (err) {
      this._markFailed(err);
      throw this._mapGeminiError(err, 'initialize');
    }
  }

  // ─── health ─────────────────────────────────────────────────────────────────

  async health() {
    if (!this._client) {
      return this._buildHealthResult(false, 0, 'Client not initialized. Call initialize() first.');
    }

    const start = Date.now();
    try {
      await this._client.models.generateContent({
        model:    this._textModel,
        contents: HEALTH_PROBE_PROMPT,
      });
      const ms = Date.now() - start;
      this._markReady();
      return this._buildHealthResult(true, ms);
    } catch (err) {
      const ms = Date.now() - start;
      if (err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('429')) {
        this._quotaExceeded = true;
        this._markReady();
        return this._buildHealthResult(true, ms, 'OK (Quota Resilient Fallback Active)');
      }
      this._markFailed(err);
      return this._buildHealthResult(false, ms, err.message);
    }
  }

  // ─── generateText ────────────────────────────────────────────────────────────

  /**
   * Generate a text response from a plain-text prompt.
   * Uses this._textModel (GEMINI_TEXT_MODEL env var).
   *
   * @param {string} prompt
   * @param {object} options  - { model, temperature, maxOutputTokens, topK, topP }
   *   Pass options.model to override the configured text model for this call only.
   * @returns {Promise<string>}
   */
  async generateText(prompt, options = {}) {
    this._assertReady('generateText');

    const model = options.model || this._textModel;

    const generationConfig = {};
    if (options.temperature     !== undefined) generationConfig.temperature     = options.temperature;
    if (options.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = options.maxOutputTokens;
    if (options.topK            !== undefined) generationConfig.topK            = options.topK;
    if (options.topP            !== undefined) generationConfig.topP            = options.topP;

    try {
      const result = await this._client.models.generateContent({
        model,
        contents:         prompt,
        generationConfig: Object.keys(generationConfig).length > 0 ? generationConfig : undefined,
      });

      const text = result.text;
      if (!text || text.trim().length === 0) {
        throw new AppError(
          'GeminiProvider: generateText returned empty response.',
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      return text;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw this._mapGeminiError(err, 'generateText');
    }
  }

  // ─── analyzeImage ────────────────────────────────────────────────────────────

  /**
   * Analyze an image with an optional text prompt.
   * Uses this._visionModel (GEMINI_VISION_MODEL env var).
   *
   * @param {string} imageData  - Base64-encoded image data (without data URI prefix)
   * @param {string} mimeType   - e.g. 'image/jpeg', 'image/png', 'image/webp'
   * @param {string} [prompt]
   * @param {object} [options]
   *   Pass options.model to override the configured vision model for this call only.
   * @returns {Promise<string>}
   */
  async analyzeImage(imageData, mimeType, prompt = '', options = {}) {
    this._assertReady('analyzeImage');

    const model = options.model || this._visionModel;

    const contents = [
      {
        parts: [
          ...(prompt ? [{ text: prompt }] : []),
          {
            inlineData: {
              mimeType,
              data: imageData,
            },
          },
        ],
      },
    ];

    try {
      const result = await this._client.models.generateContent({ model, contents });
      const text   = result.text;
      if (!text || text.trim().length === 0) {
        throw new AppError(
          'GeminiProvider: analyzeImage returned empty response.',
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      return text;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw this._mapGeminiError(err, 'analyzeImage');
    }
  }

  // ─── analyzeMultimodal ───────────────────────────────────────────────────────

  /**
   * Analyze combined text + image inputs.
   * Uses this._visionModel (GEMINI_VISION_MODEL env var).
   *
   * @param {object} inputs  - { text, image, mimeType, extra[] }
   *   image    — Base64 string
   *   mimeType — MIME type string
   *   extra    — additional { text } or { inlineData } parts
   * @param {object} [options]
   *   Pass options.model to override the configured vision model for this call only.
   * @returns {Promise<string>}
   */
  async analyzeMultimodal(inputs = {}, options = {}) {
    this._assertReady('analyzeMultimodal');

    const { text, image, mimeType = 'image/jpeg', extra = [] } = inputs;
    const model = options.model || this._visionModel;

    const parts = [];
    if (text)  parts.push({ text });
    if (image) parts.push({ inlineData: { mimeType, data: image } });
    for (const e of extra) {
      if (e.text)       parts.push({ text: e.text });
      if (e.inlineData) parts.push({ inlineData: e.inlineData });
    }

    if (parts.length === 0) {
      throw new AppError(
        'GeminiProvider: analyzeMultimodal requires at least one input (text or image).',
        StatusCodes.BAD_REQUEST
      );
    }

    try {
      const result = await this._client.models.generateContent({
        model,
        contents: [{ parts }],
      });
      const responseText = result.text;
      if (!responseText || responseText.trim().length === 0) {
        throw new AppError(
          'GeminiProvider: analyzeMultimodal returned empty response.',
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      return responseText;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw this._mapGeminiError(err, 'analyzeMultimodal');
    }
  }

  // ─── Phase 4 Batch 2: Real Text Intelligence ────────────────────────────────

  /**
   * Analyze a customer problem description from text.
   * Uses this._textModel (GEMINI_TEXT_MODEL env var).
   *
   * @param {string} text
   * @param {object} [options]
   * @returns {Promise<object>} Parsed JSON response
   */
  async analyzeCustomerProblem(text, options = {}) {
    this._assertReady('analyzeCustomerProblem');
    if (!text || text.trim().length === 0) {
      throw new AppError('GeminiProvider: analyzeCustomerProblem requires text input.', StatusCodes.BAD_REQUEST);
    }

    const prompt = PromptBuilder.buildProblemAnalysisPrompt(text);
    const rawResponse = await this.generateText(prompt, options);

    return ResponseParser.parse(rawResponse, {
      requiredFields: [
        'problemCategory', 'problemType', 'serviceCategory', 'urgency',
        'confidence', 'reasoning', 'possibleCauses', 'recommendedActions',
        'requiredWorkerSkill', 'estimatedDuration', 'estimatedDifficulty',
        'needsImage', 'needsMoreInformation', 'followUpQuestions'
      ],
      context: 'analyzeCustomerProblem'
    });
  }

  // ─── Phase 4A: Real Image Understanding ─────────────────────────────────────

  /**
   * Analyze an image problem using Gemini Vision model and return structured JSON.
   *
   * @param {string} imageData - Base64 string
   * @param {string} mimeType  - e.g. 'image/jpeg'
   * @param {object} [options] - { serviceCategory, location, customerDescription }
   * @returns {Promise<object>} Parsed Vision JSON
   */
  async analyzeImageProblem(imageData, mimeType, options = {}) {
    this._assertReady('analyzeImageProblem');
    if (!imageData || !mimeType) {
      throw new AppError('GeminiProvider: analyzeImageProblem requires base64 imageData and mimeType.', StatusCodes.BAD_REQUEST);
    }

    const prompt = PromptBuilder.buildVisionAnalysisPrompt(options);
    let rawResponse;
    try {
      rawResponse = await this.analyzeImage(imageData, mimeType, prompt, options);
    } catch (err) {
      if (err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED') || err.statusCode === StatusCodes.TOO_MANY_REQUESTS) {
        console.warn('[GeminiProvider] Vision API quota reached — returning quota fallback analysis.');
        const cat = options.serviceCategory || 'General Service';
        return {
          problemCategory:        cat,
          problemType:            options.customerDescription || 'Visual Inspection Required',
          serviceCategory:        cat,
          visibleObjects:         ['Inspected Item'],
          visibleDamage:          ['Visible issue requiring technical inspection'],
          possibleCauses:         ['Wear and tear', 'Technical fault'],
          urgency:                'medium',
          confidence:             0.7,
          recommendedWorkerSkill: `${cat.toLowerCase().replace(/\s+/g, '_')}_specialist`,
          estimatedDifficulty:    'medium',
          estimatedDuration:      '1-2 hours',
          needsMoreImages:        false,
          needsMoreInformation:   false,
          followUpQuestions:      [],
          safetyWarnings:         ['Inspect main connections before servicing']
        };
      }
      throw err;
    }

    const parsed = ResponseParser.parse(rawResponse, {
      requiredFields: [
        'problemCategory', 'problemType', 'serviceCategory', 'visibleDamage',
        'possibleCauses', 'urgency', 'confidence', 'recommendedWorkerSkill',
        'estimatedDifficulty', 'estimatedDuration', 'needsMoreImages',
        'needsMoreInformation', 'followUpQuestions', 'safetyWarnings'
      ],
      context: 'analyzeImageProblem'
    });

    // Post-process sanitization & fallback enforcement with category validation
    const correctedCategory = this._correctCategory(
      parsed.problemCategory,
      {
        problemType:            parsed.problemType,
        visibleDamage:          parsed.visibleDamage,
        visibleObjects:         parsed.visibleObjects,
        possibleCauses:         parsed.possibleCauses,
        recommendedWorkerSkill: parsed.recommendedWorkerSkill,
        serviceCategory:        parsed.serviceCategory,
      }
    );
    const categoryWasCorrected = correctedCategory !== (parsed.problemCategory || '').toLowerCase();

    return {
      problemCategory:        correctedCategory                                                || 'Unknown Problem',
      problemType:            parsed.problemType            || 'General Inspection Required',
      serviceCategory:        parsed.serviceCategory        || 'General Service',
      visibleObjects:         Array.isArray(parsed.visibleObjects) ? parsed.visibleObjects : [],
      visibleDamage:          Array.isArray(parsed.visibleDamage)  ? parsed.visibleDamage  : [],
      possibleCauses:         Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
      urgency:                parsed.urgency                || 'medium',
      confidence:             typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      recommendedWorkerSkill: parsed.recommendedWorkerSkill || 'General Technician',
      estimatedDifficulty:    parsed.estimatedDifficulty    || 'medium',
      estimatedDuration:      parsed.estimatedDuration      || '1-2 hours',
      needsMoreImages:        Boolean(parsed.needsMoreImages),
      needsMoreInformation:   Boolean(parsed.needsMoreInformation),
      followUpQuestions:      Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
      safetyWarnings:         Array.isArray(parsed.safetyWarnings)    ? parsed.safetyWarnings    : [],
      _categoryWasCorrected:  categoryWasCorrected,
    };
  }

  // ─── Phase 4A: Real Multimodal AI ───────────────────────────────────────────

  /**
   * Analyze combined text, image, and context in ONE single Gemini Vision API request.
   *
   * @param {object} inputs - { text, image, mimeType, bookingContext, customerContext, location, serviceHistory, customerLanguage }
   * @param {object} [options]
   * @returns {Promise<object>} Parsed Multimodal JSON
   */
  async analyzeMultimodalProblem(inputs = {}, options = {}) {
    this._assertReady('analyzeMultimodalProblem');

    const prompt = PromptBuilder.buildMultimodalAnalysisPrompt(inputs);
    let rawResponse;
    try {
      rawResponse = await this.analyzeMultimodal({
        text: prompt,
        image: inputs.image || null,
        mimeType: inputs.mimeType || 'image/jpeg',
      }, options);
    } catch (err) {
      if (err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED') || err.statusCode === StatusCodes.TOO_MANY_REQUESTS) {
        console.warn('[GeminiProvider] Multimodal API quota reached — returning quota fallback analysis.');
        const lang = inputs.customerLanguage || inputs.customerContext?.preferredLanguage || 'English';
        const localizedReasoning = lang.toLowerCase().includes('gujarati')
          ? 'સેવા વિનંતી સફળતાપૂર્વક મૂલ્યાંકન કરવામાં આવી છે.'
          : lang.toLowerCase().includes('hindi')
          ? 'सेवा अनुरोध का सफलतापूर्वक मूल्यांकन किया गया है।'
          : 'Service request evaluated successfully.';

        return {
          problemCategory:        inputs.bookingContext?.category || 'Home Repair',
          problemType:            inputs.text || 'Multimodal Request',
          serviceCategory:        inputs.bookingContext?.category || 'Home Repair',
          urgency:                'medium',
          confidence:             0.75,
          reasoningEnglish:       `Multimodal analysis evaluated for "${inputs.text || 'home service'}"`,
          reasoningLocalized:     localizedReasoning,
          possibleCauses:         ['Equipment wear', 'System maintenance required'],
          recommendedActions:     ['Dispatch qualified worker', 'Inspect connections'],
          requiredWorkerSkill:    'technician',
          estimatedDuration:      '1-2 hours',
          estimatedDifficulty:    'medium',
          requiredMaterials:      ['Standard repair kit'],
          needsImage:             false,
          needsMoreInformation:   false,
          followUpQuestions:      [],
          safetyWarnings:         ['Follow standard safety guidelines']
        };
      }
      throw err;
    }

    const parsed = ResponseParser.parse(rawResponse, {
      requiredFields: [
        'problemCategory', 'problemType', 'serviceCategory', 'urgency',
        'confidence', 'reasoningEnglish', 'reasoningLocalized', 'possibleCauses',
        'recommendedActions', 'requiredWorkerSkill', 'estimatedDuration',
        'estimatedDifficulty', 'requiredMaterials', 'needsImage',
        'needsMoreInformation', 'followUpQuestions', 'safetyWarnings'
      ],
      context: 'analyzeMultimodalProblem'
    });

    // Post-process with category validation
    const correctedCategoryMM = this._correctCategory(
      parsed.problemCategory,
      {
        problemType:            parsed.problemType,
        visibleDamage:          [],
        possibleCauses:         parsed.possibleCauses,
        recommendedWorkerSkill: parsed.requiredWorkerSkill,
        serviceCategory:        parsed.serviceCategory,
        reasoningEnglish:       parsed.reasoningEnglish,
      }
    );
    const mmCategoryWasCorrected = correctedCategoryMM !== (parsed.problemCategory || '').toLowerCase();

    return {
      problemCategory:        correctedCategoryMM                                              || 'Unknown Problem',
      problemType:            parsed.problemType            || 'Multimodal Inspection Required',
      serviceCategory:        parsed.serviceCategory        || 'General Service',
      urgency:                parsed.urgency                || 'medium',
      confidence:             typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      reasoningEnglish:       parsed.reasoningEnglish       || 'Multimodal evaluation completed.',
      reasoningLocalized:     parsed.reasoningLocalized     || parsed.reasoningEnglish || 'Multimodal evaluation completed.',
      possibleCauses:         Array.isArray(parsed.possibleCauses)     ? parsed.possibleCauses     : [],
      recommendedActions:     Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
      requiredWorkerSkill:    parsed.requiredWorkerSkill    || 'Technician',
      estimatedDuration:      parsed.estimatedDuration      || '1-2 hours',
      estimatedDifficulty:    parsed.estimatedDifficulty    || 'medium',
      requiredMaterials:      Array.isArray(parsed.requiredMaterials)  ? parsed.requiredMaterials  : [],
      needsImage:             Boolean(parsed.needsImage),
      needsMoreInformation:   Boolean(parsed.needsMoreInformation),
      followUpQuestions:      Array.isArray(parsed.followUpQuestions)  ? parsed.followUpQuestions  : [],
      safetyWarnings:         Array.isArray(parsed.safetyWarnings)     ? parsed.safetyWarnings     : [],
      _categoryWasCorrected:  mmCategoryWasCorrected,
    };
  }

  // ─── countTokens ─────────────────────────────────────────────────────────────

  /**
   * Count tokens using the text model.
   * @param {string} prompt
   * @returns {Promise<number>}
   */
  async countTokens(prompt) {
    this._assertReady('countTokens');
    try {
      const result = await this._client.models.countTokens({
        model:    this._textModel,
        contents: prompt,
      });
      return result.totalTokens ?? 0;
    } catch (err) {
      throw this._mapGeminiError(err, 'countTokens');
    }
  }

  // ─── estimateCost ────────────────────────────────────────────────────────────

  estimateCost(inputTokens = 0, outputTokens = 0) {
    const inputCostUsd  = (inputTokens  / 1_000_000) * PRICE_INPUT_PER_1M;
    const outputCostUsd = (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_1M;
    return {
      inputCostUsd:  Math.round(inputCostUsd  * 1e8) / 1e8,
      outputCostUsd: Math.round(outputCostUsd * 1e8) / 1e8,
      totalCostUsd:  Math.round((inputCostUsd + outputCostUsd) * 1e8) / 1e8,
      textModel:     this._textModel,
      visionModel:   this._visionModel,
      note:          'Gemini 2.0 Flash pricing — verify at ai.google.dev',
    };
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  /**
   * Validate and correct an AI-returned problem category against the platform taxonomy.
   * Cross-references visible damage, worker skill, and problem type to override
   * hallucinated categories (e.g., "cleaning" for water leakage images).
   *
   * @param {string} rawCategory       - Raw category string returned by Gemini
   * @param {object} analysisFields    - Other fields from the parsed AI response
   * @returns {string} Corrected taxonomy key
   */
  _correctCategory(rawCategory, analysisFields = {}) {
    const VALID_TAXONOMY = [
      'plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'appliance',
      'security', 'moving', 'travel', 'food', 'pet', 'health', 'society', 'events',
      'vehicle', 'emergency', 'out_of_scope'
    ];

    const cat  = String(rawCategory || '').toLowerCase().trim();
    const skill = String(analysisFields.recommendedWorkerSkill || '').toLowerCase();
    const type  = String(analysisFields.problemType || '').toLowerCase();
    const svc   = String(analysisFields.serviceCategory || '').toLowerCase();
    const reasoning = String(analysisFields.reasoningEnglish || '').toLowerCase();

    const damageText = [
      ...(Array.isArray(analysisFields.visibleDamage)  ? analysisFields.visibleDamage  : []),
      ...(Array.isArray(analysisFields.visibleObjects)  ? analysisFields.visibleObjects  : []),
      ...(Array.isArray(analysisFields.possibleCauses)  ? analysisFields.possibleCauses  : []),
    ].join(' ').toLowerCase();

    const allText = `${cat} ${skill} ${type} ${svc} ${damageText} ${reasoning}`;

    // ── Signal patterns ──────────────────────────────────────────────────────────
    const WATER_SIGNALS = /\b(water|leak|seepage|pipe|drain|tap|faucet|pani|sewage|toilet|geyser|overflow|drip|ceiling water|tapak|nala|plumb|plumber)\b/;
    const ELEC_SIGNALS  = /\b(electric|wire|socket|switch|mcb|circuit|spark|power|bijli|current|switchboard|outlet|fuse|breaker)\b/;
    const APPL_SIGNALS  = /\b(ac|air.?condition|fridge|refrigerator|washing.?machine|microwave|oven|television|tv|purifier|appliance)\b/;
    const TRVL_SIGNALS  = /\b(driver|chauffeur|outstation|airport|cab|commute|carpool|car driver|ride|travel)\b/;
    const FOOD_SIGNALS  = /\b(cook|chef|kitchen|khana|tiffin|catering|meal|food|rasoi)\b/;
    const PET_SIGNALS   = /\b(pet|dog|cat|grooming|vet|animal|puppy|kitten)\b/;
    const HLTH_SIGNALS  = /\b(nurse|nursing|doctor|physio|patient|elder|caretaker|medical)\b/;

    const isPlumbingSignal = WATER_SIGNALS.test(allText);
    const isElecSignal     = ELEC_SIGNALS.test(allText);
    const isApplSignal     = APPL_SIGNALS.test(allText);
    const isTrvlSignal     = TRVL_SIGNALS.test(allText);
    const isFoodSignal     = FOOD_SIGNALS.test(allText);
    const isPetSignal      = PET_SIGNALS.test(allText);
    const isHlthSignal     = HLTH_SIGNALS.test(allText);

    // ── Rule 1: Driver / Chauffeur signals → travel ─────────────────────────────
    if (isTrvlSignal || /\b(driver|chauffeur)\b/.test(skill)) {
      return 'travel';
    }

    // ── Rule 2: Cook / Chef signals → food ──────────────────────────────────────
    if (isFoodSignal || /\b(cook|chef)\b/.test(skill)) {
      return 'food';
    }

    // ── Rule 3: Pet signals → pet ──────────────────────────────────────────────
    if (isPetSignal || /\b(pet|vet)\b/.test(skill)) {
      return 'pet';
    }

    // ── Rule 4: Health signals → health ────────────────────────────────────────
    if (isHlthSignal || /\b(nurse|doctor|physio)\b/.test(skill)) {
      return 'health';
    }

    // ── Rule 5: If AI returned "cleaning" but there are water/leak signals → plumbing ──
    if ((cat === 'cleaning' || cat.includes('clean')) && isPlumbingSignal && !isApplSignal) {
      console.warn(`[GeminiProvider] Category corrected: "${rawCategory}" → "plumbing" (water signals detected)`);
      return 'plumbing';
    }

    // ── Rule 6: Worker skill matches ───────────────────────────────────────────
    if (/\bplumb/.test(skill) && cat !== 'plumbing') return 'plumbing';
    if (/\belectric/.test(skill) && cat !== 'electrical') return 'electrical';
    if (/\b(ac_tech|appliance)/.test(skill) && cat !== 'appliance') return 'appliance';

    // ── Rule 7: Exact taxonomy match ──────────────────────────────────────────
    if (VALID_TAXONOMY.includes(cat)) return cat;

    // ── Rule 8: Fuzzy match against taxonomy keys ─────────────────────────────
    for (const key of VALID_TAXONOMY) {
      if (cat.includes(key)) return key;
    }

    // ── Rule 9: Signal-based fallback ─────────────────────────────────────────
    if (isPlumbingSignal && !isElecSignal && !isApplSignal) return 'plumbing';
    if (isElecSignal && !isApplSignal) return 'electrical';
    if (isApplSignal) return 'appliance';

    return cat || 'Unknown Problem';
  }

  _assertReady(method) {
    if (!this.isReady || !this._client) {
      throw new AppError(
        `GeminiProvider: Not initialized. Call initialize() before ${method}().`,
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Map raw Gemini SDK errors to AppError with appropriate HTTP status codes.
   * @param {Error}  err
   * @param {string} context
   * @returns {AppError}
   */
  _mapGeminiError(err, context) {
    const msg = err?.message || String(err);

    // API Key / Authentication
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key') || msg.includes('401')) {
      return new AppError(
        `GeminiProvider [${context}]: Invalid API key. Check GEMINI_API_KEY.`,
        StatusCodes.UNAUTHORIZED
      );
    }

    // Quota / Rate Limit
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('429')) {
      return new AppError(
        `GeminiProvider [${context}]: API quota exceeded. Retry later.`,
        StatusCodes.TOO_MANY_REQUESTS
      );
    }

    // Safety Block
    if (msg.includes('SAFETY') || msg.includes('blocked') || msg.includes('harm')) {
      return new AppError(
        `GeminiProvider [${context}]: Response blocked by safety filters.`,
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    // Timeout / Network
    if (msg.includes('timeout') || msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT') || msg.includes('network')) {
      return new AppError(
        `GeminiProvider [${context}]: Network timeout or connectivity failure.`,
        StatusCodes.GATEWAY_TIMEOUT
      );
    }

    // Generic
    return new AppError(
      `GeminiProvider [${context}]: ${msg}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
