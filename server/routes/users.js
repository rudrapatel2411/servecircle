import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import {
  validateUserUpdate,
  validateChangePassword,
  validateSubscription,
  validateWorkerStatusUpdate,
  validateMongoIdParam,
} from '../middleware/validation.js';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';
import { ensureWorkerMetrics, ensureCustomerMetrics } from '../services/metricsService.js';
import { captureSnapshot } from '../services/historyService.js';
import { updateTrustVerification, syncTrustProfile } from '../services/featureService.js';
import { DEMO_USERS, IN_MEMORY_USERS, findFallbackUserById } from '../utils/demoAuthStore.js';
import { notifyWorker } from '../services/notificationService.js';

const router = express.Router();

const WORKER_STATUS_ENUM = {
  pending_interview: 'PENDING_INTERVIEW',
  interview_done: 'INTERVIEW_DONE',
  approved_rookie: 'APPROVED_ROOKIE',
  approved_junior: 'APPROVED_JUNIOR',
  approved_senior: 'APPROVED_SENIOR',
  rejected: 'REJECTED',
};

const APPROVED_ENUMS = ['APPROVED_ROOKIE', 'APPROVED_JUNIOR', 'APPROVED_SENIOR'];

/**
 * Shape a Prisma user into the flat, lowercase contract the web client expects
 * (`_id`, `workerStatus: 'approved_senior'`, `isVerified`, ...).
 */
function formatPrismaUser(user) {
  if (!user) return null;
  const { password, workerProfile, ...rest } = user;
  const profile = workerProfile || null;
  const duty = profile?.dutyStatus ? String(profile.dutyStatus).toLowerCase() : 'offline';
  return {
    ...rest,
    _id: user.id,
    role: String(user.role || '').toLowerCase(),
    isVerified: profile ? Boolean(profile.isVerified) : false,
    workerStatus: profile?.workerStatus ? String(profile.workerStatus).toLowerCase() : undefined,
    dutyStatus: duty,
    dutyStatusUpdatedAt: profile?.dutyStatusUpdatedAt ?? null,
    serviceRadius: profile?.serviceRadius ?? 25,
    workerAdminNote: profile?.workerAdminNote ?? undefined,
    serviceCategory: profile?.serviceCategory ?? undefined,
    skills: profile?.skills || [],
    experience: profile?.experience ?? undefined,
    workerIdCode: profile?.workerIdCode ?? undefined,
    rating: profile?.rating ?? 0,
    completedJobs: profile?.completedJobs ?? 0,
    isAvailable: profile ? (profile.isAvailable !== false && duty === 'online') : false,
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null,
    availabilities: profile?.availabilities || [],
    leaves: profile?.leaves || [],
    workerProfileId: profile?.id,
  };
}

// GET current user profile
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          workerProfile: {
            include: { availabilities: true, leaves: true },
          },
        },
      });
      if (user && !user.isDeleted) return res.json(formatPrismaUser(user));
    } catch (err) {
      // Fall through to fallback store below
    }

    const fallback = findFallbackUserById(userId) || req.user;
    const { password, ...safeUser } = fallback;
    res.json(safeUser);
  })
);

// PUT update profile
router.put(
  '/me',
  protect,
  validateUserUpdate,
  asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'phone', 'avatar', 'skills', 'companyName', 'locations'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const userId = req.user._id || req.user.id;

    // 1. PostgreSQL (Prisma) — authoritative profile
    try {
      const existing = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true },
      });
      if (existing && !existing.isDeleted) {
        const data = {};
        ['name', 'phone', 'avatar'].forEach((field) => {
          if (updates[field] !== undefined) data[field] = updates[field];
        });
        if (Object.keys(data).length > 0) {
          await prisma.user.update({ where: { id: existing.id }, data });
        }
        if (Array.isArray(updates.skills) && existing.workerProfile) {
          await prisma.workerProfile.update({
            where: { userId: existing.id },
            data: { skills: updates.skills },
          });
        }
        const fresh = await prisma.user.findUnique({
          where: { id: existing.id },
          include: { workerProfile: true },
        });
        logEvent({ eventType: EVENT_TYPES.USER_PROFILE_UPDATED, entityType: ENTITY_TYPES.USER, entityId: existing.id, actorId: existing.id, actorRole: existing.role, metadata: updates, ...req.reqCtx });
        return res.json(formatPrismaUser(fresh));
      }
    } catch (err) {
      // Fall through to fallback store below
    }

    const fallback = findFallbackUserById(userId) || req.user;
    Object.assign(fallback, updates);
    Object.assign(req.user, updates);
    const { password, ...safeUser } = fallback;
    res.json(safeUser);
  })
);

