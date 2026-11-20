import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

function formatReview(r) {
  if (!r) return null;
  return {
    _id: r.id,
    id: r.id,
    booking: r.booking ? { _id: r.booking.id, bookingId: r.booking.bookingId, service: r.booking.serviceName } : r.bookingId,
    customer: r.customer ? { _id: r.customer.id, name: r.customer.name, avatar: r.customer.avatar } : { _id: r.customerId, name: 'Customer' },
    worker: r.worker ? { _id: r.worker.id, name: r.worker.name, avatar: r.worker.avatar } : { _id: r.workerId, name: 'Worker' },
    service: r.service,
    rating: r.rating,
    comment: r.comment,
    reply: r.reply,
    isEdited: r.isEdited,
    isDeleted: r.isDeleted,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// GET reviews by worker
router.get(
  '/worker/:workerId',
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { workerId: req.params.workerId, isDeleted: false },
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews.map(formatReview));
  })
);

// GET my reviews (customer)
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const reviews = await prisma.review.findMany({
      where: { customerId: userId, isDeleted: false },
      include: {
        worker: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews.map(formatReview));
  })
);

// POST create review
router.post(
  '/',
  protect,
  authorize('customer'),
  asyncHandler(async (req, res) => {
    const { booking: bookingInput, worker: workerInput, service, rating, comment } = req.body;
    const customerId = req.user._id || req.user.id;

    // Resolve booking
    let bookingId = bookingInput;
    const b = await prisma.booking.findFirst({
      where: { OR: [{ id: bookingInput }, { bookingId: bookingInput }] },
    });
    if (b) {
      bookingId = b.id;
    } else {
      throw new AppError('Valid booking required for review', StatusCodes.BAD_REQUEST);
    }

    // Resolve worker
    let workerId = workerInput;
    if (!workerId && b.workerId) workerId = b.workerId;
    if (!workerId) throw new AppError('Worker ID required for review', StatusCodes.BAD_REQUEST);

    const review = await prisma.review.upsert({
      where: {
        bookingId_customerId: {
          bookingId,
          customerId,
        },
      },
      update: {
        rating: Number(rating) || 5,
        comment: comment || '',
        service: service || b.serviceName || 'Home Service',
        isEdited: true,
      },
      create: {
        bookingId,
        customerId,
        workerId,
        service: service || b.serviceName || 'Home Service',
        rating: Number(rating) || 5,
        comment: comment || '',
      },
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
        worker: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update worker average rating in WorkerProfile
    const allReviews = await prisma.review.findMany({
      where: { workerId, isDeleted: false },
      select: { rating: true },
    });
    if (allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await prisma.workerProfile.updateMany({
        where: { userId: workerId },
        data: { rating: Math.round(avg * 10) / 10 },
      });
    }

    res.status(StatusCodes.CREATED).json(formatReview(review));
  })
);

// PUT update review
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const { rating, comment } = req.body;

    const existing = await prisma.review.findFirst({
      where: { id: req.params.id, customerId: userId, isDeleted: false },
    });
    if (!existing) throw new AppError('Review not found', StatusCodes.NOT_FOUND);

    const updated = await prisma.review.update({
      where: { id: existing.id },
      data: {
        ...(rating ? { rating: Number(rating) } : {}),
        ...(comment !== undefined ? { comment } : {}),
        isEdited: true,
      },
      include: {
        customer: { select: { id: true, name: true, avatar: true } },
        worker: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json(formatReview(updated));
  })
);

// DELETE review — soft delete
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    const existing = await prisma.review.findFirst({
      where: { id: req.params.id, customerId: userId },
    });
    if (!existing) throw new AppError('Review not found', StatusCodes.NOT_FOUND);

    await prisma.review.update({
      where: { id: existing.id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    res.json({ message: 'Review deleted' });
  })
);

export default router;
