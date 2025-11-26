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
    const { fullName, email, bio, phone, specialties, profilePicture } = req.body;

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
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
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
      rating: user.rating,
      profilePicture: user.profilePicture
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

    // Build query to filter out private profiles
    const query = {
      role: 'provider',
      isActive: true,
      $or: [
        { 'privacySettings.profileVisibility': { $exists: false } }, // Default to public if not set
        { 'privacySettings.profileVisibility': 'public' } // Only show public profiles
      ]
    };

    const providers = await User.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .select('-password');

    // Filter email and phone based on privacy settings
    const providersWithPrivacy = providers.map(provider => {
      const providerObj = provider.toObject();
      
      // Only include email if privacy setting allows
      if (providerObj.privacySettings?.showEmail === true && providerObj.email) {
        // Keep email - it's already in the object
      } else {
        delete providerObj.email;
      }
      
      // Only include phone if privacy setting allows
      if (providerObj.privacySettings?.showPhone === true && providerObj.phone) {
        // Keep phone - it's already in the object
      } else {
        delete providerObj.phone;
      }
      
      return providerObj;
    });

    res.status(200).json({
      success: true,
      count: providersWithPrivacy.length,
      providers: providersWithPrivacy
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching providers: ' + error.message });
  }
});

/**
 * GET /api/users/settings
 * Get user settings
 */
router.get('/settings', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      notificationPreferences: user.notificationPreferences || {
        emailNotifications: true,
        jobAlerts: true,
        messageNotifications: true
      },
      privacySettings: user.privacySettings || {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching settings: ' + error.message });
  }
});

/**
 * PUT /api/users/settings/password
 * Change user password
 */
router.put('/settings/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error changing password: ' + error.message });
  }
});

/**
 * PUT /api/users/settings/notifications
 * Update notification preferences
 */
router.put('/settings/notifications', authenticate, async (req, res) => {
  try {
    const { emailNotifications, jobAlerts, messageNotifications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize notificationPreferences if it doesn't exist
    if (!user.notificationPreferences) {
      user.notificationPreferences = {
        emailNotifications: true,
        jobAlerts: true,
        messageNotifications: true
      };
    }

    if (emailNotifications !== undefined) {
      user.notificationPreferences.emailNotifications = emailNotifications;
    }
    if (jobAlerts !== undefined) {
      user.notificationPreferences.jobAlerts = jobAlerts;
    }
    if (messageNotifications !== undefined) {
      user.notificationPreferences.messageNotifications = messageNotifications;
    }

    // Mark the nested object as modified so Mongoose saves it
    user.markModified('notificationPreferences');
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      notificationPreferences: user.notificationPreferences
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating notification preferences: ' + error.message });
  }
});

/**
 * PUT /api/users/settings/privacy
 * Update privacy settings
 */
router.put('/settings/privacy', authenticate, async (req, res) => {
  try {
    const { profileVisibility, showEmail, showPhone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize privacySettings if it doesn't exist
    if (!user.privacySettings) {
      user.privacySettings = {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false
      };
    }

    // Update values
    if (profileVisibility !== undefined) {
      user.privacySettings.profileVisibility = profileVisibility;
    }
    if (showEmail !== undefined) {
      user.privacySettings.showEmail = showEmail;
    }
    if (showPhone !== undefined) {
      user.privacySettings.showPhone = showPhone;
    }

    // Mark the nested object as modified so Mongoose saves it
    user.markModified('privacySettings');
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating privacy settings: ' + error.message });
  }
});

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting account: ' + error.message });
  }
});

/**
 * GET /api/users/:id
 * Get a specific user's public profile by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userObj = user.toObject();
    
    // Filter email and phone based on privacy settings
    if (!userObj.privacySettings?.showEmail) {
      delete userObj.email;
    }
    if (!userObj.privacySettings?.showPhone) {
      delete userObj.phone;
    }

    res.status(200).json({
      success: true,
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user: ' + error.message });
  }
});

export default router;

