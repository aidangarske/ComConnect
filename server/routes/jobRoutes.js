import express from 'express';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const getIO = (req) => req.app.locals.io;

async function populateApplications(job) {
  if (job.applications && job.applications.length > 0) {
    job.applications = await Promise.all(job.applications.map(async (app) => {
      if (app.providerId) {
        try {
          const provider = await User.findById(app.providerId).select('username firstName lastName rating').lean();
          if (provider) {
            return {
              ...app,
              providerId: {
                _id: provider._id,
                username: provider.username,
                firstName: provider.firstName,
                lastName: provider.lastName,
                rating: provider.rating
              }
            };
          }
        } catch (err) {
          console.error('Error populating provider:', err);
        }
      }
      return app;
    }));
  }
  return job;
}

router.post('/', authenticate, authorize('seeker', 'admin'), async (req, res) => {
  try {
    const { title, description, category, budget, budgetType, deadline, estimatedDuration, address, city, isRemote } = req.body;
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
      estimatedDuration: parseFloat(estimatedDuration) || 1, // Default to 1 hour if not provided
      address: address || (user.address ? user.address.street : '') || '',
      city: city || (user.address ? user.address.city : '') || '',
      isRemote: isRemote || false,
      postedBy: req.user.id,
      posterName: `${user.firstName} ${user.lastName}`.trim() || user.username,
      posterRating: user.rating,
      location: user.location || { type: 'Point', coordinates: [0, 0] },
    });

    await newJob.save();

    // Populate the job for socket emission
    const populatedJob = await Job.findById(newJob._id)
      .populate('postedBy', 'username firstName lastName rating');

    // Emit socket event for new job
    const io = getIO(req);
    if (io) io.emit('jobCreated', { job: populatedJob });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating job: ' + error.message });
  }
});

router.post('/direct-hire', authenticate, authorize('seeker', 'admin'), async (req, res) => {
  try {
    const { title, description, category, budget, estimatedDuration, providerId } = req.body;

    // Validate required fields
    if (!title || !description || !budget || !providerId) {
      return res.status(400).json({ error: 'Please provide all required fields including providerId' });
    }

    // Verify provider exists
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (provider.role !== 'provider') {
      return res.status(400).json({ error: 'Selected user is not a provider' });
    }

    // Get poster info
    const user = await User.findById(req.user.id);

    // Create new job with status 'open' and pending hire request
    const newJob = new Job({
      title,
      description,
      category: category || 'other',
      budget: parseFloat(budget),
      budgetType: 'fixed',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      estimatedDuration: estimatedDuration || '1-2 weeks',
      postedBy: req.user.id,
      posterName: `${user.firstName} ${user.lastName}`.trim() || user.username,
      posterRating: user.rating || 0,
      status: 'open', // Keep as open until provider accepts
      // Don't set selectedProvider yet - wait for provider to accept
    });

    // Add provider as pending hire request (not accepted yet)
    newJob.applications.push({
      providerId: providerId,
      providerName: `${provider.firstName} ${provider.lastName}`.trim() || provider.username,
      providerRating: provider.rating || 0,
      appliedAt: new Date(),
      status: 'pending', // Pending until provider accepts
      isDirectHire: true // Flag to indicate this is a direct hire request
    });

    await newJob.save();

    // Populate the job for socket emission
    let populatedJob = await Job.findById(newJob._id)
      .populate('postedBy', 'username firstName lastName rating')
      .populate('selectedProvider', 'username firstName lastName rating')
      .lean();

    // Manually populate applications
    populatedJob = await populateApplications(populatedJob);

    // Emit socket events
    const io = getIO(req);
    if (io) {
      io.emit('jobCreated', { job: populatedJob });
      io.emit('jobUpdated', { jobId: newJob._id, job: populatedJob });
      // Emit notification to the provider about pending hire request
      io.emit('directHireRequest', {
        providerId: providerId,
        job: populatedJob,
        seekerName: `${user.firstName} ${user.lastName}`.trim() || user.username
      });
    }

    res.status(201).json({
      success: true,
      message: 'Hire request sent to provider. They will need to accept it.',
      job: populatedJob
    });
  } catch (error) {
    res.status(500).json({ error: 'Error hiring provider: ' + error.message });
  }
});

