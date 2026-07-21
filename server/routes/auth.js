import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required to start auth routes');
}

const PUBLIC_ROLES = ['customer', 'worker', 'b2b'];

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, skills, serviceCategory, city, experience, companyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedRole = role || 'customer';
    if (!PUBLIC_ROLES.includes(normalizedRole)) {
      return res.status(403).json({ message: 'This role cannot be self-registered' });
    }

    if (normalizedRole === 'b2b' && !companyName) {
      return res.status(400).json({ message: 'Company name is required for B2B registration' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

    const userData = { name, email, phone, password, role: normalizedRole };
    if (normalizedRole === 'worker') {
      userData.skills = skills || [];
      userData.serviceCategory = serviceCategory || '';
      userData.city = city || '';
      userData.experience = experience || 'Fresher';
      userData.workerStatus = 'pending_interview'; // Always starts here
    }
    if (normalizedRole === 'b2b') {
      userData.companyName = companyName;
    }

    const user = await User.create(userData);
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        workerStatus: user.workerStatus,
        subscription: user.subscription,
        walletBalance: user.walletBalance,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        workerStatus: user.workerStatus || null,
        skills: user.skills || [],
        serviceCategory: user.serviceCategory || null,
        city: user.city || null,
        experience: user.experience || null,
        completedJobs: user.completedJobs || 0,
        shadowJobsDone: user.shadowJobsDone || 0,
        rating: user.rating || 0,
        subscription: user.subscription,
        walletBalance: user.walletBalance,
        avatar: user.avatar,
        isVerified: user.isVerified,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify token (check if still valid)
router.get('/verify', protect, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      subscription: req.user.subscription,
    },
  });
});

export default router;
