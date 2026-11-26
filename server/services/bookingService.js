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

import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import {
  validateTransition,
  transitionTimestampField,
  CANCELLABLE_STATES,
} from '../constants/bookingStates.js';
import { assignWorker, findBestWorker, withAssignmentTransaction } from './assignmentService.js';
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
import { validateAndEnforcePricing } from './pricingEngineService.js';
import { doesCategoryMatchWorker } from '../constants/categoryMatcher.js';
import { findFallbackUserById } from '../utils/demoAuthStore.js';

/** Prisma stores booking status as an uppercase enum ("EN_ROUTE") */
function toDbStatus(status) {
  return String(status || '').toUpperCase().replace(/-/g, '_');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Build a safe Prisma lookup for a booking identifier. The `id` column is a
 * UUID, so a human booking reference ("SC-2800") must never be compared to it.
 */
function bookingLookupWhere(identifier) {
  const value = String(identifier || '');
  return UUID_RE.test(value)
    ? { OR: [{ id: value }, { bookingId: value }] }
    : { bookingId: value };
}

/** Fields a generic PATCH /bookings/:id is allowed to change */
const GENERIC_UPDATE_ALLOWLIST = new Set([
  'description',
  'address',
  'city',
  'scheduledDate',
  'scheduledTime',
]);

function formatPrismaBooking(booking) {
  if (!booking) return null;
  // OTP codes are secrets: never serialise them into booking payloads.
  const { startOtp, endOtp, ...safeBooking } = booking;
  const destCoords = booking.destinationLat && booking.destinationLng
    ? `${booking.destinationLat},${booking.destinationLng}`
    : encodeURIComponent(`${booking.address || ''}, ${booking.city || 'Mumbai'}`);
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${destCoords}`;

  return {
    ...safeBooking,
    _id: booking.id,
    service: booking.serviceName || booking.service,
    customer: booking.customer ? { ...booking.customer, _id: booking.customer.id } : booking.customerId,
    worker: booking.worker ? { ...booking.worker, _id: booking.worker.id } : booking.workerId,
    status: (booking.status || 'PENDING').toLowerCase().replace('_', '-'),
    paymentStatus: (booking.paymentStatus || 'PENDING').toLowerCase(),
    paymentMethod: booking.paymentMethod || 'Wallet',
    navigationUrl,
    hasBeforeProof: Boolean(booking.hasBeforeProof),
    hasAfterProof: Boolean(booking.hasAfterProof),
    isCodCollected: Boolean(booking.isCodCollected),
    codAmountCollected: booking.codAmountCollected || null,
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
async function applyTransition(bookingId, currentStatus, nextStatus, extraUpdates = {}, client = null) {
  validateTransition(currentStatus, nextStatus, AppError, StatusCodes);

  const db = client || prisma;

  // 1. PostgreSQL (Prisma) — authoritative path
  let existing = null;
  try {
    existing = await db.booking.findFirst({
      where: bookingLookupWhere(bookingId),
      select: { id: true, status: true },
    });
  } catch (prismaErr) {
    existing = null;
  }

  if (existing) {
    const data = { status: toDbStatus(nextStatus) };
    if (extraUpdates.worker !== undefined) data.workerId = extraUpdates.worker || null;
    if (extraUpdates.paymentStatus) data.paymentStatus = String(extraUpdates.paymentStatus).toUpperCase();
    if (extraUpdates.paymentMethod) data.paymentMethod = extraUpdates.paymentMethod;

    // Record authoritative lifecycle timestamps
    const now = new Date();
    const upperNext = toDbStatus(nextStatus);
    if (upperNext === 'ASSIGNED') data.assignedAt = now;
    else if (upperNext === 'ACCEPTED') data.acceptedAt = now;
    else if (upperNext === 'EN_ROUTE') data.enRouteAt = now;
    else if (upperNext === 'ARRIVED') data.arrivedAt = now;
    else if (upperNext === 'STARTED') data.startedAt = now;
    else if (upperNext === 'COMPLETED') data.completedAt = now;
    else if (upperNext === 'CANCELLED') {
      data.cancelledAt = now;
      if (extraUpdates.cancelReason) data.cancelReason = extraUpdates.cancelReason;
      if (extraUpdates.cancelledBy) data.cancelledBy = extraUpdates.cancelledBy;
    }

    // Optimistic guard: the row must still be in the status we validated.
    const result = await db.booking.updateMany({
      where: { id: existing.id, status: toDbStatus(currentStatus) },
      data,
    });

    if (result.count === 0) {
      const current = await db.booking.findUnique({
        where: { id: existing.id },
        select: { status: true },
      });
      throw new AppError(
        `Transition conflict: booking status changed to "${String(current?.status || 'unknown').toLowerCase()}" before this update could be applied.`,
        StatusCodes.CONFLICT
      );
    }

    const updated = await db.booking.findUnique({
      where: { id: existing.id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, phone: true } },
      },
    });
    return formatPrismaBooking(updated);
  }

  if (client) {
    // Inside an assignment transaction there is no fallback.
    throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
  }

  const tsField = transitionTimestampField(nextStatus);
  const update = {
    status: nextStatus,
    ...extraUpdates,
    ...(tsField ? { [tsField]: new Date() } : {}),
  };

  const updated = updateDemoBooking(bookingId, update);
  if (!updated) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
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
  // Validate service existence, active status and category match (robust fallback)
  const validService = await validateServiceForBooking(data.service, data.category, data.serviceId);

  // 1. PostgreSQL (Prisma) creation — authoritative persistence path
  try {
    let matchedService = validService;
    if (!matchedService && data.serviceId) {
      const serviceKey = String(data.serviceId);
      matchedService = await prisma.service.findFirst({
        where: UUID_RE.test(serviceKey)
          ? { OR: [{ id: serviceKey }, { serviceId: serviceKey }] }
          : { serviceId: serviceKey },
      });
    }
    if (!matchedService && data.service) {
      matchedService = await prisma.service.findFirst({
        where: { name: { equals: data.service, mode: 'insensitive' } },
      });
    }

    const evaluatedPricing = validateAndEnforcePricing({
      amount: data.amount,
      service: data.service || (matchedService ? matchedService.name : 'General Service'),
      serviceId: matchedService ? matchedService.id : data.serviceId,
      category: (matchedService ? matchedService.category : null) || data.category || 'Home Repairs',
      isEmergency: data.isEmergency,
      pricingParams: data.pricingParams || data.pricingBreakdown?.metadata || {},
      requirements: data.requirements || null,
    });

    const finalAmount = evaluatedPricing.amount;
    const finalCommission = evaluatedPricing.platformCommission;
    const finalEarnings = evaluatedPricing.workerEarnings;
    const pricingBreakdown = evaluatedPricing.pricingBreakdown;

    let formattedDescription = data.description || '';
    if (data.requirements && typeof data.requirements === 'object' && Object.keys(data.requirements).length > 0) {
      const reqTags = Object.entries(data.requirements)
        .filter(([k, v]) => v !== undefined && v !== '' && v !== false)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1')}: ${v}`)
        .join(', ');
      if (reqTags) {
        formattedDescription = formattedDescription ? `${formattedDescription} • Specs: [${reqTags}]` : `Specs: [${reqTags}]`;
      }
    }

    let created = null;

    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      const count = await prisma.booking.count();
      const bookingId = attempt === 0
        ? `SC-${count + 2800}`
        : `SC-${count + 2800}-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
      try {
        created = await prisma.booking.create({
          data: {
            bookingId,
            customerId,
            serviceId: matchedService ? matchedService.id : undefined,
            serviceName: data.service || (matchedService ? matchedService.name : 'General Service'),
            category: (matchedService ? matchedService.category : null) || data.category || 'Home Repairs',
            description: formattedDescription,
            scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
            scheduledTime: data.scheduledTime || '10:00 AM',
            address: data.address || '',
            city: data.city || 'Mumbai',
            amount: finalAmount,
            platformCommission: finalCommission,
            workerEarnings: finalEarnings,
            pricingBreakdown,
            status: 'PENDING',
          },
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            worker: { select: { id: true, name: true, phone: true } },
          },
        });
      } catch (createErr) {
        // Booking ID collision (unique constraint) — retry with a time suffix.
        if (createErr.code !== 'P2002' || attempt === 2) throw createErr;
      }
    }

    if (!created) {
      throw new AppError('Could not allocate a booking ID', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    notifyAdmin(
      io,
      'New Booking',
      `Booking ${created.bookingId} created by ${customerName || 'Customer'}.`,
      'alert'
    );

    // Broadcast open 15km job alert to matching specialists
    if (io) {
      const workerAlertPayload = {
        id: `notif_${Date.now()}_${created.bookingId}`,
        bookingId: created.bookingId,
        _id: created.id,
        title: `⚡ New ${created.category} Request (Within 15 km)`,
        message: `${created.serviceName} requested by ${customerName || 'Customer'} at ${created.address || 'Ahmedabad'}. Tap to review & accept.`,
        type: 'booking_request',
        category: created.category,
        service: created.serviceName,
        targetCategory: created.category,
        targetRole: 'worker',
        canAccept: true,
        amount: created.amount,
        address: created.address,
        customerName: customerName || 'Customer',
        scheduledTime: created.scheduledTime,
        date: new Date().toLocaleString('en-IN'),
      };
      if (created.category) {
        io.to(`workers_category_${created.category}`).emit('worker_notification', workerAlertPayload);
        io.to(`workers_category_${created.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`).emit('worker_notification', workerAlertPayload);
      } else {
        io.to('workers_broadcast').emit('worker_notification', workerAlertPayload);
      }
    }

    const formatted = formatPrismaBooking(created);

    // In ServeCircle workflow, new bookings enter the open 15km broadcast pool for nearby specialists to claim.
    // They are NOT auto-assigned synchronously; workers review and accept from their panel.
    console.log(`[AssignmentService] Booking ${created.bookingId} queued in 15km broadcast pool for specialist claiming.`);
    return formatted;
  } catch (prismaErr) {
    console.warn('[createBooking] Prisma creation fallback:', prismaErr.message);
  }

  const booking = createDemoBooking(data, customerId, customerName);
  notifyAdmin(
    io,
    'New Booking',
    `Booking ${booking.bookingId} created by ${customerName || 'Customer'}.`,
    'alert'
  );

  if (io) {
    const workerAlertPayload = {
      id: `notif_${Date.now()}_${booking.bookingId}`,
      bookingId: booking.bookingId,
      _id: booking._id,
      title: `⚡ New ${booking.category} Request (Within 15 km)`,
      message: `${booking.service} requested by ${customerName || 'Customer'} at ${booking.address || 'Ahmedabad'}. Tap to review & accept.`,
      type: 'booking_request',
      category: booking.category,
      service: booking.service,
      targetCategory: booking.category,
      targetRole: 'worker',
      canAccept: true,
      amount: booking.amount,
      address: booking.address,
      customerName: customerName || 'Customer',
      scheduledTime: booking.scheduledTime,
      date: new Date().toLocaleString('en-IN'),
    };
    if (booking.category) {
      io.to(`workers_category_${booking.category}`).emit('worker_notification', workerAlertPayload);
      io.to(`workers_category_${booking.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`).emit('worker_notification', workerAlertPayload);
    } else {
      io.to('workers_broadcast').emit('worker_notification', workerAlertPayload);
    }
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
  // 1. PostgreSQL (Prisma)
  try {
    const where = {};
    if (status) where.status = status.toUpperCase().replace('-', '_');
    if (search) where.bookingId = { contains: search, mode: 'insensitive' };
    const total = await prisma.booking.count({ where });
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
  } catch (prismaErr) {
    const all = getAllDemoBookings({ status, search });
    const total = all.length;
    const paginated = all.slice((page - 1) * limit, page * limit);
    return { bookings: paginated, total, page: parseInt(page), pages: Math.ceil(total / limit) || 1 };
  }
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
  // 1. PostgreSQL (Prisma)
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
    return bookings.map(formatPrismaBooking);
  } catch (prismaErr) {
    return getDemoBookingsForCustomer(customerId, status);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getWorkerJobs
// Jobs assigned to a specific worker.
//
// @param {string} workerId
// @param {string} [status]
// @returns {Promise<Booking[]>}
// ─────────────────────────────────────────────────────────────────────────────
export async function getWorkerJobs(workerId, status, workerCategory = null) {
  let resolvedWorkerCat = workerCategory || findFallbackUserById(workerId)?.serviceCategory || '';
  if (!resolvedWorkerCat && workerId) {
    try {
      const profile = await prisma.workerProfile.findUnique({
        where: { userId: String(workerId) },
        select: { serviceCategory: true },
      });
      if (profile?.serviceCategory) resolvedWorkerCat = profile.serviceCategory;
    } catch {}
  }

  // 1. PostgreSQL (Prisma)
  try {
    let where = {};
    const norm = status ? status.toLowerCase() : null;
    if (norm === 'pending') {
      where.OR = [
        { workerId },
        { workerId: null, status: 'PENDING' },
      ];
    } else if (norm && norm !== 'all') {
      where.workerId = workerId;
      where.status = norm.toUpperCase().replace('-', '_');
    } else {
      where.OR = [
        { workerId },
        { workerId: null, status: 'PENDING' },
      ];
    }
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { scheduledDate: 'desc' }],
    });
    const scopedBookings = resolvedWorkerCat
      ? bookings.filter((b) => {
          if (b.workerId && String(b.workerId) === String(workerId)) {
            return doesCategoryMatchWorker(resolvedWorkerCat, b.category, b.serviceName);
          }
          return doesCategoryMatchWorker(resolvedWorkerCat, b.category, b.serviceName);
        })
      : bookings;
    return scopedBookings.map(formatPrismaBooking);
  } catch (prismaErr) {
    return getDemoBookingsForWorker(workerId, status, resolvedWorkerCat);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getBookingById
// Fetch and access-control a single booking.
//
// @param {string} bookingId
// @param {object} requestingUser   — { _id, role }
// @returns {Promise<Booking>}
// ─────────────────────────────────────────────────────────────────────────────
function assertBookingReadAccess(booking, requestingUser) {
  const role = requestingUser?.role;
  const requesterId = String(requestingUser?._id || requestingUser?.id || '');

  if (role === 'admin') return;

  if (role === 'customer' || role === 'b2b') {
    if (!requesterId || String(booking.customerId) !== requesterId) {
      throw new AppError('Access denied', StatusCodes.FORBIDDEN);
    }
    return;
  }

  if (role === 'worker') {
    if (!booking.workerId || String(booking.workerId) !== requesterId) {
      throw new AppError('Access denied', StatusCodes.FORBIDDEN);
    }
    return;
  }

  throw new AppError('Access denied', StatusCodes.FORBIDDEN);
}

export async function getBookingById(bookingId, requestingUser) {
  // 1. Try PostgreSQL (Prisma)
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        ...bookingLookupWhere(bookingId),
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (booking) {
      const formatted = formatPrismaBooking(booking);
      assertBookingReadAccess(formatted, requestingUser);
      return formatted;
    }
  } catch (prismaErr) {
    if (prismaErr instanceof AppError) throw prismaErr;
  }

  const booking = findDemoBookingById(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
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
export async function updateBookingFields(bookingId, updates, requestingUser) {
  if ('status' in (updates || {})) {
    throw new AppError(
      'Status changes must use dedicated workflow endpoints (/assign, /accept, /reject, etc.)',
      StatusCodes.METHOD_NOT_ALLOWED
    );
  }

  // Field allowlist: amounts, assignment, payment and status are never generic.
  const safeUpdates = {};
  for (const [field, value] of Object.entries(updates || {})) {
    if (!GENERIC_UPDATE_ALLOWLIST.has(field) || value === undefined) continue;
    safeUpdates[field] = value;
  }

  if (Object.keys(safeUpdates).length === 0) {
    throw new AppError(
      `No updatable fields supplied. Allowed fields: ${[...GENERIC_UPDATE_ALLOWLIST].join(', ')}`,
      StatusCodes.BAD_REQUEST
    );
  }

  if (safeUpdates.scheduledDate !== undefined) {
    const parsed = new Date(safeUpdates.scheduledDate);
    if (isNaN(parsed.getTime())) {
      throw new AppError('scheduledDate must be a valid date', StatusCodes.UNPROCESSABLE_ENTITY);
    }
    safeUpdates.scheduledDate = parsed;
  }

  if (safeUpdates.address !== undefined) {
    const address = String(safeUpdates.address).trim();
    if (!address) throw new AppError('Address cannot be empty', StatusCodes.UNPROCESSABLE_ENTITY);
    safeUpdates.address = address;
  }

  // 1. PostgreSQL (Prisma)
  let existing = null;
  try {
    existing = await prisma.booking.findFirst({
      where: bookingLookupWhere(bookingId),
    });
  } catch (prismaErr) {
    existing = null;
  }

  if (existing) {
    const requesterId = requestingUser?._id || requestingUser?.id;
    const role = requestingUser?.role;
    const ownsBooking = String(existing.customerId) === String(requesterId);

    if (role !== 'admin' && !(('customer' === role || role === 'b2b') && ownsBooking)) {
      throw new AppError('Access denied', StatusCodes.FORBIDDEN);
    }

    const updated = await prisma.booking.update({
      where: { id: existing.id },
      data: safeUpdates,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, phone: true } },
      },
    });
    return formatPrismaBooking(updated);
  }

  const fallback = updateDemoBooking(bookingId, safeUpdates);
  if (!fallback) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
  return fallback;
}

export async function findAnyBooking(bookingId) {
  try {
    const pgBooking = await prisma.booking.findFirst({
      where: {
        ...bookingLookupWhere(bookingId),
      },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        worker: { select: { id: true, name: true, phone: true } },
      },
    });
    if (pgBooking) return formatPrismaBooking(pgBooking);
  } catch (err) {}

  return findDemoBookingById(bookingId);
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW OPERATIONS
// Each method encapsulates: fetch → validate → transition → notify
// ─────────────────────────────────────────────────────────────────────────────

export async function assignBooking(bookingId, workerId, io, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  // Friendly early validation (category match, eligibility, obvious busy state)
  await assignWorker(workerId, booking.category, booking.serviceId);

  const prevStatus = booking.status;

  // Serialisable transaction: re-check "worker is free" at the same instant the
  // assignment is committed, so concurrent bookings cannot overbook a worker.
  const updated = await withAssignmentTransaction(async (tx) => {
    const busy = await tx.booking.findFirst({
      where: {
        workerId,
        OR: [
          { status: { in: ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'STARTED'] } },
          { status: 'COMPLETED', paymentStatus: { not: 'PAID' } },
        ],
      },
      select: { id: true },
    });
    if (busy) {
      throw new AppError(
        'Worker is currently busy with another active booking',
        StatusCodes.CONFLICT
      );
    }
    return applyTransition(bookingId, prevStatus, 'assigned', { worker: workerId }, tx);
  });

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
  if (bWorkerId && String(bWorkerId) !== String(workerId)) {
    throw new AppError('This booking is already claimed by another specialist', StatusCodes.CONFLICT);
  }

  const prevStatus = booking.status;
  const responseTimeMs = booking.assignedAt ? Date.now() - new Date(booking.assignedAt).getTime() : null;
  const updated = await applyTransition(bookingId, prevStatus, 'accepted', { worker: String(workerId) });

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
  if (bWorkerId && String(bWorkerId) !== String(workerId)) {
    throw new AppError('This booking is not assigned to you', StatusCodes.FORBIDDEN);
  }

  // If unassigned broadcast job, decline for this specialist while keeping open in pool
  if (!bWorkerId) {
    recordWorkerRejection(workerId);
    logBookingEvent(EVENT_TYPES.BOOKING_REJECTED, booking, { _id: workerId, role: 'worker' }, reqCtx);
    return { ...booking, status: 'pending', declinedBy: workerId };
  }

  const prevStatus = booking.status;
  const intermediate = await applyTransition(bookingId, prevStatus, 'rejected');

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
  } catch (e) {
    // Arrival is committed; the customer can regenerate a Start OTP from the
    // tracking page, so surface the failure instead of hiding it.
    console.warn(`[setArrived] Start OTP generation failed for ${bookingId}: ${e.message}`);
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

  // Start OTP is mandatory: the customer's arrival code authorises work to begin.
  if (!booking.startOtpVerified) {
    throw new AppError(
      'The customer Start OTP must be verified before this job can start.',
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const prevStatus = booking.status;
  const updated = await applyTransition(bookingId, prevStatus, 'started', { jobStartedAt: new Date() });
  try {
    await generateEndOtp(bookingId);
  } catch (e) {
    console.warn(`[startBooking] End OTP generation failed for ${bookingId}: ${e.message}`);
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

  // End OTP is mandatory: the customer's handover code authorises completion.
  if (!booking.endOtpVerified) {
    throw new AppError(
      'The customer End OTP must be verified before this job can be completed.',
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const updated = await applyTransition(bookingId, prevStatus, 'completed', { jobCompletedAt: now });

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

  // Legacy timeline entries live on the Mongo booking document; Postgres
  // bookings have no timeline column, so status history is emitted as events.
  logBookingEvent(EVENT_TYPES.BOOKING_PAID, updated, requestingUser, reqCtx, { previousState: prevStatus, metadata: { paymentMethod, amount: booking.amount } });

  return updated;
}

export async function closeBooking(bookingId, requestingUser, reqCtx = {}) {
  const booking = await findAnyBooking(bookingId);
  if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

  const prevStatus = booking.status;
  const updated = await applyTransition(bookingId, prevStatus, 'closed');

  logBookingEvent(EVENT_TYPES.BOOKING_CLOSED, updated, requestingUser, reqCtx, { previousState: prevStatus });
  // Phase 2 Batch 2: generate ML feature record on close
  generateFeatureRecord(bookingId);

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

  return updated;
}

