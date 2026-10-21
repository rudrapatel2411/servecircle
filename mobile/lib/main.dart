import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';

/// Application bootstrap entry point.
///
/// Initializes Flutter engine bindings, sets up the Riverpod [ProviderScope],
/// and launches the root [ServeCircleApp].
void main() {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(const ProviderScope(child: ServeCircleApp()));
}
