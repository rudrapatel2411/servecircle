/**
 * bookingService.js
 *
 * All booking business logic lives here.
 * Routes call this service and return its results directly.
 *
 * Dependency chain:
 *   bookingService → notificationService
 *   bookingService → otpService
 *   bookingService → assignmentService
 *   bookingService → eventService     (Phase 2)
 *   bookingService → metricsService   (Phase 2)
 *   bookingService → historyService   (Phase 2)
 */

import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import {
  validateTransition,
  transitionTimestampField,
  CANCELLABLE_STATES,
} from '../constants/bookingStates.js';
import { assignWorker, findBestWorker } from './assignmentService.js';
import { notifyAdmin, notifyWorker, notifyCustomer, emitBookingStatus } from './notificationService.js';
import { validateServiceForBooking } from './serviceService.js';
import { generateStartOtp, generateEndOtp } from './otpService.js';
import {
  findDemoBookingById,
  getDemoBookingsForCustomer,
  getDemoBookingsForWorker,
  getAllDemoBookings,
  createDemoBooking,
  updateDemoBooking,
} from '../utils/demoBookingStore.js';

// Phase 2 Batch 1: AI Data Foundation
import { logBookingEvent, EVENT_TYPES } from './eventService.js';
import {
  recordWorkerAssignment, recordWorkerAcceptance, recordWorkerRejection,
  recordWorkerArrival, recordWorkerCompletion, recordWorkerCancellation,
  recordCustomerBooking, recordCustomerCompletion, recordCustomerCancellation,
} from './metricsService.js';
import { captureSnapshot } from './historyService.js';

// Phase 2 Batch 2: Feature Data Pipeline
import {
  syncTrustProfile,
  recordSkillCompletion,
  appendGeoHistory,
  recordBehaviourBooking,
  recordBehaviourCancellation,
  recordDemand,
  generateFeatureRecord,
} from './featureService.js';
import { prisma } from '../config/prisma.js';

