/**
 * serviceService.js — Phase 1 Batch 6
 *
 * All service management and database operations.
 * Replaces static arrays / constants / hardcoded service lists.
 */

import fs from 'fs';
import mongoose from 'mongoose';
import Service from '../models/Service.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

// Load full canonical catalog of 110 services
let ALL_SERVICES = [];
try {
  const catalogPath = new URL('../constants/servicesCatalog.json', import.meta.url);
  ALL_SERVICES = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
} catch (err) {
  console.warn('[ServiceService] Warning: servicesCatalog.json not loaded, falling back to core services.', err.message);
  ALL_SERVICES = [
    { serviceId: 'electrical-work', name: 'Electrical Work', category: 'Home Repairs', subCategory: 'home-repairs', basePrice: 300, icon: '⚡', description: 'Wiring, switches, fans, lights', tags: ['electrician', 'wiring', 'switches', 'lights'] },
    { serviceId: 'plumbing', name: 'Plumbing', category: 'Home Repairs', subCategory: 'home-repairs', basePrice: 350, icon: '🚰', description: 'Pipe repair, tap fix, leakage', tags: ['plumber', 'pipe', 'leakage', 'tap'] },
    { serviceId: 'carpentry', name: 'Carpentry', category: 'Home Repairs', subCategory: 'home-repairs', basePrice: 400, icon: '🔨', description: 'Door/window repair, furniture fix', tags: ['carpenter', 'door', 'window', 'furniture'] },
    { serviceId: 'ac-appliance-repair', name: 'AC & Appliance Repair', category: 'Home Repairs', subCategory: 'home-repairs', basePrice: 500, icon: '❄️', description: 'AC service, fridge, washing machine', tags: ['ac', 'appliance', 'fridge', 'washing machine'] },
    { serviceId: 'painting', name: 'Painting', category: 'Home Repairs', subCategory: 'home-repairs', basePrice: 600, icon: '🎨', description: 'Wall painting, waterproofing', tags: ['painting', 'wall', 'waterproofing'] },
    { serviceId: 'car-repair', name: 'Car Repair', category: 'Vehicle Services', subCategory: 'vehicle-services', basePrice: 800, icon: '🚗', description: 'Engine, brakes, suspension', tags: ['car', 'mechanic', 'engine', 'brakes'] },
    { serviceId: 'bike-repair', name: 'Bike Repair', category: 'Vehicle Services', subCategory: 'vehicle-services', basePrice: 400, icon: '🏍️', description: 'Engine, chain, brakes', tags: ['bike', 'mechanic', 'chain', 'brakes'] },
    { serviceId: 'home-deep-cleaning', name: 'Home Deep Cleaning', category: 'Cleaning & Hygiene', subCategory: 'cleaning', basePrice: 1200, icon: '🧹', description: 'Full house thorough cleaning', tags: ['cleaning', 'deep clean', 'house'] },
    { serviceId: 'pest-control', name: 'Pest Control', category: 'Cleaning & Hygiene', subCategory: 'cleaning', basePrice: 900, icon: '🐜', description: 'Cockroach, termite, mosquito control', tags: ['pest', 'termite', 'cockroach'] },
  ];
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
  // Search reverse
  for (const [slug, title] of Object.entries(CATEGORY_MAP)) {
    if (title.toLowerCase() === clean.toLowerCase()) return title;
    if (clean.toLowerCase().includes(slug.replace('-', ' '))) return title;
  }
  return clean;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Seed canonical services if DB collection is empty or incomplete
 */
export async function seedInitialServicesIfEmpty() {
  if (mongoose.connection.readyState !== 1) return;

  const count = await Service.countDocuments();
  if (count < ALL_SERVICES.length) {
    console.log(`[ServiceService] Syncing catalog into MongoDB (current: ${count}, target: ${ALL_SERVICES.length})...`);
    for (const svc of ALL_SERVICES) {
      await Service.updateOne(
        { serviceId: svc.serviceId },
        { $setOnInsert: svc },
        { upsert: true }
      );
    }
    console.log(`[ServiceService] Synchronized ${ALL_SERVICES.length} services into MongoDB.`);
  }
}

/**
 * Create a new service (Admin only)
 */
export async function createService(data) {
  if (mongoose.connection.readyState !== 1) {
    const newSvc = { ...data, _id: `demo_s_${Date.now()}` };
    ALL_SERVICES.push(newSvc);
    return newSvc;
  }
  const service = await Service.create(data);
  return service;
}

/**
 * Update an existing service (Admin only)
 */
export async function updateService(id, data) {
  if (mongoose.connection.readyState !== 1) {
    const idx = ALL_SERVICES.findIndex(s => s.serviceId === id || String(s._id) === String(id));
    if (idx === -1) throw new AppError('Service not found', StatusCodes.NOT_FOUND);
    ALL_SERVICES[idx] = { ...ALL_SERVICES[idx], ...data };
    return ALL_SERVICES[idx];
  }
  const service = await Service.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!service) {
    throw new AppError('Service not found', StatusCodes.NOT_FOUND);
  }
  return service;
}

/**
 * Soft delete a service (Admin only)
 */
