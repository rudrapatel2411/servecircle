export const matchesBookingId = (b, targetId) => {
  if (!b || !targetId) return false;
  if (b.id === targetId || b._id === targetId || b.backendId === targetId) return true;
  const aClean = String(b.id || b._id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const backendClean = String(b.backendId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const bClean = String(targetId).toLowerCase().replace(/[^a-z0-9]/g, '');
  return (
    aClean === bClean ||
    (backendClean && backendClean === bClean) ||
    (bClean.length >= 4 && (aClean.endsWith(bClean) || bClean.endsWith(aClean)))
  );
};

export const findBookingIndex = (all, bookingId) => {
  return all.findIndex((b) => matchesBookingId(b, bookingId));
};

/**
 * serviceWorkflowEngine.js
 *
 * Unified Client-Side Reactive Workflow Engine for ServeCircle
 * Handles End-to-End Service Booking Lifecycle:
 *  1. Customer booking placement with Start OTP & 15km area broadcast
 *  2. First-come-first-served Worker Acceptance
 *  3. Live Tracking activation with GPS simulation & Start OTP card
 *  4. Worker Doorstep Arrival & OTP Gate Verification
 *  5. Before-Service Photo Inspection proof
 *  6. Service Start & In-App Spare Parts Quotation (Approve vs Cancel with Visiting Fee)
 *  7. After-Service Photo Completion proof
 *  8. Final Settlement, Customer Wallet deduction & Worker Earnings sync
 *
 * Preserves 100% of existing mock data across Customer & Worker dashboards.
 */

import { broadcastNotificationToTabs } from './notificationSync.js';

const STORAGE_KEYS = {
  BOOKINGS: 'servecircle_workflow_engine_bookings',
  WALLET: 'servecircle_workflow_engine_wallet',
  WORKER_EARNINGS: 'servecircle_workflow_engine_earnings',
};

export const PLATFORM_VISITING_FEE = 199; // Standard platform inspection fee

// Create or reuse BroadcastChannel for instant cross-tab sync without page reload
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('servecircle_workflow_sync');
  } catch (e) {
    console.warn('BroadcastChannel not supported in this environment', e);
  }
}

// Global Custom Event Dispatcher
const notifySubscribers = (eventType, payload) => {
  if (typeof window === 'undefined') return;

  const eventData = { type: eventType, payload, timestamp: Date.now() };

  // Dispatch in current window
  window.dispatchEvent(new CustomEvent('servecircle:workflow-update', { detail: eventData }));

  // Storage ping for other tabs (guaranteed cross-tab reactivity in all browsers)
  try {
    localStorage.setItem('servecircle_workflow_ping', JSON.stringify({ type: eventType, t: Date.now() }));
  } catch {}

  // Broadcast to other open tabs (e.g. customer tab ↔ worker tab)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(eventData);
    } catch (e) {
      console.warn('Failed to broadcast workflow event', e);
    }
  }
};

// Listen for broadcast events from other tabs
if (typeof window !== 'undefined' && broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data) {
      window.dispatchEvent(new CustomEvent('servecircle:workflow-update', { detail: event.data }));
    }
  };
}

// ─────────────────────────────────────────────
// DATA STORAGE HELPERS
// ─────────────────────────────────────────────

export const getWorkflowBookings = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading workflow bookings:', e);
    return [];
  }
};

const saveWorkflowBookings = (bookings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving workflow bookings:', e);
  }
};

export const getWorkflowBookingById = (bookingId) => {
  if (!bookingId) return null;
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  return index !== -1 ? all[index] : null;
};

// ─────────────────────────────────────────────
// WORKFLOW LIFECYCLE ACTIONS
// ─────────────────────────────────────────────

/**
 * Step 1: Customer creates a new booking
 */
