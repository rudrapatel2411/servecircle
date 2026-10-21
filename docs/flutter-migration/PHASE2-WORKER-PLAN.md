# PHASE 2: WORKER / PRO APPLICATION IMPLEMENTATION PLAN
## Complete Mobile-Native Specification for ServeCircle Service Professionals

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Total Worker Features:** 14 Features (9 P1, 4 P2, 1 P3)  
**Web Baseline:** Mapped from `client/src/pages/worker/` and `02-FEATURE-PARITY-MATRIX.md`  

---

## 1. WORKER STATUS GATE & AUTHENTICATION PROMPT

Workers on ServeCircle are subject to strict quality verification. The mobile app strictly enforces the verified status states via `WorkerAuthPromptScreen`:

| Worker Status Code | UI Treatment & Guard Behavior | Navigation Action |
|---|---|---|
| `approved` / `approved_senior` / `approved_junior` | Full unrestricted access to Dashboard, Jobs, Earnings, and Sockets. | Redirect to `/worker/dashboard` |
| `pending_interview` | Displays: *"Application Under Review. Your telephonic interview is scheduled within 24 hours."* | Pinned to `/worker/auth-prompt` |
| `interview_done` | Displays: *"Background check in progress. ID verification underway."* | Pinned to `/worker/auth-prompt` |
| `rejected` | Displays: *"Application Not Approved. You can re-apply after 90 days."* | Re-apply CTA or Log Out |
| `suspended` / `blocked` | Displays: *"Account Temporarily Suspended. Contact partner support."* | Support WhatsApp / Call button |
| `expired` | Displays: *"Annual Pro Certification Expired. Submit updated KYC."* | Upload KYC CTA |

---

## 2. WORKER FEATURE SPECIFICATIONS

### 2.1 Worker Dashboard
- **Screen:** `WorkerDashboardScreen`
- **Key Widgets:**
  - `DutyToggleSwitch`: "Go Online / Offline" toggle updating worker availability.
  - `TodaySummaryCard`: Completed jobs today, daily earnings (₹), and customer satisfaction rating (e.g., 4.9★).
  - `ActiveJobAlertCard`: Pulsing amber card if a job is in "Dispatched" or "Arrived" state with "Resume Job" CTA.
  - `NewJobsNotificationBanner`: Displays count of pending job requests available in worker's trade.
- **API Dependency:** `GET /api/bookings?worker=me`, `GET /api/wallet`
- **Socket Dependency:** `worker_notification`, `booking_assigned`
- **Local Cache:** Hive `bookings_box`.
- **Demo Behavior:** Loads Ramesh Kumar's profile with ₹18,400 total earnings and 48 completed jobs.

### 2.2 Job Requests & Available Jobs Pool
- **Screen:** `WorkerJobsScreen` (Tab 1: Available, Tab 2: My Jobs)
- **Key Widgets:**
  - `JobRequestCard`: Distance to customer (e.g., "2.4 km away"), service category, customer address, scheduled time, payout amount (₹).
  - `JobActionButtons`: Two prominent buttons:
    - `AcceptButton` (Green gradient): Instantly claims job.
    - `RejectButton` (Outlined red): Dismisses job with optional reason selector.
- **API Dependency:** `GET /api/bookings?status=pending`, `PUT /api/bookings/:id/accept`, `PUT /api/bookings/:id/reject`
- **Socket Dependency:** Listens to `booking_assigned` to auto-insert new requests in real time.
- **Offline / Sync:** Optimistically updates UI; enqueues mutation to `SyncQueue`.

### 2.3 Job Execution Flow (Arrival, OTP, Photos & Completion)
- **Screen:** `WorkerJobDetailScreen`
- **Workflow Steps:**
  1. **Dispatched:** Worker taps "Start Travel". Location stream activates.
  2. **Arrived at Customer Doorstep:** Worker taps "I Have Arrived". Socket emits `arrived` state; triggers Customer's OTP display.
  3. **Start Job (OTP Verification):**
     - Widget: `OtpEntryBottomSheet`: 4-digit numeric keypad input.
     - Validation: Sends `POST /api/bookings/:id/start` with `{ otp }`. In Demo mode, validates against `DeterministicOtp.generate(bookingId)`.
     - Error Handling: Displays red error shake animation if OTP is invalid.
  4. **Job In Progress & Photo Documentation:**
     - Widget: `JobPhotoCaptureWidget`: Allows worker to snap "Before" and "After" photos via camera.
     - Compression: Client compresses image to under 1MB using `flutter_image_compress`.
     - API: `POST /api/bookings/:id/photos` (Multipart).
  5. **Complete Service:**
     - Worker taps "Mark Job Completed".
     - Displays payment collection summary (Cash / Online / Wallet).
     - Submits `POST /api/bookings/:id/complete`.

### 2.4 Worker Earnings & Payout Wallet
- **Screen:** `WorkerEarningsScreen`
- **Key Widgets:**
  - `EarningsHeroCard`: Available withdrawable balance, total lifetime payout, and pending incentives.
  - `WithdrawButton`: Payout button opening bank account transfer modal.
  - `WeeklyEarningsBarChart`: Visual bar chart of earnings over the last 7 days.
  - `JobPayoutListTile`: Itemized payout per completed job with platform fee deduction breakdown.
- **API Dependency:** `GET /api/wallet`, `POST /api/wallet/withdraw`
- **Local Cache:** Hive `wallet_box`.
- **Demo Behavior:** Displays pre-seeded ₹18,400 earnings history.

### 2.5 Worker Schedule & Calendar
- **Screen:** `WorkerScheduleScreen`
- **Key Widgets:**
  - `WeeklyCalendarStrip`: Day-by-day date picker highlighting job count dots.
  - `ScheduledJobTimeline`: Chronological list of confirmed appointments with time slots and navigation directions button (`geo:` intent).
- **API Dependency:** `GET /api/bookings?worker=me`

### 2.6 Worker Training & Certification Modules
- **Screen:** `WorkerTrainingScreen`
- **Key Widgets:**
  - `TrainingModuleCard`: Course title ("Electrical Safety Protocols", "Customer Etiquette"), duration, progress bar, and "Start Video" CTA.
  - `BadgeShowcase`: Earned certification badges ("Certified Senior Electrician", "Five-Star Pro").
- **API Dependency:** `GET /api/training` or bundled static curriculum.

### 2.7 Worker Profile & Digital ID Card
- **Screen:** `WorkerProfileScreen`
- **Key Widgets:**
  - `WorkerProfileHeader`: Avatar, verified badge, rating, primary skill category, spoken languages.
  - `DigitalIDCardTile`: Opens the flip-card digital ID displaying government-issued badge, police clearance status, and verification QR code.
  - `SkillTagList`: Badges representing registered service proficiencies.
- **API Dependency:** `GET /api/auth/profile`, `PUT /api/auth/profile`
