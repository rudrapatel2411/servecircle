# PHASE 2: PHASE 3 IMPLEMENTATION ROADMAP & DEPENDENCY ORDER
## ServeCircle Mobile — Sequential, Dependency-Aware Execution Pipeline

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  

---

## 1. IMPLEMENTATION PRINCIPLES

Phase 3 execution must strictly follow a **bottom-up dependency graph**. No UI screen should be created before its underlying repository and models exist; no repository should be created before its network client and storage boxes are initialized.

```
Foundations (Core, Storage, Network)
  └──► Domain Models & Repositories
        └──► State Notifiers & Session Restoration
              └──► Routing & Shell Navigation
                    └──► Role Features (Customer ──► Worker ──► Admin ──► B2B)
                          └──► Real-Time Sockets & Sync Engine
                                └──► Exhibition Polish & Verification
```

---

## 2. ORDERED STAGES (STAGES 1 TO 25)

### Stage 1: Flutter Project Initialization & Pubspec Dependencies
- Initialize Flutter project with Android package `com.servecircle.app`.
- Populate `pubspec.yaml` with the audited package roster (`flutter_riverpod`, `go_router`, `dio`, `socket_io_client`, `hive`, `flutter_secure_storage`, etc.).
- Configure Android `AndroidManifest.xml` (Permissions: Internet, Camera, Location, Storage).

### Stage 2: Core Design System & Neomorphism Tokens
- Implement `AppColors` (Classic Blue `#2960A0`, Saffron `#F59E0B`, Navy `#0F172A`).
- Implement `AppTypography` with Google Fonts (`Plus Jakarta Sans`, `Outfit`).
- Implement `AppShadows`, `AppSpacing`, and `ThemeData` light configuration.

### Stage 3: Core Storage & Keystore Initialization
- Implement `SecureStorageService` for encrypted JWT storage.
- Initialize `Hive` in `main.dart` and register Hive boxes (`auth_box`, `services_box`, `bookings_box`, `wallet_box`, `notifications_box`, `sync_queue_box`).

### Stage 4: Core Network Client & Dio Interceptors
- Implement `DioClient` with base configuration (`http://localhost:5000/api`).
- Implement `AuthInterceptor` (JWT bearer injection & 401 session-expired broadcast).
- Implement `LoggingInterceptor` and `RetryInterceptor`.

### Stage 5: Domain Models & Auth DTOs
- Create JSON-serializable Dart models: `UserModel`, `AuthResponse`, `RegisterRequest`, `LoginRequest`.
- Implement `AuthRepository` (connects to `/api/auth/*` with demo login fallback).

### Stage 6: Riverpod Authentication & Session Restoration
- Implement `AuthController` (`AsyncNotifier<AuthState>`).
- Add cold boot session restoration: decodes JWT expiration claim; invalidates expired sessions.

### Stage 7: GoRouter & Role Redirection Guards
- Configure `GoRouter` with `redirect` callback enforcing role boundaries.
- Register public routes (`/login`, `/register`, `/worker/register`, `/verify/worker/:id`).
- Set up root navigation shell.

### Stage 8: Shared UI Component Library
- Implement `AppPrimaryButton`, `AppSecondaryButton`, `NeomorphicCard`.
- Implement `AppTextField`, `AppSearchBar`, `AppLoadingIndicator`, `AppErrorWidget`.
- Implement `OfflineBanner` and top header `AppNavBar`.

### Stage 9: Socket.io Client Manager & Role Rooms
- Implement singleton `SocketManager` (`socket_io_client`).
- Implement automatic room joins on connect: `join_admin`, `join_worker`, `join_customer`.
- Connect typed event streams: `booking_status_changed`, `admin_notification`, `worker_notification`.

### Stage 10: Offline Sync Engine & Mutation Queue
- Implement `SyncOperation` model and Hive `sync_queue_box`.
- Implement `SyncEngine`: monitors `connectivity_plus`, dispatches FIFO queued mutations on reconnect.

### Stage 11: Exhibition Demo Fixture Providers
- Port server demo fixtures (`demoDataStore.js`) to Dart: `DemoBookingFixtures`, `DemoServiceFixtures`, `DemoWalletFixtures`.
- Implement `DeterministicOtp` algorithm.

