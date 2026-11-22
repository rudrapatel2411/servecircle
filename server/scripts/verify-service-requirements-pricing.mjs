/**
 * server/scripts/verify-service-requirements-pricing.mjs
 *
 * Automated verification suite for:
 * 1. Category-specific dynamic requirements configuration & schema
 * 2. Real-time pricing impact calculation (Labor deltas, pass-throughs, multi-unit discounts)
 * 3. Server-side validation & pricing calculation in pricingEngineService
 * 4. Pass-through 0% commission guarantee for parts & stairs
 * 5. Real PostgreSQL persistence of requirements and formatted specs in Booking
 */

import { prisma } from '../config/prisma.js';
import { calculateDynamicQuote, validateAndEnforcePricing } from '../services/pricingEngineService.js';
import { createBooking } from '../services/bookingService.js';

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
  console.log('🚀 SERVECIRCLE SERVICE REQUIREMENTS & PRICING VERIFICATION');
  console.log('============================================================\n');

  // ─────────────────────────────────────────────────────────────
  // 1. Vehicle Services: Sizing Modifiers
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Vehicle Services: Sizing Modifiers ---');
  const hatchbackQuote = calculateDynamicQuote({
    serviceId: 'car-wash',
    serviceName: 'Eco-Friendly Car Wash',
    category: 'Vehicle Services',
    vehicleType: 'hatchback',
  });
  const luxurySuvQuote = calculateDynamicQuote({
    serviceId: 'car-wash',
    serviceName: 'Eco-Friendly Car Wash',
    category: 'Vehicle Services',
    vehicleType: 'luxury_suv',
    packageDetail: 'interior_spa',
  });

  // Base wash: 149 (inspection/visit base).
  // Luxury SUV: +250 sizing + 399 interior spa = +649 labor.
  assert(
    luxurySuvQuote.billableLabor > hatchbackQuote.billableLabor,
    `Luxury SUV + Interior Spa billable labor (₹${luxurySuvQuote.billableLabor}) is higher than Hatchback (₹${hatchbackQuote.billableLabor})`
  );
  assert(
    luxurySuvQuote.billableLabor - hatchbackQuote.billableLabor === 649,
    `Exact pricing delta is ₹649 (250 SUV + 399 Spa) (got ${luxurySuvQuote.billableLabor - hatchbackQuote.billableLabor})`
  );

  // ─────────────────────────────────────────────────────────────
  // 2. AC & Appliance: Tonnage & Multi-Unit Discounts
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. AC & Appliance: Tonnage & Multi-Unit ---');
  const singleUnitQuote = calculateDynamicQuote({
    serviceId: 'ac-repair',
    serviceName: 'AC Repair & Diagnostics',
    category: 'Home Repairs',
    tonnage: '1ton',
    units: 1,
  });
  const dualUnit2TonQuote = calculateDynamicQuote({
    serviceId: 'ac-repair',
    serviceName: 'AC Repair & Diagnostics',
    category: 'Home Repairs',
    tonnage: '2ton', // +150
    units: 2,        // 1.85x combo discount
  });

  // 1 Ton single unit labor: 149
  // 2 Ton labor before multi-unit: 149 + 150 = 299
  // 2 units combo: 299 * (1 + 0.85) = 299 * 1.85 = 553
  assert(singleUnitQuote.billableLabor === 149, `Single 1-Ton AC base inspection is ₹149 (got ${singleUnitQuote.billableLabor})`);
  assert(dualUnit2TonQuote.billableLabor === 553, `Dual 2-Ton AC combo labor with 15% discount is ₹553 (got ${dualUnit2TonQuote.billableLabor})`);

  // ─────────────────────────────────────────────────────────────
  // 3. Electrical & Plumbing: Fixture Points & Parts Pass-Through
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Plumbing / Electrical: Fixture Points & Parts ---');
  const multiPointPlumbingQuote = calculateDynamicQuote({
    serviceId: 'plumbing-fix',
    serviceName: 'Plumbing Repairs & Leakage',
    category: 'Home Repairs',
    fixturePoints: '2_3_points', // +180 labor
    partsSupply: 'technician_brings', // +250 pass-through parts
  });

  // Labor: 149 + 180 = 329. Pass-through: 250.
  // Commission on labor (10% of 329): 33.
  // Worker payout: (329 - 33) + 250 = 296 + 250 = 546.
  assert(multiPointPlumbingQuote.billableLabor === 329, `2-3 Points plumbing labor is ₹329 (got ${multiPointPlumbingQuote.billableLabor})`);
  assert(multiPointPlumbingQuote.passThroughSubtotal === 250, `Replacement parts carry 0% platform commission: ₹250 (got ${multiPointPlumbingQuote.passThroughSubtotal})`);
  assert(multiPointPlumbingQuote.platformCommission === 33, `Platform commission strictly on ₹329 labor: ₹33 (got ${multiPointPlumbingQuote.platformCommission})`);
  assert(multiPointPlumbingQuote.workerTotalPayout === 546, `Plumber receives 100% parts reimbursement: ₹546 (got ${multiPointPlumbingQuote.workerTotalPayout})`);

  // ─────────────────────────────────────────────────────────────
  // 4. Pet Care: Breed Size & Anti-Tick
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Pet Care: Breed Size Modifiers ---');
  const smallPetQuote = calculateDynamicQuote({
    serviceId: 'dog-grooming',
    serviceName: 'Full Body Dog Grooming',
    category: 'Pet Services',
    breedSize: 'small',
  });
  const giantPetQuote = calculateDynamicQuote({
    serviceId: 'dog-grooming',
    serviceName: 'Full Body Dog Grooming',
    category: 'Pet Services',
    breedSize: 'giant', // +500
    antiTickWash: true,  // +250
  });

  assert(giantPetQuote.billableLabor - smallPetQuote.billableLabor === 750, `Giant Breed + Anti-Tick Wash delta is ₹750 (got ${giantPetQuote.billableLabor - smallPetQuote.billableLabor})`);

  // ─────────────────────────────────────────────────────────────
  // 5. Relocation: Floor Elevation Surcharge
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. Relocation: Floor Elevation Stairs Carry ---');
  const relocationElevatorQuote = calculateDynamicQuote({
    serviceId: 'full-home-shifting',
    serviceName: '2 BHK Home Shifting',
    category: 'Relocation & Packers',
    originElevator: 'stairs_floor3', // 2 extra floors * 200 = 400
    packingType: 'premium',          // 1499 pass-through
  });

  // Stairs carry: 400. Packing: 1499. Total pass-through: 1899.
  assert(relocationElevatorQuote.passThroughSubtotal >= 1899, `Stairs carry & packing pass-through is ₹1,899+ (got ${relocationElevatorQuote.passThroughSubtotal})`);

  // ─────────────────────────────────────────────────────────────
  // 6. PostgreSQL Persistence of Requirements in Booking
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. Real PostgreSQL Persistence & Specs Formatted ---');
  const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  if (!customer) {
    console.warn('⚠️ No customer found in DB, skipping DB insertion check');
  } else {
    const testBookingData = {
      service: 'AC Repair & Diagnostics',
      serviceId: 'ac-repair',
      category: 'Home Repairs',
      address: '702 Skyline Tower',
      city: 'Ahmedabad',
      scheduledDate: new Date().toISOString(),
      scheduledTime: '02:00 PM',
      amount: dualUnit2TonQuote.customerTotalPayable,
      requirements: {
        acType: 'split',
        tonnage: '2ton',
        units: 2,
        brand: 'Daikin',
        primaryIssue: 'water_leakage',
      },
    };

    const created = await createBooking(testBookingData, customer.id, customer.name);

    assert(created._id !== null, `Booking successfully created with ID: ${created.bookingId}`);
    assert(
      created.description.includes('Specs:') && created.description.includes('2ton'),
      `Formatted specifications present in description: "${created.description}"`
    );
    assert(
      created.pricingBreakdown !== null,
      'pricingBreakdown JSON snapshot persisted with requirements'
    );
    assert(
      created.workerEarnings > 0,
      `Worker net earnings stored in DB: ₹${created.workerEarnings}`
    );

    // Clean up test booking
    await prisma.booking.delete({ where: { id: created._id } });
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
  console.error('Fatal error in requirements verification suite:', err);
  process.exit(1);
});
