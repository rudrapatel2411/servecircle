/**
 * client/src/data/serviceRequirementsConfig.js
 *
 * Universal dynamic requirements catalog configuration.
 * Maps any service/category to structured requirement fields,
 * their options, and their direct impact on pricing and pass-throughs.
 */

export const SERVICE_REQUIREMENT_ARCHETYPES = {
 VEHICLE: 'VEHICLE',
 AC_APPLIANCE: 'AC_APPLIANCE',
 ELECTRICAL_PLUMBING: 'ELECTRICAL_PLUMBING',
 PET_CARE: 'PET_CARE',
 CLEANING: 'CLEANING',
 RELOCATION: 'RELOCATION',
 FOOD_CHEF: 'FOOD_CHEF',
 ELDER_KID_CARE: 'ELDER_KID_CARE',
 PAINTING: 'PAINTING',
 EVENTS_DECOR: 'EVENTS_DECOR',
};

/**
 * Resolves the requirement archetype based on service category and name.
 */
export function resolveRequirementArchetype(category = '', serviceId = '', serviceName = '') {
 const norm = `${category} ${serviceId} ${serviceName}`.toLowerCase();

 if (norm.includes('vehicle') || /\bcar\b/i.test(norm) || norm.includes('bike') || norm.includes('puncture') || norm.includes('car-wash')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.VEHICLE;
 }
 if (norm.includes('ac-') || norm.includes('ac ') || norm.includes('appliance') || norm.includes('refrigerator') || norm.includes('washing machine') || norm.includes('ro water') || norm.includes('geyser')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.AC_APPLIANCE;
 }
 if (norm.includes('electric') || norm.includes('plumb') || norm.includes('carpenter') || norm.includes('handyman')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.ELECTRICAL_PLUMBING;
 }
 if (norm.includes('pet') || norm.includes('dog') || norm.includes('cat') || norm.includes('groom')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.PET_CARE;
 }
 if (norm.includes('clean') || norm.includes('pest') || norm.includes('sanitiz') || norm.includes('sofa') || norm.includes('carpet')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.CLEANING;
 }
 if (norm.includes('relocation') || norm.includes('shift') || norm.includes('mover') || norm.includes('packer')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.RELOCATION;
 }
 if (norm.includes('cook') || norm.includes('chef') || norm.includes('meal') || norm.includes('tiffin') || norm.includes('food')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.FOOD_CHEF;
 }
 if (norm.includes('elder') || norm.includes('kid') || norm.includes('nanny') || norm.includes('babysit') || norm.includes('nurse')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.ELDER_KID_CARE;
 }
 if (norm.includes('paint') || norm.includes('wall') || norm.includes('decor') || norm.includes('renovat')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.PAINTING;
 }
 if (norm.includes('event') || norm.includes('party') || norm.includes('balloon') || norm.includes('wedding')) {
 return SERVICE_REQUIREMENT_ARCHETYPES.EVENTS_DECOR;
 }

 return null;
}

/**
 * Returns the form schema and options for a given archetype.
 */
