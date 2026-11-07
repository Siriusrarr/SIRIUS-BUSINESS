import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi.me()
      .then((data) => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const data = await authApi.login(credentials);
      setUser(data.user);
      return data.user;
    },
    async register(details) {
      const data = await authApi.register(details);
      setUser(data.user);
      return data.user;
    },
    async selectPlan(plan) {
      const data = await authApi.selectPlan(plan);
      setUser(data.user);
      return data.user;
    },
    async logout() {
      try {
        await authApi.logout();
      } finally {
        setUser(null);
      }
    },
    refreshUser: async () => {
      const data = await authApi.me();
      setUser(data.user);
      return data.user;
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return value;
}
