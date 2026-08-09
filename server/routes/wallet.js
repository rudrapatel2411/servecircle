import express from 'express';
import WalletTransaction from '../models/WalletTransaction.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { validateWalletTopup } from '../middleware/validation.js';

const router = express.Router();

// GET wallet balance & transactions
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('walletBalance');
    const { page = 1, limit = 20 } = req.query;

    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await WalletTransaction.countDocuments({ user: req.user._id });

    res.json({
      balance: user.walletBalance,
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  })
);

// POST top-up wallet
router.post(
  '/topup',
  protect,
  validateWalletTopup,
  asyncHandler(async (req, res) => {
    const { amount, paymentMethod } = req.body;

    const user = await User.findById(req.user._id);
    const newBalance = user.walletBalance + amount;
    user.walletBalance = newBalance;
    await user.save();

    const transaction = await WalletTransaction.create({
      user: req.user._id,
      type: 'topup',
      amount,
      balanceAfter: newBalance,
      description: `Wallet top-up via ${paymentMethod || 'UPI'}`,
      paymentMethod: paymentMethod || 'UPI',
    });

    res.status(StatusCodes.CREATED).json({ balance: newBalance, transaction });
  })
);

// POST pay from wallet
router.post(
  '/pay',
  protect,
  validateWalletTopup,
  asyncHandler(async (req, res) => {
    const { amount, description, bookingId } = req.body;

    const user = await User.findById(req.user._id);
    if (user.walletBalance < amount) {
      throw new AppError('Insufficient wallet balance', StatusCodes.BAD_REQUEST);
    }

    const newBalance = user.walletBalance - amount;
    user.walletBalance = newBalance;
    await user.save();

    const transaction = await WalletTransaction.create({
      user: req.user._id,
      type: 'payment',
      amount: -amount,
      balanceAfter: newBalance,
      description: description || 'Service payment',
      booking: bookingId || undefined,
    });

    res.json({ balance: newBalance, transaction });
  })
);

// POST refund to wallet
router.post(
  '/refund',
  protect,
  validateWalletTopup,
  asyncHandler(async (req, res) => {
    const { amount, description, bookingId } = req.body;

    const user = await User.findById(req.user._id);
    const newBalance = user.walletBalance + amount;
    user.walletBalance = newBalance;
    await user.save();

    const transaction = await WalletTransaction.create({
      user: req.user._id,
      type: 'refund',
      amount,
      balanceAfter: newBalance,
      description: description || 'Booking refund',
      booking: bookingId || undefined,
    });

    res.json({ balance: newBalance, transaction });
  })
);

export default router;
