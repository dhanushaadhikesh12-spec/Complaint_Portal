import React, { useEffect, useState } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import { getStudentNotifications, markStudentNotificationRead, markAllStudentNotificationsRead } from '../../api/services';
import { Bell, CheckCircle2, AlertCircle, Info, Check, ArrowRight } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

export default function StudentNotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    getStudentNotifications()
      .then(res => setNotifs(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markStudentNotificationRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllStudentNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const unread = notifs.filter(n => !n.read && !n.isRead).length;

  if (loading) {
    return (
      <StudentLayout title="Notifications">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading notifications...</span>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title="Notifications & Alerts"
      subtitle="Stay updated on status changes, assignments, and resolution notes"
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {unread > 0 ? `${unread} unread alert${unread > 1 ? 's' : ''}` : 'All notifications read'}
          </div>
          {unread > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              <Check size={14} />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {notifs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bell size={28} />
              </div>
              <h3>No Notifications Yet</h3>
              <p>You are all caught up! You will receive automatic alerts when staff updates your complaints.</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              {notifs.map((n, idx) => {
                const isUnread = !n.read && !n.isRead;
                return (
                  <div
                    key={n.id || idx}
                    style={{
                      padding: '16px 20px',
                      borderBottom: idx === notifs.length - 1 ? 'none' : '1px solid #e2e8f0',
                      backgroundColor: isUnread ? '#f0f7ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: isUnread ? '#e0effe' : '#f1f5f9',
                      color: isUnread ? '#0284c7' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Bell size={16} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, color: '#0f172a', fontWeight: isUnread ? 600 : 400, lineHeight: 1.5 }}>
                        {n.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                          {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                        </span>
                        {isUnread && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
