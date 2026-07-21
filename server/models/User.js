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

  // Subscription
  subscription: { type: String, enum: ['basic', 'silver', 'gold', 'platinum'], default: 'basic' },
  walletBalance: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
