import { AppError } from '../middleware/errorHandler.js';
import { BOOKING_STATES } from '../constants/bookingStates.js';

/**
 * Validate that a booking can transition from `current` to `target`.
 * Throws AppError(400) if invalid.
 */
export const validateTransition = (current, target) => {
  const allowed = BOOKING_STATES[current] || [];
  if (!allowed.includes(target)) {
    throw new AppError(
      `Invalid state transition from '${current}' to '${target}'. Allowed: ${allowed.join(', ') || 'none'}`,
      400
    );
  }
};
