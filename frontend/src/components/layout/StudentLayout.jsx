import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, Bell, User, LogOut,
  Shield, Menu, X, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentNotifications, markAllStudentNotificationsRead } from '../../api/services';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/student/dashboard',      icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/student/complaints',     icon: FileText,        label: 'My Complaints', exact: true },
  { to: '/student/complaints/new', icon: PlusCircle,      label: 'Submit Complaint' },
  { to: '/student/notifications',  icon: Bell,            label: 'Notifications' },
  { to: '/student/profile',        icon: User,            label: 'Student Profile' },
];

export default function StudentLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  const notifList = Array.isArray(notifs) ? notifs : [];
  const unread = notifList.filter(n => !n.read && !n.isRead).length;

  useEffect(() => {
    getStudentNotifications()
      .then(res => setNotifs(res.data?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllStudentNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    } catch {}
  };

  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <Shield size={20} />
          </div>
          <div className="sidebar-brand-text">
            <h1>CAMPUS PORTAL</h1>
            <p>Student Grievance System</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Main Navigation</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {item.to === '/student/notifications' && unread > 0 && (
                <span className="nav-badge">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.fullName || 'Student User'}</div>
            <div className="user-role">{user?.studentId || 'ID: Active'}</div>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="header-title-wrap">
              <h2>{title || 'Student Portal'}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>

          <div className="header-right">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/student/complaints/new')}
            >
              <PlusCircle size={14} />
              <span>Submit Complaint</span>
            </button>

            {/* Notification Center */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setShowNotifs(!showNotifs)}
                title="Notifications"
                style={{ position: 'relative' }}
              >
                <Bell size={16} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }} />
                )}
              </button>

              {showNotifs && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  width: 320, backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200, overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Notifications</span>
                    {unread > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 11.5, color: 'var(--brand-blue)', fontWeight: 600
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {notifList.length === 0 ? (
                      <div className="empty-state" style={{ padding: '24px 16px' }}>
                        <Bell size={24} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                        <p style={{ fontSize: 12 }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifList.slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border-light)',
                            backgroundColor: (!n.read && !n.isRead) ? '#f0f7ff' : 'transparent',
                            display: 'flex', gap: 10, alignItems: 'flex-start'
                          }}
                        >
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            backgroundColor: '#e0effe', color: '#0369a1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: 2
                          }}>
                            <Bell size={13} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12.5, color: 'var(--text-main)', lineHeight: 1.4 }}>{n.message}</p>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                              {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ padding: 8, textAlign: 'center', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-muted)' }}>
                    <button
                      onClick={() => { setShowNotifs(false); navigate('/student/notifications'); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--brand-blue)', fontWeight: 600 }}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Quick Link */}
            <div
              onClick={() => navigate('/student/profile')}
              className="user-avatar"
              style={{ cursor: 'pointer', width: 34, height: 34, fontSize: 12 }}
              title="View Profile"
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
