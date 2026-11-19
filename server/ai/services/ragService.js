// server/ai/services/ragService.js
import { prisma } from '../../config/prisma.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

// In-memory cache for fast vector operations (110 services ~ 350KB RAM)
let serviceVectorCache = [];
let isCacheLoaded = false;
let isSyncing = false;

/**
 * Compute dot product of two numerical vectors.
 */
function dotProduct(a, b) {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Compute Euclidean magnitude of a vector.
 */
function vectorMagnitude(a) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i];
  }
  return Math.sqrt(sum);
}

/**
 * Compute Cosine Similarity between vector A and vector B (returns -1.0 to 1.0).
 */
export function cosineSimilarity(a, b, magA = null, magB = null) {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const mA = magA || vectorMagnitude(a);
  const mB = magB || vectorMagnitude(b);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct(a, b) / (mA * mB);
}

/**
 * Generate embedding vector using local Ollama nomic-embed-text endpoint.
 * Returns null if Ollama is unreachable.
 */
export async function generateLocalEmbedding(text) {
  if (!text || typeof text !== 'string') return null;
  const cleanText = text.trim();
  if (!cleanText) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBED_MODEL,
        prompt: cleanText,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      // Try Ollama /api/embed (newer format)
      const resNew = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: EMBED_MODEL,
          input: cleanText,
        }),
      });
      if (resNew.ok) {
        const dataNew = await resNew.json();
        if (dataNew.embeddings && dataNew.embeddings[0]) {
          return dataNew.embeddings[0];
        }
      }
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data.embedding) && data.embedding.length > 0) {
      return data.embedding;
    }
    return null;
  } catch (err) {
    // Graceful offline fallback
    return null;
  }
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'about', 'as', 'into',
  'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during', 'without', 'before', 'under',
  'around', 'among', 'how', 'much', 'does', 'cost', 'fix', 'repair', 'need', 'want', 'please', 'help', 'can',
  'you', 'my', 'me', 'i', 'we', 'hai', 'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'kya', 'karo', 'karna',
  'chahiye', 'hoga', 'mera', 'meri', 'mere', 'kuch', 'bhi', 'nahi', 'raha', 'rahi', 'rahe', 'service'
]);

const SPECIAL_ACRONYMS = new Set(['ac', 'ro', 'tv', 'pc', 'ups', 'cctv', 'fan', 'led']);

/**
 * Keyword overlap / token matching score (0.0 to 1.0)
 * Acts as high-accuracy lexical complement to vector embeddings.
 */
function computeLexicalScore(service, queryText) {
  if (!queryText) return 0;
  const rawTokens = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length >= 2);
  const meaningfulTokens = rawTokens.filter(t => !STOP_WORDS.has(t) || SPECIAL_ACRONYMS.has(t));
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;
  if (tokens.length === 0) return 0;

  const targetName = (service.name || '').toLowerCase();
  const targetId = (service.serviceId || '').toLowerCase();
  const targetTags = (service.tags || []).map(t => t.toLowerCase()).join(' ');
  const targetDesc = (service.description || '').toLowerCase();

  let score = 0;
  let totalWeight = tokens.length * 2.5;

  for (const t of tokens) {
    if (SPECIAL_ACRONYMS.has(t)) {
      const regex = new RegExp(`\\b${t}\\b`, 'i');
      if (regex.test(targetName) || regex.test(targetId) || regex.test(targetTags)) {
        score += 6.0;
        continue;
      }
    }
    if (targetId.includes(t)) score += 3.0;
    else if (targetName.includes(t)) score += 2.5;
    else if (targetTags.includes(t)) score += 2.0;
    else if (targetDesc.includes(t)) score += 1.0;
  }

  // Exact service name match bonus
  if (queryText.toLowerCase().includes(targetName)) {
    score += 4.0;
  }

  return Math.min(1.0, score / totalWeight);
}

/**
 * Load or sync all 110 service embeddings from PostgreSQL into in-memory cache.
 */
