import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => {
          const u = res.data.data;
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((tokenVal, userData) => {
    setToken(tokenVal);
    setUser(userData);
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('student_token', tokenVal);
    localStorage.setItem('student_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
  }, []);

  const isStudent    = user?.role === 'STUDENT';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isDeptAdmin  = user?.role === 'DEPARTMENT_ADMIN';
  const isHandler    = user?.role === 'COMPLAINT_HANDLER';
  const isAdmin      = isSuperAdmin || isDeptAdmin || isHandler;
  const canManage    = isSuperAdmin || isDeptAdmin;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isStudent, isAdmin, isSuperAdmin, isDeptAdmin, isHandler, canManage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
