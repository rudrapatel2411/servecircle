import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'worker', 'admin', 'b2b'], default: 'customer' },
  avatar: { type: String },

  // Worker-specific
  skills: [String],              // e.g. ['AC Repair', 'Electrician']
  serviceCategory: { type: String }, // Primary category e.g. 'Home Repairs'
  idProof: { type: String },
  city: { type: String },
  experience: { type: String },  // e.g. 'Fresher', '1-2 Years', '3+ Years'
  
  // Worker onboarding status (our plan's offline verification flow)
  workerStatus: {
    type: String,
    enum: [
      'pending_interview', // Registered, waiting to visit office
      'interview_done',    // Visited office, interview completed, waiting admin approval
      'approved_rookie',   // Approved - must shadow a senior for first 15 jobs
      'approved_junior',   // Passed rookie stage, can take solo basic jobs
      'approved_senior',   // 50+ jobs, top tier, can mentor rookies
      'rejected',          // Application rejected
    ],
    default: 'pending_interview',
  },
  workerAdminNote: { type: String }, // Admin note on approval/rejection

  isVerified: { type: Boolean, default: false }, // Aadhar/KYC verified
  completedJobs: { type: Number, default: 0 },
  shadowJobsDone: { type: Number, default: 0 }, // Shadow jobs completed as rookie
  rating: { type: Number, default: 0 },
  isProBadge: { type: Boolean, default: false },
  earnings: { type: Number, default: 0 },

  // B2B-specific
  companyName: { type: String },
  locations: [{ name: String, address: String }],

  // Trust & Safety Worker Verification fields
  workerIdCode: { type: String, index: { sparse: true } },
  qrToken: { type: String, index: { sparse: true } },
  qrActive: { type: Boolean, default: true },
  qrGeneratedAt: { type: Date, default: null },
  certificates: [String],
  languages: [String],

  // Subscription
  subscription: { type: String, enum: ['basic', 'silver', 'gold', 'platinum'], default: 'basic' },
  walletBalance: { type: Number, default: 0 },

  // New fields for core foundation
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined,
    },
  },

  availability: [{
    day: { type: String }, // e.g., 'Monday'
    startTime: { type: String }, // '09:00'
    endTime: { type: String },   // '17:00'
  }],
  lastAssignedAt: { type: Date, default: null },
  isDeleted:  { type: Boolean, default: false },
  deletedAt:  { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1, isVerified: 1, workerStatus: 1, serviceCategory: 1 });
userSchema.index({ isDeleted: 1 });


// Soft‑delete filter for queries
userSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
