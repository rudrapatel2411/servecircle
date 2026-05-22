import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET reviews by worker
router.get('/worker/:workerId', async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('customer', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET reviews by customer (my reviews)
router.get('/my', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('worker', 'name avatar')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create review
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { booking, worker, service, rating, comment } = req.body;

    const review = await Review.create({
      booking,
      customer: req.user._id,
      worker,
      service,
      rating,
      comment,
    });

    // Update worker's average rating
    const allReviews = await Review.find({ worker });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(worker, { rating: Math.round(avgRating * 10) / 10 });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT update review
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, customer: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.isEdited = true;
    await review.save();

    // Recalculate worker average
    const allReviews = await Review.find({ worker: review.worker });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(review.worker, { rating: Math.round(avgRating * 10) / 10 });

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE review
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, customer: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