// Provider accepts a direct hire request
router.put('/:id/accept-hire-request', authenticate, authorize('provider'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Find the application for this provider
    const application = job.applications.find(
      app => app.providerId.toString() === req.user.id && app.isDirectHire === true
    );

    if (!application) {
      return res.status(404).json({ error: 'No hire request found for you on this job' });
    }

    // Update application status to accepted
    application.status = 'accepted';

    // Set this provider as the selected provider
    job.selectedProvider = req.user.id;
    job.status = 'in-progress';

    await job.save();

    // Populate for response
    let populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'username firstName lastName rating')
      .populate('selectedProvider', 'username firstName lastName rating')
      .lean();

    populatedJob = await populateApplications(populatedJob);

    // Emit socket events
    const io = getIO(req);
    if (io) {
      io.emit('jobUpdated', { jobId: job._id, job: populatedJob });
      io.emit('hireRequestAccepted', {
        jobId: job._id,
        providerId: req.user.id,
        seekerId: job.postedBy
      });
    }

    res.json({
      success: true,
      message: 'Hire request accepted! Job is now in progress.',
      job: populatedJob
    });
  } catch (error) {
    res.status(500).json({ error: 'Error accepting hire request: ' + error.message });
  }
});

// Provider rejects a direct hire request
router.put('/:id/reject-hire-request', authenticate, authorize('provider'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Find the application for this provider
    const application = job.applications.find(
      app => app.providerId.toString() === req.user.id && app.isDirectHire === true
    );

    if (!application) {
      return res.status(404).json({ error: 'No hire request found for you on this job' });
    }

    // Update application status to rejected
    application.status = 'rejected';

    await job.save();

    // Populate for response
    let populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'username firstName lastName rating')
      .populate('selectedProvider', 'username firstName lastName rating')
      .lean();

    populatedJob = await populateApplications(populatedJob);

    // Emit socket events
    const io = getIO(req);
    if (io) {
      io.emit('jobUpdated', { jobId: job._id, job: populatedJob });
      io.emit('hireRequestRejected', {
        jobId: job._id,
        providerId: req.user.id,
        seekerId: job.postedBy
      });
    }

    res.json({
      success: true,
      message: 'Hire request rejected.',
      job: populatedJob
    });
  } catch (error) {
    res.status(500).json({ error: 'Error rejecting hire request: ' + error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, status = 'open', sort = 'newest', limit = 20 } = req.query;

    let queryStatus = status;
    if (queryStatus === 'pending' || queryStatus === 'rejected') {
        queryStatus = 'approved';
    }

    let filter = { status: queryStatus };
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

router.post('/:id/apply', authenticate, authorize('provider'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job is open for applications
    if (job.status !== 'open') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
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

    // Get the application that was just added (before populate)
    const newApplication = job.applications[job.applications.length - 1];

    // Populate the job for socket emission
    let populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'username firstName lastName rating')
      .lean();

    // Manually populate applications
    populatedJob = await populateApplications(populatedJob);

    // Emit socket events
    const io = getIO(req);
    if (io) {
      io.emit('jobApplication', { 
        jobId: job._id, 
        application: newApplication, 
        job: populatedJob 
      });
      io.emit('jobUpdated', { jobId: job._id, job: populatedJob });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ error: 'Error applying for job: ' + error.message });
  }
});


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

    // Populate the job for socket emission
    let populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'username firstName lastName rating')
      .populate('selectedProvider', 'username firstName lastName rating')
      .lean();

    // Manually populate applications
    populatedJob = await populateApplications(populatedJob);

    // Emit socket events
    const io = getIO(req);
    if (io) {
      io.emit('jobProviderSelected', { 
        jobId: job._id, 
        providerId: providerId, 
        job: populatedJob 
      });
      io.emit('jobUpdated', { jobId: job._id, job: populatedJob });
    }

    res.status(200).json({
      success: true,
      message: 'Provider selected successfully',
      job
    });
  } catch (error) {
    res.status(500).json({ error: 'Error selecting provider: ' + error.message });
  }
});


router.delete('/:id/withdraw-application', authenticate, authorize('provider'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Find and remove the provider's application
    const applicationIndex = job.applications.findIndex(
      app => app.providerId.toString() === req.user.id
    );

    if (applicationIndex === -1) {
      return res.status(400).json({ error: 'You have not applied for this job' });
    }

    // Remove the application
    job.applications.splice(applicationIndex, 1);

    await job.save();

    // Populate the job for socket emission
    let populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'username firstName lastName rating')
      .populate('selectedProvider', 'username firstName lastName rating')
      .lean();

    // Manually populate applications
    populatedJob = await populateApplications(populatedJob);

    // Emit socket events
    const io = getIO(req);
    if (io) {
      io.emit('jobUpdated', { jobId: job._id, job: populatedJob });
    }

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      job: populatedJob
    });
  } catch (error) {
    res.status(500).json({ error: 'Error withdrawing application: ' + error.message });
  }
});


