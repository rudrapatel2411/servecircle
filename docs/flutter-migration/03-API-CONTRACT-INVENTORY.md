# 03 — API CONTRACT INVENTORY
## ServeCircle Flutter Migration — Complete REST API Specification

**Base URL:** http://localhost:5000/api
**Auth Header:** Authorization: Bearer <jwt_token>
**Content-Type:** application/json (unless multipart)
**Source:** Verified from server/routes/ directory

---

## AUTH GUARD LEGEND
- PUBLIC: No auth required
- PROTECT: Bearer JWT required (any authenticated role)
- ADMIN: Admin role only
- CUSTOMER: Customer role only
- WORKER: Worker role only
- B2B: B2B or Admin role
- OPTIONAL: Token parsed if present, but not required to proceed

---

## 1. AUTHENTICATION (/api/auth)

| Method | Path | Auth | Request Body | Response |
|--------|------|------|--------------|----------|
| POST | /api/auth/register | PUBLIC | { name, email, phone, password, role, skills?, serviceCategory?, city?, experience?, companyName? } | { token, user } |
| POST | /api/auth/login | PUBLIC | { email, password } | { token, user } |
| GET | /api/auth/me | PROTECT | — | user object |
| PUT | /api/auth/profile | PROTECT | { name?, phone?, avatar?, skills?, serviceCategory?, city?, experience?, languages?, certificates? } | updated user |
| GET | /api/auth/demo/worker | PUBLIC | — | { token, user } — demo login as worker |
| GET | /api/auth/demo/customer | PUBLIC | — | { token, user } — demo login as customer |
| GET | /api/auth/demo/admin | PUBLIC | — | { token, user } — demo login as admin |
| GET | /api/auth/demo/b2b | PUBLIC | — | { token, user } — demo login as b2b |
| POST | /api/auth/change-password | PROTECT | { currentPassword, newPassword } | { message } |
| PUT | /api/auth/subscription | PROTECT | { plan } | { subscription, user } |

**User Object Shape (returned on login/register):**
```json
{
  "id": "<mongoId>",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "customer|worker|admin|b2b",
  "workerStatus": "pending|approved_senior|approved_junior|approved|rejected|suspended",
  "skills": ["Electrician", "Plumber"],
  "serviceCategory": "Home Repairs",
  "city": "string",
  "experience": "string",
  "completedJobs": 0,
  "shadowJobsDone": 0,
  "rating": 4.8,
  "subscription": "basic|silver|gold|platinum",
  "walletBalance": 0,
  "avatar": "url|empty",
  "isVerified": false,
  "companyName": "string",
  "workerIdCode": "SC-W-XXXX",
  "qrToken": "SCQR-...",
  "qrActive": true
}
```

---

## 2. BOOKINGS (/api/bookings)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/bookings | PROTECT | Query: status?, page?, limit? Returns bookings for current user role |
| GET | /api/bookings/all | ADMIN | All bookings with pagination |
| GET | /api/bookings/:id | PROTECT | Single booking with populate |
| POST | /api/bookings | CUSTOMER | Create new booking |
| PUT | /api/bookings/:id/assign | ADMIN | Assign worker to booking; body: { workerId } |
| PUT | /api/bookings/:id/accept | WORKER | Worker accepts booking |
| PUT | /api/bookings/:id/reject | WORKER | Worker rejects; body: { reason } |
| POST | /api/bookings/:id/start | WORKER | Start job; body: { otp }; validates OTP |
| POST | /api/bookings/:id/complete | WORKER | Complete job with GPS; body: { workerLat?, workerLng? } |
| POST | /api/bookings/:id/cancel | PROTECT | Cancel; body: { reason } |
| POST | /api/bookings/:id/photos | WORKER | Upload before/after photos; multipart/form-data |
| GET | /api/bookings/:id/otp | CUSTOMER | Get start OTP for booking |
| POST | /api/bookings/:id/extend | ADMIN | Extend booking |
| PUT | /api/bookings/:id/reschedule | PROTECT | body: { scheduledDate, scheduledTime } |
| POST | /api/bookings/:id/emergency-escalate | ADMIN | Escalate to emergency |

**Create Booking Request Body:**
```json
{
  "service": "Plumbing Repair",
  "serviceCategory": "Home Repairs",
  "serviceId": "<mongoId or empty>",
  "address": "string",
  "city": "string",
  "area": "string",
  "scheduledDate": "2026-10-01",
  "scheduledTime": "10:00 AM",
  "price": 350,
  "paymentMethod": "wallet|online|cash",
  "couponCode": "SAVE10",
  "isEmergency": false,
  "notes": "optional notes",
  "workerGender": "any|male|female",
  "plan": "basic|silver|gold|platinum"
}
```

