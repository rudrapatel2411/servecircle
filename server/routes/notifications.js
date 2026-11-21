import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { DEMO_NOTIFICATIONS } from '../utils/demoDataStore.js';

const router = express.Router();

function formatNotif(n) {
  if (!n) return null;
  return {
    _id: n.id || n._id,
    id: n.id || n._id,
    title: n.title,
    message: n.message,
    type: String(n.type).toLowerCase(),
    targetAudience: String(n.targetAudience).toLowerCase(),
    targetUsers: n.targetUsers || [],
    readBy: n.readBy || [],
    sentBy: n.sentById,
    isActive: n.isActive,
    expiresAt: n.expiresAt,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    date: n.date || (n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')),
    reads: n.reads || 0,
    ...n,
  };
}

// GET user notifications
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const role = (req.user.role || 'customer').toLowerCase();
    const audienceRole = role === 'customer' ? 'CUSTOMERS' : role === 'worker' ? 'WORKERS' : 'B2B';

    try {
      const notifications = await prisma.notification.findMany({
        where: {
          isActive: true,
          OR: [
            { targetAudience: 'ALL' },
            { targetAudience: audienceRole },
            { targetUsers: { has: String(userId) } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const unreadCount = notifications.filter((n) => !n.readBy.includes(String(userId))).length;
      return res.json({
        notifications: notifications.map(formatNotif),
        unreadCount,
      });
    } catch {
      // In-memory demo fallback
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
        (n) => !n.readBy.some((id) => String(id) === String(userId))
      ).length;
      return res.json({ notifications: userNotifs.map(formatNotif), unreadCount });
    }
  })
);

// PUT /notifications/read-all (Mark all as read)
router.put(
  '/read-all',
  protect,
  asyncHandler(async (req, res) => {
    const userId = String(req.user._id || req.user.id);

    try {
      // Find all active notifications not yet marked read by this user
      const unread = await prisma.notification.findMany({
        where: {
          isActive: true,
          NOT: {
            readBy: { has: userId },
          },
        },
        take: 100,
      });

      await Promise.all(
        unread.map((n) =>
          prisma.notification.update({
            where: { id: n.id },
            data: { readBy: { push: userId } },
          })
        )
      );
    } catch {}

    // Also update demo memory store
    DEMO_NOTIFICATIONS.forEach((n) => {
      if (!n.readBy.includes(userId)) {
        n.readBy.push(userId);
      }
    });

    res.json({ message: 'All marked as read' });
  })
);

// PUT mark single notification as read
router.put(
  '/:id/read',
  protect,
  asyncHandler(async (req, res) => {
    const userId = String(req.user._id || req.user.id);
    const notifId = req.params.id;

    try {
      const notif = await prisma.notification.findUnique({
        where: { id: notifId },
      });
      if (notif && !notif.readBy.includes(userId)) {
        await prisma.notification.update({
          where: { id: notif.id },
          data: {
            readBy: { push: userId },
          },
        });
      }
    } catch {}

    const demo = DEMO_NOTIFICATIONS.find((n) => n._id === notifId || n.id === notifId);
    if (demo && !demo.readBy.includes(userId)) {
      demo.readBy.push(userId);
    }

    res.json({ message: 'Marked as read' });
  })
);

// POST create notification (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { title, message, type, targetAudience, targetUsers } = req.body;
    const sentById = req.user._id || req.user.id;

    const audienceMap = {
      all: 'ALL',
      customers: 'CUSTOMERS',
      workers: 'WORKERS',
      b2b: 'B2B',
      specific: 'SPECIFIC',
    };

    const typeMap = {
      broadcast: 'BROADCAST',
      personal: 'PERSONAL',
      booking_update: 'BOOKING_UPDATE',
      promotion: 'PROMOTION',
      alert: 'ALERT',
      system: 'SYSTEM',
    };

    try {
      const notif = await prisma.notification.create({
        data: {
          title: title || 'Notification',
          message: message || '',
          type: typeMap[type?.toLowerCase()] || 'BROADCAST',
          targetAudience: audienceMap[targetAudience?.toLowerCase()] || 'ALL',
          targetUsers: Array.isArray(targetUsers) ? targetUsers.map(String) : [],
          readBy: [],
          sentById: String(sentById),
          isActive: true,
        },
      });
      return res.status(StatusCodes.CREATED).json(formatNotif(notif));
    } catch {
      const demoRecord = {
        _id: `notif_${Date.now()}`,
        id: `notif_${Date.now()}`,
        title: title || 'Notification',
        message: message || '',
        type: type?.toLowerCase() || 'broadcast',
        targetAudience: targetAudience?.toLowerCase() || 'all',
        targetUsers: targetUsers || [],
        readBy: [],
        isActive: true,
        createdAt: new Date(),
        reads: 0,
      };
      DEMO_NOTIFICATIONS.unshift(demoRecord);
      return res.status(StatusCodes.CREATED).json(formatNotif(demoRecord));
    }
  })
);

// GET all notifications (admin)
router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    try {
      const list = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      res.json(list.map(formatNotif));
    } catch {
      res.json(DEMO_NOTIFICATIONS.map(formatNotif));
    }
  })
);

// DELETE notification (admin or dismissing user)
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const notifId = req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (isAdmin) {
      try {
        await prisma.notification.deleteMany({
          where: { id: notifId },
        });
      } catch {}
      const idx = DEMO_NOTIFICATIONS.findIndex((n) => n._id === notifId || n.id === notifId);
      if (idx !== -1) DEMO_NOTIFICATIONS.splice(idx, 1);
    } else {
      // Mark as read for this user
      const userId = String(req.user._id || req.user.id);
      try {
        const notif = await prisma.notification.findUnique({ where: { id: notifId } });
        if (notif && !notif.readBy.includes(userId)) {
          await prisma.notification.update({
            where: { id: notifId },
            data: { readBy: { push: userId } },
          });
        }
      } catch {}
      const demo = DEMO_NOTIFICATIONS.find((n) => n._id === notifId || n.id === notifId);
      if (demo && !demo.readBy.includes(userId)) {
        demo.readBy.push(userId);
      }
    }

    res.json({ message: 'Notification dismissed / deleted' });
  })
);

export default router;
