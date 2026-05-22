import express from 'express';
import Booking from '../models/Booking.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all bookings (admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.bookingId = { $regex: search, $options: 'i' };

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('worker', 'name email phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);
    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my bookings (customer)
router.get('/my', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { customer: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('worker', 'name phone rating')
      .sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET worker's assigned jobs
router.get('/jobs', protect, authorize('worker'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = { worker: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('customer', 'name phone address')
      .sort('-scheduledDate');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create booking
router.post('/', protect, authorize('customer', 'b2b'), async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    const bookingId = `SC-${(count + 2800)}`;
    const booking = await Booking.create({
      ...req.body,
      bookingId,
      customer: req.user._id,
    });
    
    // Emit notification to admin
    if (req.io) {
      req.io.to('admin_room').emit('admin_notification', {
        id: Date.now(),
        title: 'New Booking',
        message: `Booking ${bookingId} created by ${req.user.name || 'Customer'}.`,
        type: 'alert',
        date: new Date().toLocaleString(),
        reads: 0
      });
    }

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update booking status
router.patch('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH worker accepts/rejects job
router.patch('/:id/respond', protect, authorize('worker'), async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const update = action === 'accept'
      ? { status: 'confirmed', worker: req.user._id }
      : { status: 'pending', worker: null };

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.io) {
      req.io.to('admin_room').emit('admin_notification', {
        id: Date.now(),
        title: `Job ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
        message: `Worker ${req.user.name || ''} ${action}ed booking ${booking.bookingId}`,
        type: action === 'accept' ? 'broadcast' : 'system',
        date: new Date().toLocaleString(),
        reads: 0
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
