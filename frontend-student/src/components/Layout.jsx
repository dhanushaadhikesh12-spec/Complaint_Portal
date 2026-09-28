import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, Bell, User, LogOut,
  Shield, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllNotificationsRead } from '../api/services';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/complaints',  icon: FileText,        label: 'My Complaints' },
  { to: '/new',         icon: PlusCircle,      label: 'Create Complaint' },
  { to: '/notifications', icon: Bell,          label: 'Notifications' },
  { to: '/profile',     icon: User,            label: 'Profile' },
];

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    getNotifications()
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
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <h1>Student Portal</h1>
              <p>Campus Complaint System</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section">Navigation</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} />
              {item.label}
              {item.to === '/notifications' && unread > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10, fontWeight: 700,
                  background: '#ef4444', color: '#fff',
                  borderRadius: 99, padding: '1px 6px',
                  minWidth: 18, textAlign: 'center',
                }}>
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <p className="truncate">{user?.fullName || 'Student'}</p>
            <span>{user?.username || user?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <h2 className="topbar-title">{title}</h2>
          <div className="topbar-actions">
            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="icon-btn"
                onClick={() => setShowNotifs(!showNotifs)}
                title="Notifications"
              >
                <Bell size={16} />
                {unread > 0 && <span className="notif-dot" />}
              </button>

              {showNotifs && (
                <div className="notif-panel">
                  <div className="notif-header">
                    <h4>Notifications {unread > 0 && <span style={{ color: 'var(--primary-400)', fontSize: 12 }}>({unread} new)</span>}</h4>
                    {unread > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ fontSize: 11, color: 'var(--primary-400)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifs.length === 0 ? (
                      <div className="empty-state" style={{ padding: 28 }}>
                        <Bell size={28} />
                        <p>You're all caught up!</p>
                      </div>
                    ) : notifs.slice(0, 12).map((n) => (
                      <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                        <div className="notif-icon">
                          {n.type === 'RESOLVED' ? <CheckCircle size={14} /> :
                           n.type === 'ESCALATION' ? <AlertTriangle size={14} /> :
                           <Bell size={14} />}
                        </div>
                        <div className="notif-content">
                          <p>{n.message}</p>
                          <span>{n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
