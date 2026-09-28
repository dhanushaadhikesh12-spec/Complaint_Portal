import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import ComplaintsPage     from './pages/ComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import NewComplaintPage   from './pages/NewComplaintPage';
import NotificationsPage  from './pages/NotificationsPage';
import ProfilePage        from './pages/ProfilePage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0a0f1a', flexDirection: 'column', gap: 16
    }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: '#5e7a9a', fontSize: 14 }}>Loading...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  // Extra safety: if somehow an admin token ends up here
  if (user.role !== 'STUDENT') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0f1a', flexDirection: 'column', gap: 16, padding: 24,
      }}>
        <h2 style={{ color: '#f87171', fontSize: 20, fontWeight: 700 }}>Access Denied</h2>
        <p style={{ color: '#5e7a9a', fontSize: 14, textAlign: 'center' }}>
          This portal is for students only. Please use the Admin Portal at localhost:5173.
        </p>
        <button
          onClick={() => { localStorage.removeItem('student_token'); localStorage.removeItem('student_user'); window.location.href = '/login'; }}
          style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
        >
          Go to Student Login
        </button>
      </div>
    );
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route path="/"                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/complaints"        element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
      <Route path="/complaints/:complaintId" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
      <Route path="/new"               element={<ProtectedRoute><NewComplaintPage /></ProtectedRoute>} />
      <Route path="/notifications"     element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111d2e',
              color: '#f0f6ff',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '10px',
              fontSize: '13px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
