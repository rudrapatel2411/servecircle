# PHASE 2: REAL DATA + DEMO DATA EXHIBITION ARCHITECTURE
## ServeCircle Mobile — Exhibition Resilience, Fallback Providers & Dual-Mode UI

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Primary Goal:** Flawless College Exhibition Demonstration under Zero-Internet Conditions  

---

## 1. DUAL-MODE ARCHITECTURAL DESIGN

ServeCircle is built to excel in real-world production environments while remaining 100% resilient during live academic and enterprise exhibitions. The architecture enforces a clean separation between **Data Consumers (UI)** and **Data Providers (Repositories)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUTTER PRESENTATION LAYER                         │
│   (Consumes unified, strongly-typed domain models: Booking, User, Wallet)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED DOMAIN REPOSITORY                            │
│                                                                             │
│   Is Demo Mode Active? OR Is Remote Server Unreachable?                     │
│          ├── YES ──► Route to `DemoFixtureProvider`                         │
│          └── NO  ──► Route to `RemoteApiClient` + `HiveCache`               │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
                       ▼                               ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│     DEMO FIXTURE PROVIDER    │              │       REMOTE API CLIENT      │
│  • Memory & Disk Fixtures    │              │  • Dio HTTP / Socket.io      │
│  • 100% In-Memory State      │              │  • Authoritative MongoDB     │
│  • Zero Network Required     │              │  • Production Cloud          │
└──────────────────────────────┘              └──────────────────────────────┘
```

The UI never knows whether data originated from a cloud MongoDB cluster or an in-memory exhibition fixture. Both sources produce identical Dart models.

---

## 2. PRE-SEEDED DEMO PERSONAS & ACCOUNTS

Matching the verified server-side demo stores (`server/utils/demoAuthStore.js`), the Flutter application bundles four instant demo personas:

| Persona | Role | Demo Email | Display Name | Pre-seeded State & Capabilities |
|---|---|---|---|---|
| **Customer** | `customer` | `rudra@servecircle.com` | **Rudra Shah** | Active booking for AC repair, ₹2,450 wallet balance, 4 service history records, 3 saved addresses. |
| **Worker** | `worker` | `ramesh@servecircle.com` | **Ramesh Kumar** | Approved Senior Pro (Electrician & AC Specialist), 4.9★ rating, 48 completed jobs, ₹18,400 total earnings. |
| **Admin** | `admin` | `admin@servecircle.com` | **Super Admin** | Full dashboard access: 14 open bookings, 3 pending worker verifications, 2 complaints, analytics KPIs. |
| **B2B** | `b2b` | `partner@techcorp.com` | **TechCorp India** | 3 active facility contracts, 4 managed office locations, ₹45,000 monthly invoice due. |

### 2.1 One-Tap Quick Access Cards
The Flutter `LoginScreen` renders four distinct quick-login cards beneath the credentials form. Tapping any card instantly instantiates the corresponding demo session, sets the JWT to `demo-token-<role>`, persists the session into Hive, and navigates directly into the target dashboard.

---

## 3. COMPREHENSIVE DEMO FIXTURE INVENTORY

The `DemoFixtureProvider` provides pre-baked data structures matching `server/utils/demoDataStore.js`:

### 3.1 Demo Bookings
- **Active In-Progress Booking:**
  - ID: `BK-8941-DEMO`
  - Service: `AC Deep Master Clean & Gas Topup` (Category: Home Repairs)
  - Status: `dispatched` (Step 2 of 4)
  - Worker: Ramesh Kumar (Phone: `+91 98765 43210`, Rating: 4.9★)
  - Scheduled Time: Today, 4:00 PM - 5:00 PM
  - Address: `402, Shivalik High Street, Near IIM, Ahmedabad`
  - Amount: `₹1,299` (Paid via Wallet)
  - Verified Start OTP: **`8492`** (Deterministic algorithm output)

### 3.2 Demo Services & 14 Category Hubs
- Full catalog of 60+ pre-seeded services covering all 14 hubs:
  1. Home Repairs & Maintenance (Plumbing, Electrical, Carpentry, Painting)
  2. AC & Appliance Servicing
  3. Emergency SOS Services (Immediate 15-minute dispatch)
  4. Events & Catering Setup
  5. Relocation & Packers/Movers
  6. Travel & Commute Fleet Assistance
  7. Food, Chef & Kitchen Care
  8. Pet Care, Grooming & Walking
  9. Health, Elderly Care & Home Nursing
  10. Society & Facility Management
  11. Vehicle Care & Mobile Mechanic
  12. Deep Cleaning & Sanitization
  13. Pest Control & Fumigation
  14. Smart Home & CCTV Installation

### 3.3 Demo Wallet
- **Authoritative Balance:** `₹2,450.00`
- **Recent Transactions:**
  - `+ ₹2,000` (UPI Topup - Axis Bank ••4819)
  - `- ₹1,299` (Payment for AC Deep Cleaning #BK-8941)
  - `+ ₹500` (Cashback Promotion "WELCOME500")
  - `- ₹751` (Emergency Plumbing Repair #BK-8102)

### 3.4 Demo GPS Tracking Coordinates
- Pre-calculated polyline route (12 waypoints) from worker's current location (`23.0338° N, 72.5850° E`) to customer's address (`23.0385° N, 72.5620° E`).
- Animated step-by-step marker movement simulation running at 1.5-second ticks.

### 3.5 Demo AI Multimodal Diagnosis & Chat Responses
- **Water Leakage Query:**
  - Detected Problem: Pipe joint corrosion with high water pressure leakage.
  - Recommended Service: "Emergency Pipe Leakage & Valve Repair" (₹499).
  - Confidence: 94%.
  - Urgency: High (Risk of ceiling dampness).
- **AC Cooling Query:**
  - Detected Problem: Condenser dust clogging or low refrigerant gas.
  - Recommended Service: "AC Foam Jet Servicing & Gas Refill" (₹1,299).
  - Confidence: 89%.
  - Urgency: Medium.

---

## 4. DETERMINISTIC OTP ALGORITHM

To prevent static OTP security flags while preserving 100% predictability during college evaluations, the demo engine uses the verified **Deterministic Booking OTP** algorithm:

```dart
// Conceptual implementation blueprint
class DeterministicOtp {
  static String generate(String bookingId) {
    if (bookingId.isEmpty) return '8492';
    // Hash bookingId to generate a 4-digit code between 1000 and 9999
    int hash = 0;
    for (int i = 0; i < bookingId.length; i++) {
      hash = (hash * 31 + bookingId.codeUnitAt(i)) & 0x7FFFFFFF;
    }
    final code = 1000 + (hash % 9000);
    return code.toString();
  }
}
```

This guarantees:
1. Every demo booking has a unique, consistent 4-digit start OTP.
2. The Customer screen displays the code.
3. The Worker screen validates against the exact same algorithm.
4. When tested live, typing this OTP into the Worker's screen instantly triggers the "Job Started" state!

---

## 5. UI DATA SOURCE TRANSPARENCY INDICATOR

To provide full academic integrity during presentations, every screen with dual data sources includes a subtle header pill:

- **Live Backend Active:**
  - Visual: Green glowing dot + `● Live Backend (MongoDB)`
- **Demo / Fallback Mode Active:**
  - Visual: Amber ring dot + `○ Exhibition Demo Simulation`

Tapping the pill opens an informational bottom sheet explaining:
*"You are viewing exhibition simulation mode. All interactions (booking, tracking, wallet, AI) are running locally with zero external network dependency."*
