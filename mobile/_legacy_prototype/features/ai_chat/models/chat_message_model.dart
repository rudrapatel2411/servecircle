import 'package:image_picker/image_picker.dart';
import '../../../data/models/ai_chat_response_model.dart';

enum MessageSender { user, ai }

class ChatMessageModel {
  final String id;
  final String text;
  final MessageSender sender;
  final DateTime timestamp;
  final XFile? imageFile;
  final ServiceRecommendationData? serviceRecommendation;
  final List<String> followUpQuestions;
  final bool isLoading;

  ChatMessageModel({
    required this.id,
    required this.text,
    required this.sender,
    required this.timestamp,
    this.imageFile,
    this.serviceRecommendation,
    this.followUpQuestions = const [],
    this.isLoading = false,
  });

  ChatMessageModel copyWith({
    String? text,
    bool? isLoading,
    ServiceRecommendationData? serviceRecommendation,
    List<String>? followUpQuestions,
  }) {
    return ChatMessageModel(
      id: id,
      text: text ?? this.text,
      sender: sender,
      timestamp: timestamp,
      imageFile: imageFile,
      serviceRecommendation: serviceRecommendation ?? this.serviceRecommendation,
      followUpQuestions: followUpQuestions ?? this.followUpQuestions,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}
