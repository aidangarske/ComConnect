/**
 * User Routes
 * Handles user profile, updates, and user-related operations
 */

import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      bio: user.bio,
      phone: user.phone,
      specialties: user.specialties,
      rating: user.rating,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile: ' + error.message });
  }
});

/**
 * PUT /api/users/profile
 * Update user's profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { fullName, email, bio, phone, specialties } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (fullName) {
      const nameParts = fullName.split(' ');
      user.firstName = nameParts[0] || '';
      user.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (bio) user.bio = bio;
    if (phone) user.phone = phone;
    if (user.role === 'provider' && specialties) {
      user.specialties = Array.isArray(specialties) ? specialties : [specialties];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      bio: user.bio,
      phone: user.phone,
      specialties: user.specialties,
      rating: user.rating
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile: ' + error.message });
  }
});

/**
 * GET /api/users/providers
 * Get all service providers (for seekers to browse)
 */
router.get('/providers', async (req, res) => {
  try {
    const { sort = 'rating', limit = 20 } = req.query;

    let sortOption = {};
    if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'price') {
      sortOption = { hourlyRate: 1 };
    }

    const providers = await User.find({ role: 'provider', isActive: true })
      .sort(sortOption)
      .limit(parseInt(limit))
      .select('-password -email');

    res.status(200).json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching providers: ' + error.message });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user: ' + error.message });
  }
});

export default router;

