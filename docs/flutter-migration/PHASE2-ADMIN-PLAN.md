# PHASE 2: ADMIN OPERATIONS APPLICATION IMPLEMENTATION PLAN
## Complete Mobile-Native Specification for ServeCircle Operations & Governance

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Total Admin Features:** 18 Features (8 P1, 8 P2, 2 P3)  
**Web Baseline:** Mapped from `client/src/pages/admin/` and `02-FEATURE-PARITY-MATRIX.md`  

---

## 1. ADMIN FEATURE ARCHITECTURE & SPECIFICATIONS

### 1.1 Admin Executive Dashboard
- **Screen:** `AdminDashboardScreen`
- **Key Widgets:**
  - `KPIStatsGrid`: 4 key counters:
    - Active Bookings (`GET /api/bookings/all?status=active`)
    - Pending Worker Verifications (`GET /api/admin/workers?status=pending`)
    - Unresolved Complaints (`GET /api/complaints?status=open`)
    - Total Gross Revenue (`GET /api/analytics/dashboard`)
  - `LiveActivityFeed`: Real-time stream of latest platform events (new bookings, payments, completions).
  - `QuickActionsRow`: Direct navigation buttons to "Verify Workers", "Assign Pro", "Broadcast Alert", and "Create Coupon".
- **API Dependency:** `GET /api/analytics/dashboard`
- **Socket Dependency:** `admin_room` (`admin_notification`)
- **Demo Behavior:** Pre-seeded with 14 active orders, 3 verifications, ₹2,45,000 monthly GMV.

### 1.2 All Bookings & Manual Dispatch
- **Screen:** `AdminBookingsScreen`
- **Key Widgets:**
  - `BookingFilterTabBar`: Filter by All, Pending Assignment, Ongoing, Completed, Cancelled.
  - `AdminBookingCard`: Customer name, service requested, location, assigned worker, time slot, and price.
  - `AssignWorkerBottomSheet`: Modal listing nearby available workers sorted by rating and trade suitability, with "Assign Worker" button.
- **API Dependency:** `GET /api/bookings/all`, `POST /api/bookings/:id/assign`
- **Socket Dependency:** `booking_status_changed` (live status pill updates).

### 1.3 Worker KYC Verification & Tier Approval
- **Screen:** `AdminWorkersScreen`
- **Key Widgets:**
  - `WorkerVerificationCard`: Applicant name, phone, trade category, experience, uploaded Aadhaar/PAN photo thumbnails.
  - `DocumentViewerModal`: Fullscreen inspection of identity proofs and certificates.
  - `ApprovalActionSheet`:
    - Tier selection dropdown: `approved_senior` (5★ pro), `approved_junior`, `approved_rookie`.
    - Action buttons: "Approve & Issue ID Card" (Green) or "Reject / Request Resubmission" (Red).
- **API Dependency:** `GET /api/admin/workers`, `PUT /api/admin/workers/:id/approve`
- **Socket Event Trigger:** Emits `worker_notification` to worker's phone upon approval.

### 1.4 Digital Worker ID Card & Public QR
- **Screen:** `WorkerIDCardScreen`
- **Key Widgets:**
  - `NeomorphicIDCard`: ServeCircle branded virtual identification badge featuring pro avatar, badge number, police clearance seal, and dynamic verification QR code.
  - `ShareIDButton`: Exports high-resolution PNG of the card.
- **API Dependency:** `GET /api/admin/worker/:id/idcard`

### 1.5 Complaints & Dispute Resolution
- **Screen:** `AdminComplaintsScreen`
- **Key Widgets:**
  - `ComplaintFilterChipBar`: High Priority, Medium, Resolved.
  - `ComplaintCard`: Customer name, booking reference, complaint reason (e.g., "Pro arrived late", "Incomplete repair"), and attached photo evidence.
  - `ResolutionDialog`: Input field for admin resolution notes and action options ("Issue 100% Refund", "Issue ₹200 Wallet Credit", "Close Ticket").
- **API Dependency:** `GET /api/complaints`, `PUT /api/complaints/:id/resolve`
- **Socket Dependency:** Listens to `admin_notification` for instant badge notifications on new tickets.

### 1.6 Promotional Coupon Management
- **Screen:** `AdminCouponsScreen`
- **Key Widgets:**
  - `CouponCard`: Code badge (e.g., `SUMMER50`), discount percentage/flat amount, min order value, expiry date.
  - `CreateCouponBottomSheet`: Form fields for Code, Discount Type, Value, Max Discount, Expiry Date, and Usage Limit.
  - `DeleteCouponButton`: Removes expired promotional codes.
- **API Dependency:** `GET /api/coupons`, `POST /api/coupons`, `DELETE /api/coupons/:id`

### 1.7 Platform Analytics & Revenue Reports
- **Screen:** `AdminAnalyticsScreen`
- **Key Widgets:**
  - `RevenueLineChart`: Visual graph displaying daily/weekly GMV.
  - `CategoryPieChart`: Order share per service category (AC Servicing leading at 38%).
  - `WorkerPerformanceTable`: Top earning pros and customer satisfaction ratings.
- **API Dependency:** `GET /api/analytics/*`

### 1.8 AI System Monitoring & Health
- **Screen:** Integrated tab in `AdminAnalyticsScreen`
- **Key Widgets:**
  - `AIHealthCard`: Active provider status (Groq / Gemini / Ollama / Fallback), latency in ms, and success rate.
  - `ConfidenceScoreGauge`: Average diagnosis confidence meter (e.g., 91.4%).
- **API Dependency:** `GET /api/ai/health`, `GET /api/ai/status`

### 1.9 Admin Push & In-App Notifications Broadcast
- **Screen:** `AdminNotificationsScreen`
- **Key Widgets:**
  - `BroadcastTargetDropdown`: Target audience (All Users, All Workers, Customers Only).
  - `NotificationComposer`: Title, message body, priority selector.
  - `SendBroadcastButton`: Submits broadcast to server.
- **API Dependency:** `POST /api/notifications`

### 1.10 Data Export
- **Screen:** Accessible from `AdminAnalyticsScreen`
- **Capabilities:** Triggers download of CSV or JSON dumps for Bookings, Workers, Complaints, or Revenue via `GET /api/admin/export/:collection`.
