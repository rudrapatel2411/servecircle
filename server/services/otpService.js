/**
 * otpService.js — PostgreSQL (Prisma) dual-OTP protocol
 *
 * Start OTP  : worker may begin work only after the customer shares it (arrived → started)
 * End OTP    : worker may finish only after the customer shares it (started → completed)
 *
 * All OTP state lives on the Booking row in PostgreSQL. This service is the only
 * place that generates, verifies, locks, or regenerates OTP codes. Codes are never
 * included in booking list/detail payloads and are never logged.
 */

import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { OTP_CONFIG } from '../constants/otpConfig.js';
import { startBooking, completeBooking } from './bookingService.js';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a cryptographically random numeric OTP code of configured length */
function generateCode() {
  const len = OTP_CONFIG.OTP_LENGTH;
  const max = 10 ** len;
  const code = crypto.randomInt(0, max);
  return code.toString().padStart(len, '0');
}

/** Compute expiration timestamp using configured TTL */
function calculateExpiration() {
  return new Date(Date.now() + OTP_CONFIG.OTP_EXPIRY_MINUTES * 60 * 1000);
}

/** Prisma stores status as an uppercase enum ("EN_ROUTE"); compare in that space */
export function toDbStatus(status) {
  return String(status || '').toUpperCase().replace(/-/g, '_');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Never compare a human booking reference ("SC-2800") to the UUID column. */
function bookingLookupWhere(identifier) {
  const value = String(identifier || '');
  return UUID_RE.test(value)
    ? { OR: [{ id: value }, { bookingId: value }] }
    : { bookingId: value };
}

async function findBookingOrThrow(bookingId) {
  let booking = null;
  try {
    booking = await prisma.booking.findFirst({ where: bookingLookupWhere(bookingId) });
  } catch (err) {
    booking = null;
  }
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
  return booking;
}

function assertOwnerOrAdmin(booking, requestingUser) {
  if (requestingUser?.role === 'admin') return;
  const customerId = booking.customerId;
  const requesterId = requestingUser?._id || requestingUser?.id;
  if (!requesterId || String(customerId) !== String(requesterId)) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/** Generate Start OTP for a booking (invalidates any previous code) */
export async function generateStartOtp(bookingId) {
  const code = generateCode();
  const booking = await findBookingOrThrow(bookingId);
  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      startOtp: code,
      startOtpExpiresAt: calculateExpiration(),
      startOtpAttempts: 0,
      startOtpVerified: false,
      startOtpLocked: false,
    },
  });
  return { code, booking: updated };
}

/** Generate End OTP for a booking (invalidates any previous code) */
export async function generateEndOtp(bookingId) {
  const code = generateCode();
  const booking = await findBookingOrThrow(bookingId);
  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      endOtp: code,
      endOtpExpiresAt: calculateExpiration(),
      endOtpAttempts: 0,
      endOtpVerified: false,
      endOtpLocked: false,
    },
  });
  return { code, booking: updated };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPIRATION, ATTEMPTS, LOCK
// ─────────────────────────────────────────────────────────────────────────────

export function checkExpiration(expiresAtDate, label = 'OTP') {
  if (!expiresAtDate) {
    throw new AppError(`${label} has not been generated`, StatusCodes.BAD_REQUEST);
  }
  if (new Date() > new Date(expiresAtDate)) {
    throw new AppError(`${label} has expired. Please request a new OTP.`, StatusCodes.UNPROCESSABLE_ENTITY);
  }
}

export async function lockOtp(bookingId, type) {
  const lockField = type === 'start' ? 'startOtpLocked' : 'endOtpLocked';
  const booking = await findBookingOrThrow(bookingId);
  await prisma.booking.update({ where: { id: booking.id }, data: { [lockField]: true } });
}

/** Increment failed attempt counter and lock if the threshold is reached */
export async function incrementAttempts(bookingId, type) {
  const attemptsField = type === 'start' ? 'startOtpAttempts' : 'endOtpAttempts';
  const lockField = type === 'start' ? 'startOtpLocked' : 'endOtpLocked';
  const booking = await findBookingOrThrow(bookingId);

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { [attemptsField]: { increment: 1 } },
    select: { [attemptsField]: true },
  });

  const currentAttempts = updated[attemptsField];
  if (currentAttempts >= OTP_CONFIG.MAX_OTP_ATTEMPTS) {
    await prisma.booking.update({ where: { id: booking.id }, data: { [lockField]: true } });
  }
  return currentAttempts;
}

