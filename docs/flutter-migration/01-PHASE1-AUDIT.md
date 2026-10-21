# 01 — PHASE 1 AUDIT
## ServeCircle Flutter Migration — Web Application Deep Audit

**Audit Date:** 2026-09-29
**Repository Path:** d:\PROJECTS\servecircle
**Auditor:** Antigravity AI — Phase 1 Diagnosis Only
**Flutter Code Written:** NO

---

## 1. REPOSITORY STRUCTURE

```
servecircle/
+-- client/                    # React + Vite frontend (port 5173)
¦   +-- src/
¦   ¦   +-- App.jsx            # React Router v6 routing config
¦   ¦   +-- main.jsx           # Entry point + i18n init
¦   ¦   +-- index.css          # Global design system (CSS custom properties)
¦   ¦   +-- socket.js          # Socket.io client instance (autoConnect: false)
¦   ¦   +-- components/        # Shared UI components
¦   ¦   +-- pages/             # Role-segregated pages
¦   ¦   ¦   +-- auth/          # Login, Register, WorkerRegister, ForgotPassword
¦   ¦   ¦   +-- customer/      # ~45 page components
¦   ¦   ¦   +-- worker/        # ~12 page components
¦   ¦   ¦   +-- admin/         # ~9 page components
¦   ¦   ¦   +-- b2b/           # ~15 page components
¦   ¦   +-- i18n/              # Translations (en, hi, gu) + services catalogs
¦   ¦   +-- data/              # Static data (generalServicesData)
¦   ¦   +-- utils/             # authSession.js, imageHelpers.js, customAlert.js
+-- server/                    # Express.js backend (port 5000)
¦   +-- server.js              # Main entry — HTTP server + Socket.io setup
¦   +-- routes/                # 21 route files
¦   +-- models/                # 24 Mongoose models
¦   +-- middleware/            # auth.js, validation.js, errorHandler.js, asyncHandler.js
¦   +-- services/              # bookingService, metricsService, eventService, etc.
¦   +-- ai/                    # AI provider layer + inference engine
¦   +-- utils/                 # demoAuthStore.js, demoDataStore.js
+-- docs/flutter-migration/    # This audit output
```

---

## 2. TECHNOLOGY STACK (VERIFIED)

| Layer | Technology | Detail |
|-------|-----------|--------|
| Frontend | React + Vite | React Router v6 |
| CSS | Vanilla CSS (custom properties) | No Tailwind |
| Icons | react-icons/hi2 (HeroIcons v2) | |
| Animation | framer-motion | LiveTracking, AI pages |
| Map | Leaflet.js | LiveTracking only |
| i18n | i18next + react-i18next | EN/HI/GU translations |
| State | React useState/useEffect | No Redux/Zustand |
| HTTP | fetch() | Via authSession.js utility |
| Realtime | socket.io-client | autoConnect: false |
| Backend | Node.js + Express.js | ESM modules |
| Database | MongoDB (Mongoose) | + in-memory demo fallback |
| Auth | JWT (Bearer token) | 7-day expiry, localStorage |
| File Upload | multer | Memory storage, max 20MB |
| AI Layer | AIProviderManager | Gemini + Groq providers |

---

## 3. ALL WEB ROUTES (82 total, VERIFIED from App.jsx)

