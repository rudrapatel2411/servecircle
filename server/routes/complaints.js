import express from 'express';
import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { recordComplaintCreated, recordComplaintResolved } from '../services/featureService.js';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';
import { DEMO_COMPLAINTS } from '../utils/demoDataStore.js';

const router = express.Router();

// GET all complaints (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { status, priority, page = 1, limit = 20 } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let list = [...DEMO_COMPLAINTS];
      if (status) list = list.filter((c) => c.status === status);
      if (priority) list = list.filter((c) => c.priority === priority);
      return res.json({
        complaints: list.slice((page - 1) * limit, page * limit),
        total: list.length,
        page: parseInt(page),
        pages: Math.ceil(list.length / limit) || 1,
      });
    }

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
  })
);

// GET my complaints (customer/worker)
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const myComplaints = DEMO_COMPLAINTS.filter(
        (c) => c.filedBy?._id === req.user._id || String(c.filedBy) === String(req.user._id)
      );
      return res.json(myComplaints);
    }

    const complaints = await Complaint.find({ filedBy: req.user._id })
      .populate('booking', 'bookingId service')
      .sort('-createdAt');
    res.json(complaints);
  })
);

// POST file complaint
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const count = DEMO_COMPLAINTS.length;
      const complaintId = `CMP-${(count + 1001).toString()}`;
      const newComplaint = {
        _id: `cmp_${Date.now()}`,
        ...req.body,
        complaintId,
        filedBy: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
        status: 'open',
        createdAt: new Date(),
      };
      DEMO_COMPLAINTS.unshift(newComplaint);

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

      return res.status(StatusCodes.CREATED).json(newComplaint);
    }

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
        reads: 0,
      });
    }

    res.status(StatusCodes.CREATED).json(complaint);

    try {
      recordComplaintCreated({
        ...complaint.toObject(),
        againstRole: req.body.againstRole || 'worker',
        category: req.body.category || 'other',
      });
      logEvent({ eventType: EVENT_TYPES.COMPLAINT_CREATED, entityType: ENTITY_TYPES.USER, entityId: complaint._id, actorId: req.user._id, actorRole: req.user.role, metadata: { complaintId, againstUser: req.body.againstUser }, ...req.reqCtx });
    } catch {
      // ignore
    }
  })
);

// PUT update complaint status (admin)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const cmp = DEMO_COMPLAINTS.find((c) => c._id === req.params.id || c.complaintId === req.params.id);
      if (!cmp) throw new AppError('Complaint not found', StatusCodes.NOT_FOUND);
      Object.assign(cmp, req.body);
      if (req.body.status === 'resolved') {
        cmp.resolvedBy = req.user._id;
        cmp.resolvedAt = new Date();
      }
      return res.json(cmp);
    }

    const updates = { ...req.body };
    if (req.body.status === 'resolved') {
      updates.resolvedBy = req.user._id;
      updates.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('filedBy', 'name email role')
      .populate('againstUser', 'name email role');

    if (!complaint) throw new AppError('Complaint not found', StatusCodes.NOT_FOUND);

    if (req.body.status === 'resolved' && complaint.createdAt) {
      const resolutionTimeMs = Date.now() - new Date(complaint.createdAt).getTime();
      recordComplaintResolved(complaint.toObject ? complaint.toObject() : complaint, resolutionTimeMs);
    }
    logEvent({ eventType: EVENT_TYPES.COMPLAINT_UPDATED, entityType: ENTITY_TYPES.USER, entityId: complaint._id, actorId: req.user._id, actorRole: 'admin', metadata: { status: req.body.status }, ...req.reqCtx });

    res.json(complaint);
  })
);

export default router;
