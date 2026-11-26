import { isTokenExpired } from '../../utils/authSession.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WORKER_SESSION_KEY = 'servecircle_worker_session';

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const sanitizePath = (path) => {
  return String(path || '')
    .replace(/\/#[a-zA-Z0-9_-]+/g, (match) => '/' + match.slice(2))
    .replace(/#([a-zA-Z0-9_-]+)/g, '$1');
};

const apiRequest = async (path, { method = 'GET', token, body } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const cleanPath = sanitizePath(path);
  const response = await fetch(`${API_BASE}${cleanPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    clearWorkerSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.dispatchEvent(new CustomEvent('servecircle:session-expired'));
    }
  }

  const data = await readJson(response);

  if (!response.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const getWorkerSession = () => {
  let raw = localStorage.getItem(WORKER_SESSION_KEY);
  if (!raw) {
    raw = localStorage.getItem('servecircle_session');
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.token || parsed?.user?.role !== 'worker') return null;
    if (isTokenExpired(parsed.token)) {
      clearWorkerSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const setWorkerSession = (session) => {
  localStorage.setItem(WORKER_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem('servecircle_session', JSON.stringify(session));
};

export const clearWorkerSession = () => {
  localStorage.removeItem(WORKER_SESSION_KEY);
  const general = localStorage.getItem('servecircle_session');
  if (general) {
    try {
      const parsed = JSON.parse(general);
      if (parsed?.user?.role === 'worker') {
        localStorage.removeItem('servecircle_session');
      }
    } catch {
      // ignore
    }
  }
};

export const loginWorker = async (email, password) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (data?.user?.role !== 'worker') {
    throw new Error('This account is not a worker account');
  }

  const session = {
    token: data.token,
    user: data.user,
  };

  setWorkerSession(session);
  return session;
};

export const fetchWorkerProfile = async (token) => {
  return apiRequest('/users/me', { token });
};

export const updateWorkerProfile = async (token, updates) => {
  return apiRequest('/users/me', {
    method: 'PUT',
    token,
    body: updates,
  });
};

export const fetchWorkerJobs = async (token, status) => {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  return apiRequest(`/bookings/jobs${query}`, { token });
};

export const respondToJobRequest = async (token, bookingId, action) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  const endpoint = action === 'accept' ? 'accept' : 'reject';
  return apiRequest(`/bookings/${cleanId}/${endpoint}`, {
    method: 'PATCH',
    token,
  });
};

export const updateWorkerJobStatus = async (token, bookingId, status) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  const endpointByStatus = {
    'en-route': 'en-route',
    arrived: 'arrive',
    completed: 'complete',
  };
  const endpoint = endpointByStatus[status];
  if (!endpoint) throw new Error(`Unsupported worker status action: ${status}`);

  return apiRequest(`/bookings/${cleanId}/${endpoint}`, {
    method: 'PATCH',
    token,
  });
};

export const verifyWorkerOtp = async (token, bookingId, type, otp) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  const endpoint = type === 'start' ? 'start-otp/verify' : 'end-otp/verify';
  return apiRequest(`/bookings/${cleanId}/${endpoint}`, {
    method: 'POST',
    token,
    body: { otp },
  });
};

export const updateDutyStatus = async (token, { dutyStatus, latitude, longitude }) => {
  return apiRequest('/users/worker/duty-status', {
    method: 'PATCH',
    token,
    body: { dutyStatus, latitude, longitude },
  });
};

export const fetchWorkerAvailability = async (token, workerId) => {
  const query = workerId ? `?workerId=${encodeURIComponent(workerId)}` : '';
  return apiRequest(`/users/worker/availability${query}`, { token });
};

export const saveWorkerAvailability = async (token, slots) => {
  return apiRequest('/users/worker/availability', {
    method: 'PUT',
    token,
    body: { slots },
  });
};

export const requestWorkerLeave = async (token, { startDate, endDate, reason }) => {
  return apiRequest('/users/worker/leave', {
    method: 'POST',
    token,
    body: { startDate, endDate, reason },
  });
};

export const deleteWorkerLeave = async (token, leaveId) => {
  return apiRequest(`/users/worker/leave/${leaveId}`, {
    method: 'DELETE',
    token,
  });
};

// ─────────────────────────────────────────────
// WORKER OPERATIONS EXTENSIONS (MILESTONES M2–M6)
// ─────────────────────────────────────────────

export const fetchBookingMessages = async (token, bookingId) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/messages`, { token });
};

export const sendBookingMessage = async (token, bookingId, text) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/messages`, {
    method: 'POST',
    token,
    body: { text },
  });
};

export const initiateBookingCall = async (token, bookingId) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/call`, {
    method: 'POST',
    token,
  });
};

export const uploadBookingProof = async (token, bookingId, { type, imageUrl, notes }) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/proof`, {
    method: 'POST',
    token,
    body: { type, imageUrl, notes },
  });
};

export const fetchBookingProofs = async (token, bookingId) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/proofs`, { token });
};

export const submitQuoteRevision = async (token, bookingId, { items, totalAmount, notes }) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/quote-revision`, {
    method: 'POST',
    token,
    body: { items, totalAmount, notes },
  });
};

export const fetchQuoteRevisions = async (token, bookingId) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/quote-revisions`, { token });
};

export const decideQuoteRevision = async (token, bookingId, revisionId, decision, customerNote) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  const cleanRevId = encodeURIComponent(String(revisionId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/quote-revision/${cleanRevId}/decision`, {
    method: 'PATCH',
    token,
    body: { decision, customerNote },
  });
};

export const collectCodPayment = async (token, bookingId, amountCollected) => {
  const cleanId = encodeURIComponent(String(bookingId || '').replace(/^#/, ''));
  return apiRequest(`/bookings/${cleanId}/cod-collect`, {
    method: 'POST',
    token,
    body: { amountCollected },
  });
};

export const fetchPayoutAccount = async (token) => {
  return apiRequest('/users/worker/payout-account', { token });
};

export const savePayoutAccount = async (token, accountData) => {
  return apiRequest('/users/worker/payout-account', {
    method: 'PUT',
    token,
    body: accountData,
  });
};

export const requestWithdrawal = async (token, amount) => {
  return apiRequest('/users/worker/withdraw', {
    method: 'POST',
    token,
    body: { amount },
  });
};

export const fetchWorkerLedger = async (token) => {
  return apiRequest('/users/worker/ledger', { token });
};

export const triggerWorkerSos = async (token, { bookingId, latitude, longitude, severity }) => {
  return apiRequest('/users/worker/sos', {
    method: 'POST',
    token,
    body: { bookingId, latitude, longitude, severity },
  });
};

export const fetchWorkerTraining = async (token) => {
  return apiRequest('/users/worker/training', { token });
};

export const completeWorkerTraining = async (token, { moduleName, score }) => {
  return apiRequest('/users/worker/training/complete', {
    method: 'POST',
    token,
    body: { moduleName, score },
  });
};

export const rateCustomer = async (token, bookingId, { rating, tags, comment }) => {
  return apiRequest(`/bookings/${bookingId}/rate-customer`, {
    method: 'POST',
    token,
    body: { rating, tags, comment },
  });
};
