import express from 'express';
// Ensure these match your actual model filenames in the models folder
import Job from '../models/Job.js'; 
import User from '../models/User.js';

const router = express.Router();

// ==========================================
// 1. CONTENT MANAGEMENT (JOBS)
// ==========================================

// GET all content (jobs) for the admin dashboard
router.get('/content', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error('Admin Fetch Content Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching jobs' });
  }
});

// UPDATE status (Approve/Reject)
router.put('/content/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const updatedJob = await Job.findByIdAndUpdate(
      id, 
      { status: status },
      { new: true } 
    );

    if (!updatedJob) return res.status(404).json({ success: false, message: 'Job not found' });

    res.status(200).json({ success: true, message: `Job ${status} successfully`, data: updatedJob });
  } catch (error) {
    console.error('Admin Update Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating job' });
  }
});

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

// GET all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Admin Users Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

// DELETE a user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});

// ==========================================
// 3. MODERATION ACTIONS (BAN/SUSPEND) <--- THIS WAS MISSING
// ==========================================

// BAN a user
router.post('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        isBanned: true,
        banReason: reason,
        bannedAt: new Date(),
        isSuspended: false, // Clear suspension if banned
        suspensionReason: null,
        suspendedUntil: null
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User banned successfully', data: user });
  } catch (error) {
    console.error('Ban Error:', error);
    res.status(500).json({ success: false, message: 'Server error banning user' });
  }
});

// UNBAN a user
router.post('/users/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isBanned: false, banReason: null, bannedAt: null },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User unbanned successfully', data: user });
  } catch (error) {
    console.error('Unban Error:', error);
    res.status(500).json({ success: false, message: 'Server error unbanning user' });
  }
});

// SUSPEND a user
router.post('/users/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, days } = req.body;

    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + (parseInt(days) || 1));

    const user = await User.findByIdAndUpdate(
      id,
      {
        isSuspended: true,
        suspensionReason: reason,
        suspendedUntil: suspendedUntil,
        isBanned: false, // Clear ban if suspended
        banReason: null,
        bannedAt: null
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User suspended for ${days} days`, data: user });
  } catch (error) {
    console.error('Suspend Error:', error);
    res.status(500).json({ success: false, message: 'Server error suspending user' });
  }
});

// UNSUSPEND a user
router.post('/users/:id/unsuspend', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isSuspended: false, suspensionReason: null, suspendedUntil: null },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User unsuspended successfully', data: user });
  } catch (error) {
    console.error('Unsuspend Error:', error);
    res.status(500).json({ success: false, message: 'Server error unsuspending user' });
  }
});

export default router;