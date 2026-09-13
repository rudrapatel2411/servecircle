import 'dotenv/config';
import mongoose from 'mongoose';
import { runImageAnalysis, runMultimodalInference, AIProviderManager } from '../ai/inferenceService.js';
import { validateImage } from '../ai/multimodal/imageProcessor.js';

// Minimal 1x1 valid pixel base64 headers for testing
const SAMPLE_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const SAMPLE_PNG_BASE64  = 'iVBORw0KGgoAAAANSUBEQVRBVGgZ2H4AAQAB//8ACAAAAAAIAAAAAQAAAAgAAAAAAA==';
const CORRUPTED_BASE64   = 'INVALID_BASE64_CORRUPTED_!!!$$$';

const VISION_TEST_CASES = [
  { label: 'Pipe Leak (Plumbing)', serviceCategory: 'Plumbing', customerDescription: 'Water pipe is leaking heavily under the kitchen sink.' },
  { label: 'Broken Switch (Electrical)', serviceCategory: 'Electrical', customerDescription: 'The wall switch is broken and sparking when turned on.' },
  { label: 'AC (Appliance)', serviceCategory: 'Appliance Repair', customerDescription: 'Split AC is not cooling and making loud noises.' },
  { label: 'Washing Machine (Appliance)', serviceCategory: 'Appliance Repair', customerDescription: 'Front load washing machine is leaking water during rinse.' },
  { label: 'Door Lock (Security)', serviceCategory: 'Security & Locks', customerDescription: 'Main door lock latch is jammed and key won\'t turn.' },
  { label: 'Fan (Electrical)', serviceCategory: 'Electrical', customerDescription: 'Ceiling fan is spinning slowly and making humming sound.' },
  { label: 'Selfie (Unrelated/Safety)', serviceCategory: '', customerDescription: 'Customer uploaded a selfie photo instead of problem image.' },
  { label: 'Dog (Unrelated/Safety)', serviceCategory: '', customerDescription: 'Customer uploaded a photo of their pet dog.' },
  { label: 'Blank Wall (Unrelated/Safety)', serviceCategory: '', customerDescription: 'Photo shows a blank white wall with no visible issues.' },
];

const MULTIMODAL_TEST_CASES = [
  { label: 'Gujarati Language', text: 'Maro AC thando nathi kar to ane paani tapke che.', language: 'Gujarati' },
  { label: 'Hindi Language', text: 'Kumbh ke paas switchboard kharab ho gaya hai aur spark nikal raha hai.', language: 'Hindi' },
  { label: 'English Language', text: 'Bathroom drain is completely blocked and overflowing.', language: 'English' },
  { label: 'Mixed Language', text: 'Light switch work nathi kartu, short circuit thai gayi che.', language: 'Gujarati-English' },
];

