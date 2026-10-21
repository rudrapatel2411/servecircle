import express from 'express';
import mongoose from 'mongoose';
import Contract from '../models/Contract.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { DEMO_CONTRACTS } from '../utils/demoDataStore.js';

const router = express.Router();

// GET all contracts (admin)
router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      return res.json(DEMO_CONTRACTS);
    }

    const contracts = await Contract.find()
      .populate('partner', 'name companyName email')
      .sort('-createdAt');
    res.json(contracts);
  })
);

// GET my contracts (B2B)
router.get(
  '/',
  protect,
  authorize('b2b', 'admin'),
  asyncHandler(async (req, res) => {
    const { status } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let list = [...DEMO_CONTRACTS];
      if (req.user.role === 'b2b') {
        list = list.filter((c) => String(c.partner) === String(req.user._id));
      }
      if (status) {
        list = list.filter((c) => c.status === status);
      }
      return res.json(list);
    }

    const query = req.user.role === 'admin' ? {} : { partner: req.user._id };
    if (status) query.status = status;

    const contracts = await Contract.find(query).sort('-createdAt');
    res.json(contracts);
  })
);

// GET single contract
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const contract = DEMO_CONTRACTS.find((c) => c._id === req.params.id || c.contractId === req.params.id);
      if (!contract) throw new AppError('Contract not found', StatusCodes.NOT_FOUND);
      return res.json(contract);
    }

    const contract = await Contract.findById(req.params.id).populate(
      'partner',
      'name companyName email phone'
    );
    if (!contract) throw new AppError('Contract not found', StatusCodes.NOT_FOUND);

    if (
      req.user.role === 'b2b' &&
      contract.partner._id.toString() !== req.user._id.toString()
    ) {
      throw new AppError('Access denied', StatusCodes.FORBIDDEN);
    }

    res.json(contract);
  })
);

// POST create contract (admin or B2B)
router.post(
  '/',
  protect,
  authorize('admin', 'b2b'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const count = DEMO_CONTRACTS.length;
      const contractId = `CON-${(count + 1001).toString()}`;
      const newContract = {
        _id: `cnt_${Date.now()}`,
        ...req.body,
        contractId,
        partner: req.body.partner || req.user._id,
        partnerName: req.body.partnerName || req.user.companyName || req.user.name,
        createdAt: new Date(),
      };
      DEMO_CONTRACTS.unshift(newContract);
      return res.status(StatusCodes.CREATED).json(newContract);
    }

    const count = await Contract.countDocuments();
    const contractId = `CON-${(count + 1001).toString()}`;

    const contract = await Contract.create({
      ...req.body,
      contractId,
      partner: req.body.partner || req.user._id,
    });

    res.status(StatusCodes.CREATED).json(contract);
  })
);

// PUT update contract
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const contract = DEMO_CONTRACTS.find((c) => c._id === req.params.id || c.contractId === req.params.id);
      if (!contract) throw new AppError('Contract not found', StatusCodes.NOT_FOUND);
      Object.assign(contract, req.body);
      return res.json(contract);
    }

    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) throw new AppError('Contract not found', StatusCodes.NOT_FOUND);
    res.json(contract);
  })
);

// DELETE contract
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const idx = DEMO_CONTRACTS.findIndex((c) => c._id === req.params.id || c.contractId === req.params.id);
      if (idx !== -1) DEMO_CONTRACTS.splice(idx, 1);
      return res.json({ message: 'Contract deleted' });
    }

    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) throw new AppError('Contract not found', StatusCodes.NOT_FOUND);
    res.json({ message: 'Contract deleted' });
  })
);

export default router;
