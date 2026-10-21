import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/controllers/auth_controller.dart';

class WorkerIDCardScreen extends ConsumerWidget {
  const WorkerIDCardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;
    final workerIdCode = user?.workerIdCode ?? 'SC-W-1001';
    final name = user?.name ?? 'ServeCircle Professional';
    final role = user?.serviceCategory ?? 'Certified Service Professional';

    final verificationUrl = 'https://theorize-energize-matted.ngrok-free.dev/verify/worker/$workerIdCode';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Official ServeCircle ID Card'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 10),

            // Visual CR80 ID Card Badge Widget
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E3A5F), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF38BDF8), width: 1.5),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius: 16,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppTheme.accentBlue,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('SC', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
                          ),
                          const SizedBox(width: 8),
                          const Text('ServeCircle', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.emeraldGreen,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'VERIFIED PRO',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 9),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: const Color(0xFF38BDF8),
                        child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : 'W',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 14),

                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('WORKER NAME', style: TextStyle(color: Colors.white70, fontSize: 9, letterSpacing: 0.5)),
                            Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                            const SizedBox(height: 4),
                            const Text('WORKER ID', style: TextStyle(color: Colors.white70, fontSize: 9, letterSpacing: 0.5)),
                            Text(workerIdCode, style: const TextStyle(color: Colors.yellowAccent, fontWeight: FontWeight.w900, fontSize: 14)),
                            const SizedBox(height: 4),
                            Text(role, style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),

                      // Vector QR Code Component
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: QrImageView(
                          data: verificationUrl,
                          version: QrVersions.auto,
                          size: 70.0,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white24, height: 1),
                  const SizedBox(height: 8),
                  const Center(
                    child: Text(
                      'Official Permanent ID · Scan QR code with camera to verify authorization',
                      style: TextStyle(color: Colors.white60, fontSize: 9),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),

            const Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(Icons.shield_rounded, color: AppTheme.emeraldGreen),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Background Verification Active',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Police verification, address check, and practical skill assessment completed.',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
