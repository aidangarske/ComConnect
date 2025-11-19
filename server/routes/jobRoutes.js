/**
 * Job Routes
 * Handles job postings, applications, and job-related operations
 */

import express from 'express';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/jobs
 * Create a new job posting (only seekers and admins)
 */
router.post('/', authenticate, authorize('seeker', 'admin'), async (req, res) => {
  try {
    const { title, description, category, budget, budgetType, deadline, estimatedDuration, address, city } = req.body;

    // Validate required fields - only title, description, and budget are required
    if (!title || !description || !budget) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Get poster info
    const user = await User.findById(req.user.id);

        // Create new job
        const newJob = new Job({
          title,
          description,
          category: category || 'other',
          budget: parseFloat(budget),
      budgetType: budgetType || 'fixed',
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      estimatedDuration: estimatedDuration || '1-2 weeks',
      address: address || '',
      city: city || '',
      postedBy: req.user.id,
      posterName: `${user.firstName} ${user.lastName}`.trim() || user.username,
      posterRating: user.rating
    });

    await newJob.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating job: ' + error.message });
  }
});

/**
 * GET /api/jobs
 * Get all jobs with filters
 */
router.get('/', async (req, res) => {
  try {
    const { category, status = 'open', sort = 'newest', limit = 20 } = req.query;

    let filter = { status };
    if (category) filter.category = category;

    let sortOption = { createdAt: -1 }; // Default to newest
    if (sort === 'budget') {
      sortOption = { budget: -1 };
    } else if (sort === 'deadline') {
      sortOption = { deadline: 1 };
    }

    const jobs = await Job.find(filter)
      .sort(sortOption)
      .limit(parseInt(limit))
      .populate('postedBy', 'username firstName lastName rating');

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching jobs: ' + error.message });
  }
});

/**
 * GET /api/jobs/:id
 * Get a specific job by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'username firstName lastName rating phone email')
      .populate('selectedProvider', 'username firstName lastName rating');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching job: ' + error.message });
  }
});

/**
 * POST /api/jobs/:id/apply
 * Apply for a job (providers only)
 */
router.post('/:id/apply', authenticate, authorize('provider'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    if (job.applications.some(app => app.providerId.toString() === req.user.id)) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const user = await User.findById(req.user.id);

    // Add application
    job.applications.push({
      providerId: req.user.id,
      providerName: `${user.firstName} ${user.lastName}`.trim() || user.username,
      providerRating: user.rating,
      appliedAt: new Date()
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ error: 'Error applying for job: ' + error.message });
  }
});

/**
 * PUT /api/jobs/:id/select-provider
 * Select a provider for a job (job poster only)
 */
router.put('/:id/select-provider', authenticate, async (req, res) => {
  try {
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({ error: 'Please provide provider ID' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify user is the job poster
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only job poster can select provider' });
    }

    // Check if provider has applied
    const application = job.applications.find(app => app.providerId.toString() === providerId);
    if (!application) {
      return res.status(400).json({ error: 'Provider has not applied for this job' });
    }

    // Update job
    job.selectedProvider = providerId;
    application.status = 'accepted';
    job.status = 'in-progress';

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Provider selected successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ error: 'Error selecting provider: ' + error.message });
  }
});

/**
 * PUT /api/jobs/:id/complete
 * Mark a job as completed
 */
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify user is either job poster or selected provider
    if (job.postedBy.toString() !== req.user.id && job.selectedProvider?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to complete this job' });
    }

    job.status = 'completed';
    job.completed = true;
    job.completedAt = new Date();

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job marked as completed',
      job
    });
  } catch (error) {
    res.status(500).json({ error: 'Error completing job: ' + error.message });
  }
});

/**
 * GET /api/jobs/user/:userId
 * Get jobs posted by a specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.params.userId })
      .populate('selectedProvider', 'username firstName lastName');

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user jobs: ' + error.message });
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job (only job poster can delete)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify user is the job poster
    // Handle both cases: postedBy as object (_id property) or string
    const jobPosterId = typeof job.postedBy === 'object' ? job.postedBy._id : job.postedBy;
    if (jobPosterId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to delete this job' });
    }

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting job: ' + error.message });
  }
});

export default router;

