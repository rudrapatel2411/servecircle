/**
 * routes/services.js — Phase 1 Batch 6
 *
 * Pattern: Request → Validation → serviceService → Response
 * Replaces static arrays & hardcoded constants with MongoDB Service model.
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  validateMongoIdParam,
  validateCreateService,
  validateUpdateService,
} from '../middleware/validation.js';
import {
  getAllServices,
  getServiceById,
  getServicesByCategory,
  searchServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from '../services/serviceService.js';
import { StatusCodes } from 'http-status-codes';
import { logEvent, EVENT_TYPES, ENTITY_TYPES } from '../services/eventService.js';
import { captureSnapshot } from '../services/historyService.js';


const router = express.Router();

// ─────────────────────────────────────────────
// PUBLIC / CUSTOMER READ-ONLY ROUTES
// ─────────────────────────────────────────────

// GET /services — Get all services (paginated & filtered)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await getAllServices(req.query);
    res.json(result);
  })
);

// GET /services/search — Search services using MongoDB text index
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    const services = await searchServices(q);
    res.json(services);
  })
);

// GET /services/category/:category — Get services by category name
router.get(
  '/category/:category',
  asyncHandler(async (req, res) => {
    const services = await getServicesByCategory(req.params.category);
    res.json(services);
  })
);

// GET /services/:id — Get service by MongoDB ID
router.get(
  '/:id',
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const service = await getServiceById(req.params.id);
    res.json(service);
  })
);

// ─────────────────────────────────────────────
// ADMIN CRUD ROUTES (Role: Admin Only)
// ─────────────────────────────────────────────

// POST /services — Create a new service
router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateService,
  asyncHandler(async (req, res) => {
    const service = await createService(req.body);
    logEvent({ eventType: EVENT_TYPES.SERVICE_CREATED, entityType: ENTITY_TYPES.SERVICE, entityId: service._id, actorId: req.user._id, actorRole: 'admin', metadata: { name: service.name, category: service.category }, ...req.reqCtx });
    captureSnapshot({ collection: 'services', documentId: service._id, before: {}, after: service.toObject ? service.toObject() : service, changedBy: req.user._id, changedByRole: 'admin', changeReason: EVENT_TYPES.SERVICE_CREATED });
    res.status(StatusCodes.CREATED).json(service);
  })
);


// PUT /services/:id — Update a service
router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateUpdateService,
  asyncHandler(async (req, res) => {
    const service = await updateService(req.params.id, req.body);
    logEvent({ eventType: EVENT_TYPES.SERVICE_UPDATED, entityType: ENTITY_TYPES.SERVICE, entityId: service._id, actorId: req.user._id, actorRole: 'admin', metadata: { name: service.name }, ...req.reqCtx });
    res.json(service);
  })
);


// DELETE /services/:id — Soft delete a service
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const service = await deleteService(req.params.id);
    logEvent({ eventType: EVENT_TYPES.SERVICE_DELETED, entityType: ENTITY_TYPES.SERVICE, entityId: service._id, actorId: req.user._id, actorRole: 'admin', ...req.reqCtx });
    res.json({ message: 'Service deleted successfully', service });
  })
);


// PATCH /services/:id/toggle — Enable / Disable a service
router.patch(
  '/:id/toggle',
  protect,
  authorize('admin'),
  validateMongoIdParam('id'),
  asyncHandler(async (req, res) => {
    const service = await toggleServiceStatus(req.params.id);
    logEvent({ eventType: EVENT_TYPES.SERVICE_TOGGLED, entityType: ENTITY_TYPES.SERVICE, entityId: service._id, actorId: req.user._id, actorRole: 'admin', metadata: { isActive: service.isActive }, ...req.reqCtx });
    res.json(service);
  })
);


export default router;