export const createWorkflowBooking = ({
  id = '',
  backendId = '',
  startOtp: providedOtp = '',
  serviceName,
  category = 'Home Repairs',
  amount = 499,
  address = 'Satellite, Ahmedabad',
  scheduledDate,
  scheduledTime = 'Today, Immediate',
  customerName = 'Rudra Shah',
  customerPhone = '+91 98765 43210',
  notes = '',
  paymentMethod = 'Wallet',
}) => {
  // Generate random 4-digit security Start OTP (or preserve caller/backend OTP)
  const startOtp = /^\d{4}$/.test(String(providedOtp || '').trim())
    ? String(providedOtp).trim()
    : Math.floor(1000 + Math.random() * 9000).toString();
  const bookingNumber = id ? String(id).trim() : `#SC-${Math.floor(2850 + Math.random() * 7000)}`;
  const distanceKm = (1.5 + Math.random() * 7.5).toFixed(1); // 1.5 to 9.0 km (well within 15 km)

  const newBooking = {
    id: bookingNumber,
    _id: backendId || bookingNumber,
    backendId: backendId || null,
    bookingId: bookingNumber,
    service: serviceName,
    serviceName,
    category,
    amount: Number(amount),
    basePrice: Number(amount),
    finalAmount: Number(amount),
    visitingFee: PLATFORM_VISITING_FEE,
    startOtp,
    status: 'pending', // pending -> accepted -> arrived -> verified -> in-progress -> quotation_pending -> completed -> paid
    distanceKm: `${distanceKm} km`,
    within15Km: true,
    scheduledDate: scheduledDate || new Date().toISOString(),
    scheduledTime,
    address,
    notes,
    customer: {
      name: customerName,
      phone: customerPhone,
      address,
    },
    worker: null,
    proofs: {
      before: null,
      beforeTimestamp: null,
      after: null,
      afterTimestamp: null,
    },
    quotation: null,
    createdAt: new Date().toISOString(),
    paymentMethod,
    paymentStatus: 'pending',
  };

  const existing = getWorkflowBookings();
  const updated = [newBooking, ...existing];
  saveWorkflowBookings(updated);

  // Sync with customer recent bookings localStorage
  try {
    const recent = JSON.parse(localStorage.getItem('servecircle_customer_recent_bookings') || '[]');
    localStorage.setItem(
      'servecircle_customer_recent_bookings',
      JSON.stringify([newBooking, ...recent.filter((b) => b.id !== newBooking.id)])
    );
  } catch (e) {
    // fallback safe
  }

  // Broadcast targeted 15km job request alert to matching workers
  broadcastNotificationToTabs({
    id: `job_alert_${newBooking.id}`,
    bookingId: newBooking.id,
    type: 'booking_request',
    targetRole: 'worker',
    targetCategory: newBooking.category,
    category: newBooking.category,
    service: newBooking.service,
    serviceType: newBooking.service,
    title: `⚡ New ${newBooking.category} Request (Within 15 km)`,
    message: `${newBooking.service} requested by ${newBooking.customer.name} at ${newBooking.address} (${newBooking.distanceKm}). Tap to review & accept.`,
    amount: newBooking.amount,
    address: newBooking.address,
    customerName: newBooking.customer.name,
    customerPhone: newBooking.customer.phone,
    scheduledTime: newBooking.scheduledTime,
    distanceKm: newBooking.distanceKm,
    canAccept: true,
  });

  // Notify customer that booking is confirmed & broadcasted
  broadcastNotificationToTabs({
    id: `booking_confirmed_${newBooking.id}`,
    bookingId: newBooking.id,
    type: 'booking_confirmed',
    targetRole: 'customer',
    targetCustomerName: newBooking.customer?.name,
    targetCustomerPhone: newBooking.customer?.phone,
    title: `✅ Booking Confirmed (#${newBooking.id})`,
    message: `Your ${newBooking.service} request is confirmed and sent to verified specialists nearby. Start OTP: ${newBooking.startOtp}`,
    startOtp: newBooking.startOtp,
  });

  notifySubscribers('BOOKING_CREATED', newBooking);
  return newBooking;
};

/**
 * Step 2: First-to-Accept Worker claims the job
 */
