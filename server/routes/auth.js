// server/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
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

function formatAuthResponse(user) {
  const roleLower = String(user.role || '').toLowerCase();
  return {
    id: user.id,
    _id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: roleLower,
    city: user.city || '',
    walletBalance: user.walletBalance ?? 0,
    avatar: user.avatar || '',
    workerStatus: user.workerProfile?.workerStatus || null,
    skills: user.workerProfile?.skills || [],
    serviceCategory: user.workerProfile?.serviceCategory || '',
    rating: user.workerProfile?.rating ?? 5.0,
    isVerified: user.workerProfile?.isVerified ?? false,
    workerIdCode: user.workerProfile?.workerIdCode || '',
  };
}

// Register
router.post(
  '/register',
  validateRegister,
  asyncHandler(async (req, res) => {
    const {
      name, email, phone, password, role,
      skills, serviceCategory, city, experience, companyName,
    } = req.body;

    const normalizedRole = role ? role.toLowerCase() : 'customer';
    if (!PUBLIC_ROLES.includes(normalizedRole)) {
      throw new AppError('This role cannot be self-registered', StatusCodes.FORBIDDEN);
    }

    try {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing) {
        throw new AppError('User already exists with this email', StatusCodes.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const prismaRole = normalizedRole.toUpperCase();

      const user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            name,
            email,
            phone: phone || null,
            password: hashedPassword,
            role: prismaRole,
            city: city || 'Mumbai',
            walletBalance: 0.0,
          },
        });

        if (prismaRole === 'WORKER') {
          const profile = await tx.workerProfile.create({
            data: {
              userId: createdUser.id,
              serviceCategory: serviceCategory || 'Home Repairs',
              skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
              experience: experience || 'Fresher',
              workerStatus: 'PENDING_INTERVIEW',
              workerIdCode: `WK-${Math.floor(1000 + Math.random() * 9000)}`,
            },
          });
          createdUser.workerProfile = profile;
        }

        return createdUser;
      });

      const token = jwt.sign({ id: user.id, role: normalizedRole }, JWT_SECRET, { expiresIn: '7d' });

      try {
        logEvent({ eventType: EVENT_TYPES.USER_REGISTERED, entityType: ENTITY_TYPES.USER, entityId: user.id, actorId: user.id, actorRole: normalizedRole, metadata: { name: user.name, email: user.email, role: normalizedRole }, ...req.reqCtx });
      } catch {}

      return res.status(StatusCodes.CREATED).json({
        token,
        user: formatAuthResponse(user),
      });
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.warn('[Register] PostgreSQL fallback to demo store:', err.message);

      // Demo fallback
      const existing = findFallbackUserByEmail(email);
      if (existing) {
        throw new AppError('User already exists with this email', StatusCodes.BAD_REQUEST);
      }
      const demoId = `demo_${Date.now()}`;
      const newUser = {
        _id: demoId,
        id: demoId,
        name: name || 'Demo User',
        email,
        password,
        phone: phone || '9876543210',
        role: normalizedRole,
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
        user: newUser,
      });
    }
  })
);

// Login
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    let user = null;

    // 1. Look up user in PostgreSQL via Prisma
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: { workerProfile: true },
      });
      if (dbUser && !dbUser.isDeleted) {
        const isMatch = await bcrypt.compare(password, dbUser.password);
        if (isMatch) {
          user = dbUser;
        }
      }
    } catch (dbErr) {
      console.warn('[Login] PostgreSQL lookup fallback:', dbErr.message);
    }

    // 2. Fallback store check if not in DB
    if (!user) {
      const fallbackUser = findFallbackUserByEmail(email);
      if (fallbackUser) {
        const isMatch = await verifyPassword(fallbackUser, password);
        if (isMatch) {
          user = fallbackUser;
        }
      }
    }

    if (!user) {
      throw new AppError('Invalid email or password', StatusCodes.BAD_REQUEST);
    }

    const userId = user.id || user._id;
    const userRole = String(user.role || '').toLowerCase();
    const token = jwt.sign({ id: userId, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    try {
      logEvent({ eventType: EVENT_TYPES.USER_LOGGED_IN, entityType: ENTITY_TYPES.USER, entityId: userId, actorId: userId, actorRole: userRole, metadata: { email: user.email }, ...req.reqCtx });
      logActivity({ userId, role: userRole, action: 'LOGIN', module: 'auth', ...req.reqCtx });
    } catch {}

    res.json({
      token,
      user: formatAuthResponse(user),
    });
  })
);

// Get current user profile
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ user: formatAuthResponse(req.user) });
  })
);

export default router;
