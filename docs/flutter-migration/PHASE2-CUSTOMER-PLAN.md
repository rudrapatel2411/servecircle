# PHASE 2: CUSTOMER APPLICATION IMPLEMENTATION PLAN
## Complete Mobile-Native Specification for ServeCircle Customer Experience

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Total Customer Features:** 38 Features (14 P1, 16 P2, 8 P3)  
**Web Baseline:** Mapped from `client/src/pages/customer/` and `02-FEATURE-PARITY-MATRIX.md`  

---

## 1. CUSTOMER FEATURE ARCHITECTURE & SPECIFICATION

Every customer feature is documented below with its exact widget tree, network dependencies, real-time socket events, local caching strategy, offline tolerance, and demo exhibition behavior:

### 1.1 Customer Dashboard
- **Screen:** `CustomerDashboardScreen`
- **Key Widgets:**
  - `HeroBannerWidget`: Rotating carousel with promo discounts, emergency SOS button, and quick AI diagnose pill.
  - `ActiveBookingBanner`: Elevated Neomorphic card displaying active job in progress (status, worker photo, "Track Live" button).
  - `QuickCategoryGrid`: 8 primary service category shortcuts (AC, Electrical, Plumbing, Cleaning, etc.).
  - `RecentHistoryList`: Last 3 bookings with re-book action.
- **API Dependency:** `GET /api/bookings/my?status=active`, `GET /api/services`
- **Socket Dependency:** `customer_notification`, `booking_status_changed`
- **Riverpod State:** `customerDashboardControllerProvider`
- **Local Storage / Cache:** Hive `bookings_box` (instant cached render).
- **Offline Behavior:** Renders last-cached active booking with "Offline" badge.
- **Demo Behavior:** Displays pre-seeded AC repair booking for Rudra Shah.

### 1.2 Service Catalog & 14 Dynamic Hubs
- **Screens:** `BrowseServicesScreen`, `ServiceHubScreen` (Parametric category hub), `ServiceDetailScreen`
- **14 Hubs Covered:** Emergency SOS, Events & Catering, Relocation & Packers, Travel & Fleet, Food & Chef, Pet Care, Health & Nursing, Society Management, Vehicle Care, Home Repairs, AC & Appliances, Deep Cleaning, Pest Control, Smart Home.
- **Key Widgets:**
  - `CategoryFilterChips`: Horizontal scrolling chip bar for subcategory filtering.
  - `ServiceCard`: Price, duration, rating, "Book Now" CTA, and "Add to Cart" option.
  - `ServiceDetailBottomSheet`: Comprehensive breakdown of inclusions, exclusions, warranty, and customer reviews.
- **API Dependency:** `GET /api/services`, `GET /api/services/category/:category`, `GET /api/services/:id`
- **Local Storage / Cache:** Hive `services_box` (24-hour TTL).
- **Offline Behavior:** Full catalog is accessible offline once downloaded on first launch.
- **Demo Behavior:** Uses complete 60+ pre-seeded service catalog from `demo_service_fixtures.dart`.

### 1.3 Multimodal AI Smart Diagnosis & Conversational Chat
- **Screens:** `AISmartDiagnosisScreen`, `AIChatScreen`
- **Key Widgets:**
  - `CameraInspectionView`: Native camera viewfinder with crosshairs and guidance tips.
  - `ProblemImagePreview`: Thumbnail preview of captured defect photo with retake option.
  - `UrgencyBadge`: Visual urgency meter (`Emergency` [Red], `High` [Orange], `Medium` [Yellow], `Low` [Blue]).
  - `AIServiceRecommendationCard`: Rich card displaying diagnosed problem, recommended service name, estimated cost, confidence bar, and direct "Book Recommended Service" button.
  - `MultilingualChatStream`: Real-time bubble list with typing indicator.
- **API Dependency:** `POST /api/ai/analyze` (Multipart), `POST /api/ai/chat` (Multipart)
- **Local Storage / Cache:** In-memory chat session; history saved to Hive `chat_history_box`.
- **Offline / Demo Behavior:** If disconnected or AI provider unavailable, automatically invokes `DemoFixtureProvider.analyzeProblem()` producing structured instant diagnosis cards.

### 1.4 Booking Flow & Scheduling
- **Screen:** `BookingFlowScreen`
- **Key Widgets:**
  - `BookingStepIndicator`: 3-step breadcrumb (1. Slot & Address → 2. Review & Coupon → 3. Payment).
  - `CalendarDateSelector`: Horizontal calendar strip with available date badges.
  - `TimeSlotSelector`: Grid of hourly time windows (Morning, Afternoon, Evening).
  - `AddressSelectorCard`: Radio list of saved addresses with "Add New Address" modal.
  - `CouponInputSection`: Promo code text field with instant validation and applied discount pill.
