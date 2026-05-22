import express from 'express';
import Complaint from '../models/Complaint.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET all complaints (admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('filedBy', 'name email role')
      .populate('againstUser', 'name email role')
      .populate('booking', 'bookingId service')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);
    res.json({ complaints, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my complaints (customer/worker)
router.get('/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ filedBy: req.user._id })
      .populate('booking', 'bookingId service')
      .sort('-createdAt');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST file complaint
router.post('/', protect, async (req, res) => {
  try {
    const count = await Complaint.countDocuments();
    const complaintId = `CMP-${(count + 1001).toString()}`;

    const complaint = await Complaint.create({
      ...req.body,
      complaintId,
      filedBy: req.user._id,
    });

    if (req.io) {
      req.io.to('admin_room').emit('admin_notification', {
        id: Date.now(),
        title: 'New Complaint',
        message: `Complaint ${complaintId} filed by ${req.user.name || 'User'}.`,
        type: 'danger',
        date: new Date().toLocaleString(),
        reads: 0
      });
    }

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update complaint status (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.body.status === 'resolved') {
      updates.resolvedBy = req.user._id;
      updates.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('filedBy', 'name email role')
      .populate('againstUser', 'name email role');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
