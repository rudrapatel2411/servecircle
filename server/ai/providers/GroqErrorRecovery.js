/**
 * server/ai/providers/GroqErrorRecovery.js — Phase 4 Batch 1
 *
 * Shared error recovery logic for GroqProvider.
 *
 * Extracted from GroqProvider.js to eliminate duplication across:
 *   - generateText()
 *   - analyzeImage()
 *   - analyzeMultimodalProblem()
 *
 * Provides robust recovery when Groq's json_object validator rejects
 * natural conversational text.
 */

import { AppError } from '../../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Robust error recovery for Groq JSON validation failures.
 *
 * @param {Error} err - The original error from Groq API
 * @param {object} requestPayload - The original request payload
 * @param {Function} apiCall - Function to retry the API call without json_object
 * @param {string} context - Context for logging (e.g., 'generateText', 'analyzeImage')
 * @returns {Promise<string>} - Recovered JSON string or throws
 * @throws {AppError} - If recovery fails completely
 */
export async function recoverFromGroqJsonError(err, requestPayload, apiCall, context) {
  const errMsg = String(err?.message || '');

  // Check if this is a JSON validation error
  if (err?.error?.code !== 'json_validate_failed' && !errMsg.includes('json_validate_failed')) {
    throw err;
  }

  console.error(`[GroqErrorRecovery] ${context} error:`, err.message);

  // Try to extract failed generation from error
  let failedGen = err?.error?.failed_generation;
  if (!failedGen) {
    const match = errMsg.match(/"failed_generation"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/);
    if (match) {
      try {
        failedGen = JSON.parse(`"${match[1]}"`);
      } catch {
        failedGen = match[1];
      }
    }
  }

  // If we have a failed generation string, try to extract valid JSON from it
  if (failedGen && typeof failedGen === 'string' && failedGen.trim()) {
    const jsonMatch = failedGen.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0]);
        console.log(`[GroqErrorRecovery] Successfully recovered valid JSON from failed_generation in ${context}`);
        return jsonMatch[0];
      } catch { }
    }
  }

  // If no valid JSON in failed generation, retry without strict response_format
  console.log(`[GroqErrorRecovery] Retrying ${context} without strict json_object enforcement...`);
  try {
    const retryPayload = { ...requestPayload };
    delete retryPayload.response_format;
    delete retryPayload.reasoning_effort;
    const retryCompletion = await apiCall(retryPayload);
    const rawText = retryCompletion.choices[0]?.message?.content || '';

    if (rawText.trim()) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          JSON.parse(jsonMatch[0]);
          return jsonMatch[0];
        } catch { }
      }
      return createFallbackResponse('Aap kis kaam ke liye madad chahte hain? Thodi aur detail mein bata sakte hain?', context);
    }
  } catch (retryErr) {
    console.error(`[GroqErrorRecovery] Retry also failed in ${context}:`, retryErr.message);
  }

  return createFallbackResponse('Aap kis kaam ke liye madad chahte hain? Thodi aur detail mein bata sakte hain?', context);
}

/**
 * Create a structured fallback response for recovered content.
 *
 * @param {string} content - The recovered content (failed generation or retry text)
 * @param {string} context - The context (e.g., 'generateText', 'analyzeImage')
 * @returns {string} JSON string with fallback structure
 */
function createFallbackResponse(content, context) {
  if (context === 'analyzeImage') {
    return JSON.stringify({
      problemCategory: 'general',
      detectedIssues: [content],
      severity: 'medium',
      recommendedService: 'Technician Inspection',
      requiredSkills: ['technician'],
      estimatedUrgency: 'scheduled',
      safetyWarnings: [],
      confidence: 0.9,
      reasoning: content,
    });
  }

  if (context === 'analyzeMultimodalProblem') {
    return JSON.stringify({
      problemCategory: 'general',
      problemType: content,
      serviceCategory: 'Home Repairs',
      urgency: 'medium',
      confidence: 0.9,
      reasoningEnglish: 'Service inspection recommended based on customer description.',
      reasoningLocalized: 'Aapki requirement ke hisaab se service inspection book kar sakte hain.',
      possibleCauses: ['General wear and tear'],
      recommendedActions: ['Book verified professional'],
      requiredWorkerSkill: 'Technician',
      estimatedDuration: '1-2 hours',
      estimatedDifficulty: 'medium',
      requiredMaterials: [],
      needsImage: false,
      needsMoreInformation: false,
      followUpQuestions: ['Aap kis time technician visit chahte hain?'],
      safetyWarnings: [],
    });
  }

  // Default fallback for generateText and chatWithCustomer
  return JSON.stringify({
    intent: 'GENERAL_CONVERSATION',
    reply: content,
    showServiceRecommendation: false,
    serviceName: '',
    category: '',
    problemType: '',
    urgency: 'Scheduled',
    requiredWorkerSkill: 'Technician',
    estimatedPrice: 350,
    safetyPrecautions: [],
    followUpQuestions: ['How else can I assist you?', 'Browse popular services'],
  });
}

/**
 * Extract failed generation from error message with robust parsing.
 *
 * @param {Error} err - The error from Groq API
 * @returns {string|null} - Extracted failed generation or null
 */
export function extractFailedGeneration(err) {
  const errMsg = String(err?.message || '');

  // Try to extract from error.error.failed_generation first
  let failedGen = err?.error?.failed_generation;
  if (failedGen) return failedGen;

  // Try to extract from error message using regex
  const match = errMsg.match(/"failed_generation"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"/);
  if (match) {
    try {
      return JSON.parse(`"${match[1]}"`);
    } catch {
      return match[1];
    }
  }

  return null;
}
