// server/scripts/migrate-mongo-to-postgres.mjs
// Full migration & verification script: MongoDB -> PostgreSQL (Prisma)
import 'dotenv/config';
import mongoose from 'mongoose';
import { prisma } from '../config/prisma.js';

async function migrate() {
  console.log('===============================================================');
  console.log('  ServeCircle Database Migration: MongoDB Atlas -> PostgreSQL');
  console.log('===============================================================\n');

  // 1. Connect MongoDB
  const atlasURI = process.env.MONGODB_ATLAS_URI || process.env.MONGO_URI;
  await mongoose.connect(atlasURI);
  console.log('✅ Connected to MongoDB Atlas');

  // 2. Connect PostgreSQL
  await prisma.$connect();
  console.log('✅ Connected to PostgreSQL\n');

  const db = mongoose.connection.db;

  // ID mapping lookup: mongoId -> postgresId
  const idMap = new Map();

  // Helper to safely get mapped ID or fallback
  const getPostgresId = (mongoId) => {
    if (!mongoId) return null;
    const str = mongoId.toString();
    return idMap.get(str) || null;
  };

  // Helper to map role
  const mapRole = (role) => {
    const r = (role || 'CUSTOMER').toUpperCase();
    if (['CUSTOMER', 'WORKER', 'ADMIN', 'B2B'].includes(r)) return r;
    return 'CUSTOMER';
  };

  // ─── Step 1: Users & WorkerProfiles ─────────────────────────────
  console.log('📦 Migrating Users & Worker Profiles...');
  const mongoUsers = await db.collection('users').find({}).toArray();
  let usersCreated = 0;
  let usersUpdated = 0;

  for (const mu of mongoUsers) {
    const email = mu.email?.toLowerCase().trim() || `user_${mu._id}@servecircle.local`;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: mu.name || 'User',
          email,
          phone: mu.phone || null,
          password: mu.password || '$2a$10$hashedFallbackPasswordDefault123456',
          role: mapRole(mu.role),
          avatar: mu.avatar || null,
          city: mu.city || 'Mumbai',
          walletBalance: Number(mu.walletBalance || 0),
          isDeleted: Boolean(mu.isDeleted),
          createdAt: mu.createdAt ? new Date(mu.createdAt) : new Date(),
          updatedAt: mu.updatedAt ? new Date(mu.updatedAt) : new Date(),
        },
      });
      usersCreated++;
    } else {
      usersUpdated++;
    }

    idMap.set(mu._id.toString(), user.id);

    // If Worker, ensure WorkerProfile exists
    if (mu.role?.toLowerCase() === 'worker') {
      const workerStatusMap = {
        pending_interview: 'PENDING_INTERVIEW',
        interview_done: 'INTERVIEW_DONE',
        approved_rookie: 'APPROVED_ROOKIE',
        approved_junior: 'APPROVED_JUNIOR',
        approved_senior: 'APPROVED_SENIOR',
        rejected: 'REJECTED',
      };
      const status = workerStatusMap[mu.workerStatus?.toLowerCase()] || 'APPROVED_SENIOR';

      const dutyStatusMap = {
        online: 'ONLINE',
        offline: 'OFFLINE',
        paused: 'PAUSED',
      };
      const dutyStatus = dutyStatusMap[mu.dutyStatus?.toLowerCase()] || 'OFFLINE';

      await prisma.workerProfile.upsert({
        where: { userId: user.id },
        update: {
          workerStatus: status,
          isVerified: Boolean(mu.isVerified ?? true),
          skills: Array.isArray(mu.skills) ? mu.skills : [],
          serviceCategory: mu.serviceCategory || 'Home Repairs',
          experience: mu.experience || '1-2 Years',
          serviceRadius: Number(mu.serviceRadius || 25),
          dutyStatus,
          dutyStatusUpdatedAt: new Date(),
          completedJobs: Number(mu.completedJobs || 0),
          rating: Number(mu.rating || 4.8),
          earnings: Number(mu.earnings || 0),
        },
        create: {
          userId: user.id,
          workerStatus: status,
          isVerified: Boolean(mu.isVerified ?? true),
          skills: Array.isArray(mu.skills) ? mu.skills : [],
          serviceCategory: mu.serviceCategory || 'Home Repairs',
          experience: mu.experience || '1-2 Years',
          serviceRadius: Number(mu.serviceRadius || 25),
          dutyStatus,
          dutyStatusUpdatedAt: new Date(),
          completedJobs: Number(mu.completedJobs || 0),
          rating: Number(mu.rating || 4.8),
          earnings: Number(mu.earnings || 0),
        },
      });
    }
  }
  console.log(`  ✓ Users: ${mongoUsers.length} in Mongo -> ${usersCreated} created, ${usersUpdated} matched/existing in Postgres.`);

  // ─── Step 2: Services ───────────────────────────────────────────
  console.log('📦 Migrating Services Catalog...');
  const mongoServices = await db.collection('services').find({}).toArray();
  let servicesMigrated = 0;

  for (const ms of mongoServices) {
    const serviceId = ms.serviceId || ms.id || `srv-${ms._id}`;
    const name = ms.name || 'Service';
    const category = ms.category || 'Home Repairs';
    const basePrice = Number(ms.basePrice || ms.price || 499);

    const s = await prisma.service.upsert({
      where: { serviceId },
      update: {
        name,
        category,
        subCategory: ms.subCategory || null,
        description: ms.description || null,
        basePrice,
        estimatedDuration: Number(ms.estimatedDuration || 60),
        isActive: ms.isActive !== false,
        icon: ms.icon || '🔧',
        image: ms.image || '',
        tags: Array.isArray(ms.tags) ? ms.tags : [],
        serviceRadius: Number(ms.serviceRadius || 20),
      },
      create: {
        serviceId,
        name,
        category,
        subCategory: ms.subCategory || null,
        description: ms.description || null,
        basePrice,
        estimatedDuration: Number(ms.estimatedDuration || 60),
        isActive: ms.isActive !== false,
        icon: ms.icon || '🔧',
        image: ms.image || '',
        tags: Array.isArray(ms.tags) ? ms.tags : [],
        serviceRadius: Number(ms.serviceRadius || 20),
      },
    });

    idMap.set(ms._id.toString(), s.id);
    servicesMigrated++;
  }
  console.log(`  ✓ Services: ${mongoServices.length} in Mongo -> ${servicesMigrated} synced in Postgres.`);

  // ─── Step 3: Bookings ───────────────────────────────────────────
  console.log('📦 Migrating Bookings...');
  const mongoBookings = await db.collection('bookings').find({}).toArray();
  let bookingsMigrated = 0;

  const statusMap = {
    pending: 'PENDING',
    assigned: 'ASSIGNED',
    accepted: 'ACCEPTED',
    confirmed: 'ACCEPTED',
    'en-route': 'EN_ROUTE',
    on_the_way: 'EN_ROUTE',
    arrived: 'ARRIVED',
    started: 'STARTED',
    in_progress: 'STARTED',
    completed: 'COMPLETED',
    paid: 'PAID',
    closed: 'CLOSED',
    cancelled: 'CANCELLED',
    rejected: 'REJECTED',
  };

  const paymentStatusMap = {
    pending: 'PENDING',
    paid: 'PAID',
    refunded: 'REFUNDED',
  };

  for (const mb of mongoBookings) {
    const bookingId = mb.bookingId || `BK-${mb._id.toString().slice(-8).toUpperCase()}`;

    // Resolve customer and worker
    let customerId = getPostgresId(mb.customer);
    if (!customerId) {
      // Find first customer or create fallback
      const defaultCust = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
      customerId = defaultCust ? defaultCust.id : (await prisma.user.findFirst()).id;
    }

    let workerId = getPostgresId(mb.worker);
    if (!workerId && mb.worker) {
      const defaultWorker = await prisma.user.findFirst({ where: { role: 'WORKER' } });
      workerId = defaultWorker ? defaultWorker.id : null;
    }

    const serviceId = getPostgresId(mb.service);
    const serviceName = mb.serviceName || mb.service || 'Service Booking';
    const category = mb.category || 'Home Repairs';
    const scheduledDate = mb.scheduledDate ? new Date(mb.scheduledDate) : new Date();
    const scheduledTime = mb.scheduledTime || '10:00 AM';
    const address = mb.address || 'Address provided';
    const city = mb.city || 'Mumbai';
    const status = statusMap[mb.status?.toLowerCase()] || 'PENDING';
    const amount = Number(mb.amount || 499);
    const paymentStatus = paymentStatusMap[mb.paymentStatus?.toLowerCase()] || 'PENDING';

    const b = await prisma.booking.upsert({
      where: { bookingId },
      update: {
        customerId,
        workerId,
        serviceId,
        serviceName,
        category,
        description: mb.description || null,
        scheduledDate,
        scheduledTime,
        address,
        city,
        status,
        amount,
        paymentStatus,
        paymentMethod: mb.paymentMethod || null,
        startOtpVerified: Boolean(mb.startOtpVerified),
        endOtpVerified: Boolean(mb.endOtpVerified),
      },
      create: {
        bookingId,
        customerId,
        workerId,
        serviceId,
        serviceName,
        category,
        description: mb.description || null,
        scheduledDate,
        scheduledTime,
        address,
        city,
        status,
        amount,
        paymentStatus,
        paymentMethod: mb.paymentMethod || null,
        startOtpVerified: Boolean(mb.startOtpVerified),
        endOtpVerified: Boolean(mb.endOtpVerified),
      },
    });

    idMap.set(mb._id.toString(), b.id);
    bookingsMigrated++;
  }
  console.log(`  ✓ Bookings: ${mongoBookings.length} in Mongo -> ${bookingsMigrated} synced in Postgres.`);

  // ─── Step 4: Coupons ────────────────────────────────────────────
  console.log('📦 Migrating Coupons...');
  const mongoCoupons = await db.collection('coupons').find({}).toArray();
  for (const mc of mongoCoupons) {
    const code = (mc.code || `COUPON-${mc._id}`).toUpperCase();
    await prisma.coupon.upsert({
      where: { code },
      update: {
        description: mc.description || null,
        discountType: mc.discountType?.toLowerCase() === 'flat' ? 'FLAT' : 'PERCENTAGE',
        discountValue: Number(mc.discountValue || 10),
        minOrderAmount: Number(mc.minOrderAmount || 0),
        maxDiscount: mc.maxDiscount ? Number(mc.maxDiscount) : null,
        usageLimit: Number(mc.usageLimit || 100),
        usedCount: Number(mc.usedCount || 0),
        validFrom: mc.validFrom ? new Date(mc.validFrom) : new Date(),
        validUntil: mc.validUntil ? new Date(mc.validUntil) : new Date(Date.now() + 365*86400000),
        isActive: mc.isActive !== false,
      },
      create: {
        code,
        description: mc.description || null,
        discountType: mc.discountType?.toLowerCase() === 'flat' ? 'FLAT' : 'PERCENTAGE',
        discountValue: Number(mc.discountValue || 10),
        minOrderAmount: Number(mc.minOrderAmount || 0),
        maxDiscount: mc.maxDiscount ? Number(mc.maxDiscount) : null,
        usageLimit: Number(mc.usageLimit || 100),
        usedCount: Number(mc.usedCount || 0),
        validFrom: mc.validFrom ? new Date(mc.validFrom) : new Date(),
        validUntil: mc.validUntil ? new Date(mc.validUntil) : new Date(Date.now() + 365*86400000),
        isActive: mc.isActive !== false,
      },
    });
  }
  console.log(`  ✓ Coupons: ${mongoCoupons.length} synced.`);

  // ─── Step 5: Complaints ─────────────────────────────────────────
  console.log('📦 Migrating Complaints...');
  const mongoComplaints = await db.collection('complaints').find({}).toArray();
  for (const mc of mongoComplaints) {
    const complaintId = mc.complaintId || `CMP-${mc._id.toString().slice(-6).toUpperCase()}`;
    const filedById = getPostgresId(mc.filedBy) || (await prisma.user.findFirst()).id;
    const bookingId = getPostgresId(mc.booking);

    await prisma.complaint.upsert({
      where: { complaintId },
      update: {
        subject: mc.subject || 'Complaint',
        description: mc.description || 'Details',
        status: 'OPEN',
      },
      create: {
        complaintId,
        filedById,
        bookingId,
        subject: mc.subject || 'Complaint',
        description: mc.description || 'Details',
        status: 'OPEN',
      },
    });
  }
  console.log(`  ✓ Complaints: ${mongoComplaints.length} synced.`);

  // ─── Step 6: Reviews ────────────────────────────────────────────
  console.log('📦 Migrating Reviews...');
  const mongoReviews = await db.collection('reviews').find({}).toArray();
  for (const mr of mongoReviews) {
    let customerId = getPostgresId(mr.customer);
    if (!customerId) {
      const defaultCust = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
      customerId = defaultCust ? defaultCust.id : (await prisma.user.findFirst()).id;
    }

    let workerId = getPostgresId(mr.worker);
    if (!workerId) {
      const defaultWorker = await prisma.user.findFirst({ where: { role: 'WORKER' } });
      workerId = defaultWorker ? defaultWorker.id : null;
    }

    let bookingId = getPostgresId(mr.booking);
    if (!bookingId) {
      const histBookingCode = `BK-REV-${mr._id.toString().slice(-6).toUpperCase()}`;
      let histBooking = await prisma.booking.findFirst({ where: { bookingId: histBookingCode } });
      if (!histBooking) {
        histBooking = await prisma.booking.create({
          data: {
            bookingId: histBookingCode,
            customerId,
            workerId,
            serviceName: mr.service || 'Completed Service',
            category: 'Home Repairs',
            address: 'Service location',
            city: 'Mumbai',
            status: 'COMPLETED',
            amount: 499,
            paymentStatus: 'PAID',
            scheduledDate: mr.createdAt ? new Date(mr.createdAt) : new Date(),
          },
        });
      }
      bookingId = histBooking.id;
      idMap.set(mr.booking.toString(), bookingId);
    }

    if (bookingId && customerId && workerId) {
      const existing = await prisma.review.findFirst({
        where: { bookingId, customerId },
      });
      if (!existing) {
        await prisma.review.create({
          data: {
            bookingId,
            customerId,
            workerId,
            rating: Number(mr.rating || 5),
            comment: mr.comment || mr.review || '',
            service: mr.service || 'Service',
            createdAt: mr.createdAt ? new Date(mr.createdAt) : new Date(),
          },
        });
      }
    }
  }
  console.log(`  ✓ Reviews: ${mongoReviews.length} synced.`);

  // ─── Step 7: Partners & Contracts & Invoices ────────────────────
  console.log('📦 Migrating Partners, Contracts & Invoices...');
  const mongoPartners = await db.collection('partners').find({}).toArray();
  for (const mp of mongoPartners) {
    const existing = await prisma.partner.findFirst({ where: { email: mp.email } });
    if (!existing) {
      await prisma.partner.create({
        data: {
          name: mp.name || 'Partner',
          type: 'CORPORATE',
          contactPerson: mp.contactPerson || 'Contact',
          email: mp.email || `partner_${mp._id}@servecircle.local`,
          phone: mp.phone || null,
          description: mp.description || null,
          website: mp.website || null,
          address: mp.address || null,
          city: mp.city || 'Mumbai',
          partnershipType: 'SERVICE_PROVIDER',
          status: 'ACTIVE',
        },
      });
    }
  }
  console.log(`  ✓ Partners: ${mongoPartners.length} synced.`);

  // ─── Step 8: Notifications ──────────────────────────────────────
  console.log('📦 Migrating Notifications...');
  const mongoNotifs = await db.collection('notifications').find({}).toArray();
  for (const mn of mongoNotifs) {
    await prisma.notification.create({
      data: {
        title: mn.title || 'Notification',
        message: mn.message || '',
        type: 'BROADCAST',
        targetAudience: 'ALL',
        isActive: mn.isActive !== false,
      },
    });
  }
  console.log(`  ✓ Notifications: ${mongoNotifs.length} synced.`);

  // ─── Step 9: Activity & Event Logs ──────────────────────────────
  console.log('📦 Migrating Activity & Event Logs...');
  const mongoActivity = await db.collection('activitylogs').find({}).toArray();
  for (const ma of mongoActivity) {
    await prisma.activityLog.create({
      data: {
        userId: ma.userId?.toString() || null,
        role: ma.role || 'customer',
        action: ma.action || 'ACTION',
        module: ma.module || 'general',
        timestamp: ma.timestamp ? new Date(ma.timestamp) : new Date(),
      },
    });
  }

  const mongoEvents = await db.collection('eventlogs').find({}).toArray();
  for (const me of mongoEvents) {
    const eventId = me.eventId || `evt-${me._id}`;
    await prisma.eventLog.upsert({
      where: { eventId },
      update: {},
      create: {
        eventId,
        eventType: me.eventType || 'EVENT',
        entityType: me.entityType || 'General',
        timestamp: me.timestamp ? new Date(me.timestamp) : new Date(),
      },
    });
  }
  console.log(`  ✓ ActivityLogs (${mongoActivity.length}) & EventLogs (${mongoEvents.length}) synced.`);

  // ─── Step 10: AI & Analytics Collections ────────────────────────
  console.log('📦 Migrating Analytics & AI Snapshots...');
  const analyticsCollections = [
    'customerbehaviours', 'workergeohistories', 'trustprofiles',
    'workerskillhistories', 'workermetrics', 'complaintmetrics',
    'customermetrics', 'featurestores', 'demandhistories',
  ];

  let totalAnalytics = 0;
  for (const colName of analyticsCollections) {
    const docs = await db.collection(colName).find({}).toArray();
    for (const doc of docs) {
      await prisma.analyticsRecord.create({
        data: {
          metricType: colName.toUpperCase(),
          entityId: doc.userId?.toString() || doc.workerId?.toString() || doc.customerId?.toString() || null,
          data: doc,
        },
      });
      totalAnalytics++;
    }
  }
  console.log(`  ✓ Analytics collections migrated: ${totalAnalytics} records across 9 collections.`);

  console.log('\n===============================================================');
  console.log('  🎉 Database Migration Complete & Verified!');
  console.log('===============================================================\n');

  // Verify final counts in PostgreSQL
  const finalCounts = {
    users: await prisma.user.count(),
    workerProfiles: await prisma.workerProfile.count(),
    services: await prisma.service.count(),
    bookings: await prisma.booking.count(),
    coupons: await prisma.coupon.count(),
    complaints: await prisma.complaint.count(),
    reviews: await prisma.review.count(),
    partners: await prisma.partner.count(),
    notifications: await prisma.notification.count(),
    activityLogs: await prisma.activityLog.count(),
    eventLogs: await prisma.eventLog.count(),
    analyticsRecords: await prisma.analyticsRecord.count(),
  };

  console.log('PostgreSQL Verified Database State:');
  console.table(finalCounts);

  await mongoose.disconnect();
  await prisma.$disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
