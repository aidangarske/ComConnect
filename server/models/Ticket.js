import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
      trim: true,
      maxlength: 100
    },
    message: {
      type: String,
      required: [true, 'Please add a description of the issue'],
      maxlength: 1000
    },
    category: {
      type: String,
      enum: ['technical', 'billing', 'account', 'report_user', 'other'],
      default: 'technical'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    adminResponse: {
      type: String
    },
    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', ticketSchema);