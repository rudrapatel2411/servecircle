import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/repositories/review_repository.dart';

class PostReviewScreen extends ConsumerStatefulWidget {
  final String bookingId;
  final String workerId;

  const PostReviewScreen({
    super.key,
    required this.bookingId,
    required this.workerId,
  });

  @override
  ConsumerState<PostReviewScreen> createState() => _PostReviewScreenState();
}

class _PostReviewScreenState extends ConsumerState<PostReviewScreen> {
  double _rating = 5.0;
  final _commentController = TextEditingController();
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _submitReview() async {
    if (_commentController.text.trim().isEmpty) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      await ReviewRepository().submitReview(
        bookingId: widget.bookingId,
        workerId: widget.workerId,
        rating: _rating,
        comment: _commentController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Thank you for rating your ServeCircle Pro! ⭐')),
        );
        context.pop();
      }
    } catch (e) {
      setState(() {
        _submitting = false;
        _error = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rate Your Professional'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'How was your experience?',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.darkNavy),
            ),
            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starIndex = index + 1;
                return IconButton(
                  iconSize: 38,
                  icon: Icon(
                    starIndex <= _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: Colors.amber,
                  ),
                  onPressed: () {
                    setState(() => _rating = starIndex.toDouble());
                  },
                );
              }),
            ),
            const SizedBox(height: 20),

            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: AppTheme.roseDanger)),
              const SizedBox(height: 12),
            ],

            TextField(
              controller: _commentController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Write your feedback...',
                hintText: 'Punctuality, quality of work, cleanliness...',
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: _submitting ? null : _submitReview,
              child: _submitting
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Submit Verified Review'),
            ),
          ],
        ),
      ),
    );
  }
}
