/**
 * Review Routes
 * Handles rating and review operations
 */

import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper function to update user rating and review count
 */
const updateUserRating = async (revieweeId) => {
  try {
    const reviews = await Review.find({ revieweeId });
    if (reviews.length === 0) {
      await User.findByIdAndUpdate(revieweeId, {
        rating: 0,
        reviewCount: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const reviewCount = reviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviewCount
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};

/**
 * POST /api/reviews
 * Create a new review/rating
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { revieweeId, jobId, rating, comment } = req.body;

    if (!revieweeId || !rating) {
      return res.status(400).json({ error: 'revieweeId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if reviewee exists
    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      return res.status(404).json({ error: 'User being reviewed not found' });
    }

    // Check if user is trying to review themselves
    if (revieweeId.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    // Check if job exists (if provided)
    if (jobId) {
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
    }

    // Check if review already exists for this job (if jobId provided)
    if (jobId) {
      const existingReview = await Review.findOne({
        reviewerId: req.user.id,
        revieweeId: revieweeId,
        jobId: jobId
      });

      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this user for this job' });
      }
    }

    // Create review
    const review = new Review({
      reviewerId: req.user.id,
      revieweeId: revieweeId,
      jobId: jobId || null,
      rating: rating,
      comment: comment || ''
    });

    await review.save();

    // Update user rating
    await updateUserRating(revieweeId);

    // Populate reviewer info
    await review.populate('reviewerId', 'firstName lastName username profilePicture');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating review: ' + error.message });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Get all reviews for a user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sort = 'newest' } = req.query;

    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortOption = { rating: -1 };
    } else if (sort === 'lowest') {
      sortOption = { rating: 1 };
    }

    const reviews = await Review.find({ revieweeId: userId })
      .sort(sortOption)
      .populate('reviewerId', 'firstName lastName username profilePicture')
      .populate('jobId', 'title');

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.status(200).json({
      success: true,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews: ' + error.message });
  }
});

/**
 * GET /api/reviews/:reviewId
 * Get a single review
 */
router.get('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate('reviewerId', 'firstName lastName username profilePicture')
      .populate('revieweeId', 'firstName lastName username')
      .populate('jobId', 'title');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching review: ' + error.message });
  }
});

/**
 * PUT /api/reviews/:reviewId
 * Update a review (only by the reviewer)
 */
router.put('/:reviewId', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user is the reviewer
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    // Update review
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Update user rating
    await updateUserRating(review.revieweeId);

    await review.populate('reviewerId', 'firstName lastName username profilePicture');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating review: ' + error.message });
  }
});

/**
 * DELETE /api/reviews/:reviewId
 * Delete a review (only by the reviewer)
 */
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user is the reviewer
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    const revieweeId = review.revieweeId;
    await Review.findByIdAndDelete(req.params.reviewId);

    // Update user rating
    await updateUserRating(revieweeId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting review: ' + error.message });
  }
});

export default router;

