class ApiConstants {
  // Default LAN IP for physical device / emulator testing
  // Change to production URL when deploying
  static const String defaultBaseUrl = 'https://theorize-energize-matted.ngrok-free.dev/api';
  static const String emulatorBaseUrl = 'https://theorize-energize-matted.ngrok-free.dev/api';

  // Storage keys
  static const String keyAuthToken = 'servecircle_auth_token';
  static const String keyUserRole = 'servecircle_user_role';
  static const String keyUserData = 'servecircle_user_data';
  static const String keyBaseUrl = 'servecircle_custom_api_url';
  static const String keyActiveSessionId = 'servecircle_ai_active_session_id';

  // Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String services = '/services';
  static const String bookings = '/bookings';
  static const String myBookings = '/bookings/my-bookings';
  static const String aiChat = '/customer/ai/chat';
  static const String verifyWorkerPublic = '/verify';
  static const String reviews = '/reviews';
  static const String notifications = '/notifications';
  static const String wallet = '/wallet/balance';
}
