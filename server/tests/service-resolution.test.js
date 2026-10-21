process.env.JWT_SECRET = 'test-secret';
import assert from 'node:assert';
const { classifyIntent } = await import('../routes/customerAi.js');

console.log('Testing service classification & intent handling...');

const testQueries = [
  'Need packers and movers for 2BHK house shifting',
  'Need verified driver for outstation trip',
  'Dog grooming at home',
  'Bathroom pipe leakage plumber chahiye',
  'AC is blowing warm air repair chahiye',
  'Sofa cleaning and shampooing at home',
  'CCTV camera installation setup',
  'Society ke liye security guard chahiye',
  'Doctor visit and physiotherapy at home',
  'Ceiling fan repair switch board sparked',
];

for (const q of testQueries) {
  const intent = classifyIntent({ text: q });
  assert.strictEqual(intent, 'SERVICE_PROBLEM', `Expected "${q}" to be classified as SERVICE_PROBLEM`);
  console.log(`✅ Classified "${q}" -> ${intent}`);
}

console.log('All 10 customer service problem classifications passed!');
