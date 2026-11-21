import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

function formatNotif(n) {
  if (!n) return null;
  return {
    _id: n.id,
    id: n.id,
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

    const notifications = await prisma.notification.findMany({
      where: {
        isActive: true,
        OR: [
          { targetAudience: 'ALL' },
          { targetAudience: audienceRole },
          { targetUsers: { has: userId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.readBy.includes(userId)).length;
    res.json({
      notifications: notifications.map(formatNotif),
      unreadCount,
    });
  })
);

// PUT mark notification as read
router.put(
  '/:id/read',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const notif = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });
    if (!notif) throw new AppError('Notification not found', StatusCodes.NOT_FOUND);

    if (!notif.readBy.includes(userId)) {
      await prisma.notification.update({
        where: { id: notif.id },
        data: {
          readBy: { push: userId },
        },
      });
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

    const notif = await prisma.notification.create({
      data: {
        title: title || 'Notification',
        message: message || '',
        type: typeMap[type?.toLowerCase()] || 'BROADCAST',
        targetAudience: audienceMap[targetAudience?.toLowerCase()] || 'ALL',
        targetUsers: Array.isArray(targetUsers) ? targetUsers : [],
        readBy: [],
        sentById,
        isActive: true,
      },
    });

    res.status(StatusCodes.CREATED).json(formatNotif(notif));
  })
);

// GET all notifications (admin)
router.get(
  '/all',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const list = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(list.map(formatNotif));
  })
);

// DELETE notification (admin)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    await prisma.notification.deleteMany({
      where: { id: req.params.id },
    });
    res.json({ message: 'Notification deleted' });
  })
);

export default router;
