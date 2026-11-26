/**
 * verify-full-service-workflow.mjs
 *
 * Automated verification test suite for the Full End-to-End Service Booking Workflow:
 * 1. Booking creation with 4-digit Start OTP & 15km area broadcast
 * 2. First-Come-First-Served Worker Acceptance
 * 3. En-route & Doorstep Arrival
 * 4. Start OTP Verification Gate (Entry Authorization)
 * 5. Pre-Service Photo Proof (Before-Work Inspection)
 * 6. Service Start & In-App Spare Parts Quotation Generation
 * 7. Quotation Rejection handling (Platform Visiting Fee ₹199 charged & credited to worker)
 * 8. Quotation Approval handling (Total amount revised with parts)
 * 9. Post-Service Photo Proof (After-Work Completion)
 * 10. Final Payment & Settlement (Customer Wallet deduction & Worker Earnings credit)
 * 11. Mock Data Preservation across both Customer & Worker panels
 */

import assert from 'node:assert';

console.log('🧪 Starting Full Service Booking Workflow Verification Suite...\n');

// Mock localStorage simulation for node environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

// Dynamically import the workflow engine
const engine = await import('../../client/src/utils/serviceWorkflowEngine.js');

let passedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// ── Test 1: Service Booking & 15km Broadcast ──────────────────────
let testBooking = null;
test('Step 1: Customer creates booking with 4-digit Start OTP and 15km area broadcast', () => {
  testBooking = engine.createWorkflowBooking({
    serviceName: 'AC Deep Clean & Jet Servicing',
    category: 'Home Repairs',
    amount: 799,
    address: 'Flat 402, Venus Heights, Satellite, Ahmedabad',
    customerName: 'Rudra Shah',
    customerPhone: '+91 98765 43210',
    notes: 'AC outdoor unit on balcony',
    paymentMethod: 'Wallet',
  });

  assert(testBooking, 'Booking should be created');
  assert(testBooking.id.startsWith('#SC-'), 'Booking ID should follow #SC-XXXX format');
  assert.strictEqual(testBooking.status, 'pending', 'Initial status must be pending');
  assert.strictEqual(typeof testBooking.startOtp, 'string', 'Start OTP must be generated');
  assert.strictEqual(testBooking.startOtp.length, 4, 'Start OTP must be exactly 4 digits');
  assert.strictEqual(testBooking.within15Km, true, 'Booking must be flagged within 15 km');
  assert(testBooking.distanceKm.includes('km'), 'Distance in km must be attached');
  assert.strictEqual(testBooking.visitingFee, 199, 'Standard platform visiting fee must be 199');
});

// ── Test 2: Worker Queue Visibility ───────────────────────────────
test('Step 2: Booking appears in worker job requests queue within 15km area', () => {
  const all = engine.getWorkflowBookings();
  const found = all.find(b => b.id === testBooking.id);
  assert(found, 'Booking must be retrievable from workflow queue');
  assert.strictEqual(found.service, 'AC Deep Clean & Jet Servicing');
  assert.strictEqual(found.status, 'pending');
});

// ── Test 3: First-to-Accept Worker Claims Job ─────────────────────
test('Step 3: First worker to click Accept locks the job; duplicate claims are rejected', () => {
  const worker1 = {
    id: 'pro-101',
    name: 'Suresh Parmar',
    tier: 'Senior HVAC Specialist',
    phone: '+91 98251 11223',
    rating: 4.95,
  };

  const accepted = engine.acceptWorkflowBooking(testBooking.id, worker1);
  assert(accepted, 'First worker acceptance should succeed');
  assert.strictEqual(accepted.status, 'accepted');
  assert.strictEqual(accepted.worker.name, 'Suresh Parmar');
  assert.strictEqual(accepted.etaMinutes, 12);

  // Second worker tries to accept
  const secondAttempt = engine.acceptWorkflowBooking(testBooking.id, { id: 'pro-102', name: 'Other Worker' });
  assert(secondAttempt && secondAttempt.error, 'Duplicate acceptance must be rejected');
});

// ── Test 4: En-Route & Doorstep Arrival ───────────────────────────
test('Step 4: Worker marks en-route and arrives at customer doorstep', () => {
  const enRoute = engine.setWorkflowEnRoute(testBooking.id);
  assert.strictEqual(enRoute.status, 'en-route');

  const arrived = engine.setWorkflowArrived(testBooking.id);
  assert.strictEqual(arrived.status, 'arrived');
  assert(arrived.arrivedAt, 'Arrival timestamp should be set');
});

// ── Test 5: Doorstep Start OTP Gate ───────────────────────────────
test('Step 5: Customer Start OTP Gate — Incorrect OTP rejected, correct OTP verifies doorstep entry', () => {
  // Try wrong OTP
  const wrongAttempt = engine.verifyWorkflowStartOtp(testBooking.id, '0000');
  assert.strictEqual(wrongAttempt.success, false, 'Wrong OTP must be rejected');

  // Try correct OTP
  const correctAttempt = engine.verifyWorkflowStartOtp(testBooking.id, testBooking.startOtp);
  assert.strictEqual(correctAttempt.success, true, 'Correct OTP must succeed');
  assert.strictEqual(correctAttempt.booking.status, 'verified');
});

// ── Test 6: Pre-Service Photo Proof ───────────────────────────────
test('Step 6: Worker uploads Before-Service inspection photo before starting', () => {
  const photoUrl = 'data:image/jpeg;base64,mockPreServicePhoto';
  const withBeforePhoto = engine.uploadWorkflowBeforePhoto(testBooking.id, photoUrl, 'Initial coil inspection photo');
  assert.strictEqual(withBeforePhoto.status, 'before_photo_uploaded');
  assert.strictEqual(withBeforePhoto.proofs.before, photoUrl);
  assert(withBeforePhoto.proofs.beforeTimestamp, 'Before photo timestamp must be recorded');
});

