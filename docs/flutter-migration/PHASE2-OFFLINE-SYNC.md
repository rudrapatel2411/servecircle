# PHASE 2: OFFLINE-FIRST ARCHITECTURE & SYNC ENGINE
## ServeCircle Mobile — Cache Topology, Mutation Queue & Eventual Consistency Blueprint

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Primary Persistence Engine:** `Hive` (Box storage) + `flutter_secure_storage` (Keystore/Keyring)  

---

## 1. PERSISTENCE ENGINE SELECTION & TOPOLOGY

### 1.1 Why Hive + FlutterSecureStorage?
- **Hive:** Blazing-fast pure Dart NoSQL key-value database. Zero native SQLite dependencies, instant cold startup (critical for low-end Android exhibition tablets), and simple box partitioning.
- **FlutterSecureStorage:** Uses Android Keystore (AES-256 GCM) strictly for sensitive credentials (JWT, refresh tokens, user PINs), avoiding plaintext disk vulnerabilities.

### 1.2 Storage Partitioning & Box Inventory

| Hive Box Name | Contents | Storage Format | TTL / Invalidation Policy | Security Level |
|---|---|---|---|---|
| `auth_box` | Active session metadata (role, user profile) | JSON String | Purged on explicit Logout or 401 | Standard disk |
| `services_box` | All service catalogs & 14 category hubs | List<ServiceModel> | 24 Hours (Refreshed on app startup if online) | Standard disk |
| `bookings_box` | Active & historical bookings (per role) | Map<id, Booking> | Invalidate on pull-to-refresh or Socket event | Standard disk |
| `wallet_box` | Authoritative balance & transaction history | WalletDTO | Refreshed on screen entry | Standard disk |
| `notifications_box`| Notification messages & unread counter | List<NotificationDTO>| Appended on Socket event, kept for 14 days | Standard disk |
| `sync_queue_box` | Pending offline write mutations | List<SyncOperation>| Persistent until server acknowledgement | Standard disk |
| `demo_fixtures_box`| Pre-baked exhibition demo entities | JSON String | Static / Never expires | Read-only |
| *Android Keystore* | Auth JWT (`token`), Refresh Token | Encrypted Key-Value | Cleared on Logout or 401 | Encrypted Keystore |

---

## 2. OFFLINE MUTATION PERMISSION & QUEUE MATRIX

Not every operation can be safely executed offline. Financial payments, live OTP validations, and user registrations require real-time backend validation. The table below establishes strict business boundaries:

| Operation | Offline Allowed? | Queued in Hive? | Max Retries | Conflict Resolution Rule | User Feedback Mode |
|---|---|---|---|---|---|
| **Update User Profile** | YES | YES | 5 | Last-write-wins (client timestamp) | Instant UI change + "Sync pending" pill |
| **Accept Job (Worker)** | YES | YES | 3 | Server state wins (if reassigned, show error) | Optimistic accept + rollback if taken |
| **Reject Job (Worker)** | YES | YES | 3 | Server state wins | Optimistic remove from pending list |
| **Start Job with OTP** | NO | NO | 0 | Real-time backend validation required | Error modal: "Internet required to verify OTP" |
| **Upload Job Photos** | YES | YES | 5 | Staged local image path; uploaded in background | Image preview shown immediately with upload queue |
| **Complete Job (Worker)** | YES | YES | 5 | Server state wins | Job marked completed locally + sync queued |
| **Submit Review** | YES | YES | 5 | Client-generated UUID prevents duplicate | Instant display in user reviews + sync pill |
| **File Complaint** | YES | YES | 5 | Client-generated UUID | Ticket marked "Draft pending sync" |
| **Mark Notification Read**| YES | YES | Unlimited | Idempotent PUT; union on server | Badge decrements immediately |
| **Create Booking** | NO (EXHIBITION EXCEPTION: YES in Demo Mode) | Only in Demo Mode | 3 | Demo creates local booking; Real requires server | Live mode requires network; Demo creates instantly |
| **Wallet Topup / Payment**| NO | NO | 0 | Server-side cryptographic balance verification | Modal: "Payment requires active connection" |

---

## 3. OFFLINE MUTATION QUEUE ENTITY SCHEMA