function formatPrismaBooking(booking) {
  if (!booking) return null;
  return {
    ...booking,
    _id: booking.id,
    service: booking.serviceName || booking.service,
    customer: booking.customer ? { ...booking.customer, _id: booking.customer.id } : booking.customerId,
    worker: booking.worker ? { ...booking.worker, _id: booking.worker.id } : booking.workerId,
    status: (booking.status || 'PENDING').toLowerCase().replace('_', '-'),
    paymentStatus: (booking.paymentStatus || 'PENDING').toLowerCase(),
    paymentMethod: booking.paymentMethod || 'Wallet',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL: applyTransition
// Atomically apply a validated state transition with race-condition guard.
// This is the single place where Booking status changes at the DB level.
//
// @param {string} bookingId
// @param {string} currentStatus
// @param {string} nextStatus
// @param {object} [extraUpdates]
// @returns {Promise<Booking>}  populated booking document
// ─────────────────────────────────────────────────────────────────────────────
async function applyTransition(bookingId, currentStatus, nextStatus, extraUpdates = {}) {
  validateTransition(currentStatus, nextStatus, AppError, StatusCodes);

  // 1. PostgreSQL (Prisma) Attempt
  try {
    const prismaStatus = nextStatus.toUpperCase().replace('-', '_');
    const updateData = { status: prismaStatus };
    if (extraUpdates.worker) updateData.workerId = extraUpdates.worker;
    if (extraUpdates.paymentStatus) updateData.paymentStatus = extraUpdates.paymentStatus.toUpperCase();
    if (extraUpdates.paymentMethod) updateData.paymentMethod = extraUpdates.paymentMethod;

    const existing = await prisma.booking.findFirst({
      where: { OR: [{ id: bookingId }, { bookingId }] }
    });
    if (existing) {
      const updated = await prisma.booking.update({
        where: { id: existing.id },
        data: updateData,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          worker: { select: { id: true, name: true, phone: true } },
        },
      });
      return formatPrismaBooking(updated);
    }
  } catch (prismaErr) {
    // If not found in Prisma or error, fall through to MongoDB / Demo
  }

  const tsField = transitionTimestampField(nextStatus);
  const update = {
    status: nextStatus,
    ...extraUpdates,
    ...(tsField ? { [tsField]: new Date() } : {}),
  };

  if (mongoose.connection.readyState !== 1) {
    const updated = updateDemoBooking(bookingId, update);
    if (!updated) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    return updated;
  }

  const updated = await Booking.findOneAndUpdate(
    { _id: bookingId, status: currentStatus, isDeleted: { $ne: true } },
    { $set: update },
    { new: true, runValidators: true }
  )
    .populate('customer', 'name email phone')
    .populate('worker', 'name');

  if (!updated) {
    const exists = await Booking.findById(bookingId);
    if (!exists) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    throw new AppError(
      `Transition conflict: booking status changed to "${exists.status}" before this update could be applied.`,
      StatusCodes.CONFLICT
    );
  }

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// createBooking
// Creates a new booking for a customer and attempts auto-assignment (Batch 4).
// Validates service existence, active status & category via serviceService (Batch 6).
//
// @param {object} data          — request body fields
// @param {string} customerId
// @param {object} [io]          — Socket.io server instance
// @param {string} [customerName]
// @returns {Promise<Booking>}
// ─────────────────────────────────────────────────────────────────────────────
export async function createBooking(data, customerId, io, customerName, reqCtx = {}) {
  // Validate service existence, active status and category match
  await validateServiceForBooking(data.service, data.category, data.serviceId);

  // 1. PostgreSQL (Prisma) Creation
  try {
    const count = await prisma.booking.count();
    const bookingId = `SC-${count + 2800}`;

    let matchedService = null;
    if (data.serviceId) {
      matchedService = await prisma.service.findFirst({
        where: { OR: [{ id: data.serviceId }, { serviceId: data.serviceId }] },
      });
    }
    if (!matchedService && data.service) {
      matchedService = await prisma.service.findFirst({
        where: { name: { equals: data.service, mode: 'insensitive' } },
      });
    }

    const amount = Number(data.amount) || 0;
    const created = await prisma.booking.create({
      data: {
        bookingId,
        customerId,
        serviceId: matchedService ? matchedService.id : undefined,
        serviceName: data.service || (matchedService ? matchedService.name : 'General Service'),
        category: data.category || (matchedService ? matchedService.category : 'Home Repairs'),
        description: data.description || '',
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
        scheduledTime: data.scheduledTime || '10:00 AM',
        address: data.address || '',
        city: data.city || 'Mumbai',
        amount,
        platformCommission: Math.round(amount * 0.1 * 100) / 100,
        workerEarnings: Math.round(amount * 0.9 * 100) / 100,
        status: 'PENDING',
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, phone: true } },
      },
    });

    notifyAdmin(
      io,
      'New Booking',
      `Booking ${bookingId} created by ${customerName || 'Customer'}.`,
      'alert'
    );

    return formatPrismaBooking(created);
  } catch (prismaErr) {
    console.warn('[createBooking] Prisma creation fallback:', prismaErr.message);
  }

  if (mongoose.connection.readyState !== 1) {
    const booking = createDemoBooking(data, customerId, customerName);
    notifyAdmin(
      io,
      'New Booking',
      `Booking ${booking.bookingId} created by ${customerName || 'Customer'}.`,
      'alert'
    );
    return booking;
  }

  const count = await Booking.countDocuments();
  const bookingId = `SC-${count + 2800}`;

  const initialTimeline = [{
    event:     EVENT_TYPES.BOOKING_CREATED,
    actorRole: 'customer',
    actor:     customerId,
    timestamp: new Date(),
    metadata:  { service: data.service, category: data.category, amount: data.amount },
  }];

  let booking = await Booking.create({
    ...data,
    bookingId,
    customer: customerId,
    status: 'pending',
    timeline: initialTimeline,
  });

  notifyAdmin(
    io,
    'New Booking',
    `Booking ${bookingId} created by ${customerName || 'Customer'}.`,
    'alert'
  );

  // Phase 2 Batch 1: Log event, record metrics, capture snapshot
  logBookingEvent(EVENT_TYPES.BOOKING_CREATED, booking, { _id: customerId, role: 'customer' }, reqCtx, {
    currentState: 'pending',
  });
  recordCustomerBooking(
    customerId, data.amount, data.category, data.isEmergency, booking.createdAt
  );
  captureSnapshot({
    collection:   'bookings',
    documentId:   booking._id,
    before:       {},
    after:        booking.toObject ? booking.toObject() : booking,
    changedBy:    customerId,
    changedByRole:'customer',
    changeReason: EVENT_TYPES.BOOKING_CREATED,
  });
  // Phase 2 Batch 2: Demand + Behaviour
  recordDemand(booking, 'created');
  recordBehaviourBooking(customerId, booking);

  // Attempt rule-based automatic worker assignment (Batch 4)
  try {
    const bestWorker = await findBestWorker(booking);
    if (bestWorker) {
      booking = await assignBooking(booking._id, bestWorker._id, io, reqCtx);
    }
  } catch (err) {
    console.log(`[AssignmentService] Auto-assignment skipped for ${bookingId}: ${err.message}`);
  }

  return booking;
}

