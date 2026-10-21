import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../controllers/service_controller.dart';

class CustomerServiceDetailScreen extends ConsumerWidget {
  final String serviceId;

  const CustomerServiceDetailScreen({super.key, required this.serviceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final serviceAsync = ref.watch(serviceDetailProvider(serviceId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Service Details'),
      ),
      body: serviceAsync.when(
        data: (service) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  height: 180,
                  decoration: BoxDecoration(
                    color: AppTheme.lightBlueBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      service.icon != null && service.icon!.isNotEmpty
                          ? Text(service.icon!, style: const TextStyle(fontSize: 64))
                          : const Icon(Icons.handyman_rounded, size: 64, color: AppTheme.accentBlue),
                      const SizedBox(height: 8),
                      const Text('ServeCircle Verified Guarantee 🛡️', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        service.name,
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.darkNavy),
                      ),
                    ),
                    Text(
                      '₹${service.price.toInt()}',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.accentBlue),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                          Text(' ${service.rating} (${service.reviewsCount} reviews)', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text('⏱️ ${service.duration ?? "45-60 min"}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 20),

                const Text('Overview', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(
                  service.description,
                  style: TextStyle(color: Colors.grey[700], fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 24),

                const Text('What is included?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                _buildIncludedItem('Background-verified certified professional'),
                _buildIncludedItem('Full diagnostic & upfront pricing'),
                _buildIncludedItem('Post-service 30-day warranty coverage'),
                _buildIncludedItem('ServeCircle 100% Satisfaction Guarantee'),

                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      context.push(
                        '/create-booking',
                        extra: {
                          'serviceId': service.id,
                          'serviceName': service.name,
                          'category': service.category,
                          'amount': service.price,
                        },
                      );
                    },
                    child: const Text('Book Service Now', style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading service: $err')),
      ),
    );
  }

  Widget _buildIncludedItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          const Icon(Icons.check_circle_rounded, color: AppTheme.emeraldGreen, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 13))),
        ],
      ),
    );
  }
}
