/**
 * routes/export.js — Phase 2 Batch 2
 *
 * Admin-only dataset export API.
 * Pattern: Request → protect → authorize('admin') → exportService → Response
 *
 * Endpoints:
 *   GET /api/admin/export/manifest          — list all collections with counts
 *   GET /api/admin/export/:collection       — export records (JSON default)
 *   GET /api/admin/export/:collection?format=csv — export as CSV download
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { StatusCodes } from 'http-status-codes'
import {
  fetchExportData,
  toCSV,
  getExportManifest,
  VALID_COLLECTIONS,
} from '../services/exportService.js';
import { logActivity } from '../services/eventService.js';

const router = express.Router();

// All export routes are admin-only
router.use(protect, authorize('admin'));

// GET /admin/export/manifest — list all exportable collections and counts
router.get(
  '/manifest',
  asyncHandler(async (req, res) => {
    const manifest = await getExportManifest();
    res.json({ collections: manifest, validKeys: VALID_COLLECTIONS });
  })
);

// GET /admin/export/:collection — export a collection as JSON or CSV
router.get(
  '/:collection',
  asyncHandler(async (req, res) => {
    const { collection } = req.params;
    const { format = 'json', limit = 5000, skip = 0 } = req.query;

    if (!VALID_COLLECTIONS.includes(collection)) {
      throw new AppError(
        `Invalid collection "${collection}". Valid: ${VALID_COLLECTIONS.join(', ')}`,
        StatusCodes.BAD_REQUEST
      );
    }

    const records = await fetchExportData(collection, {
      limit: parseInt(limit),
      skip:  parseInt(skip),
    });

    // Log admin data export activity
    logActivity({
      userId:   req.user._id,
      role:     'admin',
      action:   'EXPORT_DATASET',
      module:   'export',
      targetId: null,
      ...req.reqCtx,
    });

    if (format === 'csv') {
      const csv = toCSV(records);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${collection}_${Date.now()}.csv"`);
      return res.send(csv);
    }

    // Default: JSON
    res.json({
      collection,
      count:   records.length,
      records,
    });
  })
);

export default router;
