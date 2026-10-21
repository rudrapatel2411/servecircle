import express from 'express';
import mongoose from 'mongoose';
import WalletTransaction from '../models/WalletTransaction.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { validateWalletTopup } from '../middleware/validation.js';
import { DEMO_TRANSACTIONS } from '../utils/demoDataStore.js';
import { findFallbackUserById } from '../utils/demoAuthStore.js';

const router = express.Router();

// GET wallet balance & transactions
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      const user = findFallbackUserById(req.user._id) || req.user;
      const userTx = DEMO_TRANSACTIONS.filter(
        (tx) => String(tx.user) === String(req.user._id) || !tx.user
      );
      return res.json({
        balance: user?.walletBalance ?? 2450,
        transactions: userTx.slice((page - 1) * limit, page * limit),
        total: userTx.length,
        page: parseInt(page),
        pages: Math.ceil(userTx.length / limit) || 1,
      });
    }

    const user = await User.findById(req.user._id).select('walletBalance');
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await WalletTransaction.countDocuments({ user: req.user._id });

    res.json({
      balance: user?.walletBalance ?? 0,
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit) || 1,
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

    if (mongoose.connection.readyState !== 1) {
      const fallbackUser = findFallbackUserById(req.user._id) || req.user;
      const newBalance = (fallbackUser.walletBalance || 0) + Number(amount);
      fallbackUser.walletBalance = newBalance;
      req.user.walletBalance = newBalance;

      const tx = {
        _id: `tx_${Date.now()}`,
        user: req.user._id,
        type: 'topup',
        amount: Number(amount),
        balanceAfter: newBalance,
        description: `Wallet top-up via ${paymentMethod || 'UPI'}`,
        paymentMethod: paymentMethod || 'UPI',
        status: 'completed',
        createdAt: new Date(),
      };
      DEMO_TRANSACTIONS.unshift(tx);
      return res.status(StatusCodes.CREATED).json({ balance: newBalance, transaction: tx });
    }

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

    if (mongoose.connection.readyState !== 1) {
      const fallbackUser = findFallbackUserById(req.user._id) || req.user;
      const currentBalance = fallbackUser.walletBalance || 0;
      if (currentBalance < Number(amount)) {
        throw new AppError('Insufficient wallet balance', StatusCodes.BAD_REQUEST);
      }

      const newBalance = currentBalance - Number(amount);
      fallbackUser.walletBalance = newBalance;
      req.user.walletBalance = newBalance;

      const tx = {
        _id: `tx_${Date.now()}`,
        user: req.user._id,
        type: 'payment',
        amount: -Number(amount),
        balanceAfter: newBalance,
        description: description || 'Service payment',
        booking: bookingId || undefined,
        status: 'completed',
        createdAt: new Date(),
      };
      DEMO_TRANSACTIONS.unshift(tx);
      return res.json({ balance: newBalance, transaction: tx });
    }

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

    if (mongoose.connection.readyState !== 1) {
      const fallbackUser = findFallbackUserById(req.user._id) || req.user;
      const newBalance = (fallbackUser.walletBalance || 0) + Number(amount);
      fallbackUser.walletBalance = newBalance;
      req.user.walletBalance = newBalance;

      const tx = {
        _id: `tx_${Date.now()}`,
        user: req.user._id,
        type: 'refund',
        amount: Number(amount),
        balanceAfter: newBalance,
        description: description || 'Booking refund',
        booking: bookingId || undefined,
        status: 'completed',
        createdAt: new Date(),
      };
      DEMO_TRANSACTIONS.unshift(tx);
      return res.json({ balance: newBalance, transaction: tx });
    }

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
