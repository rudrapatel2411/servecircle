import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/user_model.dart';

class WorkerRepository {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> getWorkerVerification(String workerIdCode) async {
    try {
      final response = await _apiClient.dio.get(
        '${ApiConstants.verifyWorkerPublic}/$workerIdCode',
      );
      return response.data;
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Worker verification check failed.');
    }
  }

  Future<UserModel> getWorkerById(String workerId) async {
    try {
      final response = await _apiClient.dio.get('/users/workers/$workerId');
      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Worker profile not found.');
    }
  }
}