export const acceptWorkflowBooking = (bookingId, workerProfile = null) => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  const current = all[index];
  if (current.status !== 'pending') {
    return { error: 'Job already accepted by another professional' };
  }

  const assignedWorker = workerProfile || {
    id: 'worker-pro-01',
    name: 'Rajesh Sharma',
    tier: 'Senior Specialist',
    phone: '+91 98250 12345',
    rating: 4.9,
    jobsSolved: 480,
    initials: 'RS',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    currentLocation: [23.0275, 72.5684],
  };

  current.status = 'accepted';
  current.worker = assignedWorker;
  current.acceptedAt = new Date().toISOString();
  current.etaMinutes = 12;

  all[index] = current;
  saveWorkflowBookings(all);

  // Broadcast acceptance notification strictly to the customer
  broadcastNotificationToTabs({
    id: `accept_alert_${current.id}`,
    bookingId: current.id,
    type: 'booking_accepted',
    targetRole: 'customer',
    targetCustomerName: current.customer?.name,
    targetCustomerPhone: current.customer?.phone,
    title: `✓ Specialist Assigned!`,
    message: `${assignedWorker.name} has accepted your booking #${current.id} and is preparing tools. Start OTP: ${current.startOtp}`,
    workerName: assignedWorker.name,
    workerPhone: assignedWorker.phone,
    startOtp: current.startOtp,
  });

  // Confirm acceptance to the accepting worker
  broadcastNotificationToTabs({
    id: `worker_accept_confirm_${current.id}`,
    bookingId: current.id,
    type: 'booking_accepted',
    targetRole: 'worker',
    targetWorkerId: assignedWorker.id || assignedWorker._id || assignedWorker.email,
    targetCategory: current.category,
    category: current.category,
    title: `✓ Job Accepted (#${current.id})`,
    message: `You accepted ${current.service} for ${current.customer?.name || 'Customer'}. Tap "Ready to Go" when heading out.`,
  });

  notifySubscribers('JOB_ACCEPTED', current);
  return current;
};

/**
 * Step 2B: Worker declines the job
 * The booking remains in the broadcast pool for other specialists,
 * but is recorded as declined by this worker so it no longer clutters their pending tab.
 */
export const declineWorkflowBooking = (bookingId, workerId = 'worker-tech-01') => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  const current = all[index];
  const wId = String(workerId || 'worker-tech-01');
  const existingDeclined = Array.isArray(current.declinedWorkers) ? current.declinedWorkers : [];
  if (!existingDeclined.includes(wId)) {
    current.declinedWorkers = [...existingDeclined, wId];
  }

  all[index] = current;
  saveWorkflowBookings(all);

  notifySubscribers('JOB_DECLINED', { booking: current, declinedBy: wId });
  return current;
};

/**
 * Worker sets status to En-Route
 */
export const setWorkflowEnRoute = (bookingId) => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  all[index].status = 'en-route';
  all[index].etaMinutes = 8;
  saveWorkflowBookings(all);

  broadcastNotificationToTabs({
    id: `enroute_alert_${all[index].id}`,
    bookingId: all[index].id,
    type: 'worker_enroute',
    targetRole: 'customer',
    targetCustomerName: all[index].customer?.name,
    targetCustomerPhone: all[index].customer?.phone,
    title: `🚗 Technician En Route`,
    message: `${all[index].worker?.name || 'Your specialist'} is on the way to your doorstep. ETA ~8 mins.`,
    workerName: all[index].worker?.name,
    startOtp: all[index].startOtp,
  });

  broadcastNotificationToTabs({
    id: `worker_enroute_confirm_${all[index].id}`,
    bookingId: all[index].id,
    type: 'worker_enroute',
    targetRole: 'worker',
    targetWorkerId: all[index].worker?.id || all[index].worker?._id || all[index].worker?.email,
    targetCategory: all[index].category,
    category: all[index].category,
    title: `🚗 En Route Started (#${all[index].id})`,
    message: `Live GPS tracking is active. Customer ${all[index].customer?.name || ''} has been notified.`,
  });

  notifySubscribers('STATUS_CHANGED', all[index]);
  return all[index];
};

/**
 * Step 3: Worker arrives at Doorstep
 */
