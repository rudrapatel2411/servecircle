import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../../data/repositories/ai_chat_repository.dart';
import '../models/chat_message_model.dart';

class AIChatState {
  final List<ChatMessageModel> messages;
  final bool isSending;
  final bool isListening;
  final XFile? selectedImage;
  final String? error;

  AIChatState({
    this.messages = const [],
    this.isSending = false,
    this.isListening = false,
    this.selectedImage,
    this.error,
  });

  AIChatState copyWith({
    List<ChatMessageModel>? messages,
    bool? isSending,
    bool? isListening,
    XFile? selectedImage,
    bool clearImage = false,
    String? error,
  }) {
    return AIChatState(
      messages: messages ?? this.messages,
      isSending: isSending ?? this.isSending,
      isListening: isListening ?? this.isListening,
      selectedImage: clearImage ? null : (selectedImage ?? this.selectedImage),
      error: error,
    );
  }
}

class AIChatController extends StateNotifier<AIChatState> {
  final AIChatRepository _repository;
  final stt.SpeechToText _speechToText = stt.SpeechToText();

  AIChatController(this._repository) : super(AIChatState()) {
    _initWelcomeMessage();
  }

  void _initWelcomeMessage() {
    state = state.copyWith(
      messages: [
        ChatMessageModel(
          id: 'welcome-0',
          text: 'Hello! I am your ServeCircle AI Assistant 🤖\nHow can I help you today? You can type your problem, attach a photo, or use voice input.',
          sender: MessageSender.ai,
          timestamp: DateTime.now(),
          followUpQuestions: [
            '⚡ AC not cooling properly',
            '💧 Water heater leaking',
            '⚡ Fuse blown / No power',
            '🧹 Home deep cleaning quote'
          ],
        ),
      ],
    );
  }

  void selectImage(XFile? image) {
    state = state.copyWith(selectedImage: image);
  }

  void clearImage() {
    state = state.copyWith(clearImage: true);
  }

  Future<void> toggleVoiceRecording(void Function(String text) onResult) async {
    if (state.isListening) {
      await _speechToText.stop();
      state = state.copyWith(isListening: false);
    } else {
      bool available = await _speechToText.initialize();
      if (available) {
        state = state.copyWith(isListening: true);
        _speechToText.listen(
          onResult: (result) {
            onResult(result.recognizedWords);
          },
        );
      } else {
        state = state.copyWith(error: 'Speech recognition unavailable');
      }
    }
  }

  Future<void> sendMessage(String text) async {
    final trimmedText = text.trim();
    final attachedImage = state.selectedImage;

    if (trimmedText.isEmpty && attachedImage == null) return;

    final userMessage = ChatMessageModel(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      text: trimmedText.isEmpty ? 'Attached photo' : trimmedText,
      sender: MessageSender.user,
      timestamp: DateTime.now(),
      imageFile: attachedImage,
    );

    final loadingAiMessage = ChatMessageModel(
      id: 'loading-${DateTime.now().millisecondsSinceEpoch}',
      text: 'Analyzing your issue with Gemini AI...',
      sender: MessageSender.ai,
      timestamp: DateTime.now(),
      isLoading: true,
    );

    final updatedMessages = [...state.messages, userMessage, loadingAiMessage];
    state = state.copyWith(
      messages: updatedMessages,
      isSending: true,
      clearImage: true,
      error: null,
    );

    try {
      // Build conversation history format for API
      final history = state.messages
          .where((m) => !m.isLoading && m.id != 'welcome-0')
          .map((m) => {
                'role': m.sender == MessageSender.user ? 'user' : 'model',
                'parts': [{'text': m.text}],
              })
          .toList();

      final aiResponse = await _repository.sendMessage(
        text: trimmedText.isEmpty ? 'Analyze this image and recommend a home repair service' : trimmedText,
        imageFile: attachedImage,
        conversationHistory: history,
      );

      final realAiMessage = ChatMessageModel(
        id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
        text: aiResponse.message,
        sender: MessageSender.ai,
        timestamp: DateTime.now(),
        serviceRecommendation: aiResponse.serviceRecommendation,
        followUpQuestions: aiResponse.followUpQuestions,
        isLoading: false,
      );

      // Replace loading message with real response
      final finalMessages = state.messages.map((m) => m.isLoading ? realAiMessage : m).toList();
      state = state.copyWith(messages: finalMessages, isSending: false);
    } catch (e) {
      final errorMessage = ChatMessageModel(
        id: 'err-${DateTime.now().millisecondsSinceEpoch}',
        text: 'Sorry, I ran into an error: ${e.toString().replaceAll('Exception: ', '')}. Please try again.',
        sender: MessageSender.ai,
        timestamp: DateTime.now(),
        isLoading: false,
      );

      final finalMessages = state.messages.map((m) => m.isLoading ? errorMessage : m).toList();
      state = state.copyWith(messages: finalMessages, isSending: false, error: e.toString());
    }
  }
}

final aiChatRepositoryProvider = Provider((ref) => AIChatRepository());

final aiChatControllerProvider = StateNotifierProvider<AIChatController, AIChatState>((ref) {
  return AIChatController(ref.watch(aiChatRepositoryProvider));
});
