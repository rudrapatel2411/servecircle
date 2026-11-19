/**
 * pricingEngine.js
 * ─────────────────────────────────────────────────────────────────────
 * Central dynamic pricing utility for ServeCircle.
 * All service hubs import from here — NO static prices scattered in components.
 *
 * Principles:
 *  • Every price must change when user changes an input (quantity, tier, distance, etc.)
 *  • Show itemised breakdown so user understands what they're paying for
 *  • All amounts are in ₹ INR
 * ─────────────────────────────────────────────────────────────────────
 */

// ─── Helpers ────────────────────────────────────────────────────────
export const fmt = (n) => Math.round(n).toLocaleString('en-IN');

/** Apply GST (18%) to a price */
export const withGST = (price, gstRate = 18) =>
  Math.round(price * (1 + gstRate / 100));

/** Linear interpolation between two values */
const lerp = (a, b, t) => a + (b - a) * t;

// ─────────────────────────────────────────────────────────────────────
// TRAVEL & COMMUTE
// ─────────────────────────────────────────────────────────────────────

export const PICKUP_HUBS = {
  airport: [
    { code: 'AMD', name: 'Sardar Vallabhbhai Patel Intl Airport (Ahmedabad)', city: 'Ahmedabad' },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl Airport (Mumbai)', city: 'Mumbai' },
    { code: 'DEL', name: 'Indira Gandhi Intl Airport (Delhi)', city: 'Delhi' },
    { code: 'BLR', name: 'Kempegowda Intl Airport (Bengaluru)', city: 'Bengaluru' },
    { code: 'PNQ', name: 'Pune International Airport (Pune)', city: 'Pune' },
    { code: 'STV', name: 'Surat International Airport (Surat)', city: 'Surat' },
    { code: 'BDQ', name: 'Vadodara Airport (Vadodara)', city: 'Vadodara' },
  ],
  railway: [
    { code: 'ADI', name: 'Ahmedabad Junction (Kalupur Railway Station)', city: 'Ahmedabad' },
    { code: 'SBI', name: 'Sabarmati Junction Railway Station', city: 'Ahmedabad' },
    { code: 'BRC', name: 'Vadodara Junction Railway Station', city: 'Vadodara' },
    { code: 'ST',  name: 'Surat Railway Station', city: 'Surat' },
    { code: 'MMCT', name: 'Mumbai Central Railway Station', city: 'Mumbai' },
    { code: 'NDLS', name: 'New Delhi Railway Station (NDLS)', city: 'Delhi' },
    { code: 'SBC', name: 'KSR Bengaluru City Railway Station', city: 'Bengaluru' },
  ],
  bus: [
    { code: 'GEETA', name: 'Geeta Mandir GSRTC Central Bus Terminal', city: 'Ahmedabad' },
    { code: 'RANIP', name: 'Ranip GSRTC Bus Port', city: 'Ahmedabad' },
    { code: 'NEHRU', name: 'Nehru Nagar Central BRTS / Bus Hub', city: 'Ahmedabad' },
    { code: 'CTM',   name: 'CTM Express Highway Bus Stand', city: 'Ahmedabad' },
    { code: 'ISBT',  name: 'Kashmere Gate ISBT Terminal', city: 'Delhi' },
    { code: 'MBS',   name: 'Majestic Kempegowda Bus Station', city: 'Bengaluru' },
    { code: 'BORI',  name: 'Borivali / Dadar Bus Terminal', city: 'Mumbai' },
  ],
};

export const AIRPORT_OPTIONS = PICKUP_HUBS.airport;

