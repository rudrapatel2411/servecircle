import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { recordComplaintCreated, recordComplaintResolved } from '../services/featureService.js';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';

const router = express.Router();

function formatComplaint(c) {
  if (!c) return null;
  return {
    _id: c.id,
    id: c.id,
    complaintId: c.complaintId,
    booking: c.booking ? { _id: c.booking.id, bookingId: c.booking.bookingId, service: c.booking.serviceName } : null,
    filedBy: c.filedBy ? { _id: c.filedBy.id, name: c.filedBy.name, email: c.filedBy.email, role: String(c.filedBy.role).toLowerCase() } : null,
    againstUser: c.againstUser ? { _id: c.againstUser.id, name: c.againstUser.name, email: c.againstUser.email, role: String(c.againstUser.role).toLowerCase() } : null,
    subject: c.subject,
    description: c.description,
    category: String(c.category || 'other').toLowerCase(),
    priority: String(c.priority || 'medium').toLowerCase(),
    status: String(c.status || 'open').toLowerCase(),
    resolution: c.resolution,
    resolvedAt: c.resolvedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

// GET all complaints (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { status, priority, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (priority) where.priority = priority.toUpperCase();

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          filedBy: { select: { id: true, name: true, email: true, role: true } },
          againstUser: { select: { id: true, name: true, email: true, role: true } },
          booking: { select: { id: true, bookingId: true, serviceName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.complaint.count({ where }),
    ]);

    res.json({
      complaints: complaints.map(formatComplaint),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit) || 1,
    });
  })
);

// GET my complaints (customer/worker)
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const complaints = await prisma.complaint.findMany({
      where: { filedById: userId },
      include: {
        booking: { select: { id: true, bookingId: true, serviceName: true } },
        againstUser: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints.map(formatComplaint));
  })
);

// POST file complaint
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const count = await prisma.complaint.count();
    const complaintId = `CMP-${(count + 1001).toString()}`;

    const { subject, description, bookingId, againstUserId, category, priority } = req.body;

    const categoryMap = {
      service_quality: 'SERVICE_QUALITY',
      payment: 'PAYMENT',
      worker_behaviour: 'WORKER_BEHAVIOUR',
      delay: 'DELAY',
      damage: 'DAMAGE',
      fraud: 'FRAUD',
      other: 'OTHER',
    };

    const priorityMap = {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH',
      critical: 'CRITICAL',
    };

    let resolvedBookingId = null;
    if (bookingId) {
      const b = await prisma.booking.findFirst({
        where: { OR: [{ id: bookingId }, { bookingId: bookingId }] },
      });
      if (b) resolvedBookingId = b.id;
    }

    const complaint = await prisma.complaint.create({
      data: {
        complaintId,
        filedById: userId,
        bookingId: resolvedBookingId,
        againstUserId: againstUserId || null,
        subject: subject || 'Complaint',
        description: description || '',
        category: categoryMap[category?.toLowerCase()] || 'OTHER',
        priority: priorityMap[priority?.toLowerCase()] || 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        filedBy: { select: { id: true, name: true, email: true, role: true } },
        againstUser: { select: { id: true, name: true, email: true, role: true } },
        booking: { select: { id: true, bookingId: true, serviceName: true } },
      },
    });

    if (req.io) {
      req.io.to('admin_room').emit('admin_notification', {
        id: Date.now(),
        title: 'New Complaint',
        message: `Complaint ${complaintId} filed by ${req.user.name || 'User'}.`,
        type: 'danger',
        date: new Date().toLocaleString(),
        reads: 0,
      });
    }

    res.status(StatusCodes.CREATED).json(formatComplaint(complaint));
  })
);

// PUT update complaint status (admin)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const existing = await prisma.complaint.findFirst({
      where: { OR: [{ id }, { complaintId: id }] },
    });
    if (!existing) throw new AppError('Complaint not found', StatusCodes.NOT_FOUND);

    const statusMap = {
      open: 'OPEN',
      in_progress: 'IN_PROGRESS',
      resolved: 'RESOLVED',
      escalated: 'ESCALATED',
      closed: 'CLOSED',
    };

    const data = {};
    if (req.body.status) data.status = statusMap[req.body.status?.toLowerCase()] || 'OPEN';
    if (req.body.resolution) data.resolution = req.body.resolution;
    if (req.body.status?.toLowerCase() === 'resolved') {
      data.resolvedById = req.user._id || req.user.id;
      data.resolvedAt = new Date();
    }

    const complaint = await prisma.complaint.update({
      where: { id: existing.id },
      data,
      include: {
        filedBy: { select: { id: true, name: true, email: true, role: true } },
        againstUser: { select: { id: true, name: true, email: true, role: true } },
        booking: { select: { id: true, bookingId: true, serviceName: true } },
      },
    });

    res.json(formatComplaint(complaint));
  })
);

export default router;
