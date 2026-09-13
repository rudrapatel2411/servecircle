import express from 'express';
import Invoice from '../models/Invoice.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const invoices = await Invoice.find()
      .populate('partner', 'name companyName')
      .populate('contract', 'contractId contractType')
      .sort('-createdAt');
    res.json(invoices);
  })
);

router.get(
  '/',
  protect,
  authorize('b2b'),
  asyncHandler(async (req, res) => {
    const query = { partner: req.user._id };
    if (req.query.status) query.status = req.query.status;
    const invoices = await Invoice.find(query)
      .populate('contract', 'contractId contractType')
      .sort('-createdAt');
    res.json(invoices);
  })
);

router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const count = await Invoice.countDocuments();
    const invoiceId = `INV-${count + 5001}`;
    const items = req.body.items || [];
    const subtotal = items.reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
    const tax = req.body.tax || Math.round(subtotal * 0.18);
    const discount = req.body.discount || 0;
    const totalAmount = subtotal + tax - discount;
    const invoice = await Invoice.create({
      ...req.body,
      invoiceId,
      items,
      subtotal,
      tax,
      discount,
      totalAmount,
    });
    res.status(StatusCodes.CREATED).json(invoice);
  })
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'b2b'),
  asyncHandler(async (req, res) => {
    const updates = { ...req.body };
    if (req.body.status === 'paid') updates.paidDate = new Date();
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!invoice) throw new AppError('Invoice not found', StatusCodes.NOT_FOUND);
    res.json(invoice);
  })
);

export default router;
