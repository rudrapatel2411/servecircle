import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';

class ReviewRepository {
  final ApiClient _apiClient = ApiClient();

  Future<bool> submitReview({
    required String bookingId,
    required String workerId,
    required double rating,
    required String comment,
    Map<String, int>? aspects,
  }) async {
    try {
      await _apiClient.dio.post(
        ApiConstants.reviews,
        data: {
          'bookingId': bookingId,
          'workerId': workerId,
          'rating': rating,
          'comment': comment,
          'aspects': aspects ?? {'punctuality': rating.toInt(), 'quality': rating.toInt(), 'behavior': rating.toInt()},
        },
      );
      return true;
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to submit review.');
    }
  }
}
