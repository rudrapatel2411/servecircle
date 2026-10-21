# 05 — DATA MODEL INVENTORY
## ServeCircle Flutter Migration — Complete MongoDB Schema Specification

**Source:** Verified from server/models/ (24 models total)
**All models use Mongoose ODM with Express.js backend**

---

## MODEL CATALOG (24 models)

| # | Model | File | Purpose |
|---|-------|------|---------|
| 1 | User | User.js | All users (customer, worker, admin, b2b) |
| 2 | Booking | Booking.js | Core booking + state machine |
| 3 | Service | Service.js | Service catalog |
| 4 | Review | Review.js | Customer reviews of workers |
| 5 | Complaint | Complaint.js | Complaint tickets |
| 6 | Notification | Notification.js | Push/broadcast notifications |
| 7 | WalletTransaction | WalletTransaction.js | Wallet ledger |
| 8 | Coupon | Coupon.js | Discount coupons |
| 9 | Contract | Contract.js | B2B service contracts |
| 10 | Invoice | Invoice.js | B2B invoices |
| 11 | Partner | Partner.js | B2B partner profiles |
| 12 | WorkerMetrics | WorkerMetrics.js | Per-worker ML metrics |
| 13 | CustomerMetrics | CustomerMetrics.js | Per-customer ML metrics |
| 14 | TrustProfile | TrustProfile.js | Worker trust signal collection |
| 15 | CustomerBehaviour | CustomerBehaviour.js | Customer behavioral signals |
| 16 | WorkerGeoHistory | WorkerGeoHistory.js | Append-only worker geo trail |
| 17 | WorkerSkillHistory | WorkerSkillHistory.js | Per-skill performance |
| 18 | DemandHistory | DemandHistory.js | Hourly demand snapshots |
| 19 | FeatureStore | FeatureStore.js | ML-ready feature records |
| 20 | ComplaintMetrics | ComplaintMetrics.js | Complaint analytics |
| 21 | EventLog | EventLog.js | Immutable audit event log |
| 22 | DocumentHistory | DocumentHistory.js | Immutable document snapshots |
| 23 | AIAnalysis | AIAnalysis.js | AI inference results |
| 24 | (Implicit) Session/Token | JWT only | No DB sessions — stateless |

---

## 1. USER MODEL

**Roles:** customer | worker | admin | b2b

```
User {
  _id: ObjectId
  name: String (required)
  email: String (required, unique, lowercase)
  phone: String (required)
  password: String (bcrypt hashed)
  role: Enum[customer, worker, admin, b2b] (required)
  avatar: String (URL or empty)
  isVerified: Boolean (default: false)
  isDeleted: Boolean (default: false)
  deletedAt: Date

  // Customer fields
  subscription: Enum[basic, silver, gold, platinum] (default: basic)
  walletBalance: Number (default: 0)

  // Worker fields
  workerStatus: Enum[pending, approved_senior, approved_junior, approved, rejected, suspended, blocked, expired]
  skills: [String]
  serviceCategory: String
  city: String
  area: String
  experience: String
  languages: [String]
  certificates: [String]
  rating: Number (default: 0)
  completedJobs: Number (default: 0)
  shadowJobsDone: Number (default: 0)
  workerAdminNote: String (hidden from clients)
  idProof: String (hidden from clients)
  workerIdCode: String (format: SC-W-XXXX)
  qrToken: String (format: SCQR-<16hex>)
  qrGeneratedAt: Date
  qrActive: Boolean (default: true)
  location: { type: 'Point', coordinates: [lng, lat] }

  // B2B fields
  companyName: String
  companyType: String
  totalLocations: Number

  timestamps: true
}
```

**Soft delete:** `isDeleted` flag + `deletedAt` timestamp. All queries skip deleted users.

**Sensitive fields** (never sent to client):
- `password`
- `idProof`
- `workerAdminNote`

---

## 2. BOOKING MODEL

```
Booking {
  _id: ObjectId
  bookingId: String (format: SC-YYYYMMDD-NNNN, required, unique)
  customer: ObjectId ? User (required)
  worker: ObjectId ? User (nullable)
  service: String (required)
  serviceCategory: String (required)
  serviceId: ObjectId ? Service (nullable)
  address: String (required)
  city: String
  area: String
  scheduledDate: String
  scheduledTime: String
  price: Number (required)
  finalPrice: Number (nullable — after coupon/discount)
  couponCode: String
  couponDiscount: Number (default: 0)
  paymentMethod: Enum[wallet, online, cash, b2b_account] (default: online)
  paymentStatus: Enum[pending, completed, refunded, failed] (default: pending)
  notes: String
  workerGender: Enum[any, male, female] (default: any)
  plan: Enum[basic, silver, gold, platinum]
  isEmergency: Boolean (default: false)

  // Status state machine
  status: Enum[pending, assigned, accepted, arrived, started, completed, cancelled]

  // OTP for job start
  otp: String (4-digit)

  // Photo evidence
  beforePhotos: [{ url: String, uploadedAt: Date }]
  afterPhotos: [{ url: String, uploadedAt: Date }]

  // GPS tracking
  workerArrivalLocation: { type: 'Point', coordinates: [lng, lat] }
  workerCompletionLocation: { type: 'Point', coordinates: [lng, lat] }
  customerLocation: { type: 'Point', coordinates: [lng, lat] }

  // Trust & Safety
  isWorkerVerifiedBeforeOtp: Boolean (default: false)
  workerVerifiedAt: Date

  // Timestamps for each status transition
  assignedAt: Date
  acceptedAt: Date
  arrivedAt: Date
  startedAt: Date
  completedAt: Date
  cancelledAt: Date

  cancellationReason: String
  rejectionReason: String
  isDeleted: Boolean (default: false)
  deletedAt: Date
  timestamps: true
}
```

