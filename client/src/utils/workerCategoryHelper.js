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

/**
 * Returns canonical category name for a worker user
 */
export function getWorkerCategory(user) {
  if (!user) return 'Home Repairs';
  if (user.serviceCategory && user.serviceCategory.trim()) {
    return user.serviceCategory.trim();
  }
  const email = (user.email || '').toLowerCase().trim();
  if (WORKER_EMAIL_CATEGORY_MAP[email]) {
    return WORKER_EMAIL_CATEGORY_MAP[email];
  }
  return 'Home Repairs';
}

/**
 * Checks whether a requested service/category matches a given worker's category.
 */
export function doesServiceMatchWorker(workerCat = '', reqCat = '', reqService = '') {
  if (!workerCat) return true;
  const wCat = String(workerCat).toLowerCase().replace(/[^a-z0-9]/g, '');
  const rCat = String(reqCat || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rSvc = String(reqService || '').toLowerCase();

  // If no category requested, treat as general
  if (!rCat && !rSvc) return true;

  // Direct match on category
  if (rCat && (wCat === rCat || wCat.includes(rCat) || rCat.includes(wCat))) {
    return true;
  }

  // Keyword associations
  const KEYWORD_MAP = {
    'vehiclereservices': ['vehicle', 'car', 'bike', 'puncture', 'mechanic', 'battery', 'tyre', 'scooter'],
    'homerepairs': ['repair', 'plumb', 'electric', 'carpenter', 'ac service', 'leak', 'switch', 'tap', 'drill'],
    'cleaninghygiene': ['clean', 'sofa', 'carpet', 'pest', 'disinfect', 'sanitize', 'tank', 'wash'],
    'homeitsmartdevices': ['it', 'wifi', 'router', 'cctv', 'laptop', 'pc', 'smart tv', 'printer'],
    'carefamily': ['care', 'patient', 'senior', 'nurse', 'companion'],
    'utilitydailyhelp': ['maid', 'cook', 'laundry', 'ironing', 'errand', 'helper'],
    'learningsupport': ['tutor', 'teach', 'guitar', 'music', 'yoga', 'coach', 'fitness'],
    'propertysociety': ['property', 'security', 'guard', 'gate', 'supervisor', 'facility'],
    'seasonalfestive': ['seasonal', 'festive', 'diwali', 'holi', 'lights', 'waterproofing'],
    'furnituredecor': ['furniture', 'wardrobe', 'bed', 'sofa assembly', 'wallpaper', 'decor'],
    'gardenoutdoor': ['garden', 'lawn', 'plant', 'grass', 'mower', 'prune'],
    'packersmovers': ['packer', 'mover', 'shifting', 'relocation', 'loading', 'transit truck'],
    'healthwellness': ['health', 'wellness', 'physio', 'blood', 'sample', 'doctor'],
    'kidselderlycare': ['kid', 'nanny', 'babysit', 'child', 'infant', 'elderly'],
    'petservices': ['pet', 'dog', 'cat', 'grooming', 'vet', 'walk', 'boarding'],
    'foodkitchen': ['food', 'kitchen', 'chef', 'meal', 'tiffin', 'cake', 'catering'],
    'travelcommute': ['travel', 'commute', 'driver', 'chauffeur', 'cab', 'airport transfer', 'outstation'],
    'societymanagement': ['society', 'rwa', 'apartment', 'visitor', 'maintenance', 'gate pass'],
    'eventshub': ['event', 'party', 'wedding', 'dj', 'balloon', 'birthday', 'celebration'],
  };

  const keywords = KEYWORD_MAP[wCat];
  if (keywords) {
    for (const kw of keywords) {
      if (rSvc.includes(kw) || rCat.includes(kw)) {
        return true;
      }
    }
  }

  return false;
}

