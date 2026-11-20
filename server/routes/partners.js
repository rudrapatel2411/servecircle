import express from 'express';
import { prisma } from '../config/prisma.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

function formatPartner(p) {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    name: p.name,
    type: String(p.type).toLowerCase(),
    contactPerson: p.contactPerson,
    email: p.email,
    phone: p.phone,
    description: p.description,
    website: p.website,
    address: p.address,
    city: p.city,
    partnershipType: String(p.partnershipType).toLowerCase(),
    status: String(p.status).toLowerCase(),
    startDate: p.startDate,
    logo: p.logo,
    linkedUser: p.linkedUser ? { _id: p.linkedUser.id, name: p.linkedUser.name, email: p.linkedUser.email } : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// GET all partners (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const { type, status } = req.query;

    const where = {};
    if (type) where.type = type.toUpperCase();
    if (status) where.status = status.toUpperCase();

    const partners = await prisma.partner.findMany({
      where,
      include: {
        linkedUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(partners.map(formatPartner));
  })
);

// GET partner by ID
router.get(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const partner = await prisma.partner.findUnique({
      where: { id: req.params.id },
      include: {
        linkedUser: { select: { id: true, name: true, email: true } },
      },
    });
    if (!partner) throw new AppError('Partner not found', StatusCodes.NOT_FOUND);
    res.json(formatPartner(partner));
  })
);

// POST create partner (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const typeMap = {
      ngo: 'NGO',
      government: 'GOVERNMENT',
      corporate: 'CORPORATE',
      society: 'SOCIETY',
      other: 'OTHER',
    };

    const partnershipTypeMap = {
      training: 'TRAINING',
      employment: 'EMPLOYMENT',
      service_provider: 'SERVICE_PROVIDER',
      bulk_client: 'BULK_CLIENT',
      social_impact: 'SOCIAL_IMPACT',
    };

    const statusMap = {
      active: 'ACTIVE',
      inactive: 'INACTIVE',
      pending: 'PENDING',
    };

    const partner = await prisma.partner.create({
      data: {
        name: req.body.name || 'Partner',
        type: typeMap[req.body.type?.toLowerCase()] || 'CORPORATE',
        contactPerson: req.body.contactPerson || 'Contact',
        email: req.body.email || `partner_${Date.now()}@servecircle.local`,
        phone: req.body.phone || null,
        description: req.body.description || null,
        website: req.body.website || null,
        address: req.body.address || null,
        city: req.body.city || 'Mumbai',
        partnershipType: partnershipTypeMap[req.body.partnershipType?.toLowerCase()] || 'SERVICE_PROVIDER',
        status: statusMap[req.body.status?.toLowerCase()] || 'ACTIVE',
        logo: req.body.logo || null,
      },
    });

    res.status(StatusCodes.CREATED).json(formatPartner(partner));
  })
);

// PUT update partner
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const existing = await prisma.partner.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Partner not found', StatusCodes.NOT_FOUND);

    const data = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.contactPerson) data.contactPerson = req.body.contactPerson;
    if (req.body.email) data.email = req.body.email;
    if (req.body.phone !== undefined) data.phone = req.body.phone;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.website !== undefined) data.website = req.body.website;
    if (req.body.address !== undefined) data.address = req.body.address;
    if (req.body.city !== undefined) data.city = req.body.city;
    if (req.body.status) data.status = req.body.status.toUpperCase();

    const partner = await prisma.partner.update({
      where: { id: existing.id },
      data,
    });

    res.json(formatPartner(partner));
  })
);

// DELETE partner
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    await prisma.partner.deleteMany({
      where: { id: req.params.id },
    });
    res.json({ message: 'Partner deleted' });
  })
);

export default router;
