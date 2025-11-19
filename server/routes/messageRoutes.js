import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

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