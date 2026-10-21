import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getAllDemoBookings } from '../utils/demoBookingStore.js';
import { DEMO_USERS, IN_MEMORY_USERS } from '../utils/demoAuthStore.js';
import { DEMO_COMPLAINTS } from '../utils/demoDataStore.js';

const router = express.Router();

router.get(
  '/dashboard',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
      const demoBookings = getAllDemoBookings();
      const allUsers = [...DEMO_USERS, ...IN_MEMORY_USERS];

      const totalBookings = demoBookings.length;
      const activeBookings = demoBookings.filter((b) =>
        ['assigned', 'accepted', 'en-route', 'arrived', 'started', 'active'].includes(b.status)
      ).length;
      const completedBookings = demoBookings.filter((b) => b.status === 'completed').length;
      const cancelledBookings = demoBookings.filter((b) => b.status === 'cancelled').length;

      const totalCustomers = allUsers.filter((u) => u.role === 'customer').length;
      const totalWorkers = allUsers.filter((u) => u.role === 'worker').length;
      const verifiedWorkers = allUsers.filter((u) => u.role === 'worker' && u.isVerified).length;
      const pendingVerifications = totalWorkers - verifiedWorkers;
      const totalB2B = allUsers.filter((u) => u.role === 'b2b').length;

      const openComplaints = DEMO_COMPLAINTS.filter((c) =>
        ['open', 'in_progress'].includes(c.status)
      ).length;

      const totalRevenue = demoBookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + (b.amount || 0), 0);

      const topServices = [
        { _id: 'AC Service & Deep Cleaning', count: 18, revenue: 9882 },
        { _id: 'Home Deep Cleaning', count: 14, revenue: 16800 },
        { _id: 'Electrical Work', count: 12, revenue: 4200 },
        { _id: 'Plumbing Repair', count: 9, revenue: 3150 },
        { _id: 'Society Security & Guard', count: 6, revenue: 24000 },
      ];

      const monthlyRevenue = [
        { _id: '2026-01', revenue: 14200, count: 24 },
        { _id: '2026-02', revenue: 19800, count: 32 },
        { _id: '2026-03', revenue: 27500, count: 45 },
        { _id: '2026-04', revenue: 33400, count: 52 },
        { _id: '2026-05', revenue: 39600, count: 61 },
      ];

      return res.json({
        bookings: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        users: {
          customers: totalCustomers,
          workers: totalWorkers,
          verified: verifiedWorkers,
          pendingVerifications,
          b2b: totalB2B,
        },
        revenue: { total: totalRevenue || 58032, monthly: monthlyRevenue },
        topServices,
        openComplaints,
      });
    }

    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({
      status: { $in: ['assigned', 'accepted', 'en-route', 'arrived', 'started', 'active'] },
    });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const verifiedWorkers = await User.countDocuments({ role: 'worker', isVerified: true });
    const pendingVerifications = await User.countDocuments({ role: 'worker', isVerified: false });
    const totalB2B = await User.countDocuments({ role: 'b2b' });

    const openComplaints = await Complaint.countDocuments({ status: { $in: ['open', 'in_progress'] } });

    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topServices = await Booking.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      bookings: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      users: {
        customers: totalCustomers,
        workers: totalWorkers,
        verified: verifiedWorkers,
        pendingVerifications,
        b2b: totalB2B,
      },
      revenue: { total: totalRevenue, monthly: monthlyRevenue },
      topServices,
      openComplaints,
    });
  })
);

export default router;
