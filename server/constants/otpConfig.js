/**
 * otpConfig.js — Centralized OTP Configuration (Phase 1 Batch 7)
 *
 * Configurable parameters for length, expiration, and attempt thresholds.
 * Values can be overridden by environment variables.
 */

export const OTP_CONFIG = {
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH || '6', 10),
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '15', 10),
  MAX_OTP_ATTEMPTS: parseInt(process.env.MAX_OTP_ATTEMPTS || '3', 10),
};
