import express from 'express';
import mongoose from 'mongoose';
import Partner from '../models/Partner.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { DEMO_PARTNERS } from '../utils/demoDataStore.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { type, status } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let list = [...DEMO_PARTNERS];
      if (type) list = list.filter((p) => p.type === type);
      if (status) list = list.filter((p) => p.status === status);
      return res.json(list);
    }

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
    if (mongoose.connection.readyState !== 1) {
      const partner = DEMO_PARTNERS.find((p) => p._id === req.params.id);
      if (!partner) throw new AppError('Partner not found', StatusCodes.NOT_FOUND);
      return res.json(partner);
    }

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
    if (mongoose.connection.readyState !== 1) {
      const newPartner = {
        _id: `prt_${Date.now()}`,
        ...req.body,
        status: req.body.status || 'active',
        createdAt: new Date(),
      };
      DEMO_PARTNERS.unshift(newPartner);
      return res.status(StatusCodes.CREATED).json(newPartner);
    }

    const partner = await Partner.create(req.body);
    res.status(StatusCodes.CREATED).json(partner);
  })
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const partner = DEMO_PARTNERS.find((p) => p._id === req.params.id);
      if (!partner) throw new AppError('Partner not found', StatusCodes.NOT_FOUND);
      Object.assign(partner, req.body);
      return res.json(partner);
    }

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
    if (mongoose.connection.readyState !== 1) {
      const idx = DEMO_PARTNERS.findIndex((p) => p._id === req.params.id);
      if (idx !== -1) DEMO_PARTNERS.splice(idx, 1);
      return res.json({ message: 'Partner deleted' });
    }

    await Partner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partner deleted' });
  })
);

export default router;
