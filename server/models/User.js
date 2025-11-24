/**
 * User Model
 * Represents a user in the ComConnect system
 * Can be a Service Provider, Service Seeker, or Admin
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false // Don't return password by default
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },

    // Role
    role: {
      type: String,
      enum: ['provider', 'seeker', 'admin'],
      default: 'seeker', // <-- Adjusted default role from 'provider' to 'seeker' (if applicable)
      required: true
    },

    // Profile Information
    profilePicture: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: 500
    },
    phone: {
      type: String,
      match: [/^\+?1?\d{9,15}$/, 'Please provide a valid phone number']
    },
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
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },

    // Provider-specific fields
    specialties: {
      type: [String],
      default: []
    },
    hourlyRate: {
      type: Number,
      min: 0
    },
    experience: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'entry'
    },
    certifications: {
      type: [String],
      default: []
    },

    // Rating and Reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },

    // Settings
    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      jobAlerts: {
        type: Boolean,
        default: true
      },
      messageNotifications: {
        type: Boolean,
        default: true
      }
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showPhone: {
        type: Boolean,
        default: false
      }
    },

    // Account Status
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
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

// --- Middleware Hooks ---

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Instance Methods (Required by route files) ---

// 1. Method to compare password (Required by authRoutes.js)
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 2. Method to get public profile (Required by userRoutes.js)
userSchema.methods.getPublicProfile = function() {
  const userObj = this.toObject();
  
  // Clean the object before returning it to the frontend
  delete userObj.password;
  delete userObj.isVerified;
  delete userObj.isActive;
  delete userObj.__v;

  return userObj;
};

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

// --- FINAL EXPORT (Uses ES Module 'export default') ---
export default mongoose.model('User', userSchema);