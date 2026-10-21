# PHASE 2: PHASE 3 EXECUTION HANDOFF SPECIFICATION
## ServeCircle Mobile — Granular, Task-by-Task Implementation Blueprint

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Execution Target:** Phase 3 Implementation  

---

## 1. PHASE 3 TASK ROSTER & SPECIFICATIONS

Every task below contains complete architectural specifications enabling Phase 3 to execute sequentially without guesswork:

---

### Task `T-01`: Core Infrastructure & App Bootstrap
- **Feature:** Project setup, Design Tokens & Foundational DI.
- **Files to Create:**
  - `lib/main.dart`
  - `lib/app.dart`
  - `lib/core/config/app_config.dart`
  - `lib/core/theme/app_colors.dart`
  - `lib/core/theme/app_typography.dart`
  - `lib/core/theme/app_shadows.dart`
  - `lib/core/theme/app_theme.dart`
- **Dependencies:** `flutter_riverpod`, `google_fonts`, `lucide_icons_flutter`.
- **Acceptance Criteria:** App compiles and renders an empty scaffold with `AppColors.primary600` theme and `Plus Jakarta Sans` typography.

---

### Task `T-02`: Storage & Keystore Initialization
- **Feature:** Hive Box initialization & Android Keystore integration.
- **Files to Create:**
  - `lib/core/storage/hive_boxes.dart`
  - `lib/core/storage/hive_service.dart`
  - `lib/core/storage/secure_storage_service.dart`
- **Dependencies:** `hive`, `hive_flutter`, `flutter_secure_storage`.
- **Local Storage:** Registers boxes: `auth_box`, `services_box`, `bookings_box`, `wallet_box`, `notifications_box`, `sync_queue_box`.
- **Acceptance Criteria:** App initializes Hive without errors on Android cold boot; successfully writes/reads encrypted key-value pairs from Keystore.

---

### Task `T-03`: Network Client & Interceptor Architecture
- **Feature:** Centralized Dio network engine with automatic auth & logging.
- **Files to Create:**
  - `lib/core/network/api_endpoints.dart`
  - `lib/core/network/dio_client.dart`
  - `lib/core/network/error_handler.dart`
  - `lib/core/network/interceptors/auth_interceptor.dart`
  - `lib/core/network/interceptors/logging_interceptor.dart`
  - `lib/core/network/interceptors/retry_interceptor.dart`
- **Dependencies:** `dio`.
- **API Target:** `http://localhost:5000/api` base URL.
- **Acceptance Criteria:** Requests inject `Authorization: Bearer <token>`; 401 status triggers session-expired event; idempotent GET failures retry up to 3 times.

---

### Task `T-04`: Authentication Models, Repository & Riverpod Session
- **Feature:** User DTOs, Login/Register API, JWT expiration decoding, and session restoration.
- **Files to Create:**
  - `lib/features/auth/data/models/user_model.dart`
  - `lib/features/auth/data/models/auth_response.dart`
  - `lib/features/auth/data/auth_repository.dart`
  - `lib/features/auth/presentation/controllers/auth_controller.dart`