// PUT change password
router.put(
  '/me/password',
  protect,
  validateChangePassword,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    // 1. PostgreSQL (Prisma) — authoritative credential store
    try {
      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (existing && !existing.isDeleted) {
        const isMatch = await bcrypt.compare(currentPassword, existing.password);
        if (!isMatch) {
          throw new AppError('Current password is incorrect', StatusCodes.BAD_REQUEST);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
          where: { id: existing.id },
          data: { password: hashedPassword },
        });
        return res.json({ message: 'Password updated successfully' });
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
    }

    const fallback = findFallbackUserById(userId) || req.user;
    if (fallback.password && fallback.password !== currentPassword) {
      throw new AppError('Current password is incorrect', StatusCodes.BAD_REQUEST);
    }
    fallback.password = newPassword;
    res.json({ message: 'Password updated successfully' });
  })
);

// PUT update subscription
router.put(
  '/me/subscription',
  protect,
  validateSubscription,
  asyncHandler(async (req, res) => {
    const { plan } = req.body;
    const userId = req.user._id || req.user.id;

    const fallback = findFallbackUserById(userId) || req.user;
    fallback.subscription = plan;
    req.user.subscription = plan;
    const { password, ...safeUser } = fallback;
    res.json(safeUser);
  })
);

// ===== WORKER OPERATIONS & DUTY STATUS (MILESTONE M1) =====

// PATCH /worker/duty-status — update worker duty status (online, offline, paused)
router.patch(
  '/worker/duty-status',
  protect,
  asyncHandler(async (req, res) => {
    const { dutyStatus, latitude, longitude } = req.body;
    const requesterId = req.user._id || req.user.id;

    const validStatuses = ['online', 'offline', 'paused'];
    if (!dutyStatus || !validStatuses.includes(String(dutyStatus).toLowerCase())) {
      throw new AppError(
        `Invalid duty status. Expected one of: ${validStatuses.join(', ')}`,
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    const normDuty = String(dutyStatus).toLowerCase();
    const enumDuty = normDuty.toUpperCase();

    // 1. PostgreSQL (Prisma)
    try {
      let user = await prisma.user.findFirst({
        where: { id: requesterId, isDeleted: false },
        include: {
          workerProfile: {
            include: {
              availabilities: { where: { isActive: true } },
              leaves: { where: { isApproved: true } },
            },
          },
        },
      });

      if (!user && req.user.email) {
        user = await prisma.user.findFirst({
          where: { email: { equals: req.user.email, mode: 'insensitive' }, isDeleted: false },
          include: {
            workerProfile: {
              include: {
                availabilities: { where: { isActive: true } },
                leaves: { where: { isApproved: true } },
              },
            },
          },
        });
      }

      if (user) {
        let profile = user.workerProfile;
        if (!profile && (user.role === 'WORKER' || user.role === 'ADMIN')) {
          profile = await prisma.workerProfile.create({
            data: {
              userId: user.id,
              serviceCategory: user.serviceCategory || 'Home Repairs',
              skills: user.skills || [],
              workerStatus: 'APPROVED_SENIOR',
              isVerified: true,
              isAvailable: enumDuty === 'ONLINE',
              dutyStatus: enumDuty,
            },
          });
        }

        if (profile) {
          const updateData = {
            dutyStatus: enumDuty,
            dutyStatusUpdatedAt: new Date(),
            isAvailable: enumDuty === 'ONLINE',
            isVerified: true,
          };

          if (typeof latitude === 'number' && typeof longitude === 'number') {
            updateData.latitude = latitude;
            updateData.longitude = longitude;
          }

          await prisma.workerProfile.update({
            where: { id: profile.id },
            data: updateData,
          });

          const updated = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              workerProfile: {
                include: {
                  availabilities: { where: { isActive: true } },
                  leaves: { where: { isApproved: true } },
                },
              },
            },
          });

          if (req.io) {
            req.io.to('admin_room').emit('worker:duty_changed', {
              workerId: user.id,
              name: user.name,
              dutyStatus: normDuty,
              updatedAt: updateData.dutyStatusUpdatedAt,
            });
            req.io.emit('worker:duty_changed', {
              workerId: user.id,
              name: user.name,
              dutyStatus: normDuty,
              updatedAt: updateData.dutyStatusUpdatedAt,
            });
          }

          return res.json(formatPrismaUser(updated));
        }
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.warn('[DutyStatus] PostgreSQL fallback:', err.message);
    }

    // Demo store fallback
    const fallback = findFallbackUserById(requesterId) || (req.user.email ? findFallbackUserByEmail(req.user.email) : null) || req.user;
    if (fallback) {
      fallback.dutyStatus = normDuty;
      fallback.isAvailable = normDuty === 'online';
      fallback.isVerified = true;
      fallback.dutyStatusUpdatedAt = new Date().toISOString();
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        fallback.latitude = latitude;
        fallback.longitude = longitude;
      }
      return res.json(fallback);
    }

    throw new AppError('Worker profile not found', StatusCodes.NOT_FOUND);
  })
);

