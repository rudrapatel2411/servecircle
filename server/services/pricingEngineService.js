/**
 * server/services/pricingEngineService.js
 *
 * Universal Schema-Driven Dynamic Pricing & Worker Yield Engine (SPP)
 * Covering all 110+ services across 19 categories and 8 customer hubs.
 *
 * Calibrated against real Indian benchmarks:
 * - Urban Company (Repairs, Salon, Deep Clean)
 * - Porter / NoBroker / Agarwal (Packers & Movers, Shifting)
 * - Uber / Ola / DriveU (Chauffeurs, Airport Drops, Outstation Cabs)
 * - ChefKart / COOX (Home Cooks, Party Chefs, Catering)
 * - CleanMax / Society Platforms (Society AMC, Security, Maintenance)
 *
 * The Golden Worker Protection Principle:
 * Pass-through expenses (Tolls, Parking, Material Spares, Driver Bata, Night Halt)
 * carry 0% platform commission and are reimbursed 100% to the worker.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENGINE TYPE CLASSIFIER
// Maps any of the 110 services to its mathematical pricing engine archetype.
// ─────────────────────────────────────────────────────────────────────────────

export const PRICING_ENGINES = {
  DISTANCE_TIME: 'DISTANCE_TIME',
  VOLUME_DISTANCE_FLOOR: 'VOLUME_DISTANCE_FLOOR',
  AREA_DIMENSION: 'AREA_DIMENSION',
  TIME_BLOCK_HOURLY: 'TIME_BLOCK_HOURLY',
  HEADCOUNT_TIER: 'HEADCOUNT_TIER',
  INSPECTION_RATE_CARD: 'INSPECTION_RATE_CARD',
  MULTI_UNIT_AMC: 'MULTI_UNIT_AMC',
};

/**
 * Resolves the pricing engine archetype for a given service category / serviceId.
 */
