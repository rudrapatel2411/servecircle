/**
 * serviceService.js — Phase 1 Batch 6
 *
 * All service management and database operations.
 * Replaces static arrays / constants / hardcoded service lists.
 */

import Service from '../models/Service.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes';

// Default initial services to seed if MongoDB collection is empty
const INITIAL_SERVICES = [
  { name: 'Electrical Work', category: 'Home Repairs', basePrice: 300, icon: '⚡', description: 'Wiring, switches, fans, lights', tags: ['electrician', 'wiring', 'switches', 'lights'] },
  { name: 'Plumbing', category: 'Home Repairs', basePrice: 350, icon: '🚰', description: 'Pipe repair, tap fix, leakage', tags: ['plumber', 'pipe', 'leakage', 'tap'] },
  { name: 'Carpentry', category: 'Home Repairs', basePrice: 400, icon: '🔨', description: 'Door/window repair, furniture fix', tags: ['carpenter', 'door', 'window', 'furniture'] },
  { name: 'AC & Appliance Repair', category: 'Home Repairs', basePrice: 500, icon: '❄️', description: 'AC service, fridge, washing machine', tags: ['ac', 'appliance', 'fridge', 'washing machine'] },
  { name: 'Painting', category: 'Home Repairs', basePrice: 600, icon: '🎨', description: 'Wall painting, waterproofing', tags: ['painting', 'wall', 'waterproofing'] },
  { name: 'Car Repair', category: 'Vehicle Services', basePrice: 800, icon: '🚗', description: 'Engine, brakes, suspension', tags: ['car', 'mechanic', 'engine', 'brakes'] },
  { name: 'Bike Repair', category: 'Vehicle Services', basePrice: 400, icon: '🏍️', description: 'Engine, chain, brakes', tags: ['bike', 'mechanic', 'chain', 'brakes'] },
  { name: 'Home Deep Cleaning', category: 'Cleaning & Hygiene', basePrice: 1200, icon: '🧹', description: 'Full house thorough cleaning', tags: ['cleaning', 'deep clean', 'house'] },
  { name: 'Pest Control', category: 'Cleaning & Hygiene', basePrice: 900, icon: '🐜', description: 'Cockroach, termite, mosquito control', tags: ['pest', 'termite', 'cockroach'] },
];

/**
 * Seed initial services if DB collection is empty
 */
export async function seedInitialServicesIfEmpty() {
  const count = await Service.countDocuments();
  if (count === 0) {
    await Service.insertMany(INITIAL_SERVICES);
    console.log(`[ServiceService] Seeded ${INITIAL_SERVICES.length} initial default services into MongoDB.`);
  }
}

/**
 * Create a new service (Admin only)
 */
export async function createService(data) {
  const service = await Service.create(data);
  return service;
}

/**
 * Update an existing service (Admin only)
 */
export async function updateService(id, data) {
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
  await seedInitialServicesIfEmpty();
  return Service.find({ category, isActive: true, isDeleted: false }).sort('name');
}

/**
 * Text search services
 */
export async function searchServices(queryText) {
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
  const service = await Service.findById(id);
  if (!service) {
    throw new AppError('Service not found', StatusCodes.NOT_FOUND);
  }

  service.isActive = !service.isActive;
  await service.save();
  return service;
}

/**
 * PART 5: Booking Integration Validation
 * Validates that requested service exists, is active, and category matches.
 */
export async function validateServiceForBooking(serviceName, category) {
  await seedInitialServicesIfEmpty();

  const service = await Service.findOne({
    name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
    isDeleted: false,
  });

  if (!service) {
    // Check if category exists
    const categoryExists = await Service.exists({ category, isDeleted: false });
    if (!categoryExists) {
      throw new AppError(`Service category "${category}" does not exist`, StatusCodes.BAD_REQUEST);
    }
    // Return true for custom service names under valid category
    return true;
  }

  if (!service.isActive) {
    throw new AppError(`Service "${service.name}" is currently inactive`, StatusCodes.BAD_REQUEST);
  }

  if (service.category.toLowerCase() !== category.toLowerCase()) {
    throw new AppError(
      `Service "${service.name}" belongs to category "${service.category}", not "${category}"`,
      StatusCodes.BAD_REQUEST
    );
  }

  return service;
}
