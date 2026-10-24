import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('isic_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('isic_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const profile = await api.auth.getMe(token);
          setUser(profile);
          localStorage.setItem('isic_user', JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('isic_token', res.access_token);
    localStorage.setItem('isic_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (email, password, fullName) => {
    const res = await api.auth.register(email, password, fullName);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('isic_token', res.access_token);
    localStorage.setItem('isic_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('isic_token');
    localStorage.removeItem('isic_user');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