// ─────────────────────────────────────────────────────────────────────────────
// getAllBookings
// Paginated list for admin.
//
// @param {object} opts  — { status, page, limit, search }
// @returns {Promise<{bookings, total, page, pages}>}
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllBookings({ status, page = 1, limit = 20, search } = {}) {
  // 1. Try PostgreSQL (Prisma)
  try {
    const where = {};
    if (status) where.status = status.toUpperCase().replace('-', '_');
    if (search) where.bookingId = { contains: search, mode: 'insensitive' };
    const total = await prisma.booking.count({ where });
    if (total > 0 || mongoose.connection.readyState !== 1) {
      const bookings = await prisma.booking.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          worker: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });
      return {
        bookings: bookings.map(formatPrismaBooking),
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit) || 1,
      };
    }
  } catch (prismaErr) {
    // Fall back
  }

  if (mongoose.connection.readyState !== 1) {
    const all = getAllDemoBookings({ status, search });
    const total = all.length;
    const paginated = all.slice((page - 1) * limit, page * limit);
    return { bookings: paginated, total, page: parseInt(page), pages: Math.ceil(total / limit) || 1 };
  }

  const query = {};
  if (status) query.status = status;
  if (search) query.bookingId = { $regex: search, $options: 'i' };

  const bookings = await Booking.find(query)
    .populate('customer', 'name email phone')
    .populate('worker', 'name email phone')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await Booking.countDocuments(query);
  return { bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) };
}

// ─────────────────────────────────────────────────────────────────────────────
// getCustomerBookings
// Bookings belonging to a specific customer.
//
// @param {string} customerId
// @param {string} [status]
// @returns {Promise<Booking[]>}
// ─────────────────────────────────────────────────────────────────────────────
export async function getCustomerBookings(customerId, status) {
  // 1. Try PostgreSQL (Prisma)
  try {
    const where = { customerId };
    if (status) where.status = status.toUpperCase().replace('-', '_');
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        worker: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (bookings.length > 0 || mongoose.connection.readyState !== 1) {
      return bookings.map(formatPrismaBooking);
    }
  } catch (prismaErr) {
    // Fall back
  }

  if (mongoose.connection.readyState !== 1) {
    return getDemoBookingsForCustomer(customerId, status);
  }

  const query = { customer: customerId };
  if (status) query.status = status;
  return Booking.find(query).populate('worker', 'name rating workerIdCode').sort('-createdAt').lean();
}

// ─────────────────────────────────────────────────────────────────────────────
// getWorkerJobs
// Jobs assigned to a specific worker.
//
// @param {string} workerId
// @param {string} [status]
// @returns {Promise<Booking[]>}
// ─────────────────────────────────────────────────────────────────────────────
export async function getWorkerJobs(workerId, status) {
  // 1. Try PostgreSQL (Prisma)
  try {
    const where = { workerId };
    if (status) where.status = status.toUpperCase().replace('-', '_');
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true, address: true } },
      },
      orderBy: { scheduledDate: 'desc' },
    });
    if (bookings.length > 0 || mongoose.connection.readyState !== 1) {
      return bookings.map(formatPrismaBooking);
    }
  } catch (prismaErr) {
    // Fall back
  }

  if (mongoose.connection.readyState !== 1) {
    return getDemoBookingsForWorker(workerId, status);
  }

  const query = { worker: workerId };
  if (status) query.status = status;
  return Booking.find(query).populate('customer', 'name phone address').sort('-scheduledDate').lean();
}

