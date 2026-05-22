import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  contractId: { type: String, required: true, unique: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // B2B user
  partnerName: { type: String, required: true },
  contractType: {
    type: String,
    enum: ['monthly_cleaning', 'quarterly_maintenance', 'weekly_services', 'annual_package', 'custom'],
    required: true,
  },
  services: [{ name: String, frequency: String, pricePerUnit: Number }],
  locations: [{
    name: String,
    address: String,
    city: String,
  }],
  totalValue: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['draft', 'active', 'renewal_due', 'expired', 'cancelled'],
    default: 'draft',
  },
  autoRenew: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Contract', contractSchema);