export const OUTSTATION_CARS = [
  { id: 'hatchback',   name: 'Hatchback (Swift / i20)',        seats: '4 Seats', withDriverRate: 11, selfDriveRate: 10, driverDaily: 400,  selfDailyFee: 900,  icon: '🚗' },
  { id: 'sedan',       name: 'Sedan (Dzire / Honda City)',     seats: '4 Seats', withDriverRate: 14, selfDriveRate: 12, driverDaily: 500,  selfDailyFee: 1200, icon: '🚘' },
  { id: 'compact-suv', name: 'Compact SUV (Ertiga / Creta)',   seats: '6 Seats', withDriverRate: 17, selfDriveRate: 15, driverDaily: 600,  selfDailyFee: 1600, icon: '🚙' },
  { id: 'suv',         name: 'Premium SUV (Innova Crysta)',    seats: '7 Seats', withDriverRate: 22, selfDriveRate: 19, driverDaily: 700,  selfDailyFee: 2100, icon: '🚐' },
  { id: 'luxury',      name: 'Luxury Fleet (BMW / Mercedes)',  seats: '4 Seats', withDriverRate: 38, selfDriveRate: 34, driverDaily: 1200, selfDailyFee: 3500, icon: '🏎️' },
  { id: 'tempo',       name: 'Tempo Traveller (12-Seater)',    seats: '12 Seats', withDriverRate: 28, selfDriveRate: 28, driverDaily: 900, selfDailyFee: 900,  icon: '🚌', driverOnly: true },
];

/**
 * Flexible Point-to-Point Pick & Drop Price (Airport / Railway Station / Bus Stand / Any Custom Location)
 * Priced transparently by pickup type base + exact km rate (₹18/km) + night/luggage options.
 */
export function calcPointToPointTransfer({
  distanceKm = 20,
  pickupType = 'airport', // 'airport' | 'railway' | 'bus' | 'custom'
  pickupPoint = '',
  destination = '',
  isNight = false,
  extraLuggage = false,
}) {
  const safeKm = Math.max(1, Number(distanceKm) || 20);
  const baseByType = {
    airport: 199,  // includes terminal parking & gate access
    railway: 129,  // station pickup gate
    bus: 129,      // bus terminal pickup
    custom: 99,    // home / hotel / office pickup
  };
  const labelByType = {
    airport: 'Airport Terminal Pickup (Incl. Parking)',
    railway: 'Railway Station Pickup Fee',
    bus: 'Bus Terminal Pickup Fee',
    custom: 'Doorstep Pickup Base Charge',
  };

  const basePickup = baseByType[pickupType] ?? 129;
  const perKmRate = 18;
  const distanceCharge = Math.round(safeKm * perKmRate);
  const subtotal = basePickup + distanceCharge;
  const nightSurcharge = isNight ? Math.round(subtotal * 0.25) : 0;
  const luggageFee = extraLuggage ? 200 : 0;
  const total = subtotal + nightSurcharge + luggageFee;

  return {
    base: basePickup,
    distanceCharge,
    nightSurcharge,
    luggageFee,
    total,
    breakdown: [
      { label: `${labelByType[pickupType] || 'Pickup Base'}${pickupPoint ? ` (${pickupPoint})` : ''}`, amount: basePickup },
      { label: `Distance Fare (${safeKm} km @ ₹${perKmRate}/km${destination ? ` → ${destination}` : ''})`, amount: distanceCharge },
      ...(isNight ? [{ label: 'Night Pickup Surcharge (25%)', amount: nightSurcharge }] : []),
      ...(extraLuggage ? [{ label: 'Extra Luggage Handling', amount: 200 }] : []),
    ],
  };
}

// Backwards-compatible alias
export function calcAirportTransfer(params = {}) {
  return calcPointToPointTransfer({
    ...params,
    pickupType: params.pickupType || 'airport',
    pickupPoint: params.pickupPoint || params.airport || 'AMD',
  });
}

