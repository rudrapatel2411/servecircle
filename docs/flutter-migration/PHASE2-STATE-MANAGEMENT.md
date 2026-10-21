# PHASE 2: STATE MANAGEMENT ARCHITECTURE
## ServeCircle Mobile — Riverpod 2.x Unification Blueprint

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Selected Architecture:** **Flutter Riverpod 2.x (StateNotifier / AsyncNotifier)**  
**Target Roles:** Customer, Worker, Admin, B2B Partner  

---

## 1. STATE MANAGEMENT DECISION & RATIONALE

### 1.1 The Decision: Riverpod 2.x
The ServeCircle mobile application will exclusively use **Riverpod 2.x** (`flutter_riverpod`) using `StateNotifierProvider` and `AsyncNotifierProvider`. Competing state management solutions (Bloc, Provider, GetX, MobX) are explicitly rejected.

### 1.2 Evaluation Against Project Requirements

| Requirement | How Riverpod Solves It | Why Alternatives Were Rejected |
|---|---|---|
| **Multi-Role Authentication** | Global `authControllerProvider` controls current session, injects JWT into Dio, and triggers GoRouter redirects without context. | Standard `Provider` requires `BuildContext`, causing navigation guard lifecycle bugs. |
| **Real-time Socket Updates** | `StreamProvider` seamlessly maps raw Socket.io event emissions into reactive Dart objects. Notifiers listen to streams and merge updates. | `Bloc` requires verbose event/state boilerplate for 15+ real-time socket events across 4 roles. |
| **Real-Time GPS Tracking** | `trackingStreamProvider` consumes location updates and coordinates without rebuilding the entire screen widget tree. | `GetX` lacks compile-time safety and introduces hidden global state risks. |
| **Offline Cache & Sync Queue** | `SyncQueueNotifier` manages local Hive mutation queue with reactive count badge in top navigation. | `MobX` requires code generation for every observable and has poor stream integration. |
| **AI Diagnosis & Chat Streams** | `aiChatControllerProvider` provides immediate optimistic message rendering with async response state management. | Redux is excessively verbose for interactive camera/chat workflows. |
| **Testability & Exhibition Mode** | Riverpod allows `ProviderScope(overrides: [...])` to swap remote repositories for demo fixtures in single lines during automated tests and exhibition mode. | Context-dependent architectures make standalone testing complex. |

---

## 2. WHERE STATE LIVES

All application state is categorized into four well-defined scopes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. GLOBAL APP SCOPE (Unscoped, Application Lifecycle)                       │
│    • appConfigProvider (Environment, Base URL, Sockets)                     │
│    • themeModeProvider (Neomorphism palette tokens)                         │
│    • languageProvider (EN / HI / GU selection + numeral formatting)         │
│    • connectivityProvider (Online / Offline status stream)                  │
│    • syncQueueProvider (Pending offline mutations count & sync engine)      │
│    • demoModeProvider (Global exhibition simulation toggle)                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┴──────────────────────────────────────┐
│ 2. AUTHENTICATION & SESSION SCOPE                                           │
│    • authStateProvider (Current User, Role, JWT, Worker Approval Status)     │
│    • secureSessionProvider (Encrypted disk storage interface)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┴──────────────────────────────────────┐
│ 3. ROLE-SPECIFIC SCOPE (Active while logged into a role)                    │
│    ├── Customer:                                                            │
│    │   • customerDashboardProvider (Active bookings, quick stats)           │
│    │   • servicesCatalogProvider (Categories, services with search filter)  │
│    │   • activeBookingProvider(bookingId) (Tracking, OTP, worker details)   │
│    │   • customerWalletProvider (Authoritative balance & transactions)      │
│    │   • aiChatProvider (Message history, typing state, recommendation)     │
│    ├── Worker:                                                              │
│    │   • workerDashboardProvider (Pending job count, daily earnings)        │
│    │   • availableJobsProvider (Pending job pool with accept/reject)        │
│    │   • activeJobProvider(jobId) (OTP entry, photo attachments)            │
│    │   • workerEarningsProvider (Weekly breakdown & withdrawal balance)     │
│    ├── Admin:                                                               │
│    │   • adminDashboardStatsProvider (KPIs, active orders, revenue)         │
│    │   • adminBookingsProvider (Filterable order table with worker assign)  │
│    │   • workerVerificationQueueProvider (Pending KYC applications)         │
│    │   • adminComplaintsProvider (Open tickets, resolution dialog)          │
│    └── B2B Partner:                                                         │
│        • b2bContractsProvider (Active service agreements)                   │
│        • b2bInvoicesProvider (Due payments, invoice download)               │
│        • b2bLocationsProvider (Branch addresses & service schedules)        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┴──────────────────────────────────────┐
│ 4. TRANSIENT EPHEMERAL SCOPE (Screen-level, autoDispose)                    │
│    • bookingFlowFormStateProvider (Multi-step form state during checkout)   │
│    • reviewSubmissionFormStateProvider (Star rating, text, tags)            │
│    • imageUploadProgressProvider (Percentage upload progress)               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. HOW WIDGETS SUBSCRIBE TO STATE

