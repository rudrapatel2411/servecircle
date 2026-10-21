# 09 — UI DESIGN SYSTEM AUDIT
## ServeCircle Flutter Migration — Visual Design System Specification

**Source:** Verified from client/src/index.css, client/src/components/, client/src/pages/

---

## DESIGN PHILOSOPHY

**Theme:** Neomorphism v2.0 — "Emerald & Saffron" design system
**Mood:** Premium, trust-inspiring, modern fintech/service app aesthetic
**Dark mode:** Not implemented (light only)

---

## COLOR PALETTE (VERIFIED from index.css)

### Primary — Classic Blue
```
--primary-50:  #f0f5fa
--primary-100: #e1ebf5
--primary-200: #c2d7ea
--primary-300: #94bce0
--primary-400: #609cd2
--primary-500: #3b7dc1
--primary-600: #2960a0   ? Main CTA, buttons, active states
--primary-700: #224c82
--primary-800: #1e4270
--primary-900: #1b375b
```

### Accent — Saffron / Amber
```
--accent-50:  #fffbeb
--accent-100: #fef3c7
--accent-200: #fde68a
--accent-300: #fcd34d
--accent-400: #fbbf24
--accent-500: #f59e0b   ? Accent, warnings, premium badges
--accent-600: #d97706
--accent-700: #b45309
```

### Navy / Deep Text
```
--navy-50:  #f8fafc
--navy-100: #f1f5f9
--navy-200: #e2e8f0
--navy-300: #cbd5e1
--navy-400: #94a3b8
--navy-500: #64748b
--navy-600: #475569
--navy-700: #334155
--navy-800: #1e293b   ? Primary text
--navy-900: #0f172a   ? Headings, deepest text
```

### Gray Scale (Blue-tinted)
```
--gray-50:  #f8fafc
--gray-100: #f1f5f9   ? Page backgrounds
--gray-200: #e2e8f0   ? Card borders, dividers
--gray-300: #cbd5e1
--gray-400: #94a3b8
--gray-500: #64748b
--gray-600: #475569
--gray-700: #334155
--gray-800: #1e293b
--gray-900: #0f172a
```

### Semantic Colors
```
--success: #3b7dc1   (blue — same as primary-500; non-standard choice)
--warning: #f59e0b   (amber)
--danger:  #ef4444   (red)
--info:    #3b82f6   (standard blue)
```

### Text Tokens
```
--text-primary:   #0f172a   ? Body text
--text-secondary: #334155   ? Secondary text
--text-muted:     #64748b   ? Placeholder, captions
--text-faint:     #94a3b8   ? Very subtle text
```

---

## TYPOGRAPHY (VERIFIED)

| Token | Value | Use |
|-------|-------|-----|
| --font-heading | 'Outfit', sans-serif | All headings (H1-H4) |
| --font-body | 'Inter', sans-serif | Body text, labels, inputs |
| Source | Google Fonts | Loaded via @import |

**Font weights in use:** 300, 400, 500, 600, 700, 800, 900

---

## SPACING & SIZING

| Token | Value |
|-------|-------|
| --navbar-height | 80px |
| --sidebar-width | 260px |
| --bottom-nav-height | 64px |
| --safe-top | env(safe-area-inset-top, 0px) |
| --safe-bottom | env(safe-area-inset-bottom, 0px) |

---

## BORDER RADIUS

| Token | Value | Use |
|-------|-------|-----|
| --radius-sm | 10px | Small chips, tags |
| --radius-md | 16px | Cards, inputs |
| --radius-lg | 24px | Modals, panels |
| --radius-xl | 32px | Large cards |
| --radius-2xl | 48px | Hero sections |
| --radius-full | 9999px | Pills, avatars |

---

## ELEVATION / SHADOWS

```css
--card-shadow:       0 4px 20px rgba(34, 76, 130, 0.08), 0 1px 4px rgba(34, 76, 130, 0.04);
--card-shadow-hover: 0 12px 36px rgba(34, 76, 130, 0.12), 0 4px 12px rgba(34, 76, 130, 0.08);
```

---

## LAYOUT STRUCTURE

### Dashboard Layout (4 panels)
```
+------------------------------------------------------+
¦  Navbar (height: 80px)                               ¦
+------------------------------------------------------¦
¦   Sidebar    ¦        Main Content Area              ¦
¦  (260px)     ¦        (flex, scrollable)             ¦
¦              ¦                                       ¦
+------------------------------------------------------+
```

### Mobile Layout (Customer Panel)
```
+------------------------------+
¦  Top Navbar (compact)        ¦
+------------------------------¦
¦                              ¦
¦   Main Content (scrollable)  ¦
¦                              ¦
+------------------------------¦
¦  Bottom Navigation (64px)    ¦
+------------------------------+
```

---

## KEY UI PATTERNS

### Cards (Primary Pattern)
- White background (`--card-bg: #ffffff`)
- Subtle blue-tinted shadow
- Rounded corners (16px typically)
- Hover: elevated shadow

### Buttons
```
Primary:    bg #2960a0, text white, radius full, hover: darken
Secondary:  bg transparent, border 1px #2960a0, text #2960a0
Danger:     bg #ef4444, text white
Disabled:   opacity 0.5, cursor not-allowed
```

