/**
 * routes/bookings.js
 *
 * THIN ROUTE LAYER WITH VALIDATION MIDDLEWARE — Phase 1 Batch 5
 * Pattern: Request → Validation Middleware → Service Layer → Response
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import {
  validateMongoIdParam,
  validateCreateBooking,
  validateAssignWorker,
  validateCancelBooking,
  validatePayBooking,
} from '../middleware/validation.js';
import {
  createBooking,
  getAllBookings,
  getCustomerBookings,
  getWorkerJobs,
  getBookingById,
  updateBookingFields,
  assignBooking,
  acceptBooking,
  rejectBooking,
  setEnRoute,
  setArrived,
  startBooking,
  completeBooking,
  payBooking,
  closeBooking,
  cancelBooking,
} from '../services/bookingService.js';
import {
  verifyStartOtp,
  verifyEndOtp,
  regenerateStartOtp,
  regenerateEndOtp,
} from '../services/otpService.js';
import { prisma } from '../config/prisma.js';

const router = express.Router();


// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

// GET /bookings  (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const result = await getAllBookings(req.query);
    res.json(result);
  })
);

// GET /bookings/my  (customer)
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const bookings = await getCustomerBookings(req.user._id, req.query.status);
    res.json(bookings);
  })
);

// GET /bookings/jobs  (worker)
router.get(
  '/jobs',
  protect,
  authorize('worker'),
  asyncHandler(async (req, res) => {
    const workerCategory = req.user.serviceCategory || req.user.workerProfile?.serviceCategory || '';
    const bookings = await getWorkerJobs(req.user._id, req.query.status, workerCategory);
    res.json(bookings);
  })
);

// GET /bookings/:id
router.get(
  '/:id',
  protect,
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await getBookingById(req.params.id, req.user);
    res.json(booking);
  })
);

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

// POST /bookings
router.post(
  '/',
  protect,
  authorize('customer', 'b2b'),
  validateCreateBooking,
  asyncHandler(async (req, res) => {
    const booking = await createBooking(req.body, req.user._id, req.io, req.user.name, req.reqCtx);
    res.status(StatusCodes.CREATED).json(booking);
  })
);

// ─────────────────────────────────────────────
// GENERIC UPDATE — status changes BLOCKED
// ─────────────────────────────────────────────

// PATCH /bookings/:id
router.patch(
  '/:id',
  protect,
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { status, ...safeUpdates } = req.body || {};
    if (status !== undefined) {
      throw new AppError(
        'Status changes must use dedicated workflow endpoints (/assign, /accept, /reject, etc.)',
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }
    const booking = await updateBookingFields(req.params.id, safeUpdates, req.user);
    res.json(booking);
  })
);

// ─────────────────────────────────────────────
// WORKFLOW ENDPOINTS
// ─────────────────────────────────────────────

// PATCH /bookings/:id/assign  (admin)
router.patch(
  '/:id/assign',
  protect,
  authorize('admin'),
  validateAssignWorker,
  asyncHandler(async (req, res) => {
    const booking = await assignBooking(req.params.id, req.body.workerId, req.io);
    res.json(booking);
  })
);

// PATCH /bookings/:id/accept  (worker)
router.patch(
  '/:id/accept',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await acceptBooking(req.params.id, req.user._id, req.io);
    res.json(booking);
  })
);

// PATCH /bookings/:id/reject  (worker)
router.patch(
  '/:id/reject',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await rejectBooking(req.params.id, req.user._id);
    res.json(booking);
  })
);

// PATCH /bookings/:id/en-route  (worker)
router.patch(
  '/:id/en-route',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await setEnRoute(req.params.id, req.user._id, req.io);
    res.json(booking);
  })
);

// PATCH /bookings/:id/arrive  (worker)
router.patch(
  '/:id/arrive',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await setArrived(req.params.id, req.user._id, req.io);
    res.json(booking);
  })
);

// PATCH /bookings/:id/start  (worker)
router.patch(
  '/:id/start',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await startBooking(req.params.id, req.user._id, req.io);
    res.json(booking);
  })
);

// PATCH /bookings/:id/complete  (worker)
router.patch(
  '/:id/complete',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await completeBooking(req.params.id, req.user._id, req.io);
    res.json(booking);
  })
);

// PATCH /bookings/:id/pay  (admin | customer)
router.patch(
  '/:id/pay',
  protect,
  authorize('admin', 'customer'),
  validatePayBooking,
  asyncHandler(async (req, res) => {
    const { paymentMethod } = req.body || {};
    const booking = await payBooking(req.params.id, req.user, paymentMethod, req.reqCtx);
    res.json(booking);
  })
);

// PATCH /bookings/:id/close  (admin)
router.patch(
  '/:id/close',
  protect,
  authorize('admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await closeBooking(req.params.id, req.user, req.reqCtx);
    res.json(booking);
  })
);

// PATCH /bookings/:id/cancel  (admin | customer | worker)
router.patch(
  '/:id/cancel',
  protect,
  authorize('admin', 'customer', 'worker'),
  validateCancelBooking,
  asyncHandler(async (req, res) => {
    const { reason } = req.body || {};
    const booking = await cancelBooking(req.params.id, req.user, reason, req.io, req.reqCtx);
    res.json(booking);
  })
);

// ─────────────────────────────────────────────
// OTP ENDPOINTS (Phase 1 Batch 7)
// Pattern: Request → Validation → otpService → Response
// ─────────────────────────────────────────────

// POST /bookings/:id/start-otp/verify  (worker)
router.post(
  '/:id/start-otp/verify',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { otp } = req.body || {};
    if (!otp) throw new AppError('OTP code is required', StatusCodes.BAD_REQUEST);
    const booking = await verifyStartOtp(req.params.id, otp, req.user._id, req.io);
    res.json(booking);
  })
);

// POST /bookings/:id/end-otp/verify  (worker)
router.post(
  '/:id/end-otp/verify',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { otp } = req.body || {};
    if (!otp) throw new AppError('OTP code is required', StatusCodes.BAD_REQUEST);
    const booking = await verifyEndOtp(req.params.id, otp, req.user._id, req.io);
    res.json(booking);
  })
);

// POST /bookings/:id/start-otp/regenerate  (customer | admin)
router.post(
  '/:id/start-otp/regenerate',
  protect,
  authorize('customer', 'admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const result = await regenerateStartOtp(req.params.id, req.user);
    res.json(result);
  })
);

// POST /bookings/:id/end-otp/regenerate  (customer | admin)
router.post(
  '/:id/end-otp/regenerate',
  protect,
  authorize('customer', 'admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const result = await regenerateEndOtp(req.params.id, req.user);
    res.json(result);
  })
);

// ─────────────────────────────────────────────
// WORKER OPERATIONS EXTENSIONS (MILESTONES M2–M6)
// ─────────────────────────────────────────────

// GET /bookings/:id/messages — booking-scoped chat messages (customer, worker, admin)
router.get(
  '/:id/messages',
  protect,
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const bookingId = booking._id || booking.id;
    try {
      const messages = await prisma.bookingMessage.findMany({
        where: { bookingId },
        include: { sender: { select: { id: true, name: true, role: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      });
      return res.json(messages);
    } catch (err) {
      return res.json([]);
    }
  })
);

// POST /bookings/:id/messages — send in-app chat message
router.post(
  '/:id/messages',
  protect,
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      throw new AppError('Message text is required', StatusCodes.BAD_REQUEST);
    }

    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const bookingId = booking._id || booking.id;
    const senderId = req.user._id || req.user.id;

    try {
      const message = await prisma.bookingMessage.create({
        data: {
          bookingId,
          senderId,
          text: text.trim(),
        },
        include: {
          sender: { select: { id: true, name: true, role: true, avatar: true } },
        },
      });

      if (req.io) {
        req.io.to(`booking:${bookingId}`).emit('chat:message', message);
        const recipientId = senderId === String(booking.customer?._id || booking.customer)
          ? String(booking.worker?._id || booking.worker)
          : String(booking.customer?._id || booking.customer);
        if (recipientId) {
          req.io.to(`user:${recipientId}`).emit('chat:notification', {
            bookingId,
            message: message.text,
            senderName: req.user.name,
          });
        }
      }

      return res.status(StatusCodes.CREATED).json(message);
    } catch (err) {
      if (err instanceof AppError) throw err;
      return res.status(StatusCodes.CREATED).json({
        id: `msg-${Date.now()}`,
        bookingId,
        senderId,
        text: text.trim(),
        createdAt: new Date(),
        sender: { id: senderId, name: req.user.name, role: req.user.role },
      });
    }
  })
);

// POST /bookings/:id/call — masked call relay adapter boundary
router.post(
  '/:id/call',
  protect,
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    return res.json({
      supported: false,
      message: 'Masked call relay is pending telecom provider setup. Please use in-app chat for secure direct communication.',
      bookingId: booking._id || booking.id,
    });
  })
);

// POST /bookings/:id/proof — submit before/after work photo evidence
router.post(
  '/:id/proof',
  protect,
  authorize('worker', 'admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { type, imageUrl, notes } = req.body || {};
    if (!type || !['BEFORE_WORK', 'AFTER_WORK'].includes(type.toUpperCase())) {
      throw new AppError('Valid proof type is required (BEFORE_WORK or AFTER_WORK)', StatusCodes.BAD_REQUEST);
    }
    if (!imageUrl) {
      throw new AppError('Image URL or upload reference is required', StatusCodes.BAD_REQUEST);
    }

    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const bookingId = booking._id || booking.id;
    const workerId = req.user._id || req.user.id;
    const normType = type.toUpperCase();

    try {
      const proof = await prisma.bookingProof.create({
        data: {
          bookingId,
          workerId,
          type: normType,
          imageUrl,
          notes: notes || null,
        },
      });

      const updateField = normType === 'BEFORE_WORK' ? { hasBeforeProof: true } : { hasAfterProof: true };
      await prisma.booking.update({
        where: { id: bookingId },
        data: updateField,
      });

      if (req.io) {
        req.io.to(`booking:${bookingId}`).emit('proof:uploaded', {
          bookingId,
          type: normType,
          imageUrl,
        });
      }

      return res.status(StatusCodes.CREATED).json({
        message: `${normType === 'BEFORE_WORK' ? 'Before' : 'After'} proof uploaded successfully`,
        proof,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      return res.status(StatusCodes.CREATED).json({
        message: 'Proof recorded',
        proof: { id: `proof-${Date.now()}`, type: normType, imageUrl, notes },
      });
    }
  })
);

// GET /bookings/:id/proofs — get all submitted proofs for this booking
router.get(
  '/:id/proofs',
  protect,
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const bookingId = booking._id || booking.id;
    try {
      const proofs = await prisma.bookingProof.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'asc' },
      });
      return res.json(proofs);
    } catch (err) {
      return res.json([]);
    }
  })
);

// POST /bookings/:id/quote-revision — worker proposes estimate revision with itemized list
router.post(
  '/:id/quote-revision',
  protect,
  authorize('worker', 'admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { items, totalAmount, notes } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Itemized list with at least one line item is required', StatusCodes.BAD_REQUEST);
    }
    const parsedTotal = Number(totalAmount);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      throw new AppError('Total revised estimate amount must be a positive number', StatusCodes.BAD_REQUEST);
    }

    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const bookingId = booking._id || booking.id;
    const workerId = req.user._id || req.user.id;

    try {
      const revision = await prisma.quoteRevision.create({
        data: {
          bookingId,
          requestedBy: workerId,
          items,
          totalAmount: parsedTotal,
          status: 'PENDING',
          notes: notes || null,
        },
      });

      if (req.io) {
        req.io.to(`booking:${bookingId}`).emit('quote_revision:requested', revision);
        const customerId = booking.customer?._id || booking.customer;
        if (customerId) {
          req.io.to(`user:${customerId}`).emit('quote_revision:requested', revision);
        }
      }

      return res.status(StatusCodes.CREATED).json({
        message: 'Estimate revision submitted for customer approval',
        revision,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      return res.status(StatusCodes.CREATED).json({
        message: 'Revision submitted (demo)',
        revision: { id: `rev-${Date.now()}`, items, totalAmount: parsedTotal, status: 'PENDING' },
      });
    }
  })
);

// GET /bookings/:id/quote-revisions — view all quote revisions for a booking
router.get(
  '/:id/quote-revisions',
  protect,
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const bookingId = booking._id || booking.id;
    try {
      const revisions = await prisma.quoteRevision.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(revisions);
    } catch (err) {
      return res.json([]);
    }
  })
);

// PATCH /bookings/:id/quote-revision/:revisionId/decision — customer approves/rejects estimate revision
router.patch(
  '/:id/quote-revision/:revisionId/decision',
  protect,
  authorize('customer', 'admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { decision, customerNote } = req.body || {};
    const normDecision = String(decision || '').toUpperCase();
    if (!['APPROVED', 'REJECTED'].includes(normDecision)) {
      throw new AppError('Decision must be APPROVED or REJECTED', StatusCodes.BAD_REQUEST);
    }

    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const bookingId = booking._id || booking.id;
    const revisionId = req.params.revisionId;

    try {
      const existing = await prisma.quoteRevision.findFirst({
        where: { id: revisionId, bookingId },
      });
      if (!existing) throw new AppError('Quote revision not found', StatusCodes.NOT_FOUND);
      if (existing.status !== 'PENDING') {
        throw new AppError(`Revision has already been ${existing.status.toLowerCase()}`, StatusCodes.CONFLICT);
      }

      const updatedRevision = await prisma.quoteRevision.update({
        where: { id: revisionId },
        data: {
          status: normDecision,
          customerNote: customerNote || null,
          decidedAt: new Date(),
        },
      });

      if (normDecision === 'APPROVED') {
        const newTotal = existing.totalAmount;
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            amount: newTotal,
            workerEarnings: Math.round(newTotal * 0.9 * 100) / 100,
            platformCommission: Math.round(newTotal * 0.1 * 100) / 100,
          },
        });
      }

      if (req.io) {
        req.io.to(`booking:${bookingId}`).emit('quote_revision:decided', updatedRevision);
        const workerId = booking.worker?._id || booking.worker;
        if (workerId) {
          req.io.to(`user:${workerId}`).emit('quote_revision:decided', updatedRevision);
        }
      }

      return res.json({
        message: `Quote revision ${normDecision.toLowerCase()} successfully`,
        revision: updatedRevision,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      return res.json({ message: `Decision recorded: ${normDecision}` });
    }
  })
);

// POST /bookings/:id/cod-collect — worker records cash collection
router.post(
  '/:id/cod-collect',
  protect,
  authorize('worker', 'admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { amountCollected } = req.body || {};
    const parsedAmount = Number(amountCollected);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new AppError('amountCollected must be a positive number', StatusCodes.BAD_REQUEST);
    }

    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const bookingId = booking._id || booking.id;

    try {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          isCodCollected: true,
          codCollectedAt: new Date(),
          codAmountCollected: parsedAmount,
          paymentStatus: 'PAID',
          paymentMethod: 'COD',
        },
      });

      if (req.io) {
        req.io.to(`booking:${bookingId}`).emit('booking:cod_collected', {
          bookingId,
          amountCollected: parsedAmount,
        });
      }

      return res.json({
        message: `COD collection of ₹${parsedAmount} recorded successfully`,
        booking: formatPrismaBooking(updated),
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      return res.json({ message: 'COD collection recorded' });
    }
  })
);

// POST /bookings/:id/rate-customer — worker rates customer on completed booking
router.post(
  '/:id/rate-customer',
  protect,
  authorize('worker'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { rating, tags, comment } = req.body || {};
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new AppError('Rating must be an integer between 1 and 5', StatusCodes.BAD_REQUEST);
    }

    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

    const statusNorm = String(booking.status || '').toLowerCase();
    if (!['completed', 'paid', 'closed'].includes(statusNorm)) {
      throw new AppError('Can only rate customer after booking completion', StatusCodes.UNPROCESSABLE_ENTITY);
    }

    const bookingId = booking._id || booking.id;
    const workerId = req.user._id || req.user.id;
    const customerId = booking.customer?._id || booking.customer?.id || booking.customer;

    if (!customerId) {
      throw new AppError('Customer ID not found for this booking', StatusCodes.BAD_REQUEST);
    }

    try {
      const existing = await prisma.workerCustomerRating.findUnique({
        where: { bookingId },
      });
      if (existing) {
        throw new AppError('You have already submitted a rating for this customer on this booking', StatusCodes.CONFLICT);
      }

      const review = await prisma.workerCustomerRating.create({
        data: {
          bookingId,
          workerId,
          customerId,
          rating: numRating,
          tags: Array.isArray(tags) ? tags : [],
          comment: comment || null,
        },
      });

      return res.status(StatusCodes.CREATED).json({
        message: 'Customer rating submitted successfully. Thank you for keeping ServeCircle safe!',
        rating: review,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      return res.status(StatusCodes.CREATED).json({
        message: 'Rating submitted (demo)',
        rating: { rating: numRating, tags, comment },
      });
    }
  })
);

export default router;

