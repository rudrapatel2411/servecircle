/**
 * Helper to identify and purge fake/mock hardcoded notifications
 */
export function isFakeNotification(notif) {
  if (!notif) return true;
  const str = JSON.stringify(notif).toLowerCase();
  if (
    str.includes('sc-2801') ||
    str.includes('summer20') ||
    str.includes('ramesh kumar') ||
    str.includes('biometric & badge') ||
    str.includes('no worker available') ||
    str.includes('no eligible worker') ||
    notif.id === 'notif_1' ||
    notif.id === 'notif_2' ||
    notif.id === 'notif_3' ||
    notif._id === 'notif_1' ||
    notif._id === 'notif_2' ||
    notif._id === 'notif_3'
  ) {
    return true;
  }
  return false;
}

/**
 * notificationSync.js
 *
 * Multi-layer real-time notification sync utility for ServeCircle.
 * Supports STRICT TARGETED NOTIFICATIONS:
 *  - Worker requests routed ONLY to matching service category (Home Repairs, etc.)
 *  - Customer acceptances routed ONLY to the specific customer
 *  - Zero leak to Admin, B2B, or unrelated workers/customers
 */

import { doesServiceMatchWorker } from './workerCategoryHelper.js';

const CHANNEL_NAME = 'servecircle_cross_tab_notifications';
const STORAGE_KEY = 'servecircle_recent_notifications';
const DISMISSED_KEY = 'servecircle_dismissed_notif_ids';
const READ_KEY = 'servecircle_read_notif_ids';
const CLEANED_FLAG_KEY = 'servecircle_notifs_cleaned_v2';

let channel = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    channel = null;
  }
}

/**
 * One-time cleaner to purge legacy spam/cluttered notifications
 */
const PURGE_STAMP_KEY = 'servecircle_purge_stamp_v8';

export function purgeLegacySpamNotifications() {
  if (typeof window === 'undefined') return;
  try {
    if (!localStorage.getItem(PURGE_STAMP_KEY)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DISMISSED_KEY);
      localStorage.removeItem(READ_KEY);
      localStorage.removeItem('servecircle_recent_notifications');
      localStorage.removeItem('servecircle_notifs_cleaned_v2');
      localStorage.setItem(PURGE_STAMP_KEY, 'true');
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        const clean = list.filter((item) => !isFakeNotification(item));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      }
    }
  } catch {}
}

// Auto-purge once on module load
purgeLegacySpamNotifications();

/**
 * Filter to determine if a notification strictly belongs to the current user and panel
 */
export function isNotificationTargetedForSession(notif, { panel, user, workerCategory }) {
  if (!notif || isFakeNotification(notif)) return false;

  // 1. Strict Target Role Isolation
  if (notif.targetRole) {
    if (notif.targetRole !== panel) {
      return false; // Wrong panel! Admin, B2B, Worker, Customer completely isolated
    }
  } else if (notif.targetAudience && notif.targetAudience !== 'all' && notif.targetAudience !== panel) {
    return false;
  }

  // 2. Worker panel: Strict category isolation (Home Repairs worker only gets Home Repairs)
  if (panel === 'worker') {
    const title = String(notif.title || '').toLowerCase();
    const msg = String(notif.message || '').toLowerCase();

    // Block administrative logs from leaking to worker feed
    if (
      title === 'new booking' ||
      title === 'booking assigned' ||
      title.includes('no worker available') ||
      msg.includes('assign manually or retry dispatch')
    ) {
      return false;
    }

    const reqCategory = notif.targetCategory || notif.category;
    const reqService = notif.service || notif.serviceType;
    if (reqCategory || reqService) {
      if (!doesServiceMatchWorker(workerCategory, reqCategory, reqService)) {
        return false; // Belongs to another service sector!
      }
    }
    if (notif.targetWorkerId && user) {
      const uId = user._id || user.id;
      if (notif.targetWorkerId !== uId && notif.targetWorkerId !== user.email) {
        return false;
      }
    }
  }

  // 3. Customer panel: Strict customer identity isolation (Only the booking customer gets their own updates)
  if (panel === 'customer') {
    if (notif.targetRole && notif.targetRole !== 'customer') {
      return false;
    }
    const title = String(notif.title || '').toLowerCase();
    const msg = String(notif.message || '').toLowerCase();

    // Block admin alerts or worker job requests from customer view
    if (
      title.includes('new booking') ||
      title.includes('booking assigned') ||
      title.includes('no worker available') ||
      title.includes('request (within 15 km)') ||
      notif.type === 'booking_request'
    ) {
      return false;
    }

    if (notif.targetCustomerId && user) {
      const uId = user._id || user.id;
      if (notif.targetCustomerId !== uId) return false;
    }
    if (notif.targetCustomerEmail && user?.email) {
      if (notif.targetCustomerEmail.toLowerCase() !== user.email.toLowerCase()) return false;
    }
    if (notif.targetCustomerName && user?.name) {
      const uName = user.name.toLowerCase().trim();
      const tName = notif.targetCustomerName.toLowerCase().trim();
      if (!uName.includes(tName) && !tName.includes(uName)) {
        return false;
      }
    }
    if (user?.name && msg.includes('created by ') && !msg.includes(user.name.toLowerCase())) {
      return false;
    }
    if (user?.name && msg.includes('requested by ') && !msg.includes(user.name.toLowerCase())) {
      return false;
    }

    // If it's a booking-related notification, ensure it strictly belongs to this customer
    const isBookingNotif =
      title.includes('booking') ||
      title.includes('specialist') ||
      title.includes('assigned') ||
      msg.includes('booking') ||
      notif.bookingId;
    if (isBookingNotif) {
      const hasTarget = notif.targetCustomerId || notif.targetCustomerEmail || notif.targetCustomerName;
      if (!hasTarget && notif.bookingId) {
        try {
          const recent = JSON.parse(localStorage.getItem('servecircle_customer_recent_bookings') || '[]');
          const matchesRecent = recent.some(
            (b) => b.id === notif.bookingId || b.bookingId === notif.bookingId || b._id === notif.bookingId
          );
          if (!matchesRecent) return false;
        } catch {}
      }
    }
  }

  // 4. Admin / B2B panels: Block consumer booking spam
  if (panel === 'admin' || panel === 'b2b') {
    if (notif.targetRole === 'worker' || notif.targetRole === 'customer') {
      return false;
    }
    if (['booking_request', 'booking_accepted', 'worker_arrived', 'quote_received'].includes(notif.type)) {
      return false;
    }
  }

  return true;
}

