# 07 — OFFLINE SYNC AUDIT
## ServeCircle Flutter Migration — Offline Behavior & Data Persistence Analysis

**Source:** Verified from server/utils/demoAuthStore.js, server/utils/demoDataStore.js, server/server.js, client/src/utils/authSession.js

---

## EXECUTIVE SUMMARY

The current ServeCircle system has a **server-side demo/fallback layer** only.
The web client has **zero offline capability** — no service workers, no IndexedDB, no local caches.

For Flutter, a carefully designed offline strategy is required for:
1. Session persistence between app launches
2. Graceful degradation when server is unreachable
3. Demo mode functionality (for TestFlight/dev builds without live backend)

---

## SERVER-SIDE OFFLINE ARCHITECTURE (VERIFIED)

### MongoDB Connection Detection
```javascript
// server.js
mongoose.connect(process.env.MONGODB_URI, {
  bufferCommands: false, // IMPORTANT: Disables command buffering — fails fast
}).catch(() => {
  console.warn('[DB] MongoDB unavailable — running in demo/fallback mode');
});
```

### Key Server Behavior
- All route handlers check: `mongoose.connection.readyState !== 1`
- If DB is down ? routes return from in-memory fallback stores
- `bufferCommands: false` means MongoDB operations fail immediately (no queue)
- Server starts successfully even if MongoDB is completely unavailable

### Demo/Fallback Data Stores (server/utils/demoDataStore.js)
These in-memory arrays serve as fallbacks when MongoDB is unavailable:

| Store Variable | Contents |
|---------------|---------|
| DEMO_BOOKINGS | Pre-seeded booking array |
| DEMO_TRANSACTIONS | Pre-seeded wallet transaction array |
| DEMO_REVIEWS | Pre-seeded review array |
| DEMO_COMPLAINTS | Pre-seeded complaint array |
| DEMO_COUPONS | Pre-seeded coupon array |
| DEMO_CONTRACTS | Pre-seeded B2B contract array |
| DEMO_INVOICES | Pre-seeded B2B invoice array |
| DEMO_NOTIFICATIONS | Pre-seeded notification array |
| DEMO_PARTNERS | Pre-seeded partner array |

### Demo Auth Store (server/utils/demoAuthStore.js)
```javascript
export const DEMO_USERS = [
  { _id: '6a5f4c90437c4810f45fe0e9', name: 'Rudra Shah', email: 'rudra@test.com',
    password: 'test123', role: 'customer', subscription: 'gold', walletBalance: 2450 },
  { _id: '6a5f4c90437c4810f45fe0eb', name: 'Ramesh Kumar', email: 'ramesh@test.com',
    password: 'test123', role: 'worker', workerStatus: 'approved_senior', isVerified: true },
  { _id: '6a5f4c90437c4810f45fe0e7', name: 'Admin', email: 'admin@servecircle.in',
    password: 'admin123', role: 'admin' },
  { _id: '6a5f4c90437c4810f45fe0ee', name: 'Green Valley Manager', email: 'gv@test.com',
    password: 'test123', role: 'b2b', companyName: 'Green Valley Society' },
];
export const IN_MEMORY_USERS = []; // For new registrations during demo mode
```

---

## CLIENT-SIDE OFFLINE AUDIT (VERIFIED)

### Web Client: Zero Offline Support
| Feature | Implementation | Status |
|---------|---------------|--------|
| Service Worker | None | ? Not implemented |
| IndexedDB | None | ? Not implemented |
| Cache API | None | ? Not implemented |
| localStorage | Session token only | ?? Token persisted only |
| Offline detection | None | ? Not implemented |
| Request queue | None | ? Not implemented |
| Optimistic updates | None | ? Not implemented |

### Token Persistence (Web)
```javascript
// authSession.js
localStorage.setItem('servecircle_session', JSON.stringify({ token, user }));
// Token is read on every page load via getSession()
// No expiry check on client — 401 from server forces re-login (manual)
```

### API Error Handling (Web)
```javascript
// authSession.js — requestApi()
if (!response.ok) {
  throw new Error(data?.message || 'Request failed');
}
// Pages catch errors in try/catch and show error state
// NO automatic retry, NO offline queue
```

---

## AI SUBSYSTEM OFFLINE BEHAVIOR (VERIFIED)

### Server AI Fallback
When AI providers are unavailable, the customer AI chat uses:
1. Local `classifyIntent()` — intent classification without external AI
2. `CANONICAL_SERVICES` mapping — hardcoded service catalog (20 services)
3. `generalMessage()` — multilingual canned responses
4. `buildAssistantMessage()` — template response builder

This means the customer AI chat remains functional even if Gemini/Groq APIs are down.

### AI Provider Fallback Chain
```
1. Try AIProviderManager.chatWithCustomer() (Gemini/Groq)
2. If fails ? set aiResponse = null
3. Local intent classification ? matchedCanonical from CANONICAL_SERVICES
4. Return service recommendation without AI analysis
```

---

## FLUTTER OFFLINE STRATEGY (REQUIRED)

### 1. Session Persistence (MUST IMPLEMENT)
```dart
// flutter_secure_storage
const storage = FlutterSecureStorage();
await storage.write(key: 'servecircle_session', value: jsonEncode({ token, user }));

// On app start
final raw = await storage.read(key: 'servecircle_session');
```

### 2. Cached User Profile (RECOMMENDED)
```dart
// Cache user object locally after login
// If server unreachable on startup, use cached profile for UI display
// Show "offline mode" banner
// Block booking actions when offline
```

### 3. Optimistic Booking Status (OPTIONAL)
```dart
// Cache last-known booking status in SharedPreferences/Hive
// Show stale status with "last updated X min ago" badge
// Refresh on app foreground
```

### 4. Services Catalog Cache (RECOMMENDED)
```dart
// Cache services list in Hive/SQLite after first load
// Serve from cache when offline
// Show "Offline — showing cached data" notice
// Invalidate cache after 24 hours or on manual refresh
```

### 5. AI Chat (LOCAL FALLBACK — OPTIONAL)
The server already handles AI fallback. Flutter should:
- Show "AI may take longer" message if AI health check returns degraded
- NOT implement local AI — rely on server fallback

### 6. Offline Booking Attempt (MUST HANDLE)
```dart
// Detect offline before booking
if (!isConnected) {
  showDialog("You are offline. Please check your connection.");
  return;
}
// Never attempt to queue bookings offline — OTP flow requires server
```

### 7. Background Refresh
```dart
// Use workmanager or flutter_background_fetch for:
// - Periodic booking status check
// - Notification polling (if socket disconnects)
```

---

## PACKAGE RECOMMENDATIONS

| Need | Package | Notes |
|------|---------|-------|
| Secure token storage | flutter_secure_storage | Required |
| Offline detection | connectivity_plus | Required |
| Disk cache (services) | hive / isar | Recommended |
| Background sync | workmanager | Optional |
| HTTP with retry | dio (with interceptors) | Recommended |
| Push notifications | firebase_messaging | For background push |

---

## DATA PERSISTENCE PRIORITY TABLE

| Data | Flutter Storage | When to Invalidate |
|------|----------------|---------------------|
| JWT token + user | flutter_secure_storage | On logout / 401 |
| Services catalog | Hive/Isar | 24h TTL or on pull-to-refresh |
| Active booking status | SharedPreferences | Every foreground resume |
| Wallet balance | In-memory (fetch on demand) | Never cache long-term |
| Notifications | In-memory | On read |
| i18n translations | Bundled in app | Per app release |
