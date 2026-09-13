import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/ai_chat_response_model.dart';

class AIChatRepository {
  final ApiClient _apiClient = ApiClient();

  Future<AIChatResponseModel> sendMessage({
    required String text,
    XFile? imageFile,
    List<Map<String, dynamic>> conversationHistory = const [],
    Map<String, dynamic>? customerContext,
  }) async {
    try {
      final formDataMap = <String, dynamic>{
        'text': text,
        'conversation': jsonEncode(conversationHistory),
        if (customerContext != null) 'customerContext': jsonEncode(customerContext),
      };

      if (imageFile != null) {
        formDataMap['image'] = await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.name,
        );
      }

      final formData = FormData.fromMap(formDataMap);

      final response = await _apiClient.dio.post(
        ApiConstants.aiChat,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      return AIChatResponseModel.fromJson(response.data);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'AI Assistant failed to respond.';
      throw Exception(msg);
    }
  }
}
