import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import fs from 'fs';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Complaint from '../models/Complaint.js';
import Contract from '../models/Contract.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Partner from '../models/Partner.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const atlasURI = process.env.MONGODB_ATLAS_URI;
const localURI = process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle';

const connect = async () => {
  if (atlasURI) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(atlasURI, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Atlas Connected (${mongoose.connection.name})`);
      return;
    } catch (atlasErr) {
      console.warn(`⚠️ Atlas connection failed (${atlasErr.message}). Trying local MongoDB...`);
    }
  }

  try {
    await mongoose.connect(localURI, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ Local MongoDB Connected (${mongoose.connection.name})`);
  } catch (err) {
    console.error('❌ Could not connect to any MongoDB instance:', err.message);
    throw err;
  }
};

const seed = async () => {
  try {
    await connect();

    // ── Clear existing collections ─────────────────────────────────────────────
    console.log('🗑️  Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Coupon.deleteMany({}),
      Complaint.deleteMany({}),
      Contract.deleteMany({}),
      Invoice.deleteMany({}),
      Notification.deleteMany({}),
      WalletTransaction.deleteMany({}),
      Partner.deleteMany({}),
    ]);

    // ── Seed Services from Canonical Catalog ───────────────────────────────────
    console.log('📦 Seeding canonical services catalog...');
    let catalogServices = [];
    try {
      const catalogPath = new URL('../constants/servicesCatalog.json', import.meta.url);
      catalogServices = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    } catch (e) {
      console.warn('⚠️ Could not load servicesCatalog.json, using fallback services:', e.message);
    }

    if (catalogServices.length > 0) {
      await Service.insertMany(catalogServices);
      console.log(`✅ Seeded ${catalogServices.length} canonical services into MongoDB.`);
    }

    // ── Seed Users ─────────────────────────────────────────────────────────────
    console.log('👤 Seeding users across all 4 roles...');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@servecircle.in',
      phone: '9999900000',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });

    const customers = await User.create([
      {
        name: 'Rudra Shah',
        email: 'rudra@test.com',
        phone: '9876543210',
        password: 'test123',
        role: 'customer',
        walletBalance: 2450,
        subscription: 'gold',
      },
      {
        name: 'Priya Desai',
        email: 'priya@test.com',
        phone: '9876543211',
        password: 'test123',
        role: 'customer',
        walletBalance: 800,
        subscription: 'silver',
      },
      {
        name: 'Amit Patel',
        email: 'amit@test.com',
        phone: '9876543212',
        password: 'test123',
        role: 'customer',
        walletBalance: 0,
        subscription: 'basic',
      },
    ]);

    const workers = await User.create([
      {
        name: 'Ramesh Kumar',
        email: 'ramesh@test.com',
        phone: '9876500001',
        password: 'test123',
        role: 'worker',
        skills: ['Electrician', 'AC Repair & Service'],
        serviceCategory: 'Home Repairs',
        city: 'Ahmedabad',
        experience: '🏆 5+ Years (Expert Level)',
        workerStatus: 'approved_senior',
        isVerified: true,
        workerIdCode: 'WK-8902',
        completedJobs: 38,
        rating: 4.8,
        earnings: 42000,
      },
      {
        name: 'Sunita Mehra',
        email: 'sunita@test.com',
        phone: '9876500002',
        password: 'test123',
        role: 'worker',
        skills: ['Home Deep Cleaning', 'Pest Control', 'Sofa & Carpet Cleaning'],
        serviceCategory: 'Cleaning & Hygiene',
        city: 'Ahmedabad',
        experience: '💼 3–5 Years Experience',
        workerStatus: 'approved_junior',
        isVerified: true,
        workerIdCode: 'WK-7601',
        completedJobs: 52,
        rating: 4.9,
        isProBadge: true,
        earnings: 58000,
      },
      {
        name: 'Ajay Patel',
        email: 'ajay@test.com',
        phone: '9876500003',
        password: 'test123',
        role: 'worker',
        skills: ['Plumber'],
        serviceCategory: 'Home Repairs',
        city: 'Ahmedabad',
        experience: '⭐ 1–2 Years Experience',
        workerStatus: 'approved_senior',
        isVerified: true,
        workerIdCode: 'WK-5510',
        completedJobs: 24,
        rating: 4.7,
        earnings: 28000,
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram@test.com',
        phone: '9876500004',
        password: 'test123',
        role: 'worker',
        skills: ['Movers & Packers', 'Driver'],
        serviceCategory: 'Relocation & Packers',
        city: 'Ahmedabad',
        experience: '💼 3–5 Years Experience',
        workerStatus: 'approved_senior',
        isVerified: true,
        workerIdCode: 'WK-4409',
        completedJobs: 19,
        rating: 4.9,
        earnings: 34000,
      },
      {
        name: 'Deepak Singh',
        email: 'deepak@test.com',
        phone: '9876500005',
        password: 'test123',
        role: 'worker',
        skills: ['Car Washing & Detailing', 'Car Mechanic'],
        serviceCategory: 'Vehicle Services',
        city: 'Ahmedabad',
        experience: '⭐ 1–2 Years Experience',
        workerStatus: 'approved_junior',
        isVerified: true,
        workerIdCode: 'WK-3301',
        completedJobs: 12,
        rating: 4.6,
        earnings: 15000,
      },
    ]);

    const b2b = await User.create([
      {
        name: 'Green Valley Manager',
        email: 'gv@test.com',
        phone: '9876600001',
        password: 'test123',
        role: 'b2b',
        companyName: 'Green Valley Society',
        locations: [
          { name: 'Block A', address: 'Green Valley, Satellite, Ahmedabad' },
          { name: 'Block B', address: 'Green Valley, Satellite, Ahmedabad' },
        ],
      },
    ]);

    console.log(`👤 Users created: ${1 + customers.length + workers.length + b2b.length}`);

    // ── Seed Bookings ──────────────────────────────────────────────────────────
    console.log('📅 Seeding realistic bookings with lifecycle states and OTPs...');
    const bookings = await Booking.create([
      {
        bookingId: 'SC-2841',
        customer: customers[0]._id,
        worker: workers[0]._id,
        service: 'AC Service & Deep Cleaning',
        category: 'Home Repairs',
        scheduledDate: new Date(Date.now() - 86400000 * 2),
        scheduledTime: '10:00 AM',
        address: 'B-402, Sunset Heights, Satellite, Ahmedabad',
        city: 'Ahmedabad',
        status: 'completed',
        amount: 549,
        paymentStatus: 'paid',
        paymentMethod: 'Wallet',
        startOtp: '4829',
        endOtp: '9173',
        startOtpVerified: true,
        endOtpVerified: true,
        completedAt: new Date(Date.now() - 86400000 * 2 + 3600000 * 2),
      },
      {
        bookingId: 'SC-2840',
        customer: customers[0]._id,
        worker: workers[1]._id,
        service: 'Home Deep Cleaning',
        category: 'Cleaning & Hygiene',
        scheduledDate: new Date(),
        scheduledTime: '02:00 PM',
        address: 'Flat 301, Titanium Square, Prahlad Nagar, Ahmedabad',
        city: 'Ahmedabad',
        status: 'started',
        amount: 1200,
        paymentStatus: 'pending',
        paymentMethod: 'Cash',
        startOtp: '7412',
        endOtp: '8520',
        startOtpVerified: true,
        startedAt: new Date(Date.now() - 1800000),
      },
      {
        bookingId: 'SC-2839',
        customer: customers[0]._id,
        worker: workers[2]._id,
        service: 'Pipe Leakage & Tap Repair',
        category: 'Home Repairs',
        scheduledDate: new Date(Date.now() + 86400000),
        scheduledTime: '11:00 AM',
        address: 'B-402, Sunset Heights, Satellite, Ahmedabad',
        city: 'Ahmedabad',
        status: 'assigned',
        amount: 350,
        paymentStatus: 'pending',
        paymentMethod: 'UPI',
        startOtp: '6543',
        endOtp: '2109',
        assignedAt: new Date(),
      },
      {
        bookingId: 'SC-2838',
        customer: customers[1]._id,
        worker: workers[3]._id,
        service: 'Local House Shifting (2BHK)',
        category: 'Relocation & Packers',
        scheduledDate: new Date(Date.now() + 86400000 * 3),
        scheduledTime: '09:00 AM',
        address: '404, Shivalik High Street, SG Highway, Ahmedabad',
        city: 'Ahmedabad',
        status: 'accepted',
        amount: 2800,
        paymentStatus: 'pending',
        paymentMethod: 'UPI',
        startOtp: '3399',
        endOtp: '7711',
        acceptedAt: new Date(),
      },
      {
        bookingId: 'SC-2837',
        customer: customers[1]._id,
        worker: workers[1]._id,
        service: 'Pest Control (Cockroach & Termite)',
        category: 'Cleaning & Hygiene',
        scheduledDate: new Date(Date.now() - 86400000 * 5),
        scheduledTime: '09:00 AM',
        address: 'Bopal Cross Roads, Bopal, Ahmedabad',
        city: 'Ahmedabad',
        status: 'completed',
        amount: 899,
        paymentStatus: 'paid',
        paymentMethod: 'Card',
        startOtp: '5566',
        endOtp: '9988',
        startOtpVerified: true,
        endOtpVerified: true,
        completedAt: new Date(Date.now() - 86400000 * 5 + 3600000 * 2),
      },
      {
        bookingId: 'SC-2836',
        customer: customers[2]._id,
        worker: workers[4]._id,
        service: 'Car Wash & Detailing at Doorstep',
        category: 'Vehicle Services',
        scheduledDate: new Date(Date.now() - 86400000 * 1),
        scheduledTime: '07:30 AM',
        address: 'Vastrapur Lake Road, Vastrapur, Ahmedabad',
        city: 'Ahmedabad',
        status: 'completed',
        amount: 399,
        paymentStatus: 'paid',
        paymentMethod: 'Wallet',
        startOtp: '1234',
        endOtp: '5678',
        startOtpVerified: true,
        endOtpVerified: true,
        completedAt: new Date(Date.now() - 86400000 * 1 + 3600000),
      },
      {
        bookingId: 'SC-2835',
        customer: customers[2]._id,
        service: 'Birthday Party Decoration & DJ',
        category: 'Events & Celebrations',
        scheduledDate: new Date(Date.now() + 86400000 * 4),
        scheduledTime: '05:00 PM',
        address: 'Thaltej Shilaj Road, Thaltej, Ahmedabad',
        city: 'Ahmedabad',
        status: 'pending',
        amount: 3500,
        paymentStatus: 'pending',
        isEmergency: false,
      },
    ]);
    console.log(`📅 Bookings created: ${bookings.length}`);

    // ── Seed Reviews ───────────────────────────────────────────────────────────
    console.log('⭐ Seeding reviews...');
    await Review.create([
      {
        booking: bookings[0]._id,
        customer: customers[0]._id,
        worker: workers[0]._id,
        service: 'AC Service & Deep Cleaning',
        rating: 5,
        comment: 'Super fast and clean work! AC is cooling like brand new.',
      },
      {
        booking: bookings[4]._id,
        customer: customers[1]._id,
        worker: workers[1]._id,
        service: 'Pest Control (Cockroach & Termite)',
        rating: 5,
        comment: 'Very thorough pest control. All corners covered and no chemical odor.',
      },
      {
        booking: bookings[5]._id,
        customer: customers[2]._id,
        worker: workers[4]._id,
        service: 'Car Wash & Detailing at Doorstep',
        rating: 4,
        comment: 'Great foam wash and interior vacuuming at doorstep.',
      },
    ]);
    console.log('⭐ Reviews created: 3');

    // ── Seed Coupons ───────────────────────────────────────────────────────────
    console.log('🎟️  Seeding coupons...');
    await Coupon.create([
      {
        code: 'WELCOME50',
        description: 'Flat ₹50 off on your first booking',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscount: 150,
        minOrderAmount: 299,
        usageLimit: 1000,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-12-31'),
        createdBy: admin._id,
      },
      {
        code: 'SUMMER20',
        description: '20% off up to ₹150 for summer cooling & repair',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 150,
        minOrderAmount: 499,
        applicableCategories: ['Home Repairs', 'Cleaning & Hygiene'],
        usageLimit: 500,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-12-31'),
        createdBy: admin._id,
      },
      {
        code: 'SERVE100',
        description: 'Flat ₹100 off on premium & shifting services',
        discountType: 'flat',
        discountValue: 100,
        minOrderAmount: 999,
        usageLimit: 300,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-12-31'),
        createdBy: admin._id,
      },
      {
        code: 'SAVE10',
        description: '10% off up to ₹100 on all services',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 100,
        minOrderAmount: 199,
        usageLimit: 2000,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-12-31'),
        createdBy: admin._id,
      },
    ]);
    console.log('🎟️  Coupons created: 4');

    // ── Seed Complaints ────────────────────────────────────────────────────────
    console.log('⚠️  Seeding complaints...');
    await Complaint.create([
      {
        complaintId: 'CMP-1001',
        booking: bookings[0]._id,
        filedBy: customers[0]._id,
        againstUser: workers[0]._id,
        subject: 'AC cooling check followup',
        description: 'Small rattle in external unit grill after service.',
        category: 'service_quality',
        priority: 'medium',
        status: 'resolved',
        resolution: 'Technician re-visited and tightened the outer grill bolt without charge.',
        resolvedBy: admin._id,
        resolvedAt: new Date(),
      },
    ]);
    console.log('⚠️  Complaints created: 1');

    // ── Seed B2B Contracts & Invoices ──────────────────────────────────────────
    console.log('🏢 Seeding B2B contracts & invoices...');
    const contracts = await Contract.create([
      {
        contractId: 'CON-1001',
        partner: b2b[0]._id,
        partnerName: 'Green Valley Society',
        contractType: 'monthly_cleaning',
        services: [
          { name: 'Lobby & Corridor Cleaning', frequency: 'Daily', pricePerUnit: 500 },
          { name: 'Garden Maintenance', frequency: 'Weekly', pricePerUnit: 2000 },
        ],
        locations: [
          { name: 'Block A', address: 'Green Valley, Satellite', city: 'Ahmedabad' },
          { name: 'Block B', address: 'Green Valley, Satellite', city: 'Ahmedabad' },
        ],
        totalValue: 25000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active',
        autoRenew: true,
      },
    ]);

    await Invoice.create([
      {
        invoiceId: 'INV-5001',
        contract: contracts[0]._id,
        partner: b2b[0]._id,
        items: [{ description: 'Monthly Society Facility Maintenance - May 2026', quantity: 1, unitPrice: 25000, total: 25000 }],
        subtotal: 25000,
        tax: 4500,
        discount: 0,
        totalAmount: 29500,
        dueDate: new Date('2026-05-31'),
        status: 'sent',
      },
    ]);
    console.log('🧾 Contracts and Invoices created.');

    // ── Seed Wallet Transactions ───────────────────────────────────────────────
    await WalletTransaction.create([
      {
        user: customers[0]._id,
        type: 'topup',
        amount: 3000,
        balanceAfter: 3000,
        description: 'Wallet top-up via UPI',
        paymentMethod: 'UPI',
      },
      {
        user: customers[0]._id,
        type: 'payment',
        amount: -550,
        balanceAfter: 2450,
        description: 'Payment for AC Service & Deep Cleaning',
        booking: bookings[0]._id,
      },
    ]);
    console.log('💰 Wallet transactions created.');

    // ── Seed Notifications ─────────────────────────────────────────────────────
    await Notification.create([
      {
        title: 'Welcome to ServeCircle!',
        message: 'Welcome to India\'s most trusted home & lifestyle services network.',
        type: 'broadcast',
        targetAudience: 'all',
        sentBy: admin._id,
      },
      {
        title: 'Exclusive Offer: WELCOME50',
        message: 'Get flat 50% off on your first service booking with code WELCOME50.',
        type: 'promotion',
        targetAudience: 'customers',
        sentBy: admin._id,
      },
    ]);
    console.log('🔔 Notifications created.');

    // ── Seed Partners ──────────────────────────────────────────────────────────
    await Partner.create([
      {
        name: 'PM Kaushal Vikas Yojana',
        type: 'government',
        contactPerson: 'District Officer',
        email: 'pmkvy@gov.in',
        phone: '1800-123-4567',
        description: 'Skill certification & background verification partner.',
        partnershipType: 'training',
        status: 'active',
        startDate: new Date('2025-01-01'),
      },
    ]);
    console.log('🤝 Partners created.');

    console.log('\n======================================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('📌 Real Test Accounts:');
    console.log('   👑 Admin:    admin@servecircle.in / admin123');
    console.log('   🛍️ Customer: rudra@test.com / test123');
    console.log('   🛠️ Worker:   ramesh@test.com / test123');
    console.log('   🏢 B2B:      gv@test.com / test123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
