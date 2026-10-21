/**
 * server/utils/demoDataStore.js
 *
 * Resilient In-Memory Fallback Data Store for Secondary Models:
 * Coupons, Reviews, Complaints, Notifications, Contracts, Invoices, Partners, Wallet Transactions.
 * Seamlessly used when MongoDB is offline / Atlas IP is not whitelisted.
 */

export const DEMO_COUPONS = [
  {
    _id: 'cpn_1',
    code: 'WELCOME50',
    description: 'Flat ₹50 off on your first booking',
    discountType: 'flat',
    discountValue: 50,
    minOrderAmount: 299,
    maxDiscount: 50,
    usageLimit: 500,
    usedCount: 42,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
    applicableCategories: [],
    isActive: true,
  },
  {
    _id: 'cpn_2',
    code: 'SUMMER20',
    description: '20% off up to ₹150 for summer services',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 499,
    maxDiscount: 150,
    usageLimit: 200,
    usedCount: 65,
    validFrom: new Date('2026-03-01'),
    validUntil: new Date('2026-08-31'),
    applicableCategories: ['Home Repairs', 'Cleaning & Hygiene', 'Vehicle Services'],
    isActive: true,
  },
  {
    _id: 'cpn_3',
    code: 'SERVE100',
    description: 'Flat ₹100 off on premium services',
    discountType: 'flat',
    discountValue: 100,
    minOrderAmount: 999,
    maxDiscount: 100,
    usageLimit: 100,
    usedCount: 28,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
    applicableCategories: [],
    isActive: true,
  },
  {
    _id: 'cpn_4',
    code: 'CLEAN20',
    description: '20% off Cleaning & Hygiene services',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 300,
    maxDiscount: 500,
    usageLimit: 150,
    usedCount: 39,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
    applicableCategories: ['Cleaning & Hygiene'],
    isActive: true,
  },
  {
    _id: 'cpn_5',
    code: 'SAVE10',
    description: '10% off up to ₹100 on any service',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 199,
    maxDiscount: 100,
    usageLimit: 1000,
    usedCount: 140,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
    applicableCategories: [],
    isActive: true,
  },
];

export const DEMO_REVIEWS = [
  {
    _id: 'rev_1',
    booking: 'demo_bk_1002',
    customer: {
      _id: '6a5f4c90437c4810f45fe0e9',
      name: 'Rudra Shah',
      avatar: '',
    },
    worker: {
      _id: '6a5f4c90437c4810f45fe0eb',
      name: 'Ramesh Kumar',
      avatar: '',
    },
    service: 'AC Service & Deep Cleaning',
    rating: 5,
    comment: 'Punctual, professional and extremely courteous. Cleaned the split AC filters thoroughly!',
    createdAt: new Date(Date.now() - 86400000),
    isEdited: false,
    isDeleted: false,
  },
  {
    _id: 'rev_2',
    booking: 'demo_bk_1003',
    customer: {
      _id: '6a5f4c90437c4810f45fe0ea',
      name: 'Priya Desai',
      avatar: '',
    },
    worker: {
      _id: '6a5f4c90437c4810f45fe0eb',
      name: 'Ramesh Kumar',
      avatar: '',
    },
    service: 'Electrical Switchboard Repair',
    rating: 5,
    comment: 'Identified the short-circuit wire issue in 10 minutes. Highly recommended technician.',
    createdAt: new Date(Date.now() - 172800000),
    isEdited: false,
    isDeleted: false,
  },
];

export const DEMO_COMPLAINTS = [
  {
    _id: 'cmp_1',
    complaintId: 'CMP-1001',
    filedBy: {
      _id: '6a5f4c90437c4810f45fe0e9',
      name: 'Rudra Shah',
      email: 'rudra@test.com',
      role: 'customer',
    },
    booking: {
      _id: 'demo_bk_1001',
      bookingId: 'SC-2801',
      service: 'AC Service & Deep Cleaning',
    },
    subject: 'Technician arrived 20 minutes past slot window',
    description: 'Service was great once started, but arrival was slightly delayed without prior intimation.',
    category: 'delay',
    priority: 'low',
    status: 'resolved',
    resolution: 'Apologized to customer and credited ₹50 wallet compensation.',
    createdAt: new Date(Date.now() - 259200000),
  },
];

