import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['ngo', 'government', 'corporate', 'society', 'other'], required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  description: { type: String },
  website: { type: String },
  address: { type: String },
  city: { type: String },
  partnershipType: {
    type: String,
    enum: ['training', 'employment', 'service_provider', 'bulk_client', 'social_impact'],
    default: 'service_provider',
  },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  startDate: { type: Date },
  logo: { type: String },
  linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // if they have a B2B account
}, { timestamps: true });

export default mongoose.model('Partner', partnerSchema);
