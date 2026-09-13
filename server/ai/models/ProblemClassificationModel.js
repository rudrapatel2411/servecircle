import BasePredictionModel from './BasePredictionModel.js';
import { MODEL_NAMES, MODEL_VERSIONS } from '../../config/aiConfig.js';

const CATEGORY_PROBLEM_MAP = {
  plumbing: 'leak_or_blockage',
  electrical: 'power_or_wiring',
  cleaning: 'service_quality',
  appliance: 'equipment_failure',
  pest: 'infestation',
  default: 'general_service',
};

const URGENCY_KEYWORDS = {
  critical: ['emergency', 'urgent', 'flooding', 'fire', 'gas leak', 'no power'],
  high: ['broken', 'not working', 'leak', 'damage', 'immediate'],
  medium: ['slow', 'noisy', 'issue', 'problem', 'help'],
  low: ['question', 'inquiry', 'schedule', 'reschedule'],
};

export const modelMetadata = {
  modelName: MODEL_NAMES.PROBLEM_CLASSIFY,
  version: MODEL_VERSIONS[MODEL_NAMES.PROBLEM_CLASSIFY],
  status: 'active',
  description: 'Auto-classifies customer complaint urgency and priority.',
  inputFeatures: [
    'complaint.totalComplaints',
    'service.basePrice',
    'review.count',
  ],
  outputSchema: {
    problemType: 'string',
    urgency: 'string (low|medium|high|critical)',
    confidence: 'number (0-1)',
  },
};

class ProblemClassificationModel extends BasePredictionModel {
  constructor() {
    super(modelMetadata.modelName, modelMetadata.version);
  }

  getSupportedFeatures() {
    return ['problem-classification', 'urgency-mapping', 'category-routing'];
  }

  getMetadata() {
    return {
      ...modelMetadata,
      supportedFeatures: this.getSupportedFeatures(),
    };
  }

  validateInput(input) {
    if (!input || typeof input !== 'object') return false;
    const mapped = this._mapInput(input);
    return mapped.service !== undefined && mapped.category !== undefined;
  }

  validateOutput(output) {
    return !!(
      output
      && output.predictionId
      && output.prediction
      && typeof output.prediction.problemType === 'string'
      && typeof output.prediction.urgency === 'string'
      && typeof output.confidence === 'number'
    );
  }

  _mapInput(input) {
    const f = input?.features || input;
    return {
      service: f.service?.name ?? f.context?.serviceName ?? 'general',
      category: (f.service?.category ?? f.demand?.serviceCategory ?? 'general').toLowerCase(),
      description: (f.review?.recentComments?.join(' ') ?? '').toLowerCase(),
      totalComplaints: f.complaint?.totalComplaints ?? 0,
    };
  }

  _resolveProblemType(category) {
    return CATEGORY_PROBLEM_MAP[category] ?? CATEGORY_PROBLEM_MAP.default;
  }

  _resolveUrgency(description, totalComplaints) {
    for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
      if (keywords.some((kw) => description.includes(kw))) {
        return level;
      }
    }
    if (totalComplaints > 5) return 'critical';
    if (totalComplaints > 2) return 'high';
    return 'medium';
  }

  async predict(input) {
    this.assertValidInput(input);
    const startTime = Date.now();
    const { service, category, description, totalComplaints } = this._mapInput(input);

    const problemType = this._resolveProblemType(category);
    const urgency = this._resolveUrgency(description, totalComplaints);
    const confidence = description.length > 0 ? 0.85 : 0.7;

    const executionTime = Date.now() - startTime;
    const result = this.formatPrediction(
      {
        problemType,
        urgency,
        confidence,
        label: `Problem: ${problemType} — Urgency: ${urgency.toUpperCase()}`,
      },
      confidence,
      `Service: ${service}, Category: ${category}, Description length: ${description.length}`,
      executionTime
    );

    this.assertValidOutput(result);
    return result;
  }
}

export default new ProblemClassificationModel();
