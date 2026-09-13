const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WORKER_SESSION_KEY = 'servecircle_worker_session';

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const apiRequest = async (path, { method = 'GET', token, body } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await readJson(response);

  if (!response.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }

  return data;
};

export const getWorkerSession = () => {
  const raw = localStorage.getItem(WORKER_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.token || parsed?.user?.role !== 'worker') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const setWorkerSession = (session) => {
  localStorage.setItem(WORKER_SESSION_KEY, JSON.stringify(session));
};

export const clearWorkerSession = () => {
  localStorage.removeItem(WORKER_SESSION_KEY);
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
  const endpoint = action === 'accept' ? 'accept' : 'reject';
  return apiRequest(`/bookings/${bookingId}/${endpoint}`, {
    method: 'PATCH',
    token,
  });
};

export const updateWorkerJobStatus = async (token, bookingId, status) => {
  const endpointByStatus = {
    'en-route': 'en-route',
    arrived: 'arrive',
    completed: 'complete',
  };
  const endpoint = endpointByStatus[status];
  if (!endpoint) throw new Error(`Unsupported worker status action: ${status}`);

  return apiRequest(`/bookings/${bookingId}/${endpoint}`, {
    method: 'PATCH',
    token,
  });
};

export const verifyWorkerOtp = async (token, bookingId, type, otp) => {
  const endpoint = type === 'start' ? 'start-otp/verify' : 'end-otp/verify';
  return apiRequest(`/bookings/${bookingId}/${endpoint}`, {
    method: 'POST',
    token,
    body: { otp },
  });
};