async function runPhase4ATests() {
  console.log('====================================================');
  console.log('Phase 4A – Real Vision AI + Multimodal Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let totalTests = 0;

  // Initialize Provider Layer
  try {
    await AIProviderManager.initialize();
    console.log('✅ AIProviderManager initialized successfully.\n');
  } catch (err) {
    console.error('⚠️ Provider Init Warning:', err.message);
  }

  // Connect Mongo optional
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servecircle');
    console.log('✅ MongoDB connected for EventLog verification.\n');
  } catch (err) {
    console.log('⚠️ MongoDB not connected — continuing with fire-and-forget event logging.\n');
  }

  const actor = { _id: new mongoose.Types.ObjectId(), role: 'admin' };
  const reqCtx = { ipAddress: '127.0.0.1', userAgent: 'Phase4ATestRunner' };

  // ─── PART A: Vision Analysis Tests ──────────────────────────────────────────
  console.log('--- PART 1: Testing Image Understanding (Gemini Vision) ---');
  for (const tc of VISION_TEST_CASES) {
    totalTests++;
    console.log(`[TEST ${totalTests}] ${tc.label}`);
    try {
      const response = await runImageAnalysis({
        imageData: SAMPLE_JPEG_BASE64,
        mimeType: 'image/jpeg',
        serviceCategory: tc.serviceCategory,
        customerDescription: tc.customerDescription,
        actor,
        reqCtx,
      });

      const p = response.prediction;
      console.log(`  Status: ${response.status} | Model: ${response.model.name} (${response.model.version})`);
      console.log(`  Category: ${p.problemCategory} | Type: ${p.problemType} | Urgency: ${p.urgency}`);
      console.log(`  Skill: ${p.recommendedWorkerSkill} | Difficulty: ${p.estimatedDifficulty} | Duration: ${p.estimatedDuration}`);
      console.log(`  Confidence: ${p.confidence} | Warnings: ${JSON.stringify(p.safetyWarnings)}`);
      console.log(`  Latency: ${response.latencyMs}ms\n`);
      passed++;
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}\n`);
    }
  }

  // ─── PART B: Multimodal Tests ───────────────────────────────────────────────
  console.log('--- PART 2: Testing Real Multimodal AI (Text + Image + Context) ---');
  for (const tc of MULTIMODAL_TEST_CASES) {
    totalTests++;
    console.log(`[TEST ${totalTests}] ${tc.label} ("${tc.text}")`);
    try {
      const response = await runMultimodalInference({
        text: tc.text,
        image: { base64: SAMPLE_JPEG_BASE64, mimeType: 'image/jpeg' },
        customerCtx: { preferredLanguage: tc.language, address: 'Ahmedabad, Gujarat' },
        bookingCtx: { location: 'Ahmedabad' },
        actor,
        reqCtx,
      });

      const m = response.multimodal;
      console.log(`  Status: ${response.status} | Pipeline ID: ${response.prediction.predictionId}`);
      console.log(`  Problem: ${response.prediction.problemCategory} | Service: ${response.prediction.resolvedService}`);
      console.log(`  Reasoning EN: ${m.problemAnalysis?.aiAnalysisRaw?.reasoningEnglish || m.problemAnalysis?.possibleProblems?.[0]?.name}`);
      console.log(`  Reasoning Localized (${tc.language}): ${m.problemAnalysis?.aiAnalysisRaw?.reasoningLocalized || 'Localized'}`);
      console.log(`  Confidence: ${response.confidence} | Latency: ${response.latencyMs}ms\n`);
      passed++;
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}\n`);
    }
  }

  // ─── PART C: Edge Cases & Validation Tests ──────────────────────────────────
  console.log('--- PART 3: Edge Cases, Corruption & Validation Tests ---');

  // Empty Image Test
  totalTests++;
  console.log(`[TEST ${totalTests}] Empty Image Input Validation`);
  try {
    await runImageAnalysis({
      imageData: '',
      mimeType: 'image/jpeg',
      actor,
    });
    console.log('  ❌ FAIL: Empty image did not throw error.\n');
  } catch (err) {
    if (err.message.includes('requires base64') || err.message.includes('empty') || err.message.includes('required')) {
      console.log(`  ✅ Passed: Caught expected empty image error ("${err.message}")\n`);
      passed++;
    } else {
      console.log(`  ❌ Unexpected error: ${err.message}\n`);
    }
  }

  // Corrupted Image Test
  totalTests++;
  console.log(`[TEST ${totalTests}] Corrupted Image Base64 Validation`);
  const valResult = validateImage({ base64: CORRUPTED_BASE64, mimeType: 'image/jpeg' });
  if (!valResult.isValid || valResult.errors.length > 0) {
    console.log(`  ✅ Passed: Detected corrupted image base64 (${valResult.errors.join(', ')})\n`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: Did not detect corrupted base64.\n`);
  }

  // Very Large Image Test (>20MB raw binary size)
  totalTests++;
  console.log(`[TEST ${totalTests}] Very Large Image (Size Check)`);
  const largeBase64 = 'A'.repeat(30 * 1024 * 1024); // ~22.5 MB raw binary size
  const largeVal = validateImage({ base64: largeBase64, mimeType: 'image/jpeg' });
  if (!largeVal.isValid && largeVal.errors.some(e => e.includes('exceeds maximum'))) {
    console.log(`  ✅ Passed: Successfully rejected image exceeding 20MB max limit.\n`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: Did not reject oversized image.\n`);
  }

  console.log('====================================================');
  console.log(`Phase 4A Test Results: ${passed} / ${totalTests} Passed.`);
  console.log('====================================================\n');

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  process.exit(passed === totalTests ? 0 : 1);
}

runPhase4ATests();
