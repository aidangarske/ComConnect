import express from 'express';
import Job from '../models/Job.js'; 
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.get('/content', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error('Admin Fetch Content Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching jobs' });
  }
});

router.get('/content/reported', authenticate, authorize('admin'), async (req, res) => {
  try {
    const reportedJobs = await Job.find({ reports: { $exists: true, $not: { $size: 0 } } })
      .populate('postedBy', 'firstName lastName email') 
      .populate('reports.reportedBy', 'firstName lastName')
      .sort({ 'reports.createdAt': -1 });

    res.json({ success: true, jobs: reportedJobs });
  } catch (error) {
    console.error('Fetch Reported Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/content/:jobId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.jobId);
    
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const io = req.app.locals.io;
    if (io) io.emit('jobDeleted', { jobId: req.params.jobId });

    res.json({ success: true, message: 'Job removed successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/content/:jobId/dismiss', authenticate, authorize('admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    job.reports = []; 
    job.isFlagged = false; 
    await job.save();

    res.json({ success: true, message: 'Reports dismissed' });
  } catch (error) {
    console.error('Dismiss Report Error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
    const io = req.app.locals.io;
    if (io) {
      const populatedJob = await Job.findById(updatedJob._id)
        .populate('postedBy', 'username firstName lastName rating');
      if (status === 'approved') {
        io.emit('jobCreated', { job: populatedJob });
      }
      io.emit('jobUpdated', { jobId: id, job: populatedJob });
    }

    res.status(200).json({ success: true, message: `Job ${status} successfully`, data: updatedJob });
  } catch (error) {
    console.error('Admin Update Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating job' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Admin Users Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found' });
    const io = req.app.locals.io;
    if (io) io.emit('userDeleted', { userId: id });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});

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

    const io = req.app.locals.io;
    if (io) {
        io.emit('userBanned', { userId: id, reason });
    }

    res.json({ success: true, message: 'User banned successfully', data: user });
  } catch (error) {
    console.error('Ban Error:', error);
    res.status(500).json({ success: false, message: 'Server error banning user' });
  }
});

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