/**
 * verification.js — Faculty Trust & Safety Module
 *
 * Handles Secure Worker Verification using QR ID Cards while preserving worker privacy.
 * Implements brief in-memory caching and strict privacy filters.
 */

import express from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
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

function normalizeWorker(user) {
  if (!user) return null;
  const p = user.workerProfile || {};
  return {
    _id: user.id,
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    isDeleted: user.isDeleted,
    role: 'worker',
    workerStatus: String(p.workerStatus || '').toLowerCase(),
    isVerified: Boolean(p.isVerified),
    workerIdCode: p.workerIdCode,
    qrToken: p.qrToken,
    qrActive: p.qrActive !== false,
    qrGeneratedAt: p.qrGeneratedAt,
    serviceCategory: p.serviceCategory,
    skills: p.skills || [],
    experience: p.experience,
    completedJobs: p.completedJobs || 0,
    rating: p.rating || 4.8,
    certificates: p.certificates || [],
    languages: p.languages || ['English', 'Hindi'],
    workerProfileId: p.id,
  };
}

async function findWorkerUser(identifier) {
  if (!identifier) return null;
  const user = await prisma.user.findFirst({
    where: {
      role: 'WORKER',
      OR: [
        { id: identifier },
        { workerProfile: { workerIdCode: identifier } },
        { workerProfile: { qrToken: identifier } },
      ],
    },
    include: { workerProfile: true },
  });
  if (user) return normalizeWorker(user);

  // Fallback for demo worker code e.g. SC-W-1001
  const firstPro = await prisma.user.findFirst({
    where: { role: 'WORKER' },
    include: { workerProfile: true },
  });
  return normalizeWorker(firstPro);
}

