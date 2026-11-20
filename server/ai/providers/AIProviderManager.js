/**
 * server/ai/providers/AIProviderManager.js — Phase 4 Batch 1 & 4B
 *
 * THE ONLY ENTRY POINT for all AI operations in the platform.
 *
 * Architecture:
 *   InferenceService / any caller
 *       ↓
 *   AIProviderManager   (this file)
 *       ↓
 *   ProviderRegistry
 *       ↓
 *   GeminiProvider (or future: OpenAIProvider / ClaudeProvider / OllamaProvider)
 *       ↓
 *   Real AI API
 *
 * Enterprise Features (Phase 4B):
 *   - SmartCache wrapper with SHA-256 composite hashing
 *   - RetryEngine integration with exponential backoff
 */

import { ProviderRegistry } from './ProviderRegistry.js';
import { ProviderHealth }   from './ProviderHealth.js';
import { SmartCache }       from '../smartCache.js';
import { RetryEngine }      from '../retryEngine.js';
import { AppError }         from '../../middleware/errorHandler.js';
import { StatusCodes }      from 'http-status-codes';

// ─── Logging Constants ────────────────────────────────────────────────────────
export const AI_MANAGER_EVENTS = Object.freeze({
  AI_PROVIDER_INITIALIZED: 'AI_PROVIDER_INITIALIZED',
  AI_REQUEST:              'AI_REQUEST',
  AI_RESPONSE:             'AI_RESPONSE',
  AI_PROVIDER_FAILED:      'AI_PROVIDER_FAILED',
});

// ─── Singleton Manager ────────────────────────────────────────────────────────

class AIProviderManagerClass {
  constructor() {
    this._provider             = null;
    this._providerName         = null;
    this._fallbackProvider     = null;
    this._fallbackProviderName = null;
    this._health               = new ProviderHealth();
    this._initialized          = false;
    this._initPromise          = null;   // Guard against concurrent initialize() calls
  }

  // ─── initialize ─────────────────────────────────────────────────────────────

  /**
   * Initialize the AI provider layer.
   * Reads AI_PROVIDER from environment (default: 'ollama').
   * Idempotent — safe to call multiple times.
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      const providerName = ProviderRegistry.getDefaultProviderName();
      this._log(AI_MANAGER_EVENTS.AI_REQUEST, `Initializing primary provider: ${providerName}`);

      try {
        const provider = ProviderRegistry.create(providerName);
        await provider.initialize();

        this._provider     = provider;
        this._providerName = providerName;
        this._initialized  = true;

        // Run first health check and store result
        const healthResult = await this._provider.health();
        this._health.update(healthResult);

        this._log(
          AI_MANAGER_EVENTS.AI_PROVIDER_INITIALIZED,
          `[AIProviderManager] Primary "${providerName}" initialized — ready: ${healthResult.ready}`
        );

        // Arm secondary hot-standby fallback provider for enterprise 100% uptime
        const fallbackTarget = providerName === 'ollama' ? 'groq' : 'ollama';
        if (fallbackTarget === 'groq' && process.env.GROQ_API_KEY) {
          try {
            const fallback = ProviderRegistry.create('groq');
            await fallback.initialize();
            this._fallbackProvider = fallback;
            this._fallbackProviderName = 'groq';
            this._log(
              AI_MANAGER_EVENTS.AI_PROVIDER_INITIALIZED,
              `[AIProviderManager] Enterprise Hot-Standby fallback "groq" armed & verified`
            );
          } catch (fbErr) {
            console.warn('[AIProviderManager] Groq fallback standby warning:', fbErr.message);
          }
        } else if (fallbackTarget === 'ollama') {
          try {
            const fallback = ProviderRegistry.create('ollama');
            await fallback.initialize();
            this._fallbackProvider = fallback;
            this._fallbackProviderName = 'ollama';
            this._log(
              AI_MANAGER_EVENTS.AI_PROVIDER_INITIALIZED,
              `[AIProviderManager] Enterprise Hot-Standby fallback "ollama" armed & verified`
            );
          } catch (fbErr) {
            console.warn('[AIProviderManager] Ollama fallback standby warning:', fbErr.message);
          }
        }
      } catch (err) {
        this._health.reset();
        this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `Initialization failed: ${err.message}`);
        this._initPromise = null; // Allow retry
        throw err instanceof AppError ? err : new AppError(
          `AIProviderManager: Failed to initialize provider "${providerName}". ${err.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    })();

    return this._initPromise;
  }

  // ─── getProvider ────────────────────────────────────────────────────────────

  /**
   * Return the active provider instance.
   * @returns {BaseAIProvider}
   * @throws {AppError} if not initialized
   */
  getProvider() {
    this._assertInitialized('getProvider');
    return this._provider;
  }