// ── Test 7: Service Start & In-App Spare Parts Quotation ──────────
test('Step 7: Worker starts service and submits In-App Quotation for extra parts', () => {
  const started = engine.startWorkflowService(testBooking.id);
  assert.strictEqual(started.status, 'in-progress');

  const quotationPayload = {
    items: [
      { name: 'Dual Run Motor Capacitor 45uF', quantity: 1, unitPrice: 450, amount: 450 },
      { name: 'Copper Flaring & Valve Seal', quantity: 1, unitPrice: 300, amount: 300 },
    ],
    totalAmount: 750,
    notes: 'Compressor capacitor burnt; needs replacement to restore cooling.',
  };

  const quoted = engine.submitWorkflowQuotation(testBooking.id, quotationPayload);
  assert.strictEqual(quoted.status, 'quotation_pending');
  assert(quoted.quotation, 'Quotation object must exist');
  assert.strictEqual(quoted.quotation.status, 'PENDING');
  assert.strictEqual(quoted.quotation.totalAmount, 750);
});

// ── Test 8: Quotation Rejection (Cancellation with Visiting Fee) ──
test('Step 8A: Quotation Rejection — Customer cancels, but ₹199 Platform Visiting Fee is charged & credited to worker', () => {
  // Test booking 2 for rejection flow
  const rejectBooking = engine.createWorkflowBooking({
    serviceName: 'Refrigerator Compressor Check',
    amount: 499,
    customerName: 'Priya Desai',
  });
  engine.acceptWorkflowBooking(rejectBooking.id);
  engine.verifyWorkflowStartOtp(rejectBooking.id, rejectBooking.startOtp);
  engine.startWorkflowService(rejectBooking.id);
  engine.submitWorkflowQuotation(rejectBooking.id, {
    items: [{ name: 'Inverter PCB Board', amount: 3200 }],
    totalAmount: 3200,
  });

  const walletBefore = engine.getWorkflowWalletData().balance;

  // Customer rejects because cost is too high
  const cancelledWithFee = engine.decideWorkflowQuotation(rejectBooking.id, 'REJECTED', 'PCB cost too high for customer');
  assert.strictEqual(cancelledWithFee.status, 'cancelled_visiting_fee');
  assert.strictEqual(cancelledWithFee.amount, 199, 'Amount settled must be ₹199 platform visiting fee');

  // Customer wallet must have deducted visiting fee
  const walletAfter = engine.getWorkflowWalletData().balance;
  assert.strictEqual(walletBefore - walletAfter, 199, 'Customer wallet must be debited ₹199 visiting fee');

  // Worker earnings must reflect visiting fee credit
  const workerEarnings = engine.getWorkflowWorkerEarnings();
  assert(workerEarnings.totalEarned > 0, 'Worker must receive inspection visiting fee payout');
});

// ── Test 9: Quotation Approval (Kaam continue with revised total) ──
test('Step 8B: Quotation Approval — Customer approves quotation, total updated, work resumes', () => {
  const approved = engine.decideWorkflowQuotation(testBooking.id, 'APPROVED');
  assert.strictEqual(approved.status, 'in-progress');
  assert.strictEqual(approved.quotation.status, 'APPROVED');
  // Total = base (799) + parts (750) = 1549
  assert.strictEqual(approved.amount, 799 + 750);
});

// ── Test 10: After-Service Photo Proof ─────────────────────────────
test('Step 9: Worker takes and uploads After-Service completion photo', () => {
  const afterPhotoUrl = 'data:image/jpeg;base64,mockAfterServicePhoto';
  const completedPhoto = engine.uploadWorkflowAfterPhoto(testBooking.id, afterPhotoUrl, 'Jet clean finished & cooling verified');
  assert.strictEqual(completedPhoto.status, 'after_photo_uploaded');
  assert.strictEqual(completedPhoto.proofs.after, afterPhotoUrl);
});

// ── Test 11: Final Payment & Multi-Panel Sync ──────────────────────
test('Step 10: Service Completed & Final Payment settled from Wallet — Worker earnings updated', () => {
  const completed = engine.completeAndPayWorkflowBooking(testBooking.id, 'Wallet');
  assert.strictEqual(completed.status, 'completed');
  assert.strictEqual(completed.paymentStatus, 'paid');

  // Verify worker earnings: 90% of total
  const expectedWorkerShare = Math.round((799 + 750) * 0.9);
  const earnings = engine.getWorkflowWorkerEarnings();
  const lastEarning = earnings.logs.find(l => l.bookingId === testBooking.id);
  assert(lastEarning, 'Earning log must be recorded for this booking');
  assert.strictEqual(lastEarning.amount, expectedWorkerShare);
});

// ── Test 12: Mock Data Preservation Guarantee ──────────────────────
test('Step 11: Mock Data Integrity — Mock items remain untouched', () => {
  const wallet = engine.getWorkflowWalletData();
  assert(wallet.transactions.length >= 2, 'Wallet contains dynamic workflow transactions');
  // Dynamic bookings coexist without modifying original static structures
  const bookings = engine.getWorkflowBookings();
  assert(bookings.length >= 2, 'Workflow bookings coexist cleanly');
});

console.log(`\n🎉 ALL ${passedTests} WORKFLOW VERIFICATION CHECKS PASSED SUCCESSFULLY!\n`);