// ─────────────────────────────────────────────────────────────────────────────
// getBookingById
// Fetch and access-control a single booking.
//
// @param {string} bookingId
// @param {object} requestingUser   — { _id, role }
// @returns {Promise<Booking>}
// ─────────────────────────────────────────────────────────────────────────────
export async function getBookingById(bookingId, requestingUser) {
  // 1. Try PostgreSQL (Prisma)
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingId: bookingId }],
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (booking) {
      const formatted = formatPrismaBooking(booking);
      if (
        requestingUser.role === 'customer' &&
        String(formatted.customerId) !== String(requestingUser._id) &&
        String(formatted.customerId) !== String(requestingUser.id)
      ) {
        throw new AppError('Access denied', StatusCodes.FORBIDDEN);
      }
      if (
        requestingUser.role === 'worker' &&
        formatted.workerId &&
        String(formatted.workerId) !== String(requestingUser._id) &&
        String(formatted.workerId) !== String(requestingUser.id)
      ) {
        throw new AppError('Access denied', StatusCodes.FORBIDDEN);
      }
      return formatted;
    }
  } catch (prismaErr) {
    if (prismaErr instanceof AppError) throw prismaErr;
  }

  if (mongoose.connection.readyState !== 1) {
    const booking = findDemoBookingById(bookingId);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    return booking;
  }

  const booking = await Booking.findById(bookingId)
    .populate('customer', 'name email phone')
    .populate('worker', 'name workerIdCode');

  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  if (
    requestingUser.role === 'customer' &&
    booking.customer._id.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  if (
    requestingUser.role === 'worker' &&
    booking.worker &&
    booking.worker._id.toString() !== requestingUser._id.toString()
  ) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  return booking;
}

// ─────────────────────────────────────────────────────────────────────────────
// updateBookingFields
// Generic update — status field is explicitly blocked.
//
// @param {string} bookingId
// @param {object} updates   — must not contain 'status'
// @returns {Promise<Booking>}
// ─────────────────────────────────────────────────────────────────────────────
export async function updateBookingFields(bookingId, updates) {
  if ('status' in updates) {
    throw new AppError(
      'Status changes must use dedicated workflow endpoints (/assign, /accept, /reject, etc.)',
      StatusCodes.METHOD_NOT_ALLOWED
    );
  }

  if (mongoose.connection.readyState !== 1) {
    const updated = updateDemoBooking(bookingId, updates);
    if (!updated) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    return updated;
  }

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
  return booking;
}

export async function findAnyBooking(bookingId) {
  try {
    const pgBooking = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingId }],
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, phone: true } },
      },
    });
    if (pgBooking) return formatPrismaBooking(pgBooking);
  } catch (err) {}

  if (mongoose.connection.readyState === 1) {
    try {
      const b = await Booking.findById(bookingId).populate('customer', 'name email phone').populate('worker', 'name workerIdCode');
      if (b) return b;
    } catch {}
  }
  return findDemoBookingById(bookingId);
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW OPERATIONS
// Each method encapsulates: fetch → validate → transition → notify
// ─────────────────────────────────────────────────────────────────────────────

