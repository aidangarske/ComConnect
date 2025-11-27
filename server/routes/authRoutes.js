/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */

import express from 'express';
import jwt from "jsonwebtoken";
import User from '../models/User.js';
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_make_it_very_long',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Helper to check ban/suspend status
const checkAccountStatus = (user) => {
  // 1. Check if Banned
  if (user.isBanned) {
    return { 
      allowed: false, 
      message: `Your account has been permanently banned. Reason: ${user.banReason || 'Violation of terms'}` 
    };
  }

  // 2. Check if Suspended
  if (user.isSuspended) {
    const now = new Date();
    // If suspension date is in the future
    if (user.suspendedUntil && new Date(user.suspendedUntil) > now) {
      return { 
        allowed: false, 
        message: `Your account is suspended until ${new Date(user.suspendedUntil).toLocaleDateString()}. Reason: ${user.suspensionReason}` 
      };
    } else {
      // Suspension time has passed - Auto-unsuspend logic (Optional but good UX)
      // Note: We can't await save here easily without making this async, 
      // so for now we just let them in. Ideally, you'd update the DB here.
    }
  }

  return { allowed: true };
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password || !username || !role) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Validate role
    if (!['provider', 'seeker', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be provider, seeker, or admin' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already registered' });
    }

    // Create new user
    const newUser = new User({
      email,
      password,
      username,
      firstName,
      lastName,
      role
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id, newUser.role);

    // Return user data and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

/**
 * POST /api/auth/login
 * Login a user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // --- NEW: CHECK BAN/SUSPEND STATUS ---
    const status = checkAccountStatus(user);
    if (!status.allowed) {
      return res.status(403).json({ error: status.message });
    }
    // -------------------------------------

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return user data and token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        rating: user.rating
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

/**
 * POST /api/auth/verify
 * Verify JWT token and return user data
 */
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_make_it_very_long');
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // --- NEW: CHECK BAN/SUSPEND STATUS ON VERIFY TOO ---
    // This prevents banned users from using an old token they already have
    const status = checkAccountStatus(user);
    if (!status.allowed) {
      return res.status(403).json({ error: status.message });
    }
    // ---------------------------------------------------

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        rating: user.rating
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token: ' + error.message });
  }
});

export default router;