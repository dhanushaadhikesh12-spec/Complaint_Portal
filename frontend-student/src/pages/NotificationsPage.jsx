import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/services';
import { Bell, CheckCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

function getNotifIcon(type) {
  if (type === 'RESOLVED' || type === 'CLOSED') return <CheckCircle size={16} />;
  if (type === 'ESCALATION') return <AlertTriangle size={16} />;
  if (type === 'ACTION_REQUIRED' || type === 'FEEDBACK_REQUESTED') return <Info size={16} />;
  return <Bell size={16} />;
}

function getNotifColor(type) {
  if (type === 'RESOLVED' || type === 'CLOSED') return '#10b981';
  if (type === 'ESCALATION') return '#f97316';
  if (type === 'ACTION_REQUIRED') return '#fbbf24';
  return 'var(--primary-400)';
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    getNotifications()
      .then(res => setNotifs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const unread = notifs.filter(n => !n.read).length;

  if (loading) return (
    <Layout title="Notifications">
      <div className="loading-page"><div className="spinner" /><span>Loading notifications...</span></div>
    </Layout>
  );

  return (
    <Layout title="Notifications">
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Notifications</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              <Check size={13} /> Mark all read
            </button>
          )}
        </div>

        {notifs.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <Bell size={48} style={{ marginBottom: 16 }} />
            <h3>You're all caught up!</h3>
            <p>No new notifications. You'll be notified when your complaint status changes.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifs.map(n => (
              <div
                key={n.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  cursor: 'default',
                  background: !n.read ? 'rgba(16,185,129,0.04)' : 'var(--bg-card)',
                  borderColor: !n.read ? 'rgba(16,185,129,0.15)' : 'var(--border-subtle)',
                  padding: '14px 16px',
                }}
              >
                <div style={{
                  width: 38, height: 38,
                  borderRadius: '50%',
                  background: `${getNotifColor(n.type)}18`,
                  color: getNotifColor(n.type),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {getNotifIcon(n.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {n.title && <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{n.title}</h4>}
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                  {n.complaint && (
                    <p style={{ fontSize: 11, color: 'var(--primary-400)', marginTop: 4, fontFamily: 'monospace' }}>
                      {n.complaint.complaintId} — {n.complaint.title}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                    {n.createdAt && ` · ${format(new Date(n.createdAt), 'MMM d, h:mm a')}`}
                  </p>
                </div>

                {!n.read && (
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Mark as read"
                    onClick={() => handleMarkRead(n.id)}
                    style={{ flexShrink: 0 }}
                  >
                    <Check size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
