import express from 'express';
import mongoose from 'mongoose';
import Coupon from '../models/Coupon.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { DEMO_COUPONS } from '../utils/demoDataStore.js';

const router = express.Router();

// GET /coupons/available — public/customer view of active offers
router.get(
  '/available',
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      return res.json(DEMO_COUPONS.filter((c) => c.isActive));
    }
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).sort('-discountValue');
    res.json(coupons);
  })
);

// GET /coupons — all coupons (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { active } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let list = [...DEMO_COUPONS];
      if (active === 'true') list = list.filter((c) => c.isActive);
      if (active === 'false') list = list.filter((c) => !c.isActive);
      return res.json(list);
    }

    const query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const coupons = await Coupon.find(query).sort('-createdAt');
    res.json(coupons);
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

    if (mongoose.connection.readyState === 1) {
      try {
        coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      } catch (err) {
        console.warn('[Coupon] DB lookup failed, falling back:', err.message);
      }
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
    if (coupon.discountType === 'percentage') {
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
      coupon,
    });
  })
);

// POST /coupons — create coupon (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const newCoupon = {
        _id: `cpn_${Date.now()}`,
        ...req.body,
        code: req.body.code.toUpperCase(),
        usedCount: 0,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };
      DEMO_COUPONS.unshift(newCoupon);
      return res.status(StatusCodes.CREATED).json(newCoupon);
    }

    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id }).catch((err) => {
      if (err.code === 11000) throw new AppError('Coupon code already exists', StatusCodes.BAD_REQUEST);
      throw err;
    });
    res.status(StatusCodes.CREATED).json(coupon);
  })
);

// PUT /coupons/:id — update coupon (admin)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const idx = DEMO_COUPONS.findIndex((c) => c._id === req.params.id);
      if (idx === -1) throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
      DEMO_COUPONS[idx] = { ...DEMO_COUPONS[idx], ...req.body };
      return res.json(DEMO_COUPONS[idx]);
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
    res.json(coupon);
  })
);

// DELETE /coupons/:id — delete coupon (admin)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const idx = DEMO_COUPONS.findIndex((c) => c._id === req.params.id);
      if (idx === -1) throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
      DEMO_COUPONS.splice(idx, 1);
      return res.json({ message: 'Coupon deleted' });
    }

    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
    res.json({ message: 'Coupon deleted' });
  })
);

export default router;
