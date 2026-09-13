import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    serviceId: { type: String, trim: true, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true },
    description: { type: String, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    estimatedDuration: { type: Number, default: 60 }, // minutes
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: '🔧' },
    image: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    serviceRadius: { type: Number, default: 20 }, // km
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for high performance queries
serviceSchema.index({ category: 1 });
serviceSchema.index({ subCategory: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { weights: { name: 10, tags: 5, description: 1 } }
);

// Soft-delete pre-find hook
serviceSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

export default mongoose.model('Service', serviceSchema);
