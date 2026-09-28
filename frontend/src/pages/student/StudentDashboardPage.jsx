import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import { getStudentDashboard } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Clock, CheckCircle2, AlertCircle, PlusCircle,
  ArrowRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function getStatusBadge(status) {
  switch (status) {
    case 'RESOLVED':
      return <span className="badge badge-resolved"><span className="badge-dot" />Resolved</span>;
    case 'IN_PROGRESS':
    case 'ASSIGNED':
      return <span className="badge badge-progress"><span className="badge-dot" />In Progress</span>;
    case 'NEW':
    case 'VALIDATING':
    case 'STUDENT_VERIFICATION':
      return <span className="badge badge-pending"><span className="badge-dot" />Pending Review</span>;
    case 'CLOSED':
      return <span className="badge badge-closed"><span className="badge-dot" />Closed</span>;
    case 'ESCALATED':
      return <span className="badge badge-escalated"><span className="badge-dot" />Escalated</span>;
    case 'REJECTED':
      return <span className="badge badge-urgent"><span className="badge-dot" />Rejected</span>;
    default:
      return <span className="badge badge-neutral">{status?.replace('_', ' ') || 'New'}</span>;
  }
}

function getPriorityBadge(priority) {
  switch (priority) {
    case 'CRITICAL':
      return <span className="badge badge-critical">Critical</span>;
    case 'HIGH':
      return <span className="badge badge-escalated">High</span>;
    case 'MEDIUM':
      return <span className="badge badge-pending">Medium</span>;
    case 'LOW':
    default:
      return <span className="badge badge-neutral">Low</span>;
  }
}

export default function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getStudentDashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = data?.totalComplaints || 0;
  const pending = (data?.newComplaints || 0) + (data?.validatingComplaints || 0);
  const inProgress = data?.inProgressComplaints || 0;
  const resolved = data?.resolvedComplaints || 0;

  if (loading) {
    return (
      <StudentLayout title="Dashboard" subtitle="Overview of your submitted grievances">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading student overview...</span>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      title="Student Dashboard"
      subtitle={`Welcome back, ${user?.fullName || 'Student'} • ID: ${user?.studentId || 'Active'}`}
    >
      {/* Welcome & Quick Action Card */}
      <div className="card" style={{ backgroundColor: '#ffffff', borderLeft: '4px solid #2563eb', marginBottom: 24 }}>
        <div className="card-body" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Have an issue or grievance on campus?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Submit an official complaint with photo evidence to trigger automatic routing and resolution tracking.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/student/complaints/new')}
          >
            <PlusCircle size={16} />
            <span>Submit New Complaint</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <FileText size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <AlertCircle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <FileText size={16} style={{ color: '#2563eb' }} />
              Recent Complaints
            </h3>
            <p className="card-subtitle">Track the status of your latest submitted tickets</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/student/complaints')}
          >
            <span>View All Complaints</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {!data?.recentComplaints?.length ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={28} />
              </div>
              <h3>No complaints submitted yet</h3>
              <p>You haven't filed any grievances. If you encounter any issues on campus, you can submit one anytime.</p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/student/complaints/new')}
              >
                <PlusCircle size={14} />
                <span>Submit a Complaint</span>
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Subject / Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentComplaints.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/student/complaints/${c.complaintId || c.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="table-code">{c.complaintId}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.title}</td>
                      <td>
                        <span className="badge badge-neutral">{c.category}</span>
                      </td>
                      <td>{getPriorityBadge(c.priority)}</td>
                      <td>{getStatusBadge(c.status)}</td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>
                        {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/complaints/${c.complaintId || c.id}`);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
