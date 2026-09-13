/**
 * server/config/providers.js — Phase 4 Batch 1 Cleanup
 *
 * Provider configuration for the AI Provider Layer.
 *
 * ProviderRegistry reads from this file instead of hardcoding values.
 *
 * Adding a new provider:
 *   1. Add an entry here with enabled: true when ready.
 *   2. Implement the provider class extending BaseAIProvider.
 *   3. Add the factory to ProviderRegistry.
 *   4. Add the relevant env vars to .env.
 *
 * Model selection:
 *   GeminiProvider uses the appropriate model automatically:
 *     textModel      — generateText(), countTokens()
 *     visionModel    — analyzeImage(), analyzeMultimodal()
 *     embeddingModel — (reserved for future embedding support)
 */

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_TEXT_MODEL      = 'gemini-2.0-flash';
const DEFAULT_VISION_MODEL    = 'gemini-2.0-flash';
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004';

// ─── Provider Configuration Table ─────────────────────────────────────────────
/**
 * Each entry defines:
 *
 *   name           {string}   — identifier matching AI_PROVIDER env var
 *   enabled        {boolean}  — must be true to allow instantiation
 *   priority       {number}   — lower = higher priority (used for future auto-fallback)
 *   description    {string}   — human-readable label
 *   textModel      {string}   — model used for generateText() and countTokens()
 *   visionModel    {string}   — model used for analyzeImage() and analyzeMultimodal()
 *   embeddingModel {string}   — model reserved for future embedding calls
 */
export const PROVIDER_CONFIGS = [
  {
    name:           'groq',
    enabled:        true,
    priority:       1,
    description:    'Groq Cloud LPU via groq-sdk (Qwen 3.8 27B Multimodal & Vision)',
    textModel:      process.env.GROQ_TEXT_MODEL   || 'qwen/qwen3.8-27b',
    visionModel:    process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b',
    embeddingModel: '',
  },
  {
    name:           'gemini',
    enabled:        true,
    priority:       2,
    description:    'Google Gemini via @google/genai SDK',
    textModel:      process.env.GEMINI_TEXT_MODEL      || DEFAULT_TEXT_MODEL,
    visionModel:    process.env.GEMINI_VISION_MODEL    || DEFAULT_VISION_MODEL,
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL,
  },
  {
    name:           'openai',
    enabled:        false,
    priority:       2,
    description:    'OpenAI GPT series (not yet implemented)',
    textModel:      'gpt-4o',
    visionModel:    'gpt-4o',
    embeddingModel: 'text-embedding-3-small',
  },
  {
    name:           'claude',
    enabled:        false,
    priority:       3,
    description:    'Anthropic Claude (not yet implemented)',
    textModel:      'claude-3-5-sonnet-20241022',
    visionModel:    'claude-3-5-sonnet-20241022',
    embeddingModel: '',
  },
  {
    name:           'ollama',
    enabled:        false,
    priority:       4,
    description:    'Local Ollama runtime (not yet implemented)',
    textModel:      'llama3.2',
    visionModel:    'llava',
    embeddingModel: 'nomic-embed-text',
  },
];

/**
 * Look up a single provider config entry by name.
 * @param {string} name
 * @returns {object|undefined}
 */
export function getProviderConfig(name) {
  return PROVIDER_CONFIGS.find((c) => c.name === name.toLowerCase());
}

/**
 * Return all enabled provider configs, sorted by priority (ascending).
 * @returns {object[]}
 */
export function getEnabledProviders() {
  return PROVIDER_CONFIGS
    .filter((c) => c.enabled)
    .sort((a, b) => a.priority - b.priority);
}
