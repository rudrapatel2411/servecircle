/**
 * server/ai/providers/ResponseParser.js — Phase 4 Batch 1
 *
 * Parses and validates AI provider responses.
 *
 * Responsibilities:
 *   1. Accept raw string response from any AI provider
 *   2. Extract JSON (even if wrapped in markdown fences)
 *   3. Validate structure and required fields
 *   4. Attempt minor repair of common formatting issues
 *   5. Throw AppError with AI_INVALID_RESPONSE code on unrecoverable failures
 *
 * Design:
 *   - Purely functional — no state
 *   - No provider coupling — works with any text response
 */

import { AppError } from '../../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

// ─── Error Codes ──────────────────────────────────────────────────────────────
export const PARSE_ERROR_CODES = {
  EMPTY_RESPONSE:     'AI_EMPTY_RESPONSE',
  INVALID_JSON:       'AI_INVALID_JSON',
  VALIDATION_FAILED:  'AI_VALIDATION_FAILED',
  SAFETY_BLOCK:       'AI_SAFETY_BLOCK',
  REPAIR_FAILED:      'AI_REPAIR_FAILED',
};

// ─── Public API ───────────────────────────────────────────────────────────────

export class ResponseParser {

  /**
   * Parse a raw AI response string into a typed JavaScript object.
   *
   * Flow:
   *   raw string → strip fences → extract JSON → parse → validate → return
   *
   * @param {string}    raw              - Raw text from AI provider
   * @param {object}    [options]
   * @param {string[]}  [options.requiredFields]  - Fields that MUST exist in result
   * @param {boolean}   [options.repairOnFail]    - Attempt minor repair (default: true)
   * @param {string}    [options.context]         - Caller context for error messages
   * @returns {object}  Parsed JSON object
   * @throws {AppError} On empty, invalid, or unrepaired response
   */
  static parse(raw, { requiredFields = [], repairOnFail = true, context = 'unknown' } = {}) {
    // 1. Guard empty
    if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
      throw new AppError(
        `[ResponseParser:${context}] AI returned an empty response.`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        { code: PARSE_ERROR_CODES.EMPTY_RESPONSE }
      );
    }

    // 2. Check for safety block markers
    const lower = raw.toLowerCase();
    if (lower.includes('i cannot') && lower.includes('harmful') ||
        lower.includes('safety') && lower.includes('blocked')) {
      throw new AppError(
        `[ResponseParser:${context}] AI response blocked by safety filters.`,
        StatusCodes.UNPROCESSABLE_ENTITY,
        { code: PARSE_ERROR_CODES.SAFETY_BLOCK, raw }
      );
    }

    // 3. Strip markdown code fences (common AI formatting artifact)
    let cleaned = ResponseParser._stripCodeFences(raw);

    // 4. Attempt parse
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (firstErr) {
      if (!repairOnFail) {
        throw new AppError(
          `[ResponseParser:${context}] Invalid JSON — repair disabled. ${firstErr.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR,
          { code: PARSE_ERROR_CODES.INVALID_JSON, raw: cleaned.slice(0, 500) }
        );
      }

      // 5. Attempt repair
      const repaired = ResponseParser._repair(cleaned);
      try {
        parsed = JSON.parse(repaired);
      } catch (repairErr) {
        throw new AppError(
          `[ResponseParser:${context}] JSON repair failed. ${repairErr.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR,
          { code: PARSE_ERROR_CODES.REPAIR_FAILED, raw: cleaned.slice(0, 500) }
        );
      }
    }

    // 6. Validate required fields
    if (requiredFields.length > 0) {
      const missing = requiredFields.filter((f) => !(f in parsed));
      if (missing.length > 0) {
        throw new AppError(
          `[ResponseParser:${context}] Response missing required fields: ${missing.join(', ')}`,
          StatusCodes.INTERNAL_SERVER_ERROR,
          { code: PARSE_ERROR_CODES.VALIDATION_FAILED, missing, parsed }
        );
      }
    }

    // 7. Check for AI-reported error
    if (parsed.error && typeof parsed.error === 'string') {
      throw new AppError(
        `[ResponseParser:${context}] AI reported error: ${parsed.error}`,
        StatusCodes.INTERNAL_SERVER_ERROR,
        { code: parsed.code || PARSE_ERROR_CODES.VALIDATION_FAILED }
      );
    }

    return parsed;
  }

  /**
   * Attempt to parse without throwing — returns { success, data, error }.
   * Useful for non-critical paths where fallback is preferable to a throw.
   *
   * @param {string} raw
   * @param {object} [options]
   * @returns {{ success: boolean, data: object|null, error: string|null }}
   */
  static safeParse(raw, options = {}) {
    try {
      const data = ResponseParser.parse(raw, options);
      return { success: true, data, error: null };
    } catch (err) {
      return { success: false, data: null, error: err.message };
    }
  }

  /**
   * Validate that a parsed object conforms to an expected shape.
   * @param {object}   obj
   * @param {object}   schema  - { fieldName: 'string'|'number'|'boolean'|'array'|'object' }
   * @param {string}   [context]
   * @returns {{ valid: boolean, issues: string[] }}
   */
  static validateShape(obj, schema, context = 'unknown') {
    const issues = [];

    for (const [field, expectedType] of Object.entries(schema)) {
      if (!(field in obj)) {
        issues.push(`Missing field: "${field}"`);
        continue;
      }
      const actual = obj[field];
      const actualType = Array.isArray(actual) ? 'array' : typeof actual;

      if (actualType !== expectedType) {
        issues.push(`"${field}" expected ${expectedType}, got ${actualType}`);
      }
    }

    return { valid: issues.length === 0, issues };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Strip markdown code fences from a string.
   * Handles: ```json ... ```, ``` ... ```, and plain leading/trailing backticks
   */
  static _stripCodeFences(raw) {
    // Remove ```json...``` or ```...``` blocks
    let s = raw.trim();
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    // Remove leading/trailing single backtick remnants
    s = s.replace(/^`/, '').replace(/`$/, '');
    return s.trim();
  }

  /**
   * Attempt minor JSON repairs for common AI formatting mistakes.
   * Repairs attempted (in order):
   *   1. Trailing commas before } or ]
   *   2. Single quotes → double quotes for keys/string values
   *   3. Unquoted keys
   *   4. Truncated JSON (append closing braces)
   */
  static _repair(raw) {
    let s = raw;

    // Remove trailing commas before closing } or ]
    s = s.replace(/,\s*([}\]])/g, '$1');

    // Replace single-quoted strings with double-quoted
    // (Simple heuristic: only when clearly delimiting a key or value)
    s = s.replace(/'([^'\\]*)'/g, '"$1"');

    // If JSON doesn't start with { or [, try to extract the first { ... }
    if (!/^\s*[\[{]/.test(s)) {
      const firstBrace  = s.indexOf('{');
      const firstBracket = s.indexOf('[');
      if (firstBrace  !== -1 && (firstBracket === -1 || firstBrace  < firstBracket)) s = s.slice(firstBrace);
      else if (firstBracket !== -1) s = s.slice(firstBracket);
    }

    // Attempt to close truncated JSON
    const opens  = (s.match(/\{/g) || []).length;
    const closes = (s.match(/\}/g) || []).length;
    if (opens > closes) s += '}'.repeat(opens - closes);

    const aOpens  = (s.match(/\[/g) || []).length;
    const aCloses = (s.match(/\]/g) || []).length;
    if (aOpens > aCloses) s += ']'.repeat(aOpens - aCloses);

    return s;
  }
}
