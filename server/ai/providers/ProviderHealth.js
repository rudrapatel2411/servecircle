/**
 * server/ai/providers/ProviderHealth.js — Phase 4 Batch 1
 *
 * Exposes runtime health data for the active AI provider.
 *
 * Shape:
 *   {
 *     loaded:         boolean   — Provider module was loaded
 *     ready:          boolean   — Provider passed health probe
 *     provider:       string    — Provider name (e.g. 'gemini')
 *     version:        string    — Provider version
 *     lastCheck:      string    — ISO timestamp of last health check
 *     responseTimeMs: number    — Last health probe latency
 *     note:           string    — 'OK' or error description
 *   }
 */

// ─── Default / Empty Health State ────────────────────────────────────────────

const UNINITIALIZED_HEALTH = Object.freeze({
  loaded:         false,
  ready:          false,
  provider:       'none',
  version:        '0.0.0',
  lastCheck:      null,
  responseTimeMs: 0,
  note:           'AIProviderManager has not been initialized.',
});

// ─── ProviderHealth ───────────────────────────────────────────────────────────

export class ProviderHealth {
  constructor() {
    this._current = { ...UNINITIALIZED_HEALTH };
  }

  /**
   * Update the stored health snapshot.
   * Called by AIProviderManager after every health check.
   *
   * @param {object} result  - ProviderHealthResult from BaseAIProvider.health()
   */
  update(result) {
    if (!result || typeof result !== 'object') return;
    this._current = {
      loaded:         Boolean(result.loaded),
      ready:          Boolean(result.ready),
      provider:       String(result.provider  || 'unknown'),
      version:        String(result.version   || '0.0.0'),
      lastCheck:      result.lastCheck        || new Date().toISOString(),
      responseTimeMs: Number(result.responseTimeMs ?? 0),
      note:           result.note             || (result.ready ? 'OK' : 'Unknown'),
    };
  }

  /**
   * Return the current health snapshot (immutable copy).
   * @returns {object}
   */
  get() {
    return { ...this._current };
  }

  /**
   * Return true if the provider is loaded and ready.
   * @returns {boolean}
   */
  isReady() {
    return this._current.ready;
  }

  /**
   * Reset to uninitialized state (e.g. on provider switch).
   */
  reset() {
    this._current = { ...UNINITIALIZED_HEALTH };
  }

  /**
   * Build a health result object from raw fields.
   * Utility for providers that don't use BaseAIProvider._buildHealthResult().
   *
   * @param {string}  provider
   * @param {string}  version
   * @param {boolean} ready
   * @param {number}  responseTimeMs
   * @param {string}  [note]
   * @returns {object}
   */
  static build(provider, version, ready, responseTimeMs = 0, note = '') {
    return {
      loaded:         true,
      ready,
      provider,
      version,
      lastCheck:      new Date().toISOString(),
      responseTimeMs,
      note:           note || (ready ? 'OK' : 'Provider failed health check'),
    };
  }
}
