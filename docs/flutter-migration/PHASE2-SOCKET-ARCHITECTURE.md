# PHASE 2: SOCKET.IO REAL-TIME ARCHITECTURE
## ServeCircle Mobile — Full Real-Time Lifecycle, Multi-Role Rooms & Event Streams

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Package:** `socket_io_client: ^2.0.3+1`  
**Server Baseline:** Verified server-side Socket.io implementation (`server/server.js`)  

---

## 1. SOCKET.IO LIFECYCLE & MULTI-ROLE FLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APP LAUNCH / AUTHENTICATION                      │
│                                                                             │
│  User Logs In / Session Restored ──► Riverpod AuthState (role, userId, jwt) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SOCKET MANAGER INITIALIZATION & CONNECT                 │
│                                                                             │
│  SocketManager.init(url, jwt)                                               │
│  • Transport: ['websocket', 'polling']                                      │
│  • Auth: { token: jwt }                                                     │
│  • autoConnect: false (Explicit connect on session ready)                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ socket.on('connect')
┌─────────────────────────────────────────────────────────────────────────────┐
│                     AUTOMATIC ROLE-BASED ROOM SUBSCRIPTION                  │
│                                                                             │
│   ├── Admin  ──► emit('join_admin')              ──► Server joins 'admin_room'
│   ├── Worker ──► emit('join_worker', workerId)   ──► Server joins 'worker_<id>'
│   └── Customer► emit('join_customer', customerId)──► Server joins 'customer_<id>'
│   (B2B uses polling / notifications API + customer room if user account matches)
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TYPED EVENT INGESTION & DISPATCH                      │
│                                                                             │
│  socket.on(eventName, (data) => _handleIncomingPayload(eventName, data))    │
│  • admin_notification     ──► AdminNotificationEvent DTO ──► StreamController
│  • worker_notification    ──► WorkerNotificationEvent DTO──► StreamController
│  • customer_notification  ──► CustNotificationEvent DTO  ──► StreamController
│  • booking_status_changed ──► BookingStatusChangedDTO    ──► StreamController
│  • booking_assigned       ──► JobAssignmentDTO           ──► StreamController
│  • worker_location_update ──► WorkerLocationDTO          ──► StreamController
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RIVERPOD STATE CONSUMPTION & UI MUTATION                 │
│                                                                             │
│  StreamProvider listens to typed controllers ──► Feature Controllers update  │
│  • LiveTrackingController: Marker moves on map & Step indicator advances   │
│  • WorkerJobsController: New job card appears with accept/reject audio chime│
│  • AdminDashboardController: KPI counters increment in real-time            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ROOM SUBSCRIPTION MATRIX

| Role | Client Emit Event | Payload | Server-Side Destination Room | Server Handler Source |
|---|---|---|---|---|
| **Admin** | `join_admin` | None | `admin_room` | `server.js` (`socket.join('admin_room')`) |
| **Worker** | `join_worker` | `workerId: String` | `worker_{workerId}` | `server.js` (`socket.join('worker_' + id)`) |
| **Customer** | `join_customer` | `customerId: String` | `customer_{customerId}` | `server.js` (`socket.join('customer_' + id)`) |
| **B2B** | `join_customer` (if auth user) | `b2bUserId: String` | `customer_{b2bUserId}` | Inherited customer event stream |

---

## 3. EXHAUSTIVE SERVER-TO-CLIENT EVENT INVENTORY

### 3.1 `admin_notification`
- **Destination:** `admin_room`
- **Triggered By:** Customer filing a complaint (`POST /api/complaints`), worker KYC submission, or critical system events.
- **Payload Schema:**
  ```json
  {
    "type": "NEW_COMPLAINT" | "WORKER_KYC_SUBMITTED" | "SYSTEM_ALERT",
    "complaintId": "string",
    "customerName": "string",
    "category": "string",
    "urgency": "high",
    "message": "string",
    "timestamp": "ISO8601"
  }
  ```
- **Flutter Destination:** `adminNotificationsControllerProvider` (increments unread bell badge, inserts into in-memory list, plays subtle notification sound).

