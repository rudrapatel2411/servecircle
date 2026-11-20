// server/routes/coupons.js
import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { DEMO_COUPONS } from '../utils/demoDataStore.js';

const router = express.Router();

function formatCoupon(c) {
  if (!c) return null;
  return {
    ...c,
    _id: c.id,
    discountType: String(c.discountType || '').toLowerCase(),
  };
}

// GET /coupons/available — public/customer view of active offers
router.get(
  '/available',
  asyncHandler(async (req, res) => {
    try {
      const now = new Date();
      const coupons = await prisma.coupon.findMany({
        where: {
          isActive: true,
          validFrom: { lte: now },
          validUntil: { gte: now },
        },
        orderBy: { discountValue: 'desc' },
      });
      if (coupons.length > 0) {
        return res.json(coupons.map(formatCoupon));
      }
    } catch (err) {
      console.warn('[Coupons /available] PostgreSQL fallback:', err.message);
    }
    res.json(DEMO_COUPONS.filter((c) => c.isActive));
  })
);

// GET /coupons — all coupons (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { active } = req.query;

    try {
      const where = {};
      if (active === 'true') where.isActive = true;
      if (active === 'false') where.isActive = false;

      const coupons = await prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return res.json(coupons.map(formatCoupon));
    } catch (err) {
      console.warn('[Coupons /] PostgreSQL fallback:', err.message);
      let list = [...DEMO_COUPONS];
      if (active === 'true') list = list.filter((c) => c.isActive);
      if (active === 'false') list = list.filter((c) => !c.isActive);
      res.json(list);
    }
  })
);

// POST /coupons/validate — validate coupon (customer / checkout)
router.post(
  '/validate',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { code, orderAmount = 0, category = '' } = req.body;
    if (!code) {
      throw new AppError('Coupon code is required', StatusCodes.BAD_REQUEST);
    }

    const cleanCode = String(code).trim().toUpperCase();
    let coupon = null;

    try {
      coupon = await prisma.coupon.findFirst({
        where: { code: cleanCode, isActive: true },
      });
    } catch (err) {
      console.warn('[Coupon] DB lookup failed, falling back:', err.message);
    }

    if (!coupon) {
      coupon = DEMO_COUPONS.find((c) => c.code === cleanCode && c.isActive);
    }

    if (!coupon) {
      throw new AppError('Coupon not found or inactive', StatusCodes.NOT_FOUND);
    }

    const now = new Date();
    if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
      throw new AppError('Coupon has expired or is not yet valid', StatusCodes.BAD_REQUEST);
    }
    if (coupon.usedCount >= (coupon.usageLimit || 100)) {
      throw new AppError('Coupon usage limit reached', StatusCodes.BAD_REQUEST);
    }
    if (Number(orderAmount) < Number(coupon.minOrderAmount || 0)) {
      throw new AppError(`Minimum order amount is ₹${coupon.minOrderAmount}`, StatusCodes.BAD_REQUEST);
    }
    if (
      Array.isArray(coupon.applicableCategories) &&
      coupon.applicableCategories.length > 0 &&
      category &&
      !coupon.applicableCategories.some((cat) => cat.toLowerCase() === category.toLowerCase())
    ) {
      throw new AppError('Coupon not applicable for this service category', StatusCodes.BAD_REQUEST);
    }

    let discount = 0;
    const amount = Number(orderAmount);
    const discType = String(coupon.discountType).toLowerCase();
    if (discType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, amount);

    res.json({
      valid: true,
      code: coupon.code,
      discount: Math.round(discount),
      finalAmount: Math.max(0, Math.round(amount - discount)),
      coupon: formatCoupon(coupon),
    });
  })
);

// POST /coupons — create coupon (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { code, discountValue, discountType, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, applicableCategories } = req.body;

    try {
      const created = await prisma.coupon.create({
        data: {
          code: String(code).trim().toUpperCase(),
          discountValue: Number(discountValue) || 10,
          discountType: (discountType || 'PERCENTAGE').toUpperCase(),
          minOrderAmount: Number(minOrderAmount) || 0.0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          usageLimit: Number(usageLimit) || 100,
          validFrom: validFrom ? new Date(validFrom) : new Date(),
          validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
          isActive: true,
          createdById: req.user.id || req.user._id,
        },
      });
      return res.status(StatusCodes.CREATED).json(formatCoupon(created));
    } catch (err) {
      console.warn('[Coupons POST] PostgreSQL fallback:', err.message);
      const newCoupon = {
        _id: `cpn_${Date.now()}`,
        ...req.body,
        code: String(code).trim().toUpperCase(),
        createdAt: new Date(),
        usedCount: 0,
      };
      DEMO_COUPONS.unshift(newCoupon);
      return res.status(StatusCodes.CREATED).json(newCoupon);
    }
  })
);

// DELETE /coupons/:id
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.coupon.delete({ where: { id } });
      return res.json({ message: 'Coupon deleted' });
    } catch (err) {
      console.warn('[Coupons DELETE] PostgreSQL fallback:', err.message);
      const idx = DEMO_COUPONS.findIndex((c) => c._id === id || c.code === id);
      if (idx !== -1) DEMO_COUPONS.splice(idx, 1);
      return res.json({ message: 'Coupon deleted' });
    }
  })
);

export default router;
