import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Trainee worker assigned alongside senior
  trainee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  service: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'en-route', 'active', 'completed', 'cancelled', 'cant-resolve'],
    default: 'pending',
  },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String },
  // OTP system for secure job lifecycle
  startOtp: { type: String, default: null },         // Customer gives this to worker to START job
  endOtp: { type: String, default: null },           // Customer gives this to worker to COMPLETE job
  startOtpVerified: { type: Boolean, default: false },
  endOtpVerified: { type: Boolean, default: false },
  // Timestamps for each milestone
  workerReadyAt: { type: Date, default: null },      // When worker clicks "Ready to Go"
  jobStartedAt: { type: Date, default: null },
  jobCompletedAt: { type: Date, default: null },
  // Worker tier at the time of booking
  workerTier: { type: String, enum: ['rookie', 'junior', 'senior'], default: 'junior' },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  beforePhotos: [String],
  afterPhotos: [String],
  isEmergency: { type: Boolean, default: false },
  cantResolveReason: { type: String, default: null }, // Reason if cant-resolve
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
