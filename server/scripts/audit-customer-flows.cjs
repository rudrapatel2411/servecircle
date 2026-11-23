const fs = require('fs');
const path = require('path');

function getFiles(dir, extensions = ['.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(getFiles(full, extensions));
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(full);
    }
  });
  return results;
}

const clientDir = path.resolve(__dirname, '../../client/src');
const appContent = fs.readFileSync(path.join(clientDir, 'App.jsx'), 'utf8');

// Parse routes from App.jsx
const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
const declaredRoutes = new Set();
let match;
while ((match = routeRegex.exec(appContent)) !== null) {
  declaredRoutes.add(match[1]);
}

console.log('--- DECLARED ROUTES IN App.jsx (' + declaredRoutes.size + ') ---');

const allFiles = getFiles(clientDir);
const linkRegex = /(?:navigate\(\s*[`"']\/customer\/([a-zA-Z0-9\-_/?=&]+)[`"']|to=[`"']\/customer\/([a-zA-Z0-9\-_/?=&]+)[`"']|href=[`"']\/customer\/([a-zA-Z0-9\-_/?=&]+)[`"'])/g;

const unmatched = new Map();
const matched = new Map();

allFiles.forEach(filePath => {
  const rel = path.relative(clientDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  let m;
  while ((m = linkRegex.exec(content)) !== null) {
    const rawTarget = m[1] || m[2] || m[3];
    const clean = rawTarget.split('?')[0].split('#')[0];
    
    // Check match against declared routes
    let isMatch = declaredRoutes.has(clean) || declaredRoutes.has('/customer/' + clean) || clean === '' || clean === 'dashboard';
    if (!isMatch) {
      for (const r of declaredRoutes) {
        if (r.includes(':')) {
          const pattern = '^' + r.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$';
          if (new RegExp(pattern).test(clean)) {
            isMatch = true;
            break;
          }
        }
      }
    }

    if (isMatch) {
      matched.set(clean, (matched.get(clean) || 0) + 1);
    } else {
      if (!unmatched.has(clean)) {
        unmatched.set(clean, []);
      }
      unmatched.get(clean).push(`${rel} (target: ${rawTarget})`);
    }
  }
});

console.log('\n--- UNMATCHED / BROKEN CUSTOMER TARGETS ---');
if (unmatched.size === 0) {
  console.log('✅ ALL customer route targets have valid matching routes in App.jsx!');
} else {
  for (const [target, occurrences] of unmatched.entries()) {
    console.log(`❌ Target: "/customer/${target}"`);
    occurrences.slice(0, 5).forEach(occ => console.log(`   └─ in ${occ}`));
  }
}

console.log('\n--- AUDITING ALL 8 HUBS & PREMIUM FLOWS FOR DEAD BUTTONS & LINKS ---');
const flowsToAudit = [
  'pages/customer/HomeRepairsHub.jsx',
  'pages/customer/CleaningHygieneHub.jsx',
  'pages/customer/TravelCommuteHub.jsx',
  'pages/customer/TravelPremiumFlow.jsx',
  'pages/customer/FoodKitchenHub.jsx',
  'pages/customer/FoodPremiumFlow.jsx',
  'pages/customer/PetHub.jsx',
  'pages/customer/PetPremiumFlow.jsx',
  'pages/customer/HealthWellnessHub.jsx',
  'pages/customer/HealthWellnessDemo.jsx',
  'pages/customer/SocietyManagementHub.jsx',
  'pages/customer/SocietyPremiumFlow.jsx',
  'pages/customer/RelocationHub.jsx',
  'pages/customer/RelocationPremiumFlow.jsx',
  'pages/customer/BookingFlow.jsx',
  'pages/customer/LiveTracking.jsx',
  'pages/customer/PostServiceReview.jsx',
  'pages/customer/OrderedServices.jsx'
];

flowsToAudit.forEach(flowRel => {
  const full = path.join(clientDir, flowRel);
  if (!fs.existsSync(full)) {
    console.log(`⚠️ Missing file: ${flowRel}`);
    return;
  }
  const content = fs.readFileSync(full, 'utf8');
  // Check empty onClick handlers or TODOs or empty hrefs
  const emptyClick = (content.match(/onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/g) || []).length;
  const todoCount = (content.match(/TODO/gi) || []).length;
  const hashHref = (content.match(/href=["']#["']/g) || []).length;
  
  console.log(`📄 ${flowRel}: emptyClick=${emptyClick}, TODO=${todoCount}, hashHref=${hashHref}`);
});