/** Reset attempt counter on successful verification or regeneration */
export async function resetAttempts(bookingId, type) {
  const attemptsField = type === 'start' ? 'startOtpAttempts' : 'endOtpAttempts';
  const lockField = type === 'start' ? 'startOtpLocked' : 'endOtpLocked';
  const booking = await findBookingOrThrow(bookingId);
  await prisma.booking.update({
    where: { id: booking.id },
    data: { [attemptsField]: 0, [lockField]: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REGENERATION
// ─────────────────────────────────────────────────────────────────────────────

export async function regenerateStartOtp(bookingId, requestingUser) {
  const booking = await findBookingOrThrow(bookingId);
  assertOwnerOrAdmin(booking, requestingUser);

  const allowedStatuses = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED'];
  if (!allowedStatuses.includes(toDbStatus(booking.status))) {
    throw new AppError(
      `Start OTP can only be generated after worker accepts or starts journey. Current status: "${String(booking.status).toLowerCase()}"`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const { code, booking: updated } = await generateStartOtp(booking.id);
  return { code, bookingId: updated.bookingId, expiresAt: updated.startOtpExpiresAt };
}

export async function regenerateEndOtp(bookingId, requestingUser) {
  const booking = await findBookingOrThrow(bookingId);
  assertOwnerOrAdmin(booking, requestingUser);

  if (toDbStatus(booking.status) !== 'STARTED') {
    throw new AppError(
      `End OTP can only be regenerated when booking status is "started". Current status: "${String(booking.status).toLowerCase()}"`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const { code, booking: updated } = await generateEndOtp(booking.id);
  return { code, bookingId: updated.bookingId, expiresAt: updated.endOtpExpiresAt };
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION + STATE MACHINE INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify Start OTP (worker enters the customer's Start OTP to begin work).
 * Preconditions: status ARRIVED, assigned worker, code not already used,
 * not locked, not expired.
 */
export async function verifyStartOtp(bookingId, submittedCode, workerId, io = null) {
  const booking = await findBookingOrThrow(bookingId);

  if (toDbStatus(booking.status) !== 'ARRIVED') {
    throw new AppError(
      `Start OTP verification is only permitted when booking status is "arrived". Current status: "${String(booking.status).toLowerCase()}"`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  if (!booking.workerId || String(booking.workerId) !== String(workerId)) {
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

  if (!booking.startOtp || booking.startOtp !== String(submittedCode).trim()) {
    const attempts = await incrementAttempts(booking.id, 'start');
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

  // Consume the code atomically; a concurrent submission loses the race.
  const consumed = await prisma.booking.updateMany({
    where: { id: booking.id, startOtpVerified: false, status: 'ARRIVED' },
    data: { startOtpVerified: true, startOtpAttempts: 0, startOtpLocked: false },
  });
  if (consumed.count === 0) {
    throw new AppError(
      'This Start OTP has already been used or the booking has moved on.',
      StatusCodes.CONFLICT
    );
  }

  // Marking the code verified must never allow a stale code to be replayed.
  await prisma.booking.update({ where: { id: booking.id }, data: { startOtp: null } });

  // State machine: arrived → started (also generates the End OTP)
  return startBooking(booking.id, workerId, io);
}

/**
 * Verify End OTP (worker enters the customer's End OTP to complete the job).
 * Preconditions: status STARTED, assigned worker, code not already used,
 * not locked, not expired.
 */
export async function verifyEndOtp(bookingId, submittedCode, workerId, io) {
  const booking = await findBookingOrThrow(bookingId);

  if (toDbStatus(booking.status) !== 'STARTED') {
    throw new AppError(
      `End OTP verification is only permitted when booking status is "started". Current status: "${String(booking.status).toLowerCase()}"`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  if (!booking.workerId || String(booking.workerId) !== String(workerId)) {
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

  if (!booking.endOtp || booking.endOtp !== String(submittedCode).trim()) {
    const attempts = await incrementAttempts(booking.id, 'end');
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

  const consumed = await prisma.booking.updateMany({
    where: { id: booking.id, endOtpVerified: false, status: 'STARTED' },
    data: { endOtpVerified: true, endOtpAttempts: 0, endOtpLocked: false, endOtp: null },
  });
  if (consumed.count === 0) {
    throw new AppError(
      'This End OTP has already been used or the booking has moved on.',
      StatusCodes.CONFLICT
    );
  }

  // State machine: started → completed
  return completeBooking(booking.id, workerId, io);
}

export default {
  generateStartOtp,
  generateEndOtp,
  checkExpiration,
  lockOtp,
  incrementAttempts,
  resetAttempts,
  regenerateStartOtp,
  regenerateEndOtp,
  verifyStartOtp,
  verifyEndOtp,
};
