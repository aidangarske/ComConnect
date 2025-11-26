import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

// --- POST /api/messages/start - Find or create a conversation with a recipient ---
router.post('/start', authenticate, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    if (recipientId === userId) {
      return res.status(400).json({ error: 'Cannot start a conversation with yourself' });
    }

    // Check if a conversation already exists between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] } // Ensure exactly 2 participants
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId]
      });
      await conversation.save();
    }

    // Populate participant info
    await conversation.populate('participants', 'firstName lastName email username');

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      conversation
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Error starting conversation: ' + error.message });
  }
});

// --- GET all of the logged-in user's conversations ---
router.get('/conversations', authenticate, async (req, res) => {
  try {
    // Get the user ID from the token (provided by the 'authenticate' middleware)
    const userId = req.user.id;

    // Find all conversations where this user is a participant
    const conversations = await Conversation.find({
      participants: userId
    }).populate('participants', 'firstName lastName email'); // Get the other users' info

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET all messages for a specific conversation ---
router.get('/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Security Check: Make sure the user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ error: 'Not authorized to view these messages.' });
    }

    // Find all messages for this conversation
    const messages = await Message.find({
      conversationId: conversationId
    }).populate('senderId', 'name'); // Get the sender's name

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;