import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    analysisId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requestId: {
      type: String,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      default: 'gemini',
      index: true,
    },
    model: {
      type: String,
      required: true,
      default: 'gemini-2.0-flash',
    },
    feature: {
      type: String,
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    language: {
      type: String,
      default: 'English',
    },
    imageHash: {
      type: String,
      default: null,
    },
    textHash: {
      type: String,
      default: null,
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    latency: {
      type: Number,
      default: 0,
    },
    validationTime: {
      type: Number,
      default: 0,
    },
    providerTime: {
      type: Number,
      default: 0,
    },
    confidence: {
      type: Number,
      default: 0,
    },
    confidenceBreakdown: {
      image: { type: Number, default: 0 },
      text: { type: Number, default: 0 },
      context: { type: Number, default: 0 },
      provider: { type: Number, default: 0 },
      validation: { type: Number, default: 0 },
    },
    imageQuality: {
      score: { type: Number, default: 100 },
      blur: { type: Number, default: 0 },
      sharpness: { type: Number, default: 100 },
      brightness: { type: Number, default: 50 },
      contrast: { type: Number, default: 50 },
      noise: { type: Number, default: 0 },
      resolution: { type: String, default: '1080p' },
      needsBetterImage: { type: Boolean, default: false },
    },
    damageSeverity: {
      type: String,
      enum: ['Minor', 'Moderate', 'Major', 'Critical', 'None', 'Unknown'],
      default: 'Moderate',
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'FAILED', 'CACHED', 'RETRIED'],
      default: 'COMPLETED',
      index: true,
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    parsedResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    validationErrors: {
      type: [String],
      default: [],
    },
    explainability: {
      decisionPath: { type: [String], default: [] },
      detectedObjects: { type: [String], default: [] },
      detectedDamage: { type: [String], default: [] },
      reasoning: { type: String, default: '' },
      evidence: { type: [String], default: [] },
      confidenceFactors: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
  },
  {
    timestamps: true,
  }
);

// Explicit compound indexes
aiAnalysisSchema.index({ createdAt: -1 });
aiAnalysisSchema.index({ feature: 1, createdAt: -1 });
aiAnalysisSchema.index({ provider: 1, status: 1 });

const AIAnalysis = mongoose.models.AIAnalysis || mongoose.model('AIAnalysis', aiAnalysisSchema);

export default AIAnalysis;
