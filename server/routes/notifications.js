import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { DEMO_NOTIFICATIONS } from '../utils/demoDataStore.js';

const router = express.Router();

router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const audience =
        req.user.role === 'customer'
          ? 'customers'
          : req.user.role === 'worker'
          ? 'workers'
          : 'b2b';

      const userNotifs = DEMO_NOTIFICATIONS.filter(
        (n) => n.isActive && (n.targetAudience === 'all' || n.targetAudience === audience)
      );
      const unreadCount = userNotifs.filter(
        (n) => !n.readBy.some((id) => String(id) === String(req.user._id))
      ).length;
      return res.json({ notifications: userNotifs, unreadCount });
    }

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
    if (mongoose.connection.readyState !== 1) {
      const notif = DEMO_NOTIFICATIONS.find((n) => n._id === req.params.id);
      if (notif && !notif.readBy.includes(req.user._id)) {
        notif.readBy.push(req.user._id);
      }
      return res.json({ message: 'Marked as read' });
    }

    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ message: 'Marked as read' });
  })
);

router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const newNotif = {
        _id: `notif_${Date.now()}`,
        ...req.body,
        readBy: [],
        sentBy: req.user._id,
        isActive: true,
        createdAt: new Date(),
      };
      DEMO_NOTIFICATIONS.unshift(newNotif);
      return res.status(StatusCodes.CREATED).json(newNotif);
    }

    const notification = await Notification.create({ ...req.body, sentBy: req.user._id });
    res.status(StatusCodes.CREATED).json(notification);
  })
);

router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      return res.json(DEMO_NOTIFICATIONS);
    }
    const notifications = await Notification.find().populate('sentBy', 'name').sort('-createdAt');
    res.json(notifications);
  })
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const idx = DEMO_NOTIFICATIONS.findIndex((n) => n._id === req.params.id);
      if (idx !== -1) DEMO_NOTIFICATIONS.splice(idx, 1);
      return res.json({ message: 'Notification deleted' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  })
);

export default router;
