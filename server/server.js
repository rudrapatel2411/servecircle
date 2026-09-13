import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler.js';
import { eventMiddleware } from './middleware/eventMiddleware.js';

// Route Imports
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
import { AIProviderManager } from './ai/providers/AIProviderManager.js';

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
  socket.on('join_admin', () => {
    socket.join('admin_room');
  });
  socket.on('join_worker', (workerId) => {
    if (workerId) socket.join(`worker_${workerId}`);
  });
  socket.on('join_customer', (customerId) => {
    if (customerId) socket.join(`customer_${customerId}`);
  });
  socket.on('disconnect', () => {});
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(eventMiddleware);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB Connection with Atlas support and DNS fallback
// MongoDB Connection with Atlas support and automatic Local fallback
const connectDB = async () => {
  const atlasURI = process.env.MONGODB_ATLAS_URI;
  const localURI = process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle';

  if (atlasURI) {
    try {
      if (atlasURI.includes('+srv://')) {
        try {
          dns.setServers(['8.8.8.8', '8.8.4.4']);
        } catch (dnsErr) {
          console.warn('DNS server configuration warning:', dnsErr.message);
        }
      }
      await mongoose.connect(atlasURI, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Atlas Connected Successfully (Database: ${mongoose.connection.name})`);
      return;
    } catch (atlasErr) {
      console.warn(`⚠️ Atlas connection failed (${atlasErr.message}). Falling back to local MongoDB...`);
    }
  }

  try {
    await mongoose.connect(localURI);
    console.log(`✅ Local MongoDB Connected Successfully (Database: ${mongoose.connection.name})`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Running in demo fallback mode');
  }
};

connectDB();

// AI Provider Layer
(async () => {
  try {
    await AIProviderManager.initialize();
  } catch (err) {
    console.warn('⚠️ AIProviderManager: Provider not ready —', err.message);
  }
})();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ServeCircle API is running 🚀', timestamp: new Date().toISOString() });
});

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
app.use('/api/ai', aiProviderRoutes);
app.use('/api/customer/ai', customerAiRoutes);

// 404 handler for unknown API routes
app.use('/api/*path', (req, res) => {
  res.status(404).json({ status: 404, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`
┌────────────────────────────────────────────────────────┐
│  🚀 ServeCircle Backend Ready!                         │
│  🌐 Web App (Client):  http://localhost:5173           │
│  ⚙️  API (Server):      http://localhost:${PORT}           │
└────────────────────────────────────────────────────────┘
`);
});
