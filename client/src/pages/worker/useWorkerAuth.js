import { useEffect, useMemo, useState } from 'react';
import {
  clearWorkerSession,
  fetchWorkerProfile,
  getWorkerSession,
  loginWorker,
  setWorkerSession,
} from './workerApi';

export const useWorkerAuth = () => {
  const [session, setSession] = useState(() => getWorkerSession());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const token = session?.token || null;
  const user = session?.user || null;

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);

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
    if (!token) return null;

    try {
      const profile = await fetchWorkerProfile(token);
      const nextSession = {
        ...session,
        user: profile,
      };
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
    if (!token) return;
    refreshProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    token,
    user,
    isAuthenticated,
    authLoading,
    authError,
    signIn,
    signOut,
    refreshProfile,
  };
};
