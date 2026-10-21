import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/service_model.dart';

class ServiceRepository {
  final ApiClient _apiClient = ApiClient();

  Future<List<ServiceModel>> getServices({String? category, String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null && category.isNotEmpty && category != 'All') {
        queryParams['category'] = category;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final response = await _apiClient.dio.get(
        ApiConstants.services,
        queryParameters: queryParams,
      );

      final List<dynamic> list = response.data is List
          ? response.data
          : (response.data['services'] ?? response.data['data'] ?? []);

      return list.map((item) => ServiceModel.fromJson(item)).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to load services.');
    }
  }

  Future<ServiceModel> getServiceById(String id) async {
    try {
      final response = await _apiClient.dio.get('${ApiConstants.services}/$id');
      return ServiceModel.fromJson(response.data);
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to fetch service details.');
    }
  }
}
