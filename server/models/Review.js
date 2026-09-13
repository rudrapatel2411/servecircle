import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service:  { type: String, required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String },
    reply:    { type: String }, // worker's reply
    isEdited: { type: Boolean, default: false },
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate reviews for same booking
reviewSchema.index({ booking: 1, customer: 1 }, { unique: true });
reviewSchema.index({ worker: 1, isDeleted: 1 });
reviewSchema.index({ isDeleted: 1 });

// Soft-delete filter — all standard queries skip deleted reviews
reviewSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

export default mongoose.model('Review', reviewSchema);
