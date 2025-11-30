import express from 'express';
import Ticket from '../models/Ticket.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;

    const ticket = await Ticket.create({
      user: req.user.id,
      subject,
      message,
      category,
      priority: priority || 'medium'
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('user', 'username email firstName lastName role')
      .sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.put('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;
    
    if (status === 'resolved' && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
    }

    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

export default router;
