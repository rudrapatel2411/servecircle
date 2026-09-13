/**
 * eventMiddleware.js — Phase 2 AI Data Foundation
 *
 * Attaches requestId, ipAddress, and userAgent to every request
 * so that all downstream event logging has consistent HTTP context.
 *
 * Usage: app.use(eventMiddleware) — mount BEFORE routes in server.js
 */

import crypto from 'crypto';

/**
 * Attach event context to every request.
 * Sets req.reqCtx = { requestId, ipAddress, userAgent }
 * which services pass to eventService.logEvent().
 */
export function eventMiddleware(req, res, next) {
  req.reqCtx = {
    requestId: crypto.randomUUID(),
    ipAddress: req.ip || req.socket?.remoteAddress,
    userAgent: req.get('User-Agent') || '',
  };
  next();
}