export async function assignBooking(bookingId, workerId, io, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  await assignWorker(workerId, booking.category);

  const prevStatus = booking.status;
  const updated = await applyTransition(bookingId, prevStatus, 'assigned', { worker: workerId });

  // Phase 2: timeline entry
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_ASSIGNED, actor: workerId, actorRole: 'system', timestamp: new Date() } },
    });
  }

  notifyAdmin(io, 'Booking Assigned', `Booking ${updated.bookingId} assigned to worker.`, 'broadcast');
  notifyWorker(io, workerId, 'New Job Assigned', `You have been assigned booking ${updated.bookingId}.`);
  notifyCustomer(io, booking.customer?._id || booking.customer, 'Worker Assigned', `A worker has been assigned to your booking ${updated.bookingId}.`);
  emitBookingStatus(io, updated, prevStatus);

  logBookingEvent(EVENT_TYPES.BOOKING_ASSIGNED, updated, { _id: workerId, role: 'worker' }, reqCtx, { previousState: prevStatus });
  recordWorkerAssignment(workerId);
  captureSnapshot({ collection: 'bookings', documentId: bookingId, before: { status: prevStatus }, after: { status: 'assigned', worker: workerId }, changedBy: workerId, changeReason: EVENT_TYPES.BOOKING_ASSIGNED });

  return updated;
}

export async function acceptBooking(bookingId, workerId, io, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const bWorkerId = booking.worker?._id || booking.worker?.id || booking.worker;
  if (!bWorkerId || String(bWorkerId) !== String(workerId)) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  const prevStatus = booking.status;
  const responseTimeMs = booking.assignedAt ? Date.now() - new Date(booking.assignedAt).getTime() : null;
  const updated = await applyTransition(bookingId, prevStatus, 'accepted');

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_ACCEPTED, actor: workerId, actorRole: 'worker', timestamp: new Date() } },
    });
  }
  notifyCustomer(io, booking.customer?._id || booking.customer, 'Booking Accepted', `Worker accepted your booking ${updated.bookingId}.`);
  emitBookingStatus(io, updated, prevStatus);
  logBookingEvent(EVENT_TYPES.BOOKING_ACCEPTED, updated, { _id: workerId, role: 'worker' }, reqCtx, { previousState: prevStatus });
  recordWorkerAcceptance(workerId, responseTimeMs);
  captureSnapshot({ collection: 'bookings', documentId: bookingId, before: { status: prevStatus }, after: { status: 'accepted' }, changedBy: workerId, changeReason: EVENT_TYPES.BOOKING_ACCEPTED });

  return updated;
}

export async function rejectBooking(bookingId, workerId, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const bWorkerId = booking.worker?._id || booking.worker?.id || booking.worker;
  if (!bWorkerId || String(bWorkerId) !== String(workerId)) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  const prevStatus = booking.status;
  const intermediate = await applyTransition(bookingId, prevStatus, 'rejected');

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_REJECTED, actor: workerId, actorRole: 'worker', timestamp: new Date() } },
    });
  }
  logBookingEvent(EVENT_TYPES.BOOKING_REJECTED, intermediate, { _id: workerId, role: 'worker' }, reqCtx, { previousState: prevStatus });
  recordWorkerRejection(workerId);

  return applyTransition(bookingId, intermediate.status, 'pending', { worker: null });
}

export async function setEnRoute(bookingId, workerId, io, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const bWorkerId = booking.worker?._id || booking.worker?.id || booking.worker;
  if (!bWorkerId || String(bWorkerId) !== String(workerId)) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  const prevStatus = booking.status;
  const updated = await applyTransition(bookingId, prevStatus, 'en-route');

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_EN_ROUTE, actor: workerId, actorRole: 'worker', timestamp: new Date() } },
    });
  }
  notifyCustomer(io, booking.customer?._id || booking.customer, 'Worker En Route', `Your worker is on the way for booking ${updated.bookingId}.`);
  emitBookingStatus(io, updated, prevStatus);
  logBookingEvent(EVENT_TYPES.BOOKING_EN_ROUTE, updated, { _id: workerId, role: 'worker' }, reqCtx, { previousState: prevStatus });
  captureSnapshot({ collection: 'bookings', documentId: bookingId, before: { status: prevStatus }, after: { status: 'en-route' }, changedBy: workerId, changeReason: EVENT_TYPES.BOOKING_EN_ROUTE });

  return updated;
}

