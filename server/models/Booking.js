import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    customer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Trainee worker assigned alongside senior
    trainee:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    service:   { type: String, required: true },
    category:  { type: String, required: true },
    description: { type: String },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String },
    address: { type: String, required: true },
    city: { type: String, default: 'Mumbai' },


    // State machine status — ALL valid states
    status: {
      type: String,
      enum: [
        'pending',
        'assigned',
        'accepted',
        'en-route',
        'arrived',
        'started',
        'completed',
        'paid',
        'closed',
        'cancelled',
        'rejected',
      ],
      default: 'pending',
    },

    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String },

    // Trust & Safety Worker Verification before OTP
    isWorkerVerifiedBeforeOtp: { type: Boolean, default: false },
    workerVerifiedAt:          { type: Date, default: null },

    // OTP system for secure job lifecycle
    startOtp:           { type: String, default: null },
    endOtp:             { type: String, default: null },
    startOtpVerified:   { type: Boolean, default: false },
    endOtpVerified:     { type: Boolean, default: false },
    startOtpExpiresAt:  { type: Date, default: null },
    endOtpExpiresAt:    { type: Date, default: null },
    startOtpAttempts:   { type: Number, default: 0 },
    endOtpAttempts:     { type: Number, default: 0 },
    startOtpLocked:     { type: Boolean, default: false },
    endOtpLocked:       { type: Boolean, default: false },


    // State machine transition timestamps
    assignedAt:   { type: Date, default: null },
    acceptedAt:   { type: Date, default: null },
    rejectedAt:   { type: Date, default: null },
    enRouteAt:    { type: Date, default: null },
    arrivedAt:    { type: Date, default: null },
    startedAt:    { type: Date, default: null },
    completedAt:  { type: Date, default: null },
    paidAt:       { type: Date, default: null },
    closedAt:     { type: Date, default: null },
    cancelledAt:  { type: Date, default: null },

    // Legacy milestone timestamps (kept for backward compatibility)
    workerReadyAt:   { type: Date, default: null },
    jobStartedAt:    { type: Date, default: null },
    jobCompletedAt:  { type: Date, default: null },

    // Cancellation metadata
    cancelledBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    cancellationReason: { type: String, default: null },

    // Worker tier at the time of booking
    workerTier: {
      type: String,
      enum: ['rookie', 'junior', 'senior'],
      default: 'junior',
    },

    // Single overall rating (legacy — kept for backward compat)
    rating:  { type: Number, min: 1, max: 5 },
    review:  { type: String },

    // ── Structured Rating Breakdown (Phase 2) ────────────────────────────
    ratingBreakdown: {
      overall:        { type: Number, min: 1, max: 5 },
      quality:        { type: Number, min: 1, max: 5 },
      punctuality:    { type: Number, min: 1, max: 5 },
      communication:  { type: Number, min: 1, max: 5 },
      professionalism:{ type: Number, min: 1, max: 5 },
      cleanliness:    { type: Number, min: 1, max: 5 },
      valueForMoney:  { type: Number, min: 1, max: 5 },
    },

    // ── Before / After Photos with Metadata (Phase 2) ────────────────────
    beforePhotos: [String],  // legacy URL array
    afterPhotos:  [String],  // legacy URL array
    beforePhotoMetadata: [
      {
        url:        { type: String },
        capturedAt: { type: Date },
        device:     { type: String },
        fileSizeKb: { type: Number },
        // GPS — only if user explicitly granted location
        gps: {
          latitude:  { type: Number },
          longitude: { type: Number },
        },
      },
    ],
    afterPhotoMetadata: [
      {
        url:        { type: String },
        capturedAt: { type: Date },
        device:     { type: String },
        fileSizeKb: { type: Number },
        gps: {
          latitude:  { type: Number },
          longitude: { type: Number },
        },
      },
    ],

    // ── Booking Timeline (Phase 2) ────────────────────────────────────────
    // Append-only structured milestone history.
    // Never remove or overwrite entries.
    timeline: [
      {
        event:     { type: String, required: true }, // e.g. 'BOOKING_CREATED'
        actor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actorRole: { type: String },
        timestamp: { type: Date, default: Date.now },
        metadata:  { type: mongoose.Schema.Types.Mixed },
      },
    ],

    isEmergency:  { type: Boolean, default: false },
    cantResolveReason: { type: String, default: null },
    isDeleted:    { type: Boolean, default: false },
    deletedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

// Soft-delete filter
bookingSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Security: Strip plain-text OTPs from all JSON responses (Part 9)
bookingSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.startOtp;
    delete ret.endOtp;
    return ret;
  },
});

export default mongoose.model('Booking', bookingSchema);

