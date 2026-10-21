import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final ApiClient _apiClient = ApiClient();

  Future<List<NotificationModel>> getNotifications() async {
    try {
      final response = await _apiClient.dio.get(ApiConstants.notifications);
      final List<dynamic> list = response.data is List
          ? response.data
          : (response.data['notifications'] ?? []);
      return list.map((item) => NotificationModel.fromJson(item)).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to fetch notifications.');
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _apiClient.dio.put('${ApiConstants.notifications}/$id/read');
    } catch (_) {}
  }
}
