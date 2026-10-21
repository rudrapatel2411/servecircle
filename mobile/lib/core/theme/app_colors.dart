import 'package:flutter/material.dart';

/// ServeCircle Neomorphism v2.0 Brand Color Palette.
///
/// Source of Truth: `docs/flutter-migration/PHASE2-DESIGN-SYSTEM.md`
class AppColors {
  AppColors._();

  // ---------------------------------------------------------------------------
  // Primary — Classic Blue (Brand Core & Primary Interactive Elements)
  // ---------------------------------------------------------------------------
  static const Color primary50 = Color(0xFFF0F5FA);
  static const Color primary100 = Color(0xFFE1EBF5);
  static const Color primary200 = Color(0xFFC2D7EA);
  static const Color primary300 = Color(0xFF94BCE0);
  static const Color primary400 = Color(0xFF609CD2);
  static const Color primary500 = Color(0xFF3B7DC1);
  static const Color primary600 = Color(0xFF2960A0); // Main CTA, Primary Active
  static const Color primary700 = Color(0xFF224C82);
  static const Color primary800 = Color(0xFF1E4270);
  static const Color primary900 = Color(0xFF1B375B);

  // ---------------------------------------------------------------------------
  // Accent — Saffron / Amber (Highlights, Ratings, Badges & Urgency)
  // ---------------------------------------------------------------------------
  static const Color accent50 = Color(0xFFFFFBEB);
  static const Color accent100 = Color(0xFFFEF3C7);
  static const Color accent200 = Color(0xFFFDE68A);
  static const Color accent300 = Color(0xFFFCD34D);
  static const Color accent400 = Color(0xFFFBBF24);
  static const Color accent500 = Color(
    0xFFF59E0B,
  ); // Premium Accent, Stars, Warning
  static const Color accent600 = Color(0xFFD97706);
  static const Color accent700 = Color(0xFFB45309);

  // ---------------------------------------------------------------------------
  // Deep Navy / Slate (Headings, Body Copy & Dark Accents)
  // ---------------------------------------------------------------------------
  static const Color navy50 = Color(0xFFF8FAFC);
  static const Color navy100 = Color(0xFFF1F5F9);
  static const Color navy200 = Color(0xFFE2E8F0);
  static const Color navy300 = Color(0xFFCBD5E1);
  static const Color navy400 = Color(0xFF94A3B8);
  static const Color navy500 = Color(0xFF64748B); // Secondary body copy
  static const Color navy600 = Color(0xFF475569);
  static const Color navy700 = Color(0xFF334155);
  static const Color navy800 = Color(0xFF1E293B); // Primary body copy
  static const Color navy900 = Color(0xFF0F172A); // Headings & deepest text

  // ---------------------------------------------------------------------------
  // Surfaces & Backgrounds (Neomorphic Base)
  // ---------------------------------------------------------------------------
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSubtle = Color(0xFFF1F5F9);
  static const Color border = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFEEF2F6);

  // ---------------------------------------------------------------------------
  // Semantic Status Colors
  // ---------------------------------------------------------------------------
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
}
