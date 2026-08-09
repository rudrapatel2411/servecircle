import 'dotenv/config';
import mongoose from 'mongoose';
import { runProblemAnalysis, AIProviderManager } from '../ai/inferenceService.js';

const TEST_CASES = [
  { label: 'English', text: 'My AC is not cooling. Need help asap.' },
  { label: 'Hindi', text: 'Mera AC cool nahi kar raha hai.' },
  { label: 'Gujarati', text: 'Maro AC thando nathi kar to.' },
  { label: 'Mixed Gujarati-English', text: 'AC is not working, hava garam aave che.' },
  { label: 'Very short text', text: 'tap leak' },
  { label: 'Very long text', text: 'I woke up this morning and noticed that the kitchen sink was completely blocked. I tried using a plunger but it did not help. Also, there is water leaking from the pipe under the sink and making a huge mess on the floor. I need someone to fix it today because I have guests coming over.' },
  { label: 'Garbage input', text: 'asdfasdfasdfasdf qwerty' }
];

async function runTests() {
  console.log('Testing Problem Analysis API Directly...\n');
  
  // Initialize AI Provider Layer manually for direct testing
  await AIProviderManager.initialize();
  
  // Also connect to Mongo so EventLogs don't error out completely 
  // (though eventService wraps in try/catch)
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle');
  } catch (err) {
    console.log('Mongo not connected, continuing anyway...');
  }
  
  let passed = 0;
  
  for (const tc of TEST_CASES) {
    console.log(`[TEST] ${tc.label} -> "${tc.text}"`);
    try {
      const response = await runProblemAnalysis({
        text: tc.text,
        actor: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
        reqCtx: { ipAddress: '127.0.0.1' }
      });

      const p = response.prediction;
      console.log(`  Success!`);
      console.log(`  Category: ${p.problemCategory} | Type: ${p.problemType} | Urgency: ${p.urgency}`);
      console.log(`  Reasoning: ${p.reasoning}`);
      console.log(`  Confidence: ${p.confidence}`);
      console.log();
      passed++;
    } catch (err) {
      console.log(`  ERROR: ${err.message}\n`);
    }
  }

  console.log('---------------------------------');
  
  // Empty test
  console.log('[TEST] Empty input -> ""');
  try {
    await runProblemAnalysis({
      text: '',
      actor: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
    });
    console.log('  FAIL: Did not catch empty input correctly.');
  } catch (err) {
    if (err.message.includes('requires text input') || err.message.includes('empty')) {
      console.log('  Success! Caught empty input.');
      passed++;
    } else {
      console.log(`  FAIL: Caught wrong error: ${err.message}`);
    }
  }

  console.log(`\nTests Passed: ${passed} / ${TEST_CASES.length + 1}`);
  process.exit(passed === TEST_CASES.length + 1 ? 0 : 1);
}

runTests();
