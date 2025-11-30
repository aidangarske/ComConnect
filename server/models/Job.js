  import mongoose from 'mongoose';

  export const jobSchema = new mongoose.Schema(
    {
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
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          default: [0, 0]
        }
      },

      isRemote: {
        type: Boolean,
        default: false
      },
      
      address: String,
      city: String,
      deadline: {
        type: Date,
        required: true
      },
      estimatedDuration: {
        type: Number,
        required: true
      },

      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'open', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
      },
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
          },
          isDirectHire: {
            type: Boolean,
            default: false
          }
        }
      ],
      selectedProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date,
      completionNotes: {
        type: String,
        maxlength: 2000
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      reports: [{
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
      }],
    isFlagged: { type: Boolean, default: false }
    },
    { timestamps: true }
  );

  jobSchema.index({ location: '2dsphere' });
  jobSchema.index({ postedBy: 1, status: 1 });

  export default mongoose.model('Job', jobSchema);

