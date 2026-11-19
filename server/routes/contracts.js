// server/routes/contracts.js
import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { DEMO_CONTRACTS } from '../utils/demoDataStore.js';

const router = express.Router();

function formatContract(c) {
  if (!c) return null;
  return {
    ...c,
    _id: c.id,
    partner: c.partner ? { ...c.partner, _id: c.partner.id } : c.partnerId,
  };
}

// GET all contracts (admin)
router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    try {
      const contracts = await prisma.contract.findMany({
        include: { partner: { select: { id: true, name: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(contracts.map(formatContract));
    } catch (err) {
      console.warn('[Contracts /all] PostgreSQL fallback:', err.message);
      res.json(DEMO_CONTRACTS);
    }
  })
);

// GET my contracts (B2B / Admin)
router.get(
  '/',
  protect,
  authorize('b2b', 'admin'),
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const userId = req.user.id || req.user._id;

    try {
      const where = {};
      if (req.user.role === 'b2b') {
        where.partnerId = userId;
      }
      if (status) {
        where.status = status.toUpperCase();
      }

      const contracts = await prisma.contract.findMany({
        where,
        include: { partner: { select: { id: true, name: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(contracts.map(formatContract));
    } catch (err) {
      console.warn('[Contracts /] PostgreSQL fallback:', err.message);
      let list = [...DEMO_CONTRACTS];
      if (req.user.role === 'b2b') {
        list = list.filter((c) => String(c.partner) === String(userId));
      }
      if (status) {
        list = list.filter((c) => c.status === status);
      }
      res.json(list);
    }
  })
);

// GET single contract
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    try {
      const contract = await prisma.contract.findFirst({
        where: {
          OR: [{ id }, { contractId: id }],
        },
        include: { partner: { select: { id: true, name: true, email: true, phone: true } } },
      });

      if (contract) {
        if (req.user.role === 'b2b' && contract.partnerId !== userId) {
          throw new AppError('Access denied', StatusCodes.FORBIDDEN);
        }
        return res.json(formatContract(contract));
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.warn('[Contracts /:id] PostgreSQL fallback:', err.message);
    }

    const contract = DEMO_CONTRACTS.find((c) => c._id === id || c.contractId === id);
    if (!contract) throw new AppError('Contract not found', StatusCodes.NOT_FOUND);
    res.json(contract);
  })
);

// POST create contract (admin or B2B)
router.post(
  '/',
  protect,
  authorize('admin', 'b2b'),
  asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const partnerId = req.body.partner || userId;

    try {
      const count = await prisma.contract.count();
      const contractId = `CON-${(count + 1001).toString()}`;

      const created = await prisma.contract.create({
        data: {
          contractId,
          partnerId,
          partnerName: req.body.partnerName || req.user.name || 'Partner',
          contractType: req.body.contractType || 'CUSTOM',
          services: req.body.services || [],
          locations: req.body.locations || [],
          totalValue: Number(req.body.totalValue) || 0.0,
          startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
          endDate: req.body.endDate ? new Date(req.body.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: req.body.status ? req.body.status.toUpperCase() : 'DRAFT',
          autoRenew: Boolean(req.body.autoRenew),
          notes: req.body.notes || null,
        },
      });

      return res.status(StatusCodes.CREATED).json(formatContract(created));
    } catch (err) {
      console.warn('[Contracts POST] PostgreSQL fallback:', err.message);
      const count = DEMO_CONTRACTS.length;
      const contractId = `CON-${(count + 1001).toString()}`;
      const newContract = {
        _id: `cnt_${Date.now()}`,
        ...req.body,
        contractId,
        partner: partnerId,
        partnerName: req.body.partnerName || req.user.name,
        createdAt: new Date(),
      };
      DEMO_CONTRACTS.unshift(newContract);
      return res.status(StatusCodes.CREATED).json(newContract);
    }
  })
);

// PUT update contract
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const updated = await prisma.contract.update({
        where: { id },
        data: {
          ...(req.body.partnerName && { partnerName: req.body.partnerName }),
          ...(req.body.totalValue !== undefined && { totalValue: Number(req.body.totalValue) }),
          ...(req.body.status && { status: req.body.status.toUpperCase() }),
          ...(req.body.autoRenew !== undefined && { autoRenew: Boolean(req.body.autoRenew) }),
          ...(req.body.notes !== undefined && { notes: req.body.notes }),
        },
      });
      return res.json(formatContract(updated));
    } catch (err) {
      console.warn('[Contracts PUT] PostgreSQL fallback:', err.message);
      const contract = DEMO_CONTRACTS.find((c) => c._id === id || c.contractId === id);
      if (!contract) throw new AppError('Contract not found', StatusCodes.NOT_FOUND);
      Object.assign(contract, req.body);
      return res.json(contract);
    }
  })
);

// DELETE contract
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.contract.delete({ where: { id } });
      return res.json({ message: 'Contract deleted' });
    } catch (err) {
      console.warn('[Contracts DELETE] PostgreSQL fallback:', err.message);
      const idx = DEMO_CONTRACTS.findIndex((c) => c._id === id || c.contractId === id);
      if (idx !== -1) DEMO_CONTRACTS.splice(idx, 1);
      return res.json({ message: 'Contract deleted' });
    }
  })
);

export default router;