export const setWorkflowArrived = (bookingId) => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  all[index].status = 'arrived';
  all[index].arrivedAt = new Date().toISOString();
  all[index].etaMinutes = 0;
  saveWorkflowBookings(all);

  broadcastNotificationToTabs({
    id: `arrived_alert_${all[index].id}`,
    bookingId: all[index].id,
    type: 'worker_arrived',
    targetRole: 'customer',
    targetCustomerName: all[index].customer?.name,
    targetCustomerPhone: all[index].customer?.phone,
    title: `⚡ Specialist Arrived at Doorstep!`,
    message: `${all[index].worker?.name || 'Technician'} has arrived at your doorstep! Share Start OTP (${all[index].startOtp}) to begin work.`,
    workerName: all[index].worker?.name,
    startOtp: all[index].startOtp,
  });

  broadcastNotificationToTabs({
    id: `worker_arrived_confirm_${all[index].id}`,
    bookingId: all[index].id,
    type: 'worker_arrived',
    targetRole: 'worker',
    targetWorkerId: all[index].worker?.id || all[index].worker?._id || all[index].worker?.email,
    targetCategory: all[index].category,
    category: all[index].category,
    title: `📍 Arrived at Doorstep (#${all[index].id})`,
    message: `Collect the 4-digit Start OTP from ${all[index].customer?.name || 'the customer'} to start service.`,
  });

  notifySubscribers('WORKER_ARRIVED', all[index]);
  return all[index];
};

/**
 * Step 4: Worker verifies Customer Start OTP at the door
 */
export const verifyWorkflowStartOtp = (bookingId, enteredOtp) => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return { success: false, message: 'Booking not found' };

  const current = all[index];
  const cleanEntered = String(enteredOtp).trim();
  const cleanActual = String(current.startOtp).trim();

  if (cleanEntered !== cleanActual) {
    return { success: false, message: `Incorrect OTP. Please enter the 4-digit code (${cleanActual}) displayed on customer screen.` };
  }

  current.status = 'verified';
  current.otpVerifiedAt = new Date().toISOString();
  all[index] = current;
  saveWorkflowBookings(all);

  broadcastNotificationToTabs({
    id: `otp_verified_${current.id}`,
    bookingId: current.id,
    type: 'otp_verified',
    targetRole: 'customer',
    targetCustomerName: current.customer?.name,
    targetCustomerPhone: current.customer?.phone,
    title: `✓ Start OTP Verified!`,
    message: `${current.worker?.name || 'Specialist'} verified your Start OTP. Safe doorstep service authorized.`,
  });

  broadcastNotificationToTabs({
    id: `worker_otp_verified_${current.id}`,
    bookingId: current.id,
    type: 'otp_verified',
    targetRole: 'worker',
    targetWorkerId: current.worker?.id || current.worker?._id || current.worker?.email,
    targetCategory: current.category,
    category: current.category,
    title: `✓ Start OTP Verified (#${current.id})`,
    message: `Doorstep entry authorized. Upload Before-Service Photo and start work.`,
  });

  notifySubscribers('OTP_VERIFIED', current);
  return { success: true, booking: current };
};

/**
 * Step 5: Worker uploads "Before-Service Photo"
 */
export const uploadWorkflowBeforePhoto = (bookingId, photoUrl, notes = '') => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  all[index].proofs = all[index].proofs || {};
  all[index].proofs.before = photoUrl;
  all[index].proofs.beforeNotes = notes;
  all[index].proofs.beforeTimestamp = new Date().toISOString();
  all[index].beforePhoto = photoUrl;
  all[index].hasBeforeProof = true;
  all[index].status = 'before_photo_uploaded';

  saveWorkflowBookings(all);

  broadcastNotificationToTabs({
    id: `before_photo_cust_${all[index].id}`,
    bookingId: all[index].id,
    type: 'photo_uploaded',
    targetRole: 'customer',
    targetCustomerName: all[index].customer?.name,
    targetCustomerPhone: all[index].customer?.phone,
    title: `📸 Before-Service Photo Uploaded`,
    message: `${all[index].worker?.name || 'Your specialist'} uploaded the pre-service inspection photo for #${all[index].id}.`,
  });

  broadcastNotificationToTabs({
    id: `before_photo_worker_${all[index].id}`,
    bookingId: all[index].id,
    type: 'photo_uploaded',
    targetRole: 'worker',
    targetWorkerId: all[index].worker?.id || all[index].worker?._id || all[index].worker?.email,
    targetCategory: all[index].category,
    category: all[index].category,
    title: `📸 Before-Service Photo Saved (#${all[index].id})`,
    message: `Pre-service inspection proof uploaded successfully.`,
  });

  notifySubscribers('BEFORE_PHOTO_UPLOADED', all[index]);
  return all[index];
};

/**
 * Step 6: Worker starts service
 */