export async function setArrived(bookingId, workerId, io, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const bWorkerId = booking.worker?._id || booking.worker?.id || booking.worker;
  if (!bWorkerId || String(bWorkerId) !== String(workerId)) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  const prevStatus = booking.status;
  const arrivalTimeMs = booking.acceptedAt ? Date.now() - new Date(booking.acceptedAt).getTime() : null;
  const updated = await applyTransition(bookingId, prevStatus, 'arrived');
  try {
    await generateStartOtp(bookingId);
  } catch (e) {}

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_ARRIVED, actor: workerId, actorRole: 'worker', timestamp: new Date(), metadata: { otpGenerated: true } } },
    });
  }
  notifyCustomer(io, booking.customer?._id || booking.customer, 'Worker Arrived', `Your worker has arrived for booking ${updated.bookingId}. Your Start OTP has been generated.`);
  emitBookingStatus(io, updated, prevStatus);
  logBookingEvent(EVENT_TYPES.BOOKING_ARRIVED, updated, { _id: workerId, role: 'worker' }, reqCtx, { previousState: prevStatus });
  recordWorkerArrival(workerId, arrivalTimeMs);
  captureSnapshot({ collection: 'bookings', documentId: bookingId, before: { status: prevStatus }, after: { status: 'arrived' }, changedBy: workerId, changeReason: EVENT_TYPES.BOOKING_ARRIVED });

  return updated;
}

export async function startBooking(bookingId, workerId, io, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const bWorkerId = booking.worker?._id || booking.worker?.id || booking.worker;
  if (!bWorkerId || String(bWorkerId) !== String(workerId)) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  const prevStatus = booking.status;
  const updated = await applyTransition(bookingId, prevStatus, 'started', { jobStartedAt: new Date() });
  try {
    await generateEndOtp(bookingId);
  } catch (e) {}

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_STARTED, actor: workerId, actorRole: 'worker', timestamp: new Date(), metadata: { endOtpGenerated: true } } },
    });
  }
  notifyCustomer(io, booking.customer?._id || booking.customer, 'Job Started', `Your job has started for booking ${updated.bookingId}. Your End OTP has been generated.`);
  emitBookingStatus(io, updated, prevStatus);
  logBookingEvent(EVENT_TYPES.BOOKING_STARTED, updated, { _id: workerId, role: 'worker' }, reqCtx, { previousState: prevStatus });
  captureSnapshot({ collection: 'bookings', documentId: bookingId, before: { status: prevStatus }, after: { status: 'started' }, changedBy: workerId, changeReason: EVENT_TYPES.BOOKING_STARTED });

  return updated;
}

export async function completeBooking(bookingId, workerId, io, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const bWorkerId = booking.worker?._id || booking.worker?.id || booking.worker;
  if (!bWorkerId || String(bWorkerId) !== String(workerId)) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  const prevStatus = booking.status;
  const completionTimeMs = booking.startedAt ? Date.now() - new Date(booking.startedAt).getTime() : null;
  const now = new Date();
  const updated = await applyTransition(bookingId, prevStatus, 'completed', { jobCompletedAt: now });

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_COMPLETED, actor: workerId, actorRole: 'worker', timestamp: now } },
    });
  }
  notifyAdmin(io, 'Job Completed', `Booking ${updated.bookingId} marked as completed.`, 'broadcast');
  emitBookingStatus(io, updated, prevStatus);
  logBookingEvent(EVENT_TYPES.BOOKING_COMPLETED, updated, { _id: workerId, role: 'worker' }, reqCtx, { previousState: prevStatus });
  recordWorkerCompletion(workerId, completionTimeMs, booking.customer?._id || booking.customer, booking.category, now);
  recordCustomerCompletion(booking.customer?._id || booking.customer, workerId);
  captureSnapshot({ collection: 'bookings', documentId: bookingId, before: { status: prevStatus }, after: { status: 'completed', jobCompletedAt: now }, changedBy: workerId, changeReason: EVENT_TYPES.BOOKING_COMPLETED });
  // Phase 2 Batch 2: skill history, geo history, trust sync, demand
  recordSkillCompletion(workerId, booking.service, booking.category, completionTimeMs, booking.customer?._id || booking.customer);
  appendGeoHistory(workerId, bookingId, booking.city, booking.category, booking.service);
  syncTrustProfile(workerId);
  recordDemand(booking, 'completed');

  return updated;
}

