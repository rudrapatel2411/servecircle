import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { logEvent, logActivity, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';
import { findFallbackUserByEmail, addFallbackUser, verifyPassword } from '../utils/demoAuthStore.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required to start auth routes');
}

const PUBLIC_ROLES = ['customer', 'worker', 'b2b'];

// Register
router.post(
  '/register',
  validateRegister,
  asyncHandler(async (req, res) => {
    const {
      name, email, phone, password, role,
      skills, serviceCategory, city, experience, companyName,
    } = req.body;

    const normalizedRole = role || 'customer';
    if (!PUBLIC_ROLES.includes(normalizedRole)) {
      throw new AppError('This role cannot be self-registered', StatusCodes.FORBIDDEN);
    }

    // Resilient offline fallback if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      const existing = findFallbackUserByEmail(email);
      if (existing) {
        throw new AppError('User already exists with this email', StatusCodes.BAD_REQUEST);
      }
      const demoId = `demo_${Date.now()}`;
      const newUser = {
        _id: demoId,
        name: name || 'Demo User',
        email,
        password,
        phone: phone || '9876543210',
        role: normalizedRole,
        subscription: 'basic',
        walletBalance: 0,
        skills: skills || [],
        serviceCategory: serviceCategory || '',
        city: city || '',
        experience: experience || 'Fresher',
        workerStatus: normalizedRole === 'worker' ? 'pending_interview' : undefined,
        companyName: normalizedRole === 'b2b' ? companyName : undefined,
        isVerified: false,
      };
      addFallbackUser(newUser);

      const token = jwt.sign({ id: demoId, role: normalizedRole }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(StatusCodes.CREATED).json({
        token,
        user: {
          id: demoId,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          subscription: newUser.subscription,
          walletBalance: newUser.walletBalance,
        },
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email', StatusCodes.BAD_REQUEST);
    }

    const userData = { name, email, phone, password, role: normalizedRole };
    if (normalizedRole === 'worker') {
      userData.skills = skills || [];
      userData.serviceCategory = serviceCategory || '';
      userData.city = city || '';
      userData.experience = experience || 'Fresher';
      userData.workerStatus = 'pending_interview';
    }
    if (normalizedRole === 'b2b') {
      userData.companyName = companyName;
    }

    const user = await User.create(userData);
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Phase 2: log registration event
    try {
      logEvent({ eventType: EVENT_TYPES.USER_REGISTERED, entityType: ENTITY_TYPES.USER, entityId: user._id, actorId: user._id, actorRole: user.role, metadata: { name: user.name, email: user.email, role: user.role }, ...req.reqCtx });
    } catch {
      // ignore logging errors
    }

    res.status(StatusCodes.CREATED).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        workerStatus: user.workerStatus,
        subscription: user.subscription,
        walletBalance: user.walletBalance,
        avatar: user.avatar,
      },
    });
  })
);

// Login
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    let user = null;

    // 1. Try finding in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email });
      } catch (dbErr) {
        console.warn('DB lookup failed, checking fallback store:', dbErr.message);
        user = null;
      }
    }

    // 2. If not found in DB or DB not connected, check demo / fallback store
    if (!user) {
      const fallbackUser = findFallbackUserByEmail(email);
      if (fallbackUser) {
        const isMatch = await verifyPassword(fallbackUser, password);
        if (!isMatch) {
          throw new AppError('Invalid email or password', StatusCodes.BAD_REQUEST);
        }
        user = fallbackUser;
      }
    } else {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AppError('Invalid email or password', StatusCodes.BAD_REQUEST);
      }
    }

    if (!user) {
      throw new AppError('Invalid email or password', StatusCodes.BAD_REQUEST);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Phase 2: log login event
    try {
      logEvent({ eventType: EVENT_TYPES.USER_LOGGED_IN, entityType: ENTITY_TYPES.USER, entityId: user._id, actorId: user._id, actorRole: user.role, metadata: { email: user.email }, ...req.reqCtx });
      logActivity({ userId: user._id, role: user.role, action: 'LOGIN', module: 'auth', ...req.reqCtx });
    } catch {
      // ignore logging errors
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        workerStatus: user.workerStatus || null,
        skills: user.skills || [],
        serviceCategory: user.serviceCategory || null,
        city: user.city || null,
        experience: user.experience || null,
        completedJobs: user.completedJobs || 0,
        shadowJobsDone: user.shadowJobsDone || 0,
        rating: user.rating || 0,
        subscription: user.subscription || 'basic',
        walletBalance: user.walletBalance || 0,
        avatar: user.avatar || '',
        isVerified: user.isVerified || false,
        companyName: user.companyName || null,
      },
    });
  })
);

// Verify token
router.get(
  '/verify',
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      valid: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        subscription: req.user.subscription,
      },
    });
  })
);

export default router;
