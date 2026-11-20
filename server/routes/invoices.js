import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

function formatInvoice(inv) {
  if (!inv) return null;
  return {
    _id: inv.id,
    id: inv.id,
    invoiceId: inv.invoiceId,
    partner: inv.partner ? { _id: inv.partner.id, name: inv.partner.name } : inv.partnerId,
    contract: inv.contract ? { _id: inv.contract.id, contractId: inv.contract.contractId, contractType: inv.contract.contractType } : inv.contractId,
    items: inv.items || [],
    subtotal: inv.subtotal,
    tax: inv.tax,
    discount: inv.discount,
    totalAmount: inv.totalAmount,
    dueDate: inv.dueDate,
    paidDate: inv.paidDate,
    status: String(inv.status).toLowerCase(),
    paymentMethod: inv.paymentMethod,
    notes: inv.notes,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  };
}

// GET all invoices (admin)
router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const invoices = await prisma.invoice.findMany({
      include: {
        partner: { select: { id: true, name: true } },
        contract: { select: { id: true, contractId: true, contractType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices.map(formatInvoice));
  })
);

// GET invoices by partner / role
router.get(
  '/',
  protect,
  authorize('b2b', 'admin'),
  asyncHandler(async (req, res) => {
    const where = {};
    if (req.user.role === 'b2b') {
      where.partnerId = req.user._id || req.user.id;
    }
    if (req.query.status) {
      where.status = req.query.status.toUpperCase();
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        partner: { select: { id: true, name: true } },
        contract: { select: { id: true, contractId: true, contractType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices.map(formatInvoice));
  })
);

// POST create invoice
router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const items = req.body.items || [];
    const subtotal = items.reduce((s, i) => s + (Number(i.total) || Number(i.quantity * i.unitPrice) || 0), 0);
    const tax = req.body.tax ? Number(req.body.tax) : Math.round(subtotal * 0.18);
    const discount = Number(req.body.discount || 0);
    const totalAmount = subtotal + tax - discount;

    const count = await prisma.invoice.count();
    const invoiceId = `INV-${count + 5001}`;

    let partnerId = req.body.partnerId || req.body.partner;
    if (!partnerId) {
      const firstUser = await prisma.user.findFirst({ where: { role: 'B2B' } }) || await prisma.user.findFirst();
      partnerId = firstUser.id;
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceId,
        partnerId,
        contractId: req.body.contractId || null,
        items,
        subtotal,
        tax,
        discount,
        totalAmount,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30 * 86400000),
        status: req.body.status ? req.body.status.toUpperCase() : 'SENT',
        notes: req.body.notes || null,
      },
    });

    res.status(StatusCodes.CREATED).json(formatInvoice(invoice));
  })
);

// PUT update invoice status
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const existing = await prisma.invoice.findFirst({
      where: { OR: [{ id: req.params.id }, { invoiceId: req.params.id }] },
    });
    if (!existing) throw new AppError('Invoice not found', StatusCodes.NOT_FOUND);

    const data = {};
    if (req.body.status) data.status = req.body.status.toUpperCase();
    if (req.body.status?.toLowerCase() === 'paid') {
      data.paidDate = new Date();
    }
    if (req.body.paymentMethod) data.paymentMethod = req.body.paymentMethod;

    const updated = await prisma.invoice.update({
      where: { id: existing.id },
      data,
    });

    res.json(formatInvoice(updated));
  })
);

export default router;
