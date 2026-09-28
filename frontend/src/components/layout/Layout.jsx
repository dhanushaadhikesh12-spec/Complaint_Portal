import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Settings,
  Bell, LogOut, Shield, Activity, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllNotificationsRead } from '../../api/services';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/complaints',  icon: FileText,        label: 'Complaints & SLA' },
  { to: '/students',    icon: Users,           label: 'Student Directory' },
  { to: '/admin-users', icon: Shield,          label: 'Staff Management', adminOnly: true },
  { to: '/audit',       icon: Activity,        label: 'Audit Logs',       adminOnly: true },
  { to: '/settings',    icon: Settings,        label: 'Settings',         adminOnly: true },
];

export default function Layout({ children, title, subtitle }) {
  const { user, logout, canManage, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  const notifList = Array.isArray(notifs) ? notifs : [];
  const unread = notifList.filter(n => !n.read && !n.isRead).length;

  useEffect(() => {
    getNotifications()
      .then(res => {
        const raw = res.data?.data;
        const list = raw?.content || (Array.isArray(raw) ? raw : []);
        setNotifs(list);
      })
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
      await markAllNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    } catch {}
  };

  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD';

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
            <h1>ADMIN CONSOLE</h1>
            <p>Campus Grievance System</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Administration</span>
          {navItems.map((item) => {
            if (item.adminOnly && !canManage) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.fullName || 'Administrator'}</div>
            <div className="user-role">{user?.role?.replace('_', ' ') || 'Admin Staff'}</div>
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
              <h2>{title || 'Dashboard'}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>

          <div className="header-right">
            {/* System Status Pill */}
            <span className="badge badge-resolved" style={{ fontSize: 11 }}>
              <span className="badge-dot" />
              <span>System Active</span>
            </span>

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
                  width: 340, backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200, overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>System Alerts & Activity</span>
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

                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifList.length === 0 ? (
                      <div className="empty-state" style={{ padding: '24px 16px' }}>
                        <Bell size={24} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                        <p style={{ fontSize: 12 }}>No new alerts</p>
                      </div>
                    ) : (
                      notifList.slice(0, 10).map(n => (
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
                            <Shield size={13} />
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
                </div>
              )}
            </div>

            {/* Admin Avatar */}
            <div
              className="user-avatar"
              style={{ width: 34, height: 34, fontSize: 12 }}
              title={user?.fullName}
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
