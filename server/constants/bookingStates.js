/**
 * Booking State Machine — Single Source of Truth
 *
 * States flow:
 *   pending → assigned → accepted → en-route → arrived → started → completed → paid → closed
 *
 * Cancellation is allowed from any non-terminal state.
 * Terminal states: closed, cancelled
 * Rejected returns a booking to pending (worker declined the job).
 */

// All valid booking states
export const BOOKING_STATUS = {
  PENDING:    'pending',
  ASSIGNED:   'assigned',
  ACCEPTED:   'accepted',
  EN_ROUTE:   'en-route',
  ARRIVED:    'arrived',
  STARTED:    'started',
  COMPLETED:  'completed',
  PAID:       'paid',
  CLOSED:     'closed',
  CANCELLED:  'cancelled',
  REJECTED:   'rejected',
};

// Legal transitions per state
// Key   = current state
// Value = array of states this booking may legally move to
export const BOOKING_TRANSITIONS = {
  pending:    ['assigned', 'cancelled'],
  assigned:   ['accepted', 'rejected', 'cancelled'],
  accepted:   ['en-route', 'cancelled'],
  'en-route': ['arrived', 'cancelled'],
  arrived:    ['started', 'cancelled'],
  started:    ['completed'],
  completed:  ['paid'],
  paid:       ['closed'],
  closed:     [],
  cancelled:  [],
  rejected:   ['pending'],   // re-enters queue for reassignment
};

// States from which cancellation is still permitted
export const CANCELLABLE_STATES = [
  'pending',
  'assigned',
  'accepted',
  'en-route',
  'arrived',
];

// Terminal states — no further transitions
export const TERMINAL_STATES = ['closed', 'cancelled'];

/**
 * Validate that a transition from currentStatus → nextStatus is legal.
 * Throws AppError if the transition is illegal.
 *
 * @param {string} currentStatus - The booking's current status
 * @param {string} nextStatus    - The desired next status
 * @param {import('../middleware/errorHandler.js').AppError} AppError
 * @param {number} StatusCodes   - http-status-codes
 */
export function validateTransition(currentStatus, nextStatus, AppError, StatusCodes) {
  const allowed = BOOKING_TRANSITIONS[currentStatus];

  if (allowed === undefined) {
    throw new AppError(
      `Unknown booking status: "${currentStatus}"`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Illegal booking transition: "${currentStatus}" → "${nextStatus}". ` +
      `Allowed next states: [${allowed.join(', ') || 'none'}]`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }
}

/**
 * Return the timestamp field name for a given status transition.
 * Returns null if no timestamp applies to this transition.
 *
 * @param {string} nextStatus
 * @returns {string|null}
 */
export function transitionTimestampField(nextStatus) {
  const map = {
    assigned:   'assignedAt',
    accepted:   'acceptedAt',
    'en-route': 'enRouteAt',
    arrived:    'arrivedAt',
    started:    'startedAt',
    completed:  'completedAt',
    paid:       'paidAt',
    closed:     'closedAt',
    cancelled:  'cancelledAt',
    rejected:   'rejectedAt',
  };
  return map[nextStatus] || null;
}