- **API Dependency:** `POST /api/bookings`, `POST /api/coupons/validate`
- **Local Storage / Cache:** Cached addresses in Hive `user_box`.
- **Offline Behavior:** Blocked with advisory modal unless in Demo Mode.
- **Demo Behavior:** Simulates instant booking confirmation, creating booking `BK-DEMO-NEW` and opening the tracking screen.

### 1.5 Checkout & Payment Flow
- **Screen:** Modal Bottom Sheet `PaymentModal`
- **Key Widgets:**
  - `PaymentSummaryCard`: Base service charge, GST (18%), discount, and net payable amount.
  - `PaymentMethodRadioGroup`: ServeCircle Wallet (shows real-time balance), UPI (GPay, PhonePe, Paytm simulation), Credit/Debit Card.
  - `PayNowButton`: Primary CTA with lock icon ("100% Secure Payment").
- **API Dependency:** `POST /api/wallet/pay`
- **Local Storage / Cache:** Hive `wallet_box`.
- **Offline Behavior:** Blocked (financial transaction).
- **Demo Behavior:** Completes payment instantly via simulated demo wallet, deducting from ₹2,450 balance.

### 1.6 Live GPS Tracking & Arrival OTP
- **Screen:** `LiveTrackingScreen`
- **Key Widgets:**
  - `LiveTrackingMapView`: Leaflet/FlutterMap tile map rendering customer pin, worker vehicle marker, and polyline route.
  - `BookingStatusStepper`: 4-step vertical or horizontal stepper:
    - Step 1: Booking Confirmed / Dispatched
    - Step 2: Pro Arriving at Location
    - Step 3: Pro Arrived at Doorstep (Triggers OTP reveal)
    - Step 4: Service Started & Ongoing
  - `VerifiedOtpCard`: Prominent amber-bordered card displaying the 4-digit start OTP with clear label (`VERIFIED BOOKING START OTP` or `DEMO EXHIBITION START OTP`).
  - `WorkerContactBar`: Worker name, photo, phone call button (`url_launcher: tel:`), and rating.
  - `DataSourceBadge`: `● Live GPS Tracking` vs `○ Demo Simulation Mode`.
- **API Dependency:** `GET /api/bookings/:id`
- **Socket Dependency:** `booking_status_changed`, `worker_location_update`
- **Offline / Demo Behavior:** If offline or demo mode, animates worker marker along 12 pre-calculated OSRM coordinates and displays deterministic OTP `8492`.

### 1.7 Worker QR Code Verification
- **Screen:** `WorkerVerificationScreen`
- **Key Widgets:**
  - `QRScannerView`: Embedded camera scanner powered by `mobile_scanner`.
  - `WorkerVerificationCard`: Displays worker photo, legal name, government ID status (Verified Pro badge), background check badge, police verification status, and emergency SOS button.
  - `ManualIdInput`: Text field allowing manual entry of Worker ID if camera is unreadable.
- **API Dependency:** `GET /api/verify/:workerId`, `POST /api/verify/worker`
- **Offline / Demo Behavior:** Contains pre-loaded verification profile for Ramesh Kumar (`worker-001`).

### 1.8 Customer Wallet & Payout Simulation
- **Screen:** `CustomerWalletScreen`
- **Key Widgets:**
  - `BalanceCard`: Neomorphic gradient card with current balance in ₹ and "Add Money" CTA.
  - `TopupBottomSheet`: Preset quick-select chips (+₹500, +₹1,000, +₹2,000) and UPI submit button.
  - `TransactionHistoryList`: Color-coded transactions (Credit in Green, Debit in Navy) with date and reference ID.
- **API Dependency:** `GET /api/wallet`, `POST /api/wallet/topup`
- **Local Storage / Cache:** Hive `wallet_box`.
- **Offline Behavior:** Displays cached balance with sync pending status.
- **Demo Behavior:** Authoritative demo balance of ₹2,450 with simulated top-up support.

### 1.9 Post-Service Review & Ratings
- **Screen:** `PostServiceReviewScreen`
- **Key Widgets:**
  - `StarRatingBar`: Interactive 5-star selector with animated haptic feedback.
  - `ReviewTagChips`: Multi-select praise tags ("Punctual", "Clean Work", "Polite", "Expert").
  - `ReviewCommentInput`: Text area for customer feedback.
- **API Dependency:** `POST /api/reviews`
- **Offline Behavior:** Saves review locally in Hive and enqueues to `SyncQueue`.

### 1.10 Emergency SOS Hub
- **Screen:** `EmergencyHubScreen`
- **Key Widgets:**
  - `PulsingEmergencyButton`: Large red SOS button for immediate dispatch (Plumbing burst, electrical spark, lock break).
  - `EmergencyGuaranteePill`: "Pro dispatched within 15 minutes."
  - `DirectEmergencyBookingSheet`: 1-tap booking skipping standard slot selection.
- **API Dependency:** `POST /api/bookings` with `isEmergency: true`.