export const startWorkflowService = (bookingId) => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  all[index].status = 'in-progress';
  all[index].startedAt = new Date().toISOString();

  saveWorkflowBookings(all);

  broadcastNotificationToTabs({
    id: `started_alert_${all[index].id}`,
    bookingId: all[index].id,
    type: 'service_started',
    targetRole: 'customer',
    targetCustomerName: all[index].customer?.name,
    targetCustomerPhone: all[index].customer?.phone,
    title: `🔧 Service In Progress`,
    message: `${all[index].worker?.name || 'Specialist'} has commenced work on ${all[index].service}.`,
  });

  broadcastNotificationToTabs({
    id: `worker_started_${all[index].id}`,
    bookingId: all[index].id,
    type: 'service_started',
    targetRole: 'worker',
    targetWorkerId: all[index].worker?.id || all[index].worker?._id || all[index].worker?.email,
    targetCategory: all[index].category,
    category: all[index].category,
    title: `🔧 Service Started (#${all[index].id})`,
    message: `Work is now in progress for ${all[index].service}.`,
  });

  notifySubscribers('SERVICE_STARTED', all[index]);
  return all[index];
};

/**
 * Step 7: Worker generates an in-app Quotation for spare parts / extra work
 */
export const submitWorkflowQuotation = (bookingId, { items, totalAmount, notes = '' }) => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  const quotation = {
    id: `QUOTE-${Date.now().toString().slice(-4)}`,
    items: items || [],
    totalAmount: Number(totalAmount) || 0,
    notes,
    status: 'PENDING', // PENDING | APPROVED | REJECTED
    createdAt: new Date().toISOString(),
  };

  all[index].quotation = quotation;
  all[index].status = 'quotation_pending';

  saveWorkflowBookings(all);

  broadcastNotificationToTabs({
    id: `quote_cust_${all[index].id}_${quotation.id}`,
    bookingId: all[index].id,
    type: 'quote_received',
    targetRole: 'customer',
    targetCustomerName: all[index].customer?.name,
    targetCustomerPhone: all[index].customer?.phone,
    title: `📋 New Quotation Received (#${all[index].id})`,
    message: `${all[index].worker?.name || 'Specialist'} sent an extra work/parts estimate of ₹${quotation.totalAmount}. Please review & approve.`,
  });

  broadcastNotificationToTabs({
    id: `quote_worker_${all[index].id}_${quotation.id}`,
    bookingId: all[index].id,
    type: 'quote_received',
    targetRole: 'worker',
    targetWorkerId: all[index].worker?.id || all[index].worker?._id || all[index].worker?.email,
    targetCategory: all[index].category,
    category: all[index].category,
    title: `📋 Quotation Sent (#${all[index].id})`,
    message: `Estimate of ₹${quotation.totalAmount} sent to ${all[index].customer?.name || 'customer'} for approval.`,
  });

  notifySubscribers('QUOTATION_SUBMITTED', all[index]);
  return all[index];
};

/**
 * Customer decides on Quotation:
 *  - APPROVED: Price increases, work resumes.
 *  - REJECTED: Service is cancelled, but Customer MUST pay ₹199 platform visiting fee.
 */
