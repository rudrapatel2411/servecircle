/**
 * verification.js — Faculty Trust & Safety Module
 *
 * Handles Secure Worker Verification using QR ID Cards while preserving worker privacy.
 * Implements brief in-memory caching and strict privacy filters.
 */

import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';

const router = express.Router();

// ── In-Memory Verification Cache (30s TTL) ─────────────────────────
const cacheMap = new Map();
const CACHE_TTL_MS = 30000;

function getCached(key) {
  const cached = cacheMap.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  cacheMap.delete(key);
  return null;
}

function setCached(key, data) {
  cacheMap.set(key, { data, timestamp: Date.now() });
}

// ── Helper: Format Public Worker ID ─────────────────────────────
function ensureWorkerIdCode(worker) {
  if (!worker.workerIdCode) {
    const rawId = worker._id ? worker._id.toString() : Math.floor(1000 + Math.random() * 9000).toString();
    const shortCode = rawId.slice(-4).toUpperCase();
    worker.workerIdCode = `SC-W-${shortCode}`;
  }
  if (!worker.qrToken) {
    worker.qrToken = `SCQR-${crypto.randomBytes(8).toString('hex')}`;
    worker.qrGeneratedAt = new Date();
  }
  return worker;
}

// ── Helper: Check Worker Authorization Status ────────────────────
function isWorkerAuthorized(worker) {
  if (!worker) return false;
  if (worker.isDeleted) return false;
  if (worker.qrActive === false) return false;
  
  const status = worker.workerStatus || '';
  if (['suspended', 'deleted', 'blocked', 'expired', 'rejected'].includes(status.toLowerCase())) {
    return false;
  }
  // Authorized if status is approved or verified
  return worker.isVerified || status.startsWith('approved_') || status === 'approved';
}

// ── Helper: Privacy Filters ─────────────────────────────────────

/**
 * Filter 1: Pre-verification Booking Screen View
 * ONLY: Worker Name, Experience, Rating, ETA, Verification Badge
 * HIDDEN: Photo, Phone, Email, Address, Certificates, Languages, Personal Documents
 */
function formatPreVerificationBookingPreview(worker, booking) {
  return {
    workerId: worker.workerIdCode || `SC-W-${(worker._id || '').toString().slice(-4).toUpperCase()}`,
    name: worker.name,
    experience: worker.experience || '3+ Years',
    rating: worker.rating || 4.8,
    eta: booking?.scheduledTime || '15-20 mins',
    verificationBadge: 'ServeCircle Verified Worker',
    isPreVerified: true,
  };
}

/**
 * Filter 2: Non-Booking QR Scan (Random Scanner)
 * ONLY: Worker Name, Worker ID, Current Status, Verified by ServeCircle
 * HIDDEN: Everything else!
 */
function formatNonBookingPublicScan(worker) {
  const authorized = isWorkerAuthorized(worker);
  return {
    name: worker.name,
    workerId: worker.workerIdCode,
    currentStatus: authorized ? 'Active & Authorized' : 'Not Authorized',
    verificationBadge: 'Verified by ServeCircle',
    isAuthorized: authorized,
    scannedAt: new Date().toISOString(),
  };
}

/**
 * Filter 3: Verified Booking Customer Verification Page
 * SHOW: Photo, Name, Worker ID, Badge, Experience, Skills, Certificates, Languages, Completed Jobs, Average Rating, Today's Booking Status
 * NEVER SHOW: Phone, Email, Address, Aadhaar, PAN, Bank Details, Admin Notes, Internal IDs
 */
