import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../booking/controllers/booking_controller.dart';

class WorkerDashboardScreen extends ConsumerWidget {
  const WorkerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final bookingsAsync = ref.watch(myBookingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Pro Portal: ${user?.name ?? "Worker"} 🛠️', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('ID: ${user?.workerIdCode ?? "SC-W-1001"} • Verified Pro', style: const TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner_rounded, color: AppTheme.accentBlue),
            onPressed: () => context.push('/qr-scanner'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status & Verification Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E3A5F)],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const CircleAvatar(
                        backgroundColor: AppTheme.emeraldGreen,
                        radius: 18,
                        child: Icon(Icons.verified_user_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('ServeCircle Authorized Pro', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            Text('Specialization: ${user?.serviceCategory ?? "Certified Professional"}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Colors.white24, height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatItem('4.9 ★', 'Rating'),
                      _buildStatItem('100%', 'Safety Score'),
                      _buildStatItem('Verified', 'KYC Status'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Quick Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue),
                    icon: const Icon(Icons.badge_rounded),
                    label: const Text('My ID Card'),
                    onPressed: () => context.push('/worker-id-card'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.qr_code_scanner_rounded),
                    label: const Text('Scan QR'),
                    onPressed: () => context.push('/qr-scanner'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),

            const Text('Assigned Jobs Queue', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.darkNavy)),
            const SizedBox(height: 12),

            bookingsAsync.when(
              data: (bookings) {
                if (bookings.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Center(child: Text('No active job assignments currently.')),
                    ),
                  );
                }

                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: bookings.length,
                  itemBuilder: (context, index) {
                    final b = bookings[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppTheme.lightBlueBg,
                          child: Text('${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentBlue)),
                        ),
                        title: Text(b.serviceName, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('Status: ${b.status.toUpperCase()} • ₹${b.amount.toInt()}'),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                        onTap: () => context.push('/worker-job-detail/${b.id}'),
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) => Text('Error loading jobs: $err'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String val, String label) {
    return Column(
      children: [
        Text(val, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }
}