**State Machine Transitions:**
```
pending ? assigned    (Admin: PUT /:id/assign, body: { workerId })
assigned ? accepted   (Worker: PUT /:id/accept)
assigned ? pending    (Worker: PUT /:id/reject, body: { reason })
accepted ? arrived    (Worker: PUT /:id/arrive — if endpoint exists)
accepted ? started    (Worker: POST /:id/start, body: { otp })
started ? completed   (Worker: POST /:id/complete, body: { workerLat?, workerLng? })
any ? cancelled       (PROTECT: POST /:id/cancel, body: { reason })
```

---

## 3. SERVICE MODEL

```
Service {
  _id: ObjectId
  serviceId: String (unique, sparse)
  name: String (required)
  category: String (required)
  subCategory: String
  description: String
  basePrice: Number (required, min: 0)
  estimatedDuration: Number (default: 60, minutes)
  isActive: Boolean (default: true)
  icon: String (default: '??')
  image: String (URL)
  tags: [String]
  serviceRadius: Number (default: 20, km)
  isDeleted: Boolean (default: false)
  deletedAt: Date
  timestamps: true
}
```

**Text search index:** name (weight 10), tags (weight 5), description (weight 1)

---

## 4. REVIEW MODEL

```
Review {
  _id: ObjectId
  booking: ObjectId ? Booking (required)
  customer: ObjectId ? User (required)
  worker: ObjectId ? User (required)
  service: String (required)
  rating: Number (required, 1-5)
  comment: String
  reply: String (worker reply)
  isEdited: Boolean (default: false)
  isDeleted: Boolean (default: false)
  deletedAt: Date
  timestamps: true
}
```

**Constraint:** One review per (booking, customer) pair — unique compound index.

---

## 5. COMPLAINT MODEL

```
Complaint {
  _id: ObjectId
  complaintId: String (required, unique)
  booking: ObjectId ? Booking (nullable)
  filedBy: ObjectId ? User (required)
  againstUser: ObjectId ? User (nullable)
  subject: String (required)
  description: String (required)
  category: Enum[service_quality, payment, worker_behaviour, delay, damage, fraud, other]
  priority: Enum[low, medium, high, critical] (default: medium)
  status: Enum[open, in_progress, resolved, escalated, closed] (default: open)
  resolution: String
  resolvedBy: ObjectId ? User
  resolvedAt: Date
  attachments: [String]
  timestamps: true
}
```

---

## 6. NOTIFICATION MODEL

```
Notification {
  _id: ObjectId
  title: String (required)
  message: String (required)
  type: Enum[broadcast, personal, booking_update, promotion, alert, system]
  targetAudience: Enum[all, customers, workers, b2b, specific]
  targetUsers: [ObjectId ? User]
  readBy: [ObjectId ? User]
  sentBy: ObjectId ? User
  isActive: Boolean (default: true)
  expiresAt: Date
  timestamps: true
}
```

---

## 7. WALLET TRANSACTION MODEL

```
WalletTransaction {
  _id: ObjectId
  user: ObjectId ? User (required)
  type: Enum[topup, payment, refund, earning, withdrawal, bonus] (required)
  amount: Number (required)
  balanceAfter: Number (required)
  description: String (required)
  reference: String (bookingId, couponCode, etc.)
  booking: ObjectId ? Booking (nullable)
  status: Enum[pending, completed, failed] (default: completed)
  paymentMethod: String (UPI, card, bank)
  timestamps: true
}
```

---

## 8. COUPON MODEL

```
Coupon {
  _id: ObjectId
  code: String (required, unique, uppercase)
  description: String
  discountType: Enum[percentage, flat] (default: percentage)
  discountValue: Number (required)
  minOrderAmount: Number (default: 0)
  maxDiscount: Number (cap for percentage coupons)
  usageLimit: Number (default: 100)
  usedCount: Number (default: 0)
  validFrom: Date (required)
  validUntil: Date (required)
  applicableCategories: [String]
  applicablePlans: [Enum[basic, silver, gold, platinum]]
  isActive: Boolean (default: true)
  createdBy: ObjectId ? User
  timestamps: true
}
```