### Input Fields
```
border: 1px solid --gray-200
border-radius: --radius-md (16px)
padding: 12px 16px
focus: border-color --primary-600, box-shadow 0 0 0 3px rgba(41,96,160,0.1)
```

### Status Badges / Pills
```
bg: semi-transparent tint of status color
text: status color
border-radius: --radius-full
padding: 4px 12px
```

### Glassmorphism Elements (Premium Cards)
```css
background: rgba(255,255,255,0.6);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.2);
```

---

## ICON SYSTEM

**Library:** react-icons/hi2 (HeroIcons v2)
**Style:** Outline (default), Solid for filled states

Key icons used:
- Navigation: Home, Briefcase, ChartBar, Cog, User
- Actions: Plus, Pencil, Trash, Check, XMark, ArrowRight
- Status: ShieldCheck, ExclamationTriangle, Bell, Bolt
- Services: Wrench, Sparkles, Truck, Heart, Map
- Payment: Banknotes, CreditCard, Wallet
- Communication: ChatBubbleLeftRight, Phone, QrCode

**Flutter equivalent:** Use Material Icons or Cupertino Icons, or import HeroIcons as custom icon font.

---

## ANIMATIONS (VERIFIED)

### Framer Motion Usage
Found in: LiveTracking.jsx, AI chat pages, some customer hub pages

Common patterns:
- `motion.div` with `initial`, `animate`, `exit` props
- `AnimatePresence` for route/modal transitions
- Fade + slide transitions
- Spring animations for progress indicators

### CSS Animations Used
- `@keyframes fadeIn` — card entry
- `@keyframes slideInUp` — bottom sheets
- `@keyframes pulse` — loading states
- `transition: all 0.2s ease` — hover states throughout

**Flutter equivalents:**
- AnimationController + FadeTransition
- SlideTransition (bottom sheet)
- AnimatedContainer for hover equivalents
- Lottie for complex animations

---

## SCREEN-SPECIFIC DESIGN NOTES

### 1. Customer Dashboard
- Greeting card with user name
- Quick action grid (4-6 icons)
- Active booking status card (highlighted)
- Recent bookings list

### 2. AI Chat Screen
- WhatsApp-like chat bubbles
- Left bubble: AI (light background)
- Right bubble: User (primary blue)
- Service recommendation cards inline in chat
- Image upload button in input bar
- Microphone button (web: not implemented — voice not present)
- Suggestion chips below input

### 3. Live Tracking Screen
- Full-screen Leaflet map (Flutter: Google Maps / flutter_map)
- Timeline stepper (5 steps: Dispatched ? Arriving ? Arrived ? Started ? Done)
- Worker avatar + name
- ETA countdown
- OTP display for worker start verification
- Worker pre-verification badge

### 4. Worker Verification (QR)
- QR code scanner (web: manual code entry in modal)
- Worker profile card with verification badge
- Green/Red trust indicator
- Worker ID code display

### 5. Booking Flow
- Multi-step form (not tabbed)
- Service summary card
- Address input
- Date/time picker
- Payment method selector (UPI/Card/Wallet)
- Coupon input
- Price summary with discount

### 6. Admin Dashboard
- KPI cards (4 metrics at top)
- Charts (area/bar — web uses recharts/chart.js or custom CSS charts)
- Data tables for bookings/workers

### 7. Worker Dashboard
- Availability toggle (On/Off shift)
- Active job banner
- Earnings today card
- Job queue list

---

## BOTTOM NAVIGATION (CUSTOMER MOBILE)

The CSS variable `--bottom-nav-height: 64px` exists but the web implementation is unclear (sidebar primarily).

**Flutter must implement:**
```
Customer Bottom Nav:
  +-- Home         (HouseIcon)
  +-- Services     (GridIcon)
  +-- AI Chat      (SparklesIcon)
  +-- Bookings     (CalendarIcon)
  +-- Profile/More (UserIcon)
```

---

## FLUTTER THEME CONFIGURATION

```dart
ThemeData(
  colorScheme: ColorScheme(
    primary:   Color(0xFF2960a0),   // --primary-600
    secondary: Color(0xFFf59e0b),  // --accent-500
    surface:   Color(0xFFFFFFFF),  // --card-bg
    background:Color(0xFFf1f5f9),  // --gray-100
    error:     Color(0xFFef4444),  // --danger
    onPrimary: Color(0xFFFFFFFF),
    onSecondary: Color(0xFF000000),
    onSurface: Color(0xFF1e293b),  // --navy-800
    onBackground: Color(0xFF0f172a),
    onError: Color(0xFFFFFFFF),
    brightness: Brightness.light,
  ),
  fontFamily: 'Inter',
  textTheme: TextTheme(
    displayLarge: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w800),
    headlineMedium: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w700),
    // etc.
  ),
  cardTheme: CardTheme(
    elevation: 4,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
  ),
  inputDecorationTheme: InputDecorationTheme(
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: Color(0xFF2960a0),
      shape: StadiumBorder(),
    ),
  ),
)
```
