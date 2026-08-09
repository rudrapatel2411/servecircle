/**
 * server/ai/smartCache.js — Enterprise Smart Cache with SHA-256 Composite Keys
 *
 * Implements high-performance in-memory response caching based on composite hashes
 * of Image Hash + Text Hash + Model + Language. Tracks hits, misses, hit rates, and statistics.
 */

import crypto from 'crypto';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';

class SmartCacheClass {
  constructor() {
    this._store   = new Map();
    this._ttlMs   = parseInt(process.env.AI_CACHE_TTL_MS || String(10 * 60 * 1000), 10); // 10 minutes default
    this._hits    = 0;
    this._misses  = 0;
    this._maxSize = 1000;
  }

  /**
   * Generate SHA-256 composite cache key.
   *
   * @param {object} params
   * @param {string} [params.imageHash]
   * @param {string} [params.textHash]
   * @param {string} [params.model]
   * @param {string} [params.language]
   * @returns {string}
   */
  generateKey({ imageHash = '', textHash = '', model = 'gemini-2.0-flash', language = 'English' } = {}) {
    const raw = `${imageHash || 'no_img'}:${textHash || 'no_txt'}:${model}:${language}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Helper to compute SHA-256 hash of text string or base64 buffer.
   */
  hashString(input = '') {
    if (!input) return 'empty';
    return crypto.createHash('sha256').update(String(input)).digest('hex');
  }

  /**
   * Retrieve cached entry if valid.
   *
   * @param {string} cacheKey
   * @param {object} [reqCtx]
   * @returns {object|null}
   */
  get(cacheKey, reqCtx = {}) {
    if (!cacheKey) return null;
    const item = this._store.get(cacheKey);

    if (!item) {
      this._misses++;
      logEvent({
        eventType:  EVENT_TYPES.AI_CACHE_MISS,
        entityType: ENTITY_TYPES.SYSTEM,
        metadata:   { cacheKey },
        ...reqCtx,
      });
      return null;
    }

    if (Date.now() - item.timestamp > this._ttlMs) {
      this._store.delete(cacheKey);
      this._misses++;
      logEvent({
        eventType:  EVENT_TYPES.AI_CACHE_MISS,
        entityType: ENTITY_TYPES.SYSTEM,
        metadata:   { cacheKey, reason: 'EXPIRED' },
        ...reqCtx,
      });
      return null;
    }

    this._hits++;
    item.hits = (item.hits || 0) + 1;

    logEvent({
      eventType:  EVENT_TYPES.AI_CACHE_HIT,
      entityType: ENTITY_TYPES.SYSTEM,
      metadata:   { cacheKey, itemHits: item.hits },
      ...reqCtx,
    });

    return item.data;
  }

  /**
   * Store data in cache.
   *
   * @param {string} cacheKey
   * @param {object} data
   */
  set(cacheKey, data) {
    if (!cacheKey || !data) return;

    if (this._store.size >= this._maxSize) {
      const oldest = this._store.keys().next().value;
      this._store.delete(oldest);
    }

    this._store.set(cacheKey, {
      timestamp: Date.now(),
      data,
      hits: 0,
    });
  }

  /**
   * Clear cache store.
   */
  clear() {
    const clearedCount = this._store.size;
    this._store.clear();
    return clearedCount;
  }

  /**
   * Get cache performance statistics.
   */
  getStats() {
    const total = this._hits + this._misses;
    const hitRatePercent = total > 0 ? Number(((this._hits / total) * 100).toFixed(2)) : 0;

    return {
      size:           this._store.size,
      maxSize:        this._maxSize,
      ttlMs:          this._ttlMs,
      hits:           this._hits,
      misses:         this._misses,
      totalRequests:  total,
      hitRatePercent,
    };
  }
}

export const SmartCache = new SmartCacheClass();
