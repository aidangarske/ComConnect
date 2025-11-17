/**
 * User Routes
 * Handles user profile, updates, and user-related operations
 */

const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
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
    const { firstName, lastName, bio, phone, specialties, hourlyRate, experience } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
    if (phone) user.phone = phone;
    if (user.role === 'provider') {
      if (specialties) user.specialties = specialties;
      if (hourlyRate) user.hourlyRate = hourlyRate;
      if (experience) user.experience = experience;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
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

module.exports = router;

