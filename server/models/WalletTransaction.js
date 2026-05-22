import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['topup', 'payment', 'refund', 'earning', 'withdrawal', 'bonus'],
    required: true,
  },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: { type: String, required: true },
  reference: { type: String }, // booking ID, coupon code, etc.
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  paymentMethod: { type: String }, // UPI, card, bank for topups
}, { timestamps: true });

walletTransactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('WalletTransaction', walletTransactionSchema);