export function getRequirementsSchema(archetype) {
 switch (archetype) {
 case SERVICE_REQUIREMENT_ARCHETYPES.VEHICLE:
 return {
 title: 'Vehicle Specifications',
 fields: [
 {
 key: 'vehicleType',
 label: 'Vehicle Size & Category',
 type: 'select',
 default: 'hatchback',
 options: [
 { value: 'hatchback', label: 'Hatchback (Swift, i10, Tiago)', priceDelta: 0 },
 { value: 'sedan', label: 'Sedan (City, Verna, Dzire) (+₹100)', priceDelta: 100 },
 { value: 'compact_suv', label: 'Compact SUV (Creta, Brezza, Nexon) (+₹150)', priceDelta: 150 },
 { value: 'luxury_suv', label: 'Luxury / 7-Seater SUV (Fortuner, Innova, Audi) (+₹250)', priceDelta: 250 },
 ],
 },
 {
 key: 'packageDetail',
 label: 'Service Treatment Add-on',
 type: 'select',
 default: 'standard',
 options: [
 { value: 'standard', label: 'Standard Foam Wash', priceDelta: 0 },
 { value: 'interior_spa', label: 'Deep Interior Vacuum & Dashboard Spa (+₹399)', priceDelta: 399 },
 { value: 'ceramic_coating', label: 'Teflon / Hydrophobic Wax Coating (+₹699)', priceDelta: 699 },
 ],
 },
 ],
 };

 case SERVICE_REQUIREMENT_ARCHETYPES.AC_APPLIANCE:
 return {
 title: 'Appliance Details & Issues',
 fields: [
 {
 key: 'acType',
 label: 'Appliance Model / Type',
 type: 'select',
 default: 'split',
 options: [
 { value: 'split', label: 'Split Inverter AC', priceDelta: 0 },
 { value: 'window', label: 'Window AC', priceDelta: 0 },
 { value: 'cassette', label: 'Cassette / Commercial Tower (+₹200)', priceDelta: 200 },
 ],
 },
 {
 key: 'tonnage',
 label: 'Capacity / Tonnage',
 type: 'select',
 default: '1.5ton',
 options: [
 { value: '1ton', label: '1.0 Ton', priceDelta: 0 },
 { value: '1.5ton', label: '1.5 Ton (+₹50)', priceDelta: 50 },
 { value: '2ton', label: '2.0 Ton / Heavy Duty (+₹150)', priceDelta: 150 },
 ],
 },
 {
 key: 'units',
 label: 'Number of Units',
 type: 'counter',
 min: 1,
 max: 5,
 default: 1,
 unitLabel: 'Unit',
 multiplierPerUnit: 0.85, // 15% combo discount on additional units!
 },
 {
 key: 'primaryIssue',
 label: 'Primary Problem Encountered',
 type: 'select',
 default: 'general_service',
 options: [
 { value: 'general_service', label: 'Periodic Routine Cleaning & Filter Wash', priceDelta: 0 },
 { value: 'low_cooling', label: 'Low / Ineffective Cooling', priceDelta: 0 },
 { value: 'water_leakage', label: 'Indoor Unit Water Dripping / Leakage', priceDelta: 0 },
 { value: 'gas_leak', label: 'Suspected Refrigerant Gas Leakage', priceDelta: 0 },
 { value: 'noise_trip', label: 'Unusual Noise or MCB Tripping', priceDelta: 0 },
 ],
 },
 ],
 };

 case SERVICE_REQUIREMENT_ARCHETYPES.ELECTRICAL_PLUMBING:
 return {
 title: 'Scope of Work & Materials',
 fields: [
 {
 key: 'fixturePoints',
 label: 'Points / Fixtures to Repair or Install',
 type: 'select',
 default: '1_point',
 options: [
 { value: '1_point', label: '1 Point / Tap / Switch (Base Labor)', priceDelta: 0 },
 { value: '2_3_points', label: '2 to 3 Points / Fixtures (+₹180)', priceDelta: 180 },
 { value: 'full_room', label: 'Full Room / 4+ Fixtures (+₹450)', priceDelta: 450 },
 ],
 },
 {
 key: 'partsSupply',
 label: 'Spare Parts & Materials',
 type: 'select',
 default: 'customer_has_parts',
 options: [
 { value: 'customer_has_parts', label: 'I already have the replacement parts (+₹0)', priceDelta: 0, isPassThrough: false },
 { value: 'technician_brings', label: 'Technician to supply standard ISI parts (+₹250 Pass-Through)', priceDelta: 250, isPassThrough: true },
 ],
 },
 ],
 };

 case SERVICE_REQUIREMENT_ARCHETYPES.PET_CARE:
 return {
 title: 'Pet Profile & Care Needs',
 fields: [
 {
 key: 'petType',
 label: 'Pet Category',
 type: 'select',
 default: 'dog',
 options: [
 { value: 'dog', label: 'Dog ', priceDelta: 0 },
 { value: 'cat', label: 'Cat ', priceDelta: 0 },
 ],
 },
 {
 key: 'breedSize',
 label: 'Pet Size / Breed Category',
 type: 'select',
 default: 'small',
 options: [
 { value: 'small', label: 'Small (Pug, Shih Tzu, Indie Pup)', priceDelta: 0 },
 { value: 'medium', label: 'Medium (Beagle, Cocker Spaniel, Indie Adult) (+₹150)', priceDelta: 150 },
 { value: 'large', label: 'Large (Golden Retriever, Labrador, Boxer) (+₹300)', priceDelta: 300 },
 { value: 'giant', label: 'Giant (German Shepherd, Rottweiler, Husky) (+₹500)', priceDelta: 500 },
 ],
 },
 {
 key: 'antiTickWash',
 label: 'Anti-Tick Medicated Treatment',
 type: 'checkbox',
 default: false,
 labelCheck: 'Add Organic Anti-Tick & Flea Deep Medicated Wash (+₹250)',
 priceDelta: 250,
 },
 ],
 };

 case SERVICE_REQUIREMENT_ARCHETYPES.CLEANING:
 return {
 title: 'Cleaning Sizing & Custom Add-ons',
 fields: [
 {
 key: 'homeConfig',
 label: 'Home Size',
 type: 'select',
 default: '1bhk',
 options: [
 { value: '1bhk', label: '1 BHK Standard', priceDelta: 0 },
 { value: '2bhk', label: '2 BHK (+₹1,000)', priceDelta: 1000 },
 { value: '3bhk', label: '3 BHK (+₹2,000)', priceDelta: 2000 },
 { value: '4bhk_villa', label: '4 BHK / Luxury Villa (+₹3,500)', priceDelta: 3500 },
 ],
 },
 {
 key: 'sofaSeats',
 label: 'Sofa Seats Foam Shampooing',
 type: 'counter',
 min: 0,
 max: 10,
 default: 0,
 unitLabel: 'Seat',
 ratePerUnit: 249,
 },
 {
 key: 'balconies',
 label: 'Balcony Jet Pressure Wash',
 type: 'counter',
 min: 0,
 max: 4,
 default: 0,
 unitLabel: 'Balcony',
 ratePerUnit: 349,
 },
 ],
 };

 case SERVICE_REQUIREMENT_ARCHETYPES.RELOCATION:
 return {
 title: 'Shifting Details & Floor Elevation',
 fields: [
 {
 key: 'originElevator',
 label: 'Origin Floor & Lift Access',
 type: 'select',
 default: 'lift_available',
 options: [
 { value: 'ground', label: 'Ground Floor (+₹0)', priceDelta: 0 },
 { value: 'lift_available', label: 'Upper Floor with Service Lift (+₹0)', priceDelta: 0 },
 { value: 'stairs_floor2', label: '2nd Floor — Stairs Only (+₹200 Loader Surcharge)', priceDelta: 200, isPassThrough: true },
 { value: 'stairs_floor3', label: '3rd Floor — Stairs Only (+₹400 Loader Surcharge)', priceDelta: 400, isPassThrough: true },
 { value: 'stairs_floor4', label: '4th+ Floor — Stairs Only (+₹600 Loader Surcharge)', priceDelta: 600, isPassThrough: true },
 ],
 },
 {
 key: 'packingType',
 label: 'Packaging Grade',
 type: 'select',
 default: 'standard',
 options: [
 { value: 'standard', label: 'Standard Bubble & Stretch Film (+₹0)', priceDelta: 0 },
 { value: 'premium', label: 'Premium 3-Layer Foam & Carton Protection (+₹1,200 Pass-Through)', priceDelta: 1200, isPassThrough: true },
 ],
 },
 ],
 };

 case SERVICE_REQUIREMENT_ARCHETYPES.FOOD_CHEF:
 return {
 title: 'Dining Headcount & Cuisine Preferences',
 fields: [
 {
 key: 'headcount',
 label: 'Total People Eating',
 type: 'counter',
 min: 2,
 max: 25,
 default: 4,
 unitLabel: 'Person',
 threshold: 4,
 ratePerExtra: 60, // ₹60/extra person above 4
 },
 {
 key: 'dietary',
 label: 'Dietary Preference',
 type: 'select',
 default: 'veg',
 options: [
 { value: 'veg', label: 'Vegetarian ', priceDelta: 0 },
 { value: 'non_veg', label: 'Non-Vegetarian ', priceDelta: 0 },
 { value: 'jain', label: 'Jain (No Onion/Garlic) ', priceDelta: 0 },
 { value: 'keto', label: 'Keto / High Protein (+₹100)', priceDelta: 100 },
 ],
 },
 {
 key: 'courseLevel',
 label: 'Course & Plating Tier',
 type: 'select',
 default: 'homestyle',
 options: [
 { value: 'homestyle', label: 'Standard 3-Course Homestyle Meal', priceDelta: 0 },
 { value: 'gourmet', label: 'Gourmet 5-Course Plating & Starters (+₹600)', priceDelta: 600 },
 ],
 },
 ],
 };

 default:
 return null;
 }
}

