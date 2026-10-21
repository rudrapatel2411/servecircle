const SESSION_KEY = 'servecircle_session';
const WORKER_SESSION_KEY = 'servecircle_worker_session';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Checks if a JWT token has expired.
 * Demo tokens (e.g. 'demo-token-worker', 'demo_...') never expire.
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  if (token.startsWith('demo-') || token.startsWith('demo_')) return false;

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

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (session?.user?.role === 'worker') {
    localStorage.setItem(WORKER_SESSION_KEY, JSON.stringify(session));
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(WORKER_SESSION_KEY);
};

export const requestAuth = async (path, body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

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

  if (response.status === 401) {
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

