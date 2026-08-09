import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler.js';


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
  // Admin joins shared admin room
  socket.on('join_admin', () => {
    socket.join('admin_room');
  });

  // Workers join their personal room: worker_<userId>
  socket.on('join_worker', (workerId) => {
    if (workerId) {
      socket.join(`worker_${workerId}`);
    }
  });

  // Customers join their personal room: customer_<userId>
  socket.on('join_customer', (customerId) => {
    if (customerId) {
      socket.join(`customer_${customerId}`);
    }
  });

  socket.on('disconnect', () => {});
});


import { eventMiddleware } from './middleware/eventMiddleware.js';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(eventMiddleware);

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
import exportRoutes from './routes/export.js';
import internalAiRoutes from './routes/internalAi.js';
import internalAiMultimodalRoutes from './routes/internalAiMultimodal.js';
import internalAiTrustMatchRoutes from './routes/internalAiTrustMatch.js';
import internalAiIntelligenceRoutes from './routes/internalAiIntelligence.js';
import verificationRoutes from './routes/verification.js';
import aiProviderRoutes from './routes/aiProvider.js';
import customerAiRoutes from './routes/customerAi.js';

// Phase 4 Batch 1: AI Provider Layer — initialize after env is loaded
import { AIProviderManager } from './ai/providers/AIProviderManager.js';
(async () => {
  try {
    await AIProviderManager.initialize();
  } catch (err) {
    console.warn('⚠️  AIProviderManager: Provider not ready (API key may be missing) —', err.message);
  }
})();

// Register Routes
app.use('/', verificationRoutes);
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
app.use('/api/admin/export', exportRoutes);
app.use('/api/internal/ai', internalAiRoutes);
app.use('/api/internal/ai', internalAiMultimodalRoutes);
app.use('/api/internal/ai/trustmatch', internalAiTrustMatchRoutes);
app.use('/api/internal/ai', internalAiIntelligenceRoutes);
// Phase 4 Batch 1: AI Provider Layer routes
app.use('/api/ai', aiProviderRoutes);
app.use('/api/customer/ai', customerAiRoutes);



// 404 handler for unknown API routes
app.use('/api/*path', (req, res) => {
  res.status(404).json({ status: 404, message: `Route ${req.originalUrl} not found` });
});



// Global error handler (replaced by centralized middleware)
// The actual handler is imported from middleware/errorHandler.js and applied below.
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🌐 ServeCircle Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   POST /api/auth/register, /api/auth/login`);
  console.log(`   GET  /api/users/me, /api/services, /api/bookings`);
  console.log(`   GET  /api/wallet, /api/reviews, /api/coupons`);
  console.log(`   GET  /api/complaints, /api/contracts, /api/invoices`);
  console.log(`   GET  /api/notifications, /api/partners, /api/analytics/dashboard`);
  console.log(`   POST /api/internal/ai/context, /problem, /service, /urgency, /recommend`);
  console.log(`   POST /api/internal/ai/trustmatch  GET /trustmatch/:id  GET /trustmatch/worker/:id`);
  console.log(`   POST /api/internal/ai/intelligence, /fair-price, /demand, /fraud, /eta, /cancellation`);
  console.log(`   GET  /api/ai/health  GET /api/ai/status  GET /api/ai/providers`);
  console.log(`   POST /api/ai/switch  POST /api/ai/test/text  POST /api/ai/test/parse`);
});
