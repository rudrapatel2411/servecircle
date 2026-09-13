/**
 * server/utils/demoBookingStore.js
 *
 * In-memory resilient booking store for offline & demo fallback mode.
 * Automatically active when MongoDB is offline / Atlas is unwhitelisted.
 */

export const DEMO_BOOKINGS = [
  {
    _id: 'demo_bk_1001',
    bookingId: 'SC-2801',
    customer: {
      _id: '6a5f4c90437c4810f45fe0e9',
      name: 'Rudra Shah',
      email: 'rudra@test.com',
      phone: '9876543210',
    },
    worker: {
      _id: '6a5f4c90437c4810f45fe0eb',
      name: 'Ramesh Kumar',
      email: 'ramesh@test.com',
      phone: '9876500001',
      rating: 4.9,
      workerIdCode: 'WK-8902',
    },
    service: 'AC Service & Deep Cleaning',
    serviceId: 'ac-appliance-repair',
    category: 'Home Repairs',
    description: 'Master bedroom split AC cooling low',
    scheduledDate: new Date(Date.now() + 86400000),
    scheduledTime: '10:00 AM - 12:00 PM',
    address: 'B-402, Sunset Heights, Link Road, Andheri West',
    city: 'Mumbai',
    status: 'assigned',
    amount: 549,
    paymentStatus: 'pending',
    paymentMethod: 'Cash',
    startOtp: '4829',
    endOtp: '9173',
    assignedAt: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
    timeline: [
      { event: 'booking_created', timestamp: new Date(Date.now() - 3600000), actorRole: 'customer' },
      { event: 'worker_assigned', timestamp: new Date(Date.now() - 3000000), actorRole: 'system' },
    ],
  },
  {
    _id: 'demo_bk_1002',
    bookingId: 'SC-2800',
    customer: {
      _id: '6a5f4c90437c4810f45fe0e9',
      name: 'Rudra Shah',
      email: 'rudra@test.com',
      phone: '9876543210',
    },
    worker: {
      _id: '6a5f4c90437c4810f45fe0eb',
      name: 'Ramesh Kumar',
      email: 'ramesh@test.com',
      phone: '9876500001',
      rating: 4.9,
      workerIdCode: 'WK-8902',
    },
    service: 'Daily Dog Walking',
    serviceId: 'dog-walking',
    category: 'Pet Services',
    description: 'Golden Retriever 30 mins evening walk',
    scheduledDate: new Date(Date.now() - 86400000),
    scheduledTime: '05:00 PM - 06:00 PM',
    address: 'B-402, Sunset Heights, Link Road, Andheri West',
    city: 'Mumbai',
    status: 'completed',
    amount: 299,
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    startOtp: '1122',
    endOtp: '3344',
    createdAt: new Date(Date.now() - 86400000),
    completedAt: new Date(Date.now() - 82800000),
    updatedAt: new Date(Date.now() - 82800000),
    timeline: [
      { event: 'booking_created', timestamp: new Date(Date.now() - 86400000), actorRole: 'customer' },
      { event: 'completed', timestamp: new Date(Date.now() - 82800000), actorRole: 'worker' },
    ],
  }
];

let nextIdCounter = DEMO_BOOKINGS.length + 2802;

export function getAllDemoBookings({ status, search } = {}) {
  let list = [...DEMO_BOOKINGS];
  if (status) {
    list = list.filter(b => b.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b => b.bookingId.toLowerCase().includes(q) || b.service.toLowerCase().includes(q));
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getDemoBookingsForCustomer(customerId, status) {
  let list = DEMO_BOOKINGS.filter(b => {
    const custId = typeof b.customer === 'object' ? b.customer?._id : b.customer;
    return String(custId) === String(customerId);
  });
  if (status) {
    list = list.filter(b => b.status === status);
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getDemoBookingsForWorker(workerId, status) {
  let list = DEMO_BOOKINGS.filter(b => {
    const wId = typeof b.worker === 'object' ? b.worker?._id : b.worker;
    return String(wId) === String(workerId);
  });
  if (status) {
    list = list.filter(b => b.status === status);
  }
  return list.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
}

export function findDemoBookingById(id) {
  if (!id) return null;
  const strId = String(id);
  return DEMO_BOOKINGS.find(b => String(b._id) === strId || b.bookingId === strId) || null;
}

export function createDemoBooking(data, customerId, customerName = 'Customer') {
  const count = nextIdCounter++;
  const bookingId = `SC-${count}`;
  const now = new Date();

  const newBooking = {
    _id: `demo_bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    bookingId,
    customer: {
      _id: customerId,
      name: customerName,
      email: 'customer@servecircle.in',
      phone: '9876543210',
    },
    worker: {
      _id: '6a5f4c90437c4810f45fe0eb',
      name: 'Ramesh Kumar',
      email: 'ramesh@test.com',
      phone: '9876500001',
      rating: 4.9,
      workerIdCode: 'WK-8902',
    },
    service: data.service,
    serviceId: data.serviceId || undefined,
    category: data.category,
    description: data.description || '',
    scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
    scheduledTime: data.scheduledTime || 'Flexible Time',
    address: data.address || 'Flat 402, Link Road',
    city: data.city || 'Mumbai',
    status: 'assigned',
    amount: Number(data.amount) || 0,
    paymentStatus: data.paymentMethod === 'Cash' ? 'pending' : 'paid',
    paymentMethod: data.paymentMethod || 'Cash',
    startOtp: String(Math.floor(1000 + Math.random() * 9000)),
    endOtp: String(Math.floor(1000 + Math.random() * 9000)),
    assignedAt: now,
    createdAt: now,
    updatedAt: now,
    timeline: [
      { event: 'booking_created', timestamp: now, actorRole: 'customer' },
      { event: 'worker_assigned', timestamp: now, actorRole: 'system' },
    ],
  };

  DEMO_BOOKINGS.unshift(newBooking);
  return newBooking;
}

export function updateDemoBooking(id, updates) {
  const booking = findDemoBookingById(id);
  if (!booking) return null;
  Object.assign(booking, updates, { updatedAt: new Date() });
  return booking;
}
