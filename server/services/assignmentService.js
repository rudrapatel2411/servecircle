/**
 * assignmentService.js — PostgreSQL (Prisma) authoritative dispatch
 *
 * The project moved its durable data to PostgreSQL/Prisma. This service is the
 * ONLY place that decides which worker is eligible for a booking, and it reads
 * workers and jobs from PostgreSQL — never from the legacy Mongo models — so an
 * approval performed in the admin UI is immediately visible to dispatch.
 *
 * Pipeline:
 * 1. Filter: role WORKER, not deleted, verified WorkerProfile, approved status,
 *    available, and service-category (or approved service) match
 * 2. Filter: not currently busy with another active booking
 * 3. Distance: Haversine using the worker's last known coordinates (optional)
 * 4. Round robin: equal-distance buckets, oldest/null lastAssignedAt first
 * 5. Persistence: persist lastAssignedAt on WorkerProfile
 *
 * Weekly availability slots are a Phase 3 feature and are NOT persisted yet;
 * `isWorkerAvailableForSlot` therefore only honours a schedule when one is
 * explicitly supplied by the caller.
 */

import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

// Approved worker statuses that can be assigned jobs (Prisma enum values)
export const ELIGIBLE_STATUSES = ['APPROVED_ROOKIE', 'APPROVED_JUNIOR', 'APPROVED_SENIOR'];

// Booking statuses that keep a worker occupied
const BUSY_BOOKING_STATUSES = ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'STARTED'];

