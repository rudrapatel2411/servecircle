# PHASE 2: AUTHENTICATION, SESSION & ROUTING ARCHITECTURE
## ServeCircle Mobile — GoRouter Configuration, Role Guards & Deep Link Matrix

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Navigation Engine:** `go_router: ^14.0.0`  
**Web Baseline:** 82 routes mapped from `client/src/App.jsx` and `01-PHASE1-AUDIT.md`  

---

## 1. AUTHENTICATION & SESSION RESTORATION LIFECYCLE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APP COLD BOOT (main.dart)                        │
│                                                                             │
│  1. Initialize Hive Boxes & SecureStorageService                            │
│  2. Read stored session from `auth_box` / Keystore                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SESSION RESTORATION & TOKEN VALIDATION                │
│                                                                             │
│  Token exists in storage?                                                   │
│    ├── NO  ──► Set AuthState.unauthenticated() ──► Route to `/login`         │
│    └── YES ──► Decode JWT Claims (Expiration Timestamp):                     │
│                  ├── Is Expired? (current_time >= exp):                      │
│                  │     1. Purge session from disk                            │
│                  │     2. Set AuthState.expired()                            │
│                  │     3. Route to `/login?expired=true`                     │
│                  └── Is Valid (or Demo Token):                               │
│                        1. Set AuthState.authenticated(user, role, token)     │
│                        2. Trigger SocketManager.connect(token, role, userId) │
│                        3. Route to Role Home Route                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. GOROUTER ROLE-BASED REDIRECTION GUARDS

The GoRouter `redirect` callback acts as the single security barrier preventing unauthorized cross-role access:

```dart
// Conceptual redirect guard logic
String? appRouteGuard(BuildContext context, GoRouterState state) {
  final authState = ref.read(authControllerProvider);
  final isLoggingIn = state.matchedLocation == '/login' || 
                        state.matchedLocation == '/register' || 
                        state.matchedLocation == '/worker/register';

  // 1. Unauthenticated users cannot access protected routes
  if (!authState.isAuthenticated) {
    return isLoggingIn ? null : '/login';
  }

  // 2. Authenticated users visiting login/register redirect to their role home
  if (isLoggingIn) {
    return _getRoleHome(authState.role);
  }

  // 3. Role boundary enforcement
  final currentPath = state.matchedLocation;
  if (currentPath.startsWith('/customer') && authState.role != 'customer') {
    return _getRoleHome(authState.role);
  }
  if (currentPath.startsWith('/worker')) {
    if (authState.role != 'worker') return _getRoleHome(authState.role);
    // Worker status gate
    if (authState.user.workerStatus != 'approved' && 
        !authState.user.workerStatus.startsWith('approved_') && 
        currentPath != '/worker/auth-prompt') {
      return '/worker/auth-prompt';
    }
  }
  if (currentPath.startsWith('/admin') && authState.role != 'admin') {
    return _getRoleHome(authState.role);
  }
  if (currentPath.startsWith('/b2b') && authState.role != 'b2b') {
    return _getRoleHome(authState.role);
  }

  return null; // Allowed to proceed
}

String _getRoleHome(String role) {
  switch (role) {
    case 'worker': return '/worker/dashboard';
    case 'admin': return '/admin/dashboard';
    case 'b2b': return '/b2b/dashboard';
    case 'customer':
    default: return '/customer/dashboard';
  }
}
```

---

## 3. EXHAUSTIVE WEB-TO-FLUTTER ROUTE MAPPING TABLE (82 WEB ROUTES)

The web platform features 82 distinct route paths. In Flutter mobile, these are structured cleanly into cohesive parent views, detail screens, modal bottom sheets, and tab views:

