/**
 * server/scripts/verify-pricing-engine-suite.mjs
 *
 * Comprehensive Automated Verification Suite for:
 * 1. All 7 Universal Dynamic Pricing Engines (SPP)
 * 2. Non-commissionable pass-through separation (Tolls, Spares, Driver Bata)
 * 3. Worker take-home yield transparency
 * 4. Client-side tampering protection
 * 5. Real PostgreSQL persistence of pricingBreakdown
 * 6. Live HTTP /api/services/calculate-quote endpoint check
 */

import { prisma } from '../config/prisma.js';
import {
  PRICING_ENGINES,
  resolveEngineType,
  calculateDistanceTimeQuote,
  calculateVolumeDistanceFloorQuote,
  calculateAreaDimensionQuote,
  calculateHeadcountTierQuote,
  calculateTimeBlockHourlyQuote,
  calculateInspectionRateCardQuote,
  calculateMultiUnitAmcQuote,
  calculateDynamicQuote,
  validateAndEnforcePricing,
} from '../services/pricingEngineService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed += 1;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed += 1;
  }
}

async function runSuite() {
  console.log('\n============================================================');
  console.log('🚀 SERVECIRCLE UNIVERSAL PRICING ENGINE VERIFICATION SUITE');
  console.log('============================================================\n');

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: Engine Classifier & Routing
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Engine Archetype Classification ---');
  assert(
    resolveEngineType('Travel & Commute', 'airport-transfer') === PRICING_ENGINES.DISTANCE_TIME,
    'Airport Transfer classified as DISTANCE_TIME'
  );
  assert(
    resolveEngineType('Relocation', 'full-home-shifting') === PRICING_ENGINES.VOLUME_DISTANCE_FLOOR,
    'Home Shifting classified as VOLUME_DISTANCE_FLOOR'
  );
  assert(
    resolveEngineType('Cleaning & Hygiene', 'deep-home-clean') === PRICING_ENGINES.AREA_DIMENSION,
    'Deep Clean classified as AREA_DIMENSION'
  );
  assert(
    resolveEngineType('Food & Kitchen', 'home-chef') === PRICING_ENGINES.HEADCOUNT_TIER,
    'Home Chef classified as HEADCOUNT_TIER'
  );
  assert(
    resolveEngineType('Kids & Elderly Care', 'babysitting') === PRICING_ENGINES.TIME_BLOCK_HOURLY,
    'Babysitting classified as TIME_BLOCK_HOURLY'
  );
  assert(
    resolveEngineType('Society Management', 'society-security-amc') === PRICING_ENGINES.MULTI_UNIT_AMC,
    'Society Security classified as MULTI_UNIT_AMC'
  );
  assert(
    resolveEngineType('Home Repairs', 'ac-repair') === PRICING_ENGINES.INSPECTION_RATE_CARD,
    'AC Repair classified as INSPECTION_RATE_CARD'
  );

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: Engine 1 — Distance & Time (Travel / Outstation)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. Engine 1: Distance & Time (Travel & Outstation) ---');
  const airportQuote = calculateDistanceTimeQuote({
    tripType: 'airport',
    fleetType: 'suv',
    distanceKm: 40, // 5 km beyond 35 km included
    includeToll: true,
  });

  // Base: 1499, Extra 5km: 5 * 18 = 90. Billable labor: 1589.
  // Pass-through toll: 120.
  // Commission (10% on 1589): 159.
  // Worker take-home: (1589 - 159) + 120 = 1550.
  assert(airportQuote.billableLabor === 1589, `Airport SUV labor is ₹1,589 (got ${airportQuote.billableLabor})`);
  assert(airportQuote.passThroughSubtotal === 120, `Airport toll pass-through is ₹120 (got ${airportQuote.passThroughSubtotal})`);
  assert(airportQuote.platformCommission === 159, `Platform commission strictly on labor is ₹159 (got ${airportQuote.platformCommission})`);
  assert(airportQuote.workerTotalPayout === 1550, `Worker net take-home is ₹1,550 with 100% toll pass-through (got ${airportQuote.workerTotalPayout})`);

  const outstationQuote = calculateDistanceTimeQuote({
    tripType: 'outstation',
    days: 3,
    isNightTrip: false,
  });
  // 3 days driver labor: 3 * 999 = 2997.
  // Driver food bata: 3 * 350 = 1050 (100% pass-through).
  // Night halts: 2 * 300 = 600 (100% pass-through).
  // Total pass-through: 1650.
  // Commission on 2997 @ 10%: 300.
  // Worker payout: (2997 - 300) + 1650 = 2697 + 1650 = 4347.
  assert(outstationQuote.passThroughSubtotal === 1650, `3-Day Outstation pass-through (Bata + Night) is ₹1,650 (got ${outstationQuote.passThroughSubtotal})`);
  assert(outstationQuote.platformCommission === 300, `Platform commission excludes Bata/Night Halt: ₹300 (got ${outstationQuote.platformCommission})`);
  assert(outstationQuote.workerTotalPayout === 4347, `Driver takes home ₹4,347 (got ${outstationQuote.workerTotalPayout})`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: Engine 2 — Volume, Distance & Floor (Relocation)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Engine 2: Volume, Distance & Floor (Relocation) ---');
  const relocationQuote = calculateVolumeDistanceFloorQuote({
    homeSize: '2bhk',
    distanceKm: 15, // 5 km extra @ 45 = 225
    originFloor: 3,
    originHasLift: false, // 2 extra floors * 200 = 400
    destFloor: 4,
    destHasLift: false, // 3 extra floors * 200 = 600
    packingGrade: 'premium_3layer', // 1499 material pass-through
  });
  // Base 2BHK: 7499 + 225 = 7724 billable labor.
  // Pass-through: 400 (origin stairs) + 600 (dest stairs) + 1499 (materials) = 2499.
  // Commission (12% on 7724): 927.
  // Worker payout: (7724 - 927) + 2499 = 6797 + 2499 = 9296.
  assert(relocationQuote.passThroughSubtotal === 2499, `Stairs carry & materials pass-through is ₹2,499 (got ${relocationQuote.passThroughSubtotal})`);
  assert(relocationQuote.platformCommission === 927, `Commission strictly on transport labor is ₹927 (got ${relocationQuote.platformCommission})`);
  assert(relocationQuote.workerTotalPayout === 9296, `Relocation crew net payout is ₹9,296 (got ${relocationQuote.workerTotalPayout})`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: Engine 3 & 4 — Deep Clean & Home Cook
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Engine 3 & 4: Deep Cleaning & Home Cook ---');
  const cleaningQuote = calculateAreaDimensionQuote({
    homeSize: '3bhk', // 4499
    sofaSeats: 5,     // 5 * 249 = 1245
    balconies: 2,     // 2 * 349 = 698
  });
  // Labor: 4499 + 1245 + 698 = 6442. Chemical kit pass-through: 200.
  // Commission (10% on 6442): 644.
  // Worker payout: (6442 - 644) + 200 = 5998.
  assert(cleaningQuote.billableLabor === 6442, `3BHK + Sofa + Balconies labor is ₹6,442 (got ${cleaningQuote.billableLabor})`);
  assert(cleaningQuote.workerTotalPayout === 5998, `Cleaner payout with chemical kit is ₹5,998 (got ${cleaningQuote.workerTotalPayout})`);

  const chefQuote = calculateHeadcountTierQuote({
    chefType: 'party_chef',
    guests: 10, // 4 extra guests * 99 = 396
    courseTier: 'gourmet_5course', // +600
  });
  // Labor: 1999 + 396 + 600 = 2995. Commission (10%): 300.
  assert(chefQuote.billableLabor === 2995, `10-Guest Gourmet Party Chef labor is ₹2,995 (got ${chefQuote.billableLabor})`);
  assert(chefQuote.workerTotalPayout === 2695, `Chef net take-home is ₹2,695 (got ${chefQuote.workerTotalPayout})`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 5: Engine 5 & 6 — Time-Block Overtime & M4 Spare Parts
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. Engine 5 & 6: Overtime & M4 Spare Parts ---');
  const babysittingQuote = calculateTimeBlockHourlyQuote({
    careType: 'babysitting',
    bookedHours: 4, // 599 (2h) + 2*199 = 997
    overtimeMinutes: 45, // >15m: 30m block @ 100 = 100
  });
  assert(babysittingQuote.billableLabor === 1097, `4h + 45m Overtime babysitting labor is ₹1,097 (got ${babysittingQuote.billableLabor})`);

  const acRepairQuote = calculateInspectionRateCardQuote({
    serviceId: 'ac-repair',
    serviceName: 'AC Jet Wash & Gas Charging',
    selectedRepairs: [{ name: 'AC Jet Pump Foam Clean', amount: 699 }],
    spareParts: [
      { name: 'R32 Refrigerant Gas Refill (1kg)', amount: 2200 },
      { name: 'Dual Run Capacitor 50uF', amount: 450 },
    ],
  });
  // Labor: 699. Spares pass-through: 2200 + 450 = 2650.
  // Commission on labor (10% on 699): 70.
  // Worker payout: (699 - 70) + 2650 = 629 + 2650 = 3279.
  assert(acRepairQuote.passThroughSubtotal === 2650, `Spare parts carry 0% commission: ₹2,650 (got ${acRepairQuote.passThroughSubtotal})`);
  assert(acRepairQuote.platformCommission === 70, `Platform commission strictly on ₹699 labor: ₹70 (got ${acRepairQuote.platformCommission})`);
  assert(acRepairQuote.workerTotalPayout === 3279, `Technician net payout is ₹3,279 (got ${acRepairQuote.workerTotalPayout})`);

  // ─────────────────────────────────────────────────────────────
  // SUITE 6: Tampering Protection & Authoritative Enforcement
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. Client Tampering Protection ---');
  // Client attempts to send ₹1 for a ₹2,000+ airport trip
  const tamperedBooking = {
    service: 'Guaranteed Airport Drop & Pick',
    serviceId: 'airport-transfer',
    category: 'Travel & Commute',
    amount: 1, // MALICIOUS INPUT
    pricingParams: {
      tripType: 'airport',
      fleetType: 'sedan',
      distanceKm: 30,
    },
  };

  const enforced = validateAndEnforcePricing(tamperedBooking);
  assert(enforced.amount > 900, `Malicious amount ₹1 was rejected and overridden with authoritative price ₹${enforced.amount}`);
  assert(enforced.workerEarnings > 0, `Worker earnings protected: ₹${enforced.workerEarnings}`);
  assert(enforced.pricingBreakdown !== null, 'Pricing breakdown snapshot generated');

  // ─────────────────────────────────────────────────────────────
  // SUITE 7: HTTP Endpoint Check (/api/services/calculate-quote)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. Live HTTP /calculate-quote Endpoint ---');
  try {
    const res = await fetch('http://localhost:5000/api/services/calculate-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'airport-transfer',
        tripType: 'airport',
        fleetType: 'sedan',
        distanceKm: 30,
      }),
    });
    const json = await res.json();
    assert(res.status === 200 && json.success === true, 'HTTP 200 OK from /calculate-quote');
    assert(json.data.workerTotalPayout > 0, `HTTP response returned workerTotalPayout: ₹${json.data.workerTotalPayout}`);
  } catch (err) {
    assert(false, `HTTP request failed: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE 8: Real PostgreSQL Persistence & Snapshot
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 8. Real PostgreSQL Persistence ---');
  const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  if (!customer) {
    console.warn('⚠️ No customer found in DB, skipping DB insertion check');
  } else {
    const testBookingId = `SC-TEST-PRICING-${Date.now().toString().slice(-4)}`;
    const createdBooking = await prisma.booking.create({
      data: {
        bookingId: testBookingId,
        customerId: customer.id,
        serviceName: 'Automated Pricing Test - Shifting',
        category: 'Relocation & Packers',
        address: '101 Marine Drive',
        city: 'Mumbai',
        scheduledDate: new Date(),
        amount: relocationQuote.customerTotalPayable,
        platformCommission: relocationQuote.platformCommission,
        workerEarnings: relocationQuote.workerTotalPayout,
        pricingBreakdown: relocationQuote,
        status: 'PENDING',
      },
    });

    assert(createdBooking.id !== null, `Booking persisted in PostgreSQL: ${createdBooking.bookingId}`);
    assert(createdBooking.workerEarnings === relocationQuote.workerTotalPayout, 'Worker earnings accurately stored in DB');
    assert(createdBooking.pricingBreakdown !== null, 'pricingBreakdown JSON snapshot persisted in DB');

    // Clean up test booking
    await prisma.booking.delete({ where: { id: createdBooking.id } });
    console.log('  🧹 Cleaned up temporary test booking');
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n============================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('Fatal error in pricing test suite:', err);
  process.exit(1);
});
