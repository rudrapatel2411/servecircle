import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/controllers/auth_controller.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/customer/screens/customer_main_navigation.dart';
import '../../features/customer/screens/customer_service_detail_screen.dart';
import '../../features/customer/screens/customer_notifications_screen.dart';
import '../../features/ai_chat/screens/ai_chat_screen.dart';
import '../../features/booking/screens/create_booking_screen.dart';
import '../../features/booking/screens/booking_detail_screen.dart';
import '../../features/booking/screens/post_review_screen.dart';
import '../../features/worker/screens/worker_main_navigation.dart';
import '../../features/worker/screens/worker_job_detail_screen.dart';
import '../../features/worker/screens/worker_id_card_screen.dart';
import '../../features/worker/screens/qr_scanner_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final userRole = authState.user?.role;
      final isAuthRoute = state.matchedLocation == '/login' || state.matchedLocation == '/register';

      if (!isAuth && !isAuthRoute) {
        return '/login';
      }

      if (isAuth && isAuthRoute) {
        return userRole == 'worker' ? '/worker' : '/customer';
      }

      if (state.matchedLocation == '/') {
        if (!isAuth) return '/login';
        return userRole == 'worker' ? '/worker' : '/customer';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // Customer Experience
      GoRoute(
        path: '/customer',
        builder: (context, state) => const CustomerMainNavigation(),
      ),
      GoRoute(
        path: '/service-detail/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomerServiceDetailScreen(serviceId: id);
        },
      ),
      GoRoute(
        path: '/ai-chat',
        builder: (context, state) => const AIChatScreen(),
      ),
      GoRoute(
        path: '/create-booking',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return CreateBookingScreen(
            serviceId: extra?['serviceId'] ?? '',
            serviceName: extra?['serviceName'] ?? 'Service Booking',
            category: extra?['category'] ?? 'General',
            amount: (extra?['amount'] as num?)?.toDouble() ?? 499.0,
          );
        },
      ),
      GoRoute(
        path: '/booking-detail/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return BookingDetailScreen(bookingId: id);
        },
      ),
      GoRoute(
        path: '/post-review/:bookingId/:workerId',
        builder: (context, state) {
          final bookingId = state.pathParameters['bookingId']!;
          final workerId = state.pathParameters['workerId']!;
          return PostReviewScreen(bookingId: bookingId, workerId: workerId);
        },
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const CustomerNotificationsScreen(),
      ),

      // Worker Experience
      GoRoute(
        path: '/worker',
        builder: (context, state) => const WorkerMainNavigation(),
      ),
      GoRoute(
        path: '/worker-job-detail/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return WorkerJobDetailScreen(bookingId: id);
        },
      ),
      GoRoute(
        path: '/worker-id-card',
        builder: (context, state) => const WorkerIDCardScreen(),
      ),
      GoRoute(
        path: '/qr-scanner',
        builder: (context, state) => const QRScannerScreen(),
      ),
    ],
  );
});
