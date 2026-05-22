import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  reply: { type: String }, // worker's reply
  isEdited: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent duplicate reviews for same booking
reviewSchema.index({ booking: 1, customer: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
