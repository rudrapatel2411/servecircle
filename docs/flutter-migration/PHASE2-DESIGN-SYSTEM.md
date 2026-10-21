# PHASE 2: FLUTTER DESIGN SYSTEM & MOBILE AESTHETICS
## ServeCircle Mobile — Neomorphism v2.0 "Emerald & Saffron" Visual Blueprint

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Theme:** Neomorphism v2.0 (Modern Fintech / Premium Urban Service Aesthetic)  
**Web Baseline:** Extracted from `client/src/index.css` and `09-UI-DESIGN-SYSTEM-AUDIT.md`  

---

## 1. BRAND COLOR PALETTE & DART TOKENS

The Flutter application strictly adopts the verified web color tokens to ensure 100% brand fidelity:

```dart
// Conceptual AppColors token class
class AppColors {
  // Primary - Classic Blue (Brand Core)
  static const Color primary50  = Color(0xFFF0F5FA);
  static const Color primary100 = Color(0xFFE1EBF5);
  static const Color primary200 = Color(0xFFC2D7EA);
  static const Color primary300 = Color(0xFF94BCE0);
  static const Color primary400 = Color(0xFF609CD2);
  static const Color primary500 = Color(0xFF3B7DC1);
  static const Color primary600 = Color(0xFF2960A0); // Main CTA, Primary Active
  static const Color primary700 = Color(0xFF224C82);
  static const Color primary800 = Color(0xFF1E4270);
  static const Color primary900 = Color(0xFF1B375B);

  // Accent - Saffron / Amber (Highlights, Badges, Urgency)
  static const Color accent50  = Color(0xFFFFFBEB);
  static const Color accent100 = Color(0xFFFEF3C7);
  static const Color accent200 = Color(0xFFFDE68A);
  static const Color accent300 = Color(0xFFFCD34D);
  static const Color accent400 = Color(0xFFFBBF24);
  static const Color accent500 = Color(0xFFF59E0B); // Premium Accent, Stars
  static const Color accent600 = Color(0xFFD97706);
  static const Color accent700 = Color(0xFFB45309);

  // Deep Navy / Typography
  static const Color navy50  = Color(0xFFF8FAFC);
  static const Color navy100 = Color(0xFFF1F5F9);
  static const Color navy200 = Color(0xFFE2E8F0);
  static const Color navy300 = Color(0xFFCBD5E1);
  static const Color navy400 = Color(0xFF94A3B8);
  static const Color navy500 = Color(0xFF64748B); // Secondary body text
  static const Color navy600 = Color(0xFF475569);
  static const Color navy700 = Color(0xFF334155);
  static const Color navy800 = Color(0xFF1E293B); // Primary body text
  static const Color navy900 = Color(0xFF0F172A); // Headings & deep titles

  // Surfaces & Backgrounds
  static const Color background = Color(0xFFF8FAFC); // Main scaffold background
  static const Color surface    = Color(0xFFFFFFFF); // Card & sheet background
  static const Color surfaceSubtle = Color(0xFFF1F5F9);
  static const Color border     = Color(0xFFE2E8F0); // Subtle card border
  static const Color divider    = Color(0xFFEEF2F6);

  // Functional Semantic Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error   = Color(0xFFEF4444);
  static const Color info    = Color(0xFF3B82F6);
}
```

---

## 2. NEOMORPHISM V2.0 SHADOW & ELEVATION SYSTEM

Neomorphism v2.0 in ServeCircle eliminates muddy, blurry shadows in favor of crisp, layered, directional ambient lighting:

```dart
// Conceptual AppShadows class
class AppShadows {
  // Soft base card shadow
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

  // Elevated floating sheet shadow
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

  // CTA button glow
  static const List<BoxShadow> primaryGlow = [
    BoxShadow(
      color: Color.fromRGBO(41, 96, 160, 0.30),
      blurRadius: 16,
      offset: Offset(0, 6),
    ),
  ];
}
```

---

## 3. TYPOGRAPHY SYSTEM (GOOGLE FONTS)

The typography is built around **Plus Jakarta Sans** (headings & CTAs) and **Outfit / Inter** (numerals & high-density metadata):

```dart
// Conceptual AppTypography class
class AppTypography {
  static TextStyle displayLarge = GoogleFonts.plusJakartaSans(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    color: AppColors.navy900,
    letterSpacing: -0.5,
  );

  static TextStyle headingLarge = GoogleFonts.plusJakartaSans(
    fontSize: 22,
    fontWeight: FontWeight.w700,
    color: AppColors.navy900,
  );

  static TextStyle headingMedium = GoogleFonts.plusJakartaSans(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.navy900,
  );

  static TextStyle bodyLarge = GoogleFonts.plusJakartaSans(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: AppColors.navy800,
    height: 1.5,
  );

  static TextStyle bodyMedium = GoogleFonts.plusJakartaSans(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AppColors.navy500,
  );

  static TextStyle currencyValue = GoogleFonts.outfit(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: AppColors.navy900,
  );

  static TextStyle buttonText = GoogleFonts.plusJakartaSans(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: Colors.white,
    letterSpacing: 0.2,
  );
}
```

---

## 4. COMPONENT LIBRARY SPECIFICATIONS

| Component | Visual Specification | Behaviors & States |
|---|---|---|
| **`AppPrimaryButton`** | Gradient (`primary600` → `primary700`), 14px border radius, 48px height, `primaryGlow` shadow. | Hover scale (1.02), pressed haptic feedback, inline progress spinner during async loading. |
| **`NeomorphicCard`** | Pure white background, `border` outline (1px solid `#E2E8F0`), `card` dual shadow, 16px radius. | Tap ripple, optional active glow border when selected. |
| **`AppTextField`** | 12px radius, `#F8FAFC` fill, `#E2E8F0` border, transitions to `#2960A0` border on focus. | Clear button (X), prefix icon, error helper text with shake animation. |
| **`UrgencyBadge`** | Pill container (20px height, 12px radius). Colors: Emergency (Red), High (Orange), Medium (Yellow), Low (Blue). | Pulsing dot animation for Emergency/High. |
| **`LiveMapMarker`** | Circular worker avatar with green pulsating animated radar ring and vehicle type badge. | Smooth coordinate interpolation along route. |
| **`VerifiedOtpCard`** | Amber dashed border (2px), `#FFFBEB` background, large 28px letter-spaced bold digits. | Copy-to-clipboard tap action with confirmation toast. |

---

## 5. RESPONSIVE MOBILE ADAPTATION & SAFE AREAS

ServeCircle mobile is designed specifically for Android smartphones (from 5.5-inch compact devices to 6.8-inch modern flagships):

- **Safe Area Insets:** All top headers wrap `SafeArea(top: true)` to avoid notch and punch-hole camera cutouts; bottom navigation pads `MediaQuery.of(context).padding.bottom`.
- **Keyboard Avoidance:** All forms wrap `SingleChildScrollView(physics: BouncingScrollPhysics())` with `resizeToAvoidBottomInset: true` to prevent keyboard overflow exceptions.
- **Touch Targets:** All interactive icons, list tiles, and buttons enforce a minimum 48x48 dp touch target according to Material Accessibility guidelines.
