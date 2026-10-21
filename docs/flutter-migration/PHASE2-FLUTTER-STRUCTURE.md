# PHASE 2: FLUTTER PROJECT DIRECTORY STRUCTURE
## Complete Planned `lib/` Architecture for ServeCircle Mobile

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  

---

## 1. COMPLETE DIRECTORY TREE

Below is the definitive, feature-first structure planned for `lib/`. Every file, class, and utility has a dedicated location to prevent code sprawl and architectural erosion during Phase 3 implementation.

```text
lib/
├── app.dart                                # Root MaterialApp widget & Riverpod listener
├── main.dart                               # Application bootstrap, DI init, Hive setup
│
├── core/                                   # Cross-cutting foundational modules
│   ├── config/
│   │   ├── app_config.dart                 # Environment variables, baseURL, socketURL
│   │   └── constants.dart                  # App-wide fixed constants & asset paths
│   │
│   ├── network/
│   │   ├── api_endpoints.dart              # Static URL path definitions
│   │   ├── dio_client.dart                 # Centralized Dio instance & base options
│   │   ├── error_handler.dart              # Server exception & failure mapping
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart       # Bearer JWT injection & 401 broadcast
│   │       ├── logging_interceptor.dart    # Pretty network console logger
│   │       └── retry_interceptor.dart      # Exponential backoff for idempotent GETs
│   │
│   ├── socket/
│   │   ├── socket_constants.dart           # Event name constants (join_worker, etc.)
│   │   ├── socket_manager.dart             # Singleton Socket.io client wrapper
│   │   └── socket_state.dart               # Connection state (connected, disconnected)
│   │
│   ├── storage/
│   │   ├── hive_boxes.dart                 # Hive box name constants & registration
│   │   ├── hive_service.dart               # Generic read/write/delete operations
│   │   └── secure_storage_service.dart     # FlutterSecureStorage for JWT tokens
│   │
│   ├── sync/
│   │   ├── sync_engine.dart                # Background offline mutation queue processor
│   │   ├── sync_operation.dart             # Sync queue item entity (operation, payload)
│   │   └── sync_status_provider.dart       # Global sync status (syncing, pending count)
│   │
│   ├── theme/
│   │   ├── app_colors.dart                 # Neomorphism Emerald & Classic Blue palette
│   │   ├── app_shadows.dart                # Neomorphic soft shadow specifications
│   │   ├── app_spacing.dart                # Padding, margin, and radius tokens
│   │   ├── app_theme.dart                  # ThemeData configuration (Light/Emerald)
│   │   └── app_typography.dart             # Google Fonts (Plus Jakarta Sans / Outfit)
│   │
│   ├── localization/
│   │   ├── app_localizations.dart          # Localized string delegates
│   │   ├── language_controller.dart        # Selected language state notifier
│   │   ├── translations_en.dart            # English string dictionary
│   │   ├── translations_hi.dart            # Hindi string dictionary (हिंदी)
│   │   ├── translations_gu.dart            # Gujarati string dictionary (ગુજરાતી)
│   │   └── numerals_formatter.dart         # Devanagari & Gujarati numeral converter
│   │
│   ├── routing/
│   │   ├── app_router.dart                 # GoRouter configuration & route definitions
│   │   ├── route_guards.dart               # Role-based redirection & auth protection
│   │   └── route_names.dart                # Named route constants (/customer/dashboard)
│   │
│   ├── utils/
│   │   ├── date_time_utils.dart            # Formatters for booking times, slots, ISO8601
│   │   ├── currency_formatter.dart         # INR (₹) formatting with localized commas
│   │   ├── image_compressor.dart           # Mobile client-side image compression
│   │   └── deterministic_otp.dart          # Exhibition demo OTP generation algorithm
│   │
│   └── shared_widgets/                     # Reusable global design system components
│       ├── buttons/
│       │   ├── app_primary_button.dart     # Primary gradient CTA button with spinner
│       │   ├── app_secondary_button.dart   # Outline / secondary button
│       │   └── app_icon_button.dart        # Circular icon action button
│       ├── cards/
│       │   ├── neomorphic_card.dart        # Base container with soft dual shadow
│       │   └── stat_metric_card.dart       # KPI counter card with trend badge
│       ├── inputs/
│       │   ├── app_text_field.dart         # Standard styled text input field
│       │   ├── app_search_bar.dart         # Search bar with clear button & debounce
│       │   └── app_dropdown.dart           # Dropdown selection field
│       ├── feedback/
│       │   ├── app_loading_indicator.dart  # Custom branded spinner
│       │   ├── app_error_widget.dart       # Error message with retry button
│       │   ├── app_empty_state.dart        # Empty state with illustration & CTA
│       │   └── offline_banner.dart         # Top sticky banner indicating offline state
│       └── navigation/
│           ├── app_nav_bar.dart            # Mobile bottom navigation bar
│           └── app_header_app_bar.dart     # Top app bar with notifications & profile
│
├── features/                               # Functional feature modules (Clean Architecture)
│   │
│   ├── auth/                               # Authentication & Registration
│   │   ├── data/
│   │   │   ├── auth_repository.dart        # Interface & implementation
│   │   │   └── models/
│   │   │       ├── user_model.dart         # User DTO (id, name, email, role, etc.)
│   │   │       └── auth_response.dart      # { token, user } DTO
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   └── auth_controller.dart    # Riverpod state notifier for active session
│   │   │   ├── screens/
│   │   │   │   ├── login_screen.dart       # Login page with demo quick-access cards
│   │   │   │   ├── register_screen.dart    # Customer registration
│   │   │   │   └── worker_register_screen.dart # Worker registration with skill selection
│   │   │   └── widgets/
│   │   │       └── quick_demo_selector.dart# Tap-to-login demo cards (Rudra, Ramesh, etc.)
│   │
│   ├── customer/                           # Customer Panel Features
│   │   ├── data/
│   │   │   ├── customer_repository.dart    # Bookings, Services, Wallet, Reviews
│   │   │   └── models/
│   │   │       ├── booking_model.dart      # Full customer booking DTO
│   │   │       ├── service_model.dart      # Service item DTO
│   │   │       ├── category_model.dart     # Hub category DTO
│   │   │       ├── wallet_model.dart       # Balance & transaction history DTO
│   │   │       ├── review_model.dart       # Customer review DTO
│   │   │       ├── complaint_model.dart    # Complaint ticket DTO
│   │   │       └── tracking_model.dart     # Live worker coordinates & arrival ETA
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   ├── customer_dashboard_controller.dart
│   │   │   │   ├── booking_flow_controller.dart
│   │   │   │   ├── live_tracking_controller.dart
│   │   │   │   └── customer_wallet_controller.dart
│   │   │   ├── screens/
│   │   │   │   ├── customer_dashboard_screen.dart
│   │   │   │   ├── browse_services_screen.dart
│   │   │   │   ├── service_detail_screen.dart
│   │   │   │   ├── service_hub_screen.dart # Dynamic hub for 14 service categories
│   │   │   │   ├── booking_flow_screen.dart# Multi-step date/time/address/coupon
│   │   │   │   ├── payment_modal_screen.dart# Wallet / UPI / Card payment sheet
│   │   │   │   ├── booking_history_screen.dart
│   │   │   │   ├── live_tracking_screen.dart# Real/Demo GPS map with arrival OTP
│   │   │   │   ├── post_service_review_screen.dart
│   │   │   │   ├── customer_reviews_screen.dart
│   │   │   │   ├── customer_wallet_screen.dart
│   │   │   │   ├── customer_subscriptions_screen.dart
│   │   │   │   ├── emergency_hub_screen.dart
│   │   │   │   ├── worker_verification_screen.dart # QR code scanner verification
│   │   │   │   ├── customer_profile_screen.dart
│   │   │   │   └── customer_settings_screen.dart
│   │   │   └── widgets/
│   │   │       ├── service_card.dart
│   │   │       ├── category_grid_item.dart
│   │   │       ├── booking_status_stepper.dart
│   │   │       ├── live_map_view.dart      # Leaflet / FlutterMap tile renderer
│   │   │       └── otp_display_card.dart   # Verified vs Demo Start OTP badge
│   │
│   ├── worker/                             # Worker / Pro Panel Features
│   │   ├── data/
│   │   │   ├── worker_repository.dart      # Job fetching, accept/reject, OTP verification
│   │   │   └── models/
│   │   │       ├── worker_job_model.dart   # Assigned job DTO with location & photos
│   │   │       ├── worker_earnings_model.dart
│   │   │       └── worker_metrics_model.dart
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   ├── worker_dashboard_controller.dart
│   │   │   │   ├── worker_jobs_controller.dart
│   │   │   │   └── worker_earnings_controller.dart
│   │   │   ├── screens/
│   │   │   │   ├── worker_dashboard_screen.dart
│   │   │   │   ├── worker_jobs_screen.dart # Pending jobs pool & accepted jobs
│   │   │   │   ├── worker_job_detail_screen.dart # OTP entry, photo uploads, complete
│   │   │   │   ├── worker_schedule_screen.dart
│   │   │   │   ├── worker_earnings_screen.dart
│   │   │   │   ├── worker_training_screen.dart
│   │   │   │   ├── worker_profile_screen.dart
│   │   │   │   └── worker_auth_prompt_screen.dart # Status gate (pending, suspended)
│   │   │   └── widgets/
│   │   │       ├── job_action_card.dart
│   │   │       ├── otp_input_sheet.dart
│   │   │       └── photo_upload_preview.dart
│   │
│   ├── admin/                              # Admin Operations Panel
│   │   ├── data/
│   │   │   ├── admin_repository.dart       # Worker verification, complaints, analytics
│   │   │   └── models/
│   │   │       ├── admin_analytics_model.dart
│   │   │       ├── admin_worker_kyc_model.dart
│   │   │       └── coupon_model.dart
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   ├── admin_dashboard_controller.dart
│   │   │   │   ├── admin_bookings_controller.dart
│   │   │   │   ├── admin_verification_controller.dart
│   │   │   │   └── admin_complaints_controller.dart
│   │   │   ├── screens/
│   │   │   │   ├── admin_dashboard_screen.dart
│   │   │   │   ├── admin_bookings_screen.dart # All bookings & manual assignment
│   │   │   │   ├── admin_workers_screen.dart  # Verification & approval queue
│   │   │   │   ├── worker_id_card_screen.dart # Digital ID card with QR code
│   │   │   │   ├── admin_complaints_screen.dart
│   │   │   │   ├── admin_coupons_screen.dart
│   │   │   │   ├── admin_analytics_screen.dart
│   │   │   │   └── admin_notifications_screen.dart
│   │   │   └── widgets/
│   │   │       ├── kpi_metric_card.dart
│   │   │       ├── worker_kyc_action_card.dart
│   │   │       └── complaint_resolution_dialog.dart
│   │
│   ├── b2b/                                # B2B Client Portal
│   │   ├── data/
│   │   │   ├── b2b_repository.dart         # Contracts, Invoices, Locations, Team
│   │   │   └── models/
│   │   │       ├── contract_model.dart
│   │   │       ├── invoice_model.dart
│   │   │       ├── location_model.dart
│   │   │       └── team_member_model.dart
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   ├── b2b_dashboard_controller.dart
│   │   │   │   ├── b2b_contracts_controller.dart
│   │   │   │   └── b2b_invoices_controller.dart
│   │   │   ├── screens/
│   │   │   │   ├── b2b_dashboard_screen.dart
│   │   │   │   ├── b2b_services_screen.dart
│   │   │   │   ├── b2b_contracts_screen.dart
│   │   │   │   ├── b2b_contract_detail_screen.dart
│   │   │   │   ├── b2b_locations_screen.dart
│   │   │   │   ├── b2b_team_screen.dart
│   │   │   │   ├── b2b_invoices_screen.dart
│   │   │   │   └── b2b_history_screen.dart
│   │   │   └── widgets/
│   │   │       ├── contract_status_card.dart
│   │   │       └── invoice_download_tile.dart
│   │
│   ├── ai/                                 # AI Diagnosis & Smart Chat
│   │   ├── data/
│   │   │   ├── ai_repository.dart          # Connects to /api/ai/chat and /api/ai/analyze
│   │   │   └── models/
│   │   │       ├── ai_chat_message.dart    # Text, role (user/assistant), recommendation
│   │   │       ├── ai_diagnosis_result.dart# Urgency, problem, recommended services
│   │   │       └── ai_service_recommendation.dart
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   │   ├── ai_chat_controller.dart
│   │   │   │   └── ai_diagnosis_controller.dart
│   │   │   ├── screens/
│   │   │   │   ├── ai_chat_screen.dart     # Conversational assistant with rich cards
│   │   │   │   └── ai_smart_diagnosis_screen.dart # Multimodal camera/image inspector
│   │   │   └── widgets/
│   │   │       ├── chat_bubble.dart
│   │   │       ├── ai_service_recommendation_card.dart
│   │   │       └── image_problem_preview.dart
│   │
│   └── demo/                               # Exhibition Demo Subsystem
│       ├── data/
│       │   ├── demo_auth_fixtures.dart     # Credentials for 4 demo personas
│       │   ├── demo_booking_fixtures.dart  # Pre-seeded customer and worker bookings
│       │   ├── demo_service_fixtures.dart  # Comprehensive 14-hub service catalog
│       │   ├── demo_wallet_fixtures.dart   # ₹2,450 balance & transaction history
│       │   └── demo_tracking_fixtures.dart # Pre-calculated OSRM polyline coordinates
│       └── controllers/
│           └── demo_mode_controller.dart   # Global toggle for standalone offline mode
```

