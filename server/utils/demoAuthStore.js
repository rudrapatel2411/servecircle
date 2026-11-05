import bcrypt from 'bcryptjs';

/**
 * demoAuthStore.js
 *
 * Fixed accounts for all 4 panels:
 * - 5 Customers (password: customer123)
 * - 1 Admin (password: Admin@123)
 * - 1 B2B (password: B2B@123)
 * - 19 Service Workers (password: worker123)
 */

export const DEMO_USERS = [
  // ── 5 Customers (Password: customer123) ───────────────────────────
  {
    _id: '6a5f4c90437c4810f45fe001',
    name: 'Rahul Shah',
    email: 'rahul.shah@gmail.com',
    password: 'customer123',
    phone: '9876543210',
    role: 'customer',
    subscription: 'gold',
    walletBalance: 2450,
  },
  {
    _id: '6a5f4c90437c4810f45fe002',
    name: 'Priya Patel',
    email: 'priya.patel@gmail.com',
    password: 'customer123',
    phone: '9876543211',
    role: 'customer',
    subscription: 'silver',
    walletBalance: 1800,
  },
  {
    _id: '6a5f4c90437c4810f45fe003',
    name: 'Amit Mehta',
    email: 'amit.mehta@gmail.com',
    password: 'customer123',
    phone: '9876543212',
    role: 'customer',
    subscription: 'gold',
    walletBalance: 3200,
  },
  {
    _id: '6a5f4c90437c4810f45fe004',
    name: 'Neha Desai',
    email: 'neha.desai@gmail.com',
    password: 'customer123',
    phone: '9876543213',
    role: 'customer',
    subscription: 'basic',
    walletBalance: 1500,
  },
  {
    _id: '6a5f4c90437c4810f45fe005',
    name: 'Krunal Joshi',
    email: 'krunal.joshi@gmail.com',
    password: 'customer123',
    phone: '9876543214',
    role: 'customer',
    subscription: 'gold',
    walletBalance: 2900,
  },

  // ── Admin (Password: Admin@123) ───────────────────────────────────
  {
    _id: '6a5f4c90437c4810f45fe0e7',
    name: 'Admin System',
    email: 'admin2@gmail.com',
    password: 'Admin@123',
    phone: '9999900000',
    role: 'admin',
    isVerified: true,
  },

  // ── B2B Panel (Password: B2B@123) ────────────────────────────────
  {
    _id: '6a5f4c90437c4810f45fe0ee',
    name: 'Green Valley Manager',
    email: 'b2b@gmail.com',
    password: 'B2B@123',
    phone: '9876600001',
    role: 'b2b',
    companyName: 'Green Valley Society',
  },

  // ── 19 Service Workers (Password: worker123) ─────────────────────
  {
    _id: '6a5f4c90437c4810f45fe011',
    name: 'Home Repairs Pro',
    email: 'homerepairs.worker@gmail.com',
    password: 'worker123',
    phone: '9876500001',
    role: 'worker',
    serviceCategory: 'Home Repairs',
    skills: ['Plumber', 'Electrician', 'AC Technician', 'Carpenter'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe012',
    name: 'Vehicle Services Pro',
    email: 'vehicleservices.worker@gmail.com',
    password: 'worker123',
    phone: '9876500002',
    role: 'worker',
    serviceCategory: 'Vehicle Services',
    skills: ['Car Mechanic', 'Bike Mechanic', 'Car Washing & Detailing'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe013',
    name: 'Cleaning Hygiene Pro',
    email: 'cleaninghygiene.worker@gmail.com',
    password: 'worker123',
    phone: '9876500003',
    role: 'worker',
    serviceCategory: 'Cleaning & Hygiene',
    skills: ['Home Deep Cleaning', 'Sofa & Carpet Cleaning', 'Pest Control Specialist'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe014',
    name: 'Home IT Pro',
    email: 'homeit.worker@gmail.com',
    password: 'worker123',
    phone: '9876500004',
    role: 'worker',
    serviceCategory: 'Home IT & Smart Devices',
    skills: ['CCTV Installation', 'WiFi & Router Setup', 'Laptop / PC Repair'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe015',
    name: 'Care & Family Pro',
    email: 'carefamily.worker@gmail.com',
    password: 'worker123',
    phone: '9876500005',
    role: 'worker',
    serviceCategory: 'Care & Family',
    skills: ['Patient Caretaker', 'Senior Citizen Companion'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe016',
    name: 'Daily Help Pro',
    email: 'dailyhelp.worker@gmail.com',
    password: 'worker123',
    phone: '9876500006',
    role: 'worker',
    serviceCategory: 'Utility & Daily Help',
    skills: ['Full-Time House Maid', 'Clothes Laundry & Ironing'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe017',
    name: 'Learning Support Pro',
    email: 'learningsupport.worker@gmail.com',
    password: 'worker123',
    phone: '9876500007',
    role: 'worker',
    serviceCategory: 'Learning & Support',
    skills: ['Private Home Tutor', 'English / Language Coach', 'Yoga Coach'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe018',
    name: 'Property Society Pro',
    email: 'propertysociety.worker@gmail.com',
    password: 'worker123',
    phone: '9876500008',
    role: 'worker',
    serviceCategory: 'Property & Society',
    skills: ['Society Security Guard', 'Facility Supervisor'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe019',
    name: 'Seasonal Worker',
    email: 'seasonalworker@gmail.com',
    password: 'worker123',
    phone: '9876500009',
    role: 'worker',
    serviceCategory: 'Seasonal & Festive',
    skills: ['Festive Light Cascading Tech', 'Pre-Diwali Deep Cleaner'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe01a',
    name: 'Furniture Decor Pro',
    email: 'furnituredecor.worker@gmail.com',
    password: 'worker123',
    phone: '9876500010',
    role: 'worker',
    serviceCategory: 'Furniture & Decor',
    skills: ['Custom Furniture Carpenter', 'Modular Wardrobe Assembly'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe01b',
    name: 'Garden Outdoor Pro',
    email: 'gardenoutdoor.worker@gmail.com',
    password: 'worker123',
    phone: '9876500011',
    role: 'worker',
    serviceCategory: 'Garden & Outdoor',
    skills: ['Professional Gardener', 'Lawn Mower & Trimmer'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe01c',
    name: 'Packers Movers Pro',
    email: 'packersmovers.worker@gmail.com',
    password: 'worker123',
    phone: '9876500012',
    role: 'worker',
    serviceCategory: 'Packers & Movers',
    skills: ['Household Shifting Mover', 'Fragile Packing Specialist', 'Transit Truck Driver'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe01d',
    name: 'Health Wellness Pro',
    email: 'healthwellness.worker@gmail.com',
    password: 'worker123',
    phone: '9876500013',
    role: 'worker',
    serviceCategory: 'Health & Wellness',
    skills: ['Home Physiotherapist', 'Certified Home Nurse'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe01e',
    name: 'Family Care Pro',
    email: 'familycare.worker@gmail.com',
    password: 'worker123',
    phone: '9876500014',
    role: 'worker',
    serviceCategory: 'Kids & Elderly Care',
    skills: ['Certified Nanny / Babysitter', 'Infant Caregiver', 'Elderly Bedside Assistant'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe01f',
    name: 'Pet Services Pro',
    email: 'petservices.worker@gmail.com',
    password: 'worker123',
    phone: '9876500015',
    role: 'worker',
    serviceCategory: 'Pet Services',
    skills: ['Professional Pet Groomer', 'Certified Dog Walker'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe020',
    name: 'Food Kitchen Pro',
    email: 'foodkitchen.worker@gmail.com',
    password: 'worker123',
    phone: '9876500016',
    role: 'worker',
    serviceCategory: 'Food Kitchen',
    skills: ['Gourmet Home Chef', 'North/South Indian Family Cook'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe021',
    name: 'Travel Commute Pro',
    email: 'travelcommute.worker@gmail.com',
    password: 'worker123',
    phone: '9876500017',
    role: 'worker',
    serviceCategory: 'Travel & Commute',
    skills: ['Verified Outstation Chauffeur', 'Daily City Car Driver'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe022',
    name: 'Society Management Pro',
    email: 'societymanagement.worker@gmail.com',
    password: 'worker123',
    phone: '9876500018',
    role: 'worker',
    serviceCategory: 'Society Management',
    skills: ['Biometric Guard Supervisor', 'Society Electrician & Plumber'],
    workerStatus: 'approved_senior',
    isVerified: true,
  },
  {
    _id: '6a5f4c90437c4810f45fe023',
    name: 'Events Hub Pro',
    email: 'eventshub.worker@gmail.com',
    password: 'worker123',
    phone: '9876500019',
    role: 'worker',
    serviceCategory: 'Events Hub',
    skills: ['Theme Balloon Decorator', 'Sound & DJ Setup Specialist'],
    workerStatus: 'approved_senior',
    isVerified: true,
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

/**
 * Ensures all demo users exist with up-to-date passwords in MongoDB if connected.
 */
export async function ensureDemoUsersInDB(UserModel) {
  if (!UserModel) return;
  for (const demo of DEMO_USERS) {
    try {
      const existing = await UserModel.findOne({ email: demo.email });
      if (!existing) {
        await UserModel.create({
          name: demo.name,
          email: demo.email,
          phone: demo.phone,
          password: demo.password, // Pre-save hook hashes it
          role: demo.role,
          subscription: demo.subscription || 'basic',
          walletBalance: demo.walletBalance || 0,
          skills: demo.skills || [],
          serviceCategory: demo.serviceCategory || '',
          workerStatus: demo.workerStatus || (demo.role === 'worker' ? 'approved_senior' : undefined),
          isVerified: demo.isVerified !== undefined ? demo.isVerified : true,
          companyName: demo.companyName || undefined,
        });
        console.log(`[DemoSeeder] Created ${demo.role} user: ${demo.email}`);
      } else {
        const isMatch = await existing.comparePassword(demo.password);
        if (!isMatch) {
          existing.password = demo.password; // pre-save hook hashes it
          await existing.save();
          console.log(`[DemoSeeder] Synchronized password for ${demo.email}`);
        }
      }
    } catch (err) {
      console.warn(`[DemoSeeder] Notice for ${demo.email}:`, err.message);
    }
  }
}
