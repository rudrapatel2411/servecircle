/**
 * server/ai/multimodal/serviceResolver.js — Service Resolver
 *
 * Maps a problem analysis result to:
 *   service → category → subCategory → requiredWorkerSkill → estimatedDuration (placeholder)
 *
 * Rule-based mapping. No ML. No LLM.
 */

// ─── Service Resolution Map ───────────────────────────────────────────────────
// Structure: problemCategory → problemId → ServiceResolution

const SERVICE_RESOLUTION_MAP = {
  plumbing: {
    _default: {
      service:             'Plumbing',
      category:            'Home Repair',
      subCategory:         'Plumbing',
      requiredWorkerSkill: 'plumbing',
      alternativeSkills:   [],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   '1 hour',
      priceRangeInr:       { min: 300,  max: 1500, currency: 'INR' },
      requiresTools:       ['pipe wrench', 'plumber\'s tape', 'sealant'],
      safetyPrecautions:   [],
    },
    PLMB_001: {
      service:             'Pipe Leak Repair',
      category:            'Home Repair',
      subCategory:         'Plumbing - Leak Fix',
      requiredWorkerSkill: 'plumbing',
      alternativeSkills:   [],
      estimatedDurationMinutes: 90,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 400,  max: 2000, currency: 'INR' },
      requiresTools:       ['pipe wrench', 'replacement pipes', 'sealant'],
      safetyPrecautions:   ['Turn off main water supply before service'],
    },
    PLMB_002: {
      service:             'Drain Unblocking',
      category:            'Home Repair',
      subCategory:         'Plumbing - Drain',
      requiredWorkerSkill: 'plumbing',
      alternativeSkills:   [],
      estimatedDurationMinutes: 45,
      estimatedDurationLabel:   '45 minutes',
      priceRangeInr:       { min: 300,  max: 800,  currency: 'INR' },
      requiresTools:       ['drain snake', 'plunger', 'chemical cleaner'],
      safetyPrecautions:   [],
    },
    PLMB_003: {
      service:             'Toilet Repair',
      category:            'Home Repair',
      subCategory:         'Plumbing - Toilet',
      requiredWorkerSkill: 'plumbing',
      alternativeSkills:   [],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   '1 hour',
      priceRangeInr:       { min: 350,  max: 1200, currency: 'INR' },
      requiresTools:       ['pipe wrench', 'replacement parts'],
      safetyPrecautions:   [],
    },
    PLMB_004: {
      service:             'Tap/Faucet Repair',
      category:            'Home Repair',
      subCategory:         'Plumbing - Tap',
      requiredWorkerSkill: 'plumbing',
      alternativeSkills:   [],
      estimatedDurationMinutes: 30,
      estimatedDurationLabel:   '30 minutes',
      priceRangeInr:       { min: 200,  max: 700,  currency: 'INR' },
      requiresTools:       ['spanner', 'replacement washers'],
      safetyPrecautions:   [],
    },
    PLMB_005: {
      service:             'Geyser Repair',
      category:            'Home Repair',
      subCategory:         'Appliance - Geyser',
      requiredWorkerSkill: 'plumbing_electrical',
      alternativeSkills:   ['appliance_repair'],
      estimatedDurationMinutes: 120,
      estimatedDurationLabel:   '2 hours',
      priceRangeInr:       { min: 500,  max: 2500, currency: 'INR' },
      requiresTools:       ['multimeter', 'pipe wrench'],
      safetyPrecautions:   ['Turn off power and water before service'],
    },
    PLMB_006: {
      service:             'Water Pressure Fix',
      category:            'Home Repair',
      subCategory:         'Plumbing - Pressure',
      requiredWorkerSkill: 'plumbing',
      alternativeSkills:   [],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   '1 hour',
      priceRangeInr:       { min: 300,  max: 1000, currency: 'INR' },
      requiresTools:       ['pressure gauge', 'pipe fittings'],
      safetyPrecautions:   [],
    },
    PLMB_007: {
      service:             'Sewage Repair',
      category:            'Home Repair',
      subCategory:         'Plumbing - Sewage',
      requiredWorkerSkill: 'plumbing_advanced',
      alternativeSkills:   ['plumbing'],
      estimatedDurationMinutes: 180,
      estimatedDurationLabel:   '2-4 hours',
      priceRangeInr:       { min: 800,  max: 4000, currency: 'INR' },
      requiresTools:       ['drain rod', 'high-pressure jet'],
      safetyPrecautions:   ['Protective gear required'],
    },
  },

  electrical: {
    _default: {
      service:             'Electrical Work',
      category:            'Home Repair',
      subCategory:         'Electrical',
      requiredWorkerSkill: 'electrician',
      alternativeSkills:   [],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   '1 hour',
      priceRangeInr:       { min: 300,  max: 1500, currency: 'INR' },
      requiresTools:       ['multimeter', 'insulated screwdrivers', 'wire stripper'],
      safetyPrecautions:   ['Turn off main power before service'],
    },
    ELEC_001: {
      service:             'Power Restoration',
      category:            'Home Repair',
      subCategory:         'Electrical - Power',
      requiredWorkerSkill: 'electrician',
      alternativeSkills:   [],
      estimatedDurationMinutes: 90,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 400,  max: 2000, currency: 'INR' },
      requiresTools:       ['multimeter', 'circuit tester'],
      safetyPrecautions:   ['Do not use electrical equipment until fixed'],
    },
    ELEC_002: {
      service:             'Short Circuit Fix',
      category:            'Home Repair',
      subCategory:         'Electrical - Circuit',
      requiredWorkerSkill: 'electrician',
      alternativeSkills:   [],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   '1 hour',
      priceRangeInr:       { min: 400,  max: 1800, currency: 'INR' },
      requiresTools:       ['circuit tester', 'fuse replacements'],
      safetyPrecautions:   ['HIGH RISK — Turn off main supply. Do not touch live wires'],
    },
    ELEC_003: {
      service:             'Outlet/Switch Repair',
      category:            'Home Repair',
      subCategory:         'Electrical - Socket',
      requiredWorkerSkill: 'electrician',
      alternativeSkills:   [],
      estimatedDurationMinutes: 30,
      estimatedDurationLabel:   '30 minutes',
      priceRangeInr:       { min: 200,  max: 800,  currency: 'INR' },
      requiresTools:       ['screwdrivers', 'replacement outlets'],
      safetyPrecautions:   ['Turn off circuit breaker'],
    },
    ELEC_004: {
      service:             'Wiring Repair',
      category:            'Home Repair',
      subCategory:         'Electrical - Wiring',
      requiredWorkerSkill: 'electrician_advanced',
      alternativeSkills:   ['electrician'],
      estimatedDurationMinutes: 120,
      estimatedDurationLabel:   '2-4 hours',
      priceRangeInr:       { min: 800,  max: 5000, currency: 'INR' },
      requiresTools:       ['wire stripper', 'insulation tape', 'conduit'],
      safetyPrecautions:   ['HIGH RISK — Licensed electrician required'],
    },
    ELEC_005: {
      service:             'Light Fixture Repair',
      category:            'Home Repair',
      subCategory:         'Electrical - Lighting',
      requiredWorkerSkill: 'electrician',
      alternativeSkills:   [],
      estimatedDurationMinutes: 30,
      estimatedDurationLabel:   '30 minutes',
      priceRangeInr:       { min: 150,  max: 600,  currency: 'INR' },
      requiresTools:       ['replacement bulbs', 'wire connectors'],
      safetyPrecautions:   [],
    },
    ELEC_006: {
      service:             'MCB/Switchboard Service',
      category:            'Home Repair',
      subCategory:         'Electrical - MCB',
      requiredWorkerSkill: 'electrician_advanced',
      alternativeSkills:   ['electrician'],
      estimatedDurationMinutes: 90,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 500,  max: 3000, currency: 'INR' },
      requiresTools:       ['multimeter', 'mcb units'],
      safetyPrecautions:   ['Licensed electrician required'],
    },
  },

  cleaning: {
    _default: {
      service:             'Home Cleaning',
      category:            'Cleaning',
      subCategory:         'General Cleaning',
      requiredWorkerSkill: 'cleaning',
      alternativeSkills:   [],
      estimatedDurationMinutes: 120,
      estimatedDurationLabel:   '2-3 hours',
      priceRangeInr:       { min: 500,  max: 2000, currency: 'INR' },
      requiresTools:       ['mop', 'vacuum', 'cleaning agents'],
      safetyPrecautions:   [],
    },
    CLNG_006: {
      service:             'Pest Control',
      category:            'Cleaning',
      subCategory:         'Pest Control',
      requiredWorkerSkill: 'pest_control',
      alternativeSkills:   [],
      estimatedDurationMinutes: 90,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 800,  max: 3000, currency: 'INR' },
      requiresTools:       ['sprayer', 'pesticides', 'protective gear'],
      safetyPrecautions:   ['Keep pets and children away during treatment'],
    },
  },

  carpentry: {
    _default: {
      service:             'Carpentry Work',
      category:            'Home Repair',
      subCategory:         'Carpentry',
      requiredWorkerSkill: 'carpenter',
      alternativeSkills:   [],
      estimatedDurationMinutes: 90,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 400,  max: 2500, currency: 'INR' },
      requiresTools:       ['saw', 'drill', 'hammer', 'nails', 'screws'],
      safetyPrecautions:   [],
    },
  },

  painting: {
    _default: {
      service:             'Painting',
      category:            'Home Improvement',
      subCategory:         'Painting',
      requiredWorkerSkill: 'painter',
      alternativeSkills:   [],
      estimatedDurationMinutes: 480,
      estimatedDurationLabel:   'Half to full day',
      priceRangeInr:       { min: 1500, max: 15000, currency: 'INR' },
      requiresTools:       ['brushes', 'rollers', 'paint trays', 'primer', 'paint'],
      safetyPrecautions:   ['Ensure ventilation'],
    },
  },

  appliance: {
    _default: {
      service:             'Appliance Repair',
      category:            'Home Repair',
      subCategory:         'Appliance',
      requiredWorkerSkill: 'appliance_repair',
      alternativeSkills:   [],
      estimatedDurationMinutes: 90,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 400,  max: 3000, currency: 'INR' },
      requiresTools:       ['multimeter', 'diagnostic tools'],
      safetyPrecautions:   ['Unplug appliance before service'],
    },
    APPL_001: {
      service:             'AC Repair & Servicing',
      category:            'Home Repair',
      subCategory:         'Appliance - AC',
      requiredWorkerSkill: 'ac_technician',
      alternativeSkills:   ['appliance_repair'],
      estimatedDurationMinutes: 90,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 500,  max: 3500, currency: 'INR' },
      requiresTools:       ['refrigerant gauge', 'vacuum pump'],
      safetyPrecautions:   ['Handle refrigerant with care'],
    },
  },

  security: {
    _default: {
      service:             'Locksmith Service',
      category:            'Security',
      subCategory:         'Lock & Key',
      requiredWorkerSkill: 'locksmith',
      alternativeSkills:   [],
      estimatedDurationMinutes: 45,
      estimatedDurationLabel:   '30-60 minutes',
      priceRangeInr:       { min: 300,  max: 1500, currency: 'INR' },
      requiresTools:       ['lock picks', 'key cutter'],
      safetyPrecautions:   ['Identity verification required before service'],
    },
  },

  moving: {
    _default: {
      service:             'Moving & Relocation',
      category:            'Moving',
      subCategory:         'Home Shifting',
      requiredWorkerSkill: 'moving_specialist',
      alternativeSkills:   ['general_labor'],
      estimatedDurationMinutes: 480,
      estimatedDurationLabel:   'Half to full day',
      priceRangeInr:       { min: 2000, max: 20000, currency: 'INR' },
      requiresTools:       ['moving truck', 'packing materials', 'dolly'],
      safetyPrecautions:   ['Handle fragile items with care'],
      targetHubRoute:      '/customer/relocation',
    },
  },

  travel: {
    _default: {
      service:             'Driver & Chauffeur Service',
      category:            'Travel & Commute',
      subCategory:         'Outstation & Airport Driver',
      requiredWorkerSkill: 'driver',
      alternativeSkills:   ['chauffeur'],
      estimatedDurationMinutes: 120,
      estimatedDurationLabel:   'Per trip / Per day',
      priceRangeInr:       { min: 799,  max: 2500, currency: 'INR' },
      requiresTools:       ['valid driving license', 'gps navigation'],
      safetyPrecautions:   ['Background verified driver with valid DL'],
      targetHubRoute:      '/customer/travel-commute',
    },
  },

  food: {
    _default: {
      service:             'Home Cook & Catering',
      category:            'Food & Kitchen',
      subCategory:         'Personal Chef',
      requiredWorkerSkill: 'cook',
      alternativeSkills:   ['chef'],
      estimatedDurationMinutes: 120,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 350,  max: 1500, currency: 'INR' },
      requiresTools:       ['kitchen aprons', 'chef knives'],
      safetyPrecautions:   ['Hygienic cooking practices'],
      targetHubRoute:      '/customer/food-kitchen',
    },
  },

  pet: {
    _default: {
      service:             'Pet Care & Grooming',
      category:            'Pet Services',
      subCategory:         'Grooming & Vet Visit',
      requiredWorkerSkill: 'pet_groomer',
      alternativeSkills:   ['vet_doctor', 'dog_walker'],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   '1 hour',
      priceRangeInr:       { min: 499,  max: 1999, currency: 'INR' },
      requiresTools:       ['pet shampoo', 'trimmer', 'leash'],
      safetyPrecautions:   ['Gentle handling of pets'],
      targetHubRoute:      '/customer/pet-services',
    },
  },

  health: {
    _default: {
      service:             'Home Nursing & Wellness',
      category:            'Health & Wellness',
      subCategory:         'Patient Care & Physio',
      requiredWorkerSkill: 'nurse',
      alternativeSkills:   ['physiotherapist', 'doctor'],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   '1 hour',
      priceRangeInr:       { min: 600,  max: 2500, currency: 'INR' },
      requiresTools:       ['bp monitor', 'first aid kit'],
      safetyPrecautions:   ['Certified healthcare professional'],
      targetHubRoute:      '/customer/health-wellness',
    },
  },

  society: {
    _default: {
      service:             'Society Management & Security',
      category:            'Society Management',
      subCategory:         'Maintenance & Gate Guard',
      requiredWorkerSkill: 'security_guard',
      alternativeSkills:   ['society_manager'],
      estimatedDurationMinutes: 480,
      estimatedDurationLabel:   'Full Shift',
      priceRangeInr:       { min: 1000, max: 15000, currency: 'INR' },
      requiresTools:       ['visitor register', 'walkie talkie'],
      safetyPrecautions:   ['Verified security personnel'],
      targetHubRoute:      '/customer/society-management',
    },
  },

  events: {
    _default: {
      service:             'Event Planning & Decor',
      category:            'Events & Celebrations',
      subCategory:         'Birthday & Party Decor',
      requiredWorkerSkill: 'event_planner',
      alternativeSkills:   ['decorator', 'dj'],
      estimatedDurationMinutes: 240,
      estimatedDurationLabel:   '3-5 hours',
      priceRangeInr:       { min: 2500, max: 25000, currency: 'INR' },
      requiresTools:       ['decor balloons', 'sound equipment'],
      safetyPrecautions:   ['Electrical safety for lighting and sound'],
      targetHubRoute:      '/customer/events',
    },
  },

  vehicle: {
    _default: {
      service:             'Vehicle Care & Repair',
      category:            'Vehicle Services',
      subCategory:         'Car Wash & Mechanic',
      requiredWorkerSkill: 'car_detailer',
      alternativeSkills:   ['auto_mechanic'],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   '1-2 hours',
      priceRangeInr:       { min: 299,  max: 1800, currency: 'INR' },
      requiresTools:       ['pressure washer', 'mechanic toolkit'],
      safetyPrecautions:   ['Use eco-friendly shampoo and genuine spare parts'],
      targetHubRoute:      '/customer/services/vehicle-services',
    },
  },

  emergency: {
    _default: {
      service:             'Emergency SOS Repair',
      category:            'Emergency',
      subCategory:         'Urgent Breakdown',
      requiredWorkerSkill: 'emergency_technician',
      alternativeSkills:   [],
      estimatedDurationMinutes: 45,
      estimatedDurationLabel:   'Immediate response',
      priceRangeInr:       { min: 500,  max: 3000, currency: 'INR' },
      requiresTools:       ['emergency toolkit'],
      safetyPrecautions:   ['Priority dispatch within 30 mins'],
      targetHubRoute:      '/customer/emergency',
    },
  },
};

