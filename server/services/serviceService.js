// server/services/serviceService.js
import fs from 'fs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

// Load full canonical catalog of 110 services
let ALL_SERVICES = [];
try {
  const catalogPath = new URL('../constants/servicesCatalog.json', import.meta.url);
  ALL_SERVICES = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
} catch (err) {
  console.warn('[ServiceService] Warning: servicesCatalog.json not loaded, falling back to core services.', err.message);
  ALL_SERVICES = [];
}

export const CATEGORY_MAP = {
  'home-repairs': 'Home Repairs',
  'vehicle-services': 'Vehicle Services',
  'cleaning': 'Cleaning & Hygiene',
  'events': 'Events & Celebrations',
  'home-it': 'Home IT & Tech Support',
  'care-family': 'Care & Family',
  'utility-daily': 'Utility & Daily Services',
  'learning-support': 'Learning & Support',
  'property-services': 'Property Services',
  'festive-seasonal': 'Festive & Seasonal',
  'furniture-decor': 'Furniture & Decor',
  'garden-outdoor': 'Garden & Outdoor',
  'relocation': 'Relocation & Packers',
  'health-wellness': 'Health & Wellness',
  'kids-elderly': 'Kids & Elderly Care',
  'pet-services': 'Pet Services',
  'food-kitchen': 'Food & Kitchen',
  'travel-commute': 'Travel & Commute',
  'society-management': 'Society Management',
  'emergency': 'Emergency Services',
};

export function normalizeCategoryName(rawCategory = '') {
  if (!rawCategory) return 'Home Repairs';
  const clean = rawCategory.trim();
  if (CATEGORY_MAP[clean.toLowerCase()]) return CATEGORY_MAP[clean.toLowerCase()];
  for (const [slug, title] of Object.entries(CATEGORY_MAP)) {
    if (title.toLowerCase() === clean.toLowerCase()) return title;
    if (clean.toLowerCase().includes(slug.replace('-', ' '))) return title;
  }
  return clean;
}

/**
 * Format service object with backward-compatible fields (_id, serviceId, id)
 */
export function formatService(s) {
  if (!s) return null;
  return {
    ...s,
    _id: s.id,
    id: s.id,
    serviceId: s.serviceId || s.id,
    tags: Array.isArray(s.tags) ? s.tags : [],
  };
}

/**
 * Create a new service (Admin only)
 */
export async function createService(data) {
  try {
    const created = await prisma.service.create({
      data: {
        serviceId: data.serviceId || `svc-${Date.now()}`,
        name: data.name,
        category: normalizeCategoryName(data.category),
        subCategory: data.subCategory || null,
        description: data.description || '',
        basePrice: Number(data.basePrice) || 199,
        estimatedDuration: Number(data.estimatedDuration) || 60,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        icon: data.icon || '🔧',
        image: data.image || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        serviceRadius: Number(data.serviceRadius) || 20,
      },
    });
    return formatService(created);
  } catch (err) {
    console.warn('[ServiceService create] PostgreSQL fallback:', err.message);
    const newSvc = { ...data, _id: `demo_s_${Date.now()}`, id: `demo_s_${Date.now()}` };
    ALL_SERVICES.push(newSvc);
    return newSvc;
  }
}

/**
 * Update an existing service (Admin only)
 */
export async function updateService(id, data) {
  try {
    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: normalizeCategoryName(data.category) }),
        ...(data.subCategory !== undefined && { subCategory: data.subCategory }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.basePrice !== undefined && { basePrice: Number(data.basePrice) }),
        ...(data.estimatedDuration !== undefined && { estimatedDuration: Number(data.estimatedDuration) }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
        ...(data.icon && { icon: data.icon }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.tags && { tags: data.tags }),
        ...(data.serviceRadius !== undefined && { serviceRadius: Number(data.serviceRadius) }),
      },
    });
    return formatService(updated);
  } catch (err) {
    // Try finding by serviceId
    try {
      const byServiceId = await prisma.service.update({
        where: { serviceId: id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.category && { category: normalizeCategoryName(data.category) }),
          ...(data.basePrice !== undefined && { basePrice: Number(data.basePrice) }),
        },
      });
      return formatService(byServiceId);
    } catch {}

    const idx = ALL_SERVICES.findIndex((s) => s.serviceId === id || String(s._id) === String(id));
    if (idx === -1) throw new AppError('Service not found', StatusCodes.NOT_FOUND);
    ALL_SERVICES[idx] = { ...ALL_SERVICES[idx], ...data };
    return formatService(ALL_SERVICES[idx]);
  }
}

/**
 * Soft delete a service (Admin only)
 */
export async function deleteService(id) {
  try {
    const deleted = await prisma.service.update({
      where: { id },
      data: { isDeleted: true, isActive: false, deletedAt: new Date() },
    });
    return formatService(deleted);
  } catch (err) {
    try {
      const deleted = await prisma.service.update({
        where: { serviceId: id },
        data: { isDeleted: true, isActive: false, deletedAt: new Date() },
      });
      return formatService(deleted);
    } catch {}

    const idx = ALL_SERVICES.findIndex((s) => s.serviceId === id || String(s._id) === String(id));
    if (idx === -1) throw new AppError('Service not found', StatusCodes.NOT_FOUND);
    ALL_SERVICES[idx].isDeleted = true;
    ALL_SERVICES[idx].isActive = false;
    return formatService(ALL_SERVICES[idx]);
  }
}