### 3.2 `worker_notification` / `booking_assigned`
- **Destination:** `worker_{workerId}`
- **Triggered By:** Customer creating an instant booking or Admin assigning a worker (`POST /api/bookings/:id/assign`).
- **Payload Schema:**
  ```json
  {
    "type": "JOB_ASSIGNED",
    "bookingId": "string",
    "serviceName": "AC Master Servicing",
    "customerName": "Rudra Shah",
    "address": "402, Shivalik High Street, Ahmedabad",
    "totalAmount": 1299,
    "scheduledTime": "Today, 4:00 PM"
  }
  ```
- **Flutter Destination:** `workerJobsControllerProvider` (auto-prepends new job to the pending pool, displays high-priority in-app banner with Accept/Reject actions).

### 3.3 `customer_notification`
- **Destination:** `customer_{customerId}`
- **Triggered By:** Admin resolving complaint, refund issued, or promotional broadcast.
- **Payload Schema:**
  ```json
  {
    "type": "COMPLAINT_RESOLVED" | "WALLET_REFUND" | "PROMO",
    "title": "Complaint Resolved",
    "message": "Your complaint #CMP-8941 has been resolved by Admin.",
    "timestamp": "ISO8601"
  }
  ```
- **Flutter Destination:** `customerNotificationsControllerProvider`.

### 3.4 `booking_status_changed` / `booking_status_update`
- **Destination:** `customer_{customerId}` and `worker_{workerId}`
- **Triggered By:** Worker updating job status (Accepted → Dispatched → Arrived → Started → Completed).
- **Payload Schema:**
  ```json
  {
    "bookingId": "string",
    "status": "dispatched" | "arrived" | "started" | "completed",
    "activeStep": 1 | 2 | 3 | 4,
    "eta": "12 mins",
    "workerLocation": {
      "lat": 23.0338,
      "lng": 72.5850
    },
    "otpVerified": true,
    "timestamp": "ISO8601"
  }
  ```
- **Flutter Destination:** `liveTrackingControllerProvider` and `customerDashboardControllerProvider` (instantly updates stepper progress without page refresh).

### 3.5 `worker_location_update`
- **Destination:** `customer_{customerId}`
- **Triggered By:** Native background location broadcast from Worker's phone during "Dispatched" and "Arriving" states.
- **Payload Schema:**
  ```json
  {
    "bookingId": "string",
    "workerId": "string",
    "coordinates": {
      "latitude": 23.033863,
      "longitude": 72.585022
    },
    "bearing": 45.2,
    "speed": 18.5,
    "etaMinutes": 8
  }
  ```
- **Flutter Destination:** `liveTrackingControllerProvider` (animates vehicle marker along polyline).

---

## 4. RECONNECTION, ERROR & TEARDOWN POLICIES

### 4.1 Automatic Re-Registration on Reconnect
When network connection drops and resumes, Socket.io triggers its internal `reconnect` sequence. `SocketManager` hooks into the `connect` callback to guarantee room membership is never lost:
```dart
// Conceptual blueprint in SocketManager
socket.on('connect', (_) {
  final session = ref.read(authStateProvider);
  if (session.isAuthenticated) {
    if (session.role == 'admin') {
      socket.emit('join_admin');
    } else if (session.role == 'worker') {
      socket.emit('join_worker', session.user.id);
    } else if (session.role == 'customer') {
      socket.emit('join_customer', session.user.id);
    }
  }
});
```

### 4.2 Duplicate Listener Prevention
In Flutter widgets, registering listeners inside `build()` causes duplicate event handling. `SocketManager` solves this by:
1. Registering internal socket listeners **exactly once** during initialization.
2. Broadcasting events into broadcast `StreamController<T>` instances.
3. Consumers subscribe to the Dart streams via Riverpod `StreamProvider`, which automatically handles unsubscription on widget disposal.

### 4.3 Clean Logout Teardown
When a user logs out:
1. `SocketManager.leaveUserRooms()` is called.
2. Active streams are paused.
3. `socket.disconnect()` is explicitly invoked.
4. On next login with another role, `SocketManager.connect()` establishes a fresh connection with the new role credentials.