export const decideWorkflowQuotation = (bookingId, decision, rejectionReason = '') => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  const current = all[index];
  if (!current.quotation) return null;

  if (decision === 'APPROVED') {
    current.quotation.status = 'APPROVED';
    current.quotation.decidedAt = new Date().toISOString();
    // Total revised amount is base price + quotation amount
    current.amount = (current.basePrice || current.amount) + current.quotation.totalAmount;
    current.finalAmount = current.amount;
    current.status = 'in-progress';
  } else {
    current.quotation.status = 'REJECTED';
    current.quotation.rejectionReason = rejectionReason || 'Cost is too high for customer';
    current.quotation.decidedAt = new Date().toISOString();
    current.status = 'cancelled_visiting_fee'; // Cancelled, but visiting fee applies
    current.amount = PLATFORM_VISITING_FEE;
    current.finalAmount = PLATFORM_VISITING_FEE;

    // Deduct visiting fee from customer wallet & credit worker
    recordWalletTransaction({
      type: 'payment',
      amount: -PLATFORM_VISITING_FEE,
      desc: `Platform Visiting Fee for Inspection (${current.service})`,
      bookingId: current.id,
    });

    recordWorkerEarning({
      bookingId: current.id,
      service: `${current.service} (Inspection / Visiting)`,
      amount: Math.round(PLATFORM_VISITING_FEE * 0.85), // Worker gets 85% of visiting fee
      date: new Date().toISOString(),
      status: 'Cancelled by Customer (Visiting Fee Paid)',
    });
  }

  all[index] = current;
  saveWorkflowBookings(all);

  const isApproved = decision === 'APPROVED';
  broadcastNotificationToTabs({
    id: `quote_decided_worker_${current.id}_${Date.now()}`,
    bookingId: current.id,
    type: 'quote_decided',
    targetRole: 'worker',
    targetWorkerId: current.worker?.id || current.worker?._id || current.worker?.email,
    targetCategory: current.category,
    category: current.category,
    title: isApproved ? `✅ Quotation Approved (#${current.id})` : `⚠️ Quotation Declined (#${current.id})`,
    message: isApproved
      ? `${current.customer?.name || 'Customer'} approved the ₹${current.quotation.totalAmount} estimate. You can proceed with work.`
      : `${current.customer?.name || 'Customer'} declined the estimate. ₹${Math.round(PLATFORM_VISITING_FEE * 0.85)} visiting payout credited.`,
  });

  broadcastNotificationToTabs({
    id: `quote_decided_cust_${current.id}_${Date.now()}`,
    bookingId: current.id,
    type: 'quote_decided',
    targetRole: 'customer',
    targetCustomerName: current.customer?.name,
    targetCustomerPhone: current.customer?.phone,
    title: isApproved ? `✅ Quotation Approved (#${current.id})` : `Booking Cancelled — Visiting Fee Applied`,
    message: isApproved
      ? `Updated total is ₹${current.amount}. Your specialist is resuming work.`
      : `Estimate declined. ₹${PLATFORM_VISITING_FEE} platform visiting fee settled.`,
  });

  notifySubscribers('QUOTATION_DECIDED', current);
  return current;
};

/**
 * Step 8: Worker uploads "After-Service Photo"
 */
export const uploadWorkflowAfterPhoto = (bookingId, photoUrl, notes = '') => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  all[index].proofs = all[index].proofs || {};
  all[index].proofs.after = photoUrl;
  all[index].proofs.afterNotes = notes;
  all[index].proofs.afterTimestamp = new Date().toISOString();
  all[index].status = 'after_photo_uploaded';

  saveWorkflowBookings(all);

  broadcastNotificationToTabs({
    id: `after_photo_cust_${all[index].id}`,
    bookingId: all[index].id,
    type: 'photo_uploaded',
    targetRole: 'customer',
    targetCustomerName: all[index].customer?.name,
    targetCustomerPhone: all[index].customer?.phone,
    title: `📸 After-Service Photo Uploaded`,
    message: `${all[index].worker?.name || 'Your specialist'} uploaded the post-service completion photo for #${all[index].id}.`,
  });

  broadcastNotificationToTabs({
    id: `after_photo_worker_${all[index].id}`,
    bookingId: all[index].id,
    type: 'photo_uploaded',
    targetRole: 'worker',
    targetWorkerId: all[index].worker?.id || all[index].worker?._id || all[index].worker?.email,
    targetCategory: all[index].category,
    category: all[index].category,
    title: `📸 After-Service Photo Saved (#${all[index].id})`,
    message: `Completion proof uploaded. Tap "Complete Service" to settle payment.`,
  });

  notifySubscribers('AFTER_PHOTO_UPLOADED', all[index]);
  return all[index];
};

/**
 * Step 9: Service Completed & Final Payment settled
 */
