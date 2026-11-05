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

/**
 * Airport Transfer Price
 * Factors: car type, time of day (night surcharge)
 */
export function calcAirportTransfer({ carType = 'sedan', isNight = false, extraLuggage = false }) {
  const BASE = { sedan: 799, suv: 1499, luxury: 2499 };
  let price = BASE[carType] || BASE.sedan;
  if (isNight) price = Math.round(price * 1.25);           // +25% night surcharge
  if (extraLuggage) price += 200;                          // Extra luggage fee
  return {
    base: BASE[carType] || BASE.sedan,
    nightSurcharge: isNight ? Math.round((BASE[carType] || BASE.sedan) * 0.25) : 0,
    luggageFee: extraLuggage ? 200 : 0,
    total: price,
    breakdown: [
      { label: `${carType === 'sedan' ? 'Sedan' : carType === 'suv' ? 'SUV' : 'Luxury'} Transfer`, amount: BASE[carType] || BASE.sedan },
      ...(isNight ? [{ label: 'Night Surcharge (25%)', amount: Math.round((BASE[carType] || BASE.sedan) * 0.25) }] : []),
      ...(extraLuggage ? [{ label: 'Extra Luggage', amount: 200 }] : []),
    ],
  };
}

/**
 * Outstation Chauffeur Price
 * Factors: distance (km), number of days, car type
 */
export function calcOutstationChauffeur({ distanceKm = 100, days = 1, carType = 'sedan' }) {
  const RATE_PER_KM = { sedan: 12, suv: 18, luxury: 28 };       // ₹ per km
  const DRIVER_DAILY = { sedan: 600, suv: 800, luxury: 1200 };   // Driver allowance per day
  const rate = RATE_PER_KM[carType] || RATE_PER_KM.sedan;
  const driverDaily = DRIVER_DAILY[carType] || DRIVER_DAILY.sedan;
  const kmCharge = Math.round(distanceKm * 2 * rate);             // round trip
  const driverCharge = driverDaily * days;
  const tollPark = Math.round(distanceKm * 1.5);                  // estimated tolls/parking
  const total = kmCharge + driverCharge + tollPark;
  return {
    kmCharge,
    driverCharge,
    tollPark,
    total,
    breakdown: [
      { label: `${carType.toUpperCase()} • ${distanceKm * 2} km (round trip @₹${rate}/km)`, amount: kmCharge },
      { label: `Driver Allowance × ${days} day${days > 1 ? 's' : ''}`, amount: driverCharge },
      { label: 'Estimated Tolls & Parking', amount: tollPark },
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
