import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../controllers/ai_chat_controller.dart';
import '../models/chat_message_model.dart';

class AIChatScreen extends ConsumerStatefulWidget {
  const AIChatScreen({super.key});

  @override
  ConsumerState<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends ConsumerState<AIChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _picker = ImagePicker();

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _pickImage(ImageSource source) async {
    final image = await _picker.pickImage(source: source, imageQuality: 80);
    if (image != null) {
      ref.read(aiChatControllerProvider.notifier).selectImage(image);
    }
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    final selectedImage = ref.read(aiChatControllerProvider).selectedImage;

    if (text.isEmpty && selectedImage == null) return;

    _textController.clear();
    ref.read(aiChatControllerProvider.notifier).sendMessage(text);
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(aiChatControllerProvider);

    _scrollToBottom();

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.smart_toy_rounded, color: AppTheme.accentBlue),
            SizedBox(width: 8),
            Text('ServeCircle AI Assistant'),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Chat Messages Stream List
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: chatState.messages.length,
                itemBuilder: (context, index) {
                  final msg = chatState.messages[index];
                  return _buildMessageBubble(context, msg);
                },
              ),
            ),

            // Image Preview Bar if selected
            if (chatState.selectedImage != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: AppTheme.lightBlueBg,
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.file(
                        File(chatState.selectedImage!.path),
                        width: 50,
                        height: 50,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Photo attached for Gemini Vision AI analysis',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.grey),
                      onPressed: () {
                        ref.read(aiChatControllerProvider.notifier).clearImage();
                      },
                    ),
                  ],
                ),
              ),

            // Composer Input Container
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6,
                    offset: Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Attachment Options
                  IconButton(
                    icon: const Icon(Icons.photo_camera_rounded, color: AppTheme.accentBlue),
                    onPressed: () => _showImageSourceDialog(context),
                  ),
                  IconButton(
                    icon: Icon(
                      chatState.isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                      color: chatState.isListening ? AppTheme.roseDanger : Colors.grey[700],
                    ),
                    onPressed: () {
                      ref.read(aiChatControllerProvider.notifier).toggleVoiceRecording((text) {
                        setState(() {
                          _textController.text = text;
                        });
                      });
                    },
                  ),

                  // Text Field
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      minLines: 1,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        hintText: 'Describe issue or ask AI...',
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                  ),

                  // Send Button
                  IconButton(
                    icon: chatState.isSending
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.send_rounded, color: AppTheme.accentBlue),
                    onPressed: chatState.isSending ? null : _sendMessage,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(BuildContext context, ChatMessageModel msg) {
    final isUser = msg.sender == MessageSender.user;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!isUser) ...[
                const CircleAvatar(
                  radius: 16,
                  backgroundColor: AppTheme.primaryBlue,
                  child: Icon(Icons.smart_toy_rounded, size: 18, color: Colors.white),
                ),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isUser ? AppTheme.accentBlue : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: isUser ? null : Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (msg.imageFile != null) ...[
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            File(msg.imageFile!.path),
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(height: 8),
                      ],
                      if (msg.isLoading)
                        const Row(
                          children: [
                            SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                            SizedBox(width: 10),
                            Text('Gemini AI is analyzing...', style: TextStyle(color: Colors.grey, fontSize: 13)),
                          ],
                        )
                      else
                        Text(
                          msg.text,
                          style: TextStyle(
                            color: isUser ? Colors.white : AppTheme.darkNavy,
                            fontSize: 14,
                            height: 1.4,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              if (isUser) ...[
                const SizedBox(width: 8),
                const CircleAvatar(
                  radius: 16,
                  backgroundColor: Color(0xFFCBD5E1),
                  child: Icon(Icons.person_rounded, size: 18, color: AppTheme.darkNavy),
                ),
              ],
            ],
          ),

          // Service Recommendation Card if provided by AI
          if (msg.serviceRecommendation != null) ...[
            const SizedBox(height: 10),
            Container(
              margin: const EdgeInsets.only(left: 40, right: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: AppTheme.emeraldGreen, size: 20),
                      const SizedBox(width: 6),
                      Text(
                        'AI Recommended Service (${msg.serviceRecommendation!.urgency ?? "Medium"} Urgency)',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF166534)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    msg.serviceRecommendation!.serviceName,
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.darkNavy),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    msg.serviceRecommendation!.description,
                    style: TextStyle(color: Colors.grey[700], fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Est. Price: ₹${msg.serviceRecommendation!.estimatedPrice.toInt()}',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.primaryBlue),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.emeraldGreen,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        ),
                        onPressed: () {
                          context.push(
                            '/create-booking',
                            extra: {
                              'serviceId': msg.serviceRecommendation!.serviceId ?? '',
                              'serviceName': msg.serviceRecommendation!.serviceName,
                              'category': msg.serviceRecommendation!.category,
                              'amount': msg.serviceRecommendation!.estimatedPrice,
                            },
                          );
                        },
                        child: const Text('Instant Book CTA'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],

          // Follow up chips
          if (msg.followUpQuestions.isNotEmpty) ...[
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.only(left: 40.0),
              child: Wrap(
                spacing: 8,
                runSpacing: 4,
                children: msg.followUpQuestions.map((q) {
                  return ActionChip(
                    label: Text(q, style: const TextStyle(fontSize: 11)),
                    backgroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFFCBD5E1)),
                    onPressed: () {
                      _textController.text = q;
                      _sendMessage();
                    },
                  );
                }).toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showImageSourceDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            IconButton(
              iconSize: 40,
              icon: const Icon(Icons.camera_alt_rounded, color: AppTheme.accentBlue),
              onPressed: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.camera);
              },
            ),
            IconButton(
              iconSize: 40,
              icon: const Icon(Icons.photo_library_rounded, color: AppTheme.accentBlue),
              onPressed: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }
}
