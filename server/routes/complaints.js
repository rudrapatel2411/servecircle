import express from 'express';
import Complaint from '../models/Complaint.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { recordComplaintCreated, recordComplaintResolved } from '../services/featureService.js';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';


const router = express.Router();

// GET all complaints (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { status, priority, page = 1, limit = 20 } = req.query;
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

    // Phase 2 Batch 2: record complaint metrics (fire-and-forget after response)
    recordComplaintCreated({
      ...complaint.toObject(),
      againstRole: req.body.againstRole || 'worker',
      category:    req.body.category    || 'other',
    });
    logEvent({ eventType: EVENT_TYPES.COMPLAINT_CREATED, entityType: ENTITY_TYPES.USER, entityId: complaint._id, actorId: req.user._id, actorRole: req.user.role, metadata: { complaintId, againstUser: req.body.againstUser }, ...req.reqCtx });
  })
);


// PUT update complaint status (admin)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const updates = { ...req.body };
    if (req.body.status === 'resolved') {
      updates.resolvedBy = req.user._id;
      updates.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('filedBy', 'name email role')
      .populate('againstUser', 'name email role');

    if (!complaint) throw new AppError('Complaint not found', StatusCodes.NOT_FOUND);

    // Phase 2 Batch 2: record resolution metrics
    if (req.body.status === 'resolved' && complaint.createdAt) {
      const resolutionTimeMs = Date.now() - new Date(complaint.createdAt).getTime();
      recordComplaintResolved(complaint.toObject ? complaint.toObject() : complaint, resolutionTimeMs);
    }
    logEvent({ eventType: EVENT_TYPES.COMPLAINT_UPDATED, entityType: ENTITY_TYPES.USER, entityId: complaint._id, actorId: req.user._id, actorRole: 'admin', metadata: { status: req.body.status }, ...req.reqCtx });

    res.json(complaint);
  })
);


export default router;