router.put('/:id/reject-application', authenticate, async (req, res) => {
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
      return res.status(403).json({ error: 'Only job poster can reject applications' });
    }

    // Find the application
    const application = job.applications.find(app => app.providerId.toString() === providerId);
    if (!application) {
      return res.status(400).json({ error: 'Application not found' });
    }

    // Update application status
    application.status = 'rejected';

    await job.save();

    // Populate the job for socket emission
    let populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'username firstName lastName rating')
      .populate('selectedProvider', 'username firstName lastName rating')
      .lean();

    // Manually populate applications
    populatedJob = await populateApplications(populatedJob);

    // Emit socket events
    const io = getIO(req);
    if (io) {
      io.emit('jobUpdated', { jobId: job._id, job: populatedJob });
    }

    res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      job: populatedJob
    });
  } catch (error) {
    res.status(500).json({ error: 'Error rejecting application: ' + error.message });
  }
});


router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const { completionNotes } = req.body;
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
    if (completionNotes) {
      job.completionNotes = completionNotes;
    }

    await job.save();

    // Populate the job for socket emission
    let populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'username firstName lastName rating')
      .populate('selectedProvider', 'username firstName lastName rating')
      .lean();

    // Manually populate applications
    populatedJob = await populateApplications(populatedJob);

    // Emit socket events
    const io = getIO(req);
    if (io) {
      io.emit('jobUpdated', { jobId: job._id, job: populatedJob });
      io.emit('jobCompleted', { jobId: job._id, job: populatedJob });
    }

    res.status(200).json({
      success: true,
      message: 'Job marked as completed',
      job: populatedJob
    });
  } catch (error) {
    res.status(500).json({ error: 'Error completing job: ' + error.message });
  }
});

router.get('/hire-requests/my', authenticate, authorize('provider'), async (req, res) => {
  try {
    const providerId = req.user.id;
    
    // Find all jobs where this provider has a pending application with isDirectHire flag
    const jobs = await Job.find({
      'applications.providerId': providerId,
      'applications.status': 'pending',
      'applications.isDirectHire': true,
      status: 'open'
    })
      .populate('postedBy', 'username firstName lastName rating')
      .sort({ createdAt: -1 })
      .lean();

    // Filter to only include jobs where the application is actually pending for this provider
    const hireRequests = jobs.filter(job => {
      const app = job.applications.find(
        a => a.providerId.toString() === providerId && 
        a.status === 'pending' && 
        a.isDirectHire === true
      );
      return app !== undefined;
    });

    res.status(200).json({
      success: true,
      hireRequests
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching hire requests: ' + error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.params.userId })
      .populate('selectedProvider', 'username firstName lastName rating')
      .lean();

    // Populate provider details for applications (since they're subdocuments)
    const jobsWithPopulatedApps = await Promise.all(jobs.map(async (job) => {
      if (job.applications && job.applications.length > 0) {
        // Populate provider details for each application
        job.applications = await Promise.all(job.applications.map(async (app) => {
          if (app.providerId) {
            try {
              const provider = await User.findById(app.providerId).select('username firstName lastName rating').lean();
              if (provider) {
                return {
                  ...app,
                  providerId: {
                    _id: provider._id,
                    username: provider.username,
                    firstName: provider.firstName,
                    lastName: provider.lastName,
                    rating: provider.rating
                  }
                };
              }
            } catch (err) {
              console.error('Error populating provider:', err);
            }
          }
          // Return app as-is if provider lookup fails (we still have providerName and providerRating)
          return app;
        }));
      }
      
      return job;
    }));

    res.status(200).json({
      success: true,
      count: jobsWithPopulatedApps.length,
      jobs: jobsWithPopulatedApps
    });
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    res.status(500).json({ error: 'Error fetching user jobs: ' + error.message });
  }
});

router.get('/applications/my', authenticate, authorize('provider'), async (req, res) => {
  try {
    const jobs = await Job.find({
      'applications.providerId': req.user.id
    })
      .populate('postedBy', 'username firstName lastName rating')
      .populate('selectedProvider', 'username firstName lastName');

    // Filter to include only the user's application
    const jobsWithUserApplication = jobs.map(job => {
      const userApplication = job.applications.find(
        app => app.providerId.toString() === req.user.id
      );
      return {
        ...job.toObject(),
        myApplication: userApplication
      };
    });

    res.status(200).json({
      success: true,
      count: jobsWithUserApplication.length,
      jobs: jobsWithUserApplication
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching applied jobs: ' + error.message });
  }
});

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

    // Emit socket event for job deletion
    const io = getIO(req);
    if (io) {
      io.emit('jobDeleted', { jobId: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting job: ' + error.message });
  }
});

router.post('/:id/report', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Please provide a reason' });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check if user already reported to prevent spam
    const alreadyReported = job.reports.some(
      r => r.reportedBy.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({ error: 'You have already reported this job.' });
    }

    // Add the report
    job.reports.push({
      reportedBy: req.user.id,
      reason: reason
    });
    
    // Automatically flag the job for admin review
    job.isFlagged = true;

    await job.save();
    res.json({ success: true, message: 'Job reported to admins.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

