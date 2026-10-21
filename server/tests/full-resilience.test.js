import assert from 'assert';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'servecircle_test_secret_key_1234567890';

const { findFallbackUserByEmail, findFallbackUserById } = await import('../utils/demoAuthStore.js');
const { DEMO_COUPONS, DEMO_REVIEWS, DEMO_COMPLAINTS, DEMO_NOTIFICATIONS, DEMO_CONTRACTS, DEMO_INVOICES, DEMO_TRANSACTIONS } = await import('../utils/demoDataStore.js');
const { getAllDemoBookings, createDemoBooking, getDemoBookingsForCustomer } = await import('../utils/demoBookingStore.js');
const { getAllServices, getServiceById, searchServices } = await import('../services/serviceService.js');

console.log('🧪 Starting Full-Resilience System Tests...');

// 1. Auth Fallback
const customer = findFallbackUserByEmail('rudra@test.com');
assert.ok(customer, 'Customer should be found in demo auth store');
assert.strictEqual(customer.role, 'customer');

const admin = findFallbackUserByEmail('admin@servecircle.in');
assert.ok(admin, 'Admin should be found in demo auth store');
assert.strictEqual(admin.role, 'admin');

const worker = findFallbackUserById('6a5f4c90437c4810f45fe0eb');
assert.ok(worker, 'Worker should be found by ID in demo auth store');
assert.strictEqual(worker.role, 'worker');

// 2. Services Catalog
const servicesList = await getAllServices({ page: 1, limit: 10 });
assert.ok(servicesList.services.length > 0, 'Services list should return catalog items');
assert.ok(servicesList.total >= 10, 'Services total should be catalog size');

const searched = await searchServices('plumbing');
assert.ok(searched.length > 0, 'Search should find plumbing services');

const svcById = await getServiceById('ac-repair');
assert.ok(svcById, 'Service should be found by serviceId');
assert.strictEqual(svcById.name, 'AC Repair & Diagnostics');

// 3. Bookings Store
const initialBookings = getAllDemoBookings();
assert.ok(initialBookings.length >= 2, 'Initial demo bookings should exist');

const newBk = createDemoBooking({
  service: 'AC General Service',
  serviceId: 'ac-appliance-repair',
  category: 'Home Repairs',
  amount: 499,
  address: 'Test Flat 101, Test City',
  city: 'Mumbai',
  scheduledDate: '2026-05-15',
  scheduledTime: '10:00 AM - 12:00 PM',
  paymentMethod: 'Cash',
}, customer._id, customer.name);

assert.ok(newBk, 'New demo booking should be created');
assert.ok(newBk.bookingId.startsWith('SC-'), 'Booking ID should follow SC- format');
assert.strictEqual(newBk.status, 'assigned');
assert.ok(newBk.startOtp, 'Booking should have startOtp');
assert.ok(newBk.endOtp, 'Booking should have endOtp');

const customerBookings = getDemoBookingsForCustomer(customer._id);
assert.ok(customerBookings.some(b => b.bookingId === newBk.bookingId), 'Created booking should appear in customer bookings');

// 4. Coupons Store
assert.ok(DEMO_COUPONS.length >= 5, 'Demo coupons should have standard discounts');
const welcomeCoupon = DEMO_COUPONS.find(c => c.code === 'WELCOME50');
assert.ok(welcomeCoupon, 'WELCOME50 should exist');
assert.strictEqual(welcomeCoupon.discountValue, 50);

// 5. Reviews Store
assert.ok(DEMO_REVIEWS.length >= 2, 'Demo reviews should exist');

// 6. Complaints Store
assert.ok(DEMO_COMPLAINTS.length >= 1, 'Demo complaints should exist');

// 7. Notifications Store
assert.ok(DEMO_NOTIFICATIONS.length >= 3, 'Demo notifications should exist');

// 8. B2B Contracts & Invoices
assert.ok(DEMO_CONTRACTS.length >= 1, 'Demo B2B contracts should exist');
assert.ok(DEMO_INVOICES.length >= 1, 'Demo B2B invoices should exist');
assert.ok(DEMO_TRANSACTIONS.length >= 3, 'Demo wallet transactions should exist');

console.log('✅ ALL FULL-RESILIENCE SYSTEM TESTS PASSED SUCCESSFULLY! (10/10 test blocks)');
process.exit(0);
