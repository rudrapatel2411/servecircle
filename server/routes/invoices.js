import express from 'express';
import Invoice from '../models/Invoice.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('partner', 'name companyName')
      .populate('contract', 'contractId contractType')
      .sort('-createdAt');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, authorize('b2b'), async (req, res) => {
  try {
    const query = { partner: req.user._id };
    if (req.query.status) query.status = req.query.status;
    const invoices = await Invoice.find(query)
      .populate('contract', 'contractId contractType')
      .sort('-createdAt');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const count = await Invoice.countDocuments();
    const invoiceId = `INV-${(count + 5001)}`;
    const items = req.body.items || [];
    const subtotal = items.reduce((s, i) => s + (i.total || i.quantity * i.unitPrice), 0);
    const tax = req.body.tax || Math.round(subtotal * 0.18);
    const discount = req.body.discount || 0;
    const totalAmount = subtotal + tax - discount;
    const invoice = await Invoice.create({ ...req.body, invoiceId, items, subtotal, tax, discount, totalAmount });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, authorize('admin', 'b2b'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.body.status === 'paid') updates.paidDate = new Date();
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