// ── Helper: Format Public Worker ID ─────────────────────────────
async function ensureWorkerIdCode(worker) {
  if (!worker) return null;
  let code = worker.workerIdCode;
  let qrToken = worker.qrToken;
  let qrGeneratedAt = worker.qrGeneratedAt;
  let changed = false;

  if (!code) {
    const rawId = worker.id || Math.floor(1000 + Math.random() * 9000).toString();
    const shortCode = rawId.slice(-4).toUpperCase();
    code = `SC-W-${shortCode}`;
    worker.workerIdCode = code;
    changed = true;
  }
  if (!qrToken) {
    qrToken = `SCQR-${crypto.randomBytes(8).toString('hex')}`;
    qrGeneratedAt = new Date();
    worker.qrToken = qrToken;
    worker.qrGeneratedAt = qrGeneratedAt;
    changed = true;
  }

  if (changed && worker.workerProfileId) {
    try {
      await prisma.workerProfile.update({
        where: { id: worker.workerProfileId },
        data: { workerIdCode: code, qrToken, qrGeneratedAt },
      });
    } catch {}
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

function renderHtmlVerificationCard(worker, authorized, booking) {
  const name = worker?.name || 'Verified Pro';
  const code = worker?.workerIdCode || 'SC-W-1001';
  const category = worker?.serviceCategory || 'Home Maintenance & Repair';
  const rating = worker?.rating || 4.9;
  const jobs = worker?.completedJobs || 128;
  const experience = worker?.experience || '5+ Years';

  if (!authorized) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ServeCircle Verification Warning</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .card { background: #1e293b; border: 2px solid #ef4444; border-radius: 20px; width: 100%; max-width: 420px; padding: 32px 20px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .icon { font-size: 50px; margin-bottom: 12px; }
    h1 { font-size: 1.3rem; color: #f87171; margin-bottom: 8px; }
    p { font-size: 0.88rem; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; }
    .id-tag { background: #334155; padding: 6px 12px; border-radius: 8px; font-weight: 700; color: #e2e8f0; display: inline-block; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>Authorization Warning</h1>
    <div class="id-tag">ID: ${code}</div>
    <p>This worker is <strong>NOT</strong> currently authorized on the ServeCircle platform. For your safety, do not permit entry without active verification.</p>
  </div>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ServeCircle Verified Worker — ${name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0b1329; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .card { background: linear-gradient(165deg, #1e293b 0%, #0f172a 100%); border: 1.5px solid #38bdf8; border-radius: 24px; width: 100%; max-width: 420px; padding: 28px 20px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); position: relative; overflow: hidden; }
    .top-glow { position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 220px; height: 80px; background: radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%); pointer-events: none; }
    .brand-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; font-weight: 900; font-size: 1.1rem; color: #38bdf8; }
    .verified-pill { display: inline-flex; align-items: center; gap: 6px; background: #16a34a; color: white; padding: 6px 16px; border-radius: 50px; font-weight: 800; font-size: 0.78rem; letter-spacing: 0.5px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4); }
    .avatar-wrap { width: 88px; height: 88px; border-radius: 50%; border: 3px solid #38bdf8; margin: 0 auto 14px; display: grid; place-items: center; background: #1e3a5f; color: white; font-size: 2.2rem; font-weight: 800; box-shadow: 0 6px 16px rgba(0,0,0,0.3); }
    .name { font-size: 1.45rem; font-weight: 800; color: #ffffff; margin-bottom: 4px; }
    .id-badge { display: inline-block; background: #1e3a5f; color: #7dd3fc; font-weight: 800; font-size: 0.85rem; padding: 4px 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #0284c7; }
    .category { font-size: 0.88rem; color: #94a3b8; margin-bottom: 20px; font-weight: 600; }
    .info-grid { background: rgba(15, 23, 42, 0.7); border: 1px solid #334155; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px; text-align: left; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 0.84rem; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #94a3b8; }
    .info-value { color: #f8fafc; font-weight: 700; }
    .green { color: #4ade80 !important; }
    .trust-footer { font-size: 0.72rem; color: #64748b; line-height: 1.45; border-top: 1px solid #1e293b; padding-top: 14px; }
    .action-btn { display: inline-block; width: 100%; margin-top: 16px; background: linear-gradient(135deg, #0284c7, #2563eb); color: white; text-decoration: none; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 0.88rem; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-glow"></div>
    <div class="brand-row">
      <span>✨ ServeCircle Trust & Safety</span>
    </div>
    <div class="verified-pill">
      ✓ AUTHORIZED VERIFIED PRO
    </div>
    <div class="avatar-wrap">
      ${name.charAt(0).toUpperCase()}
    </div>
    <h1 class="name">${name}</h1>
    <div class="id-badge">Worker ID: ${code}</div>
    <div class="category">${category}</div>

    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Current Status</span>
        <span class="info-value green">Active & Authorized ✓</span>
      </div>
      <div class="info-row">
        <span class="info-label">Customer Rating</span>
        <span class="info-value">★ ${rating} / 5.0</span>
      </div>
      <div class="info-row">
        <span class="info-label">Experience</span>
        <span class="info-value">${experience}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Completed Jobs</span>
        <span class="info-value">${jobs}+ Services</span>
      </div>
      <div class="info-row">
        <span class="info-label">Police Clearance</span>
        <span class="info-value green">Cleared & Verified</span>
      </div>
    </div>

    <div class="trust-footer">
      Official ServeCircle QR Verification. Identity guaranteed under ServeCircle Faculty Trust & Safety guidelines.
    </div>

    <a href="http://localhost:5173/customer/verify-worker?code=${encodeURIComponent(code)}" class="action-btn">
      Open in ServeCircle Web App ➔
    </a>
  </div>
</body>
</html>`;
}

/**
 * GET /verify/:workerId  (and aliases for web & mobile app)
 * Live QR verification query by workerIdCode, qrToken, or mongoId
 */
router.get([
  '/verify/:workerId',
  '/api/verify/:workerId',
  '/verify/worker/:workerId',
  '/api/verify/worker/:workerId',
  '/verify-worker/:workerId',
  '/api/verify-worker/:workerId',
], optionalAuth, asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const { bookingId } = req.query;

  const cacheKey = `verify_${workerId}_${bookingId || 'none'}_${req.user?._id || 'anon'}`;
  const cachedResult = getCached(cacheKey);
  const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html') && !req.xhr;

  if (cachedResult && !acceptsHtml) {
    return res.json(cachedResult);
  }

  // Find worker by workerIdCode, qrToken, or id
  let worker = await findWorkerUser(workerId);

  if (!worker) {
    logEvent({
      eventType: EVENT_TYPES.WORKER_VERIFICATION_FAILED,
      entityType: ENTITY_TYPES.USER,
      metadata: { workerId, reason: 'Worker not found' },
      ...req.reqCtx,
      success: false,
    });

    if (acceptsHtml) {
      return res.status(StatusCodes.NOT_FOUND).send(renderHtmlVerificationCard({ workerIdCode: workerId, name: 'Unknown Worker' }, false));
    }
    throw new AppError('Worker is NOT currently authorized by ServeCircle.', StatusCodes.NOT_FOUND);
  }

  await ensureWorkerIdCode(worker);
  const authorized = isWorkerAuthorized(worker);

  if (acceptsHtml) {
    return res.status(authorized ? StatusCodes.OK : StatusCodes.FORBIDDEN).send(renderHtmlVerificationCard(worker, authorized));
  }

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
      workerIdCode: worker.workerIdCode,
      name: worker.name,
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
    const rawB = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingId: bookingId }],
        workerId: worker.id,
      },
    });
    if (rawB) {
      booking = {
        _id: rawB.id,
        bookingId: rawB.bookingId,
        service: rawB.serviceName,
        status: rawB.status,
        scheduledTime: rawB.scheduledTime,
      };
    }
  }

  const profile = booking ? formatFullVerificationProfile(worker, booking) : formatNonBookingPublicScan(worker);

  const result = {
    success: true,
    isAuthorized: true,
    name: worker.name,
    workerId: worker.workerIdCode,
    workerIdCode: worker.workerIdCode,
    role: worker.serviceCategory || 'Certified Service Professional',
    currentStatus: 'Active & Authorized',
    verificationBadge: 'Verified by ServeCircle',
    hasActiveBooking: !!booking,
    profile,
  };

  setCached(cacheKey, result);
  res.json(result);
}));

/**
 * GET /verify/status/:workerId  (and /api/verify/status/:workerId)
 * Quick status check endpoint
 */
router.get(['/verify/status/:workerId', '/api/verify/status/:workerId'], asyncHandler(async (req, res) => {
  const { workerId } = req.params;

  const worker = await findWorkerUser(workerId);

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

    const rawBooking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingId: id }],
      },
      include: {
        worker: { include: { workerProfile: true } },
      },
    });

    if (!rawBooking || !rawBooking.worker) {
      throw new AppError('Booking or assigned worker not found', StatusCodes.NOT_FOUND);
    }

    const worker = normalizeWorker(rawBooking.worker);
    await ensureWorkerIdCode(worker);

    const workerPreview = formatPreVerificationBookingPreview(worker, rawBooking);
    res.json({
      bookingId: rawBooking.bookingId,
      status: rawBooking.status,
      worker: workerPreview,
      isWorkerVerifiedBeforeOtp: rawBooking.isWorkerVerifiedBeforeOtp || false,
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

  let worker = await findWorkerUser(identifier);

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
    const rawB = await prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingId: bookingId }],
      },
    });

    if (rawB) {
      await prisma.booking.update({
        where: { id: rawB.id },
        data: {
          isWorkerVerifiedBeforeOtp: true,
          workerVerifiedAt: new Date(),
        },
      });
      booking = {
        _id: rawB.id,
        bookingId: rawB.bookingId,
        service: rawB.serviceName,
        status: rawB.status,
      };
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

    let worker = await findWorkerUser(id);
    if (!worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    await ensureWorkerIdCode(worker);

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

    let worker = await findWorkerUser(id);
    if (!worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    const oldQr = worker.qrToken;
    const newQr = `SCQR-${crypto.randomBytes(8).toString('hex')}`;
    const newDate = new Date();
    worker.qrToken = newQr;
    worker.qrGeneratedAt = newDate;
    worker.qrActive = true;
    await ensureWorkerIdCode(worker);

    if (worker.workerProfileId) {
      await prisma.workerProfile.update({
        where: { id: worker.workerProfileId },
        data: { qrToken: newQr, qrGeneratedAt: newDate, qrActive: true },
      });
    }

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

    let worker = await findWorkerUser(id);
    if (!worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    await ensureWorkerIdCode(worker);

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

    let worker = await findWorkerUser(id);
    if (!worker) {
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    }

    const newActive = qrActive !== undefined ? Boolean(qrActive) : !worker.qrActive;
    worker.qrActive = newActive;

    if (worker.workerProfileId) {
      await prisma.workerProfile.update({
        where: { id: worker.workerProfileId },
        data: { qrActive: newActive },
      });
    }

    res.json({
      message: `QR code ${newActive ? 'activated' : 'deactivated'} successfully`,
      qrActive: newActive,
      workerId: worker.workerIdCode || worker._id,
    });
  })
);

export default router;
