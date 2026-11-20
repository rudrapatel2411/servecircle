/**
 * notificationService.js — Phase 1 Final Batch
 *
 * Centralises all Socket.io emission logic.
 * Implements proper room architecture:
 *   admin_room         — all admin notifications
 *   worker_<workerId>  — per-worker notifications
 *   customer_<id>      — per-customer notifications
 *
 * Routes must never call req.io directly.
 * Dependency chain: no upstream service imports (leaf node).
 */

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER
// ─────────────────────────────────────────────────────────────────────────────
function buildPayload(title, message, type = 'broadcast') {
  return {
    id: Date.now(),
    title,
    message,
    type, // 'alert' | 'broadcast' | 'system' | 'danger'
    date: new Date().toLocaleString(),
    reads: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyAdmin
// Emit an event to the admin_room Socket.io room.
// ─────────────────────────────────────────────────────────────────────────────
export function notifyAdmin(io, title, message, type = 'broadcast') {
  if (!io) return;
  io.to('admin_room').emit('admin_notification', buildPayload(title, message, type));
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyWorker
// Emit a direct event to the worker_<workerId> room.
// Workers join this room on connect via the 'join_worker' socket event.
// ─────────────────────────────────────────────────────────────────────────────
export function notifyWorker(io, workerId, title, message) {
  if (!io || !workerId) return;
  const room = `worker_${workerId}`;
  io.to(room).emit('worker_notification', {
    ...buildPayload(title, message, 'system'),
    targetWorkerId: workerId.toString(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyCustomer
// Emit a direct event to the customer_<customerId> room.
// Customers join this room on connect via the 'join_customer' socket event.
// ─────────────────────────────────────────────────────────────────────────────
export function notifyCustomer(io, customerId, title, message) {
  if (!io || !customerId) return;
  const room = `customer_${customerId}`;
  io.to(room).emit('customer_notification', {
    ...buildPayload(title, message, 'system'),
    targetCustomerId: customerId.toString(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// emitBookingStatus
// Emit a booking status change event to all relevant parties:
//   - admin_room
//   - worker_<workerId>
//   - customer_<customerId>
// ─────────────────────────────────────────────────────────────────────────────
export function emitBookingStatus(io, booking, prevStatus) {
  if (!io) return;
  const payload = {
    bookingId: booking.bookingId,
    previousStatus: prevStatus,
    currentStatus: booking.status,
    updatedAt: new Date().toISOString(),
  };

  io.to('admin_room').emit('booking_status_changed', payload);

  if (booking.worker) {
    io.to(`worker_${booking.worker._id || booking.worker}`).emit('booking_status_changed', payload);
  }
  if (booking.customer) {
    io.to(`customer_${booking.customer._id || booking.customer}`).emit('booking_status_changed', payload);
  }
}
