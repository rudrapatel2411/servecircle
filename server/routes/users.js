import express from 'express';
import User from '../models/User.js';
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



const router = express.Router();

// GET current user profile
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
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

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    logEvent({ eventType: EVENT_TYPES.USER_PROFILE_UPDATED, entityType: ENTITY_TYPES.USER, entityId: req.user._id, actorId: req.user._id, actorRole: req.user.role, metadata: updates, ...req.reqCtx });
    res.json(user);
  })
);


// PUT change password
router.put(
  '/me/password',
  protect,
  validateChangePassword,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Current password is incorrect', StatusCodes.BAD_REQUEST);

    user.password = newPassword;
    await user.save();
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
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscription: plan },
      { new: true }
    ).select('-password');
    res.json(user);
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
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  })
);

// GET workers pending verification (admin)
router.get(
  '/workers/pending',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = { role: 'worker' };
    if (status) query.workerStatus = status;
    const workers = await User.find(query).select('-password').sort('-createdAt');
    res.json(workers);
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

    const updates = { workerStatus };
    if (workerAdminNote !== undefined) updates.workerAdminNote = workerAdminNote;
    if (['approved_rookie', 'approved_junior', 'approved_senior'].includes(workerStatus)) {
      updates.isVerified = true;
    }

    const worker = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'worker' },
      updates,
      { new: true }
    ).select('-password');

    if (!worker) throw new AppError('Worker not found', StatusCodes.NOT_FOUND);

    // Phase 2
    if (['approved_rookie', 'approved_junior', 'approved_senior'].includes(workerStatus)) {
      ensureWorkerMetrics(worker._id);
    }
    updateTrustVerification(worker._id, workerStatus, worker);
    syncTrustProfile(worker._id);
    logEvent({ eventType: EVENT_TYPES.WORKER_STATUS_UPDATED, entityType: ENTITY_TYPES.USER, entityId: worker._id, actorId: req.user._id, actorRole: 'admin', metadata: { workerStatus, workerAdminNote }, ...req.reqCtx });

    res.json(worker);
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
    const worker = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'worker' },
      { isVerified },
      { new: true }
    ).select('-password');

    if (!worker) throw new AppError('Worker not found', StatusCodes.NOT_FOUND);
    res.json(worker);
  })
);

// DELETE /users/:id — soft delete a user (admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    ).select('-password');
    if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND);
    logEvent({ eventType: EVENT_TYPES.USER_DELETED, entityType: ENTITY_TYPES.USER, entityId: user._id, actorId: req.user._id, actorRole: 'admin', ...req.reqCtx });
    res.json({ message: 'User soft-deleted successfully', userId: user._id });
  })
);


// POST /users/:id/restore — restore a soft-deleted user (admin only)
router.post(
  '/:id/restore',
  protect,
  authorize('admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    // Use collection directly to bypass the soft-delete pre-find Mongoose hook
    const { ObjectId } = (await import('mongodb')).default;
    const result = await User.collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { returnDocument: 'after' }
    );
    if (!result) throw new AppError('Deleted user not found', StatusCodes.NOT_FOUND);
    const { password: _pw, ...safeUser } = result;
    logEvent({ eventType: EVENT_TYPES.USER_RESTORED, entityType: ENTITY_TYPES.USER, entityId: result._id, actorId: req.user._id, actorRole: 'admin', ...req.reqCtx });
    res.json({ message: 'User restored successfully', user: safeUser });
  })
);



export default router;

