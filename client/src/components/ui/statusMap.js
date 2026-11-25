/**
 * ServeCircle Single-Source-of-Truth Status Map
 * Maps raw backend / mock status strings to pure design system status classes:
 * s-ok (green), s-warn (amber), s-bad (coral), s-info (blue), s-teal (teal),
 * s-violet (violet), s-slate (neutral fallback).
 *
 * NOTE: Keys on RAW status values (lowercased, normalized), NEVER on display text.
 */
export function statusToClass(rawStatus) {
  if (!rawStatus) return 's-slate';
  const s = String(rawStatus).toLowerCase().trim().replace(/_/g, '-').replace(/\s+/g, '-');

  // Completed / Success / Paid / Approved / Active
  if (['completed', 'complete', 'paid', 'verified', 'approved', 'success', 'resolved', 'active', 'analyzed', 'healthy'].includes(s)) {
    return 's-ok';
  }

  // Warning / Awaiting / Pending
  if (['pending', 'awaiting', 'queued', 'due', 'warning', 'analyzing', 'processing', 'paused', 'cant-resolve', 'open'].includes(s)) {
    return 's-warn';
  }

  // Cancelled / Failed / Rejected / Error
  if (['cancelled', 'canceled', 'failed', 'rejected', 'refunded', 'danger', 'emergency', 'error', 'not-found', 'offline'].includes(s)) {
    return 's-bad';
  }

  // Assigned / Info / Scheduled / Telemetry
  if (['assigned', 'allocated', 'dispatched', 'info', 'scheduled', 'readytojoin', 'uploaded', 'online'].includes(s)) {
    return 's-info';
  }

  // Confirmed / Booked / Accepted
  if (['confirmed', 'accepted', 'booked'].includes(s)) {
    return 's-teal';
  }

  // In Progress / Active Transit / Live Execution
  if (['in-progress', 'ongoing', 'working', 'started', 'en-route', 'arrived'].includes(s)) {
    return 's-violet';
  }

  // Idle / Draft / Fallback
  return 's-slate';
}

export default statusToClass;
