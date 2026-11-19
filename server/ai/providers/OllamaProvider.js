// server/ai/providers/OllamaProvider.js
import { BaseAIProvider } from './BaseAIProvider.js';
import { getRelevantServices, formatServicesForPrompt } from '../services/ragService.js';

export class OllamaProvider extends BaseAIProvider {
  constructor() {
    super('ollama', '1.0.0');
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.visionModel = process.env.OLLAMA_VISION_MODEL || 'qwen3-vl:2b';
    this.embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
    this.isReady = false;
  }

  async initialize() {
    try {
      const health = await this.health();
      this.isReady = health.ready;
      if (this.isReady) {
        console.log(`[OllamaProvider] Initialized successfully at ${this.baseUrl} with model "${this.visionModel}"`);
      } else {
        console.warn(`[OllamaProvider] Server reachable at ${this.baseUrl}, but models are still loading.`);
      }
    } catch (err) {
      console.warn(`[OllamaProvider] Initialization warning: ${err.message}. Will retry dynamically.`);
      this.isReady = false;
    }
  }

  async health() {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const responseTimeMs = Date.now() - startTime;
      if (!res.ok) {
        return {
          loaded: true,
          ready: false,
          provider: 'ollama',
          version: this.version,
          lastCheck: new Date().toISOString(),
          responseTimeMs,
          error: `HTTP ${res.status}`,
        };
      }

      const data = await res.json();
      const models = Array.isArray(data.models) ? data.models.map((m) => m.name) : [];
      const hasVisionModel = models.some((m) => m.includes(this.visionModel.split(':')[0]));

      return {
        loaded: true,
        ready: true,
        provider: 'ollama',
        version: this.version,
        lastCheck: new Date().toISOString(),
        responseTimeMs,
        models,
        hasVisionModel,
      };
    } catch (err) {
      return {
        loaded: true,
        ready: false,
        provider: 'ollama',
        version: this.version,
        lastCheck: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        error: err.message,
      };
    }
  }

  /**
   * Plain text generation with Ollama
   */
  async generateText(prompt, options = {}) {
    const model = options.model || this.visionModel;
    const temperature = options.temperature !== undefined ? options.temperature : 0.7;

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: {
          temperature,
          num_ctx: options.num_ctx || 2048,
          num_predict: options.num_predict || 350,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama generateText failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.message?.content || data.response || '';
  }

  /**
   * Analyze an image with local Vision model (qwen3-vl:2b)
   */
  async analyzeImage(imageData, mimeType, prompt = '', options = {}) {
    const model = options.model || this.visionModel;
    let base64Image = imageData;
    if (Buffer.isBuffer(imageData)) {
      base64Image = imageData.toString('base64');
    } else if (typeof imageData === 'string' && imageData.includes('base64,')) {
      base64Image = imageData.split('base64,')[1];
    }

    const userPrompt = prompt || 'Analyze this image. Identify what appliance, fixture, or problem is shown. List 3-5 keywords.';

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: userPrompt,
            images: [base64Image],
          },
        ],
        stream: false,
        options: {
          temperature: 0.2,
          num_ctx: 2048,
          num_predict: 120,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama analyzeImage failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.message?.content || '';
  }

  /**
   * Primary Chatbot interface called by customerAi.js controller
   */
  async chatWithCustomer({ text = '', image = null, conversation = [], customerContext = {}, services = [] }) {
    let visualAnalysisText = '';
    let imageKeywords = [];

    // 1. Vision keyword extraction if image attached
    if (image && (image.base64 || typeof image === 'string')) {
      const rawImage = image.base64 || image;
      const cleanBase64 = String(rawImage).replace(/^data:image\/[a-z]+;base64,/, '');

      try {
        const visionPrompt = 'Look closely at this image. Identify what is broken, leaking, damaged, or shown. Output keywords separated by commas.';
        visualAnalysisText = await this.analyzeImage(cleanBase64, image.mimeType || 'image/jpeg', visionPrompt);
        if (visualAnalysisText) {
          imageKeywords = visualAnalysisText
            .replace(/[^\w\s,]/g, ' ')
            .split(/,|\n/)
            .map((k) => k.trim())
            .filter((k) => k.length > 2 && k.length < 35);
        }
      } catch (visErr) {
        console.warn('[OllamaProvider] Image vision extraction warning:', visErr.message);
      }
    }

    const cleanQuery = String(text || '').trim().toLowerCase();
    const hasServiceIntent = Boolean(image) || /\b(repair|fix|leak|cooling|clean|safai|service|plumber|electrician|ac|pipe|tap|motor|switch|fan|lock|door|sofa|pest|shifting|painter|cook|driver|mechanic|puncture|filter|water|bijli|geyser|fridge)\b/i.test(cleanQuery);

    // 2. Hybrid RAG Query against 110 PostgreSQL Services
    const queryForRag = [text, ...imageKeywords].filter(Boolean).join(' ');
    const matchedServices = hasServiceIntent ? await getRelevantServices(queryForRag, 5, 0.48) : [];
    const topService = matchedServices.length > 0 ? matchedServices[0] : null;

    // Detect if this is an authentic platform home repair/cleaning service inquiry
    const isServiceQuery = Boolean(hasServiceIntent && topService && topService.score >= 0.50);

    // 3. Construct Smart System Prompt
    const catalogPrompt = formatServicesForPrompt(matchedServices);

    const systemPrompt = `You are "CircleBot", the intelligent AI assistant for ServeCircle (India's premier verified home services platform).

### OPERATIONAL GUIDELINES:
1. **Home Repairs / Appliance / Cleaning Issues:**
   - If the user asks for help with home repairs, plumbing, electrical, cleaning, pest control, AC, appliance fix, or uploaded an image:
   - Identify the issue with empathy.
   - Recommend the matched platform service from the catalog below.
   - Mention the exact transparent price (e.g. ₹${topService?.basePrice || 249}) and duration (~${topService?.estimatedDuration || 60} mins).
   - Reassure that verified, KYC-checked professionals will handle it with a 30-day warranty.
   - Set "intent": "SERVICE_REQUEST", "showServiceRecommendation": true, "serviceId": "${topService?.serviceId || ''}", "serviceName": "${topService?.name || ''}", "category": "${topService?.category || ''}", "estimatedPrice": ${topService?.basePrice || 0}.

2. **General Knowledge / Coding / DIY / Non-Service Inquiries:**
   - If the user asks a general question, casual greeting, DIY tip, programming query, math question, or anything unrelated to hiring a home service:
   - Answer accurately, helpfully, and intelligently using your general knowledge.
   - Do NOT force service bookings when the user just wants a general answer or tip.
   - Set "intent": "GENERAL", "showServiceRecommendation": false, "serviceId": "", "serviceName": "", "category": "", "estimatedPrice": 0.

3. **Language:**
   - Match the user's natural language and script (Hinglish, Hindi in Devanagari, or English).
   - Warm, respectful, natural tone.

### RELEVANT PLATFORM SERVICES (RETRIEVED VIA VECTOR RAG):
${catalogPrompt}

You MUST return your answer as a valid JSON object matching this schema:
{
  "intent": "SERVICE_REQUEST" | "GENERAL" | "CLARIFY",
  "reply": "Your complete helpful conversational reply here",
  "showServiceRecommendation": boolean,
  "serviceId": "exact-service-id-or-empty",
  "serviceName": "Exact Service Name or empty",
  "category": "Category Name or empty",
  "problemType": "e.g. AC Cooling / General Query",
  "urgency": "Standard" | "Emergency" | "Scheduled",
  "requiredWorkerSkill": "e.g. AC Mechanic / Technician",
  "estimatedPrice": number,
  "safetyPrecautions": ["Turn off main switch", "Do not touch exposed wires"],
  "followUpQuestions": ["Would you like to schedule an expert visit today?"]
}`;

    // 4. Build chat messages
    const messages = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(conversation) && conversation.length > 0) {
      for (const m of conversation.slice(-6)) {
        if (m.role === 'user' || m.role === 'assistant') {
          messages.push({
            role: m.role,
            content: m.content || m.text || '',
          });
        }
      }
    }

    const latestUserMsg = {
      role: 'user',
      content: text || 'Please check this problem and advise what to do.',
    };

    if (image && (image.base64 || typeof image === 'string')) {
      const cleanBase64 = String(image.base64 || image).replace(/^data:image\/[a-z]+;base64,/, '');
      latestUserMsg.images = [cleanBase64];
    }
    messages.push(latestUserMsg);

    // 5. Call Ollama /api/chat
    let rawOutput = '';
    try {
      const chatController = new AbortController();
      const chatTimeout = setTimeout(() => chatController.abort(), 35000);

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: chatController.signal,
        body: JSON.stringify({
          model: this.visionModel,
          messages,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.4,
            num_ctx: 2048,
            num_predict: 350,
          },
        }),
      });
      clearTimeout(chatTimeout);

      if (res.ok) {
        const data = await res.json();
        rawOutput = data.message?.content || '';
      }
    } catch (chatErr) {
      console.warn('[OllamaProvider] Local chat call failed:', chatErr.message);
    }

    // 6. Parse JSON or provide smart fallback
    try {
      const jsonStart = rawOutput.indexOf('{');
      const jsonEnd = rawOutput.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(rawOutput.substring(jsonStart, jsonEnd + 1));
        return {
          intent: parsed.intent || (isServiceQuery ? 'SERVICE_REQUEST' : 'GENERAL'),
          reply: parsed.reply || rawOutput,
          showServiceRecommendation: parsed.showServiceRecommendation !== undefined
            ? Boolean(parsed.showServiceRecommendation)
            : Boolean(isServiceQuery),
          serviceId: parsed.serviceId || (isServiceQuery ? topService?.serviceId : ''),
          serviceName: parsed.serviceName || (isServiceQuery ? topService?.name : ''),
          category: parsed.category || (isServiceQuery ? topService?.category : ''),
          problemType: parsed.problemType || (topService?.name || 'General Query'),
          urgency: parsed.urgency || 'Standard',
          requiredWorkerSkill: parsed.requiredWorkerSkill || 'Technician',
          estimatedPrice: Number(parsed.estimatedPrice) || (isServiceQuery ? topService?.basePrice : 0),
          safetyPrecautions: Array.isArray(parsed.safetyPrecautions) ? parsed.safetyPrecautions : [],
          followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
          recommendations: matchedServices,
        };
      }
    } catch {}

    // Fallback if model returned plain text or was warming up
    if (rawOutput && rawOutput.trim()) {
      return {
        intent: isServiceQuery ? 'SERVICE_REQUEST' : 'GENERAL',
        reply: rawOutput.trim(),
        showServiceRecommendation: Boolean(isServiceQuery),
        serviceId: isServiceQuery ? topService?.serviceId : '',
        serviceName: isServiceQuery ? topService?.name : '',
        category: isServiceQuery ? topService?.category : '',
        problemType: isServiceQuery ? topService?.name : 'General Query',
        urgency: 'Standard',
        requiredWorkerSkill: 'Technician',
        estimatedPrice: isServiceQuery ? topService?.basePrice : 0,
        safetyPrecautions: [],
        followUpQuestions: [],
        recommendations: matchedServices,
      };
    }

    // If local Ollama did not respond, throw error so AIProviderManager can trigger Groq failover
    throw new Error('Local Ollama returned empty output or was unreachable.');
  }

  async countTokens(prompt) {
    return Math.ceil(String(prompt || '').length / 4);
  }

  async analyzeCustomerProblem(text, options = {}) {
    return this.chatWithCustomer({ text }, options);
  }

  async analyzeImageProblem(imageData, mimeType, options = {}) {
    return this.chatWithCustomer({ image: { base64: imageData, mimeType } }, options);
  }
}

export default OllamaProvider;
