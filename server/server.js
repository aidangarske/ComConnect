/**
 * ComConnect Backend Server
 * Node.js Express server with MongoDB integration
 * Runs on http://localhost:8080
 */
import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Initialize Express app
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend's port
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/comconnect';
    
    // Connect with minimal options - Mongoose handles SRV URIs automatically
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.log('📝 Running without database - In-memory storage only');
  }
};

connectDB();

// Make io available to routes via app.locals
app.locals.io = io;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  // Listen for a message from a client
  socket.on('sendMessage', async (messageData) => {
    try {
      // 1. Save the new message to the database
      const newMessage = new Message({
        conversationId: messageData.conversationId,
        senderId: messageData.message.senderId,
        text: messageData.message.text,
      });
      
      const savedMessage = await newMessage.save();

      // 2. Create the response to send back to all clients
      const responseData = {
        conversationId: savedMessage.conversationId,
        message: {
          _id: savedMessage._id,
          senderId: savedMessage.senderId,
          text: savedMessage.text,
          createdAt: savedMessage.createdAt
        }
      }

      // 3. Broadcast the saved message to EVERYONE (including the sender)
      io.emit('receiveMessage', responseData);

    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'ComConnect Backend is running! 🚀' });
});

// 404 Error Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 ComConnect Backend running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:2L7017/comconnect'}`);
});

export default app;

