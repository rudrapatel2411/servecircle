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
import User from './models/User.js';
import { ensureDemoUsersInDB } from './utils/demoAuthStore.js';
import { notifyAdmin } from './services/notificationService.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

// ─── Socket.io connection handling ───────────────────────────────────────────
io.on('connection', (socket) => {

  // ── Room joins ──
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
    if (category) socket.join(`workers_category_${category}`);
  });

  socket.on('join_customer', (customerId) => {
    if (customerId) socket.join(`customer_${customerId}`);
  });

  socket.on('join_b2b', (userId) => {
    if (userId) socket.join(`b2b_${userId}`);
  });

  // ── Client-side booking created event ────────────────────────────────────
  // Fired from BookingFlow.jsx when a booking is confirmed (even in demo/offline mode).
  // Server re-broadcasts to admin_room and targeted category workers so ALL panels see it live.
  socket.on('new_booking_created', (payload) => {
    const now = new Date();
    const dateStr = now.toLocaleString('en-IN');
    const bookingId = payload.bookingId || payload.id || `SC-${Date.now()}`;
    const category = payload.category || 'General';

    // 1. Notify admin panel (Live Socket + Persistent Notification in DB/Demo Store)
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

    // 3. Booking confirmation back to the customer who just booked
    if (payload.customerId) {
      io.to(`customer_${payload.customerId}`).emit('customer_notification', {
        id: `notif_cust_${Date.now()}`,
        title: '✅ Booking Confirmed',
        message: `Your booking ${bookingId} for "${payload.service}" is confirmed! A worker will be assigned shortly.`,
        type: 'system',
        date: dateStr,
        timestamp: now.toISOString(),
        bookingId,
      });
    }
  });

  // ── Society Group Booking Created Event ────────────────────────────────────
  socket.on('group_booking_created', (payload) => {
    const now = new Date();
    const dateStr = now.toLocaleString('en-IN');
    const groupId = payload.groupId || `SC-GRP-${Date.now().toString().slice(-4)}`;
    const category = payload.category || 'Society Management';

    // 1. Notify Admin Panel
    notifyAdmin(
      io,
      `🏢 Society Group Booking: ${payload.societyName || 'New Society'}`,
      `Group Booking #${groupId} | Society: "${payload.societyName}" (${payload.flatCount} flats) | Service: "${payload.service}" | Contact: ${payload.contactName} (+91 ${payload.phone || 'N/A'}) | Total: ₹${payload.amount}`,
      'alert',
      {
        groupId,
        societyName: payload.societyName,
        contactName: payload.contactName,
        phone: payload.phone,
        flatCount: payload.flatCount,
        category,
        service: payload.service,
        amount: payload.amount,
        preferredDate: payload.preferredDate,
      }
    );

    // 2. Notify Target Workers in this exact service category
    const workerGroupPayload = {
      id: `notif_grp_${Date.now()}`,
      title: `🏢 Group Job Alert: ${payload.service}`,
      message: `Bulk booking for ${payload.societyName} (${payload.flatCount} flats) — "${payload.service}". Total value: ₹${payload.amount}. Date: ${payload.preferredDate}.`,
      type: 'broadcast',
      date: dateStr,
      timestamp: now.toISOString(),
      groupId,
      societyName: payload.societyName,
      contactName: payload.contactName,
      category,
      service: payload.service,
      flatCount: payload.flatCount,
      amount: payload.amount,
    };

    if (category) {
      io.to(`workers_category_${category}`).emit('worker_notification', workerGroupPayload);
      io.to(`workers_category_${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`).emit('worker_notification', workerGroupPayload);
    }
    io.to('workers_broadcast').emit('worker_notification', workerGroupPayload);
  });

  // ── Real-Time Booking Status Changed (Worker arriving / OTP verified) ─────
  socket.on('booking_status_changed', (payload) => {
    io.to('admin_room').emit('booking_status_changed', payload);
    io.emit('booking_status_changed', payload); // Broadcast to customer and worker
  });

  // ── Direct call request via socket (offline/demo fallback from CallMeBackWidget) ──
  socket.on('call_request_direct', (payload) => {
    const now = new Date();
    const dateStr = now.toLocaleString('en-IN');
    const category = payload.category || payload.serviceType || 'General Help';

    const notifPayload = {
      id: `notif_cr_${Date.now()}`,
      title: `📞 New Call Request: ${payload.serviceType || category}`,
      message: `${payload.customerName || 'A customer'} requested callback for ${payload.serviceType || category}. Mobile: +91 ${payload.phone}.`,
      type: 'call_request',
      date: dateStr,
      timestamp: now.toISOString(),
      requestId: payload.requestId,
      phone: payload.phone,
      customerName: payload.customerName,
      serviceType: payload.serviceType,
      category: category,
      customerId: payload.customerId,
      canAccept: true,
    };

    // 1. Target Workers in this exact service category
    if (category) {
      io.to(`workers_category_${category}`).emit('call_request', notifPayload);
      io.to(`workers_category_${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`).emit('call_request', notifPayload);
    }
    io.to('workers_broadcast').emit('call_request', notifPayload);

    // 2. Persistent notification for Admin Panel
    notifyAdmin(
      io,
      `📞 Call Request: ${payload.serviceType || category}`,
      `${payload.customerName || 'Customer'} (+91 ${payload.phone}) requested immediate callback for "${payload.serviceType || category}".`,
      'call_request',
      {
        requestId: payload.requestId,
        phone: payload.phone,
        serviceType: payload.serviceType,
        category: category,
        customerName: payload.customerName,
      }
    );
  });

  // ── Worker accepts job or call request ────────────────────────────────────
  socket.on('worker_accepted_job', (payload) => {
    const now = new Date();
    const dateStr = now.toLocaleString('en-IN');
    const workerName = payload.workerName || 'Worker';
    const workerEmail = payload.workerEmail || '';
    const service = payload.service || 'Service';
    const phone = payload.phone || '';

    // 1. Notify Admin with full details
    notifyAdmin(
      io,
      '✅ Job Accepted by Worker',
      `Worker "${workerName}" (${workerEmail}) has accepted request for ${service}. Customer Phone: +91 ${phone}`,
      'system',
      {
        requestId: payload.requestId,
        bookingId: payload.bookingId,
        workerName,
        workerEmail,
        workerPhone: payload.workerPhone,
        customerPhone: phone,
        service,
        date: dateStr,
      }
    );

    // 2. Broadcast to dismiss from other workers
    if (payload.requestId) {
      io.emit('call_request_taken', {
        requestId: payload.requestId,
        acceptedByWorkerId: payload.workerId,
        acceptedByWorkerName: workerName,
      });
    }
  });

  socket.on('disconnect', () => {});
});
// ─────────────────────────────────────────────────────────────────────────────

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
        // Pre-check: try to resolve the SRV record before connecting
        const srvHost = atlasURI.split('@')[1]?.split('/')[0];
        if (srvHost) {
          await new Promise((resolve) => {
            dns.resolveSrv(`_mongodb._tcp.${srvHost}`, (err) => {
              if (err) console.warn(`⚠️ DNS SRV pre-check failed for ${srvHost}: ${err.message}`);
              resolve();
            });
          });
        }
      }
      await mongoose.connect(atlasURI, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
        family: 4, // Force IPv4 — avoids IPv6 SRV resolution issues
      });
      console.log(`✅ MongoDB Atlas Connected Successfully (Database: ${mongoose.connection.name})`);
      await ensureDemoUsersInDB(User);
      return;
    } catch (atlasErr) {
      console.warn(`⚠️ Atlas connection failed (${atlasErr.message}). Falling back to local MongoDB...`);
    }
  }

  try {
    await mongoose.connect(localURI);
    console.log(`✅ Local MongoDB Connected Successfully (Database: ${mongoose.connection.name})`);
    await ensureDemoUsersInDB(User);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    mongoose.set('bufferCommands', false);
    console.log('⚠️ Running in resilient demo fallback mode (bufferCommands disabled for instant responses)');
  }
};

connectDB();

// ─── Atlas Keep-Alive Ping ───────────────────────────────────────────────────
// Free M0 clusters auto-pause after 60 days of no connections.
// This pings the DB every 24 hours so it never goes idle.
const KEEP_ALIVE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
setInterval(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Atlas keep-alive ping sent successfully');
    }
  } catch (err) {
    console.warn('⚠️ Atlas keep-alive ping failed:', err.message);
  }
}, KEEP_ALIVE_INTERVAL);
// ─────────────────────────────────────────────────────────────────────────────


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
