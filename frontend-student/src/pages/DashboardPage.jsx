import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getStudentDashboard } from '../api/services';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Activity, PlusCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function getStatusBadge(status) {
  const map = {
    NEW: 'badge-new', VALIDATING: 'badge-validating',
    ASSIGNED: 'badge-assigned', IN_PROGRESS: 'badge-progress',
    RESOLVED: 'badge-resolved', STUDENT_VERIFICATION: 'badge-verify',
    CLOSED: 'badge-closed', ESCALATED: 'badge-escalated',
    REJECTED: 'badge-rejected', REOPENED: 'badge-reopened',
  };
  return map[status] || 'badge-new';
}

function getPriorityBadge(p) {
  const map = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
  return map[p] || 'badge-medium';
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getStudentDashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = data ? [
    { label: 'Total Complaints', value: data.totalComplaints, icon: FileText, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    { label: 'Pending Review', value: data.newComplaints, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'In Progress', value: data.inProgressComplaints, icon: Activity, color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
    { label: 'Resolved', value: data.resolvedComplaints, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Closed', value: data.closedComplaints, icon: XCircle, color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
    { label: 'Escalated', value: data.escalatedComplaints, icon: AlertTriangle, color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  ] : [];

  if (loading) return (
    <Layout title="Dashboard">
      <div className="loading-page"><div className="spinner" /><span>Loading your dashboard...</span></div>
    </Layout>
  );

  return (
    <Layout title="Dashboard">
      <div className="fade-in">
        {/* Welcome Banner */}
        <div className="card" style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(14,165,233,0.08) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                Welcome back! 👋
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Track your complaints and stay updated on their progress.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/new')}
            >
              <PlusCircle size={15} />
              New Complaint
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {statCards.map(s => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color, '--stat-bg': s.bg }}>
              <div className="stat-icon"><s.icon size={18} /></div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Complaints */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>
              <FileText size={16} style={{ color: 'var(--primary-400)' }} />
              Recent Complaints
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>
              View All <ArrowRight size={12} />
            </button>
          </div>

          {!data?.recentComplaints?.length ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <FileText size={32} />
              <h3>No complaints yet</h3>
              <p>Create your first complaint to report an issue.</p>
              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => navigate('/new')}>
                <PlusCircle size={14} /> Create Complaint
              </button>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0, background: 'transparent' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentComplaints.map(c => (
                    <tr key={c.id} onClick={() => navigate(`/complaints/${c.complaintId}`)}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary-400)', fontWeight: 700 }}>
                          {c.complaintId}
                        </span>
                      </td>
                      <td>
                        <div className="truncate" style={{ maxWidth: 200, fontWeight: 500, color: 'var(--text-primary)' }}>
                          {c.title}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, textTransform: 'capitalize' }}>
                          {c.category?.toLowerCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadge(c.priority)}`}>{c.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(c.status)}`}>
                          {c.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : '-'}
                      </td>
                      <td>
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