export async function syncAndLoadServiceVectors(forceRegenerate = false) {
  if (isSyncing) return serviceVectorCache;
  isSyncing = true;

  try {
    const services = await prisma.service.findMany({
      where: { isActive: true, isDeleted: false },
      select: {
        id: true,
        serviceId: true,
        name: true,
        category: true,
        subCategory: true,
        description: true,
        basePrice: true,
        estimatedDuration: true,
        tags: true,
        icon: true,
        embedding: true,
        embeddingJson: true,
      },
    });

    console.log(`[RAG Service] Loaded ${services.length} active services from PostgreSQL.`);

    const updatedCache = [];

    for (const s of services) {
      let vector = Array.isArray(s.embedding) && s.embedding.length > 0 ? s.embedding : null;

      if (!vector && s.embeddingJson) {
        try {
          const parsed = JSON.parse(s.embeddingJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            vector = parsed;
          }
        } catch {}
      }

      // If vector missing or forceRegenerate is true, attempt Ollama embedding
      if ((!vector || forceRegenerate) && !s._embeddingFailed) {
        const textToEmbed = `Service: ${s.name}. Category: ${s.category}. SubCategory: ${s.subCategory || ''}. Description: ${s.description || ''}. Tags: ${(s.tags || []).join(', ')}`;
        const generated = await generateLocalEmbedding(textToEmbed);
        if (generated && generated.length > 0) {
          vector = generated;
          // Persist back to PostgreSQL
          try {
            await prisma.service.update({
              where: { id: s.id },
              data: {
                embedding: vector,
                embeddingJson: JSON.stringify(vector),
              },
            });
          } catch (updateErr) {
            console.warn(`[RAG Service] Error persisting embedding for ${s.serviceId}:`, updateErr.message);
          }
        } else {
          s._embeddingFailed = true;
        }
      }

      const mag = vector ? vectorMagnitude(vector) : 0;
      updatedCache.push({
        service: s,
        vector,
        magnitude: mag,
      });
    }

    serviceVectorCache = updatedCache;
    isCacheLoaded = true;
    console.log(`[RAG Service] Vector cache ready with ${serviceVectorCache.length} items (${serviceVectorCache.filter(c => c.vector !== null).length} embedded).`);
    return serviceVectorCache;
  } catch (err) {
    console.error('[RAG Service] Failed to initialize service vector cache:', err.message);
    return serviceVectorCache;
  } finally {
    isSyncing = false;
  }
}

/**
 * Retrieve top K relevant services matching the user query.
 * Combines dense vector cosine similarity (via nomic-embed-text) + lexical BM25 boost.
 * Threshold: default 0.42.
 */
export async function getRelevantServices(queryText, topK = 5, threshold = 0.48) {
  if (!queryText || !queryText.trim()) return [];

  // Ignore pure casual greetings or stop-word only queries
  const cleanTokens = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim().split(/\s+/).filter(t => t.length > 1);
  const GREETING_TOKENS = new Set(['hi', 'hello', 'hey', 'namaste', 'pranam', 'kem', 'cho', 'hola', 'yo', 'sup', 'bye', 'thanks', 'thank', 'ok', 'okay']);
  const isPureGreeting = cleanTokens.length <= 2 && cleanTokens.every(t => GREETING_TOKENS.has(t));
  if (isPureGreeting) return [];

  // Ensure cache is loaded
  if (!isCacheLoaded || serviceVectorCache.length === 0) {
    await syncAndLoadServiceVectors(false);
  }

  // Attempt to generate query vector
  const queryVector = await generateLocalEmbedding(queryText);
  const queryMag = queryVector ? vectorMagnitude(queryVector) : 0;

  const scoredServices = [];

  for (const item of serviceVectorCache) {
    const { service, vector, magnitude } = item;

    let vectorScore = 0;
    if (queryVector && vector) {
      const rawCosine = cosineSimilarity(queryVector, vector, queryMag, magnitude);
      vectorScore = Math.max(0, rawCosine);
    }

    const lexicalScore = computeLexicalScore(service, queryText);

    // Hybrid Score (Dense Semantic + Lexical Boost):
    let hybridScore = 0;
    if (queryVector && vector) {
      if (lexicalScore > 0) {
        // High confidence match: both dense vector and keyword agree!
        hybridScore = Math.min(1.0, (vectorScore * 0.70) + (lexicalScore * 0.50));
      } else if (vectorScore >= 0.58) {
        // Pure semantic match without exact keyword overlap
        hybridScore = vectorScore * 0.85;
      } else {
        // Unrelated semantic background noise
        hybridScore = vectorScore * 0.30;
      }
    } else {
      hybridScore = lexicalScore;
    }

    scoredServices.push({
      serviceId: service.serviceId,
      name: service.name,
      category: service.category,
      subCategory: service.subCategory,
      description: service.description,
      basePrice: service.basePrice,
      estimatedDuration: service.estimatedDuration,
      icon: service.icon,
      tags: service.tags,
      score: Number(hybridScore.toFixed(4)),
      vectorScore: Number(vectorScore.toFixed(4)),
      lexicalScore: Number(lexicalScore.toFixed(4)),
    });
  }

  // Sort by hybrid score descending
  scoredServices.sort((a, b) => b.score - a.score);

  // Filter by strict threshold
  const matching = scoredServices.filter(s => s.score >= threshold);

  return matching.slice(0, topK);
}

/**
 * Format retrieved services as structured text for prompt injection.
 */
export function formatServicesForPrompt(services) {
  if (!services || services.length === 0) {
    return 'No direct platform services matched.';
  }

  return services
    .map(
      (s, i) =>
        `${i + 1}. **${s.name}** [ID: \`${s.serviceId}\`] - Category: ${s.category} | Price: ₹${s.basePrice} | Duration: ~${s.estimatedDuration} mins\n   Description: ${s.description}\n   Tags: ${(s.tags || []).slice(0, 4).join(', ')} (Relevance: ${(s.score * 100).toFixed(0)}%)`
    )
    .join('\n\n');
}

export default {
  cosineSimilarity,
  generateLocalEmbedding,
  syncAndLoadServiceVectors,
  getRelevantServices,
  formatServicesForPrompt,
};
