/**
 * server/ai/providers/BaseAIProvider.js — Phase 4 Batch 1
 *
 * Abstract base class for all AI providers.
 *
 * Architecture contract:
 *   - All providers extend BaseAIProvider
 *   - AIProviderManager only calls methods defined here
 *   - No other file in the project ever imports a concrete provider directly
 *
 * Subclasses MUST override every method marked @abstract.
 */

export class BaseAIProvider {
  /**
   * @param {string} providerName  - Unique provider identifier (e.g. 'gemini')
   * @param {string} version       - Provider version string
   */
  constructor(providerName, version = '1.0.0') {
    if (new.target === BaseAIProvider) {
      throw new Error('BaseAIProvider is abstract and cannot be instantiated directly.');
    }
    this.providerName = providerName;
    this.version = version;
    this.isReady = false;
    this.lastHealthCheck = null;
    this.lastError = null;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * @abstract
   * Initialize the provider (load SDK client, validate API key, warm up).
   * Must set this.isReady = true on success.
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error(`[${this.providerName}] initialize() must be implemented by subclass.`);
  }

  // ─── Health ─────────────────────────────────────────────────────────────────

  /**
   * @abstract
   * Run a lightweight health probe against the real API.
   * @returns {Promise<ProviderHealthResult>}
   *   { loaded, ready, provider, version, lastCheck, responseTimeMs }
   */
  async health() {
    throw new Error(`[${this.providerName}] health() must be implemented by subclass.`);
  }

  // ─── Core Generation ────────────────────────────────────────────────────────

  /**
   * @abstract
   * Generate a text response from a plain-text prompt.
   * @param {string}  prompt
   * @param {object}  [options]  - { model, temperature, maxOutputTokens, topK, topP }
   * @returns {Promise<string>}  Raw text content from the provider
   */
  async generateText(prompt, options = {}) {
    throw new Error(`[${this.providerName}] generateText() must be implemented by subclass.`);
  }

  /**
   * @abstract
   * Analyze a single image with an optional text prompt.
   * @param {string|Buffer} imageData  - Base64 string or buffer
   * @param {string}        mimeType   - e.g. 'image/jpeg'
   * @param {string}        [prompt]
   * @param {object}        [options]
   * @returns {Promise<string>}
   */
  async analyzeImage(imageData, mimeType, prompt = '', options = {}) {
    throw new Error(`[${this.providerName}] analyzeImage() must be implemented by subclass.`);
  }

  /**
   * @abstract
   * Analyze multimodal input (text + image + optional additional context).
   * @param {object}  inputs           - { text, image, mimeType, extra }
   * @param {object}  [options]
   * @returns {Promise<string>}
   */
  async analyzeMultimodal(inputs = {}, options = {}) {
    throw new Error(`[${this.providerName}] analyzeMultimodal() must be implemented by subclass.`);
  }

  // ─── Phase 4 Batch 2 & Phase 4A: Real Vision & Multimodal Intelligence ─────

  /**
   * @abstract
   * Analyze a customer problem description from text.
   * @param {string} text
   * @param {object} [options]
   * @returns {Promise<object>} Parsed JSON response
   */
  async analyzeCustomerProblem(text, options = {}) {
    throw new Error(`[${this.providerName}] analyzeCustomerProblem() must be implemented by subclass.`);
  }

  /**
   * @abstract
   * Analyze an image problem via Gemini Vision and return structured JSON.
   * @param {string} imageData - Base64 image string
   * @param {string} mimeType
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async analyzeImageProblem(imageData, mimeType, options = {}) {
    throw new Error(`[${this.providerName}] analyzeImageProblem() must be implemented by subclass.`);
  }

  /**
   * @abstract
   * Analyze text + image + context in ONE single multimodal Gemini Vision call.
   * @param {object} inputs - { text, image, mimeType, bookingContext, customerContext, location, serviceHistory, customerLanguage }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async analyzeMultimodalProblem(inputs = {}, options = {}) {
    throw new Error(`[${this.providerName}] analyzeMultimodalProblem() must be implemented by subclass.`);
  }

  // ─── Token & Cost Utilities ─────────────────────────────────────────────────

  /**
   * @abstract
   * Count tokens for a given prompt string.
   * @param {string} prompt
   * @returns {Promise<number>}
   */
  async countTokens(prompt) {
    throw new Error(`[${this.providerName}] countTokens() must be implemented by subclass.`);
  }

  /**
   * Estimate the cost of a generation request.
   * Default implementation: override in provider for real pricing.
   * @param {number} inputTokens
   * @param {number} outputTokens
   * @returns {{ inputCostUsd: number, outputCostUsd: number, totalCostUsd: number }}
   */
  estimateCost(inputTokens = 0, outputTokens = 0) {
    return {
      inputCostUsd:  0,
      outputCostUsd: 0,
      totalCostUsd:  0,
      note: `${this.providerName}: cost estimation not implemented`,
    };
  }

  // ─── Validation ─────────────────────────────────────────────────────────────

  /**
   * Validate that a provider response is a non-empty string.
   * Subclasses may override with stricter checks (e.g. JSON validation).
   * @param {*} response
   * @returns {boolean}
   */
  validateResponse(response) {
    if (response === null || response === undefined) return false;
    if (typeof response === 'string') return response.trim().length > 0;
    return true;
  }

  // ─── Internal Helpers ───────────────────────────────────────────────────────

  /**
   * Mark provider as ready and timestamp the initialization.
   */
  _markReady() {
    this.isReady = true;
    this.lastHealthCheck = new Date().toISOString();
    this.lastError = null;
  }

  /**
   * Mark provider as failed, store last error.
   * @param {Error|string} err
   */
  _markFailed(err) {
    this.isReady = false;
    this.lastError = err?.message || String(err);
    this.lastHealthCheck = new Date().toISOString();
  }

  /**
   * Build a standard ProviderHealthResult.
   * @param {boolean} ready
   * @param {number}  responseTimeMs
   * @param {string}  [note]
   * @returns {ProviderHealthResult}
   */
  _buildHealthResult(ready, responseTimeMs = 0, note = '') {
    return {
      loaded:        true,
      ready,
      provider:      this.providerName,
      version:       this.version,
      lastCheck:     new Date().toISOString(),
      responseTimeMs,
      note:          note || (ready ? 'OK' : this.lastError || 'Provider not ready'),
    };
  }
}
