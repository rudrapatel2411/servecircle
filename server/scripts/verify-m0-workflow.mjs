// Development verification for M0 (Postgres persistence + dispatch + OTP).
// Run from server/: node scripts/verify-m0-workflow.mjs
// Creates and deletes its own scoped test customer/booking. Requires a seeded DB.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { prisma } from '../config/prisma.js';
import {
  createBooking,
  acceptBooking,
  setEnRoute,
  setArrived,
  payBooking,
  closeBooking,
} from '../services/bookingService.js';
import { verifyStartOtp, verifyEndOtp } from '../services/otpService.js';

const CUSTOMER_EMAIL = 'm0-journey-test@servecircle.test';
const createdBookings = [];
const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

let customer;
let rameshProfileId;

async function main() {
  customer = await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: {},
    create: {
      name: 'M0 Journey Test',
      email: CUSTOMER_EMAIL,
      password: 'not-a-real-login',
      role: 'CUSTOMER',
      city: 'Ahmedabad',
    },
  });

  const ramesh = await prisma.user.findFirst({
    where: { email: 'ramesh@test.com' },
    include: { workerProfile: true },
  });
  assert.ok(ramesh?.workerProfile, 'seeded worker Ramesh must exist');
  rameshProfileId = ramesh.workerProfile.id;
  await prisma.workerProfile.update({
    where: { id: rameshProfileId },
    data: { dutyStatus: 'ONLINE', isAvailable: true },
  });
  // Clear any leftover busy bookings from previous runs so Ramesh is immediately dispatchable
  await prisma.booking.updateMany({
    where: {
      workerId: ramesh.id,
      OR: [
        { status: { in: ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'STARTED'] } },
        { status: 'COMPLETED', paymentStatus: { not: 'PAID' } },
      ],
    },
    data: { status: 'COMPLETED', paymentStatus: 'PAID' },
  });

  // ── 1. Create → auto-assign to an eligible Postgres worker ───────────────
  const booking = await createBooking(
    {
      service: 'AC Repair & Service',
      category: 'Home Repairs',
      serviceId: 'ac-repair',
      address: '12 M0 Test Street',
      city: 'Ahmedabad',
      amount: 449,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      scheduledTime: '10:00 AM',
      description: 'M0 persistence journey',
    },
    customer.id,
    null,
    'M0 Journey Test'
  );
  createdBookings.push(booking._id);
  record('booking created in Postgres', Boolean(booking._id) && booking.bookingId?.startsWith('SC-'),
    `bookingId=${booking.bookingId} status=${booking.status}`);
  record('auto-assignment ran on Postgres', booking.status === 'assigned' && booking.workerId === ramesh.id,
    `status=${booking.status} worker=${booking.worker?.name || booking.workerId}`);

  const workerId = booking.workerId;
  assert.ok(workerId, 'journey requires an assigned worker');

  // ── 2. Lifecycle transitions ─────────────────────────────────────────────
  const accepted = await acceptBooking(booking._id, workerId, null);
  record('worker accept persisted', accepted.status === 'accepted', accepted.status);

  const enRoute = await setEnRoute(booking._id, workerId, null);
  record('en-route persisted', enRoute.status === 'en-route', enRoute.status);

  const arrived = await setArrived(booking._id, workerId, null);
  const afterArrive = await prisma.booking.findUnique({ where: { id: booking._id } });
  record('arrival persisted + Start OTP stored server-side', arrived.status === 'arrived' && Boolean(afterArrive.startOtp),
    `status=${arrived.status} startOtpPresent=${Boolean(afterArrive.startOtp)}`);

  // Payload hygiene: the API formatter must not expose OTP codes
  record('booking payload hides OTP codes',
    arrived.startOtp === undefined && arrived.endOtp === undefined,
    `keys=${Object.keys(arrived).filter((k) => k.toLowerCase().includes('otp')).join(',')}`);

  // ── 3. Start OTP: wrong code is rejected and counted ─────────────────────
  let wrongRejected = false;
  try {
    await verifyStartOtp(booking._id, '000000', workerId);
  } catch (err) {
    wrongRejected = true;
  }
  const afterWrong = await prisma.booking.findUnique({ where: { id: booking._id } });
  record('wrong Start OTP rejected + attempt recorded',
    wrongRejected && afterWrong.status === 'ARRIVED' && afterWrong.startOtpAttempts >= 1,
    `status=${afterWrong.status} attempts=${afterWrong.startOtpAttempts}`);

  // ── 4. Start OTP: correct code starts the job and issues End OTP ─────────
  const started = await verifyStartOtp(booking._id, afterArrive.startOtp, workerId);
  const afterStart = await prisma.booking.findUnique({ where: { id: booking._id } });
  record('Start OTP advances to started + End OTP generated',
    started.status === 'started' && Boolean(afterStart.endOtp) && afterStart.startOtpVerified === true,
    `status=${started.status} endOtpPresent=${Boolean(afterStart.endOtp)}`);

  // Replay protection
  let replayRejected = false;
  try {
    await verifyStartOtp(booking._id, afterArrive.startOtp, workerId);
  } catch (err) {
    replayRejected = true;
  }
  record('replayed Start OTP rejected', replayRejected);

  // ── 5. Completion cannot bypass the End OTP ──────────────────────────────
  let bypassRejected = false;
  try {
    await payBooking(booking._id, { _id: customer.id, id: customer.id, role: 'customer' }, 'Wallet');
  } catch (err) {
    bypassRejected = true;
  }
  record('illegal completed→paid-before-completion blocked', bypassRejected);

  // ── 6. End OTP completes the booking ─────────────────────────────────────
  const completed = await verifyEndOtp(booking._id, afterStart.endOtp, workerId, null);
  record('End OTP advances to completed', completed.status === 'completed', completed.status);

  const paid = await payBooking(booking._id, { _id: customer.id, id: customer.id, role: 'customer' }, 'Wallet');
  record('payment transition persisted', paid.status === 'paid' && paid.paymentStatus === 'paid',
    `status=${paid.status} paymentStatus=${paid.paymentStatus}`);

  const closed = await closeBooking(booking._id, { _id: customer.id, role: 'admin' });
  record('close persisted', closed.status === 'closed', closed.status);

  // ── 7. Ineligible (unavailable) worker is never assigned ─────────────────
  await prisma.workerProfile.update({ where: { id: rameshProfileId }, data: { isAvailable: false } });
  const offlineBooking = await createBooking(
    {
      service: 'AC Repair & Service', category: 'Home Repairs', serviceId: 'ac-repair',
      address: '14 M0 Test Street', city: 'Ahmedabad', amount: 449,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(), scheduledTime: '11:00 AM',
    },
    customer.id, null, 'M0 Journey Test'
  );
  createdBookings.push(offlineBooking._id);
  record('offline worker is not dispatched', offlineBooking.status === 'pending' && !offlineBooking.workerId,
    `status=${offlineBooking.status}`);
  await prisma.workerProfile.update({ where: { id: rameshProfileId }, data: { isAvailable: true } });

  // ── 8. Concurrent bookings cannot overbook one worker ────────────────────
  const sunita = await prisma.user.findFirst({
    where: { email: 'sunita@test.com' },
    include: { workerProfile: true },
  });
  if (sunita?.workerProfile) {
    await prisma.workerProfile.update({
      where: { id: sunita.workerProfile.id },
      data: { dutyStatus: 'ONLINE', isAvailable: true },
    });
    await prisma.booking.updateMany({
      where: {
        workerId: sunita.id,
        OR: [
          { status: { in: ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'STARTED'] } },
          { status: 'COMPLETED', paymentStatus: { not: 'PAID' } },
        ],
      },
      data: { status: 'COMPLETED', paymentStatus: 'PAID' },
    });
  }

  const makeCleaning = (street) => createBooking(
    {
      service: 'Full Home Deep Cleaning', category: 'Cleaning & Hygiene',
      serviceId: 'deep-clean', address: street, city: 'Ahmedabad', amount: 2999,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(), scheduledTime: '09:00 AM',
    },
    customer.id, null, 'M0 Journey Test'
  );
  const [c1, c2] = await Promise.all([
    makeCleaning('21 M0 Race Street'),
    makeCleaning('22 M0 Race Street'),
  ]);
  createdBookings.push(c1._id, c2._id);
  const assignedCount = [c1, c2].filter((b) => b.status === 'assigned').length;
  const assignedWorkers = new Set([c1.workerId, c2.workerId].filter(Boolean));
  record('concurrent bookings do not overbook a worker',
    assignedCount === 1 && assignedWorkers.size === 1,
    `assigned=${assignedCount} distinctWorkers=${assignedWorkers.size} statuses=${c1.status}/${c2.status}`);
}

async function cleanup() {
  const bookings = await prisma.booking.findMany({
    where: { customerId: customer?.id },
    select: { id: true },
  });
  if (bookings.length) {
    await prisma.walletTransaction.deleteMany({ where: { bookingId: { in: bookings.map((b) => b.id) } } });
    await prisma.booking.deleteMany({ where: { id: { in: bookings.map((b) => b.id) } } });
  }
  if (customer?.id) {
    await prisma.user.delete({ where: { id: customer.id } }).catch(() => {});
  }
}

try {
  await main();
} catch (err) {
  console.log('FAIL  journey aborted —', err.message);
  results.push({ name: 'journey', ok: false });
} finally {
  try {
    await cleanup();
  } catch (err) {
    console.log('cleanup warning:', err.message);
  }
  await prisma.$disconnect();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed === 0 ? 0 : 1);
}
