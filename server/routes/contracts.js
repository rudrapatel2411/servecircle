import express from 'express';
import Contract from '../models/Contract.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

// GET all contracts (admin)
router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
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
  authorize('b2b'),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = { partner: req.user._id };
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
  authorize('admin', 'b2b'),
  asyncHandler(async (req, res) => {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) throw new AppError('Contract not found', StatusCodes.NOT_FOUND);
    res.json(contract);
  })
);

export default router;