// ─── Core Resolver ────────────────────────────────────────────────────────────

/**
 * Resolve service details from a problem analysis result.
 *
 * @param {object} problemAnalysis - Output of problemAnalyzer.analyzeProblem()
 * @returns {object} Service Resolution result
 */
export function resolveService(problemAnalysis) {
  if (!problemAnalysis || typeof problemAnalysis !== 'object') {
    return _errorResolution('Invalid or missing problem analysis.');
  }

  const { problemCategory, possibleProblems, confidence, aiAnalysisRaw } = problemAnalysis;

  if (!problemCategory || !SERVICE_RESOLUTION_MAP[problemCategory]) {
    return {
      contextId:        problemAnalysis.contextId,
      resolved:         false,
      service:          aiAnalysisRaw?.serviceCategory || 'General Service',
      category:         'General Service',
      subCategory:      'General Inspection',
      requiredWorkerSkill: aiAnalysisRaw?.recommendedWorkerSkill || 'General Technician',
      alternativeSkills:   [],
      estimatedDurationMinutes: 60,
      estimatedDurationLabel:   aiAnalysisRaw?.estimatedDuration || '1-2 hours',
      priceRangeInr:    { min: 300, max: 1500, currency: 'INR' },
      requiresTools:    [],
      safetyPrecautions: aiAnalysisRaw?.safetyWarnings || [],
      confidence,
      resolvedAt:       new Date().toISOString(),
      status:           'UNRESOLVED',
      note:             'No exact taxonomy match for category, returned fallback service.',
    };
  }

  const categoryMap = SERVICE_RESOLUTION_MAP[problemCategory];

  // Find best matching resolution (top matched problem)
  const topProblem = possibleProblems?.[0];
  const resolution = (topProblem && categoryMap[topProblem.id])
    ? categoryMap[topProblem.id]
    : categoryMap._default;

  // Collect all possible service options (for secondary problems)
  const alternativeResolutions = (possibleProblems || [])
    .slice(1, 4) // up to 3 alternatives
    .map((p) => categoryMap[p.id] || null)
    .filter(Boolean)
    .map((r) => ({
      service:             r.service,
      subCategory:         r.subCategory,
      requiredWorkerSkill: r.requiredWorkerSkill,
    }));

  const requiredWorkerSkill = aiAnalysisRaw?.recommendedWorkerSkill || resolution.requiredWorkerSkill;
  const estimatedDurationLabel = aiAnalysisRaw?.estimatedDuration || resolution.estimatedDurationLabel;
  const combinedSafety = Array.from(new Set([...(resolution.safetyPrecautions || []), ...(aiAnalysisRaw?.safetyWarnings || [])]));

  return {
    contextId:           problemAnalysis.contextId,
    resolved:            true,
    service:             resolution.service,
    category:            resolution.category,
    subCategory:         resolution.subCategory,
    requiredWorkerSkill,
    alternativeSkills:   resolution.alternativeSkills || [],
    estimatedDurationMinutes: resolution.estimatedDurationMinutes,
    estimatedDurationLabel,
    priceRangeInr:       resolution.priceRangeInr,
    requiresTools:       resolution.requiresTools || [],
    safetyPrecautions:   combinedSafety,
    alternativeResolutions,
    targetHubRoute:      resolution.targetHubRoute || '/customer/services',
    problemCategory,
    primaryProblem:      topProblem || null,
    confidence,
    resolvedAt:          new Date().toISOString(),
    status:              'RESOLVED',
  };
}

