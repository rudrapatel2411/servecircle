/**
 * workerCategoryHelper.js
 * Canonical mapping between worker accounts, categories, and service detection.
 */

export const WORKER_EMAIL_CATEGORY_MAP = {
  'homerepairs.worker@gmail.com': 'Home Repairs',
  'vehicleservices.worker@gmail.com': 'Vehicle Services',
  'cleaninghygiene.worker@gmail.com': 'Cleaning & Hygiene',
  'homeit.worker@gmail.com': 'Home IT & Smart Devices',
  'carefamily.worker@gmail.com': 'Care & Family',
  'dailyhelp.worker@gmail.com': 'Utility & Daily Help',
  'learningsupport.worker@gmail.com': 'Learning & Support',
  'propertysociety.worker@gmail.com': 'Property & Society',
  'seasonalworker@gmail.com': 'Seasonal & Festive',
  'furnituredecor.worker@gmail.com': 'Furniture & Decor',
  'gardenoutdoor.worker@gmail.com': 'Garden & Outdoor',
  'packersmovers.worker@gmail.com': 'Packers & Movers',
  'healthwellness.worker@gmail.com': 'Health & Wellness',
  'familycare.worker@gmail.com': 'Kids & Elderly Care',
  'petservices.worker@gmail.com': 'Pet Services',
  'foodkitchen.worker@gmail.com': 'Food Kitchen',
  'travelcommute.worker@gmail.com': 'Travel & Commute',
  'societymanagement.worker@gmail.com': 'Society Management',
  'eventshub.worker@gmail.com': 'Events Hub',
};

export const CANONICAL_CATEGORIES = [
  'Home Repairs',
  'Vehicle Services',
  'Cleaning & Hygiene',
  'Home IT & Smart Devices',
  'Care & Family',
  'Utility & Daily Help',
  'Learning & Support',
  'Property & Society',
  'Seasonal & Festive',
  'Furniture & Decor',
  'Garden & Outdoor',
  'Packers & Movers',
  'Health & Wellness',
  'Kids & Elderly Care',
  'Pet Services',
  'Food Kitchen',
  'Travel & Commute',
  'Society Management',
  'Events Hub',
];

export const CANONICAL_CATEGORY_GROUPS = {
  'home-repairs': ['home repairs', 'homerepairs', 'home-repairs', 'electrical', 'plumbing', 'carpentry', 'appliance repair'],
  'vehicle-services': ['vehicle services', 'vehicleservices', 'vehicle-services'],
  'cleaning': ['cleaning & hygiene', 'cleaninghygiene', 'cleaning', 'cleaning-hygiene'],
  'home-it': ['home it & smart devices', 'home it & tech support', 'homeitsmartdevices', 'homeit', 'home-it', 'home-it-tech'],
  'care-family': ['care & family', 'carefamily', 'care-family'],
  'utility-daily': ['utility & daily help', 'utility & daily services', 'utilitydailyhelp', 'utilitydailyservices', 'utility-daily', 'utility-daily-help'],
  'learning-support': ['learning & support', 'learningsupport', 'learning-support'],
  'property-services': ['property & society', 'property services', 'propertysociety', 'propertyservices', 'property-services', 'property-society'],
  'festive-seasonal': ['seasonal & festive', 'festive & seasonal', 'seasonalfestive', 'festiveseasonal', 'festive-seasonal', 'seasonal-festive'],
  'furniture-decor': ['furniture & decor', 'furnituredecor', 'furniture-decor'],
  'garden-outdoor': ['garden & outdoor', 'gardenoutdoor', 'garden-outdoor'],
  'relocation': ['packers & movers', 'relocation & packers', 'packersmovers', 'relocationpackers', 'relocation', 'packers-movers'],
  'health-wellness': ['health & wellness', 'healthwellness', 'health-wellness', 'health'],
  'kids-elderly': ['kids & elderly care', 'kidselderlycare', 'kids-elderly', 'kids-elderly-care', 'family care'],
  'pet-services': ['pet services', 'petservices', 'pet-services', 'pet'],
  'food-kitchen': ['food kitchen', 'food & kitchen', 'foodkitchen', 'food-kitchen', 'food'],
  'travel-commute': ['travel & commute', 'travelcommute', 'travel-commute', 'travel'],
  'society-management': ['society management', 'societymanagement', 'society-management', 'society'],
  'events': ['events hub', 'events & celebrations', 'eventshub', 'eventscelebrations', 'events', 'events-hub'],
  'emergency': ['emergency services', 'emergency'],
};

