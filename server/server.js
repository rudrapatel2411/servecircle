import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log(`🛡️  Admin joined room: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.log('⚠️  MongoDB not available — running in demo mode');
  }
};

connectDB();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ServeCircle API is running 🚀', timestamp: new Date().toISOString() });
});

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import walletRoutes from './routes/wallet.js';
import couponRoutes from './routes/coupons.js';
import complaintRoutes from './routes/complaints.js';
import contractRoutes from './routes/contracts.js';
import invoiceRoutes from './routes/invoices.js';
import notificationRoutes from './routes/notifications.js';
import partnerRoutes from './routes/partners.js';
import analyticsRoutes from './routes/analytics.js';

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('/api/*splat', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

httpServer.listen(PORT, () => {
  console.log(`🌐 ServeCircle Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   POST /api/auth/register, /api/auth/login`);
  console.log(`   GET  /api/users/me, /api/services, /api/bookings`);
  console.log(`   GET  /api/wallet, /api/reviews, /api/coupons`);
  console.log(`   GET  /api/complaints, /api/contracts, /api/invoices`);
  console.log(`   GET  /api/notifications, /api/partners, /api/analytics/dashboard`);
});
