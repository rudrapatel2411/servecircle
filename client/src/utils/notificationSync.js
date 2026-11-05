/**
 * notificationSync.js
 *
 * Multi-layer real-time notification sync utility for ServeCircle.
 * Ensures notifications are NEVER lost between Customer, Worker, and Admin panels:
 *   1. Cross-tab BroadcastChannel
 *   2. LocalStorage storage event (inter-tab broadcast fallback)
 *   3. Persistent caching in localStorage so switching tabs preserves alerts
 */

const CHANNEL_NAME = 'servecircle_cross_tab_notifications';
const STORAGE_KEY = 'servecircle_recent_notifications';

let channel = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    channel = null;
  }
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

/**
 * Get all cached recent notifications from localStorage
 */
export function getCachedNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Mark all cached notifications as read in localStorage
 */
export function markAllCachedNotificationsRead() {
  if (typeof window === 'undefined') return;
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
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
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = list.filter((item) => item.id !== id && item._id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Clear all notifications
 */
export function clearAllCachedNotifications() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {}
}