/**
 * Get a single service by ID or serviceId
 */
export async function getServiceById(id) {
  if (!id) throw new AppError('Service identifier is required', StatusCodes.BAD_REQUEST);
  try {
    const service = await prisma.service.findFirst({
      where: {
        OR: [
          { id },
          { serviceId: id },
          { name: { equals: id, mode: 'insensitive' } },
        ],
        isDeleted: false,
      },
    });
    if (service) return formatService(service);
  } catch (err) {
    console.warn('[ServiceService getById] PostgreSQL fallback:', err.message);
  }

  const idStr = String(id).toLowerCase();
  const found = ALL_SERVICES.find(
    (s) => s.serviceId?.toLowerCase() === idStr || String(s._id) === String(id) || s.name?.toLowerCase() === idStr
  );
  if (!found) throw new AppError('Service not found', StatusCodes.NOT_FOUND);
  return formatService(found);
}

/**
 * Validate service exists and is active for booking
 */
export async function validateServiceForBooking(serviceNameOrId, category, optionalServiceId) {
  const target = optionalServiceId || serviceNameOrId;
  const service = await getServiceById(target);
  if (!service.isActive) {
    throw new AppError('This service is currently unavailable for booking', StatusCodes.BAD_REQUEST);
  }
  return service;
}

/**
 * Get all services with filtering, search & pagination
 */
export async function getAllServices({
  category,
  subCategory,
  isActive,
  search,
  page = 1,
  limit = 20,
} = {}) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 20);

  try {
    const where = { isDeleted: false };

    if (category) {
      where.category = { equals: normalizeCategoryName(category), mode: 'insensitive' };
    }
    if (subCategory) {
      where.subCategory = { equals: subCategory, mode: 'insensitive' };
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { tags: { has: search.trim().toLowerCase() } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      services: services.map(formatService),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };
  } catch (err) {
    console.warn('[ServiceService getAll] PostgreSQL fallback:', err.message);
    let list = ALL_SERVICES.map(formatService);
    if (category) {
      const normCat = normalizeCategoryName(category).toLowerCase();
      list = list.filter((s) => s.category?.toLowerCase() === normCat || s.category?.toLowerCase() === category.toLowerCase());
    }
    if (subCategory) {
      list = list.filter((s) => s.subCategory?.toLowerCase() === subCategory.toLowerCase());
    }
    if (isActive !== undefined) {
      const activeBool = isActive === 'true' || isActive === true;
      list = list.filter((s) => (s.isActive !== undefined ? s.isActive === activeBool : true));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.tags?.some((t) => t.toLowerCase().includes(q)));
    }
    const total = list.length;
    const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    return { services: paginated, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 };
  }
}

/**
 * Get services by Category
 */
export async function getServicesByCategory(category) {
  const norm = normalizeCategoryName(category);
  try {
    const services = await prisma.service.findMany({
      where: {
        category: { equals: norm, mode: 'insensitive' },
        isActive: true,
        isDeleted: false,
      },
      orderBy: { name: 'asc' },
    });
    if (services.length > 0) return services.map(formatService);
  } catch (err) {
    console.warn('[ServiceService getByCategory] PostgreSQL fallback:', err.message);
  }

  return ALL_SERVICES
    .filter((s) => s.category?.toLowerCase() === norm.toLowerCase() || s.category?.toLowerCase() === category.toLowerCase())
    .map(formatService);
}

/**
 * Text search services
 */
export async function searchServices(queryText) {
  if (!queryText || !queryText.trim()) return [];
  const q = queryText.trim();

  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 20,
    });
    if (services.length > 0) return services.map(formatService);
  } catch (err) {
    console.warn('[ServiceService search] PostgreSQL fallback:', err.message);
  }

  const qLower = q.toLowerCase();
  return ALL_SERVICES
    .filter((s) => s.name?.toLowerCase().includes(qLower) || s.description?.toLowerCase().includes(qLower) || s.tags?.some((t) => t.toLowerCase().includes(qLower)))
    .map(formatService);
}

/**
 * Toggle Service Active/Disabled status
 */
export async function toggleServiceStatus(id) {
  try {
    const current = await getServiceById(id);
    const updated = await prisma.service.update({
      where: { id: current.id },
      data: { isActive: !current.isActive },
    });
    return formatService(updated);
  } catch (err) {
    const svc = ALL_SERVICES.find((s) => s.serviceId === id || String(s._id) === String(id));
    if (!svc) throw new AppError('Service not found', StatusCodes.NOT_FOUND);
    svc.isActive = !svc.isActive;
    return formatService(svc);
  }
}

export default {
  createService,
  updateService,
  deleteService,
  getServiceById,
  validateServiceForBooking,
  getAllServices,
  getServicesByCategory,
  searchServices,
  toggleServiceStatus,
  normalizeCategoryName,
  formatService,
};
