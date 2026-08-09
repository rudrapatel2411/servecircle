/**
 * otpService.js — Phase 1 Batch 7
 *
 * Complete OTP Runtime System.
 * Encapsulates generation, expiration, verification, attempt counts, locking, and regeneration.
 * All OTP logic lives exclusively inside this service.
 */

import crypto from 'crypto';
import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { OTP_CONFIG } from '../constants/otpConfig.js';
import { startBooking, completeBooking } from './bookingService.js';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate cryptographically random numeric OTP code of configured length
 */
function generateCode() {
  const len = OTP_CONFIG.OTP_LENGTH;
  const max = 10 ** len;
  const code = crypto.randomInt(0, max);
  return code.toString().padStart(len, '0');
}

/**
 * Compute expiration date timestamp using configured TTL
 */
function calculateExpiration() {
  return new Date(Date.now() + OTP_CONFIG.OTP_EXPIRY_MINUTES * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// PART 1 & 2: GENERATION METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate Start OTP for booking
 */
export async function generateStartOtp(bookingId) {
  const code = generateCode();
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      $set: {
        startOtp: code,
        startOtpExpiresAt: calculateExpiration(),
        startOtpAttempts: 0,
        startOtpVerified: false,
        startOtpLocked: false,
      },
    },
    { new: true }
  );
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
  return { code, booking };
}

/**
 * Generate End OTP for booking
 */
export async function generateEndOtp(bookingId) {
  const code = generateCode();
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      $set: {
        endOtp: code,
        endOtpExpiresAt: calculateExpiration(),
        endOtpAttempts: 0,
        endOtpVerified: false,
        endOtpLocked: false,
      },
    },
    { new: true }
  );
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
  return { code, booking };
}

// ─────────────────────────────────────────────────────────────────────────────
// PART 1, 4, 5: EXPIRATION, ATTEMPT & LOCK MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if OTP has expired
 */
