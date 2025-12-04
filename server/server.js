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
import ticketRoutes from './routes/ticketRoutes.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Initialize Express app
const app = express();

const server = http.createServer(app);

// Allow frontend URL from environment variable (for Render deployment)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
// Increase body size limit to handle base64 encoded images (20MB)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets', ticketRoutes);

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

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'ComConnect Backend API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      messages: '/api/messages',
      reviews: '/api/reviews',
      admin: '/api/admin',
      tickets: '/api/tickets'
    }
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
  if (process.env.MONGODB_URI) {
    // Only show that MongoDB URI is set, don't log the actual connection string for security
    console.log(`📊 MongoDB: Connected (URI configured)`);
  } else {
    console.log(`⚠️  MongoDB: No MONGODB_URI environment variable set - using default localhost`);
  }
});

export default app;

