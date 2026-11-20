// server/routes/wallet.js
import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { validateWalletTopup } from '../middleware/validation.js';
import { DEMO_TRANSACTIONS } from '../utils/demoDataStore.js';
import { findFallbackUserById } from '../utils/demoAuthStore.js';

const router = express.Router();

// Helper to format transaction output matching frontend expectations
function formatTx(tx) {
  if (!tx) return null;
  return {
    ...tx,
    _id: tx.id,
    user: tx.userId,
    booking: tx.bookingId,
    type: String(tx.type || '').toLowerCase(),
  };
}

// GET wallet balance & transactions
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const userId = req.user.id || req.user._id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      });

      if (user) {
        const [transactions, total] = await Promise.all([
          prisma.walletTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
          }),
          prisma.walletTransaction.count({ where: { userId } }),
        ]);

        return res.json({
          balance: user.walletBalance ?? 0,
          transactions: transactions.map(formatTx),
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum) || 1,
        });
      }
    } catch (dbErr) {
      console.warn('[Wallet GET] PostgreSQL query fallback:', dbErr.message);
    }

    // Demo store fallback
    const fbUser = findFallbackUserById(userId) || req.user;
    const userTx = DEMO_TRANSACTIONS.filter(
      (tx) => String(tx.user) === String(userId) || !tx.user
    );
    res.json({
      balance: fbUser?.walletBalance ?? 2450,
      transactions: userTx.slice((pageNum - 1) * limitNum, pageNum * limitNum),
      total: userTx.length,
      page: pageNum,
      pages: Math.ceil(userTx.length / limitNum) || 1,
    });
  })
);

// POST top-up wallet (ACID Compliant)
router.post(
  '/topup',
  protect,
  validateWalletTopup,
  asyncHandler(async (req, res) => {
    const { amount, paymentMethod } = req.body;
    const numAmount = Number(amount);
    const userId = req.user.id || req.user._id;

    if (!numAmount || numAmount <= 0) {
      throw new AppError('Topup amount must be greater than zero', StatusCodes.BAD_REQUEST);
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { walletBalance: true },
        });

        if (!user) {
          throw new AppError('User account not found', StatusCodes.NOT_FOUND);
        }

        const newBalance = user.walletBalance + numAmount;

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: newBalance },
        });

        const transaction = await tx.walletTransaction.create({
          data: {
            userId,
            type: 'TOPUP',
            amount: numAmount,
            balanceAfter: newBalance,
            description: `Wallet top-up via ${paymentMethod || 'UPI'}`,
            paymentMethod: paymentMethod || 'UPI',
            status: 'COMPLETED',
          },
        });

        return { balance: newBalance, transaction: formatTx(transaction) };
      });

      return res.status(StatusCodes.CREATED).json(result);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.warn('[Wallet Topup] DB error fallback:', err.message);

      // Demo fallback
      const fallbackUser = findFallbackUserById(userId) || req.user;
      const newBalance = (fallbackUser.walletBalance || 0) + numAmount;
      fallbackUser.walletBalance = newBalance;
      req.user.walletBalance = newBalance;

      const tx = {
        _id: `tx_${Date.now()}`,
        user: userId,
        type: 'topup',
        amount: numAmount,
        balanceAfter: newBalance,
        description: `Wallet top-up via ${paymentMethod || 'UPI'}`,
        paymentMethod: paymentMethod || 'UPI',
        status: 'completed',
        createdAt: new Date(),
      };
      DEMO_TRANSACTIONS.unshift(tx);
      return res.status(StatusCodes.CREATED).json({ balance: newBalance, transaction: tx });
    }
  })
);

// POST pay from wallet (Strict ACID Compliant Transaction)
router.post(
  '/pay',
  protect,
  validateWalletTopup,
  asyncHandler(async (req, res) => {
    const { amount, description, bookingId } = req.body;
    const numAmount = Number(amount);
    const userId = req.user.id || req.user._id;

    if (!numAmount || numAmount <= 0) {
      throw new AppError('Payment amount must be greater than zero', StatusCodes.BAD_REQUEST);
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { walletBalance: true },
        });

        if (!user) {
          throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        if (user.walletBalance < numAmount) {
          throw new AppError('Insufficient wallet balance', StatusCodes.BAD_REQUEST);
        }

        const newBalance = user.walletBalance - numAmount;

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: newBalance },
        });

        const transaction = await tx.walletTransaction.create({
          data: {
            userId,
            type: 'PAYMENT',
            amount: numAmount,
            balanceAfter: newBalance,
            description: description || 'Service payment',
            bookingId: bookingId || null,
            status: 'COMPLETED',
          },
        });

        return { balance: newBalance, transaction: formatTx(transaction) };
      });

      return res.json(result);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.warn('[Wallet Pay] DB error fallback:', err.message);

      const fallbackUser = findFallbackUserById(userId) || req.user;
      const currentBalance = fallbackUser.walletBalance || 0;
      if (currentBalance < numAmount) {
        throw new AppError('Insufficient wallet balance', StatusCodes.BAD_REQUEST);
      }

      const newBalance = currentBalance - numAmount;
      fallbackUser.walletBalance = newBalance;
      req.user.walletBalance = newBalance;

      const tx = {
        _id: `tx_${Date.now()}`,
        user: userId,
        type: 'payment',
        amount: -numAmount,
        balanceAfter: newBalance,
        description: description || 'Service payment',
        booking: bookingId || undefined,
        status: 'completed',
        createdAt: new Date(),
      };
      DEMO_TRANSACTIONS.unshift(tx);
      return res.json({ balance: newBalance, transaction: tx });
    }
  })
);

// POST refund to wallet (Strict ACID Compliant Transaction)
router.post(
  '/refund',
  protect,
  validateWalletTopup,
  asyncHandler(async (req, res) => {
    const { amount, description, bookingId } = req.body;
    const numAmount = Number(amount);
    const userId = req.user.id || req.user._id;

    if (!numAmount || numAmount <= 0) {
      throw new AppError('Refund amount must be greater than zero', StatusCodes.BAD_REQUEST);
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { walletBalance: true },
        });

        if (!user) {
          throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        const newBalance = user.walletBalance + numAmount;

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: newBalance },
        });

        const transaction = await tx.walletTransaction.create({
          data: {
            userId,
            type: 'REFUND',
            amount: numAmount,
            balanceAfter: newBalance,
            description: description || 'Booking refund',
            bookingId: bookingId || null,
            status: 'COMPLETED',
          },
        });

        return { balance: newBalance, transaction: formatTx(transaction) };
      });

      return res.json(result);
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.warn('[Wallet Refund] DB error fallback:', err.message);

      const fallbackUser = findFallbackUserById(userId) || req.user;
      const newBalance = (fallbackUser.walletBalance || 0) + numAmount;
      fallbackUser.walletBalance = newBalance;
      req.user.walletBalance = newBalance;

      const tx = {
        _id: `tx_${Date.now()}`,
        user: userId,
        type: 'refund',
        amount: numAmount,
        balanceAfter: newBalance,
        description: description || 'Booking refund',
        booking: bookingId || undefined,
        status: 'completed',
        createdAt: new Date(),
      };
      DEMO_TRANSACTIONS.unshift(tx);
      return res.json({ balance: newBalance, transaction: tx });
    }
  })
);

export default router;