// GET /worker/availability — fetch worker availability slots and approved leaves
router.get(
  '/worker/availability',
  protect,
  asyncHandler(async (req, res) => {
    let targetUserId = req.user._id || req.user.id;
    if (req.user.role === 'admin' && req.query.workerId) {
      targetUserId = req.query.workerId;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: {
          workerProfile: {
            include: {
              availabilities: { orderBy: { dayOfWeek: 'asc' } },
              leaves: { orderBy: { startDate: 'asc' } },
            },
          },
        },
      });

      if (user?.workerProfile) {
        return res.json({
          dutyStatus: user.workerProfile.dutyStatus ? String(user.workerProfile.dutyStatus).toLowerCase() : 'offline',
          dutyStatusUpdatedAt: user.workerProfile.dutyStatusUpdatedAt,
          serviceRadius: user.workerProfile.serviceRadius || 25,
          availabilities: user.workerProfile.availabilities || [],
          leaves: user.workerProfile.leaves || [],
        });
      }
    } catch (err) {
      // fallback
    }

    res.json({
      dutyStatus: req.user.dutyStatus || 'offline',
      serviceRadius: 25,
      availabilities: [],
      leaves: [],
    });
  })
);

// PUT /worker/availability — save/replace recurring weekly availability slots
router.put(
  '/worker/availability',
  protect,
  asyncHandler(async (req, res) => {
    const { slots } = req.body;
    if (!Array.isArray(slots)) {
      throw new AppError('Slots must be an array of weekly availability', StatusCodes.BAD_REQUEST);
    }

    const userId = req.user._id || req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true },
      });

      if (!user?.workerProfile) {
        throw new AppError('Worker profile not found', StatusCodes.NOT_FOUND);
      }

      const profileId = user.workerProfile.id;

      await prisma.$transaction(async (tx) => {
        await tx.workerAvailability.deleteMany({
          where: { workerProfileId: profileId },
        });

        for (const slot of slots) {
          if (slot.dayOfWeek !== undefined && slot.startTime && slot.endTime) {
            await tx.workerAvailability.create({
              data: {
                workerProfileId: profileId,
                dayOfWeek: Number(slot.dayOfWeek),
                startTime: String(slot.startTime),
                endTime: String(slot.endTime),
                isActive: slot.isActive !== false,
              },
            });
          }
        }
      });

      const updatedSlots = await prisma.workerAvailability.findMany({
        where: { workerProfileId: profileId },
        orderBy: { dayOfWeek: 'asc' },
      });

      return res.json({ message: 'Availability updated successfully', availabilities: updatedSlots });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Failed to update availability', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  })
);

