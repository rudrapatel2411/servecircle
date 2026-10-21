import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/controllers/auth_controller.dart';

class WorkerProfileScreen extends ConsumerWidget {
  const WorkerProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Worker Profile & ID Card'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: AppTheme.darkNavy,
                    child: Text(
                      user?.name.isNotEmpty == true ? user!.name[0].toUpperCase() : 'W',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.name ?? 'Worker Name',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.darkNavy),
                  ),
                  Text(
                    user?.workerIdCode ?? 'SC-W-1001',
                    style: const TextStyle(color: AppTheme.accentBlue, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.emeraldGreen.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_rounded, color: AppTheme.emeraldGreen, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'Verified ServeCircle Professional',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.emeraldGreen),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),

            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.badge_outlined, color: AppTheme.accentBlue),
                    title: const Text('Official ServeCircle ID Card'),
                    subtitle: const Text('View & Share Digital Badge / Scannable QR'),
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                    onTap: () => context.push('/worker-id-card'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.qr_code_scanner_rounded, color: AppTheme.accentBlue),
                    title: const Text('Worker Verification QR Scanner'),
                    subtitle: const Text('Scan QR Code to verify authorized status'),
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                    onTap: () => context.push('/qr-scanner'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.category_outlined),
                    title: const Text('Primary Category'),
                    subtitle: Text(user?.serviceCategory ?? 'Home Repairs'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.handyman_outlined),
                    title: const Text('Skills'),
                    subtitle: Text(user?.skills.isNotEmpty == true ? user!.skills.join(', ') : 'AC Repair, Wiring, Plumbing'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.phone_outlined),
                    title: const Text('Phone Number'),
                    subtitle: Text(user?.phone ?? 'Not set'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFE4E6),
                  foregroundColor: AppTheme.roseDanger,
                ),
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Logout Worker Account'),
                onPressed: () async {
                  await ref.read(authControllerProvider.notifier).logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
