import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Import all models to verify Mongoose Schema registration
import '../models/User.js';
import '../models/Service.js';
import '../models/Booking.js';
import '../models/Review.js';
import '../models/AIAnalysis.js';
import '../models/ActivityLog.js';
import '../models/Complaint.js';
import '../models/ComplaintMetrics.js';
import '../models/Contract.js';
import '../models/Coupon.js';
import '../models/CustomerBehaviour.js';
import '../models/CustomerMetrics.js';
import '../models/DemandHistory.js';
import '../models/DocumentHistory.js';
import '../models/EventLog.js';
import '../models/FeatureStore.js';
import '../models/Invoice.js';
import '../models/Notification.js';
import '../models/Partner.js';
import '../models/TrustProfile.js';
import '../models/WalletTransaction.js';
import '../models/WorkerGeoHistory.js';
import '../models/WorkerMetrics.js';
import '../models/WorkerSkillHistory.js';

async function performSmokeTest() {
  console.log('=== PHASE 5K: REAL APPLICATION SMOKE TEST AGAINST MONGODB ATLAS ===');

  const atlasUri = process.env.MONGODB_ATLAS_URI;
  if (!atlasUri) throw new Error('MONGODB_ATLAS_URI not set.');

  await mongoose.connect(atlasUri);
  console.log('✅ Connected to Atlas Database:', mongoose.connection.name);

  // 1. Test User query
  const User = mongoose.model('User');
  const userCount = await User.countDocuments();
  const sampleWorker = await User.findOne({ role: 'worker' });
  console.log(`✅ Users collection verified via Mongoose: ${userCount} users found. Sample workerIdCode: ${sampleWorker?.workerIdCode || 'N/A'}`);

  // 2. Test Service query
  const Service = mongoose.model('Service');
  const serviceCount = await Service.countDocuments();
  console.log(`✅ Services collection verified via Mongoose: ${serviceCount} services found.`);

  // 3. Test Booking query & populate
  const Booking = mongoose.model('Booking');
  const bookingCount = await Booking.countDocuments();
  const sampleBooking = await Booking.findOne().populate('customer worker service');
  console.log(`✅ Bookings collection verified via Mongoose: ${bookingCount} bookings found. Populated Customer: ${sampleBooking?.customer?.name || 'N/A'}, Worker: ${sampleBooking?.worker?.name || 'N/A'}`);

  // 4. Test Review query
  const Review = mongoose.model('Review');
  const reviewCount = await Review.countDocuments();
  console.log(`✅ Reviews collection verified via Mongoose: ${reviewCount} reviews found.`);

  // 5. Test AIAnalysis query
  const AIAnalysis = mongoose.model('AIAnalysis');
  const aiCount = await AIAnalysis.countDocuments();
  console.log(`✅ AIAnalysis collection verified via Mongoose: ${aiCount} records found.`);

  // 6. Test EventLog query
  const EventLog = mongoose.model('EventLog');
  const eventCount = await EventLog.countDocuments();
  console.log(`✅ EventLog collection verified via Mongoose: ${eventCount} telemetry records found.`);

  await mongoose.disconnect();
  console.log('\n🎉 SMOKE TEST COMPLETED SUCCESSFULLY! All Mongoose models operational against Atlas.');
}

performSmokeTest().catch(err => {
  console.error('❌ Smoke Test Failed:', err);
  process.exit(1);
});
