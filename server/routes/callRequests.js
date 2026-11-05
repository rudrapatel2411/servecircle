/**
 * routes/callRequests.js
 *
 * Call Request System — Socket.io based real-time worker matching.
 *
 * Flow:
 *   1. Customer/B2B submits call request (POST /api/call-requests)
 *   2. Server broadcasts to all online workers via socket
 *   3. First worker to accept (POST /api/call-requests/:id/accept) gets the job
 *   4. Customer gets notified → worker calls them back
 *   5. Admin sees all requests in real-time
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes'
import {
  broadcastCallRequest,
  notifyCallAccepted,
  notifyAdmin,
  notifyCustomer,
} from '../services/notificationService.js';

const router = express.Router();

// In-memory store for active call requests (replace with DB if needed)
const activeCallRequests = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/call-requests
// Create a new call request — broadcasts to all matching workers
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/',
  // Allow unauthenticated (guests) to submit call-back requests
  (req, res, next) => {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      protect(req, res, next); // validate token if present
    } else {
      req.user = { _id: 'guest', name: 'Guest', role: 'customer' };
      next();
    }
  },
  asyncHandler(async (req, res) => {
    const { phone, serviceType, category, message } = req.body;

    if (!phone) {
      throw new AppError('Phone number is required', StatusCodes.BAD_REQUEST);
    }

    const requestId = `CR-${Date.now()}`;
    const requestData = {
      requestId,
      phone,
      serviceType: serviceType || 'General Help',
      category: category || null,
      message: message || '',
      customerId: req.user._id,
      customerName: req.user.name || 'Customer',
      status: 'pending',      // pending | accepted | cancelled
      acceptedBy: null,
      createdAt: new Date().toISOString(),
    };

    // Store in memory
    activeCallRequests.set(requestId, requestData);

    // Auto-expire after 10 minutes
    setTimeout(() => {
      const req = activeCallRequests.get(requestId);
      if (req && req.status === 'pending') {
        activeCallRequests.delete(requestId);
      }
    }, 10 * 60 * 1000);

    // Broadcast via socket to all matching workers + admin
    broadcastCallRequest(req.io, requestData);

    res.status(StatusCodes.CREATED).json({
      success: true,
      requestId,
      message: 'Call request sent. A worker will contact you shortly.',
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/call-requests/:id/accept
// Worker accepts a call request (race-to-accept — first come, first served)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/:id/accept',
  protect,
  asyncHandler(async (req, res) => {
    const { id: requestId } = req.params;

    if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      throw new AppError('Only workers can accept call requests', StatusCodes.FORBIDDEN);
    }

    const callRequest = activeCallRequests.get(requestId);

    if (!callRequest) {
      throw new AppError('Call request not found or expired', StatusCodes.NOT_FOUND);
    }

    if (callRequest.status !== 'pending') {
      throw new AppError(
        callRequest.status === 'accepted'
          ? 'This request has already been accepted by another worker'
          : 'This request is no longer available',
        StatusCodes.CONFLICT
      );
    }

    // Mark as accepted — prevents race conditions
    callRequest.status = 'accepted';
    callRequest.acceptedBy = req.user._id;
    callRequest.acceptedByName = req.user.name;
    callRequest.acceptedAt = new Date().toISOString();
    activeCallRequests.set(requestId, callRequest);

    // Notify customer, admin, and dismiss from other workers
    notifyCallAccepted(req.io, {
      requestId,
      workerId: req.user._id,
      workerName: req.user.name,
      customerId: callRequest.customerId,
      phone: callRequest.phone,
    });

    res.json({
      success: true,
      message: 'You accepted the call request. Please call the customer.',
      phone: callRequest.phone,
      customerName: callRequest.customerName,
      serviceType: callRequest.serviceType,
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/call-requests/:id
// Customer cancels their own call request
// ─────────────────────────────────────────────────────────────────────────────
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const { id: requestId } = req.params;
    const callRequest = activeCallRequests.get(requestId);

    if (!callRequest) {
      throw new AppError('Call request not found', StatusCodes.NOT_FOUND);
    }

    if (
      req.user.role !== 'admin' &&
      callRequest.customerId.toString() !== req.user._id.toString()
    ) {
      throw new AppError('Access denied', StatusCodes.FORBIDDEN);
    }

    callRequest.status = 'cancelled';
    activeCallRequests.delete(requestId);

    // Notify workers that it was cancelled
    req.io?.to('workers_broadcast').emit('call_request_taken', {
      requestId,
      cancelled: true,
    });

    res.json({ success: true, message: 'Call request cancelled' });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/call-requests (admin only)
// View all active call requests
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      throw new AppError('Admin access only', StatusCodes.FORBIDDEN);
    }

    const requests = Array.from(activeCallRequests.values());
    res.json({ requests, total: requests.length });
  })
);

export default router;
