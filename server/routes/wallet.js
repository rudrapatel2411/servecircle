import express from 'express';
import WalletTransaction from '../models/WalletTransaction.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET wallet balance & transactions
router.get('/', protect, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST top-up wallet
router.post('/topup', protect, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

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

    res.status(201).json({ balance: newBalance, transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST pay from wallet (deduct balance)
router.post('/pay', protect, async (req, res) => {
  try {
    const { amount, description, bookingId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const user = await User.findById(req.user._id);
    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST refund to wallet
router.post('/refund', protect, async (req, res) => {
  try {
    const { amount, description, bookingId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
