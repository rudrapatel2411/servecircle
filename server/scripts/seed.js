import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Booking.deleteMany({}), Review.deleteMany({}),
      Coupon.deleteMany({}), Complaint.deleteMany({}), Contract.deleteMany({}),
      Invoice.deleteMany({}), Notification.deleteMany({}), WalletTransaction.deleteMany({}),
      Partner.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ===== USERS =====
    const admin = await User.create({ name: 'Admin', email: 'admin@servecircle.in', phone: '9999900000', password: 'admin123', role: 'admin' });

    const customers = await User.create([
      { name: 'Rudra Shah', email: 'rudra@test.com', phone: '9876543210', password: 'test123', role: 'customer', walletBalance: 2450, subscription: 'gold' },
      { name: 'Priya Desai', email: 'priya@test.com', phone: '9876543211', password: 'test123', role: 'customer', walletBalance: 800, subscription: 'silver' },
      { name: 'Amit Patel', email: 'amit@test.com', phone: '9876543212', password: 'test123', role: 'customer', walletBalance: 0, subscription: 'basic' },
    ]);

    const workers = await User.create([
      { name: 'Ramesh Kumar', email: 'ramesh@test.com', phone: '9876500001', password: 'test123', role: 'worker', skills: ['Electrician', 'AC Repair & Service'], serviceCategory: 'Home Repairs', city: 'Ahmedabad', experience: '🏆 5+ Years (Expert Level)', workerStatus: 'approved_senior', isVerified: true, completedJobs: 38, rating: 4.5, earnings: 42000 },
      { name: 'Sunita Mehra', email: 'sunita@test.com', phone: '9876500002', password: 'test123', role: 'worker', skills: ['Home Deep Cleaning', 'Pest Control'], serviceCategory: 'Cleaning & Hygiene', city: 'Ahmedabad', experience: '💼 3–5 Years Experience', workerStatus: 'approved_junior', isVerified: true, completedJobs: 52, rating: 4.8, isProBadge: true, earnings: 58000 },
      { name: 'Ajay Patel', email: 'ajay@test.com', phone: '9876500003', password: 'test123', role: 'worker', skills: ['Plumber'], serviceCategory: 'Home Repairs', city: 'Ahmedabad', experience: '⭐ 1–2 Years Experience', workerStatus: 'approved_rookie', isVerified: true, completedJobs: 5, shadowJobsDone: 5, rating: 0, earnings: 8000 },
      { name: 'Deepak Singh', email: 'deepak@test.com', phone: '9876500004', password: 'test123', role: 'worker', skills: ['Car Washing & Detailing', 'Car Mechanic'], serviceCategory: 'Vehicle Services', city: 'Ahmedabad', experience: '⭐ 1–2 Years Experience', workerStatus: 'pending_interview', isVerified: false, completedJobs: 0, rating: 0 },
      { name: 'Meena Devi', email: 'meena@test.com', phone: '9876500005', password: 'test123', role: 'worker', skills: ['Home Deep Cleaning', 'Sofa / Carpet Cleaning'], serviceCategory: 'Cleaning & Hygiene', city: 'Surat', experience: '💼 3–5 Years Experience', workerStatus: 'interview_done', isVerified: false, completedJobs: 0, rating: 0 },
    ]);

    const b2b = await User.create([
      { name: 'Green Valley Manager', email: 'gv@test.com', phone: '9876600001', password: 'test123', role: 'b2b', companyName: 'Green Valley Society', locations: [{ name: 'Block A', address: 'Green Valley, Satellite, Ahmedabad' }, { name: 'Block B', address: 'Green Valley, Satellite, Ahmedabad' }] },
    ]);

    console.log('👤 Users created:', 1 + customers.length + workers.length + b2b.length);

    // ===== BOOKINGS =====
    const bookings = await Booking.create([
      { bookingId: 'SC-2841', customer: customers[0]._id, worker: workers[0]._id, service: 'AC Servicing', category: 'Home Repairs', scheduledDate: new Date('2026-05-14'), scheduledTime: '10:00 AM', address: 'Satellite, Ahmedabad', status: 'completed', amount: 500, paymentStatus: 'paid', paymentMethod: 'wallet' },
      { bookingId: 'SC-2840', customer: customers[0]._id, worker: workers[1]._id, service: 'Deep Cleaning', category: 'Cleaning & Hygiene', scheduledDate: new Date('2026-05-15'), scheduledTime: '2:00 PM', address: 'Prahlad Nagar, Ahmedabad', status: 'active', amount: 1200, paymentStatus: 'pending' },
      { bookingId: 'SC-2839', customer: customers[0]._id, worker: workers[2]._id, service: 'Plumbing Fix', category: 'Home Repairs', scheduledDate: new Date('2026-05-10'), scheduledTime: '11:00 AM', address: 'Satellite, Ahmedabad', status: 'completed', amount: 350, paymentStatus: 'paid', paymentMethod: 'UPI' },
      { bookingId: 'SC-2838', customer: customers[1]._id, worker: workers[0]._id, service: 'Electrical Wiring', category: 'Home Repairs', scheduledDate: new Date('2026-05-16'), scheduledTime: '4:30 PM', address: 'SG Highway, Ahmedabad', status: 'pending', amount: 600, paymentStatus: 'pending' },
      { bookingId: 'SC-2837', customer: customers[1]._id, worker: workers[1]._id, service: 'Pest Control', category: 'Cleaning & Hygiene', scheduledDate: new Date('2026-05-08'), scheduledTime: '9:00 AM', address: 'Bopal, Ahmedabad', status: 'completed', amount: 900, paymentStatus: 'paid', paymentMethod: 'card' },
      { bookingId: 'SC-2836', customer: customers[2]._id, worker: workers[2]._id, service: 'Car Washing', category: 'Vehicle Services', scheduledDate: new Date('2026-05-12'), scheduledTime: '7:00 AM', address: 'Vastrapur, Ahmedabad', status: 'completed', amount: 250, paymentStatus: 'paid', paymentMethod: 'wallet' },
      { bookingId: 'SC-2835', customer: customers[2]._id, service: 'Birthday Party', category: 'Events & Celebrations', scheduledDate: new Date('2026-05-20'), scheduledTime: '5:00 PM', address: 'Thaltej, Ahmedabad', status: 'pending', amount: 5000, paymentStatus: 'pending', isEmergency: false },
    ]);
    console.log('📅 Bookings created:', bookings.length);

    // ===== REVIEWS =====
    const reviews = await Review.create([
      { booking: bookings[0]._id, customer: customers[0]._id, worker: workers[0]._id, service: 'AC Servicing', rating: 5, comment: 'Excellent work! AC is running perfectly now.' },
      { booking: bookings[2]._id, customer: customers[0]._id, worker: workers[2]._id, service: 'Plumbing Fix', rating: 4, comment: 'Good job, fixed the leak quickly.' },
      { booking: bookings[4]._id, customer: customers[1]._id, worker: workers[1]._id, service: 'Pest Control', rating: 5, comment: 'Very thorough pest control. No bugs since!' },
      { booking: bookings[5]._id, customer: customers[2]._id, worker: workers[2]._id, service: 'Car Washing', rating: 4, comment: 'Car looks brand new. Will book again.' },
    ]);
    console.log('⭐ Reviews created:', reviews.length);

    // ===== COUPONS =====
    const coupons = await Coupon.create([
      { code: 'WELCOME50', description: 'New user welcome discount', discountType: 'percentage', discountValue: 50, maxDiscount: 200, usageLimit: 500, validFrom: new Date('2026-01-01'), validUntil: new Date('2026-12-31'), createdBy: admin._id },
      { code: 'CLEAN20', description: '20% off on Cleaning services', discountType: 'percentage', discountValue: 20, maxDiscount: 500, applicableCategories: ['Cleaning & Hygiene'], usageLimit: 100, validFrom: new Date('2026-05-01'), validUntil: new Date('2026-06-30'), createdBy: admin._id },
      { code: 'FLAT100', description: '₹100 off on any service', discountType: 'flat', discountValue: 100, minOrderAmount: 300, usageLimit: 200, validFrom: new Date('2026-05-01'), validUntil: new Date('2026-05-31'), createdBy: admin._id },
      { code: 'GOLD25', description: '25% off for Gold members', discountType: 'percentage', discountValue: 25, maxDiscount: 1000, applicablePlans: ['gold', 'platinum'], usageLimit: 50, validFrom: new Date('2026-05-01'), validUntil: new Date('2026-08-31'), createdBy: admin._id },
    ]);
    console.log('🎟️  Coupons created:', coupons.length);

    // ===== COMPLAINTS =====
    const complaints = await Complaint.create([
      { complaintId: 'CMP-1001', booking: bookings[0]._id, filedBy: customers[0]._id, againstUser: workers[0]._id, subject: 'AC making noise after servicing', description: 'After the AC servicing was done, the AC is making a buzzing noise.', category: 'service_quality', priority: 'medium', status: 'open' },
      { complaintId: 'CMP-1002', filedBy: customers[1]._id, subject: 'Worker arrived late', description: 'The worker was 45 minutes late for the scheduled appointment.', category: 'delay', priority: 'low', status: 'resolved', resolution: 'Refund of ₹100 issued. Worker warned.', resolvedBy: admin._id, resolvedAt: new Date() },
    ]);
    console.log('⚠️  Complaints created:', complaints.length);

    // ===== CONTRACTS (B2B) =====
    const contracts = await Contract.create([
      { contractId: 'CON-1001', partner: b2b[0]._id, partnerName: 'Green Valley Society', contractType: 'monthly_cleaning', services: [{ name: 'Lobby Cleaning', frequency: 'Daily', pricePerUnit: 500 }, { name: 'Garden Maintenance', frequency: 'Weekly', pricePerUnit: 2000 }], locations: [{ name: 'Block A', address: 'Green Valley, Satellite', city: 'Ahmedabad' }, { name: 'Block B', address: 'Green Valley, Satellite', city: 'Ahmedabad' }], totalValue: 25000, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), status: 'active', autoRenew: true },
      { contractId: 'CON-1002', partner: b2b[0]._id, partnerName: 'Green Valley Society', contractType: 'quarterly_maintenance', services: [{ name: 'Pest Control', frequency: 'Quarterly', pricePerUnit: 5000 }], locations: [{ name: 'All Blocks', address: 'Green Valley, Satellite', city: 'Ahmedabad' }], totalValue: 20000, startDate: new Date('2026-04-01'), endDate: new Date('2027-03-31'), status: 'active' },
    ]);
    console.log('📝 Contracts created:', contracts.length);

    // ===== INVOICES =====
    const invoices = await Invoice.create([
      { invoiceId: 'INV-5001', contract: contracts[0]._id, partner: b2b[0]._id, items: [{ description: 'Monthly Cleaning - May 2026', quantity: 1, unitPrice: 25000, total: 25000 }], subtotal: 25000, tax: 4500, discount: 0, totalAmount: 29500, dueDate: new Date('2026-05-31'), status: 'sent' },
      { invoiceId: 'INV-5002', contract: contracts[0]._id, partner: b2b[0]._id, items: [{ description: 'Monthly Cleaning - April 2026', quantity: 1, unitPrice: 25000, total: 25000 }], subtotal: 25000, tax: 4500, discount: 0, totalAmount: 29500, dueDate: new Date('2026-04-30'), paidDate: new Date('2026-04-28'), status: 'paid', paymentMethod: 'bank_transfer' },
    ]);
    console.log('🧾 Invoices created:', invoices.length);

    // ===== WALLET TRANSACTIONS =====
    await WalletTransaction.create([
      { user: customers[0]._id, type: 'topup', amount: 3000, balanceAfter: 3000, description: 'Wallet top-up via UPI', paymentMethod: 'UPI' },
      { user: customers[0]._id, type: 'payment', amount: -500, balanceAfter: 2500, description: 'AC Servicing payment', booking: bookings[0]._id },
      { user: customers[0]._id, type: 'bonus', amount: 50, balanceAfter: 2550, description: 'Referral bonus' },
      { user: customers[0]._id, type: 'payment', amount: -100, balanceAfter: 2450, description: 'Tip to worker' },
    ]);
    console.log('💰 Wallet transactions created: 4');

    // ===== NOTIFICATIONS =====
    await Notification.create([
      { title: 'Welcome to ServeCircle!', message: 'Thank you for joining ServeCircle. Book your first service and get 50% off!', type: 'broadcast', targetAudience: 'all', sentBy: admin._id },
      { title: 'Summer Cleaning Offer', message: 'Get 20% off on all cleaning services this month. Use code CLEAN20.', type: 'promotion', targetAudience: 'customers', sentBy: admin._id },
      { title: 'New Jobs Available', message: 'There are 5 new job requests in your area. Check them out!', type: 'alert', targetAudience: 'workers', sentBy: admin._id },
    ]);
    console.log('🔔 Notifications created: 3');

    // ===== PARTNERS =====
    await Partner.create([
      { name: 'PM Kaushal Vikas Yojana', type: 'government', contactPerson: 'District Officer', email: 'pmkvy@gov.in', phone: '1800-123-4567', description: 'Skill development training for underprivileged youth.', partnershipType: 'training', status: 'active', startDate: new Date('2025-01-01') },
      { name: 'Seva Foundation', type: 'ngo', contactPerson: 'Rohit Sharma', email: 'info@sevafoundation.org', phone: '9876512345', description: 'NGO supporting women empowerment through home-based services.', partnershipType: 'social_impact', status: 'active', startDate: new Date('2025-06-01') },
      { name: 'TechPark Offices', type: 'corporate', contactPerson: 'Ankit Mehta', email: 'admin@techpark.co', phone: '9876598765', description: 'Corporate office maintenance contract.', partnershipType: 'bulk_client', status: 'active', startDate: new Date('2026-01-15') },
    ]);
    console.log('🤝 Partners created: 3');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📌 Login Credentials:');
    console.log('   Admin:    admin@servecircle.in / admin123');
    console.log('   Customer: rudra@test.com / test123');
    console.log('   Worker:   ramesh@test.com / test123');
    console.log('   B2B:      gv@test.com / test123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