export const DEMO_NOTIFICATIONS = [
  {
    _id: 'notif_1',
    title: 'Booking Confirmed ⚡',
    message: 'Your AC Service & Deep Cleaning (SC-2801) has been scheduled with Ramesh Kumar.',
    type: 'booking_update',
    targetAudience: 'all',
    readBy: [],
    isActive: true,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    _id: 'notif_2',
    title: 'Summer Offer Active ☀️',
    message: 'Use coupon code SUMMER20 to get 20% off on all home repair and appliance services.',
    type: 'promotion',
    targetAudience: 'customers',
    readBy: [],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    _id: 'notif_3',
    title: 'Biometric & Badge Verified',
    message: 'All ServeCircle technicians undergo 3-tier police & background verification for your safety.',
    type: 'system',
    targetAudience: 'all',
    readBy: [],
    isActive: true,
    createdAt: new Date(Date.now() - 172800000),
  },
];

export const DEMO_PARTNERS = [
  {
    _id: 'prt_1',
    name: 'Green Valley Society RWA',
    companyName: 'Green Valley Cooperative Housing Society',
    contactPerson: 'Karan Mehra',
    email: 'gv@test.com',
    phone: '9876600001',
    type: 'society',
    status: 'active',
    address: 'Sector 45, Green Valley Enclave, Gurgaon',
    city: 'Gurgaon',
    unitsCount: 240,
    servicesSubscribed: ['Society Security & Guard', 'Water Tank Cleaning', 'Elevator Maintenance'],
    createdAt: new Date(Date.now() - 2592000000),
  },
];

export const DEMO_CONTRACTS = [
  {
    _id: 'cnt_1',
    contractId: 'CTR-2026-001',
    partner: '6a5f4c90437c4810f45fe0ee',
    partnerName: 'Green Valley Society',
    contractType: 'monthly_cleaning',
    services: [
      { name: 'Common Area Cleaning', frequency: 'Daily', pricePerUnit: 12000 },
      { name: 'Security Guard Shift', frequency: '24x7', pricePerUnit: 25000 },
    ],
    locations: [
      { name: 'Tower A & B', address: 'Green Valley Enclave', city: 'Gurgaon' },
    ],
    totalValue: 37000,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    status: 'active',
    autoRenew: true,
    notes: 'Priority technician dispatch on society hotline.',
    createdAt: new Date('2026-01-01'),
  },
];

export const DEMO_INVOICES = [
  {
    _id: 'inv_1',
    invoiceId: 'INV-5001',
    contract: 'cnt_1',
    partner: '6a5f4c90437c4810f45fe0ee',
    items: [
      { description: 'Monthly Society Facility Maintenance - May 2026', quantity: 1, unitPrice: 37000, total: 37000 },
    ],
    subtotal: 37000,
    tax: 6660,
    discount: 1000,
    totalAmount: 42660,
    dueDate: new Date(Date.now() + 604800000),
    status: 'sent',
    paymentMethod: 'Bank Transfer / RTGS',
    notes: 'Net 15 days payment terms.',
    createdAt: new Date(Date.now() - 172800000),
  },
];

export const DEMO_TRANSACTIONS = [
  {
    _id: 'tx_101',
    user: '6a5f4c90437c4810f45fe0e9',
    type: 'topup',
    amount: 1000,
    balanceAfter: 2450,
    description: 'Wallet top-up via UPI',
    paymentMethod: 'UPI',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    _id: 'tx_102',
    user: '6a5f4c90437c4810f45fe0e9',
    type: 'payment',
    amount: -499,
    balanceAfter: 1450,
    description: 'Service payment: AC General Service',
    paymentMethod: 'Wallet',
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    _id: 'tx_103',
    user: '6a5f4c90437c4810f45fe0e9',
    type: 'bonus',
    amount: 50,
    balanceAfter: 1500,
    description: 'Welcome loyalty reward points bonus',
    status: 'completed',
    createdAt: new Date(Date.now() - 604800000),
  },
];
