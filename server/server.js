import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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
import callRequestRoutes from './routes/callRequests.js';
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
import { ensureDemoUsersInDB } from './utils/demoAuthStore.js';
import { notifyAdmin, broadcastCallRequest, notifyCallAccepted } from './services/notificationService.js';
import { prisma } from './config/prisma.js';
import { syncAndLoadServiceVectors } from './ai/services/ragService.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;

// ─── Socket.io Connection & Room Handling ───────────────────────────────────
io.on('connection', (socket) => {
  // Room joins
  socket.on('join_admin', () => {
    socket.join('admin_room');
  });

  socket.on('join_worker', (workerId) => {
    if (workerId) {
      socket.join(`worker_${workerId}`);
      socket.join('workers_broadcast'); // receive call requests + new job alerts
    }
  });

  socket.on('join_worker_category', (category) => {
    if (category) {
      socket.join(`workers_category_${category}`);
      socket.join(`workers_category_${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
    }
  });

  socket.on('join_customer', (customerId) => {
    if (customerId) socket.join(`customer_${customerId}`);
  });

  socket.on('join_b2b', (userId) => {
    if (userId) socket.join(`b2b_${userId}`);
  });

  // Client-side booking created event
  socket.on('new_booking_created', (payload) => {
    const now = new Date();
    const dateStr = now.toLocaleString('en-IN');
    const bookingId = payload.bookingId || payload.id || `SC-${Date.now()}`;
    const category = payload.category || 'General';

    // 1. Notify admin panel
    notifyAdmin(
      io,
      '📋 New Booking Received',
      `Booking ${bookingId} | "${payload.service}" | Category: ${category} | ₹${payload.amount} | Worker: ${payload.workerName || 'Unassigned'}`,
      'alert',
      {
        bookingId,
        category,
        service: payload.service,
        amount: payload.amount,
        city: payload.city,
      }
    );

    // 2. Notify workers targeted by Category & Broadcast fallback
    const workerJobPayload = {
      id: `notif_worker_${Date.now()}`,
      title: `🆕 New Job: ${payload.service}`,
      message: `New booking ${bookingId} in "${category}" — ₹${payload.amount}. Review & accept job in your panel.`,
      type: 'broadcast',
      date: dateStr,
      timestamp: now.toISOString(),
      bookingId,
      category,
      service: payload.service,
      amount: payload.amount,
      city: payload.city,
    };

    if (payload.category) {
      io.to(`workers_category_${payload.category}`).emit('worker_notification', workerJobPayload);
      io.to(`workers_category_${payload.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`).emit('worker_notification', workerJobPayload);
    }
    io.to('workers_broadcast').emit('worker_notification', workerJobPayload);

    // 3. Booking confirmation back to customer
    if (payload.customerId) {
      io.to(`customer_${payload.customerId}`).emit('customer_notification', {
        id: `notif_cust_${Date.now()}`,
        title: '✅ Booking Confirmed',
        message: `Your booking ${bookingId} for ${payload.service} has been placed!`,
        type: 'system',
        date: dateStr,
        timestamp: now.toISOString(),
        bookingId,
      });
    }
  });

  // Customer Call Request Event (from CallMeBackWidget)
  socket.on('customer_call_request', (payload) => {
    broadcastCallRequest(io, payload);
  });

  socket.on('call_request_direct', (payload) => {
    broadcastCallRequest(io, payload);
  });

  // Worker Accepts Call Request
  socket.on('worker_accepted_call', (payload) => {
    notifyCallAccepted(io, payload);
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

// PostgreSQL (Prisma ORM) & RAG Layer Initialization
(async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL (Prisma ORM) Connected Successfully');
    await ensureDemoUsersInDB(prisma);
    // Pre-cache catalog services into Vector RAG memory
    await syncAndLoadServiceVectors(false);
  } catch (err) {
    console.error('❌ PostgreSQL / RAG Connection Error:', err.message);
  }
})();

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
app.use('/api/call-requests', callRequestRoutes);
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
