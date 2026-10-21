# 10 — MIGRATION RISKS AND KNOWN BUGS
## ServeCircle Flutter Migration — Risk Register & Bug Catalog

**Source:** Verified from App.jsx, middleware/auth.js, socket.js, DashboardNavbar.jsx, LiveTracking.jsx, server.js
**This document records FINDINGS ONLY — do NOT fix these in Phase 1.**

---

## RISK REGISTER

### RISK-01: Socket.io Implementation Gap
**Severity:** HIGH
**Category:** Realtime Features

**Finding:** The web client only connects the socket for the admin panel. Worker and customer socket rooms (`worker_{id}`, `customer_{id}`) are defined on the server but never joined from the client.

**Impact:** Worker job assignment notifications, customer live booking status updates are NOT real-time on the web. Both are currently simulated (fake animation loops in LiveTracking.jsx, polling patterns).

**Flutter Risk:** If Flutter attempts to use sockets for live tracking, it needs to implement the missing client-side connection. The server is ready — only client side is missing.

**Recommendation:** Implement full socket lifecycle management in Flutter (connect on login, join appropriate room, disconnect on logout).

---

### RISK-02: No Client-Side Auth Guards
**Severity:** HIGH
**Category:** Security

**Finding:** App.jsx has no PrivateRoute wrapper, HOC, or route guard. All 82 routes are accessible without authentication. Pages render but API calls fail with 401.

**Impact:** In Flutter, using go_router or Navigator 2.0 without guards could allow unauthorized screen access.

**Flutter Risk:** Must implement auth state management (e.g., GoRouter redirect, Riverpod watch on authState).

**Example fix for Flutter:**
```dart
// go_router redirect
redirect: (context, state) {
  final isLoggedIn = ref.read(authProvider).isAuthenticated;
  if (!isLoggedIn && state.location != '/login') return '/login';
  return null;
}
```

---

### RISK-03: Simulated Live Tracking
**Severity:** MEDIUM
**Category:** Feature Completeness

**Finding:** LiveTracking.jsx uses a hardcoded animation with:
- Predefined waypoints (Leaflet polyline)
- `requestAnimationFrame` loop to move worker marker along path
- Fake ETA countdown timer
- Mock OTP: `startOTP = '8492'`

No actual GPS data from server is consumed. The map renders the user's browser geolocation as "customer location" and offsets it by 0.03 degrees for "hub location".

**Flutter Risk:** Flutter live tracking must connect to `booking_status_update` socket events and consume real GPS coordinates from `booking.workerArrivalLocation`, `booking.workerCompletionLocation`.

---

### RISK-04: AI Provider Dependency
**Severity:** HIGH
**Category:** Infrastructure

**Finding:** AI features depend on external APIs (Google Gemini, Groq). Both require API keys in `.env`.

**Risks:**
- Rate limits (quota exceeded during peak traffic)
- API cost (per-token pricing)
- Provider outages

**Mitigation on server:** `AIProviderManager` has retry logic and local fallback.
**Flutter Risk:** Must gracefully handle AI degraded state — show "AI unavailable, browse services" message. Do NOT block non-AI features when AI is down.

---

### RISK-05: Payment System is UI-Only
**Severity:** HIGH
**Category:** Financial

**Finding:** `PaymentModal.jsx` implements:
- UPI flow: 10-second countdown then auto-success (fake)
- Card flow: validates inputs then immediately succeeds (fake)
- Wallet flow: checks hardcoded `walletBalance = 5000` (mock)

No actual payment gateway integration. No Razorpay, Stripe, or bank API connected.

**Flutter Risk:**
- P1 for production: Must integrate real payment gateway (Razorpay recommended for Indian market)
- For development/demo: Server wallet endpoints work (POST /api/wallet/topup is real)
- Flutter can use server wallet for demo, but real payment requires gateway integration

---

### RISK-06: Photo Storage as Base64
**Severity:** MEDIUM
**Category:** Performance

**Finding:** Booking before/after photos are stored as base64 strings directly in the MongoDB booking document.

**Impact:**
- Large documents bloat the database
- No CDN, no cloud storage
- Photos may not load properly on slow connections

**Flutter Risk:**
- Image upload will be large (base64 of full-res photos)
- Must compress images before upload: `flutter_image_compress`
- Must implement upload progress indicator
- Consider requesting server-side upload to Cloudinary/S3 before Flutter launch

---

### RISK-07: Worker OTP Mechanism
**Severity:** LOW-MEDIUM
**Category:** Feature Correctness

**Finding:** OTP for job start is:
- Generated server-side (4-digit, stored in Booking.otp)
- Retrieved by customer via GET /api/bookings/:id/otp
- Submitted by worker via POST /api/bookings/:id/start { otp }

