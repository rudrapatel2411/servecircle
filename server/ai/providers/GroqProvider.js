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

    if (options.jsonMode || options.response_format?.type === 'json_object') {
      requestPayload.response_format = { type: 'json_object' };
    }

    try {
      const completion = await this._client.chat.completions.create(requestPayload);
      const text = completion.choices[0]?.message?.content || '';
      if (!text.trim()) {
        throw new AppError('Groq returned empty response', StatusCodes.INTERNAL_SERVER_ERROR);
      }
      return text;
    } catch (err) {
      console.error('[GroqProvider] generateText error:', err.message);

      // Robust recovery if Groq's json_object validator rejects natural conversational text:
      const errMsg = String(err?.message || '');
      if (err?.error?.code === 'json_validate_failed' || errMsg.includes('json_validate_failed')) {
        let failedGen = err?.error?.failed_generation;
        if (!failedGen) {
          const match = errMsg.match(/"failed_generation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          if (match) {
            try {
              failedGen = JSON.parse(`"${match[1]}"`);
            } catch {
              failedGen = match[1];
            }
          }
        }

        if (failedGen && typeof failedGen === 'string' && failedGen.trim()) {
          console.log('[GroqProvider] Successfully recovered message from failed_generation');
          const jsonMatch = failedGen.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              JSON.parse(jsonMatch[0]);
              return jsonMatch[0];
            } catch {}
          }
          return JSON.stringify({
            intent: 'GENERAL_CONVERSATION',
            reply: failedGen.trim(),
            showServiceRecommendation: false,
            serviceName: '',
            category: '',
            problemType: '',
            urgency: 'Scheduled',
            requiredWorkerSkill: 'Technician',
            estimatedPrice: 350,
            safetyPrecautions: [],
            followUpQuestions: ['Party & Event Decoration', 'Home Catering & Chef', 'Home Deep Cleaning'],
          });
        }

        // Retry without response_format json_object enforcement
        try {
          console.log('[GroqProvider] Retrying completion without strict json_object enforcement...');
          delete requestPayload.response_format;
          const retryCompletion = await this._client.chat.completions.create(requestPayload);
          const rawText = retryCompletion.choices[0]?.message?.content || '';
          if (rawText.trim()) {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                JSON.parse(jsonMatch[0]);
                return jsonMatch[0];
              } catch {}
            }
            return JSON.stringify({
              intent: 'GENERAL_CONVERSATION',
              reply: rawText.trim(),
              showServiceRecommendation: false,
              serviceName: '',
              category: '',
              problemType: '',
              urgency: 'Scheduled',
              requiredWorkerSkill: 'Technician',
              estimatedPrice: 350,
              safetyPrecautions: [],
              followUpQuestions: ['How else can I assist you?', 'Browse popular services'],
            });
          }
        } catch (retryErr) {
          console.error('[GroqProvider] Retry also failed:', retryErr.message);
        }
      }

      throw new AppError(`AI Generation Error: ${err.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
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
      console.error('[GroqProvider] analyzeImage error:', err.message);

      const errMsg = String(err?.message || '');
      if (err?.error?.code === 'json_validate_failed' || errMsg.includes('json_validate_failed')) {
        let failedGen = err?.error?.failed_generation;
        if (!failedGen) {
          const match = errMsg.match(/"failed_generation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
          if (match) {
            try {
              failedGen = JSON.parse(`"${match[1]}"`);
            } catch {
              failedGen = match[1];
            }
          }
        }

        if (failedGen && typeof failedGen === 'string' && failedGen.trim()) {
          console.log('[GroqProvider] analyzeImage recovered from failed_generation');
          const jsonMatch = failedGen.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              JSON.parse(jsonMatch[0]);
              return jsonMatch[0];
            } catch {}
          }
          return JSON.stringify({
            problemCategory: 'Home Repairs',
            detectedIssues: [failedGen.trim()],
            severity: 'medium',
            recommendedService: 'Technician Inspection',
            requiredSkills: ['technician'],
            estimatedUrgency: 'same_day',
            safetyWarnings: [],
            confidence: 0.9,
            reasoning: failedGen.trim(),
          });
        }

        // Retry without response_format
        try {
          delete requestPayload.response_format;
          const retryCompletion = await this._client.chat.completions.create(requestPayload);
          const rawText = retryCompletion.choices[0]?.message?.content || '';
          if (rawText.trim()) {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) return jsonMatch[0];
            return JSON.stringify({
              problemCategory: 'Home Repairs',
              detectedIssues: [rawText.trim()],
              severity: 'medium',
              recommendedService: 'Technician Inspection',
              requiredSkills: ['technician'],
              estimatedUrgency: 'same_day',
              safetyWarnings: [],
              confidence: 0.9,
              reasoning: rawText.trim(),
            });
          }
        } catch (retryErr) {
          console.error('[GroqProvider] analyzeImage retry failed:', retryErr.message);
        }
      }

      throw new AppError(`AI Vision Error: ${err.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
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
   * Master Customer Chat Engine — Handles Chit-Chat, Follow-ups, and Direct Problem Diagnosis
   */
  async chatWithCustomer({ text = '', image = null, conversation = [], customerContext = {} }) {
    if (!this.isReady) await this.initialize();

    const systemPrompt = `You are ServeCircle AI — the intelligent customer assistant for the ServeCircle home and lifestyle services platform in India.

CRITICAL INSTRUCTION: You MUST ALWAYS reply with a valid JSON object matching the schema below. NEVER output plain text outside the JSON object.

YOUR CAPABILITIES & RULES:
1. Fluently understand English, Hindi, Hinglish (mixed Hindi-English), and Gujarati. Always reply in the SAME language and tone the customer used.
2. If customer is doing CHIT-CHAT, GREETING, or sharing personal news (e.g., "hi", "hello", "kaise ho", "kya kar sakte ho", "shukriya", "bhai help chahiye", "tomorrow is my birthday", "today is my birthday", "party hai"):
   - Be warm, helpful, congratulatory, and natural.
   - If they mention a birthday or celebration, warmly congratulate them ("Happy Birthday in advance! 🎉") and ask if they need help with Party & Event Decoration, Home Catering, DJ/Sound, or Pre-party Deep Cleaning!
   - Set "intent": "GENERAL_CONVERSATION".
   - Set "showServiceRecommendation": false (unless they explicitly ask to book a decorator/chef).
   - Set "followUpQuestions": ["Party & Event Decoration", "Home Cook & Catering", "Home Deep Cleaning"].
3. If customer describes ANY problem, task, repair need, or sends a photo:
   - Identify the exact root cause and select the BEST matching service from ServeCircle's catalog.
   - Set "intent": "SERVICE_PROBLEM".
   - Set "showServiceRecommendation": true.
   - Fill in the exact serviceName, category, estimatedPrice, requiredWorkerSkill, and safety precautions.
4. If customer asks a follow-up ("kab aaoge", "kitna kharcha hoga", "theek hai book karo"):
   - Answer their specific question based on the conversation history.
   - If related to a service, keep "showServiceRecommendation": true so they can easily book.

CATALOG OF AVAILABLE SERVICES IN SERVECIRCLE:
- "Events & Celebrations": Birthday party decor, sound & DJ, event organizer, photography. (Category: "Events & Celebrations", Skill: "Event Coordinator", Base Price: 2500)
- "Home Cook & Catering": Daily home chef, party food catering, celebration feast. (Category: "Food & Kitchen", Skill: "Cook", Base Price: 500)
- "Home Deep Cleaning": Full house deep cleaning, pre-party/post-party cleaning. (Category: "Cleaning & Hygiene", Skill: "Cleaning Specialist", Base Price: 1200)
- "Plumbing": Tap leakage, pipe bursts, drainage clog, washbasin, toilet leak, water tank, geyser fitting. (Category: "Home Repairs", Skill: "Plumber", Base Price: 350)
- "Electrical Work": Short circuit, fuse, MCB, switchboard, ceiling fan, wiring, lights, power failure. (Category: "Home Repairs", Skill: "Electrician", Base Price: 300)
- "AC & Appliance Repair": AC not cooling, AC water leakage, fridge, washing machine, microwave, cooler. (Category: "Home Repairs", Skill: "AC Technician", Base Price: 500)
- "Carpentry": Door/window lock repair, drawer alignment, hinge fix, furniture assembly, wooden work. (Category: "Home Repairs", Skill: "Carpenter", Base Price: 400)
- "Painting": Wall paint, dampness waterproofing, primer, touch-ups. (Category: "Home Repairs", Skill: "Painter", Base Price: 600)
- "Pest Control": Cockroach, termite, bed bugs, mosquitoes treatment. (Category: "Cleaning & Hygiene", Skill: "Pest Controller", Base Price: 900)
- "Car Repair": Engine check, brake issues, suspension, mechanic. (Category: "Vehicle Services", Skill: "Car Mechanic", Base Price: 800)
- "Bike Repair": Two-wheeler servicing, chain, brakes, puncture, engine. (Category: "Vehicle Services", Skill: "Bike Mechanic", Base Price: 400)
- "Driver & Chauffeur Service": Outstation driver, city driver, airport commute, party driver. (Category: "Travel & Commute", Skill: "Driver", Base Price: 600)
- "Pet Grooming & Care": Dog/cat bath, grooming, vet visit at home. (Category: "Pet Services", Skill: "Pet Care Specialist", Base Price: 450)
- "Doctor & Healthcare at Home": Doctor visit, physiotherapy, home nursing. (Category: "Health & Wellness", Skill: "Healthcare Professional", Base Price: 700)

OUTPUT FORMAT: Return ONLY the JSON object.
{
  "intent": "SERVICE_PROBLEM" or "GENERAL_CONVERSATION",
  "reply": "Warm message in customer's language",
  "showServiceRecommendation": false,
  "serviceName": "",
  "category": "",
  "problemType": "",
  "urgency": "Scheduled",
  "requiredWorkerSkill": "Technician",
  "estimatedPrice": 350,
  "safetyPrecautions": [],
  "followUpQuestions": ["Option 1", "Option 2"]
}`;

    // Build chat history
    const messages = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(conversation) && conversation.length > 0) {
      for (const msg of conversation.slice(-6)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
          });
        }
      }
    }

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
      jsonMode: true,
      max_tokens: 800,
      temperature: 0.3,
    });

    try {
      return JSON.parse(raw);
    } catch (e) {
      return {
        intent: 'GENERAL_CONVERSATION',
        reply: raw || 'Namaste! Main ServeCircle AI hoon. Main aapki kya madad kar sakta hoon?',
        showServiceRecommendation: false,
        serviceName: '',
        category: '',
        problemType: '',
        urgency: 'Scheduled',
        requiredWorkerSkill: 'Technician',
        estimatedPrice: 350,
        safetyPrecautions: [],
        followUpQuestions: ['Plumbing', 'Electrical Work', 'Cleaning & Hygiene'],
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