  // ─── switchProvider ─────────────────────────────────────────────────────────

  /**
   * Hot-switch to a different provider without restarting.
   * The existing provider is discarded and the new one is initialized.
   *
   * @param {string} providerName  - Registered provider name
   * @returns {Promise<void>}
   */
  async switchProvider(providerName) {
    this._log(AI_MANAGER_EVENTS.AI_REQUEST, `Switching provider to: ${providerName}`);

    try {
      const newProvider = ProviderRegistry.create(providerName);
      await newProvider.initialize();

      this._provider     = newProvider;
      this._providerName = providerName;
      this._initialized  = true;
      this._initPromise  = Promise.resolve();

      const healthResult = await this._provider.health();
      this._health.update(healthResult);

      this._log(
        AI_MANAGER_EVENTS.AI_PROVIDER_INITIALIZED,
        `Switched to provider "${providerName}" — ready: ${healthResult.ready}`
      );
    } catch (err) {
      this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `Switch failed: ${err.message}`);
      throw err instanceof AppError ? err : new AppError(
        `AIProviderManager: Failed to switch to provider "${providerName}". ${err.message}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ─── health ─────────────────────────────────────────────────────────────────

  /**
   * Run a live health check on the active provider and update the health store.
   * @returns {Promise<object>}  ProviderHealthResult
   */
  async health() {
    if (!this._initialized || !this._provider) {
      return this._health.get(); // Returns UNINITIALIZED state
    }

    try {
      const result = await this._provider.health();
      this._health.update(result);
      return result;
    } catch (err) {
      const failResult = ProviderHealth.build(
        this._providerName || 'unknown',
        this._provider?.version || '0.0.0',
        false,
        0,
        err.message
      );
      this._health.update(failResult);
      return failResult;
    }
  }

  /**
   * Return the last cached health state without issuing a live probe.
   * @returns {object}
   */
  getHealthSnapshot() {
    return this._health.get();
  }

  // ─── generateText ────────────────────────────────────────────────────────────

  /**
   * Generate text via the active provider.
   * @param {string} prompt
   * @param {object} [options]
   * @returns {Promise<string>}
   */
  async generateText(prompt, options = {}) {
    this._assertInitialized('generateText');
    this._log(AI_MANAGER_EVENTS.AI_REQUEST, `generateText — provider: ${this._providerName}`);

    try {
      const result = await this._provider.generateText(prompt, options);
      this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `generateText OK — length: ${result?.length ?? 0}`);
      return result;
    } catch (err) {
      this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `generateText failed: ${err.message}`);
      throw err;
    }
  }

  // ─── analyzeImage ────────────────────────────────────────────────────────────

  /**
   * Analyze an image via the active provider.
   * @param {string} imageData   - Base64 image data
   * @param {string} mimeType
   * @param {string} [prompt]
   * @param {object} [options]
   * @returns {Promise<string>}
   */
  async analyzeImage(imageData, mimeType, prompt = '', options = {}) {
    this._assertInitialized('analyzeImage');
    this._log(AI_MANAGER_EVENTS.AI_REQUEST, `analyzeImage — provider: ${this._providerName} — mimeType: ${mimeType}`);

    try {
      const result = await this._provider.analyzeImage(imageData, mimeType, prompt, options);
      this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `analyzeImage OK — length: ${result?.length ?? 0}`);
      return result;
    } catch (err) {
      this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `analyzeImage failed: ${err.message}`);
      throw err;
    }
  }

  // ─── analyzeMultimodal ───────────────────────────────────────────────────────

  /**
   * Analyze multimodal input (text + image + extras) via the active provider.
   * @param {object}  inputs   - { text, image, mimeType, extra }
   * @param {object}  [options]
   * @returns {Promise<string>}
   */
  async analyzeMultimodal(inputs = {}, options = {}) {
    this._assertInitialized('analyzeMultimodal');
    this._log(AI_MANAGER_EVENTS.AI_REQUEST, `analyzeMultimodal — provider: ${this._providerName}`);

    try {
      const result = await this._provider.analyzeMultimodal(inputs, options);
      this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `analyzeMultimodal OK — length: ${result?.length ?? 0}`);
      return result;
    } catch (err) {
      this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `analyzeMultimodal failed: ${err.message}`);
      throw err;
    }
  }

  // ─── Phase 4 Batch 2: Real Text Intelligence ────────────────────────────────

  /**
   * Analyze customer problem text via the active provider.
   * @param {string} text
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async analyzeCustomerProblem(text, options = {}) {
    this._assertInitialized('analyzeCustomerProblem');
    this._log(AI_MANAGER_EVENTS.AI_REQUEST, `analyzeCustomerProblem — provider: ${this._providerName}`);

    try {
      const result = await this._provider.analyzeCustomerProblem(text, options);
      this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `analyzeCustomerProblem OK`);
      return result;
    } catch (err) {
      this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `analyzeCustomerProblem failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Analyze image problem via active provider with SmartCache & RetryEngine.
   * @param {string} imageData - Base64 string
   * @param {string} mimeType
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async analyzeImageProblem(imageData, mimeType, options = {}) {
    this._assertInitialized('analyzeImageProblem');

    const imageHash = SmartCache.hashString(imageData);
    const textHash  = SmartCache.hashString(options.customerDescription || options.serviceCategory);
    const cacheKey  = SmartCache.generateKey({ imageHash, textHash, model: this._provider._visionModel, language: options.language || 'English' });

    if (!options.bypassCache) {
      const cached = SmartCache.get(cacheKey, options.reqCtx);
      if (cached) {
        this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `analyzeImageProblem CACHE HIT`);
        return { ...cached, _fromCache: true };
      }
    }

    this._log(AI_MANAGER_EVENTS.AI_REQUEST, `analyzeImageProblem — provider: ${this._providerName} — mimeType: ${mimeType}`);

    try {
      const result = await RetryEngine.execute(
        () => this._provider.analyzeImageProblem(imageData, mimeType, options),
        { context: 'analyzeImageProblem', reqCtx: options.reqCtx, maxRetries: options.maxRetries ?? 2 }
      );

      SmartCache.set(cacheKey, result);
      this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `analyzeImageProblem OK`);
      return result;
    } catch (err) {
      this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `analyzeImageProblem failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Analyze multimodal input in ONE request via active provider with SmartCache & RetryEngine.
   * @param {object} inputs
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async analyzeMultimodalProblem(inputs = {}, options = {}) {
    this._assertInitialized('analyzeMultimodalProblem');

    const imageHash = SmartCache.hashString(inputs.image);
    const textHash  = SmartCache.hashString(inputs.text);
    const cacheKey  = SmartCache.generateKey({ imageHash, textHash, model: this._provider._visionModel, language: inputs.customerLanguage || 'English' });

    if (!options.bypassCache) {
      const cached = SmartCache.get(cacheKey, options.reqCtx);
      if (cached) {
        this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `analyzeMultimodalProblem CACHE HIT`);
        return { ...cached, _fromCache: true };
      }
    }

    this._log(AI_MANAGER_EVENTS.AI_REQUEST, `analyzeMultimodalProblem — provider: ${this._providerName}`);

    try {
      const result = await RetryEngine.execute(
        () => this._provider.analyzeMultimodalProblem(inputs, options),
        { context: 'analyzeMultimodalProblem', reqCtx: options.reqCtx, maxRetries: options.maxRetries ?? 2 }
      );

      SmartCache.set(cacheKey, result);
      this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `analyzeMultimodalProblem OK`);
      return result;
    } catch (err) {
      this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `analyzeMultimodalProblem failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Master Customer Chat interface via active provider with instant greeting guard
   * and automatic hot-standby cloud failover.
   */
  async chatWithCustomer(payload, options = {}) {
    this._assertInitialized('chatWithCustomer');

    // 1. Zero-latency instant deterministic response for pure greetings & pleasantries
    const textTrim = String(payload?.text || '').trim().toLowerCase();
    const cleanTokens = textTrim.replace(/[^a-z0-9\s]/g, ' ').trim().split(/\s+/).filter((t) => t.length > 0);
    const GREETINGS = new Set(['hi', 'hello', 'hey', 'namaste', 'pranam', 'kem', 'cho', 'hola', 'sup', 'yo', 'morning', 'evening', 'afternoon', 'good', 'namaskar', 'halo', 'kaise', 'ho']);
    const isPureGreeting = cleanTokens.length <= 3 && cleanTokens.every((t) => GREETINGS.has(t)) && !payload?.image;

    if (isPureGreeting) {
      return {
        intent: 'GENERAL',
        reply: 'Namaste! Welcome to ServeCircle. How can I assist you today? You can describe any home repairs, cleaning, appliance fixing, shifting services, or upload a photo of the problem.',
        showServiceRecommendation: false,
        serviceId: '',
        serviceName: '',
        category: '',
        problemType: 'General Greeting',
        urgency: 'Standard',
        requiredWorkerSkill: 'Customer Support',
        estimatedPrice: 0,
        safetyPrecautions: [],
        followUpQuestions: [
          'AC Repair & Servicing',
          'Plumbing & Tap Leakage',
          'Home Deep Cleaning',
          'Electrician & Fan Repair',
        ],
        recommendations: [],
      };
    }

    this._log(AI_MANAGER_EVENTS.AI_REQUEST, `chatWithCustomer — primary provider: ${this._providerName}`);

    // 2. Primary Provider Attempt
    try {
      if (typeof this._provider.chatWithCustomer === 'function') {
        const result = await this._provider.chatWithCustomer(payload, options);
        this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `chatWithCustomer OK (${this._providerName})`);
        return result;
      }
      return await this._provider.analyzeCustomerProblem(payload.text, options);
    } catch (err) {
      this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `Primary (${this._providerName}) failed: ${err.message}`);

      // 3. Instant Hot-Standby Failover
      if (this._fallbackProvider) {
        try {
          this._log(AI_MANAGER_EVENTS.AI_REQUEST, `Executing failover to: ${this._fallbackProviderName}`);
          if (typeof this._fallbackProvider.chatWithCustomer === 'function') {
            const fallbackResult = await this._fallbackProvider.chatWithCustomer(payload, options);
            this._log(AI_MANAGER_EVENTS.AI_RESPONSE, `Failover (${this._fallbackProviderName}) OK`);
            return fallbackResult;
          }
          return await this._fallbackProvider.analyzeCustomerProblem(payload.text, options);
        } catch (fallbackErr) {
          this._log(AI_MANAGER_EVENTS.AI_PROVIDER_FAILED, `Fallback (${this._fallbackProviderName}) failed too: ${fallbackErr.message}`);
        }
      }

      throw err;
    }
  }

