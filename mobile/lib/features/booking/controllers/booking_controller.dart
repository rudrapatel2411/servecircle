import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/booking_model.dart';
import '../../../data/repositories/booking_repository.dart';

final bookingRepositoryProvider = Provider((ref) => BookingRepository());

final myBookingsProvider = FutureProvider<List<BookingModel>>((ref) async {
  final repository = ref.watch(bookingRepositoryProvider);
  return repository.getMyBookings();
});

class BookingController extends StateNotifier<AsyncValue<void>> {
  final BookingRepository _repository;
  final Ref _ref;

  BookingController(this._repository, this._ref) : super(const AsyncValue.data(null));

  Future<BookingModel?> createBooking({
    required String serviceId,
    required String serviceName,
    required String category,
    required String scheduledDate,
    String? timeSlot,
    required String address,
    String? notes,
    required double amount,
    String paymentMethod = 'Cash on Delivery',
  }) async {
    state = const AsyncValue.loading();
    try {
      final booking = await _repository.createBooking(
        serviceId: serviceId,
        serviceName: serviceName,
        category: category,
        scheduledDate: scheduledDate,
        timeSlot: timeSlot,
        address: address,
        notes: notes,
        amount: amount,
        paymentMethod: paymentMethod,
      );
      state = const AsyncValue.data(null);
      _ref.invalidate(myBookingsProvider);
      return booking;
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      return null;
    }
  }

  Future<bool> updateStatus(String bookingId, String status) async {
    state = const AsyncValue.loading();
    try {
      await _repository.updateBookingStatus(bookingId, status);
      state = const AsyncValue.data(null);
      _ref.invalidate(myBookingsProvider);
      return true;
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      return false;
    }
  }

  Future<String?> requestStartOtp(String bookingId) async {
    try {
      return await _repository.requestStartOtp(bookingId);
    } catch (e) {
      return null;
    }
  }

  Future<bool> verifyOtp(String bookingId, String otp) async {
    try {
      final success = await _repository.verifyOtp(bookingId, otp);
      if (success) _ref.invalidate(myBookingsProvider);
      return success;
    } catch (e) {
      return false;
    }
  }
}

final bookingControllerProvider = StateNotifierProvider<BookingController, AsyncValue<void>>((ref) {
  return BookingController(ref.watch(bookingRepositoryProvider), ref);
});