| Web Route | Flutter Route | Target Role | Protected? | Route Parameters / Query | Deep Link Supported? |
|---|---|---|---|---|---|
| **PUBLIC & AUTH** | | | | | |
| `/` | `/login` (or role home) | All | No | None | No |
| `/login` | `/login` | Public | No | `?expired=true`, `?returnUrl=` | No |
| `/register` | `/register` | Public | No | None | No |
| `/worker/register` | `/worker/register` | Public | No | None | No |
| `/verify/worker/:workerId` | `/verify/worker/:workerId` | Public | No | `:workerId` | **YES** (`servecircle://verify/worker/123`) |
| **CUSTOMER PANEL** | | | | | |
| `/customer/dashboard` | `/customer/dashboard` | Customer | Yes | None | No |
| `/browse-services` | `/customer/services` | Customer | Yes | `?category=`, `?search=` | No |
| `/service-detail/:id` | `/customer/services/:id` | Customer | Yes | `:id` | No |
| `/ai-smart-diagnosis` | `/customer/ai-diagnosis` | Customer | Yes | None | No |
| `/customer-ai-chat` | `/customer/ai-chat` | Customer | Yes | `?initialPrompt=` | No |
| `/booking-flow` | `/customer/book` | Customer | Yes | `?serviceId=` | No |
| `/payment` | Sheet: `PaymentModal` | Customer | Yes | `:bookingId` | No |
| `/booking-history` | `/customer/history` | Customer | Yes | `?filter=active\|past` | No |
| `/live-tracking` | `/customer/tracking/:id` | Customer | Yes | `:id` (Booking ID) | **YES** (`servecircle://tracking/BK-123`) |
| `/post-service-review` | `/customer/review/:id` | Customer | Yes | `:id` (Booking ID) | No |
| `/customer-reviews` | `/customer/my-reviews` | Customer | Yes | None | No |
| `/customer-wallet` | `/customer/wallet` | Customer | Yes | None | No |
| `/customer-subscriptions` | `/customer/subscriptions` | Customer | Yes | None | No |
| `/emergency-hub` | `/customer/hubs/emergency`| Customer | Yes | None | No |
| `/events-hub` | `/customer/hubs/events` | Customer | Yes | None | No |
| `/relocation-hub` | `/customer/hubs/relocation`| Customer | Yes | None | No |
| `/travel-commute-hub` | `/customer/hubs/travel` | Customer | Yes | None | No |
| `/food-kitchen-hub` | `/customer/hubs/food` | Customer | Yes | None | No |
| `/pet-hub` | `/customer/hubs/pet` | Customer | Yes | None | No |
| `/health-wellness-hub` | `/customer/hubs/health` | Customer | Yes | None | No |
| `/society-management-hub` | `/customer/hubs/society` | Customer | Yes | None | No |
| `/vehicle-services-hub` | `/customer/hubs/vehicle` | Customer | Yes | None | No |
| `/my-home-dashboard` | `/customer/my-home` | Customer | Yes | None | No |
| `/trust-safety` | `/customer/trust-safety`| Customer | Yes | None | No |
| `/homefixr-warranty` | `/customer/warranty` | Customer | Yes | None | No |
| `/video-consultation` | `/customer/video-consult`| Customer | Yes | None | No |
| `/group-booking` | `/customer/group-book` | Customer | Yes | None | No |
| `/global-search` | Sheet: `AppSearchBar` | Customer | Yes | `?q=` | No |
| `/ordered-services` | `/customer/history` | Customer | Yes | Tab: Ordered | No |
| `/customer/profile` | `/customer/profile` | Customer | Yes | None | No |
| `/customer/settings` | `/customer/settings` | Customer | Yes | None | No |
| `/premium-flow-*` (4 routes)| `/customer/demo-flow/:id`| Customer| Yes | `:id` | No |
| **WORKER PANEL** | | | | | |
| `/worker/dashboard` | `/worker/dashboard` | Worker | Yes (Approved)| None | No |
| `/worker/jobs` | `/worker/jobs` | Worker | Yes (Approved)| `?tab=available\|active`| No |
| `/worker/job-detail/:id` | `/worker/jobs/:id` | Worker | Yes (Approved)| `:id` | No |
| `/worker/schedule` | `/worker/schedule` | Worker | Yes (Approved)| None | No |
| `/worker/earnings` | `/worker/earnings` | Worker | Yes (Approved)| None | No |
| `/worker/training` | `/worker/training` | Worker | Yes (Approved)| None | No |
| `/worker/profile` | `/worker/profile` | Worker | Yes | None | No |
| `/become-a-pro-hub` | `/worker/become-a-pro` | Public/Worker| No | None | No |
| `/worker/auth-prompt` | `/worker/auth-prompt` | Worker | Yes (Pending) | `?status=` | No |
| **ADMIN PANEL** | | | | | |
| `/admin/dashboard` | `/admin/dashboard` | Admin | Yes | None | No |
| `/admin/bookings` | `/admin/bookings` | Admin | Yes | `?status=` | No |
| `/admin/workers` | `/admin/workers` | Admin | Yes | `?verification=pending`| No |
| `/admin/worker/:id/idcard` | `/admin/workers/:id/idcard`| Admin| Yes | `:id` | No |
| `/admin/complaints` | `/admin/complaints` | Admin | Yes | `?filter=open` | No |
| `/admin/coupons` | `/admin/coupons` | Admin | Yes | None | No |
| `/admin/partners` | `/admin/partners` | Admin | Yes | None | No |
| `/admin/notifications` | `/admin/notifications` | Admin | Yes | None | No |
| `/admin/analytics` | `/admin/analytics` | Admin | Yes | `?range=month` | No |
| `/admin/b2b-dashboard` | `/admin/b2b` | Admin | Yes | None | No |
| `/admin/b2b-contracts` | `/admin/b2b/contracts` | Admin | Yes | None | No |
| `/admin/b2b-locations` | `/admin/b2b/locations` | Admin | Yes | None | No |
| `/admin/b2b-invoices` | `/admin/b2b/invoices` | Admin | Yes | None | No |
| **B2B CLIENT PORTAL** | | | | | |
| `/b2b/dashboard` | `/b2b/dashboard` | B2B | Yes | None | No |
| `/b2b/services` | `/b2b/services` | B2B | Yes | None | No |
| `/b2b/contracts` | `/b2b/contracts` | B2B | Yes | None | No |
| `/b2b/contract-detail/:id` | `/b2b/contracts/:id` | B2B | Yes | `:id` | No |
| `/b2b/locations` | `/b2b/locations` | B2B | Yes | None | No |
| `/b2b/team` | `/b2b/team` | B2B | Yes | None | No |
| `/b2b/invoices` | `/b2b/invoices` | B2B | Yes | None | No |
| `/b2b/history` | `/b2b/history` | B2B | Yes | None | No |
| `/b2b/support` | `/b2b/support` | B2B | Yes | None | No |

---

## 4. DEEP LINKING INTEGRATION

Android App Links / Intent Filters are configured for instant hardware interactions:

1. **Worker QR Code Verification:**
   - URL Pattern: `https://servecircle.com/verify/worker/:workerId` or `servecircle://verify/worker/:workerId`
   - When scanned via standard Android Camera or QR scanner, Android directly opens `WorkerVerificationScreen(workerId: workerId)`.
2. **Customer Live Booking Notification:**
   - Push / Socket Link: `servecircle://tracking/:bookingId`
   - Directly launches `LiveTrackingScreen(bookingId: bookingId)` with animated map and OTP reveal.