export function resolveEngineType(category = '', serviceId = '', serviceName = '') {
  const norm = `${category} ${serviceId} ${serviceName}`.toLowerCase();

  // 1. Travel & Commute (Distance & Time based)
  if (
    norm.includes('travel') ||
    norm.includes('airport') ||
    norm.includes('outstation') ||
    norm.includes('chauffeur') ||
    norm.includes('cab') ||
    norm.includes('driver')
  ) {
    return PRICING_ENGINES.DISTANCE_TIME;
  }

  // 1b. Vehicle Services (Inspection, Wash & Task based)
  if (
    norm.includes('vehicle') ||
    /\bcar\b/i.test(norm) ||
    norm.includes('bike') ||
    norm.includes('tyre') ||
    norm.includes('puncture')
  ) {
    return PRICING_ENGINES.INSPECTION_RATE_CARD;
  }

  // 2. Relocation & Shifting (Volume, Distance, Floor stairs)
  if (
    norm.includes('relocation') ||
    norm.includes('packer') ||
    norm.includes('shift') ||
    norm.includes('mover') ||
    norm.includes('transit') ||
    norm.includes('storage') ||
    norm.includes('vault')
  ) {
    return PRICING_ENGINES.VOLUME_DISTANCE_FLOOR;
  }

  // 3. Cleaning & Hygiene (BHK, Area, Add-on count)
  if (
    norm.includes('clean') ||
    norm.includes('hygiene') ||
    norm.includes('pest') ||
    norm.includes('sanitiz') ||
    norm.includes('sofa') ||
    norm.includes('carpet') ||
    norm.includes('paint')
  ) {
    return PRICING_ENGINES.AREA_DIMENSION;
  }

  // 4. Food & Kitchen (Headcount, meal course, party tier)
  if (
    norm.includes('cook') ||
    norm.includes('chef') ||
    norm.includes('tiffin') ||
    norm.includes('catering') ||
    norm.includes('meal') ||
    norm.includes('kitchen') ||
    norm.includes('cake')
  ) {
    return PRICING_ENGINES.HEADCOUNT_TIER;
  }

  // 5. Time-block / Hourly (Babysitting, Elder care, Handyman hourly)
  if (
    norm.includes('elder') ||
    norm.includes('kid') ||
    norm.includes('nanny') ||
    norm.includes('babysit') ||
    norm.includes('hourly') ||
    norm.includes('nurse') ||
    norm.includes('patient') ||
    norm.includes('companion')
  ) {
    return PRICING_ENGINES.TIME_BLOCK_HOURLY;
  }

  // 6. Society Management & AMC (Multi-unit, security shifts, flats)
  if (
    norm.includes('society') ||
    norm.includes('amc') ||
    norm.includes('guard') ||
    norm.includes('rwa') ||
    norm.includes('security') ||
    norm.includes('gate')
  ) {
    return PRICING_ENGINES.MULTI_UNIT_AMC;
  }

  // 7. Default for Home Repairs, Vehicle Repair, IT Support: Inspection + Standard Rate Card
  return PRICING_ENGINES.INSPECTION_RATE_CARD;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. COMMON FINANCIAL SPLIT CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

function computeFinancialSplit({
  laborSubtotal = 0,
  passThroughSubtotal = 0,
  contextMultiplier = 1.0,
  commissionRate = 0.10, // 10% default
  lineItems = [],
  passThroughItems = [],
  metadata = {},
}) {
  // Apply contextual multiplier (e.g. night emergency 1.4x, weekend 1.1x) to labor only
  const billableLabor = Math.round(laborSubtotal * contextMultiplier);

  // Platform commission applies STRICTLY to labor. Pass-throughs are 0% commission!
  const platformCommission = Math.max(0, Math.round(billableLabor * commissionRate));

  // Worker net take-home is remaining labor + 100% of pass-through reimbursements
  const workerLaborPayout = Math.max(0, billableLabor - platformCommission);
  const workerTotalPayout = workerLaborPayout + passThroughSubtotal;

  // Gross service bill before statutory fees
  const grossBill = billableLabor + passThroughSubtotal;

  // Statutory GST (18% on Labor only; reimbursements like tolls are pass-through)
  const gst = Math.round(billableLabor * 0.18);
  const trustSafetyFee = grossBill > 0 ? 49 : 0;
  const customerTotalPayable = grossBill + gst + trustSafetyFee;

  return {
    grossBill,
    customerTotalPayable,
    billableLabor,
    passThroughSubtotal,
    platformCommission,
    commissionRate,
    workerLaborPayout,
    workerTotalPayout, // Total Net Take-Home
    gst,
    trustSafetyFee,
    contextMultiplier,
    lineItems,
    passThroughItems,
    metadata,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. THE 7 SPECIALIZED MATHEMATICAL PRICING ENGINES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ENGINE 1: DISTANCE & TIME (Travel, Airport, Outstation Chauffeur)
 * Benchmark: Uber / Ola Outstation / DriveU
 */
export function calculateDistanceTimeQuote(params = {}) {
  const serviceName = String(params.serviceName || params.service || '').toLowerCase();
  const inferredTripType = params.tripType || (
    serviceName.includes('outstation') || params.days > 1 || params.stopsCount > 0
      ? 'outstation'
      : serviceName.includes('airport')
      ? 'airport'
      : 'city_hourly'
  );

  const {
    tripType = inferredTripType,
    fleetType = 'sedan',   // 'sedan' | 'suv' | 'hatchback'
    distanceKm = 0,
    days = 1,
    includeToll = true,
    isNightTrip = false,
    extraHours = 0,
  } = params;

  const lineItems = [];
  const passThroughItems = [];
  let labor = 0;
  let passThrough = 0;

  if (tripType === 'airport') {
    // Guaranteed Airport Transfer
    const baseFare = fleetType === 'suv' ? 1499 : 799;
    labor += baseFare;
    lineItems.push({
      name: `Airport Transfer (${fleetType.toUpperCase()})`,
      amount: baseFare,
      type: 'LABOR',
    });

    if (distanceKm > 35) {
      const extraKm = distanceKm - 35;
      const kmRate = fleetType === 'suv' ? 18 : 14;
      const extraKmCharge = extraKm * kmRate;
      labor += extraKmCharge;
      lineItems.push({
        name: `Extra Distance (${extraKm} km @ ₹${kmRate}/km)`,
        amount: extraKmCharge,
        type: 'LABOR',
      });
    }

    if (includeToll) {
      const airportToll = 120; // Pass-through toll
      passThrough += airportToll;
      passThroughItems.push({
        name: 'Airport / Expressway Toll (100% Worker Pass-Through)',
        amount: airportToll,
        type: 'PASS_THROUGH',
      });
    }
  } else if (tripType === 'outstation') {
    // Multi-Day Outstation Chauffeur
    const driverPerDay = 999;
    const baseChauffeur = driverPerDay * Math.max(1, days);
    labor += baseChauffeur;
    lineItems.push({
      name: `Chauffeur Fee (${days} Day${days > 1 ? 's' : ''} @ ₹${driverPerDay}/day)`,
      amount: baseChauffeur,
      type: 'LABOR',
    });

    // Driver Food Bata (Non-commissionable pass-through)
    const driverBataPerDay = 350;
    const totalBata = driverBataPerDay * Math.max(1, days);
    passThrough += totalBata;
    passThroughItems.push({
      name: `Driver Outstation Food Allowance (${days} Days @ ₹${driverBataPerDay}/day)`,
      amount: totalBata,
      type: 'PASS_THROUGH',
    });

    // Night Halt (if 2+ days or overnight)
    if (days > 1 || isNightTrip) {
      const nightHalts = Math.max(1, days - 1);
      const nightAllowance = nightHalts * 300;
      passThrough += nightAllowance;
      passThroughItems.push({
        name: `Driver Night Halt Accommodation (${nightHalts} Night${nightHalts > 1 ? 's' : ''})`,
        amount: nightAllowance,
        type: 'PASS_THROUGH',
      });
    }

    // Multi-stop Detour & Wait Surcharge
    const stopsCount = Number(params.stopsCount) || (Array.isArray(params.stops) ? params.stops.length : 0);
    if (stopsCount > 0) {
      const stopsDetourFee = stopsCount * 250;
      labor += stopsDetourFee;
      lineItems.push({
        name: `Multi-Stop Detour & Wait Fee (${stopsCount} Stop${stopsCount > 1 ? 's' : ''} @ ₹250/stop)`,
        amount: stopsDetourFee,
        type: 'LABOR',
      });
    }
  } else {
    // City Hourly Rental / Chauffeur on Demand
    const baseBlock = 499; // 4 hours
    labor += baseBlock;
    lineItems.push({
      name: 'City Chauffeur Base (4 Hours included)',
      amount: baseBlock,
      type: 'LABOR',
    });

    if (extraHours > 0) {
      const hourlyExtra = extraHours * 120;
      labor += hourlyExtra;
      lineItems.push({
        name: `Overtime (${extraHours} Extra Hours @ ₹120/hr)`,
        amount: hourlyExtra,
        type: 'LABOR',
      });
    }
  }

  const contextMultiplier = isNightTrip ? 1.35 : 1.0;
  if (isNightTrip) {
    lineItems.push({
      name: 'Late Night Transit Incentive (+35% Labor to Driver)',
      amount: Math.round(labor * 0.35),
      type: 'SURGE_LABOR',
    });
  }

  return computeFinancialSplit({
    laborSubtotal: labor,
    passThroughSubtotal: passThrough,
    contextMultiplier,
    commissionRate: 0.10, // 10% platform fee on labor
    lineItems,
    passThroughItems,
    metadata: { engine: PRICING_ENGINES.DISTANCE_TIME, tripType, fleetType, distanceKm, days },
  });
}

/**
 * ENGINE 2: VOLUME, DISTANCE & FLOOR ELEVATION (Relocation, Packers & Movers)
 * Benchmark: Porter / NoBroker Packers
 */
export function calculateVolumeDistanceFloorQuote(params = {}) {
  let originFloor = Number(params.originFloor) || 1;
  let originHasLift = params.originHasLift !== undefined ? Boolean(params.originHasLift) : true;

  if (params.originElevator === 'stairs_floor2') {
    originFloor = 2;
    originHasLift = false;
  } else if (params.originElevator === 'stairs_floor3') {
    originFloor = 3;
    originHasLift = false;
  } else if (params.originElevator === 'stairs_floor4') {
    originFloor = 4;
    originHasLift = false;
  }

  const {
    homeSize = '2bhk',        // '1rk' | '1bhk' | '2bhk' | '3bhk' | '4bhk_villa'
    distanceKm = 8,
    destFloor = 1,
    destHasLift = true,
    packingGrade = params.packingType === 'premium' ? 'premium_3layer' : (params.packingGrade || 'standard'),
    isWeekend = false,
  } = params;

  const basePricings = {
    '1rk': { base: 2499, label: '1 RK Shifting (1 Mini Truck + 2 Helpers)' },
    '1bhk': { base: 4499, label: '1 BHK Shifting (1 Standard Truck + 2 Helpers)' },
    '2bhk': { base: 7499, label: '2 BHK Shifting (1 Heavy Truck + 3 Helpers)' },
    '3bhk': { base: 11999, label: '3 BHK Shifting (2 Trucks + 4 Helpers)' },
    '4bhk_villa': { base: 16999, label: '4 BHK / Villa Shifting (Full Multi-crew)' },
  };

  const selectedSize = basePricings[homeSize] || basePricings['2bhk'];
  const lineItems = [];
  const passThroughItems = [];
  let labor = selectedSize.base;

  lineItems.push({
    name: selectedSize.label,
    amount: selectedSize.base,
    type: 'LABOR',
  });

  // Distance beyond 10 km
  if (distanceKm > 10) {
    const extraKm = distanceKm - 10;
    const kmRate = 45;
    const extraKmCharge = extraKm * kmRate;
    labor += extraKmCharge;
    lineItems.push({
      name: `Transit Distance Surcharge (${extraKm} km @ ₹${kmRate}/km)`,
      amount: extraKmCharge,
      type: 'LABOR',
    });
  }

  // Floor Elevation Stairs Multiplier (No Lift)
  // 100% pass-through directly to the physical loaders!
  let floorSurcharge = 0;
  if (!originHasLift && originFloor > 1) {
    const extraOriginFloors = originFloor - 1;
    const originStairCost = extraOriginFloors * 200;
    floorSurcharge += originStairCost;
    passThroughItems.push({
      name: `Origin Stair Carry (Floor ${originFloor}, No Lift: ${extraOriginFloors} floors @ ₹200)`,
      amount: originStairCost,
      type: 'PASS_THROUGH',
    });
  }

  if (!destHasLift && destFloor > 1) {
    const extraDestFloors = destFloor - 1;
    const destStairCost = extraDestFloors * 200;
    floorSurcharge += destStairCost;
    passThroughItems.push({
      name: `Destination Stair Carry (Floor ${destFloor}, No Lift: ${extraDestFloors} floors @ ₹200)`,
      amount: destStairCost,
      type: 'PASS_THROUGH',
    });
  }

  // Packing Material Grade
  let materialCost = 0;
  if (packingGrade === 'premium_3layer') {
    materialCost = homeSize === '1rk' ? 699 : homeSize === '1bhk' ? 999 : 1499;
    passThroughItems.push({
      name: `Premium 3-Layer Packing Kit (Foam, Edge Guard, Cartons - 100% Pass-Through)`,
      amount: materialCost,
      type: 'PASS_THROUGH',
    });
  }

  const contextMultiplier = isWeekend ? 1.10 : 1.0;
  if (isWeekend) {
    lineItems.push({
      name: 'Weekend Prime Relocation (+10% Crew Incentive)',
      amount: Math.round(labor * 0.10),
      type: 'SURGE_LABOR',
    });
  }

  return computeFinancialSplit({
    laborSubtotal: labor,
    passThroughSubtotal: floorSurcharge + materialCost,
    contextMultiplier,
    commissionRate: 0.12, // 12% on relocation labor
    lineItems,
    passThroughItems,
    metadata: { engine: PRICING_ENGINES.VOLUME_DISTANCE_FLOOR, homeSize, distanceKm, originFloor, destFloor },
  });
}

/**
 * ENGINE 3: AREA, ROOM & DIMENSION (Deep Cleaning, Painting, Pest Control)
 * Benchmark: Urban Company Home Deep Clean
 */
export function calculateAreaDimensionQuote(params = {}) {
  const {
    homeSize = '2bhk',       // '1rk' | '1bhk' | '2bhk' | '3bhk' | '4bhk_villa'
    sofaSeats = 0,          // count of sofa seats to shampoo
    balconies = 0,          // count of balconies
    refrigeratorClean = false,
    kitchenChimney = false,
    isMonsoonSurge = false,
  } = params;

  const basePricings = {
    '1rk': { base: 1799, label: 'Full Home Deep Clean: 1 RK' },
    '1bhk': { base: 2499, label: 'Full Home Deep Clean: 1 BHK' },
    '2bhk': { base: 3499, label: 'Full Home Deep Clean: 2 BHK' },
    '3bhk': { base: 4499, label: 'Full Home Deep Clean: 3 BHK' },
    '4bhk_villa': { base: 5999, label: 'Full Home Deep Clean: 4 BHK / Villa' },
  };

  const selectedSize = basePricings[homeSize] || basePricings['2bhk'];
  const lineItems = [];
  const passThroughItems = [];
  let labor = selectedSize.base;

  lineItems.push({
    name: selectedSize.label,
    amount: selectedSize.base,
    type: 'LABOR',
  });

  // Sofa seat shampooing add-on
  if (sofaSeats > 0) {
    const sofaCost = sofaSeats * 249;
    labor += sofaCost;
    lineItems.push({
      name: `Sofa Foam Shampooing (${sofaSeats} Seat${sofaSeats > 1 ? 's' : ''} @ ₹249/seat)`,
      amount: sofaCost,
      type: 'LABOR',
    });
  }

  // Balcony pressure wash add-on
  if (balconies > 0) {
    const balconyCost = balconies * 349;
    labor += balconyCost;
    lineItems.push({
      name: `Balcony Machine Wash (${balconies} Unit${balconies > 1 ? 's' : ''} @ ₹349)`,
      amount: balconyCost,
      type: 'LABOR',
    });
  }

  // Appliance cleaning add-ons
  if (refrigeratorClean) {
    labor += 399;
    lineItems.push({
      name: 'Anti-Bacterial Refrigerator Interior Wash',
      amount: 399,
      type: 'LABOR',
    });
  }

  if (kitchenChimney) {
    labor += 699;
    lineItems.push({
      name: 'Kitchen Chimney & Baffle Degreasing',
      amount: 699,
      type: 'LABOR',
    });
  }

  // Certified Eco-Chemical Consumable Allowance (Pass-through to technician)
  const chemicalKit = 200;
  passThroughItems.push({
    name: 'Single-Use Professional Chemical & Scrubber Consumables',
    amount: chemicalKit,
    type: 'PASS_THROUGH',
  });

  const contextMultiplier = isMonsoonSurge ? 1.15 : 1.0;

  return computeFinancialSplit({
    laborSubtotal: labor,
    passThroughSubtotal: chemicalKit,
    contextMultiplier,
    commissionRate: 0.10,
    lineItems,
    passThroughItems,
    metadata: { engine: PRICING_ENGINES.AREA_DIMENSION, homeSize, sofaSeats, balconies },
  });
}

/**
 * ENGINE 4: HEADCOUNT & MEAL COURSE TIERS (Home Cook, Party Chef, Catering)
 * Benchmark: ChefKart / COOX
 */
export function calculateHeadcountTierQuote(params = {}) {
  const serviceName = String(params.serviceName || params.service || '').toLowerCase();
  const isCakeService = params.chefType === 'baking_artist' || 
    serviceName.includes('cake') || 
    serviceName.includes('bake') || 
    params.cakeWeight !== undefined || 
    params.cakeFlavor !== undefined;

  const guests = Number(params.guests ?? params.headCount ?? 4);

  const inferredChefType = params.chefType || (
    isCakeService
      ? 'baking_artist'
      : serviceName.includes('party') || serviceName.includes('home chef') || guests > 4
      ? 'party_chef'
      : 'daily_meal'
  );

  const {
    chefType = inferredChefType,
    courseTier = 'standard',  // 'standard' | 'gourmet_5course'
    cuisine = 'north_indian', // 'north_indian' | 'south_indian' | 'continental'
    isLateEvening = false,
  } = params;

  const lineItems = [];
  const passThroughItems = [];
  let labor = 0;

  if (isCakeService || chefType === 'baking_artist') {
    const cakeWeight = Number(params.cakeWeight) || 1;
    const baseRates = {
      0.5: 499,
      1: 699,
      1.5: 999,
      2: 1299,
      3: 1899,
    };
    const baseCakeLabor = baseRates[cakeWeight] || Math.round(cakeWeight * 699);
    labor += baseCakeLabor;
    lineItems.push({
      name: `Custom Cake Designer (${cakeWeight} kg)`,
      amount: baseCakeLabor,
      type: 'LABOR',
    });

    if (params.cakeFlavor === 'Red Velvet' || params.cakeFlavor === 'Belgian Chocolate') {
      labor += 150;
      lineItems.push({
        name: `Premium Flavor Surcharge (${params.cakeFlavor})`,
        amount: 150,
        type: 'LABOR',
      });
    }
  } else if (chefType === 'party_chef') {
    const basePartyChef = 1999; // Base up to 6 guests
    labor += basePartyChef;
    lineItems.push({
      name: 'Private Party Chef (Base booking up to 6 Guests)',
      amount: basePartyChef,
      type: 'LABOR',
    });

    if (guests > 6) {
      const extraGuests = guests - 6;
      const guestCharge = extraGuests * 99;
      labor += guestCharge;
      lineItems.push({
        name: `Additional Guests (${extraGuests} Extra @ ₹99/guest)`,
        amount: guestCharge,
        type: 'LABOR',
      });
    }

    if (courseTier === 'gourmet_5course') {
      labor += 600;
      lineItems.push({
        name: 'Gourmet 5-Course Plating & Starters Preparation',
        amount: 600,
        type: 'LABOR',
      });
    }
  } else {
    // Daily meal visit (Cook at home)
    const baseDailyMeal = 399; // Up to 4 people
    labor += baseDailyMeal;
    lineItems.push({
      name: 'Home Cook Visit (Up to 4 People, Lunch/Dinner)',
      amount: baseDailyMeal,
      type: 'LABOR',
    });

    if (guests > 4) {
      const extraGuests = guests - 4;
      const extraPersonCharge = extraGuests * 60;
      labor += extraPersonCharge;
      lineItems.push({
        name: `Extra Family Members (${extraGuests} Extra @ ₹60/person)`,
        amount: extraPersonCharge,
        type: 'LABOR',
      });
    }
  }

  // Complex cuisine surcharge
  if (['continental', 'pan_asian', 'mexican'].includes(cuisine.toLowerCase())) {
    labor += 300;
    lineItems.push({
      name: `Speciality Cuisine Specialist (${cuisine})`,
      amount: 300,
      type: 'LABOR',
    });
  }

  const contextMultiplier = isLateEvening ? 1.20 : 1.0;
  if (isLateEvening) {
    lineItems.push({
      name: 'Late Evening Dining Surcharge (+20% Labor to Chef)',
      amount: Math.round(labor * 0.20),
      type: 'SURGE_LABOR',
    });
  }

  return computeFinancialSplit({
    laborSubtotal: labor,
    passThroughSubtotal: 0, // Groceries provided by customer or billed via M4
    contextMultiplier,
    commissionRate: 0.10,
    lineItems,
    passThroughItems,
    metadata: { engine: PRICING_ENGINES.HEADCOUNT_TIER, chefType, guests, courseTier, cuisine },
  });
}

/**
 * ENGINE 5: TIME-BLOCK & HOURLY (Babysitting, Elderly Care, Handyman Hourly)
 * Benchmark: BookMyNanny / Portea
 */
export function calculateTimeBlockHourlyQuote(params = {}) {
  const {
    careType = 'babysitting', // 'babysitting' | 'elderly_care' | 'patient_attendant'
    bookedHours = 4,
    overtimeMinutes = 0,
    isOvernightShift = false,
  } = params;

  const hourlyRates = {
    babysitting: { base2h: 599, hourly: 199, label: 'Certified Babysitter / Nanny' },
    elderly_care: { base2h: 699, hourly: 249, label: 'Elderly Care Assistant' },
    patient_attendant: { base2h: 799, hourly: 299, label: 'Paramedical Patient Attendant' },
  };

  const selected = hourlyRates[careType] || hourlyRates.babysitting;
  const lineItems = [];
  const passThroughItems = [];
  let labor = selected.base2h;

  lineItems.push({
    name: `${selected.label} (Base 2-Hour Care Block)`,
    amount: selected.base2h,
    type: 'LABOR',
  });

  if (bookedHours > 2) {
    const additionalHours = bookedHours - 2;
    const addCharge = additionalHours * selected.hourly;
    labor += addCharge;
    lineItems.push({
      name: `Extended Care (${additionalHours} Hours @ ₹${selected.hourly}/hr)`,
      amount: addCharge,
      type: 'LABOR',
    });
  }

  // Edge Case 6: Automatic Overtime Slabs via Dual-OTP Duration
  if (overtimeMinutes > 15) {
    const halfHourBlocks = Math.ceil((overtimeMinutes - 15) / 30);
    const overtimeRate = Math.round(selected.hourly / 2);
    const overtimeCharge = halfHourBlocks * overtimeRate;
    labor += overtimeCharge;
    lineItems.push({
      name: `Automated OTP Overtime (${overtimeMinutes} mins: ${halfHourBlocks} x 30m @ ₹${overtimeRate})`,
      amount: overtimeCharge,
      type: 'LABOR',
    });
  }

  const contextMultiplier = isOvernightShift ? 1.25 : 1.0;
  if (isOvernightShift) {
    lineItems.push({
      name: 'Night Shift Care Allowance (+25% Payout to Caregiver)',
      amount: Math.round(labor * 0.25),
      type: 'SURGE_LABOR',
    });
  }

  return computeFinancialSplit({
    laborSubtotal: labor,
    passThroughSubtotal: 0,
    contextMultiplier,
    commissionRate: 0.10,
    lineItems,
    passThroughItems,
    metadata: { engine: PRICING_ENGINES.TIME_BLOCK_HOURLY, careType, bookedHours, overtimeMinutes },
  });
}

/**
 * ENGINE 6: INSPECTION & RATE CARD + M4 SPARES (AC, Electric, Plumber, Handyman)
 * Benchmark: Urban Company Diagnostic Visit + Verified Spares
 */
export function calculateInspectionRateCardQuote(params = {}) {
  const {
    serviceId = 'ac-repair',
    serviceName = 'AC Repair & Diagnostics',
    inspectionOnly = false,
    selectedRepairs = [], // array of repair IDs / objects
    spareParts = [],      // array of { name, price }
    isEmergency = false,
  } = params;

  const lineItems = [];
  const passThroughItems = [];
  let labor = 0;
  let passThrough = 0;

  // Diagnostic Visit Fee (Standard ₹149)
  const visitFee = 149;

  if (inspectionOnly || selectedRepairs.length === 0) {
    labor += visitFee;
    lineItems.push({
      name: `On-Site Inspection & Problem Diagnosis (${serviceName})`,
      amount: visitFee,
      type: 'LABOR',
    });
  } else {
    // If standard repairs are chosen, diagnostic fee is waived / included
    selectedRepairs.forEach((rep) => {
      const repAmount = typeof rep === 'object' ? Number(rep.price || rep.amount) : 449;
      const repName = typeof rep === 'object' ? (rep.name || rep.title) : 'Standard Repair Work';
      labor += repAmount;
      lineItems.push({
        name: repName,
        amount: repAmount,
        type: 'LABOR',
      });
    });
  }

  // Dynamic Requirements Modifiers
  // 1. AC & Appliance specifications
  if (params.tonnage === '2ton') {
    labor += 150;
    lineItems.push({ name: 'Heavy Capacity / 2.0 Ton AC (+₹150)', amount: 150, type: 'LABOR' });
  } else if (params.tonnage === '1.5ton') {
    labor += 50;
    lineItems.push({ name: '1.5 Ton AC (+₹50)', amount: 50, type: 'LABOR' });
  }

  if (params.acType === 'cassette') {
    labor += 200;
    lineItems.push({ name: 'Commercial Cassette / Tower Unit (+₹200)', amount: 200, type: 'LABOR' });
  }

  const unitsCount = Number(params.units) || 1;
  if (unitsCount > 1) {
    const originalLabor = labor;
    const additionalUnits = unitsCount - 1;
    const multiUnitLabor = Math.round(originalLabor * (1 + additionalUnits * 0.85));
    const comboDiscount = (originalLabor * unitsCount) - multiUnitLabor;
    labor = multiUnitLabor;
    lineItems.push({
      name: `Multi-Unit Combo (${unitsCount} Units - ₹${comboDiscount} Savings Applied)`,
      amount: 0,
      type: 'LABOR_DISCOUNT',
    });
  }

  // 2. Electrical & Plumbing Fixture Points & Parts
  if (params.fixturePoints === '2_3_points') {
    labor += 180;
    lineItems.push({ name: 'Multi-Point Fixtures (2-3 Points) (+₹180)', amount: 180, type: 'LABOR' });
  } else if (params.fixturePoints === 'full_room') {
    labor += 450;
    lineItems.push({ name: 'Full Room / 4+ Fixture Overhaul (+₹450)', amount: 450, type: 'LABOR' });
  }

  if (params.partsSupply === 'technician_brings') {
    passThrough += 250;
    passThroughItems.push({
      name: 'Standard Replacement Parts & Seals (100% Worker Pass-Through)',
      amount: 250,
      type: 'PASS_THROUGH',
    });
  }

  // 3. Vehicle Services Modifiers
  if (params.vehicleType === 'sedan') {
    labor += 100;
    lineItems.push({ name: 'Sedan Vehicle Category (+₹100)', amount: 100, type: 'LABOR' });
  } else if (params.vehicleType === 'compact_suv') {
    labor += 150;
    lineItems.push({ name: 'Compact SUV Category (+₹150)', amount: 150, type: 'LABOR' });
  } else if (params.vehicleType === 'luxury_suv') {
    labor += 250;
    lineItems.push({ name: 'Luxury / 7-Seater Heavy SUV (+₹250)', amount: 250, type: 'LABOR' });
  }

  if (params.packageDetail === 'interior_spa') {
    labor += 399;
    lineItems.push({ name: 'Deep Interior Vacuum & Dashboard Spa (+₹399)', amount: 399, type: 'LABOR' });
  } else if (params.packageDetail === 'ceramic_coating') {
    labor += 699;
    lineItems.push({ name: 'Teflon / Hydrophobic Wax Coating (+₹699)', amount: 699, type: 'LABOR' });
  }

  // 4. Pet Care Breed Sizing Modifiers
  if (params.breedSize === 'medium') {
    labor += 150;
    lineItems.push({ name: 'Medium Breed Dog Grooming (+₹150)', amount: 150, type: 'LABOR' });
  } else if (params.breedSize === 'large') {
    labor += 300;
    lineItems.push({ name: 'Large Breed Heavy Coat Grooming (+₹300)', amount: 300, type: 'LABOR' });
  } else if (params.breedSize === 'giant') {
    labor += 500;
    lineItems.push({ name: 'Giant Breed Dual-Technician Grooming (+₹500)', amount: 500, type: 'LABOR' });
  }

  if (params.antiTickWash) {
    labor += 250;
    lineItems.push({ name: 'Organic Anti-Tick & Flea Medicated Wash (+₹250)', amount: 250, type: 'LABOR' });
  }

  // Edge Case 2: On-site Verified Spare Parts (M4 Digital Quote Revision)
  // 100% Pass-Through with ZERO platform cut!
  spareParts.forEach((spare) => {
    const sparePrice = Number(spare.price || spare.amount || 0);
    passThrough += sparePrice;
    passThroughItems.push({
      name: `Verified Spare Part: ${spare.name || 'Component'} (100% Worker Pass-Through)`,
      amount: sparePrice,
      type: 'PASS_THROUGH',
    });
  });

  const contextMultiplier = isEmergency ? 1.40 : 1.0;
  if (isEmergency) {
    lineItems.push({
      name: 'Emergency Immediate Dispatch (+40% Labor to Technician)',
      amount: Math.round(labor * 0.40),
      type: 'SURGE_LABOR',
    });
  }

  return computeFinancialSplit({
    laborSubtotal: labor,
    passThroughSubtotal: passThrough,
    contextMultiplier,
    commissionRate: 0.10,
    lineItems,
    passThroughItems,
    metadata: { engine: PRICING_ENGINES.INSPECTION_RATE_CARD, serviceId, serviceName, isEmergency },
  });
}

/**
 * ENGINE 7: MULTI-UNIT & SOCIETY AMC (Society Management, Security Shifts)
 * Benchmark: MyGate / NoBrokerHood
 */
export function calculateMultiUnitAmcQuote(params = {}) {
  const {
    flatsCount = 20,
    towersCount = 1,
    securityGuardsCount = 0,
    hasPoolAmc = false,
    durationMonths = 1,
  } = params;

  const lineItems = [];
  const passThroughItems = [];
  let labor = 0;

  // Base Society Maintenance
  const baseFlatsCharge = 4999; // covers up to 20 flats
  labor += baseFlatsCharge;
  lineItems.push({
    name: 'Base Society Maintenance & Admin Desk (Up to 20 Units)',
    amount: baseFlatsCharge,
    type: 'LABOR',
  });

  if (flatsCount > 20) {
    const extraFlats = flatsCount - 20;
    const flatCost = extraFlats * 60;
    labor += flatCost;
    lineItems.push({
      name: `Additional Society Units (${extraFlats} Extra Flats @ ₹60/flat/mo)`,
      amount: flatCost,
      type: 'LABOR',
    });
  }

  if (towersCount > 1) {
    const extraTowers = towersCount - 1;
    const towerCost = extraTowers * 1500;
    labor += towerCost;
    lineItems.push({
      name: `Tower & Lift Lobby Maintenance (${extraTowers} Extra Tower${extraTowers > 1 ? 's' : ''} @ ₹1,500)`,
      amount: towerCost,
      type: 'LABOR',
    });
  }

  // Security Guards Deployment (8-hr shift monthly)
  if (securityGuardsCount > 0) {
    const guardRate = 16500;
    const guardCost = securityGuardsCount * guardRate;
    labor += guardCost;
    lineItems.push({
      name: `Licensed Security Personnel (${securityGuardsCount} Guard${securityGuardsCount > 1 ? 's' : ''} @ ₹${guardRate}/mo)`,
      amount: guardCost,
      type: 'LABOR',
    });
  }

  if (hasPoolAmc) {
    labor += 3500;
    lineItems.push({
      name: 'Swimming Pool Chemical Balance & Filtration AMC',
      amount: 3500,
      type: 'LABOR',
    });
  }

  const totalLaborForDuration = labor * Math.max(1, durationMonths);

  return computeFinancialSplit({
    laborSubtotal: totalLaborForDuration,
    passThroughSubtotal: 0,
    contextMultiplier: 1.0,
    commissionRate: 0.08, // 8% enterprise platform commission
    lineItems,
    passThroughItems,
    metadata: { engine: PRICING_ENGINES.MULTI_UNIT_AMC, flatsCount, towersCount, securityGuardsCount, durationMonths },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MASTER UNIFIED DISPATCHER & TAMPERING VALIDATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Universal calculation entrypoint.
 * Automatically resolves the archetype and executes the appropriate mathematical pipeline.
 */
export function calculateDynamicQuote(input = {}) {
  const {
    category = '',
    serviceId = '',
    serviceName = '',
    engine: explicitEngine = null,
    params = {},
  } = input;

  const engine = explicitEngine || resolveEngineType(category, serviceId, serviceName);

  // Merge top-level input properties into params for convenience
  const mergedParams = {
    serviceId,
    serviceName,
    ...params,
    ...input,
  };

  switch (engine) {
    case PRICING_ENGINES.DISTANCE_TIME:
      return calculateDistanceTimeQuote(mergedParams);
    case PRICING_ENGINES.VOLUME_DISTANCE_FLOOR:
      return calculateVolumeDistanceFloorQuote(mergedParams);
    case PRICING_ENGINES.AREA_DIMENSION:
      return calculateAreaDimensionQuote(mergedParams);
    case PRICING_ENGINES.HEADCOUNT_TIER:
      return calculateHeadcountTierQuote(mergedParams);
    case PRICING_ENGINES.TIME_BLOCK_HOURLY:
      return calculateTimeBlockHourlyQuote(mergedParams);
    case PRICING_ENGINES.MULTI_UNIT_AMC:
      return calculateMultiUnitAmcQuote(mergedParams);
    case PRICING_ENGINES.INSPECTION_RATE_CARD:
    default:
      return calculateInspectionRateCardQuote(mergedParams);
  }
}

/**
 * Edge Case 10: Server-Authoritative Tampering Protection
 * Validates incoming customer booking payload against the dynamic engine.
 */
export function validateAndEnforcePricing(bookingData = {}) {
  const submittedAmount = Number(bookingData.amount);
  const { service, serviceId, category, isEmergency } = bookingData;

  const mergedPricingParams = {
    ...(bookingData.pricingParams || {}),
    ...(bookingData.requirements || {}),
  };

  // Run authoritative quote calculation
  const calculatedQuote = calculateDynamicQuote({
    serviceId,
    serviceName: service,
    category,
    isEmergency: Boolean(isEmergency),
    params: mergedPricingParams,
  });

  if (bookingData.requirements) {
    calculatedQuote.requirements = bookingData.requirements;
  }

  const calculatedTotal = calculatedQuote.customerTotalPayable;
  const calculatedGross = calculatedQuote.grossBill;

  // If client sent no amount or 0, use authoritative calculation
  if (!submittedAmount || submittedAmount <= 0) {
    return {
      amount: calculatedTotal,
      platformCommission: calculatedQuote.platformCommission,
      workerEarnings: calculatedQuote.workerTotalPayout,
      pricingBreakdown: calculatedQuote,
    };
  }

  // Check for malicious tampering (tolerance allows for client coupons/credits or minor rounding)
  // If submitted amount is within reasonable range (e.g. ±15% or matches calculatedTotal / grossBill)
  const isReasonableMatch =
    Math.abs(submittedAmount - calculatedTotal) <= 150 ||
    Math.abs(submittedAmount - calculatedGross) <= 150;

  if (isReasonableMatch) {
    // Pro-rate worker earnings & commission based on exact submitted amount to preserve pass-throughs
    const passThrough = calculatedQuote.passThroughSubtotal;
    const remainingForLabor = Math.max(0, submittedAmount - passThrough);
    const commission = Math.round(remainingForLabor * calculatedQuote.commissionRate);
    const workerPayout = remainingForLabor - commission + passThrough;

    return {
      amount: submittedAmount,
      platformCommission: commission,
      workerEarnings: workerPayout,
      pricingBreakdown: calculatedQuote,
    };
  }

  // Discrepancy detected: Enforce server-authoritative pricing!
  console.warn(
    `[PricingEngine] Client tampering detected or stale price: Submitted ₹${submittedAmount}, Authoritative ₹${calculatedTotal}. Overriding with authoritative price.`
  );

  return {
    amount: calculatedTotal,
    platformCommission: calculatedQuote.platformCommission,
    workerEarnings: calculatedQuote.workerTotalPayout,
    pricingBreakdown: calculatedQuote,
  };
}