export const CITY_COORDS = {
  ahmedabad:  [23.0225, 72.5714],
  bhavnagar:  [21.7645, 72.1519],
  surat:      [21.1702, 72.8311],
  vadodara:   [22.3072, 73.1812],
  rajkot:     [22.3039, 70.8022],
  jamnagar:   [22.4707, 70.0577],
  gandhinagar:[23.2156, 72.6369],
  dwarka:     [22.2442, 68.9685],
  somnath:    [20.8880, 70.4012],
  junagadh:   [21.5222, 70.4579],
  bhuj:       [23.2420, 69.6669],
  udaipur:    [24.5854, 73.7125],
  'mount abu':[24.5926, 72.7156],
  jaipur:     [26.9124, 75.7873],
  jodhpur:    [26.2389, 73.0243],
  mumbai:     [19.0760, 72.8777],
  pune:       [18.5204, 73.8567],
  nashik:     [19.9975, 73.7898],
  goa:        [15.2993, 74.1240],
  delhi:      [28.6139, 77.2090],
  agra:       [27.1767, 78.0081],
  bengaluru:  [12.9716, 77.5946],
  bangalore:  [12.9716, 77.5946],
  mysore:     [12.2958, 76.6394],
  coorg:      [12.3375, 75.8069],
  hyderabad:  [17.3850, 78.4867],
  indore:     [22.7196, 75.8577],
};

const EXACT_ROUTE_KM = {
  'ahmedabad|udaipur': 260,
  'bhavnagar|udaipur': 350,
  'ahmedabad|mount abu': 225,
  'ahmedabad|jaipur': 660,
  'ahmedabad|dwarka': 440,
  'ahmedabad|somnath': 410,
  'ahmedabad|surat': 265,
  'ahmedabad|vadodara': 112,
  'ahmedabad|rajkot': 215,
  'ahmedabad|mumbai': 525,
  'bhavnagar|ahmedabad': 175,
  'bhavnagar|somnath': 260,
  'bhavnagar|dwarka': 410,
  'surat|mumbai': 280,
  'surat|udaipur': 485,
  'mumbai|pune': 150,
  'mumbai|goa': 590,
  'delhi|jaipur': 280,
  'delhi|agra': 230,
  'bengaluru|mysore': 145,
  'bengaluru|coorg': 265,
};

/**
 * Estimates road distance (km) and recommended trip days from any Pickup City & Drop City
 */
export function estimateOutstationRoute(pickupCity = '', dropCity = '') {
  const clean = (s) => String(s || '').toLowerCase().trim();
  const findCityKey = (raw) => {
    const c = clean(raw);
    if (!c) return null;
    if (CITY_COORDS[c]) return c;
    return Object.keys(CITY_COORDS).find((k) => c.includes(k)) || null;
  };

  const k1 = findCityKey(pickupCity);
  const k2 = findCityKey(dropCity);

  let km = 200;
  let matched = false;

  if (k1 && k2) {
    if (k1 === k2) {
      km = 60;
      matched = true;
    } else {
      const pair1 = `${k1}|${k2}`;
      const pair2 = `${k2}|${k1}`;
      if (EXACT_ROUTE_KM[pair1]) {
        km = EXACT_ROUTE_KM[pair1];
        matched = true;
      } else if (EXACT_ROUTE_KM[pair2]) {
        km = EXACT_ROUTE_KM[pair2];
        matched = true;
      } else {
        const [lat1, lon1] = CITY_COORDS[k1];
        const [lat2, lon2] = CITY_COORDS[k2];
        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const straight = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        km = Math.max(40, Math.round((straight * 1.28) / 5) * 5); // ~1.28 Indian highway road factor
        matched = true;
      }
    }
  }

  const recommendedDays = km >= 550 ? 3 : km >= 260 ? 2 : 1;
  return { distanceKm: km, recommendedDays, matched };
}

/**
 * Multi-Day Outstation Price (Unified formula matching AI Assistant 100%)
 * Total = (billedKm * perKmRate) + (days * dailyFee)
 * Factors: driveMode ('with-driver' | 'self-drive'), carType, distance (km), number of days, isRoundTrip
 */