export const completeAndPayWorkflowBooking = (bookingId, paymentMethod = 'Wallet') => {
  const all = getWorkflowBookings();
  const index = findBookingIndex(all, bookingId);
  if (index === -1) return null;

  const current = all[index];
  const payableAmount = current.finalAmount || current.amount || 499;

  current.status = 'completed';
  current.paymentStatus = 'paid';
  current.paymentMethod = paymentMethod;
  current.completedAt = new Date().toISOString();

  // Deduct from customer wallet if Wallet payment
  if (paymentMethod.toLowerCase() === 'wallet') {
    recordWalletTransaction({
      type: 'payment',
      amount: -payableAmount,
      desc: `Payment for ${current.service} (${current.id})`,
      bookingId: current.id,
    });
  }

  // Credit worker earnings: Worker receives 90%
  const workerPayout = Math.round(payableAmount * 0.9);
  recordWorkerEarning({
    bookingId: current.id,
    service: current.service,
    amount: workerPayout,
    date: new Date().toISOString(),
    status: 'Completed',
  });

  all[index] = current;
  saveWorkflowBookings(all);

  broadcastNotificationToTabs({
    id: `completed_alert_${current.id}`,
    bookingId: current.id,
    type: 'booking_completed',
    targetRole: 'customer',
    targetCustomerName: current.customer?.name,
    targetCustomerPhone: current.customer?.phone,
    title: `✓ Service Completed & Paid`,
    message: `Your service ${current.service} has been completed and payment of ₹${payableAmount} settled.`,
  });

  broadcastNotificationToTabs({
    id: `worker_completed_${current.id}`,
    bookingId: current.id,
    type: 'booking_completed',
    targetRole: 'worker',
    targetWorkerId: current.worker?.id || current.worker?._id || current.worker?.email,
    targetCategory: current.category,
    category: current.category,
    title: `💰 Job Completed & Payout Credited (#${current.id})`,
    message: `${current.service} completed! ₹${workerPayout} credited to your earnings.`,
  });

  notifySubscribers('JOB_COMPLETED', current);
  return current;
};

// ─────────────────────────────────────────────
// WALLET HELPERS (Sync with CustomerWallet)
// ─────────────────────────────────────────────

export const getWorkflowWalletData = () => {
  if (typeof window === 'undefined') return { balance: 2450, transactions: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (!raw) return { balance: 2450, transactions: [] };
    return JSON.parse(raw);
  } catch (e) {
    return { balance: 2450, transactions: [] };
  }
};

export const recordWalletTransaction = ({ type = 'payment', amount, desc, bookingId }) => {
  const data = getWorkflowWalletData();
  const newBalance = Math.max(0, data.balance + amount);
  const newTx = {
    id: `tx-${Date.now()}`,
    type,
    amount,
    balance: newBalance,
    desc,
    date: new Date().toLocaleString([], {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    method: 'Wallet',
    bookingId,
  };

  const updated = {
    balance: newBalance,
    transactions: [newTx, ...(data.transactions || [])],
  };

  try {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(updated));
  } catch (e) {}

  notifySubscribers('WALLET_UPDATED', updated);
  return updated;
};

// ─────────────────────────────────────────────
// WORKER EARNINGS HELPERS (Sync with WorkerDashboard)
// ─────────────────────────────────────────────

export const getWorkflowWorkerEarnings = () => {
  if (typeof window === 'undefined') return { totalEarned: 0, completedCount: 0, logs: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKER_EARNINGS);
    if (!raw) return { totalEarned: 0, completedCount: 0, logs: [] };
    return JSON.parse(raw);
  } catch (e) {
    return { totalEarned: 0, completedCount: 0, logs: [] };
  }
};

export const recordWorkerEarning = ({ bookingId, service, amount, date, status }) => {
  const data = getWorkflowWorkerEarnings();
  const newLog = {
    id: `earn-${Date.now()}`,
    bookingId,
    service,
    amount,
    date: date || new Date().toISOString(),
    status: status || 'Completed',
  };

  const updated = {
    totalEarned: (data.totalEarned || 0) + amount,
    completedCount: (data.completedCount || 0) + 1,
    logs: [newLog, ...(data.logs || [])],
  };

  try {
    localStorage.setItem(STORAGE_KEYS.WORKER_EARNINGS, JSON.stringify(updated));
  } catch (e) {}

  notifySubscribers('EARNINGS_UPDATED', updated);
  return updated;
};

// ─────────────────────────────────────────────
// REAL-TIME SUBSCRIPTION HOOK HELPER
// ─────────────────────────────────────────────

export const subscribeWorkflowUpdates = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handler = (e) => {
    if (callback && e.detail) {
      callback(e.detail);
    }
  };

  const storageHandler = (e) => {
    if (e.key === 'servecircle_workflow_ping' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (callback) callback(parsed);
      } catch {}
    }
  };

  window.addEventListener('servecircle:workflow-update', handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener('servecircle:workflow-update', handler);
    window.removeEventListener('storage', storageHandler);
  };
};