**Web UX:** OTP is shown to customer; worker types it manually to start job.
**Security Note:** OTP is a plain 4-digit number, not time-based (no TOTP). Could be brute-forced.

**Flutter Risk:** Implement exactly as designed — no changes. Customer shows OTP on screen, worker enters it. Do NOT change OTP mechanism in Phase 2.

---

### RISK-08: No Refresh Token
**Severity:** MEDIUM
**Category:** Session Management

**Finding:** JWT tokens have 7-day expiry. No refresh token endpoint exists. On expiry, users must re-login manually (401 responses are not handled automatically).

**Flutter Risk:** Must implement:
- Catch 401 from any API call
- Clear stored session
- Navigate to login screen
- Show "Session expired" message

---

### RISK-09: Language Persistence
**Severity:** LOW
**Category:** User Experience

**Finding:** Language selection via LanguageToggle is not persisted. On page reload, language resets to English.

**Flutter Risk:** Store selected language in SharedPreferences. Apply on app initialization.

---

### RISK-10: Worker Status Inconsistency
**Severity:** MEDIUM
**Category:** Business Logic

**Finding:** The workerStatus field has multiple values: `pending`, `approved_senior`, `approved_junior`, `approved`, `rejected`, `suspended`, `blocked`, `expired`.

In `isWorkerAuthorized()` (verification.js):
```javascript
const BLOCKED = ['suspended', 'deleted', 'blocked', 'expired', 'rejected'];
return worker.isVerified || status.startsWith('approved_') || status === 'approved';
```

**Risk:** `pending` workers can log in but cannot do anything useful. Client should detect this and show "Application Under Review" screen.

---

## BUG CATALOG

### BUG-001: No PrivateRoute Guards
**File:** client/src/App.jsx
**Severity:** HIGH (Security)
**Description:** All routes render without auth check. API calls fail but pages load.
**Fix Required for Flutter:** Implement auth guards in navigation.

### BUG-002: Worker/Customer Socket Rooms Not Joined
**File:** client/src/components/DashboardNavbar.jsx, client/src/socket.js
**Severity:** HIGH (Feature)
**Description:** `join_worker` and `join_customer` never emitted from client. Real-time updates for workers and customers don't work via socket.
**Fix Required for Flutter:** Implement full socket room joining per role.

### BUG-003: Live Tracking Simulation
**File:** client/src/pages/customer/LiveTracking.jsx
**Severity:** MEDIUM (Feature)
**Description:** Entire tracking experience is simulated with fake animation. Hardcoded OTP '8492'.
**Fix Required for Flutter:** Connect to real booking data and socket events.

### BUG-004: Payment Not Integrated
**File:** client/src/components/PaymentModal.jsx
**Severity:** HIGH (Financial)
**Description:** All payment flows are fake simulations. No gateway SDK integrated.
**Fix Required for Flutter:** Integrate Razorpay or similar.

### BUG-005: Language Not Persisted
**File:** client/src/i18n/index.js
**Severity:** LOW (UX)
**Description:** Language preference lost on page reload.
**Fix Required for Flutter:** Persist in SharedPreferences.

### BUG-006: No JWT Expiry Handling on Client
**File:** client/src/utils/authSession.js
**Severity:** MEDIUM (UX)
**Description:** getSession() does not check token expiry. Users see 401 errors instead of a login redirect.
**Fix Required for Flutter:** Intercept 401 in Dio interceptor, clear session, redirect.

### BUG-007: Admin Cannot Self-Register
**File:** server/routes/auth.js
**Severity:** INFORMATIONAL
**Description:** Admin role registration throws 403. Admin accounts must be created directly in DB or via demo store.
**Flutter Note:** Remove "Admin" option from registration form.

### BUG-008: Wallet Balance on User Object
**File:** server/models/User.js
**Severity:** LOW (Architecture)
**Description:** walletBalance is stored directly on User document. High-frequency updates could cause document contention.
**Flutter Note:** Always fetch fresh balance from GET /api/wallet, do not cache from login response.

---

## FLUTTER-SPECIFIC RISKS

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Leaflet.js ? flutter_map or google_maps_flutter | HIGH | Choose and integrate early in Phase 2 |
| framer-motion ? Flutter Animation | MEDIUM | Plan animations per screen |
| i18next ? easy_localization | MEDIUM | Setup in Phase 2 week 1 |
| socket.io-client ? socket_io_client | MEDIUM | Test connection with dev server first |
| multer image upload ? dio MultipartRequest | LOW | Standard pattern |
| CSS Neomorphism ? Flutter BoxDecoration | LOW | Custom theme in Phase 2 |
| react-icons ? Material/Custom Icons | LOW | Map icon set early |
| Browser geolocation ? geolocator | LOW | Request permission early |
| localStorage ? flutter_secure_storage | CRITICAL | Must be done before any token storage |
