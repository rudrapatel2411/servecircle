/**
 * assignmentService.js — Phase 1 Batch 4
 *
 * Complete Rule-Based Worker Assignment Algorithm.
 * NO AI, NO ML, NO scoring.
 *
 * Pipeline:
 * 1. Filter: role='worker', isVerified=true, workerStatus in ELIGIBLE_STATUSES, serviceCategory matches
 * 2. Filter: Availability (Day AND Time Slot)
 * 3. Filter: Not currently busy (active statuses: assigned, accepted, en-route, arrived, started, completed until paid)
 * 4. Filter & Distance: Proximity via MongoDB 2dsphere GeoJSON location
 * 5. Round Robin: Equal-distance bucketing & sort by lastAssignedAt (oldest/null first)
 * 6. Persistence: Persist lastAssignedAt timestamp in MongoDB User model
 */

import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

// Approved worker statuses that can be assigned jobs
const ELIGIBLE_STATUSES = ['approved_rookie', 'approved_junior', 'approved_senior'];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Helper: Parse time string ("10:30", "10:30 AM", "14:00") into minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
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
 * PART 3: Validate BOTH Day AND Time Slot availability
 */
export function isWorkerAvailableForSlot(worker, scheduledDate, scheduledTime) {
  if (!worker.availability || worker.availability.length === 0) {
    // If worker has no custom availability schedule defined, default to available
    return true;
  }

  const dateObj = new Date(scheduledDate);
  if (isNaN(dateObj.getTime())) return true;

  const dayName = DAYS[dateObj.getUTCDay()];

  // Find availability entry for this day
  const daySlot = worker.availability.find(
    (a) => a.day && a.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!daySlot) return false; // Not working on this day

  if (!scheduledTime) return true;

  const bookingMins = parseTimeToMinutes(scheduledTime);
  const startMins = parseTimeToMinutes(daySlot.startTime);
  const endMins = parseTimeToMinutes(daySlot.endTime);

  if (bookingMins === null || startMins === null || endMins === null) return true;

  return bookingMins >= startMins && bookingMins <= endMins;
}

/**
 * PART 4: Busy Worker Check
 * Active statuses: assigned, accepted, en-route, arrived, started, completed (until paid).
 * Workers with closed or cancelled jobs are available.
 */
export async function isWorkerBusy(workerId) {
  const busyBooking = await Booking.findOne({
    worker: workerId,
    $or: [
      { status: { $in: ['assigned', 'accepted', 'en-route', 'arrived', 'started'] } },
      { status: 'completed', paymentStatus: { $ne: 'paid' } },
    ],
    isDeleted: { $ne: true },
  });
  return !!busyBooking;
}

export async function isWorkerAvailable(workerId) {
  const worker = await User.findOne({
    _id: workerId,
    role: 'worker',
    isVerified: true,
    workerStatus: { $in: ELIGIBLE_STATUSES },
    isDeleted: false,
  });
  if (!worker) return false;
  return !(await isWorkerBusy(workerId));
}

/**
 * PART 1: findEligibleWorkers
 */
export async function findEligibleWorkers({ serviceCategory, city, workerStatus } = {}) {
  const query = {
    role: 'worker',
    isVerified: true,
    workerStatus: { $in: ELIGIBLE_STATUSES },
    isDeleted: false,
  };

  if (serviceCategory) query.serviceCategory = serviceCategory;
  if (city) query.city = city;
  if (workerStatus && ELIGIBLE_STATUSES.includes(workerStatus)) {
    query.workerStatus = workerStatus;
  }

  return User.find(query).select('-password').sort('lastAssignedAt');
}

/**
 * PART 2: Geospatial query using MongoDB GeoJSON location ($near)
 */
export async function findNearestWorkers({
  coordinates,
  serviceCategory,
  city,
  maxDistanceKm = 25,
} = {}) {
  if (!coordinates || coordinates.length !== 2) {
    return findEligibleWorkers({ serviceCategory, city });
  }

  const query = {
    role: 'worker',
    isVerified: true,
    workerStatus: { $in: ELIGIBLE_STATUSES },
    isDeleted: false,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: maxDistanceKm * 1000,
      },
    },
  };

  if (serviceCategory) query.serviceCategory = serviceCategory;
  if (city) query.city = city;

  return User.find(query).select('-password');
}