**Booking Status State Machine:**
```
pending ? assigned ? accepted ? arrived ? started ? completed
                                                    ? cancelled (any state before completed)
```

**Booking Photo Upload:**
- Endpoint: POST /api/bookings/:id/photos
- Content-Type: multipart/form-data
- Fields: before[] (array of images), after[] (array of images)
- Stored as base64 in DB: booking.beforePhotos[], booking.afterPhotos[]

---

## 3. SERVICES (/api/services)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/services | PUBLIC | Query: category?, isActive?, page?, limit? |
| GET | /api/services/search | PUBLIC | Query: q= (MongoDB text search) |
| GET | /api/services/category/:category | PUBLIC | Services by category name |
| GET | /api/services/:id | PUBLIC | Single service by MongoDB ID |
| POST | /api/services | ADMIN | Create service |
| PUT | /api/services/:id | ADMIN | Update service |
| DELETE | /api/services/:id | ADMIN | Soft delete |
| PATCH | /api/services/:id/toggle | ADMIN | Toggle active status |

**Service Object Shape:**
```json
{
  "_id": "<mongoId>",
  "serviceId": "SVC-001",
  "name": "Plumbing Repair",
  "category": "Home Repairs",
  "subCategory": "Plumbing",
  "description": "string",
  "basePrice": 350,
  "estimatedDuration": 60,
  "isActive": true,
  "icon": "??",
  "image": "url",
  "tags": ["leak", "pipe"],
  "serviceRadius": 20
}
```

---

## 4. WALLET (/api/wallet)

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| GET | /api/wallet | PROTECT | — | { walletBalance, pendingEarnings, totalEarned, totalSpent } |
| GET | /api/wallet/transactions | PROTECT | — | Array of transactions |
| POST | /api/wallet/topup | CUSTOMER | { amount, paymentMethod } | Add funds |
| POST | /api/wallet/pay | CUSTOMER | { amount, bookingId, description } | Pay for service |
| POST | /api/wallet/withdraw | WORKER | { amount, bankDetails } | Worker withdrawal |

**WalletTransaction Object:**
```json
{
  "type": "topup|payment|refund|earning|withdrawal|bonus",
  "amount": 500,
  "balanceAfter": 2000,
  "description": "string",
  "reference": "bookingId or couponCode",
  "status": "pending|completed|failed",
  "paymentMethod": "UPI|card|bank",
  "createdAt": "ISO8601"
}
```

---

## 5. REVIEWS (/api/reviews)

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| GET | /api/reviews | PROTECT | — | Reviews for current user |
| GET | /api/reviews/worker/:workerId | PUBLIC | — | Worker's public reviews |
| POST | /api/reviews | CUSTOMER | { bookingId, rating, comment, ratingBreakdown? } | One review per booking |
| PUT | /api/reviews/:id | CUSTOMER | { rating?, comment? } | Edit own review |
| DELETE | /api/reviews/:id | PROTECT | — | Soft delete |
| POST | /api/reviews/:id/reply | WORKER | { reply } | Worker replies to review |

---

## 6. COMPLAINTS (/api/complaints)

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| GET | /api/complaints | PROTECT | — | Own complaints |
| GET | /api/complaints/all | ADMIN | — | All complaints |
| POST | /api/complaints | PROTECT | { bookingId?, subject, description, category, priority? } | File complaint |
| PUT | /api/complaints/:id/resolve | ADMIN | { resolution } | Resolve complaint |
| PUT | /api/complaints/:id/status | ADMIN | { status } | Update status |
| GET | /api/complaints/:id | PROTECT | — | Single complaint |

**Complaint categories:** service_quality, payment, worker_behaviour, delay, damage, fraud, other
**Complaint statuses:** open, in_progress, resolved, escalated, closed
**Complaint priorities:** low, medium, high, critical

---

## 7. NOTIFICATIONS (/api/notifications)

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| GET | /api/notifications | PROTECT | — | Notifications for current user |
| POST | /api/notifications | ADMIN | { title, message, type, targetAudience, targetUsers? } | Send notification |
| PATCH | /api/notifications/:id/read | PROTECT | — | Mark as read |
| DELETE | /api/notifications/:id | ADMIN | — | Delete notification |

**Notification types:** broadcast, personal, booking_update, promotion, alert, system
**Target audiences:** all, customers, workers, b2b, specific

---

## 8. COUPONS (/api/coupons)

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| GET | /api/coupons | PROTECT | — | Active coupons |
| GET | /api/coupons/all | ADMIN | — | All coupons |
| POST | /api/coupons/validate | PROTECT | { code, amount, category? } | Validate + calculate discount |
| POST | /api/coupons | ADMIN | { code, discountType, discountValue, minOrderAmount, validFrom, validUntil, ... } | Create coupon |
| PUT | /api/coupons/:id | ADMIN | — | Update coupon |
| DELETE | /api/coupons/:id | ADMIN | — | Delete coupon |

