# 04 — SOCKET.IO EVENT INVENTORY
## ServeCircle Flutter Migration — Real-time Event Specification

**Source:** Verified from server/server.js, server/routes/complaints.js, server/services/bookingService.js, client/src/socket.js, client/src/components/DashboardNavbar.jsx

---

## SOCKET.IO CONFIGURATION

### Server-Side Setup (server.js)
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
// io is attached to Express app: app.set('io', io)
// Routes access it via: req.io = req.app.get('io')
```

### Client-Side Setup (client/src/socket.js)
```javascript
const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const socket = io(URL, { autoConnect: false });
```

**Important:** `autoConnect: false` means the socket does NOT connect on import. It must be explicitly connected per-component/panel.

---

## ROOM ARCHITECTURE

| Room Name | Members | Used For |
|-----------|---------|---------|
| `admin_room` | All admin users | Admin real-time notifications |
| `worker_{workerId}` | One worker | Job assignment, status updates |
| `customer_{customerId}` | One customer | Booking status updates |

---

## CLIENT ? SERVER EVENTS (EMIT)

| Event | When Called | Payload | Server Action |
|-------|------------|---------|---------------|
| `join_admin` | DashboardNavbar when panel=admin | none | socket.join('admin_room') |
| `join_worker` | Server defines handler — NOT called from client | workerId (string) | socket.join(`worker_${workerId}`) |
| `join_customer` | Server defines handler — NOT called from client | customerId (string) | socket.join(`customer_${customerId}`) |
| `disconnect` | On socket close | none | Cleanup |

**IMPORTANT GAP:** `join_worker` and `join_customer` events are defined in server.js but never emitted from the web client. The client only calls `join_admin`. This means worker and customer real-time updates are NOT functional end-to-end in the current web application.

---

## SERVER ? CLIENT EVENTS (EMIT)

### 1. admin_notification
**Destination Room:** `admin_room`
**Emitted From:** `/api/complaints` POST handler (when new complaint filed)
**Payload:**
```json
{
  "id": "timestamp-based ID",
  "title": "New Complaint Filed",
  "message": "A new complaint has been filed for booking <bookingId>",
  "type": "complaint",
  "date": "ISO8601 timestamp",
  "reads": []
}
```
**Client Handler (DashboardNavbar.jsx):**
```javascript
socket.on('admin_notification', (data) => {
  setNotifications(prev => [data, ...prev]);
  setLatestToast(data);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 5000);
});
```

### 2. booking_assigned
**Destination Room:** `worker_{workerId}`
**Emitted From:** bookingService.assignBooking()
**Payload:** Full Booking document
**Client Handler:** NOT implemented in web client (join_worker never called)
**Flutter Must Implement:** YES — worker must receive job assignment notification

### 3. booking_status_update
**Destination Rooms:** `customer_{customerId}` AND `admin_room`
**Emitted From:** bookingService (on accept, reject, arrive, start, complete, cancel)
**Payload:** Full Booking document or `{ bookingId, status, ... }`
**Client Handler:** NOT implemented in web client for customer or worker rooms
**Flutter Must Implement:** YES — customer must see live status updates

---

## SOCKET CONNECTION PATTERNS (FLUTTER IMPLEMENTATION GUIDE)

### Admin Panel Connection
```
1. User logs in as admin
2. Connect socket: socket.connect()
3. Emit 'join_admin'
4. Listen for 'admin_notification'
5. Show toast/notification
6. On logout/dispose: socket.disconnect()
```

### Worker Panel Connection (TO BE IMPLEMENTED)
```
1. Worker logs in
2. Connect socket
3. Emit 'join_worker' with workerId
4. Listen for:
   - 'booking_assigned' ? Show job request notification
   - 'booking_status_update' ? Update booking state
5. On logout/dispose: disconnect
```

### Customer Panel Connection (TO BE IMPLEMENTED)
```
1. Customer logs in
2. Connect socket
3. Emit 'join_customer' with customerId
4. Listen for:
   - 'booking_status_update' ? Update live tracking screen
5. On logout/dispose: disconnect
```

---

## FLUTTER SOCKET PACKAGE

**Recommended:** `socket_io_client: ^2.0.3`

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

final socket = IO.io(
  'http://your-server:5000',
  IO.OptionBuilder()
    .setTransports(['websocket'])
    .disableAutoConnect()
    .build(),
);

// Connect and join room
socket.connect();
socket.emit('join_worker', workerId);

// Listen for events
socket.on('booking_assigned', (data) {
  // Handle new job assignment
});

socket.on('booking_status_update', (data) {
  // Update booking state
});
```

---

## COMPLETE EVENT CATALOG

| Direction | Event | Room | Trigger | Flutter Screen |
|-----------|-------|------|---------|----------------|
| C?S | join_admin | — | Admin login | Admin Dashboard init |
| C?S | join_worker | — | Worker login | Worker Dashboard init |
| C?S | join_customer | — | Customer login | Customer Dashboard init |
| S?C | admin_notification | admin_room | New complaint filed | Admin notifications panel |
| S?C | booking_assigned | worker_{id} | Admin assigns booking | Worker jobs screen |
| S?C | booking_status_update | customer_{id} | Any booking status change | Customer live tracking |
| S?C | booking_status_update | admin_room | Any booking status change | Admin bookings screen |

---

## KNOWN GAPS (WEB ? FLUTTER)

1. **Worker push notifications:** Web has no worker notification implementation. Flutter must add proper socket connection for workers and optionally Firebase Cloud Messaging (FCM) for background push.
2. **Customer live tracking:** The LiveTracking.jsx page uses a simulated animation loop, NOT actual socket data. Flutter must implement true socket-driven status updates.
3. **Socket reconnection:** No reconnect logic in web client. Flutter should implement exponential backoff reconnection.
4. **Auth-gated socket:** Socket connection happens in component lifecycle, not tied to auth state machine. Flutter should manage socket lifecycle in a singleton service tied to auth state.