### Stage 12: Customer Foundation (Dashboard & Category Hubs)
- Implement `CustomerRepository` (`GET /api/bookings/my`, `GET /api/services`).
- Implement `CustomerDashboardScreen` with hero carousel, active booking card, and category grid.
- Implement `BrowseServicesScreen` and parametric `ServiceHubScreen` supporting all 14 hubs.

### Stage 13: Customer AI Smart Diagnosis & Conversational Assistant
- Implement `AIRepository` (`POST /api/ai/analyze`, `POST /api/ai/chat`).
- Implement `AISmartDiagnosisScreen` (Camera capture, image compression, urgency badge, recommendation card).
- Implement `AIChatScreen` (Multilingual chat stream, inline booking CTA, demo fallback).

### Stage 14: Customer Booking Flow & Multi-Step Checkout
- Implement `BookingFlowScreen` (Date strip, time slots, address selector, promo coupon validation).
- Implement `PaymentModal` bottom sheet (Wallet payment, simulated UPI/Card).

### Stage 15: Customer Live GPS Tracking & Arrival OTP
- Implement `LiveTrackingScreen` with `flutter_map` Leaflet tile map.
- Implement animated worker marker along polyline coordinates.
- Implement 4-step status stepper and OTP reveal card upon arrival.

### Stage 16: Worker QR Verification & Public Verification
- Implement `WorkerVerificationScreen` using `mobile_scanner`.
- Implement verification profile display (Police clearance, ratings, verified pro badge).

### Stage 17: Customer Reviews, Wallet & Subscriptions
- Implement `CustomerWalletScreen` (Authoritative balance, top-up modal, transaction list).
- Implement `PostServiceReviewScreen` (Star rating, feedback tags).
- Implement `CustomerSubscriptionsScreen`.

### Stage 18: Worker Foundation & Status Gate
- Implement `WorkerAuthPromptScreen` handling pending, interview, suspended, and approved statuses.
- Implement `WorkerRepository` (`GET /api/bookings?worker=me`, `GET /api/bookings?status=pending`).
- Implement `WorkerDashboardScreen` (Duty toggle, today's metrics, active job alert).

### Stage 19: Worker Job Pool & Actions
- Implement `WorkerJobsScreen` (Available jobs list with Accept/Reject actions).
- Optimistic UI updates with offline queue backup.

### Stage 20: Worker Job Execution Lifecycle
- Implement `WorkerJobDetailScreen`.
- Connect arrival action, OTP entry sheet, before/after camera photo uploads, and completion action.

### Stage 21: Worker Earnings, Schedule & Training
- Implement `WorkerEarningsScreen` (Weekly bar chart, payout history, withdrawal modal).
- Implement `WorkerScheduleScreen` (Calendar timeline).
- Implement `WorkerTrainingScreen`.

### Stage 22: Admin Dashboard, Dispatch & Worker KYC
- Implement `AdminRepository` (`GET /api/analytics/dashboard`, `GET /api/admin/workers`).
- Implement `AdminDashboardScreen` with real-time KPI cards.
- Implement `AdminBookingsScreen` with manual worker assignment sheet.
- Implement `AdminWorkersScreen` (KYC document inspection, tier approval).
- Implement `WorkerIDCardScreen` (Digital ID with QR code).

### Stage 23: Admin Complaints, Coupons, Analytics & AI Health
- Implement `AdminComplaintsScreen` with dispute resolution modal.
- Implement `AdminCouponsScreen` (Create/delete promo codes).
- Implement `AdminAnalyticsScreen` (Revenue graphs, AI system health and latency meters).
- Implement `AdminNotificationsScreen` (Broadcast push composer).

### Stage 24: B2B Client Portal (Corporate Facilities)
- Implement `B2BRepository` (Contracts, Invoices, Locations, Team).
- Implement `B2BDashboardScreen`, `B2BContractsScreen`, `B2BInvoicesScreen`, `B2BLocationsScreen`, `B2BTeamScreen`.

### Stage 25: Multi-Device Exhibition Verification & Polish
- Execute the complete end-to-end multi-device exhibition test (Laptop Admin + Phone Worker + Phone Customer).
- Validate zero-internet demo mode and offline sync reconciliation.
- Verify 100% parity acceptance checklist.
