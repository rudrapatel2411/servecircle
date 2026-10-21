/// Central application configuration for ServeCircle.
///
/// ### Networking & Environment Details for Android:
/// - **Android Emulator:** Uses `http://10.0.2.2:5000/api` to communicate with the host machine's `localhost:5000`.
/// - **Physical Android Phone / Tablet:** `localhost` refers to the Android device itself, not the backend computer.
///   To connect to a backend running on your development workstation, provide your machine's local network IP
///   (e.g., `http://192.168.1.50:5000/api`) or a cloud/tunnel URL.
/// - **Web / Desktop:** `http://localhost:5000/api` connects directly to the local development server.
///
/// ### Build-time Configuration (`--dart-define`):
/// Configure environments without changing code:
/// ```bash
/// # Connect to local emulator backend
/// flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api --dart-define=SOCKET_URL=http://10.0.2.2:5000
///
/// # Connect to physical device via LAN IP
/// flutter run --dart-define=API_BASE_URL=http://192.168.1.50:5000/api --dart-define=SOCKET_URL=http://192.168.1.50:5000
///
/// # Connect to production / exhibition server
/// flutter run --dart-define=API_BASE_URL=https://api.servecircle.com/api --dart-define=APP_ENV=production
/// ```
class AppConfig {
  AppConfig._();

  /// Current application runtime environment (`development`, `staging`, `production`, `exhibition`).
  static const String environment = String.fromEnvironment(
    'APP_ENV',
    defaultValue: 'development',
  );

  /// Base URL for the Express REST API.
  ///
  /// Defaults to Android emulator host loopback `http://10.0.2.2:5000/api`.
  /// Override with `--dart-define=API_BASE_URL=...` for physical devices or remote servers.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api',
  );

  /// WebSocket server URL for Socket.io real-time events.
  static const String socketUrl = String.fromEnvironment(
    'SOCKET_URL',
    defaultValue: 'http://10.0.2.2:5000',
  );

  /// Application brand title.
  static const String appName = 'ServeCircle';

  /// Android application package identifier.
  static const String applicationId = 'com.servecircle.app';

  /// Application version and build number.
  static const String appVersion = '1.0.0+1';

  /// Default timeout for network connection establishment.
  static const Duration connectTimeout = Duration(seconds: 10);

  /// Default timeout for receiving API response payloads.
  static const Duration receiveTimeout = Duration(seconds: 15);

  /// Whether the app should default to offline exhibition demo fixtures.
  static const bool defaultDemoMode = bool.fromEnvironment(
    'DEMO_MODE',
    defaultValue: false,
  );
}
