# PHASE 2: FLUTTER QUALITY ASSURANCE & TESTING BLUEPRINT
## ServeCircle Mobile — Test Matrix, Automation Framework & Exhibition Scenario

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  

---

## 1. TESTING PYRAMID ARCHITECTURE

```
                      ▲
                     / \
                    /   \     E2E / EXHIBITION SCENARIO (Multi-Device)
                   /─────\    • Laptop Admin + Phone Worker + Phone Customer
                  /       \   • Cross-platform real-time Socket synchronization
                 /─────────\
                /  WIDGET   \ INTEGRATION & WIDGET TESTS (flutter_test)
               /   TESTS     \ • Login flow, Booking flow, Map stepper, OTP modal
              /───────────────\
             /   UNIT TESTS    \ UNIT TESTS (mocktail + flutter_test)
            /                   \ • DTO serialization, SyncQueue, Deterministic OTP,
           /─────────────────────\ • Interceptors, AuthState, Repositories
```

---

## 2. UNIT TESTING SPECIFICATION

Unit tests run in isolation with zero network, disk, or device dependencies:

### 2.1 Model Serialization Tests (`test/unit/models/`)
- Verify `.fromJson()` and `.toJson()` roundtrips for:
  - `UserModel`, `BookingModel`, `ServiceModel`, `WalletAccountModel`, `ReviewModel`, `ComplaintModel`, `AIAnalysisResult`.
  - Edge cases: Null fields, missing optional timestamps, unexpected enum strings falling back to defaults.

### 2.2 Offline Sync Engine Tests (`test/unit/sync/`)
- **Queue Enqueue Test:** Verify that offline actions produce a valid `SyncOperation` with UUIDv4 and are persisted to the mock Hive box.
- **Sequential Processing Test:** Verify that operations are dispatched in strict FIFO chronological order.
- **Retry Backoff Test:** Mock an HTTP 500 failure; verify `retryCount` increments and exponential delay is applied.
- **Conflict Handling Test:** Mock an HTTP 409 Conflict; verify optimistic mutation is rolled back and an alert is emitted.

### 2.3 Business Logic & Utilities Tests (`test/unit/utils/`)
- **Deterministic OTP Algorithm:** Verify that `DeterministicOtp.generate('BK-8941-DEMO')` consistently returns `'8492'`. Verify that arbitrary booking IDs always return a valid 4-digit numeric string between `1000` and `9999`.
- **JWT Expiration Checker:** Test `isTokenExpired(token)` with valid, expired, and demo tokens.

---

## 3. WIDGET & SCREEN INTERACTION TESTS

Widget tests verify rendering, user input, and Riverpod state bindings:

| Test Case | Target Widget / Screen | Simulated User Action | Expected Output |
|---|---|---|---|
| **`TC-W01`** | `LoginScreen` | Tap "Rudra Shah (Customer)" demo card. | Session is saved; router navigates to `/customer/dashboard`. |
| **`TC-W02`** | `BookingFlowScreen` | Select date, time slot, tap "Apply Coupon" with `SUMMER50`. | Net amount updates with 50% discount; proceeds to checkout. |
| **`TC-W03`** | `LiveTrackingScreen` | Worker arrives; activeStep advances to 3. | `VerifiedOtpCard` becomes visible with start OTP code. |
| **`TC-W04`** | `WorkerJobDetailScreen` | Enter matching OTP `8492` into input sheet. | "Job Started" success checkmark displays; timer starts. |
| **`TC-W05`** | `WorkerAuthPromptScreen` | Worker with status `suspended` opens app. | Dashboard blocked; displays suspension advisory and contact support CTA. |
| **`TC-W06`** | `AISmartDiagnosisScreen` | Select sample pipe leak photo; tap Diagnose. | Renders urgency pill (High) and `AIServiceRecommendationCard` with ₹499 price. |

---

## 4. MULTI-DEVICE EXHIBITION DEMONSTRATION SCENARIO

This scenario represents the **Primary Exhibition Demonstration** for the college jury. It proves 100% end-to-end multi-role real-time parity across devices:

### Hardware Setup
- **Device 1 (Laptop / Browser):** Admin logged in at `http://localhost:5173/admin/dashboard`
- **Device 2 (Android Phone / Emulator):** Worker (Ramesh Kumar) logged in on Flutter App
- **Device 3 (Second Phone / Browser):** Customer (Rudra Shah) logged in on Flutter App

```
TIMELINE OF THE COMPLETE EXHIBITION WALKTHROUGH

[T + 00s] CUSTOMER (Phone):
          • Customer opens AI Smart Diagnosis on Flutter app.
          • Snaps photo of dripping faucet / Selects "Plumbing Leak".
          • AI returns immediate diagnostic card: "Emergency Pipe Leakage Repair" (₹499).
          • Customer taps "Book Recommended Service".
          • Selects instant emergency time slot and pays via ServeCircle Wallet.
          • Booking #BK-9021 created!

[T + 15s] WORKER (Phone):
          • Ramesh Kumar's Flutter app plays high-priority audio notification.
          • New job card pops up: "Emergency Pipe Leakage - 2.4 km away - ₹499".
          • Ramesh taps "Accept Job".
          • Job transitions to "Dispatched". Worker taps "Start Travel".

[T + 30s] ADMIN (Laptop):
          • Admin Dashboard updates in real time via Socket.io without browser reload!
          • Active Bookings counter increments by 1.
          • Order #BK-9021 displays assigned Pro: "Ramesh Kumar (Dispatched)".

[T + 45s] CUSTOMER (Phone):
          • Customer's Flutter app automatically opens Live Tracking map.
          • Worker's vehicle marker moves along polyline toward customer address.
          • Stepper shows "Pro Arriving".

[T + 60s] WORKER (Phone):
          • Worker reaches doorstep and taps "I Have Arrived".

[T + 65s] CUSTOMER (Phone):
          • Customer screen instantly triggers Step 3 ("Pro Arrived").
          • Amber card reveals Start OTP: "8492".

[T + 75s] WORKER (Phone):
          • Worker enters OTP "8492" into his Flutter app.
          • Verification passes! Status updates to "Service Started".
          • Worker snaps a "Before" photo and taps "Save".

[T + 90s] WORKER & CUSTOMER:
          • Worker completes job and snaps "After" photo.
          • Customer receives completion prompt and submits 5-star review.
          • Admin panel updates order to "Completed".
          • Worker's wallet balance increases by ₹424 (after 15% platform fee).
```

### Zero-Internet Resilience Demonstration
During the demonstration, the presenter disables WiFi on the Worker's phone:
1. Top banner displays: *"● Offline — Changes will sync automatically"*.
2. Worker marks a task completed offline.
3. WiFi is toggled back ON.
4. SyncEngine immediately syncs changes with the backend; Admin laptop reflects the completion!