/**
 * Broadcast an event to all open tabs/windows in the browser
 */
export function broadcastNotificationToTabs(eventPayload) {
  if (typeof window === 'undefined') return;

  const enriched = {
    id: eventPayload.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toLocaleString('en-IN'),
    timestamp: new Date().toISOString(),
    read: false,
    ...eventPayload,
  };

  // 1. BroadcastChannel (instant in-memory cross-tab)
  if (channel) {
    try {
      channel.postMessage(enriched);
    } catch {}
  }

  // 2. LocalStorage trigger (triggers window 'storage' event in other tabs)
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = [enriched, ...existing.filter((n) => n.id !== enriched.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Trigger custom event for current window too
    window.dispatchEvent(new CustomEvent('servecircle:local-notification', { detail: enriched }));
  } catch {}
}

/**
 * Listen for cross-tab notifications
 */
export function subscribeToCrossTabNotifications(onNotification) {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (e) => {
    if (e.data) onNotification(e.data);
  };

  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const notifs = JSON.parse(e.newValue);
        if (notifs && notifs.length > 0) {
          onNotification(notifs[0]);
        }
      } catch {}
    }
  };

  const handleCustom = (e) => {
    if (e.detail) onNotification(e.detail);
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }
  window.addEventListener('storage', handleStorage);
  window.addEventListener('servecircle:local-notification', handleCustom);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('servecircle:local-notification', handleCustom);
  };
}

export function getDismissedNotificationIds() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getReadNotificationIds() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Get all cached recent notifications from localStorage, optionally filtered for session
 */
export function getCachedNotifications(sessionContext = null) {
  if (typeof window === 'undefined') return [];
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const dismissed = new Set(getDismissedNotificationIds());
    const readIds = new Set(getReadNotificationIds());
    return list
      .filter((item) => !dismissed.has(item.id) && !dismissed.has(item._id))
      .filter((item) => !sessionContext || isNotificationTargetedForSession(item, sessionContext))
      .map((item) => ({
        ...item,
        read: item.read || readIds.has(item.id) || readIds.has(item._id),
      }));
  } catch {
    return [];
  }
}

/**
 * Mark a specific notification as read in localStorage
 */
export function markCachedNotificationRead(id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const readIds = getReadNotificationIds();
    if (!readIds.includes(id)) {
      localStorage.setItem(READ_KEY, JSON.stringify([id, ...readIds].slice(0, 200)));
    }
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = list.map((item) =>
      item.id === id || item._id === id ? { ...item, read: true } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Mark all cached notifications as read in localStorage
 */
export function markAllCachedNotificationsRead(extraIds = []) {
  if (typeof window === 'undefined') return;
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const readIds = new Set([...getReadNotificationIds(), ...extraIds]);
    list.forEach((item) => {
      if (item.id) readIds.add(item.id);
      if (item._id) readIds.add(item._id);
    });
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(readIds).slice(0, 300)));
    const updated = list.map((item) => ({ ...item, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Dismiss/delete a specific notification by ID from localStorage
 */
export function dismissCachedNotification(id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const dismissed = getDismissedNotificationIds();
    if (!dismissed.includes(id)) {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([id, ...dismissed].slice(0, 300)));
    }
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = list.filter((item) => item.id !== id && item._id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Clear all notifications completely
 */
export function clearAllCachedNotifications() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DISMISSED_KEY);
    localStorage.removeItem(READ_KEY);
    window.dispatchEvent(new CustomEvent('servecircle:notifications-cleared'));
  } catch {}
}
