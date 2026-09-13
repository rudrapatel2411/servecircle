/**
 * validation.js — Centralized Validation Layer (Phase 1 Batch 5)
 *
 * All request validation occurs BEFORE business logic / service invocation.
 * Consistent error output format:
 * {
 *   "status": 422,
 *   "message": "Validation failed",
 *   "errors": [ { "field": "amount", "message": "Amount must be greater than zero" } ]
 * }
 */

import { validationResult, body, param, query } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

/**
 * Handle validation results from express-validator chains.
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    const isMongoIdError = formattedErrors.some(
      (e) => e.message.toLowerCase().includes('objectid') || e.message.toLowerCase().includes('mongoid')
    );
    const statusCode = isMongoIdError
      ? StatusCodes.BAD_REQUEST
      : StatusCodes.UNPROCESSABLE_ENTITY;

    return res.status(statusCode).json({
      status: statusCode,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE PARAMETER VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const validateMongoIdParam = (paramName = 'id') => [
  param(paramName)
    .custom((val) => mongoose.Types.ObjectId.isValid(val) || /^SC-\d+$/i.test(val) || String(val).startsWith('demo_'))
    .withMessage(`Invalid identifier format for parameter '${paramName}'`),
  handleValidationErrors,
];

// ─────────────────────────────────────────────────────────────────────────────
// AUTH VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['customer', 'worker', 'b2b'])
    .withMessage('Role must be customer, worker, or b2b'),
  body('companyName')
    .if(body('role').equals('b2b'))
    .trim()
    .notEmpty()
    .withMessage('Company name is required for B2B registration'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').trim().isEmail().withMessage('Email and password are required'),
  body('password').notEmpty().withMessage('Email and password are required'),
  handleValidationErrors,
];

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const validateCreateBooking = [
  body('serviceId').optional().trim().isString().withMessage('Service ID must be a string'),
  body('service').trim().notEmpty().withMessage('Service name is required'),
  body('category').trim().notEmpty().withMessage('Service category is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('amount')
    .exists().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be zero or greater'),
  body('scheduledDate')
    .exists().withMessage('Scheduled date is required')
    .custom((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) throw new Error('Scheduled date must be a valid date');
      return true;
    }),
  body('scheduledTime').optional().trim().notEmpty().withMessage('Invalid scheduled time'),
  body('location')
    .optional()
    .custom((loc) => {
      if (typeof loc !== 'object' || loc === null) throw new Error('Location must be an object');
      if (loc.type !== 'Point') throw new Error('Location type must be Point');
      if (!Array.isArray(loc.coordinates) || loc.coordinates.length !== 2) {
        throw new Error('Coordinates must be an array of [longitude, latitude]');
      }
      const [lon, lat] = loc.coordinates;
      if (
        typeof lon !== 'number' ||
        typeof lat !== 'number' ||
        lon < -180 ||
        lon > 180 ||
        lat < -90 ||
        lat > 90
      ) {
        throw new Error('Invalid GeoJSON coordinate values');
      }
      return true;
    }),
  handleValidationErrors,
];

export const validateAssignWorker = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid MongoDB ObjectId format for booking id'),
  body('workerId')
    .exists().withMessage('workerId is required')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid MongoDB ObjectId format for workerId'),
  handleValidationErrors,
];

export const validateCancelBooking = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid MongoDB ObjectId format for booking id'),
  body('reason').optional().isString().withMessage('Cancellation reason must be a string'),
  handleValidationErrors,
];

export const validatePayBooking = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid MongoDB ObjectId format for booking id'),
  body('paymentMethod').optional().isString().withMessage('Payment method must be a string'),
  handleValidationErrors,
];

// ─────────────────────────────────────────────────────────────────────────────
// USER & WORKER VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const validateWalletTopup = [
  body('amount')
    .exists().withMessage('Amount is required')
    .isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  handleValidationErrors,
];

export const validateUserUpdate = [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  handleValidationErrors,
];

export const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors,
];

export const validateSubscription = [
  body('plan')
    .isIn(['basic', 'silver', 'gold', 'platinum'])
    .withMessage('Invalid subscription plan'),
  handleValidationErrors,
];

export const validateWorkerStatusUpdate = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid MongoDB ObjectId format for worker id'),
  body('workerStatus')
    .isIn([
      'pending_interview',
      'interview_done',
      'approved_rookie',
      'approved_junior',
      'approved_senior',
      'rejected',
    ])
    .withMessage('Invalid workerStatus value'),
  handleValidationErrors,
];

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE MANAGEMENT VALIDATORS (Batch 6)
// ─────────────────────────────────────────────────────────────────────────────

export const validateCreateService = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('category').trim().notEmpty().withMessage('Service category is required'),
  body('basePrice')
    .exists().withMessage('basePrice is required')
    .isFloat({ min: 0 }).withMessage('basePrice must be a positive number'),
  body('estimatedDuration').optional().isFloat({ min: 1 }).withMessage('estimatedDuration must be a positive number'),
  handleValidationErrors,
];

export const validateUpdateService = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid MongoDB ObjectId format for service id'),
  body('name').optional().trim().notEmpty().withMessage('Service name cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Service category cannot be empty'),
  body('basePrice').optional().isFloat({ min: 0 }).withMessage('basePrice must be a positive number'),
  handleValidationErrors,
];