### Public Routes
| Route | Component |
|-------|-----------|
| `/` | LandingPage |
| `/about/:id` | ImpactDetail |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/worker-register` | WorkerRegister |
| `/verify-worker` | SecureWorkerVerification |
| `/verify/worker/:workerIdCode` | SecureWorkerVerification |
| `/ai-chat` | Redirect ? /customer/ai-chat |
| `/chat` | Redirect ? /customer/ai-chat |
| `/ai-diagnosis` | Redirect ? /customer/ai-diagnosis |

### Customer Routes (under /customer)
| Route | Component |
|-------|-----------|
| `/customer` | CustomerDashboard |
| `/customer/services` | BrowseServices |
| `/customer/events` | EventsHub |
| `/customer/emergency` | EmergencyHub |
| `/customer/general-services` | GeneralServicesPage |
| `/customer/general-services/repair-services` | HomeRepairsHub |
| `/customer/general-services/cleaning-services` | CleaningHygieneHub |
| `/customer/travel-commute` | TravelCommuteHub |
| `/customer/food-kitchen` | FoodKitchenHub |
| `/customer/pet-services` | PetHub |
| `/customer/health-wellness` | HealthWellnessHub |
| `/customer/society-management` | SocietyManagementHub |
| `/customer/relocation` | RelocationHub |
| `/customer/services/home-repairs` | HomeRepairsHub |
| `/customer/services/vehicle-services` | VehicleServicesHub |
| `/customer/services/cleaning` | CleaningHygieneHub |
| `/customer/services/furniture-decor` | FurnitureDecorHub |
| `/customer/services/garden-outdoor` | GardenOutdoorHub |
| `/customer/services/:category` | CategoryHub |
| `/customer/services/:category/:serviceId` | ServiceDetail |
| `/customer/my-home` | MyHomeDashboard |
| `/customer/trust-safety` | TrustSafety |
| `/customer/book` | BookingFlow |
| `/customer/bookings` | BookingHistory |
| `/customer/wallet` | CustomerWallet |
| `/customer/subscriptions` | CustomerSubscriptions |
| `/customer/reviews` | CustomerReviews |
| `/customer/ai-diagnosis` | AISmartDiagnosis |
| `/customer/ai-chat` | CustomerAIChat |
| `/customer/homefixr` | HomeFixrWarranty |
| `/customer/video-consultation` | VideoConsultation |
| `/customer/group-booking` | GroupBooking |
| `/customer/live-tracking` | LiveTracking |
| `/customer/review/:bookingId` | PostServiceReview |
| `/customer/ordered-services` | OrderedServices |
| `/customer/verify-worker` | SecureWorkerVerification |
| `/customer/packers-demo` | PackersDemo |
| `/customer/pet-demo` | PetRelocationDemo |
| `/customer/vehicle-demo` | VehicleRelocationDemo |
| `/customer/health-demo` | HealthWellnessDemo |
| `/customer/pet-flow` | PetPremiumFlow |
| `/customer/food-flow` | FoodPremiumFlow |
| `/customer/travel-flow` | TravelPremiumFlow |
| `/customer/society-flow` | SocietyPremiumFlow |

### Worker Routes (under /worker)
| Route | Component |
|-------|-----------|
| `/worker` | WorkerDashboard |
| `/worker/jobs` | WorkerJobs |
| `/worker/schedule` | WorkerSchedule |
| `/worker/earnings` | WorkerEarnings |
| `/worker/training` | WorkerTraining |
| `/worker/profile` | WorkerProfile |
| `/worker/become-a-pro` | BecomeAProHub |

### Admin Routes (under /admin)
| Route | Component |
|-------|-----------|
| `/admin` | AdminDashboard |
| `/admin/bookings` | AdminBookings |
| `/admin/workers` | WorkerVerification |
| `/admin/analytics` | AdminAnalytics |
| `/admin/coupons` | AdminCoupons |
| `/admin/complaints` | AdminComplaints |
| `/admin/partners` | AdminPartners |
| `/admin/notifications` | AdminNotifications |
| `/admin/b2b` | B2BDashboard |
| `/admin/b2b/booking` | B2BBooking |
| `/admin/b2b/contracts` | B2BContracts |
| `/admin/b2b/locations` | B2BLocations |
| `/admin/b2b/team` | B2BTeam |
| `/admin/b2b/invoices` | B2BInvoices |

### B2B Routes (under /b2b)
| Route | Component |
|-------|-----------|
| `/b2b` | B2BClientDashboard |
| `/b2b/services` | B2BClientServices |
| `/b2b/contracts` | B2BClientContracts |
| `/b2b/locations` | B2BClientLocations |
| `/b2b/team` | B2BTeam |
| `/b2b/invoices` | B2BClientInvoices |
| `/b2b/history` | B2BClientHistory |
| `/b2b/support` | B2BClientSupport |

---

## 4. AUTH FLOW (VERIFIED)

**Session Storage:** `localStorage["servecircle_session"] = { token, user }`
**Token Format:** JWT Bearer, 7-day expiry
**No refresh token.** Sessions expire after 7 days and user must re-login.

**Login:**
- POST /api/auth/login ? { email, password }
- Role check on client: user.role must match selected panel
- On success: saveSession({ token, user }) ? navigate(roleHome[role])

**roleHome mapping:**
- customer ? /customer
- worker ? /worker
- admin ? /admin
- b2b ? /b2b

**No client-side PrivateRoute guards** — BUG-001

---

## 5. SOCKET.IO EVENTS (VERIFIED)

**Server rooms:** admin_room, worker_{workerId}, customer_{customerId}

| Client Emit | Server Action |
|-------------|---------------|
| `join_admin` | socket.join('admin_room') |
| `join_worker` | socket.join(`worker_${workerId}`) |
| `join_customer` | socket.join(`customer_${customerId}`) |

| Server Emit | Room | Payload |
|-------------|------|---------|
| `admin_notification` | admin_room | { id, title, message, type, date, reads } |
| `booking_assigned` | worker_{id} | Booking document |
| `booking_status_update` | customer_{id} | { bookingId, status, ... } |
| `booking_status_update` | admin_room | { bookingId, status, ... } |

**NOTE:** Only admin room is connected from the client. Worker/customer sockets not wired end-to-end. BUG-002.

---

## 6. DEMO CREDENTIALS (VERIFIED)

| Email | Password | Role |
|-------|----------|------|
| rudra@test.com | test123 | customer |
| priya@test.com | test123 | customer |
| ramesh@test.com | test123 | worker |
| admin@servecircle.in | admin123 | admin |
| gv@test.com | test123 | b2b |

---

## 7. INTERNATIONALIZATION (VERIFIED)

- Languages: English (en), Hindi (hi), Gujarati (gu)
- Tool: i18next + react-i18next
- Custom number post-processor: converts digits to Devanagari / Gujarati script
- NOT persisted between sessions
- AI chat also supports Hindi/Gujarati via detectLanguage() server-side function

---

## 8. BROWSER APIS REQUIRING FLUTTER EQUIVALENTS

| Web API | Used In | Flutter Package |
|---------|---------|-----------------|
| localStorage | authSession.js | flutter_secure_storage |
| Leaflet.js | LiveTracking.jsx | google_maps_flutter / flutter_map |
| Geolocation | LiveTracking.jsx | geolocator |
| fetch() | authSession.js | http / dio |
| File API | imageHelpers.js | image_picker |
| socket.io-client | socket.js | socket_io_client |
| CSS safe-area-inset | index.css | SafeArea widget |
| framer-motion | AI pages | AnimationController |
| i18next | i18n/ | easy_localization |

---

## 9. DESIGN SYSTEM (VERIFIED)

| Token | Value |
|-------|-------|
| Primary font | Outfit (headings) + Inter (body) |
| Primary-600 | #2960a0 (Classic Blue) |
| Accent-500 | #f59e0b (Saffron/Amber) |
| Navy-900 | #0f172a |
| Danger | #ef4444 |
| Sidebar width | 260px |
| Navbar height | 80px |
| Bottom nav height | 64px (CSS var exists) |
| Border radius | 10/16/24/32px |
| Design language | Neomorphism v2.0 (glassmorphism cards) |
