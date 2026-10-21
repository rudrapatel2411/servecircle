# PHASE 2: 100% FUNCTIONAL PARITY ACCEPTANCE CRITERIA
## ServeCircle Mobile — Measurable Quality Standards & Feature Completion Checklist

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  

---

## 1. THE DEFINITION OF "100% PARITY"

In the ServeCircle mobile migration, a feature is **NOT complete** merely because a Flutter screen or widget exists. A feature is accepted as complete only when all nine verification dimensions pass:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       9-POINT ACCEPTANCE VERIFICATION                       │
│                                                                             │
│  [1] UI FIDELITY: Matches Neomorphism v2.0 design tokens & responsive phone │
│  [2] REMOTE API INTEGRATION: Issues valid HTTP requests via Dio             │
│  [3] BACKEND BEHAVIOR: Backend processes request and returns expected data  │
│  [4] REAL-TIME SOCKETS: Emits/receives Socket.io events where applicable    │
│  [5] REACTIVE STATE: Riverpod notifiers update UI without full page refresh │
│  [6] RESILIENT STATES: Explicit Loading, Empty, Error, and Retrying states  │
│  [7] OFFLINE TOLERANCE: Renders cached data; queues allowed offline writes  │
│  [8] DEMO RESILIENCE: Functions with pre-seeded fixtures if offline/demo    │
│  [9] SECURITY & GUARDS: Enforces role permissions and worker status gates   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DETAILED ACCEPTANCE CHECKLIST BY MODULE

### 2.1 Authentication & Role Security
- [ ] User can log in with valid credentials via `POST /api/auth/login`.
- [ ] Login screen renders 4 Quick Demo Access cards (Customer, Worker, Admin, B2B) that instantiate demo sessions in 1 tap.
- [ ] Session restoration: App cold boot automatically restores session from disk without prompting login.
- [ ] JWT expiration handling: Expired tokens trigger session cleanup and redirect to `/login?expired=true`.
- [ ] Unauthorized (401) interception: Server 401 response invalidates local session and alerts user.
- [ ] Role protection: Customer cannot navigate to `/worker/*`, `/admin/*`, or `/b2b/*` (and vice-versa).
- [ ] Worker status gate: Non-approved workers (`pending`, `suspended`) are locked to `WorkerAuthPromptScreen`.

### 2.2 Customer Experience
- [ ] Dashboard displays active in-progress booking card with live status stepper.
- [ ] Service catalog renders all 14 dynamic category hubs with subcategory chips.
- [ ] AI Smart Diagnosis: Camera capture compresses photo to <1MB and sends `POST /api/ai/analyze`.
- [ ] AI Diagnosis returns problem description, urgency meter, and actionable `AIServiceRecommendationCard`.
- [ ] AI Chat supports real-time multi-turn conversation in English, Hindi, and Gujarati.
- [ ] Booking flow allows date selection, time slot picking, address selection, and promo code validation.
- [ ] Payment modal supports ServeCircle Wallet, simulated UPI, and card checkout.
- [ ] Live Tracking map displays customer location, worker location, and polyline route.
- [ ] Live Tracking displays 4-digit start OTP once worker reaches doorstep (Step 3).
- [ ] QR Verification: Scanning worker ID card QR code pulls public verification profile.
- [ ] Customer Wallet: Authoritative balance fetched from `GET /api/wallet`; top-up modal updates balance.
- [ ] Post-Service Review: Customer submits 1-5 star rating and comment; updates worker metrics.

### 2.3 Worker / Pro Experience
- [ ] Duty toggle allows worker to switch between Online and Offline availability.
- [ ] Available jobs pool displays real-time job requests with payout and distance.
- [ ] Worker can Accept or Reject a job; state updates optimistically.
- [ ] Worker arrival action notifies customer and updates live stepper via Socket.io.
- [ ] Start job requires entering customer's 4-digit OTP; validates against backend or deterministic algorithm.
- [ ] Worker can capture and upload "Before" and "After" job photos via camera.
- [ ] Complete job updates order to `completed` and credits worker earnings wallet.
- [ ] Earnings screen displays weekly breakdown chart and bank payout withdrawal modal.

### 2.4 Admin Operations
- [ ] Dashboard displays live KPI counters: Active Bookings, Pending KYC, Open Complaints, Gross Revenue.
- [ ] Bookings screen lists all platform bookings with manual worker dispatch bottom sheet.
- [ ] Worker KYC verification allows full-screen document inspection and tier assignment (`approved_senior`, etc.).
- [ ] Digital Worker ID card renders pro credentials with verifiable dynamic QR code.
- [ ] Complaints screen allows admin to review dispute details and issue refunds or wallet credits.
- [ ] Promotional coupons can be created, listed, and deleted.
- [ ] AI system health tab displays provider latency (ms) and diagnosis confidence meters.

### 2.5 B2B Client Portal
- [ ] Dashboard displays active enterprise facility contracts, pending invoices, and managed locations.
- [ ] Partner can book bulk maintenance visits across multiple branch locations.
- [ ] Contracts screen lists SLAs, monthly retainer costs, and renewal dates.
- [ ] Locations screen allows corporate facility managers to add/remove branch addresses.
- [ ] Invoices screen lists monthly billing statements with simulated PDF download and payment status.

### 2.6 Real-Time Sockets & Cross-Device Sync
- [ ] Admin joins `admin_room` and receives `admin_notification` when complaints or KYCs are filed.
- [ ] Worker joins `worker_<id>` and receives `booking_assigned` audio chime when jobs are dispatched.
- [ ] Customer joins `customer_<id>` and receives `booking_status_changed` stepper updates.
- [ ] Reconnecting to network automatically re-subscribes to the appropriate role room.
- [ ] Zero duplicate listener events when switching screens or navigating back.

### 2.7 Offline-First & Exhibition Demo Resilience
- [ ] App launches and operates smoothly with phone in Airplane Mode (Zero WiFi / Cellular).
- [ ] All 14 service hubs and active bookings render immediately from local Hive cache.
- [ ] Allowed offline mutations (reviews, status updates, read notifications) are queued in `sync_queue_box`.
- [ ] Re-enabling WiFi triggers `SyncEngine` to flush queued operations in FIFO order with server reconciliation.
- [ ] Global Demo Mode toggle activates standalone fixtures with zero network dependency.
- [ ] Header badge transparently displays data source: `● Live Backend` vs `○ Demo Simulation`.
