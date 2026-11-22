/**
 * verify-real-worker-duty-and-schedule.mjs
 * Comprehensive automated verification for real PostgreSQL duty status,
 * schedule availability, leave gating, and customer booking dispatch.
 */

import { prisma } from '../config/prisma.js';
import {
  isWorkerAvailableForSlot,
  parseTimeToMinutes,
  findEligibleWorkers,
  findBestWorker,
} from '../services/assignmentService.js';
import { createBooking } from '../services/bookingService.js';

let passedChecks = 0;
let totalChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passedChecks++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function run() {
  console.log('=================================================================');
  console.log('   ServeCircle: Real Worker Duty, Schedule & Dispatch Test Suite');
  console.log('=================================================================\n');

  // 1. Locate a verified worker
  const workerUser = await prisma.user.findFirst({
    where: { role: 'WORKER', isDeleted: false, workerProfile: { isVerified: true } },
    include: { workerProfile: true },
  });

  assert(Boolean(workerUser), 'Verified worker exists in PostgreSQL');
  assert(Boolean(workerUser.workerProfile), 'Worker profile is linked via 1-to-1 relation');

  const profileId = workerUser.workerProfile.id;
  const originalDuty = workerUser.workerProfile.dutyStatus;

  try {
    // 2. Test Duty Status Transitions directly in DB
    console.log('\n--- 1. Real Duty Status Transitions in PostgreSQL ---');
    
    // Set ONLINE
    await prisma.workerProfile.update({
      where: { id: profileId },
      data: { dutyStatus: 'ONLINE', isAvailable: true, dutyStatusUpdatedAt: new Date() },
    });
    let p = await prisma.workerProfile.findUnique({ where: { id: profileId } });
    assert(p.dutyStatus === 'ONLINE', 'Worker duty status updated to ONLINE');
    assert(p.isAvailable === true, 'Worker isAvailable is true when ONLINE');

    // Set PAUSED (On Break)
    await prisma.workerProfile.update({
      where: { id: profileId },
      data: { dutyStatus: 'PAUSED', isAvailable: false, dutyStatusUpdatedAt: new Date() },
    });
    p = await prisma.workerProfile.findUnique({ where: { id: profileId } });
    assert(p.dutyStatus === 'PAUSED', 'Worker duty status updated to PAUSED');
    assert(p.isAvailable === false, 'Worker isAvailable is false when PAUSED');

    // Set OFFLINE
    await prisma.workerProfile.update({
      where: { id: profileId },
      data: { dutyStatus: 'OFFLINE', isAvailable: false, dutyStatusUpdatedAt: new Date() },
    });
    p = await prisma.workerProfile.findUnique({ where: { id: profileId } });
    assert(p.dutyStatus === 'OFFLINE', 'Worker duty status updated to OFFLINE');
    assert(p.isAvailable === false, 'Worker isAvailable is false when OFFLINE');

    // 3. Test Real Weekly Availability Persistence
    console.log('\n--- 2. Real Weekly Shift Persistence in PostgreSQL ---');
    // Clear and set Mon-Fri (days 1-5), 09:00 - 19:00
    await prisma.workerAvailability.deleteMany({ where: { workerProfileId: profileId } });
    
    for (let day = 1; day <= 5; day++) {
      await prisma.workerAvailability.create({
        data: {
          workerProfileId: profileId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          isActive: true,
        },
      });
    }

    const savedAvails = await prisma.workerAvailability.findMany({
      where: { workerProfileId: profileId },
      orderBy: { dayOfWeek: 'asc' },
    });
    assert(savedAvails.length === 5, '5 weekly shift days (Mon-Fri) persisted in WorkerAvailability table');
    assert(savedAvails[0].startTime === '09:00' && savedAvails[0].endTime === '19:00', 'Shift hours (09:00 - 19:00) persisted correctly');

    // 4. Test Real Planned Leave Persistence
    console.log('\n--- 3. Real Planned Leave Persistence in PostgreSQL ---');
    const testLeaveDate = '2026-11-27'; // A future Friday
    const createdLeave = await prisma.workerLeave.create({
      data: {
        workerProfileId: profileId,
        startDate: new Date(testLeaveDate + 'T00:00:00.000Z'),
        endDate: new Date(testLeaveDate + 'T23:59:59.999Z'),
        reason: 'Medical / Health Checkup',
        isApproved: true,
      },
    });

    assert(Boolean(createdLeave.id), 'Leave record persisted in WorkerLeave table with ID');
    assert(createdLeave.isApproved === true, 'Leave record marked as approved');

    // 5. Test Dispatch Gating Logic (Duty Status + Schedule + Leave)
    console.log('\n--- 4. Dispatch Gating & Slot Validation Engine ---');

    // Load full worker with availabilities and leaves
    const fullWorker = await prisma.user.findUnique({
      where: { id: workerUser.id },
      include: {
        workerProfile: {
          include: {
            availabilities: { where: { isActive: true } },
            leaves: { where: { isApproved: true } },
          },
        },
      },
    });

    const assignable = {
      _id: fullWorker.id,
      dutyStatus: 'online',
      isAvailable: true,
      availability: fullWorker.workerProfile.availabilities,
      leaves: fullWorker.workerProfile.leaves,
    };

    // Case A: Valid slot inside shift on a scheduled working day (Monday 11:30 AM)
    const validBooking = isWorkerAvailableForSlot(assignable, '2026-11-23', '11:30 AM');
    assert(validBooking === true, 'Valid booking slot inside shift (Monday 11:30 AM) is ACCEPTED');

    // Case B: Slot outside shift hours (Monday 22:00 / 10:00 PM)
    const outsideShiftBooking = isWorkerAvailableForSlot(assignable, '2026-11-23', '10:00 PM');
    assert(outsideShiftBooking === false, 'Booking slot outside shift hours (10:00 PM) is REJECTED');

    // Case C: Day Off (Sunday 2026-11-22)
    const dayOffBooking = isWorkerAvailableForSlot(assignable, '2026-11-22', '11:30 AM');
    assert(dayOffBooking === false, 'Booking on scheduled Day Off (Sunday) is REJECTED');

    // Case D: Approved Leave Date (2026-11-27)
    const leaveBooking = isWorkerAvailableForSlot(assignable, testLeaveDate, '11:30 AM');
    assert(leaveBooking === false, 'Booking on approved Leave Date is REJECTED');

    // Case E: Slot range parsing ("09:00 AM - 11:00 AM")
    const rangeBooking = isWorkerAvailableForSlot(assignable, '2026-11-23', '09:00 AM - 11:00 AM');
    assert(rangeBooking === true, 'Slot range ("09:00 AM - 11:00 AM") parsed and ACCEPTED');

    // 6. Test Duty Status Exclusion in loadEligibleWorkers
    console.log('\n--- 5. Auto-Dispatch Duty Status Exclusion ---');
    // Worker is OFFLINE
    await prisma.workerProfile.update({
      where: { id: profileId },
      data: { dutyStatus: 'OFFLINE', isAvailable: false },
    });
    let eligible = await findEligibleWorkers({ city: workerUser.city || 'Mumbai' });
    let isIncluded = eligible.some(w => w._id === workerUser.id);
    assert(isIncluded === false, 'OFFLINE worker is excluded from eligible dispatch pool');

    // Worker is PAUSED
    await prisma.workerProfile.update({
      where: { id: profileId },
      data: { dutyStatus: 'PAUSED', isAvailable: false },
    });
    eligible = await findEligibleWorkers({ city: workerUser.city || 'Mumbai' });
    isIncluded = eligible.some(w => w._id === workerUser.id);
    assert(isIncluded === false, 'PAUSED (On Break) worker is excluded from eligible dispatch pool');

    // Worker is ONLINE
    await prisma.workerProfile.update({
      where: { id: profileId },
      data: { dutyStatus: 'ONLINE', isAvailable: true },
    });
    eligible = await findEligibleWorkers({ city: workerUser.city || 'Mumbai' });
    isIncluded = eligible.some(w => w._id === workerUser.id);
    assert(isIncluded === true, 'ONLINE worker is included in eligible dispatch pool');

    // 7. Cleanup test leave
    await prisma.workerLeave.delete({ where: { id: createdLeave.id } });
    console.log('\nCleaned up test leave record.');

  } finally {
    // Restore original duty
    await prisma.workerProfile.update({
      where: { id: profileId },
      data: { dutyStatus: originalDuty || 'ONLINE', isAvailable: (originalDuty || 'ONLINE') === 'ONLINE' },
    });
    await prisma.$disconnect();
  }

  console.log('\n=================================================================');
  console.log(`✅ All ${passedChecks}/${totalChecks} tests PASSED! Real Duty, Schedule & Dispatch is 100% verified.`);
  console.log('=================================================================\n');
}

run().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
