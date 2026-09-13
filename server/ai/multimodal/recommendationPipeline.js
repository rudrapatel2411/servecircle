/**
 * server/ai/multimodal/recommendationPipeline.js — Recommendation Pipeline
 *
 * Orchestrates all multimodal pipeline outputs into a final recommendation:
 *   Recommended Service, Required Skill, Priority, Worker Search Filters,
 *   Required Documents, Additional Questions
 *
 * NO worker ranking. No ML. No LLM. Rule-based pipeline assembly.
 */

// ─── Skill → Document requirements ───────────────────────────────────────────
const SKILL_REQUIRED_DOCUMENTS = {
  plumbing: [
    'Government-issued photo ID',
    'Plumbing trade certificate or license',
    'Liability insurance proof',
  ],
  plumbing_advanced: [
    'Government-issued photo ID',
    'Advanced plumbing certification',
    'Liability insurance proof',
    'Previous work portfolio',
  ],
  plumbing_electrical: [
    'Government-issued photo ID',
    'Combined trade certification (plumbing + electrical)',
    'Liability insurance proof',
  ],
  electrician: [
    'Government-issued photo ID',
    'Electrician license (ITI or above)',
    'Safety compliance certificate',
    'Liability insurance proof',
  ],
  electrician_advanced: [
    'Government-issued photo ID',
    'Licensed electrician certification',
    'Safety compliance certificate',
    'Liability insurance proof',
    'Previous wiring project portfolio',
  ],
  cleaning: [
    'Government-issued photo ID',
    'Police verification certificate',
  ],
  pest_control: [
    'Government-issued photo ID',
    'Pest control license',
    'Chemical handling certificate',
    'Insurance proof',
  ],
  carpenter: [
    'Government-issued photo ID',
    'Carpentry trade certificate',
  ],
  painter: [
    'Government-issued photo ID',
    'References from previous clients',
  ],
  appliance_repair: [
    'Government-issued photo ID',
    'Brand-specific service certification (if applicable)',
    'Liability insurance proof',
  ],
  ac_technician: [
    'Government-issued photo ID',
    'AC/HVAC technician certification',
    'Refrigerant handling certificate',
  ],
  locksmith: [
    'Government-issued photo ID',
    'Locksmith license',
    'Police verification certificate',
  ],
  moving_specialist: [
    'Government-issued photo ID',
    'Moving company registration',
    'Vehicle insurance',
    'Goods transit insurance',
  ],
  general_labor: [
    'Government-issued photo ID',
    'Police verification certificate',
  ],
};

// ─── Urgency → Priority mapping ───────────────────────────────────────────────
const URGENCY_TO_PRIORITY = {
  EMERGENCY: { priority: 'P0', label: 'Critical Priority',  searchRadiusKm: 20, maxWorkers: 5 },
  HIGH:      { priority: 'P1', label: 'High Priority',      searchRadiusKm: 15, maxWorkers: 5 },
  MEDIUM:    { priority: 'P2', label: 'Standard Priority',  searchRadiusKm: 10, maxWorkers: 10 },
  LOW:       { priority: 'P3', label: 'Flexible Priority',  searchRadiusKm: 8,  maxWorkers: 10 },
};

