/**
 * server/tests/providers/responseParser.test.js — Phase 4 Batch 1 (Cleanup)
 *
 * Unit tests for ResponseParser.
 * Run: node server/tests/providers/responseParser.test.js
 *
 * Moved from server/ai/providers/__test_parser__.js
 */

import { ResponseParser } from '../../ai/providers/ResponseParser.js';

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`  PASS  ${label}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${label} — ${err.message}`);
    failed++;
  }
}

console.log('\n[ResponseParser Tests]\n');

// Test 1: plain valid JSON
test('Parse valid JSON', () => {
  const r = ResponseParser.parse('{"status":"ok","confidence":0.9}');
  if (r.status !== 'ok') throw new Error('wrong status');
});

// Test 2: code fence stripping
test('Strip code fences', () => {
  const r = ResponseParser.parse('```json\n{"foo":"bar"}\n```');
  if (r.foo !== 'bar') throw new Error('wrong value');
});

// Test 3: trailing comma repair
test('Repair trailing comma', () => {
  const r = ResponseParser.parse('{"a":1,}');
  if (r.a !== 1) throw new Error('wrong value');
});

// Test 4: safeParse returns false on garbage
test('safeParse on garbage returns false', () => {
  const r = ResponseParser.safeParse('this is not json');
  if (r.success !== false) throw new Error('should be false');
});

// Test 5: requiredFields validation throws
test('Missing required fields throws AppError', () => {
  let threw = false;
  try {
    ResponseParser.parse('{"a":1}', { requiredFields: ['b', 'c'], context: 'test5' });
  } catch (e) {
    threw = true;
    if (!e.message.includes('missing')) throw new Error('wrong error: ' + e.message);
  }
  if (!threw) throw new Error('Should have thrown');
});

// Test 6: validateShape — correct shape
test('validateShape — correct shape', () => {
  const r = ResponseParser.validateShape(
    { name: 'Ramesh', score: 4.9, active: true, tags: [] },
    { name: 'string', score: 'number', active: 'boolean', tags: 'array' }
  );
  if (!r.valid) throw new Error('issues: ' + r.issues.join(', '));
});

// Test 7: validateShape — wrong type caught
test('validateShape — wrong type caught', () => {
  const r = ResponseParser.validateShape({ x: 'hello' }, { x: 'number' });
  if (r.valid) throw new Error('Should be invalid');
  if (!r.issues[0].includes('number')) throw new Error('wrong message: ' + r.issues[0]);
});

console.log(`\n  ${passed} passed / ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
