/**
 * notificationService.js — Enhanced with Persistent Storage & Call Request
 *
 * Centralises all Socket.io emission logic AND persistent notification records.
 *
 * Rooms:
 *   admin_room         — all admin notifications
 *   worker_<workerId>  — per-worker notifications
 *   customer_<id>      — per-customer notifications
 *   b2b_<userId>       — per-b2b-user notifications
 *   workers_broadcast  — all workers (for call requests / open job alerts)
 */

import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { DEMO_NOTIFICATIONS } from '../utils/demoDataStore.js';

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER
// ─────────────────────────────────────────────────────────────────────────────
function buildPayload(title, message, type = 'broadcast', extra = {}) {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    message,
    type, // 'alert' | 'broadcast' | 'system' | 'danger' | 'call_request'
    date: new Date().toLocaleString('en-IN'),
    timestamp: new Date().toISOString(),
    reads: 0,
    ...extra,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyAdmin
// Emit to admin_room AND persist so Admin sees it in notifications list / bell.
// ─────────────────────────────────────────────────────────────────────────────
export function notifyAdmin(io, title, message, type = 'broadcast', extra = {}) {
  const payload = buildPayload(title, message, type, extra);

  // 1. Socket live emission
  if (io) {
    io.to('admin_room').emit('admin_notification', payload);
    // Also emit broadcast fallback so any connected admin socket catches it
    io.emit('admin_notification', payload);
  }

  // 2. In-memory demo store persistence (instant availability)
  const record = {
    _id: payload.id,
    title,
    message,
    type: type === 'call_request' ? 'call_request' : (type || 'alert'),
    targetAudience: 'admin',
    readBy: [],
    isActive: true,
    createdAt: new Date(),
    ...extra,
  };
  DEMO_NOTIFICATIONS.unshift(record);

  // 3. Database persistence if MongoDB is connected
  if (mongoose.connection.readyState === 1) {
    Notification.create({
      title,
      message,
      type: type === 'call_request' ? 'call_request' : (type || 'alert'),
      targetAudience: 'admin',
      isActive: true,
    }).catch((err) => console.warn('Failed to persist admin notification to DB:', err.message));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyWorker
// Emit a direct event to the worker_<workerId> room + persist.
// ─────────────────────────────────────────────────────────────────────────────
export function notifyWorker(io, workerId, title, message, extra = {}) {
  if (!workerId) return;
  const payload = {
    ...buildPayload(title, message, 'system', extra),
    targetWorkerId: workerId.toString(),
  };

  const room = `worker_${workerId}`;
  if (io) {
    io.to(room).emit('worker_notification', payload);
    io.to('workers_broadcast').emit('worker_notification', payload);
  }

  DEMO_NOTIFICATIONS.unshift({
    _id: payload.id,
    title,
    message,
    type: 'system',
    targetAudience: 'workers',
    readBy: [],
    isActive: true,
    createdAt: new Date(),
    targetWorkerId: workerId.toString(),
    ...extra,
  });

  if (mongoose.connection.readyState === 1) {
    Notification.create({
      title,
      message,
      type: 'system',
      targetAudience: 'workers',
      isActive: true,
    }).catch(() => {});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyCustomer
// Emit a direct event to the customer_<customerId> room + persist.
// ─────────────────────────────────────────────────────────────────────────────
export function notifyCustomer(io, customerId, title, message, extra = {}) {
  if (!customerId) return;
  const payload = {
    ...buildPayload(title, message, 'system', extra),
    targetCustomerId: customerId.toString(),
  };

  const room = `customer_${customerId}`;
  if (io) {
    io.to(room).emit('customer_notification', payload);
  }

  DEMO_NOTIFICATIONS.unshift({
    _id: payload.id,
    title,
    message,
    type: 'booking_update',
    targetAudience: 'customers',
    readBy: [],
    isActive: true,
    createdAt: new Date(),
    targetCustomerId: customerId.toString(),
    ...extra,
  });

  if (mongoose.connection.readyState === 1) {
    Notification.create({
      title,
      message,
      type: 'booking_update',
      targetAudience: 'customers',
      isActive: true,
    }).catch(() => {});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyB2B
// Emit a direct event to a b2b user's room.
// ─────────────────────────────────────────────────────────────────────────────
export function notifyB2B(io, userId, title, message, extra = {}) {
  if (!userId) return;
  const room = `b2b_${userId}`;
  const payload = {
    ...buildPayload(title, message, 'system', extra),
    targetUserId: userId.toString(),
  };

  if (io) {
    io.to(room).emit('b2b_notification', payload);
  }

  DEMO_NOTIFICATIONS.unshift({
    _id: payload.id,
    title,
    message,
    type: 'system',
    targetAudience: 'b2b',
    readBy: [],
    isActive: true,
    createdAt: new Date(),
    ...extra,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// broadcastCallRequest
// Emit a call request to ALL workers in a service category AND notify admin.
// ─────────────────────────────────────────────────────────────────────────────
export function broadcastCallRequest(io, requestData) {
  const payload = buildPayload(
    `📞 New Call Request: ${requestData.serviceType || 'General Help'}`,
    `${requestData.customerName || 'A customer'} needs help with ${requestData.serviceType || 'a service'}. Phone: ${requestData.phone}`,
    'call_request',
    {
      requestId: requestData.requestId,
      phone: requestData.phone,
      customerName: requestData.customerName,
      serviceType: requestData.serviceType,
      category: requestData.category,
      customerId: requestData.customerId,
      canAccept: true,
    }
  );

  // 1. Broadcast to all online workers
  if (io) {
    if (requestData.category) {
      io.to(`workers_category_${requestData.category}`).emit('call_request', payload);
    }
    io.to('workers_broadcast').emit('call_request', payload);
  }

  // 2. Also notify admin (live + persistent storage)
  notifyAdmin(
    io,
    `📞 Call Request: ${requestData.serviceType || 'General Help'}`,
    `${requestData.customerName || 'Customer'} (${requestData.phone}) requested a callback for ${requestData.serviceType || 'a service'}.`,
    'call_request',
    {
      requestId: requestData.requestId,
      phone: requestData.phone,
      serviceType: requestData.serviceType,
      customerName: requestData.customerName,
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// notifyCallAccepted
// When a worker accepts a call request, notify customer and admin.
// ─────────────────────────────────────────────────────────────────────────────
export function notifyCallAccepted(io, { requestId, workerId, workerName, customerId, phone }) {
  // Notify customer that their request was accepted
  if (customerId) {
    notifyCustomer(
      io,
      customerId,
      '✅ Worker Found!',
      `${workerName || 'A worker'} has accepted your call request and will contact you at ${phone} shortly.`,
      { requestId, workerId: workerId?.toString(), type: 'call_accepted' }
    );
  }

  // Notify admin
  notifyAdmin(
    io,
    '✅ Call Request Accepted',
    `Worker ${workerName || workerId} accepted call request ${requestId}. Will call ${phone}.`,
    'system',
    { requestId, workerName, phone }
  );

  // Dismiss call_request from all other workers
  if (io) {
    io.to('workers_broadcast').emit('call_request_taken', {
      requestId,
      acceptedByWorkerId: workerId?.toString(),
      acceptedByWorkerName: workerName,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// emitBookingStatus
// Emit a booking status change event to all relevant parties.
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
  io.emit('booking_status_changed', payload); // Fallback

  if (booking.worker) {
    io.to(`worker_${booking.worker._id || booking.worker}`).emit('booking_status_changed', payload);
  }
  if (booking.customer) {
    io.to(`customer_${booking.customer._id || booking.customer}`).emit('booking_status_changed', payload);
  }
}
