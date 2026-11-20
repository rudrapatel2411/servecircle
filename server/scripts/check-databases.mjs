// server/scripts/check-databases.mjs
import 'dotenv/config';
import mongoose from 'mongoose';
import { prisma } from '../config/prisma.js';

async function check() {
  console.log('--- Checking PostgreSQL (Prisma) ---');
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully!');
    
    // Check counts in Postgres tables
    const userCount = await prisma.user.count();
    const workerProfileCount = await prisma.workerProfile.count();
    const bookingCount = await prisma.booking.count();
    const serviceCategoryCount = await prisma.serviceCategory.count();
    const serviceItemCount = await prisma.serviceItem.count();
    
    console.log(`PostgreSQL Counts:
  - Users: ${userCount}
  - WorkerProfiles: ${workerProfileCount}
  - Bookings: ${bookingCount}
  - ServiceCategories: ${serviceCategoryCount}
  - ServiceItems: ${serviceItemCount}
    `);
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
  }

  console.log('\n--- Checking MongoDB ---');
  const atlasURI = process.env.MONGODB_ATLAS_URI;
  const localURI = process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle';

  let mongoConnected = false;
  if (atlasURI) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(atlasURI, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Atlas connected to database: ${mongoose.connection.name}`);
      mongoConnected = true;
    } catch (e) {
      console.warn('⚠️ Atlas failed:', e.message);
    }
  }

  if (!mongoConnected) {
    try {
      console.log('Connecting to Local MongoDB...');
      await mongoose.connect(localURI, { serverSelectionTimeoutMS: 3000 });
      console.log(`✅ Local MongoDB connected to database: ${mongoose.connection.name}`);
      mongoConnected = true;
    } catch (e) {
      console.error('❌ Local MongoDB connection failed:', e.message);
    }
  }

  if (mongoConnected) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`MongoDB Collections found: ${collections.length}`);
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documents`);
    }
    await mongoose.disconnect();
  }

  await prisma.$disconnect();
}

check().catch(console.error);