// ─── Clarifying questions per category ───────────────────────────────────────
const ADDITIONAL_QUESTIONS_MAP = {
  plumbing: [
    { id: 'PLQ_001', question: 'Is the leak currently active or has water been shut off?', type: 'single_choice', options: ['Active leak', 'Water shut off', 'Unsure'] },
    { id: 'PLQ_002', question: 'Which floor is the affected area on?', type: 'number_input' },
    { id: 'PLQ_003', question: 'Do you have access to the water main shutoff?', type: 'boolean' },
  ],
  electrical: [
    { id: 'ELQ_001', question: 'Has the main power been shut off?', type: 'boolean' },
    { id: 'ELQ_002', question: 'Are there any visible signs of burning or sparking?', type: 'boolean' },
    { id: 'ELQ_003', question: 'Which area of the property is affected?', type: 'text_input' },
    { id: 'ELQ_004', question: 'Is this a residential or commercial property?', type: 'single_choice', options: ['Residential', 'Commercial', 'Industrial'] },
  ],
  cleaning: [
    { id: 'CLQ_001', question: 'What is the approximate size of the area to clean?', type: 'single_choice', options: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Villa', 'Commercial'] },
    { id: 'CLQ_002', question: 'Do you have cleaning supplies available, or should the worker bring their own?', type: 'single_choice', options: ['I have supplies', 'Worker to bring', 'Need premium supplies'] },
    { id: 'CLQ_003', question: 'Are there any pets in the property?', type: 'boolean' },
  ],
  carpentry: [
    { id: 'CRQ_001', question: 'Do you need materials supplied by the worker?', type: 'boolean' },
    { id: 'CRQ_002', question: 'Please provide approximate dimensions if applicable.', type: 'text_input' },
    { id: 'CRQ_003', question: 'Is this a repair or a new installation?', type: 'single_choice', options: ['Repair', 'New Installation', 'Both'] },
  ],
  painting: [
    { id: 'PTQ_001', question: 'What is the total area to be painted (sq ft)?', type: 'number_input' },
    { id: 'PTQ_002', question: 'Do you have a specific color in mind?', type: 'boolean' },
    { id: 'PTQ_003', question: 'Should the worker supply paint, or will you provide it?', type: 'single_choice', options: ['Worker supplies', 'I supply', 'Need recommendation'] },
    { id: 'PTQ_004', question: 'Is this interior or exterior painting?', type: 'single_choice', options: ['Interior', 'Exterior', 'Both'] },
  ],
  appliance: [
    { id: 'APQ_001', question: 'What is the brand and model of the appliance?', type: 'text_input' },
    { id: 'APQ_002', question: 'Is the appliance still under warranty?', type: 'boolean' },
    { id: 'APQ_003', question: 'When did the issue first occur?', type: 'single_choice', options: ['Today', 'Yesterday', 'This week', 'Longer ago'] },
  ],
  security: [
    { id: 'SQE_001', question: 'Is this an emergency lockout situation?', type: 'boolean' },
    { id: 'SQE_002', question: 'Can you prove ownership/tenancy of the property?', type: 'boolean' },
    { id: 'SQE_003', question: 'What type of lock is installed?', type: 'single_choice', options: ['Standard lock', 'Deadbolt', 'Smart lock', 'Padlock', 'Unknown'] },
  ],
  moving: [
    { id: 'MVQ_001', question: 'What is the approximate volume of items to move?', type: 'single_choice', options: ['Studio/1BHK', '2 BHK', '3 BHK', '4+ BHK', 'Office'] },
    { id: 'MVQ_002', question: 'Are there any large/fragile items (piano, antiques, etc.)?', type: 'boolean' },
    { id: 'MVQ_003', question: 'Do you need packing services included?', type: 'boolean' },
    { id: 'MVQ_004', question: 'What floor are you moving from and to?', type: 'text_input' },
  ],
};

// ─── Core Recommendation Pipeline ─────────────────────────────────────────────

/**
 * Generate a final recommendation from pipeline outputs.
 *
 * @param {object} params
 * @param {object} params.unifiedContext    - UnifiedContext from contextBuilder
 * @param {object} params.problemAnalysis   - From problemAnalyzer.analyzeProblem()
 * @param {object} params.serviceResolution - From serviceResolver.resolveService()
 * @param {object} params.urgencyResult     - From urgencyAnalyzer.classifyUrgency()
 * @returns {object} Final Recommendation
 */
export function generateRecommendation({
  unifiedContext,
  problemAnalysis,
  serviceResolution,
  urgencyResult,
} = {}) {
  if (!unifiedContext || !problemAnalysis || !serviceResolution || !urgencyResult) {
    return _errorRecommendation('All pipeline outputs are required: unifiedContext, problemAnalysis, serviceResolution, urgencyResult.');
  }

  const category        = problemAnalysis.problemCategory;
  const urgencyLevel    = urgencyResult.urgencyLevel || 'MEDIUM';
  const priorityDef     = URGENCY_TO_PRIORITY[urgencyLevel] || URGENCY_TO_PRIORITY.MEDIUM;
  const skill           = serviceResolution.requiredWorkerSkill;
  const requiredDocs    = SKILL_REQUIRED_DOCUMENTS[skill] || SKILL_REQUIRED_DOCUMENTS.general_labor || [];
  const additionalQs    = ADDITIONAL_QUESTIONS_MAP[category] || [];
  const missingInfo     = problemAnalysis.missingInformation || [];

  // ── Build worker search filters ──
  const workerSearchFilters = _buildWorkerSearchFilters({
    skill,
    alternativeSkills:   serviceResolution.alternativeSkills || [],
    urgencyLevel,
    priorityDef,
    location:            unifiedContext.location,
    category,
  });

  // ── Compose recommendation ──
  const recommendation = {
    // Primary outputs
    recommendedService: {
      name:            serviceResolution.service,
      category:        serviceResolution.category,
      subCategory:     serviceResolution.subCategory,
      estimatedDurationMinutes: serviceResolution.estimatedDurationMinutes,
      estimatedDurationLabel:   serviceResolution.estimatedDurationLabel,
      priceRangeInr:   serviceResolution.priceRangeInr,
      requiresTools:   serviceResolution.requiresTools || [],
      safetyPrecautions: serviceResolution.safetyPrecautions || [],
    },
    requiredSkill: {
      primary:     skill,
      alternatives: serviceResolution.alternativeSkills || [],
    },
    priority: {
      level:           urgencyLevel,
      label:           urgencyResult.urgencyLabel,
      code:            priorityDef.priority,
      priorityLabel:   priorityDef.label,
      dispatchPriority: urgencyResult.dispatchPriority,
      slaHours:        urgencyResult.slaHours,
      slaDeadline:     urgencyResult.slaDeadline,
    },
    workerSearchFilters,
    requiredDocuments:  requiredDocs,
    additionalQuestions: additionalQs,

    // Context & quality
    confidence: {
      problemAnalysis:    problemAnalysis.confidence,
      serviceResolution:  serviceResolution.confidence,
      overall:            _computeOverallConfidence(problemAnalysis.confidence, serviceResolution.confidence),
    },
    missingInformation: missingInfo,
    alternativeServices: (serviceResolution.alternativeResolutions || []).map((r) => ({
      service:             r.service,
      subCategory:         r.subCategory,
      requiredWorkerSkill: r.requiredWorkerSkill,
    })),

    // Metadata
    contextId:       unifiedContext.contextId,
    problemCategory: category,
    generatedAt:     new Date().toISOString(),
    pipelineVersion: '1.0.0',
    status:          'GENERATED',
    note:            'Worker ranking is not included — reserved for future WorkerRanking model.',
  };

  return recommendation;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _buildWorkerSearchFilters({ skill, alternativeSkills, urgencyLevel, priorityDef, location, category }) {
  return {
    requiredSkill:     skill,
    acceptableSkills:  [skill, ...alternativeSkills],
    searchRadiusKm:    priorityDef.searchRadiusKm,
    maxWorkersToFetch: priorityDef.maxWorkers,
    city:              location?.city || null,
    coordinates:       location?.coordinates || null,
    minRating:         urgencyLevel === 'EMERGENCY' ? 0 : 3.5, // Relax for emergency
    requiresVerification: true,
    workerStatus:      ['available', 'online'],
    excludeStatuses:   ['suspended', 'blocked'],
    preferredSkillCategory: category,
    sortBy: urgencyLevel === 'EMERGENCY' ? 'distance' : 'rating',
  };
}

function _computeOverallConfidence(problemConf, serviceConf) {
  if (!problemConf || !serviceConf) return { score: 0.5, level: 'MEDIUM' };

  const combined = (problemConf.score + serviceConf.score) / 2;
  const level = combined >= 0.8 ? 'HIGH'
    : combined >= 0.5           ? 'MEDIUM'
    : combined >= 0.2           ? 'LOW'
    : 'VERY_LOW';

  return { score: Math.round(combined * 100) / 100, level };
}

function _errorRecommendation(message) {
  return {
    recommendedService:  null,
    requiredSkill:       null,
    priority:            null,
    workerSearchFilters: null,
    requiredDocuments:   [],
    additionalQuestions: [],
    confidence:          { overall: { score: 0, level: 'VERY_LOW' } },
    missingInformation:  [{ field: 'pipeline', message }],
    alternativeServices: [],
    contextId:           null,
    problemCategory:     null,
    generatedAt:         new Date().toISOString(),
    pipelineVersion:     '1.0.0',
    status:              'ERROR',
    error:               message,
  };
}
