import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update profile
router.put('/me', protect, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'avatar', 'skills', 'companyName', 'locations'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT change password
router.put('/me/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update subscription
router.put('/me/subscription', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['basic', 'silver', 'gold', 'platinum'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscription: plan },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ADMIN ROUTES =====

// GET all users (admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET workers pending verification (admin)
router.get('/workers/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker', isVerified: false }).select('-password').sort('-createdAt');
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT verify worker (admin)
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const { isVerified } = req.body;
    const worker = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'worker' },
      { isVerified },
      { new: true }
    ).select('-password');

    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