---

## 9. CONTRACT MODEL (B2B)

```
Contract {
  _id: ObjectId
  contractId: String (required, unique, format: CON-NNNN)
  partner: ObjectId ? User (required, B2B user)
  partnerName: String (required)
  contractType: Enum[monthly_cleaning, quarterly_maintenance, weekly_services, annual_package, custom]
  services: [{ name, frequency, pricePerUnit }]
  locations: [{ name, address, city }]
  totalValue: Number (required)
  startDate: Date (required)
  endDate: Date (required)
  status: Enum[draft, active, renewal_due, expired, cancelled] (default: draft)
  autoRenew: Boolean (default: false)
  notes: String
  timestamps: true
}
```

---

## 10. INVOICE MODEL (B2B)

```
Invoice {
  _id: ObjectId
  invoiceId: String (format: INV-NNNN)
  partner: ObjectId ? User
  contract: ObjectId ? Contract
  items: [{ description, quantity, unitPrice, total }]
  subtotal: Number
  tax: Number (18% GST)
  discount: Number
  totalAmount: Number
  status: Enum[sent, paid, overdue, cancelled] (default: sent)
  paidDate: Date
  timestamps: true
}
```

---

## 11. AI ANALYSIS MODEL

```
AIAnalysis {
  _id: ObjectId
  analysisId: String (required, unique)
  requestId: String
  provider: String (default: 'gemini')
  model: String (default: 'gemini-2.0-flash')
  feature: String (e.g., 'customer_chat', 'image_diagnosis')
  bookingId: ObjectId ? Booking
  customerId: ObjectId ? User
  workerId: ObjectId ? User
  language: String (default: 'English')
  imageHash: String
  textHash: String
  promptTokens: Number
  completionTokens: Number
  totalTokens: Number
  estimatedCost: Number
  latency: Number (ms)
  confidence: Number (0-1)
  confidenceBreakdown: { image, text, context, provider, validation }
  imageQuality: { score, blur, sharpness, brightness, contrast, noise, resolution, needsBetterImage }
  damageSeverity: Enum[Minor, Moderate, Major, Critical, None, Unknown]
  status: Enum[COMPLETED, FAILED, CACHED, RETRIED]
  rawResponse: Mixed
  parsedResponse: Mixed
  validationErrors: [String]
  explainability: { decisionPath, detectedObjects, detectedDamage, reasoning, evidence, confidenceFactors }
  timestamps: true
}
```

---

## 12. WORKER METRICS MODEL (AI/ML)

```
WorkerMetrics {
  _id: ObjectId
  workerId: ObjectId ? User (required, unique)
  totalAssignments: Number
  totalAcceptances: Number
  totalRejections: Number
  totalCompletions: Number
  totalCancellations: Number
  totalNoShows: Number
  totalOtpFailures: Number
  avgResponseTimeMs: Number
  avgArrivalTimeMs: Number
  avgCompletionTimeMs: Number
  avgRatingOverall: Number
  avgRatingQuality: Number
  avgRatingPunctuality: Number
  avgRatingCommunication: Number
  avgRatingProfessionalism: Number
  avgRatingCleanliness: Number
  avgRatingValue: Number
  totalRatings: Number
  repeatCustomers: Number
  uniqueCustomers: Number
  uniqueCustomerIds: [ObjectId]
  totalComplaints: Number
  resolvedComplaints: Number
  successRate: Number
  acceptanceRate: Number
  completionRate: Number
  categoryBreakdown: [{ category, completions, avgRating }]
  lastJobAt: Date
  lastUpdated: Date
}
```

---

## IMMUTABLE MODELS (APPEND-ONLY)

These models have update operations blocked at Mongoose middleware level:

| Model | Why Immutable |
|-------|---------------|
| EventLog | Audit trail — must not be altered |
| DocumentHistory | Version history — must not be altered |
| WorkerGeoHistory | Geographic trail — append only |

---

## SOFT DELETE PATTERN

Models with soft delete:

| Model | Fields |
|-------|--------|
| User | isDeleted, deletedAt |
| Booking | isDeleted, deletedAt |
| Review | isDeleted, deletedAt |
| Service | isDeleted, deletedAt |

All soft-deleted models have `pre(/^find/)` middleware that adds `{ isDeleted: false }` to all queries automatically.

---

## FLUTTER DATA LAYER NOTES

1. **Dart models** should be generated with `json_serializable` or `freezed`
2. **Nullable fields** must be properly typed as `String?`, `ObjectId?` etc.
3. **Enums** should match exactly (case-sensitive in MongoDB queries)
4. **Wallet balance** is stored on the User model directly (not a separate collection)
5. **Photos** are stored as base64 strings in the DB — Flutter should use `image_picker` + base64 encoding
6. **GPS coordinates** are stored as GeoJSON Point `[longitude, latitude]` (NOT `[lat, lng]`)