export async function payBooking(bookingId, requestingUser, paymentMethod, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const custId = booking.customer?._id || booking.customer?.id || booking.customer;
  if (
    requestingUser.role === 'customer' &&
    String(custId) !== String(requestingUser._id) &&
    String(custId) !== String(requestingUser.id)
  ) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  const prevStatus = booking.status;
  const extraUpdates = { paymentStatus: 'paid' };
  if (paymentMethod) extraUpdates.paymentMethod = paymentMethod;

  const updated = await applyTransition(bookingId, prevStatus, 'paid', extraUpdates);

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_PAID, actor: requestingUser._id, actorRole: requestingUser.role, timestamp: new Date(), metadata: { paymentMethod } } },
    });
    logBookingEvent(EVENT_TYPES.BOOKING_PAID, updated, requestingUser, reqCtx, { previousState: prevStatus, metadata: { paymentMethod, amount: booking.amount } });
  }

  return updated;
}

export async function closeBooking(bookingId, requestingUser, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const prevStatus = booking.status;
  const updated = await applyTransition(bookingId, prevStatus, 'closed');

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_CLOSED, actor: requestingUser?._id, actorRole: requestingUser?.role, timestamp: new Date() } },
    });
    logBookingEvent(EVENT_TYPES.BOOKING_CLOSED, updated, requestingUser, reqCtx, { previousState: prevStatus });
    // Phase 2 Batch 2: generate ML feature record on close
    generateFeatureRecord(bookingId);
  }

  return updated;
}

export async function cancelBooking(bookingId, requestingUser, reason, io, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const custId = booking.customer?._id || booking.customer?.id || booking.customer;
  if (
    requestingUser.role === 'customer' &&
    String(custId) !== String(requestingUser._id) &&
    String(custId) !== String(requestingUser.id)
  ) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  const workerId = booking.worker?._id || booking.worker?.id || booking.worker;
  if (requestingUser.role === 'worker') {
    if (!workerId || (String(workerId) !== String(requestingUser._id) && String(workerId) !== String(requestingUser.id))) {
      throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
    }
  }

  if (!CANCELLABLE_STATES.includes(booking.status)) {
    throw new AppError(
      `Booking in status "${booking.status}" cannot be cancelled.`,
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const prevStatus = booking.status;
  const updated = await applyTransition(bookingId, prevStatus, 'cancelled', {
    cancelledBy: requestingUser._id || requestingUser.id,
    ...(reason ? { cancellationReason: reason } : {}),
  });

  // Phase 2
  if (mongoose.connection.readyState === 1) {
    await Booking.findByIdAndUpdate(bookingId, {
      $push: { timeline: { event: EVENT_TYPES.BOOKING_CANCELLED, actor: requestingUser._id, actorRole: requestingUser.role, timestamp: new Date(), metadata: { reason } } },
    });
    notifyAdmin(
      io,
      'Booking Cancelled',
      `Booking ${updated.bookingId} cancelled by ${requestingUser.name || requestingUser.role}.`,
      'danger'
    );
    emitBookingStatus(io, updated, prevStatus);
    logBookingEvent(EVENT_TYPES.BOOKING_CANCELLED, updated, requestingUser, reqCtx, { previousState: prevStatus, metadata: { reason } });
    if (booking.worker) recordWorkerCancellation(booking.worker);
    if (requestingUser.role === 'customer') recordCustomerCancellation(requestingUser._id);
    captureSnapshot({ collection: 'bookings', documentId: bookingId, before: { status: prevStatus }, after: { status: 'cancelled', cancellationReason: reason }, changedBy: requestingUser._id, changeReason: EVENT_TYPES.BOOKING_CANCELLED });
    // Phase 2 Batch 2: behaviour + demand
    if (requestingUser.role === 'customer') recordBehaviourCancellation(requestingUser._id, reason);
    if (booking.worker) syncTrustProfile(booking.worker);
    recordDemand(booking, 'cancelled');
  }

  return updated;
}

