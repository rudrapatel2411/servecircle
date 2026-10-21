# PHASE 2: FLUTTER PACKAGE DEPENDENCY PLAN
## ServeCircle Mobile — Audited Production Roster & Dependency Rationalization

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Philosophy:** Minimal, Audited, Production-Grade Dependencies Only  

---

## 1. AUDITED DEPENDENCY ROSTER (`pubspec.yaml`)

| Package | Version | Purpose | Alternative Avoided | Reason for Selection |
|---|---|---|---|---|
| **`flutter_riverpod`** | `^2.5.1` | Reactive state management & DI | Bloc, GetX, Provider | Compile-time safety, seamless stream integration, no BuildContext dependency in controllers. |
| **`go_router`** | `^14.0.1` | Declarative routing & auth guards | AutoRoute, Navigator 2.0 | Official Flutter team package; first-class redirect guards, URL deep linking, simple nested tab navigation. |
| **`dio`** | `^5.4.3+1` | HTTP client with interceptors | `http` (standard package) | Built-in interceptors (auth token injection, 401 handling), file upload progress, configurable timeouts. |
| **`socket_io_client`** | `^2.0.3+1` | Real-time WebSocket connection | `web_socket_channel` | Native compatibility with Express/Node.js Socket.io server protocol, automated reconnects, room events. |
| **`hive`** | `^2.2.3` | High-speed local NoSQL box storage | SQLite / Sqflite, Realm | Pure Dart, 10x faster read/writes than SQLite, zero native build overhead, instant startup time. |
| **`hive_flutter`** | `^1.1.0` | Flutter lifecycle helpers for Hive | SharedPreferences | Reactive Box listening and automatic directory resolution. |
| **`flutter_secure_storage`**| `^9.0.0` | Hardware-backed encrypted storage | Raw SharedPreferences | Uses Android Keystore (AES-256 GCM) to securely store JWTs and sensitive credentials. |
| **`connectivity_plus`** | `^6.0.3` | Real-time network connectivity stream| Custom ping loops | Official Flutter Community plugin; monitors WiFi and Cellular transitions for the Sync Engine. |
| **`image_picker`** | `^1.1.0` | Camera capture & gallery picker | Custom camera controller | Native Android image intent integration without heavy camera lifecycle boilerplate. |
| **`flutter_image_compress`**| `^2.3.0` | Client-side JPEG/PNG compression | Server-side resizing | Reduces 5MB+ phone photos to <800KB before transmission, saving customer mobile data and upload time. |
| **`mobile_scanner`** | `^5.1.1` | Fast hardware QR code scanner | `qr_code_scanner` | Modern Android CameraX architecture, hardware-accelerated Barcode Scanning API via Google Play Services. |
| **`flutter_map`** | `^6.1.0` | OpenStreetMap Leaflet map renderer | `google_maps_flutter` | Zero Google Cloud Billing API keys required; renders custom tiles, routes, and animated markers reliably. |
| **`latlong2`** | `^0.9.0` | Coordinate math & polyline distance| Custom trigonometry | Standard companion library for `flutter_map` handling geodesic calculations and waypoint sequences. |
| **`google_fonts`** | `^6.2.1` | Typography (Plus Jakarta Sans/Outfit)| Bundling raw TTF files | Runtime font caching with offline asset bundling; ensures clean rendering across Android versions. |
| **`lucide_icons_flutter`**| `^0.359.0` | UI icon system | Material Icons / FontAwesome | 100% visual match with the Lucide React icons used in the ServeCircle web application. |
| **`intl`** | `^0.19.0` | Currency, dates & plural formatting | Handcrafted regex | Official Dart i18n package; formats INR currency (₹) with localized comma grouping. |
| **`shimmer`** | `^3.0.0` | Neomorphic skeleton loading effect | Spinners only | Improves perceived performance by rendering skeleton wireframes during initial data loads. |
| **`uuid`** | `^4.4.0` | Client-side UUIDv4 generator | Server auto-increment | Generates unique operation IDs for offline mutation queue and deduplication. |
| **`url_launcher`** | `^6.2.6` | Dial phone numbers & external links | Raw platform channels | Triggers native Android phone dialer (`tel:`) for contacting workers and customer support. |

---

## 2. DEV DEPENDENCIES (TESTING & CODE GENERATION)

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0          # Strict official linting rules
  mocktail: ^1.0.3               # Mocking framework for unit and widget tests
  build_runner: ^2.4.9           # Code generator runner
  hive_generator: ^2.0.1         # TypeAdapter generator for Hive models
```

---

## 3. PACKAGES EXPLICITLY REJECTED & WHY

- **`get` / `get_cli`:** Rejected due to non-standard context hijacking, lack of compile-time safety, and monolithic coupling of routing, DI, and state.
- **`firebase_messaging`:** Rejected for Phase 3 because the existing backend does not have FCM server keys configured. Real-time notifications are reliably handled via Socket.io while in-app.
- **`google_maps_flutter`:** Rejected to prevent blocking the exhibition if credit cards or Google Maps billing accounts are not configured. `flutter_map` with OpenStreetMap is 100% free and open-source.
- **`shared_preferences`:** Rejected for application state storage due to synchronous disk writes and lack of encryption; replaced by `Hive` and `flutter_secure_storage`.
