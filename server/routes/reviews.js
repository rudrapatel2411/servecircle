import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';
import { updateWorkerRating, recordCustomerReview } from '../services/metricsService.js';
import { captureSnapshot } from '../services/historyService.js';
import { recordSkillRating, recordBehaviourReview, syncTrustProfile } from '../services/featureService.js';


const router = express.Router();

// GET reviews by worker
router.get(
  '/worker/:workerId',
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('customer', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  })
);

// GET my reviews (customer)
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('worker', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  })
);

// POST create review
router.post(
  '/',
  protect,
  authorize('customer'),
  asyncHandler(async (req, res) => {
    const { booking, worker, service, rating, comment } = req.body;

    const review = await Review.create({
      booking,
      customer: req.user._id,
      worker,
      service,
      rating,
      comment,
    }).catch((err) => {
      if (err.code === 11000) throw new AppError('You have already reviewed this booking', StatusCodes.BAD_REQUEST);
      throw err;
    });

    const allReviews = await Review.find({ worker });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(worker, { rating: Math.round(avgRating * 10) / 10 });

    // Phase 2: metrics + event + Batch 2 signals
    updateWorkerRating(worker, req.body.ratingBreakdown || { overall: rating });
    const custMetrics = await recordCustomerReview(req.user._id, rating);
    logEvent({ eventType: EVENT_TYPES.REVIEW_ADDED, entityType: ENTITY_TYPES.REVIEW, entityId: review._id, actorId: req.user._id, actorRole: 'customer', metadata: { worker, service, rating, bookingId: booking }, ...req.reqCtx });
    captureSnapshot({ collection: 'reviews', documentId: review._id, before: {}, after: review.toObject ? review.toObject() : review, changedBy: req.user._id, changedByRole: 'customer', changeReason: EVENT_TYPES.REVIEW_ADDED });
    // Batch 2: skill rating, behaviour review, trust profile sync
    recordSkillRating(worker, service, req.body.category || '', rating);
    recordBehaviourReview(req.user._id, rating, custMetrics?.completedBookings || 1);
    syncTrustProfile(worker);

    res.status(StatusCodes.CREATED).json(review);
  })
);


// PUT update review
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, customer: req.user._id });
    if (!review) throw new AppError('Review not found', StatusCodes.NOT_FOUND);

    const { rating, comment } = req.body;
    const before = { rating: review.rating, comment: review.comment };
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.isEdited = true;
    await review.save();

    const allReviews = await Review.find({ worker: review.worker });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(review.worker, { rating: Math.round(avgRating * 10) / 10 });

    // Phase 2
    logEvent({ eventType: EVENT_TYPES.REVIEW_EDITED, entityType: ENTITY_TYPES.REVIEW, entityId: review._id, actorId: req.user._id, actorRole: 'customer', metadata: { newRating: rating }, ...req.reqCtx });
    captureSnapshot({ collection: 'reviews', documentId: review._id, before, after: { rating: review.rating, comment: review.comment }, changedBy: req.user._id, changedByRole: 'customer', changeReason: EVENT_TYPES.REVIEW_EDITED });

    res.json(review);
  })
);

// DELETE review — soft delete (customer's own review only)
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id, customer: req.user._id });
    if (!review) throw new AppError('Review not found', StatusCodes.NOT_FOUND);

    await Review.findByIdAndUpdate(req.params.id, {
      $set: { isDeleted: true, deletedAt: new Date() },
    });

    // Phase 2
    logEvent({ eventType: EVENT_TYPES.REVIEW_DELETED, entityType: ENTITY_TYPES.REVIEW, entityId: review._id, actorId: req.user._id, actorRole: 'customer', metadata: { worker: review.worker }, ...req.reqCtx });

    res.json({ message: 'Review deleted' });
  })
);

// POST /reviews/:id/restore — restore a soft-deleted review (admin only)
router.post(
  '/:id/restore',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { ObjectId } = (await import('mongodb')).default;
    const result = await Review.collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { returnDocument: 'after' }
    );
    if (!result) throw new AppError('Deleted review not found', StatusCodes.NOT_FOUND);
    res.json({ message: 'Review restored successfully', review: result });
  })
);

export default router;