/**
 * Computes price deltas from active customer requirements selections.
 */
export function calculateRequirementsPriceImpact(schema, values = {}) {
 if (!schema || !schema.fields) {
 return { laborDelta: 0, passThroughDelta: 0, unitMultiplier: 1, tags: [] };
 }

 let laborDelta = 0;
 let passThroughDelta = 0;
 let unitMultiplier = 1;
 const tags = [];

 schema.fields.forEach((field) => {
 const val = values[field.key] !== undefined ? values[field.key] : field.default;

 if (field.type === 'select') {
 const selectedOpt = field.options.find((opt) => opt.value === val) || field.options[0];
 if (selectedOpt) {
 if (selectedOpt.priceDelta) {
 if (selectedOpt.isPassThrough) {
 passThroughDelta += selectedOpt.priceDelta;
 } else {
 laborDelta += selectedOpt.priceDelta;
 }
 }
 tags.push(`${field.label}: ${selectedOpt.label.split(' (+')[0]}`);
 }
 } else if (field.type === 'counter') {
 const count = Number(val) || 0;
 if (field.multiplierPerUnit && count > 1) {
 // Multi-unit with discount
 unitMultiplier = 1 + (count - 1) * field.multiplierPerUnit;
 tags.push(`${count} Units (${Math.round((1 - field.multiplierPerUnit) * 100)}% Multi-Unit Off)`);
 } else if (field.ratePerUnit && count > 0) {
 const cost = count * field.ratePerUnit;
 laborDelta += cost;
 tags.push(`${count} ${field.unitLabel}${count > 1 ? 's' : ''} (+₹${cost})`);
 } else if (field.ratePerExtra && count > (field.threshold || 0)) {
 const extra = count - field.threshold;
 const cost = extra * field.ratePerExtra;
 laborDelta += cost;
 tags.push(`${count} People (+${extra} Extra @ ₹${field.ratePerExtra})`);
 } else {
 tags.push(`${count} ${field.unitLabel}${count > 1 ? 's' : ''}`);
 }
 } else if (field.type === 'checkbox') {
 if (Boolean(val)) {
 laborDelta += field.priceDelta || 0;
 tags.push(field.labelCheck.split(' (+')[0]);
 }
 }
 });

 return { laborDelta, passThroughDelta, unitMultiplier, tags };
}
