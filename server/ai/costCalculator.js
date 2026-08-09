/**
 * server/ai/costCalculator.js — Enterprise AI Cost Calculator
 *
 * Provides a extensible interface for calculating AI token costs
 * across multiple AI providers (Gemini, OpenAI, Claude, Ollama, etc.).
 */

const PROVIDER_PRICING = {
  gemini: {
    'gemini-2.0-flash':     { inputPer1M: 0.075, outputPer1M: 0.30 },
    'gemini-1.5-flash':     { inputPer1M: 0.075, outputPer1M: 0.30 },
    'gemini-1.5-pro':       { inputPer1M: 1.25,  outputPer1M: 5.00 },
    _default:               { inputPer1M: 0.075, outputPer1M: 0.30 },
  },
  openai: {
    'gpt-4o':               { inputPer1M: 2.50,  outputPer1M: 10.00 },
    'gpt-4o-mini':          { inputPer1M: 0.15,  outputPer1M: 0.60 },
    _default:               { inputPer1M: 0.15,  outputPer1M: 0.60 },
  },
  claude: {
    'claude-3-5-sonnet':    { inputPer1M: 3.00,  outputPer1M: 15.00 },
    'claude-3-haiku':       { inputPer1M: 0.25,  outputPer1M: 1.25 },
    _default:               { inputPer1M: 0.25,  outputPer1M: 1.25 },
  },
  ollama: {
    _default:               { inputPer1M: 0.00,  outputPer1M: 0.00 }, // Self-hosted local inference
  },
};

export class CostCalculator {
  /**
   * Calculate total estimated cost in USD for a given AI provider request.
   *
   * @param {object} params
   * @param {string} params.provider      - e.g. 'gemini', 'openai', 'claude', 'ollama'
   * @param {string} [params.model]       - e.g. 'gemini-2.0-flash'
   * @param {number} [params.promptTokens]
   * @param {number} [params.completionTokens]
   * @returns {{ inputCostUsd: number, outputCostUsd: number, totalCostUsd: number, provider: string, model: string }}
   */
  static calculateCost({ provider = 'gemini', model = 'gemini-2.0-flash', promptTokens = 0, completionTokens = 0 } = {}) {
    const provKey = String(provider).toLowerCase();
    const modelRates = PROVIDER_PRICING[provKey]?.[model] || PROVIDER_PRICING[provKey]?._default || PROVIDER_PRICING.gemini._default;

    const inputCostUsd  = (promptTokens     / 1_000_000) * modelRates.inputPer1M;
    const outputCostUsd = (completionTokens / 1_000_000) * modelRates.outputPer1M;
    const totalCostUsd  = inputCostUsd + outputCostUsd;

    return {
      inputCostUsd:  Math.round(inputCostUsd  * 1e8) / 1e8,
      outputCostUsd: Math.round(outputCostUsd * 1e8) / 1e8,
      totalCostUsd:  Math.round(totalCostUsd  * 1e8) / 1e8,
      provider: provKey,
      model,
    };
  }

  /**
   * Return registered pricing rates for a provider/model.
   */
  static getPricingTiers() {
    return PROVIDER_PRICING;
  }
}
