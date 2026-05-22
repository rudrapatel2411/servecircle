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
  skills: [String],
  idProof: { type: String },
  isVerified: { type: Boolean, default: false },
  completedJobs: { type: Number, default: 0 },
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