const ALIAS_TO_GROUP = (() => {
  const map = new Map();
  for (const [group, aliases] of Object.entries(CANONICAL_CATEGORY_GROUPS)) {
    map.set(group.replace(/[^a-z0-9]/g, ''), group);
    for (const alias of aliases) {
      map.set(alias.toLowerCase().replace(/[^a-z0-9]/g, ''), group);
    }
  }
  return map;
})();

export function resolveCanonicalCategoryGroup(raw = '') {
  const clean = String(raw || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return null;
  if (ALIAS_TO_GROUP.has(clean)) return ALIAS_TO_GROUP.get(clean);
  for (const [aliasKey, group] of ALIAS_TO_GROUP.entries()) {
    if (aliasKey.length >= 5 && (clean === aliasKey || clean.includes(aliasKey) || aliasKey.includes(clean))) {
      return group;
    }
  }
  return null;
}

/**
 * Returns canonical category name for a worker user
 */
export function getWorkerCategory(user) {
  if (!user) return 'Home Repairs';
  const profileCat = user.workerProfile?.serviceCategory;
  if (user.serviceCategory && user.serviceCategory.trim()) {
    return user.serviceCategory.trim();
  }
  if (profileCat && profileCat.trim()) {
    return profileCat.trim();
  }
  const email = (user.email || '').toLowerCase().trim();
  if (WORKER_EMAIL_CATEGORY_MAP[email]) {
    return WORKER_EMAIL_CATEGORY_MAP[email];
  }
  return 'Home Repairs';
}

const SERVICE_FALLBACK_KEYWORDS = {
  'vehicle-services': ['vehicle', 'car', 'bike', 'scooter', 'puncture', 'mechanic', 'battery jumpstart', 'tyre'],
  'home-repairs': ['plumb', 'electric', 'carpenter', 'ac repair', 'ac service', 'water purifier', 'ro filter', 'leak', 'switch', 'tap', 'drill', 'fan installation', 'appliance', 'geysers'],
  'cleaning': ['deep clean', 'sofa', 'carpet', 'pest', 'disinfect', 'sanitization', 'refrigerator deep'],
  'home-it': ['wifi', 'router', 'cctv', 'laptop', 'smart tv', 'printer', 'tech support'],
  'care-family': ['care & family', 'senior citizen', 'elder care', 'patient caretaker', 'salon', 'beauty', 'makeup', 'bridal', 'home cook', 'yoga coach', 'companion'],
  'utility-daily': ['maid', 'laundry', 'ironing', 'errand', 'helper'],
  'learning-support': ['tutor', 'teach', 'guitar', 'music', 'language coach'],
  'property-services': ['property', 'security guard', 'gate supervisor', 'facility'],
  'festive-seasonal': ['seasonal', 'festive', 'diwali', 'holi', 'lights', 'waterproofing'],
  'furniture-decor': ['furniture', 'wardrobe', 'sofa assembly', 'wallpaper', 'curtain'],
  'garden-outdoor': ['garden', 'lawn', 'plant', 'grass', 'mower', 'prune'],
  'relocation': ['packer', 'mover', 'shifting', 'relocation', 'loading', 'transit truck', 'storage vault'],
  'health-wellness': ['health', 'wellness', 'physio', 'blood sample', 'doctor', 'lab test'],
  'kids-elderly': ['kid', 'nanny', 'babysit', 'child care', 'infant'],
  'pet-services': ['pet', 'dog walk', 'cat', 'grooming', 'vet', 'boarding'],
  'food-kitchen': ['food', 'kitchen', 'chef', 'meal', 'tiffin', 'cake', 'catering'],
  'travel-commute': ['travel', 'commute', 'driver', 'chauffeur', 'cab', 'airport transfer', 'outstation'],
  'society-management': ['society', 'rwa', 'apartment', 'visitor', 'gate pass'],
  'events': ['event', 'party', 'wedding', 'dj', 'balloon', 'birthday', 'celebration'],
};

/**
 * Checks whether a requested service/category matches a given worker's category.
 */
export function doesServiceMatchWorker(workerCat = '', reqCat = '', reqService = '') {
  if (!workerCat) return true;
  const wGroup = resolveCanonicalCategoryGroup(workerCat);
  const rGroup = resolveCanonicalCategoryGroup(reqCat);

  // If the booking already has an explicit canonical category, match strictly on that group.
  if (rGroup) {
    if (wGroup) return wGroup === rGroup;
    return String(workerCat).toLowerCase().trim() === String(reqCat).toLowerCase().trim();
  }

  // Fallback to service-title keywords only when category is absent or unmapped.
  const rSvc = String(reqService || '').toLowerCase();
  if (!rSvc) return !reqCat;

  const keywords = wGroup ? SERVICE_FALLBACK_KEYWORDS[wGroup] : null;
  if (keywords) {
    return keywords.some((kw) => rSvc.includes(kw));
  }

  return false;
}