export async function deleteService(id) {
  if (mongoose.connection.readyState !== 1) {
    const idx = ALL_SERVICES.findIndex(s => s.serviceId === id || String(s._id) === String(id));
    if (idx === -1) throw new AppError('Service not found', StatusCodes.NOT_FOUND);
    ALL_SERVICES[idx].isDeleted = true;
    ALL_SERVICES[idx].isActive = false;
    return ALL_SERVICES[idx];
  }
  const service = await Service.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } },
    { new: true }
  );
  if (!service) {
    throw new AppError('Service not found', StatusCodes.NOT_FOUND);
  }
  return service;
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id) {
  if (mongoose.connection.readyState !== 1) {
    const found = ALL_SERVICES.find(s => s.serviceId === id || String(s._id) === String(id));
    if (!found) throw new AppError('Service not found', StatusCodes.NOT_FOUND);
    return found;
  }
  const service = await Service.findById(id);
  if (!service) {
    throw new AppError('Service not found', StatusCodes.NOT_FOUND);
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
  if (mongoose.connection.readyState !== 1) {
    let list = ALL_SERVICES.map((s, idx) => ({ ...s, _id: s._id || `demo_s_${idx + 1}` }));
    if (category) {
      const normCat = normalizeCategoryName(category).toLowerCase();
      list = list.filter(s => s.category?.toLowerCase() === normCat || s.category?.toLowerCase() === category.toLowerCase());
    }
    if (subCategory) {
      list = list.filter(s => s.subCategory?.toLowerCase() === subCategory.toLowerCase());
    }
    if (isActive !== undefined) {
      const activeBool = isActive === 'true' || isActive === true;
      list = list.filter(s => (s.isActive !== undefined ? s.isActive === activeBool : true));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.tags?.some(t => t.toLowerCase().includes(q)));
    }
    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);
    return { services: paginated, total, page: parseInt(page), pages: Math.ceil(total / limit) || 1 };
  }

  await seedInitialServicesIfEmpty();

  const query = { isDeleted: false };
  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (isActive !== undefined) query.isActive = isActive === 'true' || isActive === true;

  if (search) {
    query.$text = { $search: search };
  }

  const services = await Service.find(query)
    .sort(search ? { score: { $meta: 'textScore' } } : '-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Service.countDocuments(query);
  return { services, total, page: parseInt(page), pages: Math.ceil(total / limit) };
}

/**
 * Get services by Category
 */
export async function getServicesByCategory(category) {
  if (mongoose.connection.readyState !== 1) {
    const norm = normalizeCategoryName(category).toLowerCase();
    return ALL_SERVICES
      .filter(s => s.category?.toLowerCase() === norm || s.category?.toLowerCase() === category.toLowerCase())
      .map((s, idx) => ({ ...s, _id: s._id || `demo_s_${idx + 1}` }));
  }

  await seedInitialServicesIfEmpty();
  return Service.find({ category, isActive: true, isDeleted: false }).sort('name');
}

/**
 * Text search services
 */
export async function searchServices(queryText) {
  if (mongoose.connection.readyState !== 1) {
    if (!queryText) return [];
    const q = queryText.toLowerCase();
    return ALL_SERVICES
      .filter(s => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.tags?.some(t => t.toLowerCase().includes(q)))
      .map((s, idx) => ({ ...s, _id: s._id || `demo_s_${idx + 1}` }));
  }

  await seedInitialServicesIfEmpty();
  if (!queryText) return [];
  return Service.find(
    { $text: { $search: queryText }, isActive: true, isDeleted: false },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
}

/**
 * Toggle Service Active/Disabled status
 */
export async function toggleServiceStatus(id) {
  if (mongoose.connection.readyState !== 1) {
    const svc = ALL_SERVICES.find(s => s.serviceId === id || String(s._id) === String(id));
    if (!svc) throw new AppError('Service not found', StatusCodes.NOT_FOUND);
    svc.isActive = !svc.isActive;
    return svc;
  }

  const service = await Service.findById(id);
  if (!service) {
    throw new AppError('Service not found', StatusCodes.NOT_FOUND);
  }

  service.isActive = !service.isActive;
  await service.save();
  return service;
}

export async function validateServiceForBooking(serviceName, category, serviceId) {
  if (mongoose.connection.readyState !== 1) {
    const normalizedCat = normalizeCategoryName(category);
    let matched = null;
    if (serviceId) {
      matched = ALL_SERVICES.find(s => s.serviceId === serviceId);
    }
    if (!matched && serviceName) {
      matched = ALL_SERVICES.find(s => s.name?.toLowerCase() === serviceName.toLowerCase() || s.serviceId === serviceName.toLowerCase());
    }
    if (matched) return matched;
    const isKnownCategory = CATEGORY_MAP[category?.toLowerCase()] ||
      Object.values(CATEGORY_MAP).some(v => v.toLowerCase() === normalizedCat.toLowerCase());
    if (!isKnownCategory) {
      throw new AppError(`Service category "${category}" does not exist`, StatusCodes.BAD_REQUEST);
    }
    return true;
  }

  await seedInitialServicesIfEmpty();

  const normalizedCat = normalizeCategoryName(category);

  let service = null;
  if (serviceId) {
    service = await Service.findOne({ serviceId, isDeleted: false });
  }

  if (!service && serviceName) {
    service = await Service.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(serviceName)}$`, 'i') },
      isDeleted: false,
    });
  }

  if (service) {
    if (!service.isActive) {
      throw new AppError(`Service "${service.name}" is currently inactive`, StatusCodes.BAD_REQUEST);
    }
    return service;
  }

  // If service not in catalog by exact name/id, verify category is valid
  const categoryExists = await Service.exists({
    $or: [
      { category: { $regex: new RegExp(`^${escapeRegex(normalizedCat)}$`, 'i') } },
      { subCategory: { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') } },
      { category: { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') } },
    ],
    isDeleted: false,
  });

  const isKnownCategory = CATEGORY_MAP[category?.toLowerCase()] ||
    Object.values(CATEGORY_MAP).some(v => v.toLowerCase() === normalizedCat.toLowerCase());

  if (!categoryExists && !isKnownCategory) {
    throw new AppError(`Service category "${category}" does not exist`, StatusCodes.BAD_REQUEST);
  }

  return true;
}
