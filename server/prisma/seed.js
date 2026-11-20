// server/prisma/seed.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🌱 Starting ServeCircle PostgreSQL Seed...');

  // 1. Load Canonical Services Catalog (110 services)
  const catalogPath = path.resolve(__dirname, '../constants/servicesCatalog.json');
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog file not found at ${catalogPath}`);
  }

  const servicesData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  console.log(`📦 Found ${servicesData.length} canonical services in catalog.`);

  let createdServicesCount = 0;
  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { serviceId: s.serviceId },
      update: {
        name: s.name,
        category: s.category || 'General Services',
        subCategory: s.subCategory || null,
        description: s.description || '',
        basePrice: Number(s.basePrice) || 199,
        estimatedDuration: Number(s.estimatedDuration) || 60,
        isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
        icon: s.icon || '🔧',
        image: s.image || '',
        tags: Array.isArray(s.tags) ? s.tags : [],
        serviceRadius: Number(s.serviceRadius) || 25,
      },
      create: {
        serviceId: s.serviceId,
        name: s.name,
        category: s.category || 'General Services',
        subCategory: s.subCategory || null,
        description: s.description || '',
        basePrice: Number(s.basePrice) || 199,
        estimatedDuration: Number(s.estimatedDuration) || 60,
        isActive: s.isActive !== undefined ? Boolean(s.isActive) : true,
        icon: s.icon || '🔧',
        image: s.image || '',
        tags: Array.isArray(s.tags) ? s.tags : [],
        serviceRadius: Number(s.serviceRadius) || 25,
      },
    });
    createdServicesCount++;
  }
  console.log(`✅ Successfully seeded/updated ${createdServicesCount} services into PostgreSQL.`);

  // 2. Hash Password for Demo Users
  const hashedPassword = await bcrypt.hash('test123', 10);
  const adminHashedPassword = await bcrypt.hash('admin123', 10);

  // 3. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@servecircle.in' },
    update: {},
    create: {
      name: 'Admin Commander',
      email: 'admin@servecircle.in',
      phone: '9999900000',
      password: adminHashedPassword,
      role: 'ADMIN',
      city: 'Ahmedabad',
      walletBalance: 10000.0,
    },
  });
  console.log(`👑 Admin verified: ${admin.email}`);

  // 4. Seed Customers
  const customer1 = await prisma.user.upsert({
    where: { email: 'rudra@test.com' },
    update: { walletBalance: 2450.0 },
    create: {
      name: 'Rudra Shah',
      email: 'rudra@test.com',
      phone: '9876543210',
      password: hashedPassword,
      role: 'CUSTOMER',
      city: 'Ahmedabad',
      walletBalance: 2450.0,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'priya@test.com' },
    update: { walletBalance: 850.0 },
    create: {
      name: 'Priya Desai',
      email: 'priya@test.com',
      phone: '9876543211',
      password: hashedPassword,
      role: 'CUSTOMER',
      city: 'Ahmedabad',
      walletBalance: 850.0,
    },
  });
  console.log(`👤 Customers created: ${customer1.name}, ${customer2.name}`);

  // 5. Seed Workers with WorkerProfiles and WorkerServices
  const acService = await prisma.service.findUnique({ where: { serviceId: 'ac-repair' } });
  const electricianService = await prisma.service.findUnique({ where: { serviceId: 'electrician-visit' } });
  const cleaningService = await prisma.service.findUnique({ where: { serviceId: 'full-home-deep-cleaning' } }) ||
                          await prisma.service.findFirst({ where: { category: 'Cleaning & Hygiene' } });

  // Worker 1: Ramesh Kumar (Senior Electrician & AC Mechanic)
  const worker1User = await prisma.user.upsert({
    where: { email: 'ramesh@test.com' },
    update: { walletBalance: 4200.0 },
    create: {
      name: 'Ramesh Kumar',
      email: 'ramesh@test.com',
      phone: '9876500001',
      password: hashedPassword,
      role: 'WORKER',
      city: 'Ahmedabad',
      walletBalance: 4200.0,
    },
  });

  const worker1Profile = await prisma.workerProfile.upsert({
    where: { userId: worker1User.id },
    update: {
      workerStatus: 'APPROVED_SENIOR',
      isVerified: true,
      rating: 4.85,
      completedJobs: 48,
    },
    create: {
      userId: worker1User.id,
      workerIdCode: 'WK-8901',
      serviceCategory: 'Home Repairs',
      skills: ['AC Repair & Diagnostics', 'General Electrical Work', 'Fan Installation'],
      experience: '5+ Years (Expert)',
      workerStatus: 'APPROVED_SENIOR',
      isVerified: true,
      rating: 4.85,
      completedJobs: 48,
      earnings: 45000.0,
      latitude: 23.0225,
      longitude: 72.5714,
      isAvailable: true,
    },
  });

  // Link services to Ramesh
  if (acService) {
    await prisma.workerService.upsert({
      where: {
        workerProfileId_serviceId: {
          workerProfileId: worker1Profile.id,
          serviceId: acService.id,
        },
      },
      update: {},
      create: {
        workerProfileId: worker1Profile.id,
        serviceId: acService.id,
        customPrice: 449.0,
      },
    });
  }
  if (electricianService) {
    await prisma.workerService.upsert({
      where: {
        workerProfileId_serviceId: {
          workerProfileId: worker1Profile.id,
          serviceId: electricianService.id,
        },
      },
      update: {},
      create: {
        workerProfileId: worker1Profile.id,
        serviceId: electricianService.id,
        customPrice: 199.0,
      },
    });
  }

  // Worker 2: Sunita Mehra (Junior Cleaning Specialist)
  const worker2User = await prisma.user.upsert({
    where: { email: 'sunita@test.com' },
    update: { walletBalance: 1800.0 },
    create: {
      name: 'Sunita Mehra',
      email: 'sunita@test.com',
      phone: '9876500002',
      password: hashedPassword,
      role: 'WORKER',
      city: 'Ahmedabad',
      walletBalance: 1800.0,
    },
  });

  const worker2Profile = await prisma.workerProfile.upsert({
    where: { userId: worker2User.id },
    update: {
      workerStatus: 'APPROVED_JUNIOR',
      isVerified: true,
      rating: 4.7,
      completedJobs: 24,
    },
    create: {
      userId: worker2User.id,
      workerIdCode: 'WK-8902',
      serviceCategory: 'Cleaning & Hygiene',
      skills: ['Home Deep Cleaning', 'Kitchen Deep Cleaning', 'Sofa Cleaning'],
      experience: '2-3 Years',
      workerStatus: 'APPROVED_JUNIOR',
      isVerified: true,
      rating: 4.7,
      completedJobs: 24,
      earnings: 21000.0,
      latitude: 23.0338,
      longitude: 72.5850,
      isAvailable: true,
    },
  });

  if (cleaningService) {
    await prisma.workerService.upsert({
      where: {
        workerProfileId_serviceId: {
          workerProfileId: worker2Profile.id,
          serviceId: cleaningService.id,
        },
      },
      update: {},
      create: {
        workerProfileId: worker2Profile.id,
        serviceId: cleaningService.id,
        customPrice: cleaningService.basePrice,
      },
    });
  }
  console.log(`🛠️ Workers & profiles created: Ramesh Kumar (Senior), Sunita Mehra (Junior)`);

  // 6. Seed Coupons
  const couponData = [
    { code: 'FIRST50', discountValue: 50, discountType: 'FLAT', minOrderAmount: 199, maxDiscount: 50 },
    { code: 'SUMMER20', discountValue: 20, discountType: 'PERCENTAGE', minOrderAmount: 499, maxDiscount: 200 },
    { code: 'WELCOME100', discountValue: 100, discountType: 'FLAT', minOrderAmount: 599, maxDiscount: 100 },
  ];

  for (const c of couponData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        discountValue: c.discountValue,
        discountType: c.discountType,
        minOrderAmount: c.minOrderAmount,
        maxDiscount: c.maxDiscount,
        isActive: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`🎟️ Coupons seeded: FIRST50, SUMMER20, WELCOME100`);

  // 7. Seed Sample Booking with ACID Wallet Transaction
  if (acService) {
    const existingBooking = await prisma.booking.findFirst({
      where: { customerId: customer1.id, serviceId: acService.id },
    });

    if (!existingBooking) {
      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            bookingId: 'BK-2026-1001',
            customerId: customer1.id,
            workerId: worker1User.id,
            serviceId: acService.id,
            serviceName: acService.name,
            category: acService.category,
            status: 'COMPLETED',
            amount: 449.0,
            platformCommission: 44.9,
            workerEarnings: 404.1,
            paymentStatus: 'PAID',
            paymentMethod: 'WALLET',
            scheduledDate: new Date(),
            scheduledTime: '11:00 AM',
            address: '402 Sunrise Heights, Drive-in Road, Ahmedabad',
            city: 'Ahmedabad',
            startOtp: '4821',
            startOtpVerified: true,
            endOtpVerified: true,
          },
        });

        // Debit customer wallet transaction
        await tx.walletTransaction.create({
          data: {
            userId: customer1.id,
            type: 'PAYMENT',
            amount: 449.0,
            balanceAfter: customer1.walletBalance,
            description: `Payment for booking #${booking.id.slice(0, 8)} (${acService.name})`,
            reference: booking.id,
            bookingId: booking.id,
            status: 'COMPLETED',
          },
        });

        // Credit worker wallet transaction
        await tx.walletTransaction.create({
          data: {
            userId: worker1User.id,
            type: 'EARNING',
            amount: 404.1,
            balanceAfter: worker1User.walletBalance,
            description: `Payout for booking #${booking.id.slice(0, 8)} (${acService.name})`,
            reference: booking.id,
            bookingId: booking.id,
            status: 'COMPLETED',
          },
        });
      });
      console.log(`📅 Sample completed Booking & ACID Wallet Transactions recorded.`);
    }
  }

  console.log('✨ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
