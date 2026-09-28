import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Unified Auth
import LoginPage from './pages/LoginPage';

// Admin / Staff Pages
import DashboardPage from './pages/DashboardPage';
import ComplaintsPage from './pages/ComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import StudentsPage from './pages/StudentsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import SettingsPage from './pages/SettingsPage';

// Student Pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentComplaintsPage from './pages/student/StudentComplaintsPage';
import StudentComplaintDetailPage from './pages/student/StudentComplaintDetailPage';
import StudentNewComplaintPage from './pages/student/StudentNewComplaintPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-base)', flexDirection: 'column', gap: 16
    }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading portal...</span>
    </div>
  );
}

// Protected Route for Admin / Staff Users
function AdminRoute({ children, adminOnly }) {
  const { user, loading, isStudent, canManage } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (isStudent) return <Navigate to="/student/dashboard" replace />;
  if (adminOnly && !canManage) return <Navigate to="/dashboard" replace />;
  return children;
}

// Protected Route for Students
function StudentRoute({ children }) {
  const { user, loading, isStudent } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent) return <Navigate to="/dashboard" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading, isStudent } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return isStudent ? <Navigate to="/student/dashboard" replace /> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { user, isStudent } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            isStudent ? <Navigate to="/student/dashboard" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Root Smart Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* ========================================= */}
      {/* ADMIN & STAFF ROUTES                      */}
      {/* ========================================= */}
      <Route path="/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
      <Route path="/complaints" element={<AdminRoute><ComplaintsPage /></AdminRoute>} />
      <Route path="/complaints/:id" element={<AdminRoute><ComplaintDetailPage /></AdminRoute>} />
      <Route path="/students" element={<AdminRoute><StudentsPage /></AdminRoute>} />
      <Route path="/audit" element={<AdminRoute adminOnly><AuditLogsPage /></AdminRoute>} />
      <Route path="/admin-users" element={<AdminRoute adminOnly><AdminUsersPage /></AdminRoute>} />
      <Route path="/settings" element={<AdminRoute adminOnly><SettingsPage /></AdminRoute>} />

      {/* ========================================= */}
      {/* STUDENT ROUTES                            */}
      {/* ========================================= */}
      <Route path="/student/dashboard" element={<StudentRoute><StudentDashboardPage /></StudentRoute>} />
      <Route path="/student/complaints" element={<StudentRoute><StudentComplaintsPage /></StudentRoute>} />
      <Route path="/student/complaints/new" element={<StudentRoute><StudentNewComplaintPage /></StudentRoute>} />
      <Route path="/student/complaints/:complaintId" element={<StudentRoute><StudentComplaintDetailPage /></StudentRoute>} />
      <Route path="/student/notifications" element={<StudentRoute><StudentNotificationsPage /></StudentRoute>} />
      <Route path="/student/profile" element={<StudentRoute><StudentProfilePage /></StudentRoute>} />

      {/* Legacy / Helper student redirects */}
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="/new" element={<Navigate to="/student/complaints/new" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<RootRedirect />} />
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
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-muted)',
              borderRadius: '10px',
              fontSize: '13px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
