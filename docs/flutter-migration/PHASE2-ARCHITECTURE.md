# PHASE 2: FLUTTER SYSTEM ARCHITECTURE
## ServeCircle Android Application — Clean Feature-First Mobile Blueprint

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android Mobile)  
**Parity Target:** 100% Functional Parity with ServeCircle Web Platform  
**Target Roles:** Customer, Worker, Admin, B2B Partner  

---

## 1. ARCHITECTURAL OVERVIEW

The ServeCircle Flutter application employs a **Feature-First Clean Architecture** specifically tailored for complex, multi-role enterprise mobile clients requiring robust real-time synchronization, offline tolerance, and high-fidelity demo exhibition resilience.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION LAYER                              │
│   Widgets / Screens ───► State Notifiers / Controllers ───► UI ViewModels   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ calls
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                DOMAIN LAYER                                 │
│          Entities ───► Value Objects ───► Domain Use Cases (Optional)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ consumes / implemented by
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 DATA LAYER                                  │
│                          REPOSITORIES (Unified)                             │
│       ┌──────────────────────────────┼──────────────────────────────┐       │
│       ▼                              ▼                              ▼       │
│ ┌───────────────┐           ┌──────────────────┐           ┌──────────────┐ │
│ │  Remote API   │           │ Local Hive Cache │           │ Demo Fixture │ │
│ │  Client (Dio) │           │ & Secure Storage │           │   Provider   │ │
│ └───────────────┘           └────────┬─────────┘           └──────────────┘ │
│                                      │ triggers                             │
│                                      ▼                                      │
│                             ┌──────────────────┐                            │
│                             │ Sync Engine      │                            │
│                             │ (Mutation Queue) │                            │
│                             └──────────────────┘                            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ monitors
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE & CORE SERVICES                       │
│    Socket.io Manager ─── Network Connectivity ─── Hardware (GPS, Camera)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ARCHITECTURAL LAYERS & RESPONSIBILITIES

### 2.1 Presentation Layer
- **Screens / Views:** Declarative Flutter widgets responsible strictly for layout, animations, rendering theme tokens, and user gesture dispatching. No direct network calls, socket listeners, or business calculations reside in screens.
- **Controllers / Notifiers:** Riverpod `StateNotifier` and `AsyncNotifier` implementations managing the UI state lifecycle. Each controller consumes one or more Repositories, handles loading/error states, maps domain models to view states, and subscribes to Socket.io event streams.
- **State Models:** Immutable Freezed/Dart classes representing the exact snapshot of the screen (`AsyncValue<T>`, with explicit states: `Uninitialized`, `Loading`, `Loaded`, `Error`, `OfflinePending`).

### 2.2 Domain Layer
- **Entities:** Pure business models free from serialization logic, third-party framework dependencies, or Flutter UI imports (e.g., `Booking`, `User`, `WorkerProfile`, `WalletAccount`, `AIAnalysis`).
- **Value Objects / Enums:** Strongly-typed domain constants (e.g., `BookingStatus`, `WorkerTier`, `UrgencyLevel`, `PaymentMethod`).
- **Domain Exceptions:** Strongly typed application-level failures (`NetworkFailure`, `AuthExpiredFailure`, `OfflineStorageFailure`, `ServerValidationFailure`).

### 2.3 Data Layer
- **Repositories (Single Source of Truth):** Abstract interfaces defined by the domain layer and implemented in the data layer. Repositories orchestrate data retrieval between three sources:
  1. **Remote API Source:** Makes HTTP requests via `DioClient`.
  2. **Local Storage Source:** Reads/writes instant cached models via `HiveService` and sensitive credentials via `SecureStorageService`.
  3. **Demo Provider Source:** Supplies pre-baked fixture arrays when app runs in Standalone Demo Mode or when remote backend/MongoDB is unreachable.
- **Data Transfer Objects (DTOs) & Models:** JSON-serializable Dart models handling raw backend schemas, with explicit `.fromJson()` and `.toJson()` mappers.
- **Offline Mutation Queue:** Intercepts write operations when disconnected, records persistent intent records in Hive, and notifies the Sync Engine upon network restoration.

### 2.4 Infrastructure & Core Layer
- **Network Client:** Centralized `Dio` instance with auth token injection, automatic 401 interceptors, request logging, and configurable timeouts.
- **Socket.io Client Manager:** Singleton connection manager handling role-based room subscriptions (`admin_room`, `worker_<id>`, `customer_<id>`), automated reconnect loops, and typed stream controllers.
- **Platform Hardware Services:** Abstraction wrappers around Android native hardware: Geolocation (`Geolocator`), QR Scanner (`MobileScanner`), and Camera (`ImagePicker`).

