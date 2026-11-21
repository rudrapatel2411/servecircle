import bcrypt from 'bcryptjs';

export const DEMO_USERS = [
  {
    _id: '6a5f4c90437c4810f45fe0e9',
    name: 'Rudra Shah',
    email: 'rudra@test.com',
    password: 'test123',
    phone: '9876543210',
    role: 'customer',
    subscription: 'gold',
    walletBalance: 2450,
    avatar: '',
  },
  {
    _id: '6a5f4c90437c4810f45fe0ea',
    name: 'Priya Desai',
    email: 'priya@test.com',
    password: 'test123',
    phone: '9876543211',
    role: 'customer',
    subscription: 'silver',
    walletBalance: 800,
    avatar: '',
  },
  {
    _id: '6a5f4c90437c4810f45fe0eb',
    name: 'Ramesh Kumar',
    email: 'ramesh@test.com',
    password: 'test123',
    phone: '9876500001',
    role: 'worker',
    skills: ['Electrician', 'AC Repair & Service'],
    serviceCategory: 'Home Repairs',
    workerStatus: 'approved_senior',
    isVerified: true,
    avatar: '',
  },
  {
    _id: '6a5f4c90437c4810f45fe0e7',
    name: 'Admin',
    email: 'admin@servecircle.in',
    password: 'admin123',
    phone: '9999900000',
    role: 'admin',
    isVerified: true,
    avatar: '',
  },
  {
    _id: '6a5f4c90437c4810f45fe0ee',
    name: 'Green Valley Manager',
    email: 'gv@test.com',
    password: 'test123',
    phone: '9876600001',
    role: 'b2b',
    companyName: 'Green Valley Society',
    avatar: '',
  },
];

export const IN_MEMORY_USERS = [];

export function findFallbackUserByEmail(email = '') {
  if (!email) return null;
  const normEmail = String(email).toLowerCase().trim();
  const demo = DEMO_USERS.find((u) => u.email.toLowerCase() === normEmail);
  if (demo) return demo;
  return IN_MEMORY_USERS.find((u) => u.email.toLowerCase() === normEmail) || null;
}

export function findFallbackUserById(id) {
  if (!id) return null;
  const strId = String(id);
  const demo = DEMO_USERS.find((u) => String(u._id) === strId);
  if (demo) return demo;
  return IN_MEMORY_USERS.find((u) => String(u._id) === strId) || null;
}

export function addFallbackUser(userData) {
  IN_MEMORY_USERS.push(userData);
  return userData;
}

export async function verifyPassword(user, candidatePassword) {
  if (!user || !candidatePassword) return false;
  if (typeof user.comparePassword === 'function') {
    return await user.comparePassword(candidatePassword);
  }
  if (user.password === candidatePassword) {
    return true;
  }
  try {
    return await bcrypt.compare(candidatePassword, user.password);
  } catch {
    return false;
  }
}