/**
 * Bulk resolve from multiple problem categories.
 *
 * @param {string[]} categories
 * @returns {object[]} Array of resolution stubs
 */
export function resolveByCategories(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.map((cat) => {
    const categoryMap = SERVICE_RESOLUTION_MAP[cat];
    if (!categoryMap) return { category: cat, resolved: false };
    const def = categoryMap._default;
    return {
      category:            cat,
      resolved:            true,
      service:             def.service,
      subCategory:         def.subCategory,
      requiredWorkerSkill: def.requiredWorkerSkill,
      estimatedDurationLabel: def.estimatedDurationLabel,
      priceRangeInr:       def.priceRangeInr,
    };
  });
}

/**
 * Get full taxonomy of supported services.
 * @returns {object[]}
 */
export function getSupportedServices() {
  return Object.entries(SERVICE_RESOLUTION_MAP).map(([category, map]) => ({
    category,
    defaultService:      map._default?.service,
    defaultSubCategory:  map._default?.subCategory,
    requiredWorkerSkill: map._default?.requiredWorkerSkill,
    specificProblems:    Object.keys(map).filter((k) => k !== '_default'),
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _errorResolution(message) {
  return {
    contextId:           null,
    resolved:            false,
    service:             null,
    category:            null,
    subCategory:         null,
    requiredWorkerSkill: null,
    alternativeSkills:   [],
    estimatedDurationMinutes: null,
    estimatedDurationLabel:   null,
    priceRangeInr:       null,
    requiresTools:       [],
    safetyPrecautions:   [],
    confidence:          { score: 0, level: 'VERY_LOW' },
    resolvedAt:          new Date().toISOString(),
    status:              'ERROR',
    error:               message,
  };
}
