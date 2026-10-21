import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../booking/controllers/booking_controller.dart';
import '../../../data/models/booking_model.dart';

class WorkerJobDetailScreen extends ConsumerStatefulWidget {
  final String bookingId;

  const WorkerJobDetailScreen({super.key, required this.bookingId});

  @override
  ConsumerState<WorkerJobDetailScreen> createState() => _WorkerJobDetailScreenState();
}

class _WorkerJobDetailScreenState extends ConsumerState<WorkerJobDetailScreen> {
  final _otpController = TextEditingController();
  String? _generatedOtp;
  bool _verifying = false;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  void _requestStartOtp() async {
    final otp = await ref.read(bookingControllerProvider.notifier).requestStartOtp(widget.bookingId);
    if (otp != null && mounted) {
      setState(() => _generatedOtp = otp);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Start OTP Generated: $otp (Share with Customer)')),
      );
    }
  }

  void _verifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length < 4) return;

    setState(() => _verifying = true);
    final success = await ref.read(bookingControllerProvider.notifier).verifyOtp(widget.bookingId, otp);

    if (mounted) {
      setState(() => _verifying = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP Verified Successfully! Job Completed. 🎉')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid OTP. Please try again.')),
        );
      }
    }
  }

  void _updateStatus(String status) async {
    final success = await ref.read(bookingControllerProvider.notifier).updateStatus(widget.bookingId, status);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Job status updated to $status ✅')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingsAsync = ref.watch(myBookingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Management'),
      ),
      body: bookingsAsync.when(
        data: (bookings) {
          final b = bookings.firstWhere(
            (item) => item.id == widget.bookingId || item.bookingId == widget.bookingId,
            orElse: () => BookingModel(
              id: widget.bookingId,
              bookingId: widget.bookingId,
              status: 'assigned',
              scheduledDate: DateTime.now().toIso8601String(),
              address: 'Customer Location',
              amount: 499.0,
              createdAt: DateTime.now().toIso8601String(),
            ),
          );

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Booking ${b.bookingId}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(height: 6),
                        Text(b.serviceName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.accentBlue)),
                        const SizedBox(height: 10),
                        Text('Customer: ${b.customerName}'),
                        Text('Address: ${b.address}'),
                        Text('Scheduled: ${b.scheduledDate.split("T")[0]} (${b.timeSlot})'),
                        Text('Collect Amount: ₹${b.amount.toInt()} (${b.paymentMethod})', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                const Text('Job Status Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.amberWarning),
                        onPressed: () => _updateStatus('in_progress'),
                        child: const Text('Start Job (In Progress)'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // OTP Verification Box
                Card(
                  color: AppTheme.lightBlueBg,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Job Start & Completion OTP Verification', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        const SizedBox(height: 8),
                        const Text('Request 4-digit OTP from customer to verify job completion.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 14),

                        if (_generatedOtp != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.amber.shade100,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Generated Start OTP:'),
                                Text(_generatedOtp!, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, letterSpacing: 2)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),
                        ],

                        OutlinedButton.icon(
                          icon: const Icon(Icons.password_rounded),
                          label: const Text('Generate Start OTP'),
                          onPressed: _requestStartOtp,
                        ),
                        const SizedBox(height: 16),

                        TextField(
                          controller: _otpController,
                          keyboardType: TextInputType.number,
                          maxLength: 4,
                          decoration: const InputDecoration(
                            labelText: 'Enter Customer OTP',
                            hintText: '4-digit OTP',
                          ),
                        ),
                        const SizedBox(height: 8),

                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.emeraldGreen),
                            onPressed: _verifying ? null : _verifyOtp,
                            child: _verifying
                                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('Verify OTP & Complete Job'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading job detail: $err')),
      ),
    );
  }
}
