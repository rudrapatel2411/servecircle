/**
 * server/ai/providers/ProviderRegistry.js — Phase 4 Batch 1 (Cleanup)
 *
 * Central registry of all available AI providers.
 *
 * Architecture contract:
 *   - Provider metadata and model configuration live in server/config/providers.js.
 *   - This registry reads from that config — no values are hardcoded here.
 *   - Provider factory functions are defined here (the one place that knows
 *     which class to instantiate for each name).
 *   - AIProviderManager calls ProviderRegistry.create() — nothing else does.
 *
 * Adding a new provider:
 *   1. Add an entry to server/config/providers.js (enabled: true when ready).
 *   2. Implement the class extending BaseAIProvider.
 *   3. Add a factory entry to PROVIDER_FACTORIES below.
 *   4. Set AI_PROVIDER=<name> in .env.
 */

import { GeminiProvider }                    from './GeminiProvider.js';
import { PROVIDER_CONFIGS, getProviderConfig } from '../../config/providers.js';

// ─── Provider Status ──────────────────────────────────────────────────────────
export const PROVIDER_STATUS = Object.freeze({
  ACTIVE:      'ACTIVE',
  DISABLED:    'DISABLED',
  MAINTENANCE: 'MAINTENANCE',
  PLANNED:     'PLANNED',
});

// ─── Factory Map ─────────────────────────────────────────────────────────────
/**
 * Maps provider name → factory function that accepts a config object
 * and returns a new provider instance.
 *
 * Only add a factory here once the provider class is implemented.
 * Planned providers without a factory will be treated as PLANNED/DISABLED.
 */
const PROVIDER_FACTORIES = {
  gemini: (config) => new GeminiProvider(config),
  // openai:  (config) => new OpenAIProvider(config),   // future
  // claude:  (config) => new ClaudeProvider(config),   // future
  // ollama:  (config) => new OllamaProvider(config),   // future
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derive the PROVIDER_STATUS for a config entry.
 * @param {object} config  - Entry from PROVIDER_CONFIGS
 * @returns {string}       - PROVIDER_STATUS constant
 */
function _statusFromConfig(config) {
  if (!config.enabled)                        return PROVIDER_STATUS.DISABLED;
  if (!PROVIDER_FACTORIES[config.name])       return PROVIDER_STATUS.PLANNED;
  return PROVIDER_STATUS.ACTIVE;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export class ProviderRegistry {
  /**
   * Instantiate a provider by name.
   * The config object (textModel, visionModel, embeddingModel, …) is read from
   * server/config/providers.js and injected into the provider constructor.
   *
   * @param {string} name  - Provider identifier (e.g. 'gemini')
   * @returns {BaseAIProvider}
   * @throws {Error} if provider is not found, not enabled, or has no factory
   */
  static create(name) {
    const config = getProviderConfig(name);

    if (!config) {
      const known = PROVIDER_CONFIGS.map((c) => c.name).join(', ');
      throw new Error(
        `ProviderRegistry: Unknown provider "${name}". Known providers: ${known}`
      );
    }

    const status = _statusFromConfig(config);

    if (status !== PROVIDER_STATUS.ACTIVE) {
      const active = ProviderRegistry.getActive().map((p) => p.name).join(', ');
      throw new Error(
        `ProviderRegistry: Provider "${name}" is ${status} and cannot be instantiated. ` +
        `Currently active providers: ${active || 'none'}`
      );
    }

    return PROVIDER_FACTORIES[config.name](config);
  }

  /**
   * Check whether a provider name is registered (regardless of status).
   * @param {string} name
   * @returns {boolean}
   */
  static has(name) {
    return Boolean(getProviderConfig(name));
  }

  /**
   * Get all provider metadata from config (with derived status).
   * @returns {object[]}  { name, status, description, priority, textModel, visionModel, embeddingModel }
   */
  static getAll() {
    return PROVIDER_CONFIGS.map((config) => ({
      name:           config.name,
      status:         _statusFromConfig(config),
      description:    config.description,
      priority:       config.priority,
      textModel:      config.textModel,
      visionModel:    config.visionModel,
      embeddingModel: config.embeddingModel,
    }));
  }

  /**
   * Get only ACTIVE (enabled + factory-registered) providers.
   * @returns {object[]}
   */
  static getActive() {
    return ProviderRegistry.getAll().filter((p) => p.status === PROVIDER_STATUS.ACTIVE);
  }

  /**
   * Get the default provider name from environment.
   * Falls back to 'gemini' if AI_PROVIDER is not set.
   * @returns {string}
   */
  static getDefaultProviderName() {
    return (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  }
}
