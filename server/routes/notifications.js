import express from 'express';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const query = {
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        {
          targetAudience:
            req.user.role === 'customer'
              ? 'customers'
              : req.user.role === 'worker'
              ? 'workers'
              : 'b2b',
        },
        { targetUsers: req.user._id },
      ],
    };
    const notifications = await Notification.find(query).sort('-createdAt').limit(50);
    const unreadCount = notifications.filter((n) => !n.readBy.includes(req.user._id)).length;
    res.json({ notifications, unreadCount });
  })
);

router.put(
  '/:id/read',
  protect,
  asyncHandler(async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ message: 'Marked as read' });
  })
);

router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const notification = await Notification.create({ ...req.body, sentBy: req.user._id });
    res.status(StatusCodes.CREATED).json(notification);
  })
);

router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find().populate('sentBy', 'name').sort('-createdAt');
    res.json(notifications);
  })
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  })
);

export default router;
