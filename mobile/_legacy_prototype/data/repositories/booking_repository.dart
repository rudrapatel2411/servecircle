import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/booking_model.dart';

class BookingRepository {
  final ApiClient _apiClient = ApiClient();

  Future<BookingModel> createBooking({
    required String serviceId,
    required String serviceName,
    required String category,
    required String scheduledDate,
    String? timeSlot,
    required String address,
    String? notes,
    required double amount,
    String paymentMethod = 'Cash on Delivery',
    bool isEmergency = false,
  }) async {
    try {
      final response = await _apiClient.dio.post(
        ApiConstants.bookings,
        data: {
          'serviceId': serviceId,
          'serviceName': serviceName,
          'category': category,
          'scheduledDate': scheduledDate,
          'timeSlot': timeSlot ?? '10:00 AM - 12:00 PM',
          'address': address,
          'notes': notes,
          'amount': amount,
          'paymentMethod': paymentMethod,
          'isEmergency': isEmergency,
        },
      );

      final data = response.data['booking'] ?? response.data;
      return BookingModel.fromJson(data);
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to create booking.');
    }
  }

  Future<List<BookingModel>> getMyBookings() async {
    try {
      final response = await _apiClient.dio.get(ApiConstants.myBookings);
      final List<dynamic> list = response.data is List
          ? response.data
          : (response.data['bookings'] ?? []);
      return list.map((item) => BookingModel.fromJson(item)).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to fetch bookings.');
    }
  }

  Future<BookingModel> updateBookingStatus(String bookingId, String status) async {
    try {
      final response = await _apiClient.dio.put(
        '${ApiConstants.bookings}/$bookingId/status',
        data: {'status': status},
      );
      final data = response.data['booking'] ?? response.data;
      return BookingModel.fromJson(data);
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Status update failed.');
    }
  }

  Future<String> requestStartOtp(String bookingId) async {
    try {
      final response = await _apiClient.dio.post(
        '${ApiConstants.bookings}/$bookingId/start-otp',
      );
      return response.data['otp'] ?? '1234';
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'OTP generation failed.');
    }
  }

  Future<bool> verifyOtp(String bookingId, String otp) async {
    try {
      final response = await _apiClient.dio.post(
        '${ApiConstants.bookings}/$bookingId/verify-otp',
        data: {'otp': otp},
      );
      return response.data['success'] ?? true;
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Invalid OTP code.');
    }
  }
}
