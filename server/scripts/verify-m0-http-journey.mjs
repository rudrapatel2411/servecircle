// Development verification for M0 over real HTTP (roles, authz, OTP, allowlist).
// Run from server/ with the API listening on :5000: node scripts/verify-m0-http-journey.mjs
// Creates and deletes its own scoped test customer/worker/booking.
import 'dotenv/config';
import assert from 'node:assert/strict';
import { prisma } from '../config/prisma.js';

const BASE = 'http://localhost:5000/api';
const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const TEST_CUSTOMER = 'm0-http-customer@servecircle.test';
const TEST_WORKER = 'm0-http-worker@servecircle.test';
let bookingId = null;
let workerToken = null;

async function call(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, body: json };
}

async function main() {
  // ── Auth ────────────────────────────────────────────────────────────────
  const adminLogin = await call('/auth/login', {
    method: 'POST',
    body: { email: 'admin@servecircle.in', password: 'admin123' },
  });
  assert.equal(adminLogin.status, 200, `admin login failed: ${JSON.stringify(adminLogin.body)}`);
  const adminToken = adminLogin.body.token;
  record('admin login via Postgres', Boolean(adminToken));

  // Clean up any previous run so registration is idempotent
  await prisma.user.deleteMany({ where: { email: { in: [TEST_CUSTOMER, TEST_WORKER] } } });

  const customerReg = await call('/auth/register', {
    method: 'POST',
    body: {
      name: 'M0 HTTP Customer', email: TEST_CUSTOMER, password: 'test1234',
      role: 'customer', city: 'Ahmedabad', phone: '9000000001',
    },
  });
  assert.equal(customerReg.status, 201, `customer register failed: ${JSON.stringify(customerReg.body)}`);
  const customerToken = customerReg.body.token;
  const customerId = customerReg.body.user.id;
  record('customer registered in Postgres', Boolean(customerToken));

  const workerReg = await call('/auth/register', {
    method: 'POST',
    body: {
      name: 'M0 HTTP Worker', email: TEST_WORKER, password: 'test1234',
      role: 'worker', city: 'Ahmedabad', phone: '9000000002',
      serviceCategory: 'Home Repairs', skills: ['AC Repair & Service'], experience: '1-2 Years',
    },
  });
  assert.equal(workerReg.status, 201, `worker register failed: ${JSON.stringify(workerReg.body)}`);
  const workerId = workerReg.body.user.id;
  record('worker registered as pending_interview',
    workerReg.body.user.workerStatus === 'pending_interview',
    String(workerReg.body.user.workerStatus));

  // ── Admin review list must read Postgres workers ────────────────────────
  const pendingList = await call('/users/workers/pending', { token: adminToken });
  const apiWorker = Array.isArray(pendingList.body)
    ? pendingList.body.find((w) => w.id === workerId || w._id === workerId)
    : null;
  record('admin worker list shows the Postgres application',
    pendingList.status === 200 && Boolean(apiWorker),
    `status=${pendingList.status} count=${Array.isArray(pendingList.body) ? pendingList.body.length : 'n/a'}`);

  // ── Admin approval writes Postgres, which dispatch reads ────────────────
  const approved = await call(`/users/${workerId}/worker-status`, {
    method: 'PATCH',
    token: adminToken,
    body: { workerStatus: 'approved_senior', workerAdminNote: 'M0 HTTP approval' },
  });
  record('admin approval persisted on Postgres',
    approved.status === 200 && approved.body?.workerStatus === 'approved_senior' && approved.body?.isVerified === true,
    `status=${approved.status} workerStatus=${approved.body?.workerStatus} isVerified=${approved.body?.isVerified}`);

  const workerLogin = await call('/auth/login', {
    method: 'POST',
    body: { email: TEST_WORKER, password: 'test1234' },
  });
  assert.equal(workerLogin.status, 200, `worker login failed: ${JSON.stringify(workerLogin.body)}`);
  workerToken = workerLogin.body.token;

  // Put test worker ONLINE and temporarily take Ramesh offline so test worker is uniquely dispatched
  await call('/users/worker/duty-status', {
    method: 'PATCH',
    token: workerToken,
    body: { dutyStatus: 'online' },
  });
  const ramesh = await prisma.user.findFirst({ where: { email: 'ramesh@test.com' }, include: { workerProfile: true } });
  if (ramesh?.workerProfile) {
    await prisma.workerProfile.update({ where: { id: ramesh.workerProfile.id }, data: { dutyStatus: 'OFFLINE' } });
  }

  // ── Customer books → approved worker must be auto-assigned ──────────────
  const created = await call('/bookings', {
    method: 'POST',
    token: customerToken,
    body: {
      service: 'AC Repair & Service', category: 'Home Repairs', serviceId: 'ac-repair',
      address: '31 M0 HTTP Street', city: 'Ahmedabad', amount: 449,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(), scheduledTime: '10:00 AM',
      description: 'M0 HTTP journey',
    },
  });
  bookingId = created.body?._id || null;
  record('booking created + auto-assigned over HTTP',
    created.status === 201 && created.body?.status === 'assigned' && created.body?.workerId === workerId,
    `status=${created.status} bookingStatus=${created.body?.status} worker=${created.body?.worker?.name || created.body?.workerId}`);

  // ── Worker lifecycle ────────────────────────────────────────────────────
  const accepted = await call(`/bookings/${bookingId}/accept`, { method: 'PATCH', token: workerToken });
  record('worker accept via API', accepted.status === 200 && accepted.body?.status === 'accepted', `status=${accepted.status}`);

  const enRoute = await call(`/bookings/${bookingId}/en-route`, { method: 'PATCH', token: workerToken });
  record('worker en-route via API', enRoute.status === 200 && enRoute.body?.status === 'en-route', `status=${enRoute.status}`);

  const arrived = await call(`/bookings/${bookingId}/arrive`, { method: 'PATCH', token: workerToken });
  record('arrival via API', arrived.status === 200 && arrived.body?.status === 'arrived', `status=${arrived.status}`);

  // ── Customer-only OTP retrieval ────────────────────────────────────────
  const otherCustomerLogin = await call('/auth/login', {
    method: 'POST',
    body: { email: 'priya@test.com', password: 'test123' },
  });
  const otherToken = otherCustomerLogin.body?.token;

  const crossRead = await call(`/bookings/${bookingId}`, { token: otherToken });
  record('another customer cannot read the booking', crossRead.status === 403, `status=${crossRead.status}`);

  const crossOtp = await call(`/bookings/${bookingId}/start-otp/regenerate`, { method: 'POST', token: otherToken });
  record('another customer cannot fetch the Start OTP', crossOtp.status === 403, `status=${crossOtp.status}`);

  const otpRes = await call(`/bookings/${bookingId}/start-otp/regenerate`, { method: 'POST', token: customerToken });
  const startCode = otpRes.body?.code;
  record('owner customer can fetch the Start OTP', otpRes.status === 200 && /^\d{4,6}$/.test(String(startCode)),
    `status=${otpRes.status} codeLength=${String(startCode || '').length}`);

  const bookingPayload = await call(`/bookings/${bookingId}`, { token: customerToken });
  record('booking detail never exposes OTP codes',
    bookingPayload.body?.startOtp === undefined && bookingPayload.body?.endOtp === undefined,
    `startOtp=${bookingPayload.body?.startOtp} endOtp=${bookingPayload.body?.endOtp}`);

  const started = await call(`/bookings/${bookingId}/start-otp/verify`, {
    method: 'POST', token: workerToken, body: { otp: startCode },
  });
  record('Start OTP starts the job via API', started.status === 200 && started.body?.status === 'started',
    `status=${started.status} bookingStatus=${started.body?.status}`);

  const endOtpRes = await call(`/bookings/${bookingId}/end-otp/regenerate`, { method: 'POST', token: customerToken });
  const endCode = endOtpRes.body?.code;
  const completed = await call(`/bookings/${bookingId}/end-otp/verify`, {
    method: 'POST', token: workerToken, body: { otp: endCode },
  });
  record('End OTP completes the job via API', completed.status === 200 && completed.body?.status === 'completed',
    `status=${completed.status} bookingStatus=${completed.body?.status}`);

  // ── Generic PATCH must not allow money/status edits ────────────────────
  const patchAmount = await call(`/bookings/${bookingId}`, {
    method: 'PATCH', token: customerToken, body: { amount: 1 },
  });
  record('generic PATCH rejects amount changes', patchAmount.status === 400, `status=${patchAmount.status}`);

  const patchStatus = await call(`/bookings/${bookingId}`, {
    method: 'PATCH', token: customerToken, body: { status: 'paid' },
  });
  record('generic PATCH rejects status changes', patchStatus.status === 405, `status=${patchStatus.status}`);

  const unauthPatch = await call(`/bookings/${bookingId}`, {
    method: 'PATCH', token: otherToken, body: { address: 'Hijacked' },
  });
  record('non-owner cannot PATCH the booking', unauthPatch.status === 403, `status=${unauthPatch.status}`);

  // Persisted truth survives a fresh read
  const finalRow = await prisma.booking.findUnique({ where: { id: bookingId } });
  record('completion persisted in Postgres',
    finalRow?.status === 'COMPLETED' && finalRow?.workerId === workerId,
    `dbStatus=${finalRow?.status}`);
}

async function cleanup() {
  const ramesh = await prisma.user.findFirst({ where: { email: 'ramesh@test.com' }, include: { workerProfile: true } });
  if (ramesh?.workerProfile) {
    await prisma.workerProfile.update({ where: { id: ramesh.workerProfile.id }, data: { dutyStatus: 'ONLINE' } }).catch(() => {});
  }
  if (bookingId) {
    await prisma.walletTransaction.deleteMany({ where: { bookingId } }).catch(() => {});
    await prisma.booking.delete({ where: { id: bookingId } }).catch(() => {});
  }
  for (const email of [TEST_CUSTOMER, TEST_WORKER]) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.workerProfile.deleteMany({ where: { userId: user.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    }
  }
}

try {
  await main();
} catch (err) {
  console.log('FAIL  HTTP journey aborted —', err.message);
  results.push({ name: 'http journey', ok: false });
} finally {
  await cleanup();
  await prisma.$disconnect();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} HTTP checks passed`);
  process.exit(failed === 0 ? 0 : 1);
}
