import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../booking/controllers/booking_controller.dart';

class WorkerJobsScreen extends ConsumerWidget {
  const WorkerJobsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(myBookingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Jobs Queue & Dispatch'),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(myBookingsProvider),
        child: bookingsAsync.when(
          data: (bookings) {
            if (bookings.isEmpty) {
              return const Center(child: Text('No job assignments found.'));
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              itemBuilder: (context, index) {
                final b = bookings[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(b.bookingId, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                            Chip(
                              label: Text(b.status.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                              backgroundColor: AppTheme.lightBlueBg,
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(b.serviceName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('Customer: ${b.customerName}', style: TextStyle(color: Colors.grey[700])),
                        Text('Address: ${b.address}', style: TextStyle(color: Colors.grey[700])),
                        const Divider(height: 20),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Payment: ₹${b.amount.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentBlue)),
                            ElevatedButton(
                              onPressed: () => context.push('/worker-job-detail/${b.id}'),
                              child: const Text('Manage Job'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text('Error loading jobs: $err')),
        ),
      ),
    );
  }
}
