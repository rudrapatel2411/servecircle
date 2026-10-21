import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:servecircle_app/app.dart';
import 'package:servecircle_app/core/config/app_config.dart';

void main() {
  testWidgets('ServeCircle App smoke test & bootstrap verification', (
    WidgetTester tester,
  ) async {
    // Pump ServeCircleApp inside Riverpod ProviderScope
    await tester.pumpWidget(const ProviderScope(child: ServeCircleApp()));

    // Verify root app widget mounts
    expect(find.byType(ServeCircleApp), findsOneWidget);

    // Verify CoreBootstrapScreen renders
    expect(find.byType(CoreBootstrapScreen), findsOneWidget);

    // Verify application brand title from AppConfig
    expect(find.text(AppConfig.appName), findsWidgets);

    // Verify T-01 Foundation badge and phase 3 roadmap title
    expect(find.text('T-01 Foundation'), findsOneWidget);
    expect(find.text('Phase 3 Implementation Pipeline'), findsOneWidget);
  });
}