---

## 3. UNIFIED DATA RETRIEVAL FLOW: DUAL-SOURCE PATTERN

To guarantee that the application functions seamlessly during network dropouts and exhibitions, repositories employ the **Read-Through Cache with Demo Fallback** pattern:

```
UI Request (e.g., loadActiveBookings)
   │
   ▼
Repository.getActiveBookings()
   │
   ├─► 1. Check Global App Mode: Is Standalone Demo Mode explicitly enabled?
   │      ├─► YES: Return DemoFixtureProvider.getBookings() immediately.
   │      └─► NO: Continue to Step 2.
   │
   ├─► 2. Read from Local Hive Cache:
   │      Emit cached data to UI (instant render with zero loading spinners).
   │
   ├─► 3. Check Network Connectivity:
   │      ├─► DISCONNECTED: Keep cached data displayed, set `isOfflineCache: true`.
   │      └─► CONNECTED: Continue to Step 4.
   │
   ├─► 4. Issue Remote HTTP Request (GET /api/bookings/my):
   │      ├─► SUCCESS:
   │      │     1. Update Local Hive Cache with fresh server payload.
   │      │     2. Emit fresh server data to UI.
   │      │
   │      └─► FAILURE / BACKEND FALLBACK FLAG:
   │            ├─► Server returned HTTP 500 or timeout:
   │            │     Retain cached data; if empty, emit DemoFixture fallback.
   │            └─► Server responded with `{ isFallback: true }`:
   │                  Render data with `Demo Data Indicator` badge.
```

---

## 4. WRITE OPERATION & OFFLINE QUEUE FLOW

Write operations (e.g., updating worker status, submitting reviews, filing complaints, or reading notifications) follow an **Optimistic Mutation with Persistent Queue** lifecycle:

```
User Action (e.g., Submit Review)
   │
   ▼
ReviewRepository.submitReview(reviewData)
   │
   ├─► 1. Generate unique client-side UUID: `op_id = uuid.v4()`
   ├─► 2. Optimistically update Local Hive Cache (review appears instantly)
   ├─► 3. Check Network Connectivity:
   │
   ├───► CONNECTED:
   │       POST /api/reviews
   │       ├─► HTTP 201 Created:
   │       │     Acknowledge mutation; reconcile server ID.
   │       └─► HTTP Error (Network dropped mid-flight / 503):
   │             Enqueue into Hive `SyncQueueBox` with retry count = 0.
   │
   └───► DISCONNECTED:
           Enqueue into Hive `SyncQueueBox` with status `pending`.
           Display subtle UI pill: "Saved offline. Will sync when online."
           Sync Engine listens to `ConnectivityResult` changes.
```

---

## 5. CROSS-ROLE SESSION ISOLATION

ServeCircle supports four distinct roles on the same codebase. The mobile architecture enforces strict session separation:

| Role | Room Identification | Home Route | Stored Session Key | Allowed Navigation Scope |
|---|---|---|---|---|
| **Customer** | `customer_<userId>` | `/customer/dashboard` | `servecircle_session` | `/customer/*`, `/browse`, `/services/*` |
| **Worker** | `worker_<userId>` | `/worker/dashboard` | `servecircle_worker_session` | `/worker/*` (governed by `workerStatus`) |
| **Admin** | `admin_room` | `/admin/dashboard` | `servecircle_session` | `/admin/*` |
| **B2B** | None (Polling/HTTP) | `/b2b/dashboard` | `servecircle_session` | `/b2b/*` |

- Multi-session preservation: Like the web application, a developer or tester can switch between customer and worker roles without wiping credentials, while the active route guard strictly denies cross-role screen access.
- In-memory active user notifier: `currentUserProvider` determines the active role, controls bottom navigation bars, and configures the active Socket.io room subscription.

---

## 6. EXHIBITION RESILIENCE DESIGN

During live college demonstrations, external WiFi or mobile data may be throttled, blocked by campus firewalls, or completely absent. The architecture guarantees:
1. **Zero-Crash Cold Launch:** App launches cleanly without internet; Hive loads cached sessions and fixture data.
2. **Deterministic Fallbacks:** AI smart diagnosis, booking creation, tracking, and wallet top-ups contain identical deterministic mock providers mirroring `server/utils/demoDataStore.js`.
3. **Data Source Transparency:** When running on mock/fallback data, an unobtrusive banner or badge (`● Live Backend` vs `○ Demo Simulation`) is displayed to maintain academic and technical integrity.