// POST /worker/leave — request / record leave
router.post(
  '/worker/leave',
  protect,
  asyncHandler(async (req, res) => {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate) {
      throw new AppError('startDate and endDate are required', StatusCodes.BAD_REQUEST);
    }

    const userId = req.user._id || req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true },
      });

      if (!user?.workerProfile) {
        throw new AppError('Worker profile not found', StatusCodes.NOT_FOUND);
      }

      const leave = await prisma.workerLeave.create({
        data: {
          workerProfileId: user.workerProfile.id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason: reason || null,
          isApproved: true,
        },
      });

      return res.status(StatusCodes.CREATED).json({ message: 'Leave recorded successfully', leave });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Failed to record leave', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  })
);

// DELETE /worker/leave/:leaveId — delete/cancel a leave
router.delete(
  '/worker/leave/:leaveId',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true },
      });

      if (!user?.workerProfile) {
        throw new AppError('Worker profile not found', StatusCodes.NOT_FOUND);
      }

      const existingLeave = await prisma.workerLeave.findFirst({
        where: {
          id: req.params.leaveId,
          workerProfileId: user.workerProfile.id,
        },
      });

      if (!existingLeave && req.user.role !== 'admin') {
        throw new AppError('Leave record not found or unauthorized', StatusCodes.NOT_FOUND);
      }

      await prisma.workerLeave.delete({
        where: { id: req.params.leaveId },
      });

      return res.json({ message: 'Leave removed successfully' });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Failed to remove leave', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  })
);

// ===== WORKER PAYOUT ACCOUNT (MILESTONE M4) =====

// GET /worker/payout-account — fetch masked payout destination
router.get(
  '/worker/payout-account',
  protect,
  authorize('worker', 'admin'),
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: { include: { payoutAccount: true } } },
      });
      const account = user?.workerProfile?.payoutAccount;
      if (!account) {
        return res.json({ hasAccount: false, payoutAccount: null });
      }
      return res.json({
        hasAccount: true,
        payoutAccount: {
          id: account.id,
          type: account.type,
          accountHolder: account.accountHolder,
          maskedAccountNumber: account.accountNumber,
          ifscCode: account.ifscCode,
          upiId: account.upiId,
          isVerified: account.isVerified,
          updatedAt: account.updatedAt,
        },
      });
    } catch (err) {
      return res.json({ hasAccount: false, payoutAccount: null });
    }
  })
);