- **Dependencies:** `T-02`, `T-03`.
- **API Target:** `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `GET /api/auth/demo/*`.
- **Offline / Demo:** When offline, demo login endpoints fall back to `demoAuthStore` fixture objects.
- **Acceptance Criteria:** Cold start restores valid stored session; expired tokens are purged; unit tests for `isTokenExpired()` pass.

---

### Task `T-05`: GoRouter & Role-Based Navigation Guards
- **Feature:** Declarative routing engine enforcing role isolation.
- **Files to Create:**
  - `lib/core/routing/app_router.dart`
  - `lib/core/routing/route_names.dart`
  - `lib/core/routing/route_guards.dart`
- **Dependencies:** `T-04`, `go_router`.
- **Acceptance Criteria:** Unauthenticated users cannot visit `/customer/*` or `/worker/*`; Customers cannot view Worker/Admin routes; Worker status gate redirects pending/suspended workers to `/worker/auth-prompt`.

---

### Task `T-06`: Shared UI Design System Components
- **Feature:** Production Neomorphism v2.0 reusable widget library.
- **Files to Create:**
  - `lib/core/shared_widgets/buttons/app_primary_button.dart`
  - `lib/core/shared_widgets/buttons/app_secondary_button.dart`
  - `lib/core/shared_widgets/cards/neomorphic_card.dart`
  - `lib/core/shared_widgets/inputs/app_text_field.dart`
  - `lib/core/shared_widgets/inputs/app_search_bar.dart`
  - `lib/core/shared_widgets/feedback/app_loading_indicator.dart`
  - `lib/core/shared_widgets/feedback/app_error_widget.dart`
  - `lib/core/shared_widgets/feedback/offline_banner.dart`
  - `lib/core/shared_widgets/navigation/app_nav_bar.dart`
- **Dependencies:** `T-01`.
- **Acceptance Criteria:** Components strictly render `AppColors` and `AppShadows`; buttons handle disabled and loading states with inline spinners.

---

### Task `T-07`: Socket.io Real-Time Manager & Role Rooms
- **Feature:** Singleton WebSocket client handling room subscriptions and typed streams.
- **Files to Create:**
  - `lib/core/socket/socket_constants.dart`
  - `lib/core/socket/socket_manager.dart`
  - `lib/core/socket/socket_state.dart`
- **Dependencies:** `socket_io_client`, `T-04`.
- **Socket Target:** `join_admin`, `join_worker`, `join_customer`, `booking_status_changed`, `admin_notification`, `worker_notification`.
- **Acceptance Criteria:** Socket automatically connects on session ready; emits role join event; re-emits on reconnect; exposes typed Dart streams.

---

### Task `T-08`: Offline Sync Engine & Mutation Queue
- **Feature:** Background queue processor for offline operations.
- **Files to Create:**
  - `lib/core/sync/sync_operation.dart`
  - `lib/core/sync/sync_engine.dart`
  - `lib/core/sync/sync_status_provider.dart`
- **Dependencies:** `connectivity_plus`, `uuid`, `T-02`, `T-03`.
- **Acceptance Criteria:** Mutations queued while offline are persistently saved to Hive; flushed sequentially in FIFO order when connectivity is restored; retries on 500 error up to 5 times.

---

### Task `T-09`: Exhibition Demo Fixture Providers & Deterministic OTP
- **Feature:** In-memory demo data store & predictable OTP generator.
- **Files to Create:**
  - `lib/features/demo/data/demo_auth_fixtures.dart`
  - `lib/features/demo/data/demo_booking_fixtures.dart`
  - `lib/features/demo/data/demo_service_fixtures.dart`
  - `lib/features/demo/data/demo_wallet_fixtures.dart`
  - `lib/features/demo/data/demo_tracking_fixtures.dart`
  - `lib/features/demo/controllers/demo_mode_controller.dart`
  - `lib/core/utils/deterministic_otp.dart`
- **Acceptance Criteria:** `DeterministicOtp.generate('BK-8941-DEMO')` returns `'8492'`; fixtures match `demoDataStore.js` schema 1:1.

---

### Task `T-10`: Authentication UI & Quick Demo Access
- **Feature:** Login, Register, and Worker Register screens.
- **Files to Create:**
  - `lib/features/auth/presentation/screens/login_screen.dart`
  - `lib/features/auth/presentation/screens/register_screen.dart`
  - `lib/features/auth/presentation/screens/worker_register_screen.dart`
  - `lib/features/auth/presentation/widgets/quick_demo_selector.dart`
- **Dependencies:** `T-04`, `T-05`, `T-06`, `T-09`.
- **Acceptance Criteria:** Login validates inputs; tapping quick demo cards (Customer Rudra, Worker Ramesh, Admin, B2B) logs in instantly with pre-seeded credentials.

---

### Task `T-11`: Customer Foundation & 14 Dynamic Category Hubs
- **Feature:** Customer Dashboard, Service Catalog, and parametric Hub screen.
- **Files to Create:**
  - `lib/features/customer/data/customer_repository.dart`
  - `lib/features/customer/data/models/service_model.dart`
  - `lib/features/customer/data/models/booking_model.dart`
  - `lib/features/customer/presentation/controllers/customer_dashboard_controller.dart`
  - `lib/features/customer/presentation/screens/customer_dashboard_screen.dart`
  - `lib/features/customer/presentation/screens/browse_services_screen.dart`
  - `lib/features/customer/presentation/screens/service_hub_screen.dart`
  - `lib/features/customer/presentation/screens/service_detail_screen.dart`
  - `lib/features/customer/presentation/widgets/service_card.dart`
- **Dependencies:** `T-06`, `T-07`, `T-09`.
- **API Target:** `GET /api/bookings/my`, `GET /api/services`, `GET /api/services/category/:cat`.
- **Acceptance Criteria:** Renders active booking card; category hub renders 14 hubs dynamically with offline cache; search bar filters catalog in real time.

---

### Task `T-12`: Customer AI Smart Diagnosis & Conversational Assistant
- **Feature:** Multimodal camera diagnosis, image compression, and AI chat.
- **Files to Create:**
  - `lib/features/ai/data/ai_repository.dart`
  - `lib/features/ai/data/models/ai_diagnosis_result.dart`
  - `lib/features/ai/data/models/ai_chat_message.dart`
  - `lib/features/ai/presentation/controllers/ai_diagnosis_controller.dart`
  - `lib/features/ai/presentation/controllers/ai_chat_controller.dart`
  - `lib/features/ai/presentation/screens/ai_smart_diagnosis_screen.dart`
  - `lib/features/ai/presentation/screens/ai_chat_screen.dart`
  - `lib/features/ai/presentation/widgets/ai_service_recommendation_card.dart`
  - `lib/core/utils/image_compressor.dart`
- **Dependencies:** `image_picker`, `flutter_image_compress`, `T-03`, `T-09`.
- **API Target:** `POST /api/ai/analyze`, `POST /api/ai/chat`.
- **Offline / Demo:** Falls back to `DemoAIProvider` if offline or AI provider down.
- **Acceptance Criteria:** Image compressed to <1MB; diagnosis returns urgency badge and recommendation card; "Book Now" CTA links directly to booking flow.

---

### Task `T-13`: Customer Booking Flow & Multi-Step Checkout
- **Feature:** Slot selection, address picker, coupon validation, and wallet payment.
- **Files to Create:**
  - `lib/features/customer/presentation/controllers/booking_flow_controller.dart`
  - `lib/features/customer/presentation/screens/booking_flow_screen.dart`
  - `lib/features/customer/presentation/screens/payment_modal_screen.dart`
- **Dependencies:** `T-11`, `T-06`.
- **API Target:** `POST /api/bookings`, `POST /api/coupons/validate`, `POST /api/wallet/pay`.
- **Acceptance Criteria:** Customer can pick date/time; validate coupon; pay via wallet or simulated UPI; booking confirmed and navigates to tracking.

---

### Task `T-14`: Live GPS Tracking & Arrival OTP Stepper
- **Feature:** Leaflet map with worker vehicle marker, polyline route, status stepper, and OTP.
- **Files to Create:**
  - `lib/features/customer/presentation/controllers/live_tracking_controller.dart`
  - `lib/features/customer/presentation/screens/live_tracking_screen.dart`
  - `lib/features/customer/presentation/widgets/live_map_view.dart`
  - `lib/features/customer/presentation/widgets/booking_status_stepper.dart`
  - `lib/features/customer/presentation/widgets/otp_display_card.dart`
- **Dependencies:** `flutter_map`, `latlong2`, `T-07`, `T-09`.
- **Socket Target:** `booking_status_changed`, `worker_location_update`.
- **Acceptance Criteria:** Stepper advances upon socket events; marker animates along coordinates; arrival reveals 4-digit start OTP with clear verified/demo badge.

---

### Task `T-15`: Worker Verification Scanner & Public Profile
- **Feature:** Embedded QR camera scanner and pro verification profile.
- **Files to Create:**
  - `lib/features/customer/presentation/screens/worker_verification_screen.dart`
- **Dependencies:** `mobile_scanner`, `T-03`.
- **API Target:** `GET /api/verify/:workerId`.
- **Acceptance Criteria:** Scanning QR code immediately pulls worker verification profile with police clearance and skills badges.

---

### Task `T-16`: Customer Wallet, Reviews, Complaints & Subscriptions
- **Feature:** Authoritative wallet balance, top-up modal, review submission, and complaints.
- **Files to Create:**
  - `lib/features/customer/presentation/controllers/customer_wallet_controller.dart`
  - `lib/features/customer/presentation/screens/customer_wallet_screen.dart`
  - `lib/features/customer/presentation/screens/post_service_review_screen.dart`
  - `lib/features/customer/presentation/screens/customer_reviews_screen.dart`
  - `lib/features/customer/presentation/screens/customer_subscriptions_screen.dart`
  - `lib/features/customer/presentation/screens/emergency_hub_screen.dart`
- **Dependencies:** `T-08`, `T-11`.
- **API Target:** `GET/POST /api/wallet`, `POST /api/reviews`, `POST /api/complaints`.
- **Acceptance Criteria:** Wallet displays live/demo badge; review submission enqueues to `SyncQueue` if offline; emergency SOS dispatches instant 15-min booking.

---

### Task `T-17`: Worker Foundation & Status Gate Prompt
- **Feature:** Worker Dashboard, duty toggle, metrics summary, and approval status gate.
- **Files to Create:**
  - `lib/features/worker/data/worker_repository.dart`
  - `lib/features/worker/data/models/worker_job_model.dart`
  - `lib/features/worker/presentation/controllers/worker_dashboard_controller.dart`
  - `lib/features/worker/presentation/screens/worker_dashboard_screen.dart`
  - `lib/features/worker/presentation/screens/worker_auth_prompt_screen.dart`
- **Dependencies:** `T-04`, `T-05`, `T-07`.
- **Acceptance Criteria:** Non-approved workers locked to prompt screen; approved workers see duty toggle and daily metrics.

---

### Task `T-18`: Worker Jobs Pool & Accept/Reject Lifecycle
- **Feature:** Available jobs feed, real-time assignment notifications, and accept/reject.
- **Files to Create:**
  - `lib/features/worker/presentation/controllers/worker_jobs_controller.dart`
  - `lib/features/worker/presentation/screens/worker_jobs_screen.dart`
  - `lib/features/worker/presentation/widgets/job_action_card.dart`
- **Dependencies:** `T-07`, `T-08`, `T-17`.
- **API Target:** `GET /api/bookings?status=pending`, `PUT /api/bookings/:id/accept`, `PUT /api/bookings/:id/reject`.
- **Socket Target:** `booking_assigned`, `worker_notification`.
- **Acceptance Criteria:** New jobs appear in real-time with sound alert; Accept claims job and transitions to travel state; offline actions enqueued.

---

### Task `T-19`: Worker Job Execution (Arrival, OTP, Photos & Completion)
- **Feature:** Job detail view with arrival alert, OTP validation keypad, photo uploads, and completion.
- **Files to Create:**
  - `lib/features/worker/presentation/screens/worker_job_detail_screen.dart`
  - `lib/features/worker/presentation/widgets/otp_input_sheet.dart`
  - `lib/features/worker/presentation/widgets/photo_upload_preview.dart`
- **Dependencies:** `image_picker`, `flutter_image_compress`, `T-09`, `T-18`.
- **API Target:** `POST /api/bookings/:id/start`, `POST /api/bookings/:id/photos`, `POST /api/bookings/:id/complete`.
- **Acceptance Criteria:** Arrival triggers socket event; OTP validation allows job start; photos upload via multipart; completion credits worker wallet.

---

### Task `T-20`: Worker Earnings, Schedule & Training
- **Feature:** Weekly earnings chart, bank payouts, schedule timeline, and certification courses.
- **Files to Create:**
  - `lib/features/worker/presentation/screens/worker_earnings_screen.dart`
  - `lib/features/worker/presentation/screens/worker_schedule_screen.dart`
  - `lib/features/worker/presentation/screens/worker_training_screen.dart`
  - `lib/features/worker/presentation/screens/worker_profile_screen.dart`
- **Dependencies:** `T-17`.
- **API Target:** `GET /api/wallet`, `POST /api/wallet/withdraw`, `GET /api/training`.
- **Acceptance Criteria:** Weekly earnings chart renders breakdown; schedule lists confirmed appointments; training modules display progress bars.

---

### Task `T-21`: Admin Dashboard, Bookings Dispatch & Worker Verification
- **Feature:** Admin KPI cards, all bookings view with manual dispatch, and KYC approval queue.
- **Files to Create:**
  - `lib/features/admin/data/admin_repository.dart`
  - `lib/features/admin/presentation/controllers/admin_dashboard_controller.dart`
  - `lib/features/admin/presentation/screens/admin_dashboard_screen.dart`
  - `lib/features/admin/presentation/screens/admin_bookings_screen.dart`
  - `lib/features/admin/presentation/screens/admin_workers_screen.dart`
  - `lib/features/admin/presentation/screens/worker_id_card_screen.dart`
- **Dependencies:** `T-06`, `T-07`.
- **API Target:** `GET /api/analytics/dashboard`, `GET /api/bookings/all`, `POST /api/bookings/:id/assign`, `GET/PUT /api/admin/workers`.
- **Socket Target:** `admin_room` (`admin_notification`).
- **Acceptance Criteria:** Dashboard updates live on new events; admin can assign workers; KYC modal allows tier approval (`approved_senior`, etc.) and generates digital ID card.

---

### Task `T-22`: Admin Complaints, Coupons, Analytics & AI Monitoring
- **Feature:** Dispute resolution, promotional coupon management, revenue charts, and AI health check.
- **Files to Create:**
  - `lib/features/admin/presentation/screens/admin_complaints_screen.dart`
  - `lib/features/admin/presentation/screens/admin_coupons_screen.dart`
  - `lib/features/admin/presentation/screens/admin_analytics_screen.dart`
  - `lib/features/admin/presentation/screens/admin_notifications_screen.dart`
- **Dependencies:** `T-21`.
- **API Target:** `GET/PUT /api/complaints`, `CRUD /api/coupons`, `GET /api/ai/health`, `GET /api/admin/export/:collection`.
- **Acceptance Criteria:** Complaints can be resolved with refund/credit; coupons can be created/deleted; AI health displays latency in ms; data can be exported to CSV.

---

### Task `T-23`: B2B Client Portal (Corporate Facilities)
- **Feature:** Corporate dashboard, bulk booking, contracts management, multi-branch locations, team staff, and invoices.
- **Files to Create:**
  - `lib/features/b2b/data/b2b_repository.dart`
  - `lib/features/b2b/presentation/controllers/b2b_dashboard_controller.dart`
  - `lib/features/b2b/presentation/screens/b2b_dashboard_screen.dart`
  - `lib/features/b2b/presentation/screens/b2b_services_screen.dart`
  - `lib/features/b2b/presentation/screens/b2b_contracts_screen.dart`
  - `lib/features/b2b/presentation/screens/b2b_contract_detail_screen.dart`
  - `lib/features/b2b/presentation/screens/b2b_locations_screen.dart`
  - `lib/features/b2b/presentation/screens/b2b_team_screen.dart`
  - `lib/features/b2b/presentation/screens/b2b_invoices_screen.dart`
  - `lib/features/b2b/presentation/screens/b2b_history_screen.dart`
  - `lib/features/b2b/presentation/screens/b2b_support_screen.dart`
- **Dependencies:** `T-04`, `T-06`.
- **API Target:** `GET/POST /api/contracts`, `GET/PUT /api/invoices`, `CRUD /api/locations`, `CRUD /api/team`.
- **Acceptance Criteria:** Corporate dashboard displays active agreements; locations can be added; invoices show payment status; support tickets escalate via SLA flag.

---

### Task `T-24`: Multi-Device Exhibition Verification & Polish
- **Feature:** End-to-end integration across Laptop Web Admin + Android Phone Worker + Android Phone Customer.
- **Files to Create:**
  - `test/integration/exhibition_scenario_test.dart`
  - `docs/flutter-migration/PHASE3-VERIFICATION-RESULTS.md`
- **Dependencies:** All previous tasks (`T-01` to `T-23`).
- **Acceptance Criteria:** Complete walkthrough executed: Customer diagnoses & books -> Worker receives & accepts -> Admin observes real-time dispatch -> Worker arrives & verifies OTP -> Worker completes job & uploads photos -> Customer reviews -> Offline Airplane Mode test succeeds.
