import express from 'express';
import Contract from '../models/Contract.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET all contracts (admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('partner', 'name companyName email')
      .sort('-createdAt');
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my contracts (B2B)
router.get('/', protect, authorize('b2b'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = { partner: req.user._id };
    if (status) query.status = status;

    const contracts = await Contract.find(query).sort('-createdAt');
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single contract
router.get('/:id', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('partner', 'name companyName email phone');
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // B2B users can only see their own contracts
    if (req.user.role === 'b2b' && contract.partner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create contract (admin or B2B)
router.post('/', protect, authorize('admin', 'b2b'), async (req, res) => {
  try {
    const count = await Contract.countDocuments();
    const contractId = `CON-${(count + 1001).toString()}`;

    const contract = await Contract.create({
      ...req.body,
      contractId,
      partner: req.body.partner || req.user._id,
    });

    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update contract
router.put('/:id', protect, authorize('admin', 'b2b'), async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
