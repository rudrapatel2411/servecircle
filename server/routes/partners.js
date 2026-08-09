import express from 'express';
import Partner from '../models/Partner.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    const partners = await Partner.find(query).sort('-createdAt');
    res.json(partners);
  })
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const partner = await Partner.findById(req.params.id).populate('linkedUser', 'name email');
    if (!partner) throw new AppError('Partner not found', StatusCodes.NOT_FOUND);
    res.json(partner);
  })
);

router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const partner = await Partner.create(req.body);
    res.status(StatusCodes.CREATED).json(partner);
  })
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partner) throw new AppError('Partner not found', StatusCodes.NOT_FOUND);
    res.json(partner);
  })
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partner deleted' });
  })
);

export default router;
