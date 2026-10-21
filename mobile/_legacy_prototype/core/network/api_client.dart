import 'package:dio/dio.dart';
import '../storage/secure_storage_service.dart';

class ApiClient {
  late final Dio dio;
  final StorageService _storageService = StorageService();

  ApiClient() {
    dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Dynamic Base URL Resolution
          final baseUrl = await _storageService.getBaseUrl();
          options.baseUrl = baseUrl;

          // Inject Auth Token
          final token = await _storageService.getAuthToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            await _storageService.clearAuthToken();
          }
          return handler.next(error);
        },
      ),
    );
  }
}