// A booking stays "busy" after completion until it has been paid
const BUSY_WHERE = {
  OR: [
    { status: { in: BUSY_BOOKING_STATUSES } },
    { status: 'COMPLETED', paymentStatus: { not: 'PAID' } },
  ],
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Normalise a Prisma enum status ("APPROVED_SENIOR") or legacy string to lowercase */
export function normalizeWorkerStatus(value) {
  if (!value) return '';
  return String(value).trim().toLowerCase();
}

/** Normalise an incoming (possibly lowercase) worker status to the Prisma enum */
export function toWorkerStatusEnum(value) {
  if (!value) return undefined;
  const upper = String(value).trim().toUpperCase().replace(/[\s-]+/g, '_');
  return ELIGIBLE_STATUSES.includes(upper) || ['PENDING_INTERVIEW', 'INTERVIEW_DONE', 'REJECTED'].includes(upper)
    ? upper
    : undefined;
}

/**
 * Helper: Parse time string ("10:30", "10:30 AM", "14:00", "09:00 AM - 11:00 AM") into minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const raw = String(timeStr).trim();
  if (raw.toLowerCase().includes('flexible') || raw.toLowerCase().includes('anytime')) {
    return null;
  }
  // If timeStr is a slot range like "09:00 AM - 11:00 AM", use the start time
  const target = raw.includes('-') ? raw.split('-')[0].trim() : raw;
  const match = target.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Helper: Haversine distance in kilometers between two [lon, lat] coordinate pairs
 */
export function haversineDistanceKm([lon1, lat1], [lon2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validate BOTH day AND time slot availability, including approved leaves.
 * Workers without a persisted schedule are treated as available; the weekly
 * planner and leave records gate assignments when configured.
 */
export function isWorkerAvailableForSlot(worker, scheduledDate, scheduledTime) {
  // 1. Leave Check: worker cannot take jobs on approved leave dates
  if (worker?.leaves && worker.leaves.length > 0 && scheduledDate) {
    const bookingDate = new Date(scheduledDate);
    if (!isNaN(bookingDate.getTime())) {
      const isOnLeave = worker.leaves.some((leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
        return bookingDate >= start && bookingDate <= end;
      });
      if (isOnLeave) return false;
    }
  }

  // 2. Weekly Availability Check: if weekly slots are configured, match day & time
  const slots = worker?.availability || [];
  if (slots.length === 0) {
    return true;
  }

  const dateObj = new Date(scheduledDate);
  if (isNaN(dateObj.getTime())) return true;

  // Resolve day of week accurately (local day of week)
  let dayIndex;
  if (typeof scheduledDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(scheduledDate.trim())) {
    const [y, m, d] = scheduledDate.trim().split('-').map(Number);
    dayIndex = new Date(y, m - 1, d).getDay();
  } else {
    // Offset by IST (+5.5 hours) for proper local day determination in India
    const istTime = new Date(dateObj.getTime() + (dateObj.getTimezoneOffset() + 330) * 60000);
    dayIndex = istTime.getDay();
  }
  const dayName = DAYS[dayIndex];

  const daySlot = slots.find((a) => {
    if (a.dayOfWeek !== undefined && a.dayOfWeek !== null) {
      return Number(a.dayOfWeek) === dayIndex;
    }
    return a.day && a.day.toLowerCase() === dayName.toLowerCase();
  });

  if (!daySlot || daySlot.isActive === false) return false;
  if (!scheduledTime) return true;

  const bookingMins = parseTimeToMinutes(scheduledTime);
  const startMins = parseTimeToMinutes(daySlot.startTime);
  const endMins = parseTimeToMinutes(daySlot.endTime);

  if (bookingMins === null || startMins === null || endMins === null) return true;

  return bookingMins >= startMins && bookingMins <= endMins;
}

/**
 * Normalise a Prisma User + WorkerProfile into the shape the rest of the
 * booking workflow expects (`_id`, `workerStatus`, `location`, `dutyStatus`, ...).
 */
export function formatAssignableWorker(user) {
  if (!user) return null;
  const profile = user.workerProfile || {};
  const hasCoordinates = profile.latitude !== null && profile.latitude !== undefined
    && profile.longitude !== null && profile.longitude !== undefined;
  const duty = profile.dutyStatus ? String(profile.dutyStatus).toLowerCase() : 'offline';

  return {
    _id: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: 'worker',
    isVerified: Boolean(profile.isVerified),
    isAvailable: profile.isAvailable !== false && duty === 'online',
    dutyStatus: duty,
    dutyStatusUpdatedAt: profile.dutyStatusUpdatedAt || null,
    serviceRadius: profile.serviceRadius || 25,
    workerStatus: normalizeWorkerStatus(profile.workerStatus),
    serviceCategory: profile.serviceCategory || null,
    skills: profile.skills || [],
    rating: profile.rating ?? 0,
    lastAssignedAt: profile.lastAssignedAt || null,
    availability: profile.availabilities || [],
    leaves: profile.leaves || [],
    location: hasCoordinates
      ? { type: 'Point', coordinates: [profile.longitude, profile.latitude] }
      : undefined,
    workerProfileId: profile.id || null,
  };
}

function isEligibleProfile(profile) {
  if (!profile) return false;
  if (!profile.isVerified) return false;
  const duty = profile.dutyStatus ? String(profile.dutyStatus).toUpperCase() : null;
  if (duty && duty !== 'ONLINE') return false;
  if (!duty && profile.isAvailable === false) return false;
  return ELIGIBLE_STATUSES.includes(String(profile.workerStatus || '').toUpperCase());
}

/**
 * A worker is busy when they hold an active job (or an unpaid completed job).
 */
export async function isWorkerBusy(workerId) {
  if (!workerId) return false;
  const busyBooking = await prisma.booking.findFirst({
    where: { workerId, ...BUSY_WHERE },
    select: { id: true },
  });
  return Boolean(busyBooking);
}

/**
 * Load one worker and report whether they may receive work right now.
 */
export async function isWorkerAvailable(workerId) {
  if (!workerId) return false;
  let user;
  try {
    user = await prisma.user.findFirst({
      where: { id: workerId, role: 'WORKER', isDeleted: false },
      include: { workerProfile: true },
    });
  } catch (err) {
    // Invalid identifier (e.g. a Mongo ObjectId) is simply "not available"
    return false;
  }
  if (!user || !isEligibleProfile(user.workerProfile)) return false;
  return !(await isWorkerBusy(workerId));
}

/**
 * Load every worker that passes the static eligibility filters.
 * Service matching is applied in memory so that a worker with an approved
 * WorkerService row for the booked service also qualifies.
 */
async function loadEligibleWorkers({ serviceCategory, city, workerStatus } = {}) {
  const statusEnum = workerStatus ? toWorkerStatusEnum(workerStatus) : undefined;
  const where = {
    role: 'WORKER',
    isDeleted: false,
    workerProfile: {
      is: {
        isVerified: true,
        dutyStatus: 'ONLINE',
        isAvailable: true,
        workerStatus: {
          in: statusEnum && ELIGIBLE_STATUSES.includes(statusEnum)
            ? [statusEnum]
            : ELIGIBLE_STATUSES,
        },
      },
    },
  };
  if (city) where.city = city;

  const users = await prisma.user.findMany({
    where,
    include: {
      workerProfile: {
        include: {
          services: { select: { serviceId: true, isApproved: true, isActive: true } },
          availabilities: { where: { isActive: true } },
          leaves: { where: { isApproved: true } },
        },
      },
    },
  });

  return users
    .map((user) => ({
      ...formatAssignableWorker(user),
      approvedServiceIds: (user.workerProfile?.services || [])
        .filter((s) => s.isApproved && s.isActive)
        .map((s) => s.serviceId),
    }))
    .filter((worker) => !serviceCategory || worker.serviceCategory === serviceCategory);
}

/**
 * PART 1: findEligibleWorkers — static eligibility, oldest assignment first.
 */
export async function findEligibleWorkers({ serviceCategory, city, workerStatus } = {}) {
  const workers = await loadEligibleWorkers({ serviceCategory, city, workerStatus });
  return workers.sort(
    (a, b) => new Date(a.lastAssignedAt || 0) - new Date(b.lastAssignedAt || 0)
  );
}

/**
 * PART 2: findNearestWorkers — distance filtering (computed from WorkerProfile
 * coordinates, since PostgreSQL does not use Mongo's 2dsphere index here).
 */
export async function findNearestWorkers({
  coordinates,
  serviceCategory,
  city,
  workerStatus,
  maxDistanceKm = 25,
} = {}) {
  const workers = await loadEligibleWorkers({ serviceCategory, city, workerStatus });
  if (!coordinates || coordinates.length !== 2) return workers;

  return workers
    .map((worker) => ({
      worker,
      distanceKm: worker.location
        ? haversineDistanceKm(coordinates, worker.location.coordinates)
        : null,
    }))
    .filter((entry) => entry.distanceKm !== null && entry.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map((entry) => entry.worker);
}

/**
 * PART 1, 5, 6: findBestWorker
 * Complete pipeline for selecting the optimal worker using location, busy
 * state, and round robin. Returns null when nobody is eligible.
 */
export async function findBestWorker(booking) {
  const { category, scheduledDate, scheduledTime, location, serviceId, city } = booking || {};

  const hasGeoCoords =
    location &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    (location.coordinates[0] !== 0 || location.coordinates[1] !== 0);

  const candidates = await loadEligibleWorkers({ city });
  if (candidates.length === 0) return null;

  // Service matching: category match OR an approved service link
  const serviceMatched = candidates.filter(
    (worker) =>
      !category ||
      worker.serviceCategory === category ||
      (serviceId && worker.approvedServiceIds.includes(serviceId))
  );
  if (serviceMatched.length === 0) return null;

  // Availability schedule (none persisted yet → everyone passes)
  const slotMatched = serviceMatched.filter((worker) =>
    isWorkerAvailableForSlot(worker, scheduledDate, scheduledTime)
  );
  if (slotMatched.length === 0) return null;

  // Busy check in a single query
  const busyRows = await prisma.booking.findMany({
    where: { workerId: { in: slotMatched.map((w) => w._id) }, ...BUSY_WHERE },
    select: { workerId: true },
  });
  const busyIds = new Set(busyRows.map((row) => row.workerId));
  const eligibleCandidates = slotMatched.filter((worker) => !busyIds.has(worker._id));
  if (eligibleCandidates.length === 0) return null;

  // Distance bucketing + round robin
  const bucketSizeKm = 3.0;
  const scored = eligibleCandidates.map((worker) => {
    const distanceKm =
      hasGeoCoords && worker.location
        ? haversineDistanceKm(location.coordinates, worker.location.coordinates)
        : 0;
    return {
      worker,
      bucket: Math.floor(distanceKm / bucketSizeKm),
      lastAssigned: worker.lastAssignedAt ? new Date(worker.lastAssignedAt).getTime() : 0,
    };
  });

  scored.sort((a, b) => (a.bucket !== b.bucket ? a.bucket - b.bucket : a.lastAssigned - b.lastAssigned));

  const selected = scored[0].worker;
  await touchLastAssigned(selected._id);
  return selected;
}

/**
 * Persist round-robin state. Bookkeeping must never fail an assignment.
 */
async function touchLastAssigned(workerId) {
  try {
    await prisma.workerProfile.updateMany({
      where: { userId: workerId },
      data: { lastAssignedAt: new Date() },
    });
  } catch (err) {
    console.warn(`[assignmentService] Could not persist lastAssignedAt for ${workerId}: ${err.message}`);
  }
}

/**
 * Manual assignment helper used by the admin workflow.
 * Re-validates eligibility and availability at assignment time to avoid the
 * race between "worker was eligible when the admin looked" and "worker is
 * eligible now".
 */
export async function assignWorker(workerId, serviceCategory, serviceId) {
  let worker;
  try {
    worker = await prisma.user.findFirst({
      where: { id: workerId, role: 'WORKER', isDeleted: false },
      include: {
        workerProfile: {
          include: {
            services: { select: { serviceId: true, isApproved: true, isActive: true } },
          },
        },
      },
    });
  } catch (err) {
    throw new AppError('Worker not found or not eligible for assignment', StatusCodes.BAD_REQUEST);
  }

  if (!worker || !isEligibleProfile(worker.workerProfile)) {
    throw new AppError('Worker not found or not eligible for assignment', StatusCodes.BAD_REQUEST);
  }

  const approvedServiceIds = (worker.workerProfile.services || [])
    .filter((s) => s.isApproved && s.isActive)
    .map((s) => s.serviceId);
  const workerCategory = worker.workerProfile.serviceCategory;

  const categoryMatches = !serviceCategory || workerCategory === serviceCategory;
  const serviceMatches = Boolean(serviceId) && approvedServiceIds.includes(serviceId);

  if (!categoryMatches && !serviceMatches) {
    throw new AppError(
      `Worker's service category (${workerCategory || 'unset'}) does not match booking category (${serviceCategory})`,
      StatusCodes.BAD_REQUEST
    );
  }

  if (await isWorkerBusy(workerId)) {
    throw new AppError(
      'Worker is currently busy with another active booking',
      StatusCodes.CONFLICT
    );
  }

  await touchLastAssigned(workerId);
  return formatAssignableWorker(worker);
}

/**
 * Run an assignment decision inside a SERIALIZABLE transaction so two
 * concurrent bookings can never claim the same worker. PostgreSQL SSI aborts
 * one of the conflicting transactions (P2034); we retry once, at which point
 * the busy-check sees the committed assignment and fails cleanly.
 */
export async function withAssignmentTransaction(fn) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: 'Serializable',
        timeout: 10000,
      });
    } catch (err) {
      lastError = err;
      if (err?.code === 'P2034') continue;
      throw err;
    }
  }
  throw lastError;
}

export default {
  ELIGIBLE_STATUSES,
  parseTimeToMinutes,
  haversineDistanceKm,
  isWorkerAvailableForSlot,
  isWorkerBusy,
  isWorkerAvailable,
  findEligibleWorkers,
  findNearestWorkers,
  findBestWorker,
  assignWorker,
  withAssignmentTransaction,
};