**Validate Response:**
```json
{
  "valid": true,
  "discountAmount": 150,
  "finalAmount": 200,
  "coupon": { "code": "SAVE50", "discountType": "percentage", "discountValue": 50 }
}
```

---

## 9. ANALYTICS (/api/analytics)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/analytics/dashboard | ADMIN | KPIs: bookings, revenue, workers, customers |
| GET | /api/analytics/bookings | ADMIN | Booking trends over time |
| GET | /api/analytics/revenue | ADMIN | Revenue by period/category |
| GET | /api/analytics/workers | ADMIN | Worker performance metrics |
| GET | /api/analytics/customers | ADMIN | Customer analytics |
| GET | /api/analytics/services | ADMIN | Service popularity |
| GET | /api/analytics/heatmap | ADMIN | Geographic demand heatmap |

---

## 10. CONTRACTS (/api/contracts) — B2B

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/contracts | B2B | Own contracts; query: status? |
| GET | /api/contracts/all | ADMIN | All contracts |
| GET | /api/contracts/:id | B2B | Single contract |
| POST | /api/contracts | B2B | Create contract |
| PUT | /api/contracts/:id | ADMIN | Update contract |
| DELETE | /api/contracts/:id | ADMIN | Delete contract |

**Contract Object:**
```json
{
  "contractId": "CON-1001",
  "partner": "<userId>",
  "partnerName": "string",
  "contractType": "monthly_cleaning|quarterly_maintenance|weekly_services|annual_package|custom",
  "services": [{ "name": "string", "frequency": "string", "pricePerUnit": 0 }],
  "locations": [{ "name": "string", "address": "string", "city": "string" }],
  "totalValue": 0,
  "startDate": "ISO8601",
  "endDate": "ISO8601",
  "status": "draft|active|renewal_due|expired|cancelled",
  "autoRenew": false
}
```

---

## 11. INVOICES (/api/invoices) — B2B

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/invoices | B2B | Own invoices; query: status? |
| GET | /api/invoices/all | ADMIN | All invoices |
| POST | /api/invoices | ADMIN | Create invoice |
| PUT | /api/invoices/:id | B2B | Update/mark paid |

**Invoice Object:**
```json
{
  "invoiceId": "INV-5001",
  "partner": "<userId>",
  "contract": "<contractId>",
  "items": [{ "description": "string", "quantity": 1, "unitPrice": 0, "total": 0 }],
  "subtotal": 0,
  "tax": 0,
  "discount": 0,
  "totalAmount": 0,
  "status": "sent|paid|overdue|cancelled",
  "paidDate": "ISO8601|null"
}
```

---

## 12. PARTNERS (/api/partners) — Admin only

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/partners | ADMIN | Query: type?, status? |
| GET | /api/partners/:id | ADMIN | Single partner |
| POST | /api/partners | ADMIN | Create partner |
| PUT | /api/partners/:id | ADMIN | Update partner |
| DELETE | /api/partners/:id | ADMIN | Delete partner |

---

## 13. WORKER VERIFICATION (/api/verify)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/verify/:workerId | OPTIONAL | Verify by workerIdCode/qrToken/mongoId |
| GET | /api/verify/status/:workerId | PUBLIC | Quick status check |
| GET | /api/booking/:id/worker-preview | OPTIONAL | Pre-verification booking preview |
| POST | /api/verify/worker | OPTIONAL | Submit QR scan; body: { qrCodeData?, workerId?, bookingId? } |
| GET | /api/admin/worker/:id/idcard | ADMIN | Get ID card data |
| POST | /api/admin/worker/:id/regenerate-qr | ADMIN | Regenerate worker QR token |
| GET | /api/admin/worker/:id/idcard-preview | ADMIN | Preview ID card specs |
| POST | /api/admin/worker/:id/toggle-qr | ADMIN | Activate/deactivate QR |

**Verify Response (authorized):**
```json
{
  "success": true,
  "isAuthorized": true,
  "name": "string",
  "workerId": "SC-W-XXXX",
  "workerIdCode": "SC-W-XXXX",
  "role": "Certified Service Professional",
  "currentStatus": "Active & Authorized",
  "verificationBadge": "Verified by ServeCircle",
  "hasActiveBooking": false,
  "profile": { ... }
}
```

---

## 14. ADMIN WORKERS (/api/admin/workers)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/admin/workers | ADMIN | All workers with filters |
| GET | /api/admin/workers/:id | ADMIN | Worker detail |
| PUT | /api/admin/workers/:id/approve | ADMIN | Approve/reject worker; body: { workerStatus, workerAdminNote? } |
| PUT | /api/admin/workers/:id/suspend | ADMIN | Suspend worker |
| GET | /api/admin/workers/:id/bookings | ADMIN | Worker booking history |

