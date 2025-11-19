/**
 * Job Model
 * Represents a job posting created by a Service Seeker
 */

import mongoose from 'mongoose';

export const jobSchema = new mongoose.Schema(
  {
    // Job Details
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
      maxlength: 2000
    },
    category: {
      type: String,
      required: true,
      enum: [
        'manual labor',
        'tutoring',
        'painting',
        'cleaning',
        'gardening',
        'automotive',
        'design',
        'assembly',
        'plumbing',
        'electrical',
        'photography',
        'music',
        'writing',
        'other'
      ]
    },

    // Pricing
    budget: {
      type: Number,
      required: true,
      min: 0
    },
    budgetType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed'
    },

    // Seeker who posted the job
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    posterName: String,
    posterRating: {
      type: Number,
      default: 0
    },

    // Location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    address: String,
    city: String,

    // Timeline
    deadline: {
      type: Date,
      required: true
    },
    estimatedDuration: {
      type: String,
      required: true
    },

    // Status
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open'
    },

    // Applications
    applications: [
      {
        providerId: mongoose.Schema.Types.ObjectId,
        providerName: String,
        providerRating: Number,
        appliedAt: {
          type: Date,
          default: Date.now
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending'
        }
      }
    ],
    selectedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // Review
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,

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

// Create geospatial index for location-based queries
jobSchema.index({ location: '2dsphere' });
jobSchema.index({ postedBy: 1, status: 1 });

export default mongoose.model('Job', jobSchema);

