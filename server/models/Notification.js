import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['broadcast', 'personal', 'booking_update', 'promotion', 'alert', 'system'],
    default: 'personal',
  },
  targetAudience: {
    type: String,
    enum: ['all', 'customers', 'workers', 'b2b', 'specific'],
    default: 'all',
  },
  targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // for specific targeting
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who sent it
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
