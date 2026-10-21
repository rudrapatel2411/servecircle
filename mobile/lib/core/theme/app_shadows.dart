import 'package:flutter/material.dart';

/// ServeCircle Neomorphism v2.0 Shadow & Elevation System.
///
/// Provides crisp, layered ambient directional lighting tokens instead of blurry shadows.
///
/// Source of Truth: `docs/flutter-migration/PHASE2-DESIGN-SYSTEM.md`
class AppShadows {
  AppShadows._();

  /// Soft ambient shadow for standard neomorphic cards and surfaces.
  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.04),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.02),
      blurRadius: 4,
      offset: Offset(0, 1),
    ),
  ];

  /// Elevated shadow for floating modal bottom sheets, dialogs, and sticky headers.
  static const List<BoxShadow> elevated = [
    BoxShadow(
      color: Color.fromRGBO(41, 96, 160, 0.08), // Primary-tinted ambient glow
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.04),
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];

  /// Directional glow for primary action buttons (Classic Blue CTA).
  static const List<BoxShadow> primaryGlow = [
    BoxShadow(
      color: Color.fromRGBO(41, 96, 160, 0.30),
      blurRadius: 16,
      offset: Offset(0, 6),
    ),
  ];

  /// Warm amber glow for urgent warnings, rating highlights, and emergency SOS triggers.
  static const List<BoxShadow> accentGlow = [
    BoxShadow(
      color: Color.fromRGBO(245, 158, 11, 0.25),
      blurRadius: 14,
      offset: Offset(0, 4),
    ),
  ];
}
