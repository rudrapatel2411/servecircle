/**
 * server/ai/retryEngine.js — Resilient Enterprise AI Retry Engine
 *
 * Handles transient failures (429, 503, timeouts, invalid JSON, temporary network issues)
 * using exponential backoff with jitter while strictly rejecting non-retryable errors (400, 401, 403).
 */

import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';

const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403]);

export class RetryEngine {
  /**
   * Execute an async AI operation with intelligent exponential backoff retries.
   *
   * @param {Function} fn             - Async function to execute
   * @param {object}   [options]
   * @param {number}   [options.maxRetries=2]  - Maximum number of retries
   * @param {number}   [options.initialDelayMs=200]
   * @param {number}   [options.backoffFactor=2]
   * @param {string}   [options.context='AI_OPERATION']
   * @param {object}   [options.reqCtx={}]
   * @returns {Promise<any>} Result of fn()
   */
  static async execute(fn, { maxRetries = 2, initialDelayMs = 200, backoffFactor = 2, context = 'AI_OPERATION', reqCtx = {} } = {}) {
    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt <= maxRetries) {
      try {
        if (attempt > 0) {
          logEvent({
            eventType:  EVENT_TYPES.AI_RETRY,
            entityType: ENTITY_TYPES.SYSTEM,
            metadata:   { context, attempt, maxRetries, delayMs: delay },
            ...reqCtx,
          });
        }

        return await fn();

      } catch (err) {
        attempt++;

        // Determine if non-retryable
        const statusCode = err.statusCode || err.status || 500;
        const msg = String(err.message || err);

        const isNonRetryableCode = NON_RETRYABLE_STATUS_CODES.has(statusCode);
        const isAuthOrClientError = msg.includes('400') || msg.includes('401') || msg.includes('403') || msg.includes('API_KEY_INVALID');

        if (isNonRetryableCode || isAuthOrClientError) {
          throw err;
        }

        // Retryable errors: 429, 503, timeout, invalid JSON, temporary network
        const isRetryable =
          statusCode === 429 ||
          statusCode === 503 ||
          statusCode === 504 ||
          msg.includes('429') ||
          msg.includes('503') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('timeout') ||
          msg.includes('JSON') ||
          msg.includes('ECONNRESET');

        if (!isRetryable || attempt > maxRetries) {
          if (msg.includes('timeout')) {
            logEvent({
              eventType:  EVENT_TYPES.AI_TIMEOUT,
              entityType: ENTITY_TYPES.SYSTEM,
              metadata:   { context, error: msg, attempt },
              ...reqCtx,
            });
          }
          if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
            logEvent({
              eventType:  EVENT_TYPES.AI_QUOTA_WARNING,
              entityType: ENTITY_TYPES.SYSTEM,
              metadata:   { context, error: msg, attempt },
              ...reqCtx,
            });
          }
          throw err;
        }

        // Exponential backoff delay with random jitter (+/- 20%)
        const jitter = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
        const sleepMs = Math.round(delay * jitter);
        await new Promise((resolve) => setTimeout(resolve, sleepMs));

        delay *= backoffFactor;
      }
    }
  }
}