export function calcOutstationChauffeur({
  distanceKm = 200,
  days = 1,
  carType = 'sedan',
  driveMode = 'with-driver',
  isRoundTrip = false,
}) {
  const car = OUTSTATION_CARS.find((c) => c.id === carType) || OUTSTATION_CARS[1];
  const effectiveMode = car.driverOnly ? 'with-driver' : (driveMode === 'self-drive' ? 'self-drive' : 'with-driver');
  const rate = effectiveMode === 'self-drive' ? car.selfDriveRate : car.withDriverRate;

  const oneWayKm = Math.max(20, Number(distanceKm) || 100);
  const billedKm = isRoundTrip ? oneWayKm * 2 : oneWayKm;
  const kmCharge = Math.round(billedKm * rate);
  const dailyFee = effectiveMode === 'self-drive' ? car.selfDailyFee : car.driverDaily;
  const safeDays = Math.max(1, Number(days) || 1);
  const durationCharge = dailyFee * safeDays;
  const total = kmCharge + durationCharge;

  return {
    car,
    effectiveMode,
    rate,
    billedKm,
    kmCharge,
    durationCharge,
    total,
    breakdown: [
      {
        label: `${car.name} (${effectiveMode === 'self-drive' ? 'Self Drive' : 'With Driver'}) • ${billedKm} km ${isRoundTrip ? '(Round Trip)' : ''} @ ₹${rate}/km`,
        amount: kmCharge,
      },
      {
        label:
          effectiveMode === 'self-drive'
            ? `Self-Drive Vehicle Rental × ${safeDays} day${safeDays > 1 ? 's' : ''} (₹${dailyFee}/day)`
            : `Driver Batta / Allowance × ${safeDays} day${safeDays > 1 ? 's' : ''} (₹${dailyFee}/day)`,
        amount: durationCharge,
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// RELOCATION & PACKERS
// ─────────────────────────────────────────────────────────────────────

/**
 * Relocation / Packers & Movers Price
 * Factors: inventory weight, packing type, inter-city, lift, insurance
 */
export function calcRelocation({
  totalWeightKg = 0,
  transitType = 'full',   // 'full' | 'single'
  isIntercity = false,
  distanceKm = 0,
  packingType = 'basic',  // 'basic' | 'premium'
  hasLift = true,
  addInsurance = false,
}) {
  const BASE = transitType === 'full' ? 2999 : 499;
  const weightCharge = totalWeightKg * 5;                                        // ₹5/kg
  const packingCharge = packingType === 'premium' ? (transitType === 'full' ? 1500 : 300) : 0;
  const liftCharge = !hasLift ? 800 : 0;                                         // floor carry
  const insuranceCharge = addInsurance ? 499 : 0;
  // Intercity charge based on distance
  const intercityCharge = isIntercity ? Math.max(5000, Math.round(distanceKm * 14)) : 0;
  const total = BASE + weightCharge + packingCharge + liftCharge + insuranceCharge + intercityCharge;
  return {
    total,
    breakdown: [
      { label: `Base Rate (${transitType === 'full' ? 'Full Shifting' : 'Single Item'})`, amount: BASE },
      ...(weightCharge > 0 ? [{ label: `Weight Charge (${totalWeightKg} kg @₹5/kg)`, amount: weightCharge }] : []),
      ...(packingCharge > 0 ? [{ label: `${packingType === 'premium' ? 'Premium' : 'Basic'} Packing`, amount: packingCharge }] : []),
      ...(liftCharge > 0 ? [{ label: 'Floor Carry (No Lift)', amount: liftCharge }] : []),
      ...(insuranceCharge > 0 ? [{ label: 'Transit Insurance', amount: insuranceCharge }] : []),
      ...(intercityCharge > 0 ? [{ label: `Intercity Charge (${distanceKm > 0 ? distanceKm + ' km' : 'different cities'})`, amount: intercityCharge }] : []),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// FOOD & KITCHEN
// ─────────────────────────────────────────────────────────────────────

/**
 * Tiffin / Meal Plan Price
 * Factors: diet type, duration, active days per week
 */
export function calcTiffinPlan({ dietType = 'veg', duration = 'monthly', activeDaysCount = 5 }) {
  const MEAL_PRICE = { veg: 120, 'non-veg': 160, keto: 200, jain: 130 };
  const mealPrice = MEAL_PRICE[dietType] || MEAL_PRICE.veg;
  const totalDays = duration === 'weekly' ? activeDaysCount : activeDaysCount * 4.3; // ~4.3 weeks/month
  const discount = duration === 'monthly' ? 0.90 : duration === '3months' ? 0.82 : 1.0;
  const gross = mealPrice * totalDays;
  const discountAmt = Math.round(gross * (1 - discount));
  const total = Math.round(gross * discount);
  return {
    mealPrice,
    totalDays: Math.round(totalDays),
    gross: Math.round(gross),
    discountAmt,
    discountPct: Math.round((1 - discount) * 100),
    total,
    breakdown: [
      { label: `${dietType.charAt(0).toUpperCase() + dietType.slice(1)} Meal @₹${mealPrice}/day × ${Math.round(totalDays)} days`, amount: Math.round(gross) },
      ...(discountAmt > 0 ? [{ label: `${duration.charAt(0).toUpperCase() + duration.slice(1)} Subscription Discount (${Math.round((1 - discount) * 100)}%)`, amount: -discountAmt }] : []),
    ],
  };
}

/**
 * Home Chef Price
 * Factors: cuisine type, guests, meals (lunch/dinner/both)
 */
export function calcHomeChef({ cuisine = 'indian', guests = 4, mealType = 'lunch' }) {
  const BASE_CUISINE = { indian: 599, mughlai: 899, continental: 1299, south_indian: 699, chinese: 799 };
  const GUEST_RATE = 100; // Extra per guest beyond 4
  const BOTH_MEALS_MULTIPLIER = 1.7; // Lunch + dinner
  const base = BASE_CUISINE[cuisine] || BASE_CUISINE.indian;
  const extraGuests = Math.max(0, guests - 4);
  const guestCharge = extraGuests * GUEST_RATE;
  const subtotal = base + guestCharge;
  const total = mealType === 'both' ? Math.round(subtotal * BOTH_MEALS_MULTIPLIER) : subtotal;
  return {
    total,
    breakdown: [
      { label: `${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} Cuisine Base (4 guests)`, amount: base },
      ...(guestCharge > 0 ? [{ label: `Extra ${extraGuests} guest${extraGuests > 1 ? 's' : ''} @₹${GUEST_RATE}/guest`, amount: guestCharge }] : []),
      ...(mealType === 'both' ? [{ label: 'Lunch + Dinner Package', amount: Math.round(subtotal * 0.7) }] : []),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// PET SERVICES
// ─────────────────────────────────────────────────────────────────────

/**
 * Pet Grooming Price
 * Factors: pet size, grooming type
 */
export function calcPetGrooming({ petSize = 'medium', groomingType = 'basic' }) {
  const MATRIX = {
    small:  { basic: 349, full: 599, spa: 899 },
    medium: { basic: 499, full: 799, spa: 1199 },
    large:  { basic: 699, full: 1099, spa: 1599 },
    xlarge: { basic: 899, full: 1399, spa: 1999 },
  };
  const total = MATRIX[petSize]?.[groomingType] || 499;
  return {
    total,
    breakdown: [
      { label: `${groomingType.charAt(0).toUpperCase() + groomingType.slice(1)} Grooming — ${petSize} pet`, amount: total },
    ],
  };
}

/**
 * Pet Boarding Price
 * Factors: pet size, days, extra meals
 */
export function calcPetBoarding({ petSize = 'medium', days = 2, extraMeals = false }) {
  const DAILY = { small: 299, medium: 399, large: 549, xlarge: 699 };
  const daily = DAILY[petSize] || 399;
  const stay = daily * days;
  const meals = extraMeals ? 100 * days : 0;
  return {
    total: stay + meals,
    breakdown: [
      { label: `${petSize} pet boarding @₹${daily}/day × ${days} day${days > 1 ? 's' : ''}`, amount: stay },
      ...(extraMeals ? [{ label: `Extra meals @₹100/day × ${days} days`, amount: meals }] : []),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// HEALTH & WELLNESS
// ─────────────────────────────────────────────────────────────────────

/** Already dynamic (specialist.price). Used for lab packages. */
export function calcLabTest({ packageId = 'full-body', homeCollection = true }) {
  const PACKAGES = {
    'full-body': 599,
    diabetes: 399,
    vitamins: 799,
    women: 999,
    thyroid: 299,
    cardiac: 1499,
    liver: 699,
    kidney: 799,
  };
  const base = PACKAGES[packageId] || 599;
  const homeCharge = homeCollection ? 0 : 0;  // Free home collection
  return {
    total: base + homeCharge,
    breakdown: [
      { label: 'Lab Package', amount: base },
      ...(homeCollection ? [{ label: '🏠 Free Home Collection', amount: 0 }] : []),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// EVENTS & CELEBRATIONS
// ─────────────────────────────────────────────────────────────────────

/**
 * Events Quote Engine
 * Factors: theme base price, guests, venue size, add-ons
 */
export function calcEventQuote({
  baseDecorPrice = 2999,
  guests = 50,
  addOns = [],  // e.g. ['catering', 'dj', 'photography']
  venueType = 'home',  // 'home' | 'hall' | 'outdoor'
}) {
  const ADDONS_PRICE = {
    catering: Math.round(guests * 450),
    dj: 4999,
    photography: 8999,
    videography: 12999,
    livemusic: 9999,
    cake: 1999,
    flowers: 2499,
    lighting: 3499,
  };
  const VENUE_MULTIPLIER = { home: 1, hall: 1.25, outdoor: 1.4 };
  const adjustedDecor = Math.round(baseDecorPrice * (VENUE_MULTIPLIER[venueType] || 1));
  const guestExtra = guests > 50 ? Math.round((guests - 50) * 40) : 0;
  const addOnsTotal = addOns.reduce((sum, key) => sum + (ADDONS_PRICE[key] || 0), 0);
  const total = adjustedDecor + guestExtra + addOnsTotal;
  return {
    total,
    breakdown: [
      { label: `Décor Package (${venueType})`, amount: adjustedDecor },
      ...(guestExtra > 0 ? [{ label: `Extra ${guests - 50} guests @₹40/guest`, amount: guestExtra }] : []),
      ...addOns.map((key) => ({ label: key.charAt(0).toUpperCase() + key.slice(1), amount: ADDONS_PRICE[key] || 0 })),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// SOCIETY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

/**
 * Society Service Price (per flat / per month)
 * Factors: units in society, service type, frequency
 */
export function calcSocietyService({ units = 50, serviceType = 'cleaning', frequency = 'daily' }) {
  const BASE_PER_UNIT = {
    cleaning: { daily: 45, weekly: 15, monthly: 8 },
    security: { daily: 80, weekly: 25, monthly: 12 },
    maintenance: { daily: 30, weekly: 12, monthly: 6 },
    pest_control: { quarterly: 25, halfyearly: 18, annual: 12 },
    cctv: { monthly: 20 },
    parking: { monthly: 30 },
  };
  const ratePerUnit = BASE_PER_UNIT[serviceType]?.[frequency] || 30;
  const total = Math.round(units * ratePerUnit);
  const perFlat = ratePerUnit;
  return {
    total,
    perFlat,
    breakdown: [
      { label: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} (${frequency}) × ${units} units @₹${perFlat}/unit`, amount: total },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// HOME SERVICES (Repairs, Cleaning, etc.)
// ─────────────────────────────────────────────────────────────────────

/**
 * Standard Home Service Price
 * Factors: tier (basic/standard/premium), add-ons, urgency
 */
export function calcHomeService({ basePrice = 499, tier = 'standard', isEmergency = false, addOns = [] }) {
  const TIER_MULTIPLIER = { basic: 0.7, standard: 1.0, premium: 1.6, elite: 2.2 };
  const ADDON_COSTS = {
    materials: Math.round(basePrice * 0.4),
    warranty: 200,
    express: 300,
    weekend: 150,
  };
  const tieredPrice = Math.round(basePrice * (TIER_MULTIPLIER[tier] || 1));
  const emergencySurcharge = isEmergency ? Math.round(tieredPrice * 0.5) : 0;
  const addOnTotal = addOns.reduce((sum, key) => sum + (ADDON_COSTS[key] || 0), 0);
  const total = tieredPrice + emergencySurcharge + addOnTotal;
  return {
    total,
    breakdown: [
      { label: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Service`, amount: tieredPrice },
      ...(emergencySurcharge > 0 ? [{ label: 'Emergency Surcharge (50%)', amount: emergencySurcharge }] : []),
      ...addOns.map((key) => ({ label: key.charAt(0).toUpperCase() + key.slice(1), amount: ADDON_COSTS[key] || 0 })),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// GROUP BOOKING
// ─────────────────────────────────────────────────────────────────────

/**
 * Group Booking Price
 * Factors: base price, unit count, discount slab
 */
export function calcGroupBooking({ basePrice = 500, unitCount = 5 }) {
  const DISCOUNT_SLABS = [
    { min: 1,  max: 4,  pct: 0 },
    { min: 5,  max: 9,  pct: 10 },
    { min: 10, max: 19, pct: 18 },
    { min: 20, max: 49, pct: 25 },
    { min: 50, max: Infinity, pct: 35 },
  ];
  const slab = DISCOUNT_SLABS.find((s) => unitCount >= s.min && unitCount <= s.max) || DISCOUNT_SLABS[0];
  const discountPct = slab.pct;
  const pricePerUnit = Math.round(basePrice * (1 - discountPct / 100));
  const gross = basePrice * unitCount;
  const discountAmt = Math.round(gross * discountPct / 100);
  const total = gross - discountAmt;
  return {
    pricePerUnit,
    gross,
    discountAmt,
    discountPct,
    total,
    breakdown: [
      { label: `Base @₹${basePrice} × ${unitCount} units`, amount: gross },
      ...(discountAmt > 0 ? [{ label: `Group Discount (${discountPct}%)`, amount: -discountAmt }] : []),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// EMERGENCY SERVICES
// ─────────────────────────────────────────────────────────────────────

export function calcEmergencyService({ serviceType = 'plumbing', timeOfDay = 'day' }) {
  const BASE = {
    plumbing: 799,
    electrical: 899,
    locksmith: 599,
    ac: 999,
    carpenter: 699,
    pest: 1199,
  };
  const base = BASE[serviceType] || 799;
  const nightSurcharge = timeOfDay === 'night' ? Math.round(base * 0.5) : 0;
  const total = base + nightSurcharge;
  return {
    total,
    breakdown: [
      { label: `Emergency ${serviceType} service`, amount: base },
      ...(nightSurcharge > 0 ? [{ label: 'Night/Holiday Surcharge (50%)', amount: nightSurcharge }] : []),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// PRICE BREAKDOWN RENDERER (shared UI helper)
// ─────────────────────────────────────────────────────────────────────

/**
 * Returns a formatted string for the price breakdown tooltip/section.
 * Components can use this to render itemised breakdown.
 */
export function getPriceBreakdownItems(breakdown = []) {
  return breakdown.filter((item) => item.amount !== 0);
}
