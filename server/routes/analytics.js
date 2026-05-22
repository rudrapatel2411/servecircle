import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const verifiedWorkers = await User.countDocuments({ role: 'worker', isVerified: true });
    const pendingVerifications = await User.countDocuments({ role: 'worker', isVerified: false });
    const totalB2B = await User.countDocuments({ role: 'b2b' });

    const openComplaints = await Complaint.countDocuments({ status: { $in: ['open', 'in_progress'] } });

    // Revenue calculation from completed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Top services
    const topServices = await Booking.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      bookings: { total: totalBookings, active: activeBookings, completed: completedBookings, cancelled: cancelledBookings },
      users: { customers: totalCustomers, workers: totalWorkers, verified: verifiedWorkers, pendingVerifications, b2b: totalB2B },
      revenue: { total: totalRevenue, monthly: monthlyRevenue },
      topServices,
      openComplaints,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
