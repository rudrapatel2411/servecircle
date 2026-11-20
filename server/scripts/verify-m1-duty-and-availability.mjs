// Unit & Contract Verification for Milestone M1 (Worker Duty Switch & Availability)
// Run from server/: node scripts/verify-m1-duty-and-availability.mjs
import assert from 'node:assert/strict';
import {
  isWorkerAvailableForSlot,
  formatAssignableWorker,
  parseTimeToMinutes,
  haversineDistanceKm,
} from '../services/assignmentService.js';

const results = [];
function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function testM1() {
  console.log('🧪 Starting Milestone M1 (Duty Switch & Availability) Verification...\n');

  // ── 1. formatAssignableWorker Contract ──────────────────────────────────
  const mockUserOnline = {
    id: 'worker-uuid-1',
    name: 'Ramesh Pro',
    email: 'ramesh@test.com',
    role: 'WORKER',
    city: 'Ahmedabad',
    workerProfile: {
      id: 'profile-uuid-1',
      workerStatus: 'APPROVED_SENIOR',
      isVerified: true,
      isAvailable: true,
      dutyStatus: 'ONLINE',
      dutyStatusUpdatedAt: new Date('2026-11-20T10:00:00Z'),
      serviceRadius: 25,
      latitude: 23.0225,
      longitude: 72.5714,
      skills: ['AC Repair'],
      serviceCategory: 'Home Repairs',
    },
  };

  const formattedOnline = formatAssignableWorker(mockUserOnline);
  record('formatAssignableWorker exposes dutyStatus=online', formattedOnline.dutyStatus === 'online', formattedOnline.dutyStatus);
  record('formatAssignableWorker marks isAvailable=true when online', formattedOnline.isAvailable === true, String(formattedOnline.isAvailable));
  record('formatAssignableWorker includes dutyStatusUpdatedAt', Boolean(formattedOnline.dutyStatusUpdatedAt), String(formattedOnline.dutyStatusUpdatedAt));
  record('formatAssignableWorker includes serviceRadius', formattedOnline.serviceRadius === 25, String(formattedOnline.serviceRadius));

  const mockUserOffline = {
    id: 'worker-uuid-2',
    name: 'Suresh Pro',
    email: 'suresh@test.com',
    role: 'WORKER',
    city: 'Ahmedabad',
    workerProfile: {
      id: 'profile-uuid-2',
      workerStatus: 'APPROVED_SENIOR',
      isVerified: true,
      isAvailable: true,
      dutyStatus: 'OFFLINE',
      dutyStatusUpdatedAt: new Date('2026-11-20T10:00:00Z'),
    },
  };

  const formattedOffline = formatAssignableWorker(mockUserOffline);
  record('formatAssignableWorker dutyStatus=offline marks isAvailable=false', formattedOffline.isAvailable === false, String(formattedOffline.isAvailable));

  const mockUserPaused = {
    id: 'worker-uuid-3',
    name: 'Mahesh Pro',
    email: 'mahesh@test.com',
    role: 'WORKER',
    city: 'Ahmedabad',
    workerProfile: {
      id: 'profile-uuid-3',
      workerStatus: 'APPROVED_SENIOR',
      isVerified: true,
      isAvailable: true,
      dutyStatus: 'PAUSED',
    },
  };

  const formattedPaused = formatAssignableWorker(mockUserPaused);
  record('formatAssignableWorker dutyStatus=paused marks isAvailable=false', formattedPaused.isAvailable === false, String(formattedPaused.isAvailable));

  // ── 2. Approved Leave Gating ─────────────────────────────────────────────
  const workerWithLeave = {
    id: 'worker-leave-1',
    leaves: [
      {
        startDate: new Date('2026-11-25T00:00:00Z'),
        endDate: new Date('2026-11-27T23:59:59Z'),
        isApproved: true,
        reason: 'Family function',
      },
    ],
    availability: [],
  };

  const onLeaveDate = '2026-11-26T14:00:00Z';
  const availableDate = '2026-11-28T14:00:00Z';

  const checkOnLeave = isWorkerAvailableForSlot(workerWithLeave, onLeaveDate, '02:00 PM');
  record('worker is NOT available during approved leave', checkOnLeave === false, `expected=false, got=${checkOnLeave}`);

  const checkAfterLeave = isWorkerAvailableForSlot(workerWithLeave, availableDate, '02:00 PM');
  record('worker IS available outside approved leave dates', checkAfterLeave === true, `expected=true, got=${checkAfterLeave}`);

  // ── 3. Weekly Availability Slots ─────────────────────────────────────────
  // Note: 2026-11-23 is Monday (UTC day 1), 2026-11-22 is Sunday (UTC day 0)
  const workerWithSlots = {
    id: 'worker-slots-1',
    leaves: [],
    availability: [
      {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
      {
        dayOfWeek: 2, // Tuesday
        startTime: '10:00',
        endTime: '16:00',
        isActive: true,
      },
    ],
  };

  // Monday within slot: 11:30 AM
  const checkMonInSlot = isWorkerAvailableForSlot(workerWithSlots, '2026-11-23T11:30:00Z', '11:30 AM');
  record('worker IS available on scheduled day within time slot', checkMonInSlot === true, `Mon 11:30 AM => ${checkMonInSlot}`);

  // Monday outside slot: 07:30 PM (19:30)
  const checkMonOutSlot = isWorkerAvailableForSlot(workerWithSlots, '2026-11-23T19:30:00Z', '07:30 PM');
  record('worker is NOT available outside configured slot hours', checkMonOutSlot === false, `Mon 07:30 PM => ${checkMonOutSlot}`);

  // Sunday: no slot configured
  const checkSunNoSlot = isWorkerAvailableForSlot(workerWithSlots, '2026-11-22T11:00:00Z', '11:00 AM');
  record('worker is NOT available on unconfigured day of week', checkSunNoSlot === false, `Sun 11:00 AM => ${checkSunNoSlot}`);

  // ── 4. Distance / Location Radius Math ────────────────────────────────────
  const ahmedabadCenter = [72.5714, 23.0225]; // [lon, lat]
  const gandhinagarCenter = [72.6369, 23.2156];
  const distanceKm = haversineDistanceKm(ahmedabadCenter, gandhinagarCenter);
  record('haversine distance calculates accurately (~22km)', distanceKm > 20 && distanceKm < 25, `${distanceKm.toFixed(2)} km`);

  // ── Summary ──────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.ok).length;
  console.log(`\n========================================`);
  console.log(`M1 Verification: ${passed}/${results.length} checks passed.`);
  console.log(`========================================\n`);

  if (passed !== results.length) {
    process.exit(1);
  }
}

testM1().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
