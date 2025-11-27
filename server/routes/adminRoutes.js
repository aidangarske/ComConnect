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

    // 1. Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      id, 
      { status: status },
      { new: true } 
    );

    if (!updatedJob) return res.status(404).json({ success: false, message: 'Job not found' });

    // 2. SOCKET EMISSION (Real-time update)
    const io = req.app.locals.io;
    if (io) {
      // We need to populate the user info so the frontend card renders correctly
      const populatedJob = await Job.findById(updatedJob._id)
        .populate('postedBy', 'username firstName lastName rating');

      // If we just Approved it, it's effectively "Created" for the Service Providers
      if (status === 'approved') {
        io.emit('jobCreated', { job: populatedJob });
      }
      
      // Also emit update for anyone else listening
      io.emit('jobUpdated', { jobId: id, job: populatedJob });
    }

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
    
    // NEW: Emit event so user lists update automatically
    const io = req.app.locals.io;
    if (io) io.emit('userDeleted', { userId: id });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});

// ==========================================
// 3. MODERATION ACTIONS (BAN/SUSPEND)
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
        isSuspended: false, 
        suspensionReason: null,
        suspendedUntil: null
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // NEW: Force logout the banned user if they are online
    const io = req.app.locals.io;
    if (io) {
        // Emit a specific event that your frontend App.js could listen to for force-logout
        io.emit('userBanned', { userId: id, reason });
    }

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
    
    const io = req.app.locals.io;
    if (io) io.emit('userUpdated', { userId: id, user });

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
        isBanned: false, 
        banReason: null,
        bannedAt: null
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const io = req.app.locals.io;
    if (io) io.emit('userSuspended', { userId: id, reason, days });

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

    const io = req.app.locals.io;
    if (io) io.emit('userUpdated', { userId: id, user });

    res.json({ success: true, message: 'User unsuspended successfully', data: user });
  } catch (error) {
    console.error('Unsuspend Error:', error);
    res.status(500).json({ success: false, message: 'Server error unsuspending user' });
  }
});

export default router;