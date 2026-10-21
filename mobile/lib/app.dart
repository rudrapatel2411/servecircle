import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'core/config/app_config.dart';
import 'core/theme/app_colors.dart';
import 'core/theme/app_shadows.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/app_typography.dart';

/// Root application widget for ServeCircle.
///
/// Configures MaterialApp with the Neomorphism v2.0 light theme and displays
/// the verified foundation screen for Phase 3 / Task T-01.
class ServeCircleApp extends ConsumerWidget {
  const ServeCircleApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const CoreBootstrapScreen(),
    );
  }
}

/// Initial verified branded landing screen proving theme, typography,
/// Riverpod context, and backend environment configuration.
class CoreBootstrapScreen extends StatelessWidget {
  const CoreBootstrapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.primary200),
              ),
              child: const Icon(
                LucideIcons.shieldCheck,
                color: AppColors.primary600,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            Text(AppConfig.appName, style: AppTypography.headingMedium),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.accent50,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.accent200),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.accent500,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'T-01 Foundation',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.accent700,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Hero Brand Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppShadows.card,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                AppColors.primary600,
                                AppColors.primary800,
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: AppShadows.primaryGlow,
                          ),
                          child: const Icon(
                            LucideIcons.sparkles,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'ServeCircle Mobile',
                                style: AppTypography.headingLarge,
                              ),
                              Text(
                                'On-Demand Multi-Role Services',
                                style: AppTypography.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 12),
                    Text(
                      'Core Flutter infrastructure and Neomorphism v2.0 design tokens initialized. '
                      'Platform target supports Customer, Worker, Admin, and B2B roles with 100% web parity.',
                      style: AppTypography.bodyLarge,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Configuration & Environment Inspection Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppShadows.card,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          LucideIcons.settings,
                          size: 18,
                          color: AppColors.navy600,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Environment & Config (AppConfig)',
                          style: AppTypography.headingSmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _ConfigRow(
                      label: 'Package ID',
                      value: AppConfig.applicationId,
                    ),
                    _ConfigRow(
                      label: 'Environment',
                      value: AppConfig.environment,
                    ),
                    _ConfigRow(label: 'Version', value: AppConfig.appVersion),
                    _ConfigRow(
                      label: 'API Base URL',
                      value: AppConfig.apiBaseUrl,
                    ),
                    _ConfigRow(label: 'Socket URL', value: AppConfig.socketUrl),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Implementation Status Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppShadows.card,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          LucideIcons.listTodo,
                          size: 18,
                          color: AppColors.navy600,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Phase 3 Implementation Pipeline',
                          style: AppTypography.headingSmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const _StepTile(
                      task: 'T-01',
                      title: 'Core Infrastructure & App Bootstrap',
                      status: 'COMPLETED & VERIFIED',
                      isDone: true,
                    ),
                    const _StepTile(
                      task: 'T-02',
                      title: 'Storage & Keystore Initialization (Hive)',
                      status: 'NEXT TASK',
                      isNext: true,
                    ),
                    const _StepTile(
                      task: 'T-03',
                      title: 'Network Client & Interceptors (Dio)',
                      status: 'PENDING',
                    ),
                    const _StepTile(
                      task: 'T-04',
                      title: 'Authentication & Riverpod Session',
                      status: 'PENDING',
                    ),
                    const _StepTile(
                      task: 'T-05',
                      title: 'GoRouter & Multi-Role Route Guards',
                      status: 'PENDING',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Design Tokens Proof Showcase
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                  boxShadow: AppShadows.card,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Design Tokens Proof',
                      style: AppTypography.headingSmall,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _ColorSwatch(
                          color: AppColors.primary600,
                          label: 'Primary',
                        ),
                        const SizedBox(width: 8),
                        _ColorSwatch(
                          color: AppColors.accent500,
                          label: 'Saffron',
                        ),
                        const SizedBox(width: 8),
                        _ColorSwatch(color: AppColors.navy900, label: 'Navy'),
                        const SizedBox(width: 8),
                        _ColorSwatch(
                          color: AppColors.success,
                          label: 'Success',
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(LucideIcons.check, size: 18),
                      label: const Text('Primary Neomorphic CTA'),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(LucideIcons.arrowRight, size: 18),
                      label: const Text('Secondary Outlined Action'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConfigRow extends StatelessWidget {
  final String label;
  final String value;

  const _ConfigRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.bodySmall),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.navy900,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StepTile extends StatelessWidget {
  final String task;
  final String title;
  final String status;
  final bool isDone;
  final bool isNext;

  const _StepTile({
    required this.task,
    required this.title,
    required this.status,
    this.isDone = false,
    this.isNext = false,
  });

  @override
  Widget build(BuildContext context) {
    Color badgeColor = AppColors.navy100;
    Color textColor = AppColors.navy600;
    if (isDone) {
      badgeColor = const Color(0xFFD1FAE5);
      textColor = AppColors.success;
    } else if (isNext) {
      badgeColor = AppColors.accent100;
      textColor = AppColors.accent700;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: isDone ? AppColors.primary50 : AppColors.navy100,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              task,
              style: AppTypography.caption.copyWith(
                fontWeight: FontWeight.w700,
                color: isDone ? AppColors.primary700 : AppColors.navy600,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: AppTypography.bodySmall.copyWith(
                fontWeight: isNext ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: badgeColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              status,
              style: AppTypography.caption.copyWith(
                color: textColor,
                fontWeight: FontWeight.w700,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ColorSwatch extends StatelessWidget {
  final Color color;
  final String label;

  const _ColorSwatch({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 10,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
