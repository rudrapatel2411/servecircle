import 'dart:convert';
import 'package:dio/dio.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/storage/secure_storage_service.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient = ApiClient();
  final StorageService _storageService = StorageService();

  Future<UserModel> login(String loginIdentifier, String password) async {
    try {
      final response = await _apiClient.dio.post(
        ApiConstants.login,
        data: {
          'email': loginIdentifier,
          'phone': loginIdentifier,
          'password': password,
        },
      );

      final data = response.data;
      final token = data['token'];
      final userJson = data['user'];

      if (token != null) {
        await _storageService.saveAuthToken(token);
      }

      final user = UserModel.fromJson(userJson);
      await _storageService.saveUserRole(user.role);
      await _storageService.saveUserData(jsonEncode(user.toJson()));

      return user;
    } on DioException catch (e) {
      String msg = 'Login failed. Check credentials.';
      if (e.response?.data is Map<String, dynamic>) {
        msg = e.response?.data['message'] ?? msg;
      } else if (e.response?.data is String) {
        msg = 'Server unavailable. Please try again.';
      } else {
        msg = e.message ?? msg;
      }
      throw Exception(msg);
    }
  }

  Future<UserModel> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String role,
    List<String>? skills,
    String? serviceCategory,
  }) async {
    try {
      final response = await _apiClient.dio.post(
        ApiConstants.register,
        data: {
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
          'role': role,
          if (skills != null) 'skills': skills,
          if (serviceCategory != null) 'serviceCategory': serviceCategory,
        },
      );

      final data = response.data;
      final token = data['token'];
      final userJson = data['user'];

      if (token != null) {
        await _storageService.saveAuthToken(token);
      }

      final user = UserModel.fromJson(userJson);
      await _storageService.saveUserRole(user.role);
      await _storageService.saveUserData(jsonEncode(user.toJson()));

      return user;
    } on DioException catch (e) {
      String msg = 'Registration failed.';
      if (e.response?.data is Map<String, dynamic>) {
        msg = e.response?.data['message'] ?? msg;
      } else if (e.response?.data is String) {
        msg = 'Server unavailable. Please try again.';
      } else {
        msg = e.message ?? msg;
      }
      throw Exception(msg);
    }
  }

  Future<UserModel?> getProfile() async {
    try {
      final token = await _storageService.getAuthToken();
      if (token == null) return null;

      final response = await _apiClient.dio.get(ApiConstants.me);
      final user = UserModel.fromJson(response.data);
      await _storageService.saveUserRole(user.role);
      await _storageService.saveUserData(jsonEncode(user.toJson()));
      return user;
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    await _storageService.clearAuthToken();
  }
}