// PUT /worker/payout-account — save / update payout destination
router.put(
  '/worker/payout-account',
  protect,
  authorize('worker'),
  asyncHandler(async (req, res) => {
    const { type, accountNumber, ifscCode, upiId, accountHolder } = req.body || {};
    const normType = String(type || 'UPI').toUpperCase();
    if (!['BANK_ACCOUNT', 'UPI'].includes(normType)) {
      throw new AppError('Payout type must be BANK_ACCOUNT or UPI', StatusCodes.BAD_REQUEST);
    }

    if (normType === 'UPI' && (!upiId || !upiId.includes('@'))) {
      throw new AppError('A valid UPI ID (e.g. yourname@upi) is required', StatusCodes.BAD_REQUEST);
    }
    if (normType === 'BANK_ACCOUNT' && (!accountNumber || !ifscCode)) {
      throw new AppError('Bank account number and IFSC code are required', StatusCodes.BAD_REQUEST);
    }

    const userId = req.user._id || req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true },
      });
      if (!user?.workerProfile) {
        throw new AppError('Worker profile not found', StatusCodes.NOT_FOUND);
      }

      const maskedNumber = accountNumber
        ? `******${String(accountNumber).slice(-4)}`
        : null;

      const profileId = user.workerProfile.id;

      const saved = await prisma.workerPayoutAccount.upsert({
        where: { workerProfileId: profileId },
        update: {
          type: normType,
          accountNumber: maskedNumber,
          ifscCode: ifscCode ? String(ifscCode).toUpperCase().trim() : null,
          upiId: upiId ? String(upiId).trim() : null,
          accountHolder: accountHolder || user.name,
          isVerified: true, // Auto-verified in sandbox
        },
        create: {
          workerProfileId: profileId,
          type: normType,
          accountNumber: maskedNumber,
          ifscCode: ifscCode ? String(ifscCode).toUpperCase().trim() : null,
          upiId: upiId ? String(upiId).trim() : null,
          accountHolder: accountHolder || user.name,
          isVerified: true,
        },
      });

      return res.json({
        message: 'Payout destination saved successfully',
        payoutAccount: saved,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Failed to save payout account', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  })
);

// ===== WORKER WITHDRAWAL & LEDGER (MILESTONE M5) =====

// POST /worker/withdraw — request payout withdrawal
router.post(
  '/worker/withdraw',
  protect,
  authorize('worker'),
  asyncHandler(async (req, res) => {
    const { amount } = req.body || {};
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      throw new AppError('Minimum withdrawal amount is ₹100', StatusCodes.BAD_REQUEST);
    }

    const userId = req.user._id || req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: { include: { payoutAccount: true } } },
      });
      if (!user?.workerProfile) {
        throw new AppError('Worker profile not found', StatusCodes.NOT_FOUND);
      }

      const account = user.workerProfile.payoutAccount;
      if (!account || !account.isVerified) {
        throw new AppError('Please add and verify a payout account before withdrawing funds', StatusCodes.BAD_REQUEST);
      }

      if (user.walletBalance < parsedAmount) {
        throw new AppError(`Insufficient payable balance (Available: ₹${user.walletBalance.toFixed(2)})`, StatusCodes.BAD_REQUEST);
      }

      const destination = account.type === 'UPI' ? account.upiId : `${account.accountHolder} (${account.accountNumber})`;

      // Execute withdrawal atomically
      const result = await prisma.$transaction(async (tx) => {
        const nextBalance = user.walletBalance - parsedAmount;

        const payout = await tx.payoutRequest.create({
          data: {
            workerId: user.id,
            amount: parsedAmount,
            fee: 0.0,
            netAmount: parsedAmount,
            payoutType: account.type,
            destination,
            status: 'PROCESSING',
            utr: `UTR-${Date.now().toString().slice(-8)}`,
          },
        });

        await tx.user.update({
          where: { id: user.id },
          data: { walletBalance: nextBalance },
        });

        await tx.walletTransaction.create({
          data: {
            userId: user.id,
            type: 'WITHDRAWAL',
            amount: parsedAmount,
            balanceAfter: nextBalance,
            description: `Payout withdrawal via ${account.type} to ${destination}`,
            reference: payout.id,
            status: 'COMPLETED',
          },
        });

        return { payout, nextBalance };
      });

      return res.status(StatusCodes.CREATED).json({
        message: 'Withdrawal request processed successfully',
        payout: result.payout,
        newBalance: result.nextBalance,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Withdrawal processing failed', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  })
);

// GET /worker/ledger — view financial balances, transactions, and payout requests
router.get(
  '/worker/ledger',
  protect,
  authorize('worker', 'admin'),
  asyncHandler(async (req, res) => {
    let userId = req.user._id || req.user.id;
    if (req.user.role === 'admin' && req.query.workerId) {
      userId = req.query.workerId;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          workerProfile: true,
          walletTransactions: { orderBy: { createdAt: 'desc' }, take: 25 },
          payoutRequests: { orderBy: { createdAt: 'desc' }, take: 25 },
        },
      });

      if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND);

      // Calculate COD cash in hand from completed COD bookings
      const codBookings = await prisma.booking.findMany({
        where: {
          workerId: user.id,
          isCodCollected: true,
        },
        select: { codAmountCollected: true, amount: true, platformCommission: true },
      });

      const totalCodCashInHand = codBookings.reduce((sum, b) => sum + (b.codAmountCollected || b.amount || 0), 0);
      const totalCommissionLiability = codBookings.reduce((sum, b) => sum + (b.platformCommission || 0), 0);

      return res.json({
        availableBalance: user.walletBalance,
        totalCodCashInHand,
        totalCommissionLiability,
        transactions: user.walletTransactions || [],
        payoutRequests: user.payoutRequests || [],
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      return res.json({
        availableBalance: 0,
        totalCodCashInHand: 0,
        totalCommissionLiability: 0,
        transactions: [],
        payoutRequests: [],
      });
    }
  })
);

// ===== WORKER SOS EMERGENCY CONTROL (MILESTONE M6) =====

