import { useEffect, useMemo, useState } from 'react';
import {
  clearWorkerSession,
  fetchWorkerProfile,
  getWorkerSession,
  loginWorker,
  setWorkerSession,
} from './workerApi';

// ─── APPROVED STATUSES ────────────────────────────────────────────────────────
// Only these statuses can access the worker panel
const APPROVED_STATUSES = ['approved_rookie', 'approved_junior', 'approved_senior'];

// Return true only for the real demo token so real logins are never affected.
const isDemoToken = (token) => token === 'demo-token-worker';
// ─────────────────────────────────────────────────────────────────────────────

export const useWorkerAuth = () => {
  const [session, setSession] = useState(() => getWorkerSession());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const token = session?.token || null;
  const user = session?.user || null;

  // isAuthenticated only true if logged in AND approved to work
  const isAuthenticated = useMemo(() => {
    if (!token || !user) return false;
    if (isDemoToken(token)) return true; // demo always passes
    // Real user must be an approved worker
    return APPROVED_STATUSES.includes(user.workerStatus);
  }, [token, user]);

  // workerStatus for the current session user
  const workerStatus = user?.workerStatus || null;

  // Derived tier info for use in UI
  const workerTier = useMemo(() => {
    if (!user) return null;
    switch (user.workerStatus) {
      case 'approved_rookie': return { label: 'Rookie (Trainee)', color: '#dc2626', bg: '#fee2e2', emoji: '🎓', canSoloJob: false };
      case 'approved_junior': return { label: 'Junior Pro', color: '#2563eb', bg: '#dbeafe', emoji: '⭐', canSoloJob: true };
      case 'approved_senior': return { label: 'Senior Pro', color: '#7c3aed', bg: '#ede9fe', emoji: '🏆', canSoloJob: true };
      default: return null;
    }
  }, [user]);

  const signIn = async (email, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const nextSession = await loginWorker(email, password);
      setSession(nextSession);
      return nextSession;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = () => {
    clearWorkerSession();
    setSession(null);
  };

  const refreshProfile = async () => {
    if (isDemoToken(token)) return session?.user;

    try {
      const profile = await fetchWorkerProfile(token);
      const nextSession = { ...session, user: profile };
      setSession(nextSession);
      setWorkerSession(nextSession);
      return profile;
    } catch (err) {
      clearWorkerSession();
      setSession(null);
      throw err;
    }
  };

  useEffect(() => {
    if (!token || isDemoToken(token)) return;
    refreshProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    token,
    user,
    isAuthenticated,
    workerStatus,
    workerTier,
    authLoading,
    authError,
    signIn,
    signOut,
    refreshProfile,
    isDemoMode: isDemoToken(token),
  };
};
