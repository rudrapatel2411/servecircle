/**
 * server/ai/providers/GroqProvider.js
 *
 * High-speed, high-accuracy AI Provider for ServeCircle using Groq Cloud.
 * Model: qwen/qwen3.8-27b (27B parameter multimodal vision + text model).
 *
 * Implements BaseAIProvider contract.
 */

import Groq from 'groq-sdk';
import { BaseAIProvider } from './BaseAIProvider.js';
import { AppError } from '../../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { recoverFromGroqJsonError } from './GroqErrorRecovery.js';

const PROVIDER_NAME = 'groq';
const PROVIDER_VERSION = '1.0.0';
const DEFAULT_MODEL = 'qwen/qwen3.8-27b';

export class GroqProvider extends BaseAIProvider {
  /**
   * @param {object} config - Provider config from server/config/providers.js
   */
  constructor(config = {}) {
    super(PROVIDER_NAME, PROVIDER_VERSION);
    this._client = null;
    this._textModel = config.textModel || DEFAULT_MODEL;
    this._visionModel = config.visionModel || DEFAULT_MODEL;
  }

  /**
   * Initialize Groq SDK and verify API key
   */
  async initialize() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new AppError('GROQ_API_KEY is not configured in .env', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    try {
      this._client = new Groq({ apiKey });
      this._markReady();
      console.log(`[GroqProvider] Initialized successfully with model: ${this._textModel}`);
    } catch (err) {
      this._markFailed(err);
      throw new AppError(`Failed to initialize GroqProvider: ${err.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Health probe for Groq API
   */
  async health() {
    if (!this._client) {
      return this._buildHealthResult(false, 0, 'Groq client not initialized');
    }

    const start = Date.now();
    try {
      await this._client.chat.completions.create({
        model: this._textModel,
        messages: [{ role: 'user', content: 'READY' }],
        max_tokens: 5,
      });
      const ms = Date.now() - start;
      this._markReady();
      return this._buildHealthResult(true, ms, 'Groq LPU Active');
    } catch (err) {
      const ms = Date.now() - start;
      this._markFailed(err);
      return this._buildHealthResult(false, ms, err.message);
    }
  }

  /**
   * Generate text / JSON completion
   */
  async generateText(prompt, options = {}) {
    if (!this.isReady) await this.initialize();

    const model = options.model || this._textModel;
    const messages = options.messages ? [...options.messages] : [];

    if (messages.length === 0) {
      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }
      messages.push({ role: 'user', content: prompt });
    }

    const requestPayload = {
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens || options.maxOutputTokens || 800,
    };
    if (options.reasoning_effort) {
      requestPayload.reasoning_effort = options.reasoning_effort;
    }

    if (options.jsonMode || options.response_format?.type === 'json_object') {
      requestPayload.response_format = { type: 'json_object' };
    }
    if (options.responseFormat) {
      requestPayload.response_format = options.responseFormat;
    }

    try {
      const completion = await this._client.chat.completions.create(
        requestPayload,
        options.timeoutMs ? { timeout: options.timeoutMs } : undefined
      );
      const text = completion.choices[0]?.message?.content || '';
      if (!text.trim()) {
        throw new AppError('Groq returned empty response', StatusCodes.INTERNAL_SERVER_ERROR);
      }
      return text;
    } catch (err) {
      return await recoverFromGroqJsonError(err, requestPayload,
        (payload) => this._client.chat.completions.create(payload, options.timeoutMs ? { timeout: options.timeoutMs } : undefined),
        'generateText'
      );
    }
  }

  /**
   * Analyze an image with optional text prompt
   */
  async analyzeImage(imageData, mimeType = 'image/jpeg', prompt = '', options = {}) {
    if (!this.isReady) await this.initialize();

    const model = options.model || this._visionModel;
    const imageUrl = imageData.startsWith('http')
      ? imageData
      : `data:${mimeType};base64,${imageData}`;

    const messages = [
      ...(options.system ? [{ role: 'system', content: options.system }] : []),
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt || 'Analyze this image and describe any home service or repair defects.' },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ];

    const requestPayload = {
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.max_tokens || 800,
    };

    if (options.jsonMode) {
      requestPayload.response_format = { type: 'json_object' };
    }

    try {
      const completion = await this._client.chat.completions.create(requestPayload);
      return completion.choices[0]?.message?.content || '';
    } catch (err) {
      return await recoverFromGroqJsonError(err, requestPayload,
        (payload) => this._client.chat.completions.create(payload, options.timeoutMs ? { timeout: options.timeoutMs } : undefined),
        'analyzeImage'
      );
    }
  }

  /**
   * Combined multimodal analysis (text + image)
   */
  async analyzeMultimodal(inputs = {}, options = {}) {
    if (!inputs.image) {
      return this.generateText(inputs.text || 'Hello', options);
    }
    return this.analyzeImage(inputs.image, inputs.mimeType || 'image/jpeg', inputs.text || '', options);
  }

  /**
   * Structured problem analysis from customer text
   */
  async analyzeCustomerProblem(text, options = {}) {
    const systemPrompt = `You are ServeCircle Problem Diagnostic AI.
Analyze the customer's home/vehicle/lifestyle service problem and respond with VALID JSON ONLY.
JSON Schema:
{
  "problemCategory": string,
  "detectedIssues": [string],
  "severity": "low" | "medium" | "high" | "critical",
  "recommendedService": string,
  "requiredSkills": [string],
  "estimatedUrgency": "immediate" | "same_day" | "scheduled",
  "safetyWarnings": [string],
  "confidence": number,
  "reasoning": string
}`;

    const raw = await this.generateText(text, {
      system: systemPrompt,
      jsonMode: true,
      ...options,
    });

    try {
      return JSON.parse(raw);
    } catch {
      return {
        problemCategory: 'general',
        detectedIssues: [text],
        severity: 'medium',
        recommendedService: 'General Inspection',
        requiredSkills: ['technician'],
        estimatedUrgency: 'scheduled',
        safetyWarnings: [],
        confidence: 0.85,
        reasoning: raw,
      };
    }
  }

  /**
   * Structured problem analysis from photo
   */
  async analyzeImageProblem(imageData, mimeType, options = {}) {
    const prompt = `Analyze this service problem image and respond with VALID JSON ONLY.
Schema:
{
  "problemCategory": string,
  "detectedIssues": [string],
  "severity": "low" | "medium" | "high" | "critical",
  "recommendedService": string,
  "requiredSkills": [string],
  "estimatedUrgency": "immediate" | "same_day" | "scheduled",
  "safetyWarnings": [string],
  "confidence": number,
  "reasoning": string
}`;

    const raw = await this.analyzeImage(imageData, mimeType, prompt, {
      jsonMode: true,
      ...options,
    });

    try {
      return JSON.parse(raw);
    } catch {
      return {
        problemCategory: 'general',
        detectedIssues: ['Visual defect detected'],
        severity: 'medium',
        recommendedService: 'Technician Inspection',
        requiredSkills: ['technician'],
        estimatedUrgency: 'scheduled',
        safetyWarnings: [],
        confidence: 0.85,
        reasoning: raw,
      };
    }
  }

  /**
   * Unified multimodal problem analysis (text + image + context)
   */
  async analyzeMultimodalProblem(inputs = {}, options = {}) {
    const systemPrompt = `You are ServeCircle Problem Diagnostic AI.
Analyze the customer's home/vehicle/lifestyle service problem and respond with VALID JSON ONLY.

TAXONOMY & SERVICES:
- plumbing: Leaking pipes, dripping taps, ceiling seepage, toilet, drain, water motor. (Service: "Plumbing", Skill: "Plumber")
- electrical: MCB tripping, short circuit, switchboard, wires, sparks, lights, fans. (Service: "Electrical Work", Skill: "Electrician")
- appliance: AC servicing/repair, cooling issue, fridge, washing machine, geyser. (Service: "AC & Appliance Repair", Skill: "AC Technician")
- cleaning: Deep home cleaning, bathroom cleaning, kitchen cleaning, sofa cleaning. (Service: "Home Deep Cleaning", Skill: "Cleaning Specialist")
- pest: Cockroach, termite, bed bugs, ants control. (Service: "Pest Control", Skill: "Pest Controller")
- carpentry: Furniture repair, door/window fitting, lock repair, hinges, woodwork. (Service: "Carpentry", Skill: "Carpenter")
- painting: Wall painting, whitewash, dampness, peeling paint. (Service: "Painting", Skill: "Painter")
- vehicle: Car repair, car mechanic, car wash, bike repair, tyre puncture. (Service: "Car Repair" or "Bike Repair", Skill: "Mechanic")
- travel: Outstation driver, city driver, airport cab, chauffeur. (Service: "Driver & Chauffeur Service", Skill: "Driver")
- food: Home cook, tiffin service, party catering, chef. (Service: "Home Cook & Catering", Skill: "Cook")
- pet: Pet grooming, vet visit at home, dog walking, boarding. (Service: "Pet Grooming & Care", Skill: "Pet Care Specialist")
- health: Doctor at home, physiotherapy, home nursing, elder care. (Service: "Doctor & Healthcare at Home", Skill: "Healthcare Professional")
- events: Birthday party, event planning, DJ & sound, photography. (Service: "Events & Celebrations", Skill: "Event Coordinator")

Respond ONLY with this JSON schema:
{
  "problemCategory": string,
  "problemType": string,
  "serviceCategory": string,
  "urgency": "low" | "medium" | "high" | "critical",
  "confidence": number,
  "reasoningEnglish": string,
  "reasoningLocalized": string,
  "possibleCauses": [string],
  "recommendedActions": [string],
  "requiredWorkerSkill": string,
  "estimatedDuration": string,
  "estimatedDifficulty": "low" | "medium" | "high",
  "requiredMaterials": [string],
  "needsImage": boolean,
  "needsMoreInformation": boolean,
  "followUpQuestions": [string],
  "safetyWarnings": [string]
}`;

    const promptText = `Customer Problem Description: "${inputs.text || 'Home service problem'}"
Location: "${inputs.location || 'Local'}"
Customer Language: "${inputs.customerLanguage || 'English/Hinglish'}"`;

    let raw = '';
    if (inputs.image) {
      raw = await this.analyzeImage(inputs.image, inputs.mimeType || 'image/jpeg', promptText, {
        system: systemPrompt,
        jsonMode: true,
        max_tokens: 800,
        ...options,
      });
    } else {
      raw = await this.generateText(promptText, {
        system: systemPrompt,
        jsonMode: true,
        max_tokens: 800,
        ...options,
      });
    }

    try {
      return JSON.parse(raw);
    } catch {
      return {
        problemCategory: 'general',
        problemType: inputs.text || 'Inspection Needed',
        serviceCategory: 'Home Repairs',
        urgency: 'medium',
        confidence: 0.9,
        reasoningEnglish: 'Service inspection recommended based on customer description.',
        reasoningLocalized: 'Aapki requirement ke hisaab se service inspection book kar sakte hain.',
        possibleCauses: ['General wear and tear'],
        recommendedActions: ['Book verified professional'],
        requiredWorkerSkill: 'Technician',
        estimatedDuration: '1-2 hours',
        estimatedDifficulty: 'medium',
        requiredMaterials: [],
        needsImage: false,
        needsMoreInformation: false,
        followUpQuestions: ['Aap kis time technician visit chahte hain?'],
        safetyWarnings: [],
      };
    }
  }

  /**
   * Customer chat: preserve conversational context, clarify ambiguity, and only
   * return a catalog service when the user actually wants help with that task.
   */
  async chatWithCustomer({ text = '', image = null, conversation = [], customerContext = {}, services = [] }) {
    if (!this.isReady) await this.initialize();

    let catalogServices = Array.isArray(services) && services.length > 0 ? services : [];
    if (catalogServices.length === 0 && text) {
      try {
        const { getRelevantServices } = await import('../services/ragService.js');
        catalogServices = await getRelevantServices(text, 8, 0.45);
      } catch {}
    }
    const descriptionLimit = image ? 45 : 90;
    const activeCatalogPrompt = catalogServices.map((service) => {
      const description = String(service.description || '').replace(/\s+/g, ' ').trim().slice(0, descriptionLimit);
      return `${service.serviceId}|${service.name}|${service.category}|${service.basePrice}${description ? `|${description}` : ''}`;
    }).join('\n');

    // Keep enough recent context to understand follow-ups while reserving a
    // predictable token budget for the complete platform catalog.
    const recentConversation = [];
    let historyCharsRemaining = image ? 1200 : 2600;
    for (const msg of (Array.isArray(conversation) ? conversation.slice(-10) : []).reverse()) {
      if (!['user', 'assistant'].includes(msg?.role) || typeof msg.content !== 'string') continue;
      const maxMessageChars = msg.role === 'user' ? 600 : 450;
      const content = msg.content.trim().slice(-Math.min(maxMessageChars, historyCharsRemaining));
      if (!content) continue;
      recentConversation.push({ role: msg.role, content });
      historyCharsRemaining -= content.length;
      if (historyCharsRemaining <= 0) break;
    }
    recentConversation.reverse();

    const systemPrompt = `You are ServeCircle AI, a helpful multilingual customer assistant for home and lifestyle services in India.

Understand English, Hindi in Devanagari, Roman Hindi/Hinglish, mixed Hindi-English spelling, and Gujarati. Accept informal spelling variants such as "muje/mujhe", "chiye/chahiye", and "karvana/karwana" without asking the customer to rephrase. Reply naturally in the language and script the customer used. Examples: "muje society ke liye guard chiye" means they want a society security guard; "geyser garam pani nahi de raha" means geyser repair; "ghar shifting karvana hai" means moving service; "mare dadi mate dava mangavvi chhe" means the customer needs medicine for their grandmother. Use the whole sentence and conversation, not isolated words. Keep replies brief and specific. If the customer writes in Hindi/Hinglish, reply in Hindi/Hinglish rather than English.

DECISION POLICY (follow in order):
1. First understand the latest customer message in context. Separate a real request for help/booking from a greeting, general question, incidental mention, negation, or hypothetical. A single service-related word is not enough to infer a request. Examples: "my friend is a plumber", "I don't need cleaning", and "what services do you offer?" are not service booking requests.
2. For greetings, thanks, capability questions, and general conversation, answer the actual message warmly; do not repeat a fixed welcome or list services every turn. Do not recommend a service.
3. If the customer describes a task or asks to book, match the meaning of the whole request to the active catalog descriptions and tags, even when their words differ from the service name. Choose the single best service that can actually cover the task. An exact wording match is not required. If a close service covers most of the request, recommend it and clearly explain what it does and does not cover. Ask one short question only when the meaning itself is unclear.
4. If the latest message is an answer to your previous clarification or a follow-up about the same task, use the history and continue naturally. Keep the same service only when that context clearly resolves the current message. A correction or new task in the latest message takes precedence over older context. Your earlier replies can be wrong: verify them against the active catalog below. If an earlier reply claimed a listed category or service was unavailable, correct it when the catalog shows otherwise.
5. The catalog below contains services currently marked active in the platform. Use only an entry in this list and copy its exact serviceId, name, category, and price. If the requested service is not offered and no listed service can reasonably cover the task, set intent to UNAVAILABLE, leave serviceId/serviceName/category empty, and politely say that this service is not currently offered. Do not refuse just because the customer's wording differs from the catalog. If the catalog is empty or marked unavailable, say you cannot confirm the service right now. The catalog does not confirm a worker's live slot: never claim a worker is ready or a time slot is available unless that was separately checked.
6. Never infer urgency from words like "urgent" alone if no task is described. Do not provide unsafe repair instructions; for immediate danger, advise contacting local emergency services.

Return one JSON object. intent must be SERVICE_REQUEST for a clear task, FOLLOW_UP for a related answer/question, GENERAL for ordinary conversation, CLARIFY only when the task meaning is ambiguous, or UNAVAILABLE when no active service can cover a clear request. showServiceRecommendation is true only for SERVICE_REQUEST or relevant FOLLOW_UP with a serviceId from the active catalog. For GENERAL, CLARIFY, and UNAVAILABLE, set it false and leave serviceId/serviceName/category empty. Ask at most one clarification in reply; keep followUpQuestions empty unless genuinely useful.

CURRENT ACTIVE SERVECIRCLE CATALOG (canonical platform services, respecting admin status):
${activeCatalogPrompt || 'No active catalog entries could be confirmed.'}

JSON fields: intent, reply, showServiceRecommendation, serviceId, serviceName, category, problemType, urgency, requiredWorkerSkill, estimatedPrice, safetyPrecautions, followUpQuestions.
Note: Always keep 'serviceName', 'category', and 'followUpQuestions' strictly relevant to the active conversation topic.`;

    // Build chat history
    const messages = [{ role: 'system', content: systemPrompt }];

    messages.push(...recentConversation);

    if (image?.base64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: text || 'Please inspect this photo of the issue at my place and help me.' },
          {
            type: 'image_url',
            image_url: {
              url: image.base64.startsWith('http')
                ? image.base64
                : `data:${image.mimeType || 'image/jpeg'};base64,${image.base64}`,
            },
          },
        ],
      });
    } else {
      messages.push({ role: 'user', content: text });
    }

    const raw = await this.generateText(text, {
      model: image ? this._visionModel : this._textModel,
      messages,
      response_format: { type: 'json_object' },
      reasoning_effort: 'none',
      max_tokens: 600,
      temperature: 0.2,
      timeoutMs: 15000,
    });

    try {
      const cleaned = String(raw || '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      return {
        intent: parsed.intent || 'GENERAL',
        reply: parsed.reply || '',
        showServiceRecommendation: Boolean(parsed.showServiceRecommendation),
        serviceId: parsed.serviceId || '',
        serviceName: parsed.serviceName || '',
        category: parsed.category || '',
        problemType: parsed.problemType || '',
        urgency: parsed.urgency || 'Standard',
        requiredWorkerSkill: parsed.requiredWorkerSkill || 'Technician',
        estimatedPrice: typeof parsed.estimatedPrice === 'number' ? parsed.estimatedPrice : (Number(parsed.estimatedPrice) || 0),
        safetyPrecautions: Array.isArray(parsed.safetyPrecautions) ? parsed.safetyPrecautions : [],
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
      };
    } catch (e) {
      console.warn('[GroqProvider] Customer chat returned invalid JSON; using a neutral retry reply:', e.message);
      return {
        intent: 'CLARIFY',
        reply: 'Sorry, main aapki baat is baar sahi se process nahi kar paya. Aap apni zaroorat thodi aur detail mein bata sakte hain?',
        showServiceRecommendation: false,
        serviceName: '',
        serviceId: '',
        category: '',
        problemType: '',
        urgency: 'Scheduled',
        requiredWorkerSkill: 'Technician',
        estimatedPrice: 0,
        safetyPrecautions: [],
        followUpQuestions: [],
      };
    }
  }

  /**
   * Token count estimate
   */
  async countTokens(prompt) {
    return Math.ceil(String(prompt || '').length / 4);
  }
}