// POST /worker/sos — trigger high-priority SOS emergency
router.post(
  '/worker/sos',
  protect,
  authorize('worker'),
  asyncHandler(async (req, res) => {
    const { bookingId, latitude, longitude, severity } = req.body || {};
    const workerId = req.user._id || req.user.id;

    const normSeverity = String(severity || 'HIGH').toUpperCase() === 'CRITICAL' ? 'CRITICAL' : 'HIGH';

    try {
      const incident = await prisma.workerSosIncident.create({
        data: {
          workerId,
          bookingId: bookingId || null,
          latitude: typeof latitude === 'number' ? latitude : null,
          longitude: typeof longitude === 'number' ? longitude : null,
          severity: normSeverity,
          status: 'ACTIVE',
        },
        include: {
          worker: { select: { id: true, name: true, phone: true } },
          booking: { select: { id: true, bookingId: true, address: true, city: true } },
        },
      });

      if (req.io) {
        req.io.to('admin').emit('emergency:sos_alert', {
          incidentId: incident.id,
          workerName: req.user.name,
          workerPhone: req.user.phone,
          bookingId: incident.booking?.bookingId,
          address: incident.booking?.address,
          severity: normSeverity,
          latitude,
          longitude,
          timestamp: incident.createdAt,
        });
      }

      return res.status(StatusCodes.CREATED).json({
        message: 'EMERGENCY ALERT BROADCASTED. Support desk and on-call coordinators have been alerted.',
        incident,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      return res.status(StatusCodes.CREATED).json({
        message: 'EMERGENCY ALERT RECORDED (Demo)',
        incident: { id: `sos-${Date.now()}`, severity: normSeverity, status: 'ACTIVE' },
      });
    }
  })
);

// GET /worker/sos/active — admin view active emergencies
router.get(
  '/worker/sos/active',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    try {
      const incidents = await prisma.workerSosIncident.findMany({
        where: { status: 'ACTIVE' },
        include: {
          worker: { select: { id: true, name: true, phone: true } },
          booking: { select: { id: true, bookingId: true, address: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(incidents);
    } catch (err) {
      return res.json([]);
    }
  })
);

// PATCH /worker/sos/:id/resolve — resolve emergency incident
router.patch(
  '/worker/sos/:id/resolve',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { adminNote } = req.body || {};
    try {
      const updated = await prisma.workerSosIncident.update({
        where: { id: req.params.id },
        data: {
          status: 'RESOLVED',
          adminNote: adminNote || 'Resolved by admin coordinator',
          resolvedAt: new Date(),
        },
      });
      return res.json({ message: 'Incident marked resolved', incident: updated });
    } catch (err) {
      throw new AppError('Incident not found', StatusCodes.NOT_FOUND);
    }
  })
);

// ===== WORKER TRAINING & CERTIFICATIONS (MILESTONE M6) =====

// GET /worker/training — worker course modules and earned certificates
router.get(
  '/worker/training',
  protect,
  authorize('worker', 'admin'),
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: { include: { certifications: true } } },
      });

      const certs = user?.workerProfile?.certifications || [];
      return res.json({
        modules: [
          {
            id: 'mod-safety-01',
            title: 'Professional Safety & Customer Etiquette',
            durationMins: 15,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            isCompleted: certs.some((c) => c.moduleName.includes('Safety')),
          },
          {
            id: 'mod-quality-02',
            title: 'Quality Standard Workmanship & Dual OTP Protocol',
            durationMins: 20,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            isCompleted: certs.some((c) => c.moduleName.includes('Quality')),
          },
        ],
        certifications: certs,
      });
    } catch (err) {
      return res.json({ modules: [], certifications: [] });
    }
  })
);

