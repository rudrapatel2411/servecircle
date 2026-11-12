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
    const role = req.user.role;

    if (mongoose.connection.readyState !== 1) {
      let userNotifs = [];
      if (role === 'admin') {
        userNotifs = DEMO_NOTIFICATIONS.filter(
          (n) => n.isActive && (n.targetAudience === 'admin' || n.targetAudience === 'all' || !n.targetAudience)
        );
      } else {
        const audience = role === 'customer' ? 'customers' : role === 'worker' ? 'workers' : 'b2b';
        userNotifs = DEMO_NOTIFICATIONS.filter(
          (n) => n.isActive && (n.targetAudience === 'all' || n.targetAudience === audience)
        );
      }

      const unreadCount = userNotifs.filter(
        (n) => !n.readBy.some((id) => String(id) === String(req.user._id))
      ).length;
      return res.json({ notifications: userNotifs, unreadCount });
    }

    let query = { isActive: true };
    if (role === 'admin') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'admin' },
        { targetUsers: req.user._id },
      ];
    } else {
      const audience = role === 'customer' ? 'customers' : role === 'worker' ? 'workers' : 'b2b';
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: audience },
        { targetUsers: req.user._id },
      ];
    }

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

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    }
    res.json({ message: 'Marked as read' });
  })
);

// PUT /notifications/read-all
router.put(
  '/read-all',
  protect,
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      DEMO_NOTIFICATIONS.forEach((n) => {
        if (!n.readBy.includes(req.user._id)) {
          n.readBy.push(req.user._id);
        }
      });
      return res.json({ message: 'All marked as read' });
    }

    await Notification.updateMany({}, { $addToSet: { readBy: req.user._id } });
    res.json({ message: 'All marked as read' });
  })
);

router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { title, message, type, targetAudience } = req.body;

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

      // Emit via socket to all relevant rooms
      if (req.io) {
        const payload = {
          id: newNotif._id,
          title,
          message,
          type: type || 'broadcast',
          date: new Date().toLocaleString('en-IN'),
          timestamp: new Date().toISOString(),
          reads: 0,
        };
        // Always notify admin room & broadcast
        req.io.to('admin_room').emit('admin_notification', payload);
        req.io.emit('admin_notification', payload);

        // Notify audience
        const audience = targetAudience || 'all';
        if (audience === 'all' || audience === 'customers') {
          req.io.emit('customer_notification', { ...payload, targetAudience: audience });
        }
        if (audience === 'all' || audience === 'workers') {
          req.io.to('workers_broadcast').emit('worker_notification', { ...payload, targetAudience: audience });
        }
        if (audience === 'all' || audience === 'b2b') {
          req.io.emit('b2b_notification', { ...payload, targetAudience: audience });
        }
      }

      return res.status(StatusCodes.CREATED).json(newNotif);
    }

    const notification = await Notification.create({ ...req.body, sentBy: req.user._id });

    // Emit via socket to all relevant rooms (live delivery)
    if (req.io) {
      const payload = {
        id: notification._id,
        title,
        message,
        type: type || 'broadcast',
        date: new Date().toLocaleString('en-IN'),
        timestamp: new Date().toISOString(),
        reads: 0,
      };
      req.io.to('admin_room').emit('admin_notification', payload);
      req.io.emit('admin_notification', payload);

      const audience = targetAudience || 'all';
      if (audience === 'all' || audience === 'customers') {
        req.io.emit('customer_notification', { ...payload, targetAudience: audience });
      }
      if (audience === 'all' || audience === 'workers') {
        req.io.to('workers_broadcast').emit('worker_notification', { ...payload, targetAudience: audience });
      }
      if (audience === 'all' || audience === 'b2b') {
        req.io.emit('b2b_notification', { ...payload, targetAudience: audience });
      }
    }

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
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (mongoose.connection.readyState !== 1) {
      const idx = DEMO_NOTIFICATIONS.findIndex((n) => n._id === id || n.id === id);
      if (idx !== -1) {
        if (isAdmin) {
          DEMO_NOTIFICATIONS.splice(idx, 1);
        } else if (!DEMO_NOTIFICATIONS[idx].readBy.includes(req.user._id)) {
          DEMO_NOTIFICATIONS[idx].readBy.push(req.user._id);
        }
      }
      return res.json({ message: 'Notification dismissed' });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      if (isAdmin) {
        await Notification.findByIdAndDelete(id);
      } else {
        await Notification.findByIdAndUpdate(id, { $addToSet: { readBy: req.user._id } });
      }
    }
    res.json({ message: 'Notification dismissed' });
  })
);

export default router;