  // ─── Utility Passthroughs ────────────────────────────────────────────────────

  /**
   * Count tokens for a prompt using the active provider.
   * @param {string} prompt
   * @returns {Promise<number>}
   */
  async countTokens(prompt) {
    this._assertInitialized('countTokens');
    return this._provider.countTokens(prompt);
  }

  /**
   * Estimate cost using the active provider's pricing model.
   * @param {number} inputTokens
   * @param {number} outputTokens
   * @returns {object}
   */
  estimateCost(inputTokens, outputTokens) {
    this._assertInitialized('estimateCost');
    return this._provider.estimateCost(inputTokens, outputTokens);
  }

  /**
   * Get registry metadata for all providers.
   * @returns {object[]}
   */
  getRegisteredProviders() {
    return ProviderRegistry.getAll();
  }

  /**
   * Name of the currently active provider.
   * @returns {string|null}
   */
  getActiveProviderName() {
    return this._providerName;
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  _assertInitialized(method) {
    if (!this._initialized || !this._provider) {
      throw new AppError(
        `AIProviderManager: Not initialized. Call initialize() before ${method}(). ` +
        `Ensure GEMINI_API_KEY is set and server startup sequence completed.`,
        StatusCodes.SERVICE_UNAVAILABLE
      );
    }
  }

  _log(event, message) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [AIProviderManager] [${event}] ${message}`);
  }
}

// ─── Export Singleton ─────────────────────────────────────────────────────────
export const AIProviderManager = new AIProviderManagerClass();
