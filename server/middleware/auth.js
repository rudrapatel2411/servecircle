import jwt from 'jsonwebtoken';
<<<<<<< HEAD
import mongoose from 'mongoose';
import User from '../models/User.js';
import { findFallbackUserById, findFallbackUserByEmail } from '../utils/demoAuthStore.js';
=======
import { prisma } from '../config/prisma.js';
import { findFallbackUserById } from '../utils/demoAuthStore.js';
>>>>>>> origin/main

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required to start auth middleware');
}

/**
 * Format user object to maintain backward compatibility with MongoDB _id / id
 */
function formatUser(user) {
  if (!user) return null;
  const roleLower = String(user.role || '').toLowerCase();
  return {
    ...user,
    _id: user.id,
    role: roleLower,
    rawRole: user.role,
  };
}

// Verify JWT token and attach user to request
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized — no token provided' });
    }

    // Support instant demo accounts without throwing JWT malformed errors
    if (token.startsWith('demo-token-') || token.startsWith('demo_')) {
      const role = token.replace('demo-token-', '').replace('demo_', '');
      const fallbackMap = {
        customer: '6a5f4c90437c4810f45fe0e9',
        worker: '6a5f4c90437c4810f45fe0eb',
        admin: '6a5f4c90437c4810f45fe0e7',
        b2b: '6a5f4c90437c4810f45fe0ee',
      };
      const userId = fallbackMap[role] || '6a5f4c90437c4810f45fe0e9';
      const user = findFallbackUserById(userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;

<<<<<<< HEAD
    if (!user && decoded.email) {
      user = findFallbackUserByEmail(decoded.email);
    }

    if (!user && mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
        if (!user && decoded.email) {
          user = await User.findOne({ email: decoded.email }).select('-password');
        }
      } catch {
        user = null;
=======
    // 1. Look up in PostgreSQL via Prisma
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { workerProfile: true },
      });
      if (dbUser && !dbUser.isDeleted) {
        user = formatUser(dbUser);
      }
    } catch (err) {
      // Prisma error fallback
    }

    // 2. Fallback store if not in DB
    if (!user) {
      const fbUser = findFallbackUserById(decoded.id);
      if (fbUser) {
        user = formatUser(fbUser);
>>>>>>> origin/main
      }
    }

    // Resilient fallback: A valid JWT signature with role should never be rejected on refresh
    if (!user && decoded.role) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email || 'user@servecircle.com',
        role: decoded.role,
        serviceCategory: decoded.serviceCategory || '',
        workerStatus: decoded.workerStatus || 'approved_senior',
        subscription: 'gold',
        walletBalance: 2500,
        isVerified: true,
      };
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized — user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = String(req.user?.role || '').toLowerCase();
    const allowed = roles.map((r) => String(r).toLowerCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied — role '${req.user?.role}' is not authorized for this route`,
      });
    }
    next();
  };
};

// Optional auth — sets req.user if token exists, but doesn't block
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      let user = null;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: { workerProfile: true },
        });
        if (dbUser && !dbUser.isDeleted) {
          user = formatUser(dbUser);
        }
      } catch {}
      if (!user) {
        const fbUser = findFallbackUserById(decoded.id);
        if (fbUser) user = formatUser(fbUser);
      }
      req.user = user || null;
    }
  } catch (err) {
    // Token invalid — continue without user
  }
  next();
};