/**
 * PART 1, 5, 6: findBestWorker Algorithm
 * Complete pipeline for selecting the optimal worker using Geo-location, Availability, Busy check & Round Robin.
 */
export async function findBestWorker(booking) {
  const { category, scheduledDate, scheduledTime, location } = booking;

  // 1. Initial Candidates query (using geospatial $near if booking has coordinates)
  let candidates = [];
  const hasGeoCoords =
    location &&
    location.coordinates &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    (location.coordinates[0] !== 0 || location.coordinates[1] !== 0);

  if (hasGeoCoords) {
    candidates = await findNearestWorkers({
      coordinates: location.coordinates,
      serviceCategory: category,
      maxDistanceKm: 30,
    });
  } else {
    candidates = await findEligibleWorkers({ serviceCategory: category });
  }

  if (!candidates || candidates.length === 0) {
    return null;
  }

  // 2. Filter out workers unavailable for Day / Time Slot
  const slotAvailableCandidates = candidates.filter((w) =>
    isWorkerAvailableForSlot(w, scheduledDate, scheduledTime)
  );

  if (slotAvailableCandidates.length === 0) {
    return null;
  }

  // 3. Filter out busy workers
  const eligibleCandidates = [];
  for (const worker of slotAvailableCandidates) {
    const busy = await isWorkerBusy(worker._id);
    if (!busy) {
      eligibleCandidates.push(worker);
    }
  }

  if (eligibleCandidates.length === 0) {
    return null;
  }

  // 4 & 5. Distance Bucketing & Round Robin Sorting
  // Calculate exact distance for candidates if coordinates are available
  const bucketSizeKm = 3.0; // 3km tolerance window for round-robin bucketing

  const scoredCandidates = eligibleCandidates.map((worker) => {
    let distKm = 0;
    if (hasGeoCoords && worker.location && worker.location.coordinates) {
      distKm = haversineDistanceKm(location.coordinates, worker.location.coordinates);
    }
    const bucket = Math.floor(distKm / bucketSizeKm);
    const lastAssigned = worker.lastAssignedAt ? new Date(worker.lastAssignedAt).getTime() : 0;
    return { worker, distKm, bucket, lastAssigned };
  });

  // Sort by bucket ASC (nearer bucket wins), then lastAssigned ASC (oldest assignment / null wins)
  scoredCandidates.sort((a, b) => {
    if (a.bucket !== b.bucket) {
      return a.bucket - b.bucket;
    }
    return a.lastAssigned - b.lastAssigned;
  });

  const selectedWorker = scoredCandidates[0].worker;

  // Persist Round Robin state in MongoDB
  await User.findByIdAndUpdate(selectedWorker._id, {
    $set: { lastAssignedAt: new Date() },
  });

  return selectedWorker;
}

/**
 * Manual assignment helper used by admin workflow routes
 */
export async function assignWorker(workerId, serviceCategory) {
  const worker = await User.findOne({
    _id: workerId,
    role: 'worker',
    isVerified: true,
    workerStatus: { $in: ELIGIBLE_STATUSES },
    isDeleted: false,
  }).select('-password');

  if (!worker) {
    throw new AppError(
      'Worker not found or not eligible for assignment',
      StatusCodes.BAD_REQUEST
    );
  }

  if (serviceCategory && worker.serviceCategory !== serviceCategory) {
    throw new AppError(
      `Worker's service category (${worker.serviceCategory}) does not match booking category (${serviceCategory})`,
      StatusCodes.BAD_REQUEST
    );
  }

  const busy = await isWorkerBusy(workerId);
  if (busy) {
    throw new AppError(
      'Worker is currently busy with another active booking',
      StatusCodes.CONFLICT
    );
  }

  // Persist assignment timestamp for Round Robin tracking
  await User.findByIdAndUpdate(workerId, {
    $set: { lastAssignedAt: new Date() },
  });

  return worker;
}