// POST /worker/training/complete — submit quiz and issue certificate
router.post(
  '/worker/training/complete',
  protect,
  authorize('worker'),
  asyncHandler(async (req, res) => {
    const { moduleName, score } = req.body || {};
    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore) || parsedScore < 80) {
      throw new AppError('Minimum passing score is 80% to earn a verified certificate', StatusCodes.BAD_REQUEST);
    }

    const userId = req.user._id || req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { workerProfile: true },
      });
      if (!user?.workerProfile) {
        throw new AppError('Worker profile not found', StatusCodes.NOT_FOUND);
      }

      const cert = await prisma.workerCertification.create({
        data: {
          workerProfileId: user.workerProfile.id,
          moduleName: moduleName || 'ServeCircle Professional Certification',
          score: parsedScore,
          certificateCode: `SC-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      });

      // Award pro badge if they earned certifications
      await prisma.workerProfile.update({
        where: { id: user.workerProfile.id },
        data: { isProBadge: true },
      });

      return res.status(StatusCodes.CREATED).json({
        message: 'Congratulations! Certificate earned successfully.',
        certificate: cert,
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Certificate generation failed', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  })
);

// ===== ADMIN ROUTES =====

// GET all users (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { role, search, page = 1, limit = 20 } = req.query;

    // 1. PostgreSQL (Prisma) — authoritative user list
    try {
      const where = { isDeleted: false };
      if (role) where.role = String(role).toUpperCase();
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }
      const total = await prisma.user.count({ where });
      const users = await prisma.user.findMany({
        where,
        include: { workerProfile: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });
      return res.json({
        users: users.map(formatPrismaUser),
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit) || 1,
      });
    } catch (err) {
      let list = [...DEMO_USERS, ...IN_MEMORY_USERS].map(({ password, ...u }) => u);
      if (role) list = list.filter((u) => u.role === role);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
      }
      const total = list.length;
      return res.json({
        users: list.slice((page - 1) * limit, page * limit),
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit) || 1,
      });
    }
  })
);

// GET workers pending verification (admin)
router.get(
  '/workers/pending',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { status } = req.query;

    // 1. PostgreSQL (Prisma) — only persisted worker applications
    try {
      const profileWhere = {};
      const enumStatus = status ? WORKER_STATUS_ENUM[String(status).toLowerCase()] : undefined;
      if (enumStatus) profileWhere.workerStatus = enumStatus;

      const workers = await prisma.user.findMany({
        where: {
          role: 'WORKER',
          isDeleted: false,
          ...(Object.keys(profileWhere).length > 0 ? { workerProfile: { is: profileWhere } } : {}),
        },
        include: { workerProfile: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(workers.map(formatPrismaUser));
    } catch (err) {
      let workers = [...DEMO_USERS, ...IN_MEMORY_USERS]
        .filter((u) => u.role === 'worker')
        .map(({ password, ...u }) => u);
      if (status) workers = workers.filter((w) => w.workerStatus === status);
      return res.json(workers);
    }
  })
);

// PATCH update workerStatus (admin)
router.patch(
  '/:id/worker-status',
  protect,
  authorize('admin'),
  validateWorkerStatusUpdate,
  asyncHandler(async (req, res) => {
    const { workerStatus, workerAdminNote } = req.body;

    // 1. PostgreSQL (Prisma) — an approval here is what dispatch reads
    try {
      const worker = await prisma.user.findFirst({
        where: { id: req.params.id, role: 'WORKER', isDeleted: false },
        include: { workerProfile: true },
      });

      if (worker) {
        const enumStatus = WORKER_STATUS_ENUM[String(workerStatus || '').toLowerCase()];
        if (!enumStatus) {
          throw new AppError('Invalid workerStatus value', StatusCodes.UNPROCESSABLE_ENTITY);
        }

        const profileData = { workerStatus: enumStatus };
        if (workerAdminNote !== undefined) profileData.workerAdminNote = workerAdminNote;
        if (APPROVED_ENUMS.includes(enumStatus)) {
          profileData.isVerified = true;
          profileData.isAvailable = true;
        }
        if (enumStatus === 'REJECTED') {
          profileData.isVerified = false;
        }

        if (worker.workerProfile) {
          await prisma.workerProfile.update({
            where: { userId: worker.id },
            data: profileData,
          });
        } else {
          await prisma.workerProfile.create({
            data: { userId: worker.id, ...profileData },
          });
        }

        notifyWorker(
          req.io,
          worker.id,
          'Worker application updated',
          `Your application status is now ${String(workerStatus).replace(/_/g, ' ')}.`
        );

        // Best-effort analytics on the legacy store; never blocks the decision.
        try {
          updateTrustVerification(worker.id, String(workerStatus).toLowerCase(), formatPrismaUser(worker));
          syncTrustProfile(worker.id);
        } catch (analyticsErr) {
          // ignored: analytics store is optional
        }

        const fresh = await prisma.user.findUnique({
          where: { id: worker.id },
          include: { workerProfile: true },
        });
        return res.json(formatPrismaUser(fresh));
      }

      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    } catch (err) {
      if (err instanceof AppError) throw err;
    }

    const fallback = findFallbackUserById(req.params.id);
    if (!fallback) throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    fallback.workerStatus = workerStatus;
    if (workerAdminNote !== undefined) fallback.workerAdminNote = workerAdminNote;
    if (['approved_rookie', 'approved_junior', 'approved_senior'].includes(workerStatus)) {
      fallback.isVerified = true;
    }
    notifyWorker(req.io, fallback._id, 'Worker application updated', `Your application status is now ${workerStatus.replace(/_/g, ' ')}.`);
    const { password, ...safeUser } = fallback;
    return res.json(safeUser);
  })
);

// PUT verify worker (admin) - legacy route kept for compatibility
router.put(
  '/:id/verify',
  protect,
  authorize('admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const { isVerified } = req.body;

    // 1. PostgreSQL (Prisma)
    try {
      const worker = await prisma.user.findFirst({
        where: { id: req.params.id, role: 'WORKER', isDeleted: false },
        include: { workerProfile: true },
      });
      if (worker) {
        if (!worker.workerProfile) {
          await prisma.workerProfile.create({
            data: { userId: worker.id, isVerified: Boolean(isVerified) },
          });
        } else {
          await prisma.workerProfile.update({
            where: { userId: worker.id },
            data: { isVerified: Boolean(isVerified) },
          });
        }
        const fresh = await prisma.user.findUnique({
          where: { id: worker.id },
          include: { workerProfile: true },
        });
        return res.json(formatPrismaUser(fresh));
      }
      throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    } catch (err) {
      if (err instanceof AppError) throw err;
    }

    const fallback = findFallbackUserById(req.params.id);
    if (!fallback) throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    fallback.isVerified = isVerified;
    const { password, ...safeUser } = fallback;
    return res.json(safeUser);
  })
);

// DELETE /users/:id — soft delete a user (admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    // 1. PostgreSQL (Prisma)
    try {
      const existing = await prisma.user.findFirst({
        where: { id: req.params.id, isDeleted: false },
        select: { id: true },
      });
      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { isDeleted: true, deletedAt: new Date() },
        });
        logEvent({ eventType: EVENT_TYPES.USER_DELETED, entityType: ENTITY_TYPES.USER, entityId: existing.id, actorId: req.user._id, actorRole: 'admin', ...req.reqCtx });
        return res.json({ message: 'User soft-deleted successfully', userId: existing.id });
      }
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    } catch (err) {
      if (err instanceof AppError) throw err;
    }

    const fallback = findFallbackUserById(req.params.id);
    if (!fallback) throw new AppError('User not found', StatusCodes.NOT_FOUND);
    fallback.isDeleted = true;
    fallback.deletedAt = new Date();
    return res.json({ message: 'User soft-deleted successfully', userId: fallback._id });
  })
);

// POST /users/:id/restore — restore a soft-deleted user (admin only)
router.post(
  '/:id/restore',
  protect,
  authorize('admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    // 1. PostgreSQL (Prisma)
    try {
      const existing = await prisma.user.findFirst({
        where: { id: req.params.id, isDeleted: true },
        include: { workerProfile: true },
      });
      if (existing) {
        const restored = await prisma.user.update({
          where: { id: existing.id },
          data: { isDeleted: false, deletedAt: null },
        });
        logEvent({ eventType: EVENT_TYPES.USER_RESTORED, entityType: ENTITY_TYPES.USER, entityId: existing.id, actorId: req.user._id, actorRole: 'admin', ...req.reqCtx });
        return res.json({
          message: 'User restored successfully',
          user: formatPrismaUser({ ...restored, workerProfile: existing.workerProfile }),
        });
      }
      throw new AppError('Deleted user not found', StatusCodes.NOT_FOUND);
    } catch (err) {
      if (err instanceof AppError) throw err;
    }

    const fallback = findFallbackUserById(req.params.id);
    if (!fallback) throw new AppError('Deleted user not found', StatusCodes.NOT_FOUND);
    fallback.isDeleted = false;
    fallback.deletedAt = null;
    const { password, ...safeUser } = fallback;
    return res.json({ message: 'User restored successfully', user: safeUser });
  })
);

export default router;
