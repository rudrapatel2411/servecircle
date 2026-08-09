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
    const bookings = await getWorkerJobs(req.user._id, req.query.status);
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
    const booking = await updateBookingFields(req.params.id, safeUpdates);
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
    const booking = await verifyStartOtp(req.params.id, otp, req.user._id);
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

export default router;