Flutter screens and sub-widgets subscribe to state via Riverpod's `ConsumerWidget` or `ConsumerStatefulWidget` using three explicit subscription patterns:

### 3.1 Full State Watch (`ref.watch`)
Used when the entire screen needs to react to changes (e.g., rendering loading spinners or error states):
```dart
// Conceptual pattern - planning blueprint
class CustomerDashboardScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(customerDashboardControllerProvider);

    return dashboardState.when(
      data: (data) => DashboardContent(data: data),
      loading: () => const AppLoadingIndicator(),
      error: (err, stack) => AppErrorWidget(error: err, onRetry: () => ref.refresh(customerDashboardControllerProvider)),
    );
  }
}
```

### 3.2 Granular Property Selection (`ref.watch.select`)
Used inside list items and child widgets to prevent unnecessary rebuilds:
```dart
// Conceptual pattern - planning blueprint
class WalletBalanceHeader extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final balance = ref.watch(customerWalletControllerProvider.select((state) => state.balance));
    return Text('₹$balance', style: AppTypography.headingLarge);
  }
}
```

### 3.3 Event Listening (`ref.listen`)
Used for imperative one-time UI feedback such as displaying Snackbars, dialogs, or triggering navigation:
```dart
// Conceptual pattern - planning blueprint
ref.listen<AuthState>(authControllerProvider, (previous, next) {
  if (next.isSessionExpired) {
    AppSnackBar.showError(context, 'Your session has expired. Please sign in again.');
    context.go('/login?expired=true');
  }
});
```

---

## 4. HOW API RESPONSES UPDATE STATE

Every API call transitions through a strict AsyncValue lifecycle within the feature controller:

```
UI Action Triggered (e.g., loadActiveBookings)
   │
   ▼
Controller sets state = const AsyncValue.loading()
   │
   ▼
Repository.fetchActiveBookings()
   │
   ├─► Network Success (HTTP 200):
   │     1. Repository saves payload to Hive Cache.
   │     2. Controller updates state = AsyncValue.data(freshBookings).
   │     3. UI re-renders with fresh data.
   │
   └─► Network Failure (Offline / Timeout / Server Error):
         1. Repository inspects Hive Cache for existing stale data.
         2. If cached data exists:
              Controller updates state = AsyncValue.data(cachedBookings) with `isOfflineStale = true`.
              UI displays cached data with an offline advisory badge.
         3. If no cache exists:
              Controller updates state = AsyncValue.error(failure, stackTrace).
              UI displays retryable AppErrorWidget.
```

---

## 5. HOW SOCKET.IO EVENTS UPDATE STATE

Socket events are received by the singleton `SocketManager` and exposed as typed Dart `Stream` instances. Feature controllers subscribe to these streams upon initialization:

```
Server Emits Event (e.g., `booking_status_changed`)
   │
   ▼
SocketManager receives raw JSON payload
   │
   ▼
SocketManager parses JSON to `BookingStatusChangedEvent` DTO
   │
   ▼
Dispatched via `StreamController<BookingStatusChangedEvent>`
   │
   ▼
`bookingStatusEventStreamProvider` emits event
   │
   ▼
Active Controllers Subscribed (e.g., LiveTrackingController, CustomerDashboardController)
   │
   ├─► Update local in-memory booking model (status = 'started', eta = '10 min')
   ├─► Update local Hive cache with new booking state
   └─► Notify UI: UI steps automatically advance from "Arrived" to "Started" without full screen reload!
```

---

## 6. HOW OFFLINE CHANGES UPDATE STATE

When a user executes a mutation while disconnected (e.g., marking a notification as read or submitting a review):

```
User Taps "Mark as Read" (Offline)
   │
   ▼
NotificationController.markAsRead(notificationId)
   │
   ├─► 1. Optimistic Local State Update:
   │      Controller updates in-memory list: `notification.isRead = true`.
   │      Controller updates Hive `notifications_box`.
   │      UI instantly updates (unread count badge decrements immediately).
   │
   ├─► 2. Offline Queue Registration:
   │      `SyncEngine.enqueue(operation: 'MARK_NOTIFICATION_READ', payload: { id: notificationId })`.
   │      `syncQueueProvider` increments pending queue count (`pendingOperationsCount = 1`).
   │      Top app bar displays subtle cloud sync icon: "1 pending update".
   │
   └─► 3. Background Reconciliation (When internet returns):
          SyncEngine executes queued HTTP PUT request.
          Server acknowledges success.
          SyncEngine removes operation from queue; pending count decrements to 0.
```
