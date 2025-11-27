/**
 * Review Model
 * Represents a rating/review given by one user to another
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // Who wrote the review
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Who is being reviewed
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Associated job (optional)
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null
    },
    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    // Review comment
    comment: {
      type: String,
      maxlength: 1000,
      default: ''
    },
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for efficient queries
reviewSchema.index({ revieweeId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1, revieweeId: 1, jobId: 1 });

export default mongoose.model('Review', reviewSchema);

