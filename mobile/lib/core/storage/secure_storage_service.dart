import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

class StorageService {
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  Future<void> saveAuthToken(String token) async {
    await _secureStorage.write(key: ApiConstants.keyAuthToken, value: token);
  }

  Future<String?> getAuthToken() async {
    return await _secureStorage.read(key: ApiConstants.keyAuthToken);
  }

  Future<void> clearAuthToken() async {
    await _secureStorage.delete(key: ApiConstants.keyAuthToken);
    await _secureStorage.delete(key: ApiConstants.keyUserData);
    await _secureStorage.delete(key: ApiConstants.keyUserRole);
  }

  Future<void> saveUserRole(String role) async {
    await _secureStorage.write(key: ApiConstants.keyUserRole, value: role);
  }

  Future<String?> getUserRole() async {
    return await _secureStorage.read(key: ApiConstants.keyUserRole);
  }

  Future<void> saveUserData(String jsonStr) async {
    await _secureStorage.write(key: ApiConstants.keyUserData, value: jsonStr);
  }

  Future<String?> getUserData() async {
    return await _secureStorage.read(key: ApiConstants.keyUserData);
  }

  Future<void> saveBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiConstants.keyBaseUrl, url);
  }

  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(ApiConstants.keyBaseUrl) ?? ApiConstants.defaultBaseUrl;
  }
}