Every queued operation is stored in Hive `sync_queue_box` with the following contract:

```dart
// Conceptual model blueprint
class SyncOperation {
  final String id;             // Client-generated UUID (v4)
  final String operationType;  // e.g., 'ACCEPT_JOB', 'SUBMIT_REVIEW', 'MARK_READ'
  final String endpoint;       // e.g., '/api/bookings/65e9f1/accept'
  final String httpMethod;     // 'POST', 'PUT', 'DELETE'
  final Map<String, dynamic> payload; // Request JSON body
  final DateTime createdAt;    // Timestamp when user triggered action
  final int retryCount;        // Current attempt count (0 to 5)
  final String? localFilePath; // Local file path if operation includes multipart image

  SyncOperation({
    required this.id,
    required this.operationType,
    required this.endpoint,
    required this.httpMethod,
    required this.payload,
    required this.createdAt,
    this.retryCount = 0,
    this.localFilePath,
  });
}
```

---

## 4. SYNC ENGINE EXECUTION & RECONCILIATION LIFECYCLE

```
                              NETWORK MONITOR (connectivity_plus)
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
                 INTERNET LOST                                 INTERNET RESTORED
                        │                                             │
                        ▼                                             ▼
             Set `isOffline = true`                       Set `isOffline = false`
            Display top offline banner                                │
                        │                                             ▼
                        ▼                                   SyncEngine.triggerSync()
         User performs allowed mutation                               │
                        │                                             ▼
                        ▼                               Read `sync_queue_box` (FIFO order)
            Save to `sync_queue_box`                                  │
          Optimistically update cache                                 ▼
                                                        Iterate over queued operations:
                                                        ┌─────────────────────────────┐
                                                        │ Send HTTP Request via Dio   │
                                                        └──────────────┬──────────────┘
                                                                       │
                                             ┌─────────────────────────┴─────────────────────────┐
                                             ▼                                                   ▼
                                        HTTP 200 / 201                                      HTTP 4xx / 5xx
                                       (Success Acknowledgement)                             (Failure / Conflict)
                                             │                                                   │
                                             ▼                                                   ▼
                                 Remove from `sync_queue_box`                      Increment `retryCount`
                                 Reconcile local ID with server ID                 Check Conflict Rules:
                                             │                                     • 409 Conflict: Revert optimistic state
                                             ▼                                     • 500 Server: Exponential backoff
                                 Refresh active Socket rooms                       • Retry count > 5: Mark failed & alert
                                             │
                                             ▼
                                 All operations completed?
                                 ┌───────────┴───────────┐
                                 ▼                       ▼
                              YES                        NO
                               │                         │
                               ▼                         ▼
                    Hide "Syncing..." spinner     Continue with next item
                    Show "All changes saved"
```

---

## 5. CONFLICT RESOLUTION & ID RECONCILIATION

### 5.1 Client-Side UUID Strategy
To prevent duplicate records on the server when a network drops mid-request:
1. Every newly created entity (e.g., Review, Complaint, Note) is assigned a `clientMutationId: UUIDv4`.
2. The backend route handlers inspect `req.body.clientMutationId`.
3. If an entity with the same `clientMutationId` already exists, the server returns the existing document with HTTP 200 instead of inserting a duplicate.

### 5.2 Rollback on Irreconcilable Conflict
If a worker accepts a job offline, but during the offline window another worker accepted the same job online:
1. Server returns `HTTP 409 Conflict: { message: "Job already assigned to another pro" }`.
2. The `SyncEngine` catches the 409 status code.
3. The optimistic booking is removed from the worker's active list in Hive.
4. An actionable in-app banner notifies the worker: *"Job #BK-492 was claimed by another pro while you were offline."*

---

## 6. USER SYNC FEEDBACK WIDGETS

To maintain user trust, the UI provides unambiguous indicators:
- **`OfflineBanner`:** A persistent, non-intrusive slate-orange banner pinned beneath the App Bar when offline: *"You're offline. Changes are saved locally and will sync automatically."*
- **`SyncProgressIcon`:** An animated cloud icon in the dashboard header displaying current pending queue items (`● 2 pending`).
- **`SyncSuccessSnackbar`:** A brief green toast appearing once all pending items have synced: *"All offline changes synced with server."*
