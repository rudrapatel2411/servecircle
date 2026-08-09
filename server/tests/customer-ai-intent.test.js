process.env.JWT_SECRET ||= 'test-secret';

const { classifyIntent, generalMessage, routeLeakageService } = await import('../routes/customerAi.js');

const cases = [
  ['Hello', 'GENERAL_CONVERSATION'],
  ['What can you do?', 'GENERAL_CONVERSATION'],
  ['Can you speak Hindi?', 'GENERAL_CONVERSATION'],
  ['Gujarati ma vaat kari shako?', 'GENERAL_CONVERSATION'],
  ['Thank you', 'GENERAL_CONVERSATION'],
  ['I need some help', 'GENERAL_CONVERSATION'],
  ['Okay', 'GENERAL_CONVERSATION'],
  ['Bye', 'GENERAL_CONVERSATION'],
  ['Bathroom mein pipe leak ho raha hai.', 'SERVICE_PROBLEM'],
  ['AC cooling nahi kar raha.', 'SERVICE_PROBLEM'],
  ['Fan chal nahi raha.', 'SERVICE_PROBLEM'],
  ['Tell me a joke', 'OUT_OF_SCOPE'],
];

let passed = 0;

for (const [text, expected] of cases) {
  const actual = classifyIntent({ text });
  if (actual !== expected) {
    throw new Error(`Expected "${text}" to be ${expected}, got ${actual}`);
  }
  passed += 1;
}

const followUp = classifyIntent({
  text: 'Ha, hawa aa rahi hai but thandi nahi hai.',
  conversation: [
    { role: 'user', content: 'AC cooling nahi kar raha.' },
    { role: 'assistant', content: 'Kya AC se hawa aa rahi hai lekin thandi nahi ho rahi?' },
  ],
});

if (followUp !== 'FOLLOW_UP') {
  throw new Error(`Expected follow-up answer, got ${followUp}`);
}
passed += 1;

const imageIntent = classifyIntent({ text: 'Ye problem kya hai?', hasImage: true });
if (imageIntent !== 'SERVICE_PROBLEM') {
  throw new Error(`Expected image message to be SERVICE_PROBLEM, got ${imageIntent}`);
}
passed += 1;

const hindi = generalMessage('Can you speak Hindi?');
if (hindi.includes('Service:') || hindi.includes('Confidence')) {
  throw new Error('General Hindi response leaked service-card wording.');
}
passed += 1;

const leakageCases = [
  ['water leakage hai', 'clarify', null],
  ['pani leak ho raha hai', 'clarify', null],
  ['bathroom ke pipe se pani leak ho raha hai', 'guard', 'plumbing'],
  ['tap leak kar raha hai', 'guard', 'plumbing'],
  ['kitchen sink ke neeche pani aa raha hai', 'guard', 'plumbing'],
  ['AC se water leak ho raha hai', 'guard', 'appliance'],
  ['washing machine se water leak ho raha hai', 'guard', 'appliance'],
  ['roof se water aa raha hai', 'clarify', null],
];

for (const [text, expectedMode, expectedCategory] of leakageCases) {
  const routed = routeLeakageService({ text });
  if (!routed) throw new Error(`Expected leakage route for "${text}"`);
  if (expectedMode === 'clarify' && routed.showServiceRecommendation !== false) {
    throw new Error(`Expected clarification without card for "${text}"`);
  }
  if (expectedMode === 'guard' && routed.guardOnly !== true) {
    throw new Error(`Expected AI-first guard for "${text}"`);
  }
  const category = routed.fallback?.analysis?.multimodal?.serviceResolution?.problemCategory
    || routed.analysis?.multimodal?.serviceResolution?.problemCategory;
  if (expectedCategory && category !== expectedCategory) {
    throw new Error(`Expected "${text}" to route to ${expectedCategory}, got ${category}`);
  }
  if (category === 'cleaning') {
    throw new Error(`Leakage route must not become cleaning for "${text}"`);
  }
  passed += 1;
}

const corrected = routeLeakageService({
  text: 'No, water leakage hai.',
  conversation: [{ role: 'assistant', content: 'Maybe this is a cleaning issue?' }],
});
if (!corrected || corrected.showServiceRecommendation || corrected.analysis?.multimodal?.serviceResolution?.problemCategory === 'cleaning') {
  throw new Error('Previous Cleaning -> water leakage correction must ask clarification and never become cleaning.');
}
passed += 1;

const correctedPipe = routeLeakageService({
  text: 'Bathroom ke pipe se',
  conversation: [{ role: 'user', content: 'water leakage hai' }],
});
if (correctedPipe?.fallback?.analysis?.multimodal?.serviceResolution?.problemCategory !== 'plumbing') {
  throw new Error('Leakage source follow-up should resolve to plumbing.');
}
passed += 1;

console.log(`[Customer AI Intent Tests] ${passed} passed / 0 failed`);