---

## 15. CUSTOMER AI CHAT (/api/ai)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /api/ai/chat | OPTIONAL (customer only if auth) | Customer AI chat (text+image) |

**Request (multipart/form-data):**
```
text: "my pipe is leaking"
image: <file> (optional, up to 20MB)
conversation: JSON string array of {role, content}
customerContext: JSON string {}
bookingContext: JSON string {}
```
OR as JSON body with base64 image:
```json
{
  "text": "my pipe is leaking",
  "image": "data:image/jpeg;base64,...",
  "conversation": [],
  "customerContext": {}
}
```

**Response:**
```json
{
  "reply": "Samajh gaya. Plumbing ke liye verified worker ready hai...",
  "showServiceRecommendation": true,
  "serviceName": "Plumbing",
  "serviceCategory": "Home Repairs",
  "servicePrice": 350,
  "serviceSkill": "Plumber",
  "serviceId": "<mongoId or empty>",
  "targetHubRoute": null,
  "followUpQuestions": [],
  "analysis": { ... }
}
```

---

## 16. AI MULTIMODAL DIAGNOSIS (/api/ai/analyze)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | /api/ai/analyze | OPTIONAL | Image analysis for service recommendation |

**Request (multipart/form-data):**
```
text: "description"
image: <file>
conversation: JSON array
bookingContext: JSON object
```

**Response:** Similar to /api/ai/chat with richer `analysis.multimodal` object.

---

## 17. AI PROVIDER MANAGEMENT (/api/ai)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/ai/health | PUBLIC | Live health probe of active AI provider |
| GET | /api/ai/status | PUBLIC | Cached health snapshot |
| GET | /api/ai/providers | ADMIN | List registered providers |
| POST | /api/ai/switch | ADMIN | Switch active provider; body: { provider } |
| POST | /api/ai/test/text | ADMIN | Test text generation; body: { prompt? } |
| POST | /api/ai/test/parse | ADMIN | Test response parser; body: { raw, requiredFields? } |

---

## 18. INTERNAL AI INFRASTRUCTURE (/api/internal/ai)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/internal/ai/models | ADMIN | List registered AI models |
| GET | /api/internal/ai/models/:name | ADMIN | Model metadata |
| GET | /api/internal/ai/models/:name/health | ADMIN | Model health |
| POST | /api/internal/ai/models/:name/predict | ADMIN | Direct prediction |
| POST | /api/internal/ai/extract-features | ADMIN | Feature extraction |
| POST | /api/internal/ai/validate-features | ADMIN | Feature validation |
| POST | /api/internal/ai/inference | ADMIN | Full inference pipeline |
| POST | /api/internal/ai/explain | ADMIN | Explainability breakdown |
| POST | /api/internal/ai/problem-analysis | ADMIN | Text problem analysis |
| GET | /api/internal/ai/analytics | ADMIN | AI usage dashboard |
| GET | /api/internal/ai/health | ADMIN | AI infrastructure health |
| GET | /api/internal/ai/history | ADMIN | AI execution history |
| GET | /api/internal/ai/cost | ADMIN | Token cost analysis |
| GET | /api/internal/ai/cache | ADMIN | SmartCache stats |
| DELETE | /api/internal/ai/cache | ADMIN | Flush SmartCache |
| GET | /api/internal/ai/providers | ADMIN | Provider registry |

---

## 19. ADMIN DATA EXPORT (/api/admin/export)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/admin/export/manifest | ADMIN | List exportable collections with counts |
| GET | /api/admin/export/:collection | ADMIN | Export collection; query: format=json|csv, limit?, skip? |

**Valid collections:** users, bookings, reviews, complaints, services, coupons, notifications, walletTransactions, contracts, invoices

---

## 20. SUBSCRIPTIONS (/api/subscriptions)

Note: Full route file not inspected but subscription endpoint exists from auth.js PUT /api/auth/subscription.
Plans: basic, silver, gold, platinum

---

## ERROR RESPONSE FORMAT (STANDARDIZED)

```json
{
  "status": "error",
  "message": "Human readable error",
  "errors": [{ "field": "email", "message": "Email is required" }]
}
```

HTTP Status codes used:
- 200 OK
- 201 Created
- 400 Bad Request (validation)
- 401 Unauthorized (no/invalid token)
- 403 Forbidden (wrong role)
- 404 Not Found
- 409 Conflict (duplicate)
- 429 Too Many Requests (AI quota)
- 500 Internal Server Error
- 503 Service Unavailable (AI/DB down)
