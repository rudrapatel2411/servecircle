import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { prisma } from '../config/prisma.js';
import { findFallbackUserById, findFallbackUserByEmail } from '../utils/demoAuthStore.js';

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

const DEMO_TOKEN_MAP = {
  customer: { email: 'rudra@test.com', role: 'CUSTOMER' },
  worker: { email: 'ramesh@test.com', role: 'WORKER' },
  admin: { email: 'admin@servecircle.in', role: 'ADMIN' },
  b2b: { email: 'gv@test.com', role: 'B2B' },
};

async function resolveDemoTokenUser(token) {
  if (!token || typeof token !== 'string') return null;
  if (!token.startsWith('demo-') && !token.startsWith('demo_')) return null;

  const lower = token.toLowerCase();
  let target = DEMO_TOKEN_MAP.customer;
  if (lower.includes('worker')) target = DEMO_TOKEN_MAP.worker;
  else if (lower.includes('admin')) target = DEMO_TOKEN_MAP.admin;
  else if (lower.includes('b2b')) target = DEMO_TOKEN_MAP.b2b;

  // 1. Look up by mapped email in PostgreSQL
  try {
    const dbUser = await prisma.user.findFirst({
      where: { email: target.email, isDeleted: false },
      include: { workerProfile: true },
    });
    if (dbUser) return formatUser(dbUser);
  } catch {}

  // 2. Look up by role in PostgreSQL
  try {
    const dbUser = await prisma.user.findFirst({
      where: { role: target.role, isDeleted: false },
      include: { workerProfile: true },
    });
    if (dbUser) return formatUser(dbUser);
  } catch {}

  // 3. Fallback demo store
  const fbUser = findFallbackUserById(target.email) || findFallbackUserById(token);
  return fbUser ? formatUser(fbUser) : null;
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

    // 1. Direct support for frontend demo tokens
    const demoUser = await resolveDemoTokenUser(token);
    if (demoUser) {
      req.user = demoUser;
      return next();
    }

    // 2. JWT verification
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized — invalid or expired token' });
    }

    let user = null;

    // 1. Look up in PostgreSQL via Prisma
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { workerProfile: true },
      });
      if (dbUser && !dbUser.isDeleted) {
        user = formatUser(dbUser);
      }
    } catch (err) {}

    // 4. Look up in PostgreSQL by email (handles legacy tokens with MongoDB _id)
    if (!user && decoded.email) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: { email: decoded.email, isDeleted: false },
          include: { workerProfile: true },
        });
        if (dbUser) {
          user = formatUser(dbUser);
        }
      } catch (err) {}
    }

    // 2. Mongoose DB fallback if active
    if (!user && mongoose.connection.readyState === 1) {
      try {
        const mUser = await User.findById(decoded.id).select('-password');
        if (mUser) user = formatUser(mUser.toObject ? mUser.toObject() : mUser);
      } catch {
        user = null;
      }
    }

    // 3. Fallback demo store if not in DB
    if (!user) {
      const fbUser = findFallbackUserById(decoded.id) || (decoded.email ? findFallbackUserByEmail(decoded.email) : null);
      if (fbUser) {
        user = formatUser(fbUser);
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Not authorized — user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — auth verification error' });
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
      const demoUser = await resolveDemoTokenUser(token);
      if (demoUser) {
        req.user = demoUser;
        return next();
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        return next();
      }

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

      if (!user && decoded.email) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: { email: decoded.email, isDeleted: false },
            include: { workerProfile: true },
          });
          if (dbUser) user = formatUser(dbUser);
        } catch {}
      }

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