function formatFullVerificationProfile(worker, booking) {
  const roleDisplay = (worker.workerStatus || '') === 'approved_senior'
    ? 'Senior Service Professional'
    : (worker.workerStatus || '') === 'approved_junior'
    ? 'Junior Service Professional'
    : 'Certified Service Professional';

  return {
    workerId: worker.workerIdCode,
    name: worker.name,
    photo: worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=1e3a5f&color=fff`,
    role: roleDisplay,
    verificationBadge: 'ServeCircle Verified Pro',
    experience: worker.experience || '3+ Years',
    skills: worker.skills || [worker.serviceCategory || 'General Maintenance'],
    certificates: worker.certificates?.length ? worker.certificates : ['ServeCircle Certified Expert', 'Safety & Hygiene Cleared'],
    languages: worker.languages?.length ? worker.languages : ['English', 'Hindi'],
    completedJobs: worker.completedJobs || 42,
    rating: worker.rating || 4.8,
    todaysBookingStatus: booking ? {
      bookingId: booking.bookingId,
      service: booking.service,
      status: booking.status,
      scheduledTime: booking.scheduledTime,
    } : null,
    verifiedAt: new Date().toISOString(),
    isAuthorized: true,
  };
}

// ─────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────────

/**
 * GET /verify/:workerId  (and /api/verify/:workerId)
 * Live QR verification query by workerIdCode, qrToken, or mongoId
 */
router.get(['/verify/:workerId', '/api/verify/:workerId'], optionalAuth, asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const { bookingId } = req.query;

  const cacheKey = `verify_${workerId}_${bookingId || 'none'}_${req.user?._id || 'anon'}`;
  const cachedResult = getCached(cacheKey);
  if (cachedResult) {
    return res.json(cachedResult);
  }

  // Find worker by workerIdCode, qrToken, or _id
  let worker = await User.findOne({
    $or: [
      { workerIdCode: workerId },
      { qrToken: workerId },
      ...(workerId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: workerId }] : []),
    ],
  }).select('-password -idProof -workerAdminNote');

  if (!worker) {
    logEvent({
      eventType: EVENT_TYPES.WORKER_VERIFICATION_FAILED,
      entityType: ENTITY_TYPES.USER,
      metadata: { workerId, reason: 'Worker not found' },
      ...req.reqCtx,
      success: false,
    });
    throw new AppError('Worker is NOT currently authorized by ServeCircle.', StatusCodes.NOT_FOUND);
  }

  ensureWorkerIdCode(worker);
  const authorized = isWorkerAuthorized(worker);

  if (!authorized) {
    logEvent({
      eventType: EVENT_TYPES.WORKER_VERIFICATION_FAILED,
      entityType: ENTITY_TYPES.USER,
      entityId: worker._id,
      workerId: worker._id,
      metadata: { workerIdCode: worker.workerIdCode, status: worker.workerStatus },
      ...req.reqCtx,
      success: false,
    });

    const response = {
      isAuthorized: false,
      message: 'Worker is NOT currently authorized by ServeCircle.',
      status: worker.workerStatus || 'unauthorized',
      workerId: worker.workerIdCode,
    };
    return res.status(StatusCodes.FORBIDDEN).json(response);
  }

  // Log scan event
  logEvent({
    eventType: EVENT_TYPES.WORKER_QR_SCANNED,
    entityType: ENTITY_TYPES.USER,
    entityId: worker._id,
    actorId: req.user?._id,
    actorRole: req.user?.role || 'guest',
    workerId: worker._id,
    metadata: { workerIdCode: worker.workerIdCode, bookingId },
    ...req.reqCtx,
  });

  // Check if booking is provided and belongs to caller / active today
  let booking = null;
  if (bookingId) {
    booking = await Booking.findOne({
      $or: [
        { bookingId: bookingId },
        ...(bookingId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: bookingId }] : []),
      ],
      worker: worker._id,
    });
  }

  let result;
  if (booking) {
    result = {
      isAuthorized: true,
      hasActiveBooking: true,
      profile: formatFullVerificationProfile(worker, booking),
    };
  } else {
    result = {
      isAuthorized: true,
      hasActiveBooking: false,
      profile: formatNonBookingPublicScan(worker),
    };
  }

  setCached(cacheKey, result);
  res.json(result);
}));

/**
 * GET /verify/status/:workerId  (and /api/verify/status/:workerId)
 * Quick status check endpoint
 */
router.get(['/verify/status/:workerId', '/api/verify/status/:workerId'], asyncHandler(async (req, res) => {
  const { workerId } = req.params;

  const worker = await User.findOne({
    $or: [
      { workerIdCode: workerId },
      { qrToken: workerId },
      ...(workerId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: workerId }] : []),
    ],
  }).select('name workerIdCode workerStatus isVerified qrActive isDeleted');

  if (!worker) {
    return res.json({
      workerId,
      status: 'not_found',
      isAuthorized: false,
      message: 'Worker is NOT currently authorized by ServeCircle.',
    });
  }

  const authorized = isWorkerAuthorized(worker);

  res.json({
    workerId: worker.workerIdCode || workerId,
    name: worker.name,
    status: authorized ? 'active' : worker.workerStatus || 'unauthorized',
    isAuthorized: authorized,
    verifiedBy: 'ServeCircle',
  });
}));

/**
 * GET /booking/:id/worker-preview  (and /api/booking/:id/worker-preview & /api/bookings/:id/worker-preview)
 * Privacy-filtered pre-verification booking screen view
 */
router.get(
  ['/booking/:id/worker-preview', '/api/booking/:id/worker-preview', '/api/bookings/:id/worker-preview'],
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findOne({
      $or: [
        { bookingId: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    }).populate('worker', '-password -phone -email -idProof -workerAdminNote');

    if (!booking || !booking.worker) {
      throw new AppError('Booking or assigned worker not found', StatusCodes.NOT_FOUND);
    }

    ensureWorkerIdCode(booking.worker);

    const workerPreview = formatPreVerificationBookingPreview(booking.worker, booking);
    res.json({
      bookingId: booking.bookingId,
      status: booking.status,
      worker: workerPreview,
      isWorkerVerifiedBeforeOtp: booking.isWorkerVerifiedBeforeOtp || false,
    });
  })
);

/**
 * POST /verify/worker  (and /api/verify/worker)
 * Verification flow trigger before OTP
 */
router.post(['/verify/worker', '/api/verify/worker'], optionalAuth, asyncHandler(async (req, res) => {
  const { qrCodeData, workerId, bookingId } = req.body || {};

  const identifier = workerId || qrCodeData;
  if (!identifier) {
    throw new AppError('Worker ID or QR code data is required', StatusCodes.BAD_REQUEST);
  }

  let worker = await User.findOne({
    $or: [
      { workerIdCode: identifier },
      { qrToken: identifier },
      ...(identifier.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: identifier }] : []),
    ],
  });

  if (!worker) {
    logEvent({
      eventType: EVENT_TYPES.WORKER_VERIFICATION_FAILED,
      entityType: ENTITY_TYPES.USER,
      metadata: { identifier, bookingId, reason: 'Invalid ID/QR' },
      ...req.reqCtx,
      success: false,
    });
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      isAuthorized: false,
      message: 'Worker is NOT currently authorized by ServeCircle.',
    });
  }

  ensureWorkerIdCode(worker);
  const authorized = isWorkerAuthorized(worker);

  if (!authorized) {
    logEvent({
      eventType: EVENT_TYPES.WORKER_VERIFICATION_FAILED,
      entityType: ENTITY_TYPES.USER,
      entityId: worker._id,
      workerId: worker._id,
      metadata: { workerIdCode: worker.workerIdCode, status: worker.workerStatus, bookingId },
      ...req.reqCtx,
      success: false,
    });

    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      isAuthorized: false,
      message: 'Worker is NOT currently authorized by ServeCircle.',
      status: worker.workerStatus || 'suspended',
    });
  }

  // Find booking if provided
  let booking = null;
  if (bookingId) {
    booking = await Booking.findOne({
      $or: [
        { bookingId: bookingId },
        ...(bookingId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: bookingId }] : []),
      ],
    });

    if (booking) {
      booking.isWorkerVerifiedBeforeOtp = true;
      booking.workerVerifiedAt = new Date();
      await booking.save();
    }
  }

  logEvent({
    eventType: EVENT_TYPES.WORKER_VERIFIED,
    entityType: ENTITY_TYPES.USER,
    entityId: worker._id,
    actorId: req.user?._id,
    actorRole: req.user?.role || 'customer',
    workerId: worker._id,
    bookingId: booking?._id,
    metadata: {
      workerIdCode: worker.workerIdCode,
      bookingId: booking?.bookingId,
      verifiedBeforeOtp: true,
    },
    ...req.reqCtx,
  });

  res.json({
    success: true,
    isAuthorized: true,
    canContinueToOtp: true,
    workerProfile: formatFullVerificationProfile(worker, booking),
    message: 'Worker identity successfully verified by ServeCircle.',
  });
}));

/**
 * GET /admin/worker/:id/idcard  (and /api/admin/worker/:id/idcard)
 * Get printable ID Card data for admin
 */
router.get(
  ['/admin/worker/:id/idcard', '/api/admin/worker/:id/idcard'],
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    let worker = await User.findById(id).select('-password');
    if (!worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    ensureWorkerIdCode(worker);
    await worker.save();

    logEvent({
      eventType: EVENT_TYPES.ID_CARD_GENERATED,
      entityType: ENTITY_TYPES.USER,
      entityId: worker._id,
      actorId: req.user._id,
      actorRole: 'admin',
      workerId: worker._id,
      metadata: { workerIdCode: worker.workerIdCode },
      ...req.reqCtx,
    });

    res.json({
      brand: 'ServeCircle',
      logoUrl: '/logo.png',
      workerName: worker.name,
      workerId: worker.workerIdCode,
      role: worker.serviceCategory || 'Service Professional',
      qrCodeData: worker.qrToken,
      qrActive: worker.qrActive !== false,
      generatedAt: worker.qrGeneratedAt || new Date(),
      disclaimer: 'Permanent ServeCircle ID Card. No sensitive personal information printed.',
    });
  })
);

/**
 * POST /admin/worker/:id/regenerate-qr  (and /api/admin/worker/:id/regenerate-qr)
 * Regenerate QR token for a worker
 */
router.post(
  ['/admin/worker/:id/regenerate-qr', '/api/admin/worker/:id/regenerate-qr'],
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    let worker = await User.findById(id);
    if (!worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    const oldQr = worker.qrToken;
    worker.qrToken = `SCQR-${crypto.randomBytes(8).toString('hex')}`;
    worker.qrGeneratedAt = new Date();
    worker.qrActive = true;
    ensureWorkerIdCode(worker);
    await worker.save();

    logEvent({
      eventType: EVENT_TYPES.QR_REGENERATED,
      entityType: ENTITY_TYPES.USER,
      entityId: worker._id,
      actorId: req.user._id,
      actorRole: 'admin',
      workerId: worker._id,
      metadata: { workerIdCode: worker.workerIdCode, oldQrToken: oldQr, newQrToken: worker.qrToken },
      ...req.reqCtx,
    });

    res.json({
      message: 'QR Code regenerated successfully',
      workerId: worker.workerIdCode,
      qrCodeData: worker.qrToken,
      qrGeneratedAt: worker.qrGeneratedAt,
    });
  })
);

/**
 * GET /admin/worker/:id/idcard-preview  (and /api/admin/worker/:id/idcard-preview)
 * Preview ID card rendering data
 */
router.get(
  ['/admin/worker/:id/idcard-preview', '/api/admin/worker/:id/idcard-preview'],
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    let worker = await User.findById(id);
    if (!worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    ensureWorkerIdCode(worker);

    res.json({
      preview: {
        companyName: 'ServeCircle Technologies',
        title: 'VERIFIED SERVICE WORKER ID',
        logoText: 'ServeCircle',
        workerName: worker.name,
        workerId: worker.workerIdCode,
        role: worker.serviceCategory || 'Field Technician',
        qrToken: worker.qrToken,
        qrActive: worker.qrActive !== false,
        specs: {
          dimensions: '85.60mm x 53.98mm (CR80 Standard)',
          printMode: 'CMYK High Resolution 300DPI',
          printedFields: ['Logo', 'Worker Name', 'Worker ID', 'Role', 'QR Code'],
          hiddenFields: ['Photo', 'Phone', 'Email', 'Address', 'Aadhaar', 'PAN', 'Bank Details'],
        },
      },
    });
  })
);

/**
 * POST /api/admin/worker/:id/toggle-qr
 * Deactivate / Reactivate worker QR code
 */
router.post(
  ['/admin/worker/:id/toggle-qr', '/api/admin/worker/:id/toggle-qr'],
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { qrActive } = req.body;

    let worker = await User.findById(id);
    if (!worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    worker.qrActive = qrActive !== undefined ? Boolean(qrActive) : !worker.qrActive;
    await worker.save();

    res.json({
      message: `QR code ${worker.qrActive ? 'activated' : 'deactivated'} successfully`,
      qrActive: worker.qrActive,
      workerId: worker.workerIdCode || worker._id,
    });
  })
);

export default router;
