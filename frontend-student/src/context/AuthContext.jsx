import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('student_user')) || null; }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('student_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => {
          const u = res.data.data;
          if (u.role !== 'STUDENT') {
            // Non-student tried to log in here
            logout();
            return;
          }
          setUser(u);
          localStorage.setItem('student_user', JSON.stringify(u));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((tokenVal, userData) => {
    setToken(tokenVal);
    setUser(userData);
    localStorage.setItem('student_token', tokenVal);
    localStorage.setItem('student_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