export function checkExpiration(expiresAtDate, label = 'OTP') {
  if (!expiresAtDate) {
    throw new AppError(`${label} has not been generated`, StatusCodes.BAD_REQUEST);
  }
  if (new Date() > new Date(expiresAtDate)) {
    throw new AppError(`${label} has expired. Please request a new OTP.`, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}

/**
 * Lock OTP after maximum failed attempts
 */
export async function lockOtp(bookingId, type) {
  const lockField = type === 'start' ? 'startOtpLocked' : 'endOtpLocked';
  await Booking.findByIdAndUpdate(bookingId, { $set: { [lockField]: true } });
}

/**
 * Increment failed attempt counter and lock if threshold reached
 */
export async function incrementAttempts(bookingId, type) {
  const attemptsField = type === 'start' ? 'startOtpAttempts' : 'endOtpAttempts';
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { $inc: { [attemptsField]: 1 } },
    { new: true }
  );

  const currentAttempts = type === 'start' ? booking.startOtpAttempts : booking.endOtpAttempts;
  if (currentAttempts >= OTP_CONFIG.MAX_OTP_ATTEMPTS) {
    await lockOtp(bookingId, type);
  }
  return currentAttempts;
}

/**
 * Reset attempt counter on successful verification or regeneration
 */
export async function resetAttempts(bookingId, type) {
  const attemptsField = type === 'start' ? 'startOtpAttempts' : 'endOtpAttempts';
  const lockField = type === 'start' ? 'startOtpLocked' : 'endOtpLocked';
  await Booking.findByIdAndUpdate(bookingId, {
    $set: { [attemptsField]: 0, [lockField]: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PART 6: REGENERATION METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Regenerate Start OTP (invalidates old OTP immediately)
 */
export async function regenerateStartOtp(bookingId, requestingUser) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  if (booking.status !== 'arrived') {
    throw new AppError(
      `Start OTP can only be regenerated when booking status is "arrived". Current status: "${booking.status}"`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const { code, booking: updated } = await generateStartOtp(bookingId);
  return { code, bookingId: updated.bookingId, expiresAt: updated.startOtpExpiresAt };
}

/**
 * Regenerate End OTP (invalidates old OTP immediately)
 */
export async function regenerateEndOtp(bookingId, requestingUser) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  if (booking.status !== 'started') {
    throw new AppError(
      `End OTP can only be regenerated when booking status is "started". Current status: "${booking.status}"`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const { code, booking: updated } = await generateEndOtp(bookingId);
  return { code, bookingId: updated.bookingId, expiresAt: updated.endOtpExpiresAt };
}

// ─────────────────────────────────────────────────────────────────────────────
// PART 3 & 8: OTP VERIFICATION & STATE MACHINE INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify Start OTP (Worker inputs customer's Start OTP to start job)
 * State machine requirement: booking status MUST be 'arrived'
 */
export async function verifyStartOtp(bookingId, submittedCode, workerId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  // State Machine Guard (Part 8)
  if (booking.status !== 'arrived') {
    throw new AppError(
      `Start OTP verification is only permitted when booking status is "arrived". Current status: "${booking.status}"`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  // Worker assignment check
  if (!booking.worker || booking.worker.toString() !== workerId.toString()) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  if (booking.startOtpVerified) {
    throw new AppError('Start OTP has already been verified', StatusCodes.BAD_REQUEST);
  }

  if (booking.startOtpLocked || booking.startOtpAttempts >= OTP_CONFIG.MAX_OTP_ATTEMPTS) {
    throw new AppError(
      `Start OTP is locked after ${OTP_CONFIG.MAX_OTP_ATTEMPTS} failed attempts. Customer/Admin must regenerate the OTP.`,
      StatusCodes.TOO_MANY_REQUESTS
    );
  }

  checkExpiration(booking.startOtpExpiresAt, 'Start OTP');

  if (!booking.startOtp || booking.startOtp !== submittedCode.toString().trim()) {
    const attempts = await incrementAttempts(bookingId, 'start');
    const remaining = Math.max(0, OTP_CONFIG.MAX_OTP_ATTEMPTS - attempts);
    if (remaining === 0) {
      throw new AppError(
        `Invalid Start OTP. Maximum ${OTP_CONFIG.MAX_OTP_ATTEMPTS} attempts reached. OTP is now locked.`,
        StatusCodes.TOO_MANY_REQUESTS
      );
    }
    throw new AppError(
      `Invalid Start OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      StatusCodes.BAD_REQUEST
    );
  }

  // Mark verified & reset attempts
  await Booking.findByIdAndUpdate(bookingId, {
    $set: { startOtpVerified: true, startOtpAttempts: 0, startOtpLocked: false },
  });

  // State Machine Transition: arrived → started
  const updatedBooking = await startBooking(bookingId, workerId);
  return updatedBooking;
}

/**
 * Verify End OTP (Worker inputs customer's End OTP to complete job)
 * State machine requirement: booking status MUST be 'started'
 */
export async function verifyEndOtp(bookingId, submittedCode, workerId, io) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  // State Machine Guard (Part 8)
  if (booking.status !== 'started') {
    throw new AppError(
      `End OTP verification is only permitted when booking status is "started". Current status: "${booking.status}"`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  // Worker assignment check
  if (!booking.worker || booking.worker.toString() !== workerId.toString()) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  if (booking.endOtpVerified) {
    throw new AppError('End OTP has already been verified', StatusCodes.BAD_REQUEST);
  }

  if (booking.endOtpLocked || booking.endOtpAttempts >= OTP_CONFIG.MAX_OTP_ATTEMPTS) {
    throw new AppError(
      `End OTP is locked after ${OTP_CONFIG.MAX_OTP_ATTEMPTS} failed attempts. Customer/Admin must regenerate the OTP.`,
      StatusCodes.TOO_MANY_REQUESTS
    );
  }

  checkExpiration(booking.endOtpExpiresAt, 'End OTP');

  if (!booking.endOtp || booking.endOtp !== submittedCode.toString().trim()) {
    const attempts = await incrementAttempts(bookingId, 'end');
    const remaining = Math.max(0, OTP_CONFIG.MAX_OTP_ATTEMPTS - attempts);
    if (remaining === 0) {
      throw new AppError(
        `Invalid End OTP. Maximum ${OTP_CONFIG.MAX_OTP_ATTEMPTS} attempts reached. OTP is now locked.`,
        StatusCodes.TOO_MANY_REQUESTS
      );
    }
    throw new AppError(
      `Invalid End OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      StatusCodes.BAD_REQUEST
    );
  }

  // Mark verified & reset attempts
  await Booking.findByIdAndUpdate(bookingId, {
    $set: { endOtpVerified: true, endOtpAttempts: 0, endOtpLocked: false },
  });

  // State Machine Transition: started → completed
  const updatedBooking = await completeBooking(bookingId, workerId, io);
  return updatedBooking;
}
