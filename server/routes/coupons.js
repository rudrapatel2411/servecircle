import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

// GET all coupons (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { active } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const coupons = await Coupon.find(query).sort('-createdAt');
    res.json(coupons);
  })
);

// POST validate coupon (customer)
router.post(
  '/validate',
  protect,
  asyncHandler(async (req, res) => {
    const { code, orderAmount, category } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) throw new AppError('Coupon not found or inactive', StatusCodes.NOT_FOUND);

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new AppError('Coupon has expired or is not yet valid', StatusCodes.BAD_REQUEST);
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', StatusCodes.BAD_REQUEST);
    }
    if (orderAmount < coupon.minOrderAmount) {
      throw new AppError(`Minimum order amount is \u20B9${coupon.minOrderAmount}`, StatusCodes.BAD_REQUEST);
    }
    if (
      coupon.applicableCategories.length > 0 &&
      category &&
      !coupon.applicableCategories.includes(category)
    ) {
      throw new AppError('Coupon not applicable for this service category', StatusCodes.BAD_REQUEST);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({ valid: true, discount, finalAmount: orderAmount - discount, coupon });
  })
);

// POST create coupon (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id }).catch((err) => {
      if (err.code === 11000) throw new AppError('Coupon code already exists', StatusCodes.BAD_REQUEST);
      throw err;
    });
    res.status(StatusCodes.CREATED).json(coupon);
  })
);

// PUT update coupon (admin)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
    res.json(coupon);
  })
);

// DELETE coupon (admin)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
    res.json({ message: 'Coupon deleted' });
  })
);

export default router;
