import express from 'express';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const query = {
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: req.user.role === 'customer' ? 'customers' : req.user.role === 'worker' ? 'workers' : 'b2b' },
        { targetUsers: req.user._id },
      ],
    };
    const notifications = await Notification.find(query).sort('-createdAt').limit(50);
    const unreadCount = notifications.filter(n => !n.readBy.includes(req.user._id)).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const notification = await Notification.create({ ...req.body, sentBy: req.user._id });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const notifications = await Notification.find().populate('sentBy', 'name').sort('-createdAt');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
