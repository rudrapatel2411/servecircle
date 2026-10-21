import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../controllers/booking_controller.dart';
import '../../../data/models/booking_model.dart';

class BookingDetailScreen extends ConsumerWidget {
  final String bookingId;

  const BookingDetailScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(myBookingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Details'),
      ),
      body: bookingsAsync.when(
        data: (bookings) {
          final b = bookings.firstWhere(
            (item) => item.id == bookingId || item.bookingId == bookingId,
            orElse: () => BookingModel(
              id: bookingId,
              bookingId: bookingId,
              status: 'assigned',
              scheduledDate: DateTime.now().toIso8601String(),
              address: 'Service Location',
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
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(b.bookingId, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                            Chip(
                              label: Text(b.status.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                              backgroundColor: AppTheme.lightBlueBg,
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(b.serviceName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text('Address: ${b.address}', style: TextStyle(color: Colors.grey[700])),
                        const SizedBox(height: 4),
                        Text('Scheduled: ${b.scheduledDate.split("T")[0]} (${b.timeSlot})', style: TextStyle(color: Colors.grey[700])),
                        const SizedBox(height: 4),
                        Text('Payment: ${b.paymentMethod} (₹${b.amount.toInt()})', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentBlue)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Assigned Worker Info
                const Text('Assigned Professional', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                Card(
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppTheme.primaryBlue,
                      child: Icon(Icons.person_rounded, color: Colors.white),
                    ),
                    title: Text(b.workerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: const Text('ServeCircle Verified Background Checked Pro'),
                    trailing: const Icon(Icons.verified_rounded, color: AppTheme.emeraldGreen),
                  ),
                ),
                const SizedBox(height: 30),

                if (b.status == 'completed') ...[
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.star_rounded),
                      label: const Text('Rate & Review Service Worker'),
                      onPressed: () {
                        final workerId = b.worker is Map ? (b.worker['_id'] ?? 'worker-1') : 'worker-1';
                        context.push('/post-review/${b.id}/$workerId');
                      },
                    ),
                  ),
                ],
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading booking detail: $err')),
      ),
    );
  }
}
