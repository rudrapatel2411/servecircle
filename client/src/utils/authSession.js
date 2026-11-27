const SESSION_KEY = 'servecircle_session';
const CUSTOMER_SESSION_KEY = 'servecircle_customer_session';
const WORKER_SESSION_KEY = 'servecircle_worker_session';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const isDemoToken = (token) =>
  typeof token === 'string' && (token.startsWith('demo-') || token.startsWith('demo_'));

/**
 * Checks if a JWT token has expired.
 * Demo tokens (e.g. 'demo-token-worker', 'demo_...') never expire.
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  if (isDemoToken(token)) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
};

export const getSession = () => {
  let raw = localStorage.getItem(SESSION_KEY);
  let session = null;

  if (raw) {
    try {
      session = JSON.parse(raw);
    } catch {
      session = null;
    }
  }

  // Fallback to worker session if session is not in SESSION_KEY
  if (!session?.token) {
    const workerRaw = localStorage.getItem(WORKER_SESSION_KEY);
    if (workerRaw) {
      try {
        const workerParsed = JSON.parse(workerRaw);
        if (workerParsed?.token && workerParsed?.user?.role === 'worker') {
          session = workerParsed;
        }
      } catch {
        // ignore
      }
    }
  }

  if (!session?.token || !session?.user?.role) return null;

  // Check JWT expiration
  if (isTokenExpired(session.token)) {
    clearSession();
    return null;
  }

  return session;
};

export const getCustomerSession = () => {
  const tryParse = (raw) => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.user?.role === 'customer' && !isTokenExpired(parsed.token)) {
        return parsed;
      }
    } catch {}
    return null;
  };
  return tryParse(localStorage.getItem(CUSTOMER_SESSION_KEY)) || tryParse(localStorage.getItem(SESSION_KEY));
};

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (session?.user?.role === 'worker') {
    localStorage.setItem(WORKER_SESSION_KEY, JSON.stringify(session));
  } else if (session?.user?.role === 'customer') {
    localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(WORKER_SESSION_KEY);
};

export const requestAuth = async (path, body) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Authentication request failed');
  }

  return data;
};

export const requestApi = async (path, { method = 'GET', token, body } = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !isDemoToken(token)) {
    clearSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.dispatchEvent(new CustomEvent('servecircle:session-expired'));
    }
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
};

export const roleHome = {
  customer: '/customer',
  worker: '/worker',
  admin: '/admin',
  b2b: '/b2b',
};