---

## 2. EXPLANATION OF CORE DIRECTORIES

| Directory | Architectural Purpose | Why It Exists Separately |
|---|---|---|
| `core/network/` | Houses Dio configuration, base options, header management, and interceptors. | Isolates all raw HTTP protocol logic from application features. Features never instantiate HTTP clients directly. |
| `core/socket/` | Encapsulates Socket.io lifecycle, role room management, and reconnect loops. | Provides a single event-multiplexing boundary so multiple screens can subscribe to the same socket stream without duplicate connections. |
| `core/storage/` | Wraps Hive and FlutterSecureStorage. | Abstracts persistence details; features store Dart objects without knowing whether they are in memory, plaintext disk, or encrypted keystore. |
| `core/sync/` | Manages offline mutation queuing and reconciliation. | Decouples offline write persistence from the UI. UI can execute mutations immediately while the sync engine guarantees eventual server synchronization. |
| `core/theme/` | Contains the complete Neomorphism v2.0 design tokens. | Enforces 100% visual consistency with the web app, avoiding hardcoded hex colors and divergent border radii. |
| `core/localization/` | Provides translation maps for English, Hindi, and Gujarati. | Supports the tri-lingual requirement with persistent language selection and localized numerals. |
| `features/<role>/` | Segregates screens, widgets, controllers, and models by user persona. | Prevents role leakages, ensures maintainability, and mirrors the role-segregated structure of the web application. |
| `features/demo/` | Contains standalone mock fixtures and fallback controllers. | Guarantees that the college exhibition works flawlessly even if backend servers, MongoDB, or WiFi are completely unavailable. |
