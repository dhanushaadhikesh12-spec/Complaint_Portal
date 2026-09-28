import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import { getMyComplaints } from '../../api/services';
import {
  FileText, Search, RefreshCw, ChevronLeft, ChevronRight,
  PlusCircle, Filter, ArrowUpDown
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const STATUS_OPTIONS = ['ALL', 'NEW', 'VALIDATING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'STUDENT_VERIFICATION', 'CLOSED', 'ESCALATED', 'REJECTED'];
const CATEGORY_OPTIONS = ['ALL', 'ACADEMIC', 'IT', 'HOSTEL', 'TRANSPORT', 'INFRASTRUCTURE', 'MAINTENANCE', 'CANTEEN', 'SAFETY', 'OTHER'];
const PRIORITY_OPTIONS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

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

export default function StudentComplaintsPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, number: 0 });
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', page: 0 });
  const [searchVal, setSearchVal] = useState('');

  const fetchComplaints = useCallback(() => {
    setLoading(true);
    const params = { page: filters.page, size: 12 };
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.priority) params.priority = filters.priority;
    if (searchVal) params.search = searchVal;

    getMyComplaints(params)
      .then(res => {
        const p = res.data.data;
        const content = (p.content || []).filter(Boolean);
        setComplaints(content);
        setMeta({ totalElements: p.totalElements, totalPages: p.totalPages, number: p.number });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, searchVal]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, page: 0 })), 350);
    return () => clearTimeout(t);
  }, [searchVal]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val === 'ALL' ? '' : val, page: 0 }));

  return (
    <StudentLayout
      title="My Complaints"
      subtitle="View, filter, and track all grievances lodged by your account"
    >
      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 360 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by Title or Complaint ID..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                style={{ paddingLeft: 34, paddingRight: 12 }}
              />
              <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <select
                className="form-control"
                style={{ width: 140, padding: '8px 10px', fontSize: 13 }}
                value={filters.status || 'ALL'}
                onChange={e => setFilter('status', e.target.value)}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>
                ))}
              </select>

              <select
                className="form-control"
                style={{ width: 140, padding: '8px 10px', fontSize: 13 }}
                value={filters.category || 'ALL'}
                onChange={e => setFilter('category', e.target.value)}
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
                ))}
              </select>

              <select
                className="form-control"
                style={{ width: 130, padding: '8px 10px', fontSize: 13 }}
                value={filters.priority || 'ALL'}
                onChange={e => setFilter('priority', e.target.value)}
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p === 'ALL' ? 'All Priorities' : p}</option>
                ))}
              </select>

              <button
                className="btn btn-secondary btn-icon"
                onClick={fetchComplaints}
                title="Refresh complaints"
              >
                <RefreshCw size={14} />
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/student/complaints/new')}
              >
                <PlusCircle size={14} />
                <span>New Complaint</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Table Card */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading complaints...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={28} />
              </div>
              <h3>No complaints found</h3>
              <p>
                {searchVal || filters.status || filters.category || filters.priority
                  ? 'Try clearing your filters or changing your search criteria.'
                  : "You haven't filed any complaints yet."}
              </p>
              {!searchVal && !filters.status && !filters.category && !filters.priority && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 16 }}
                  onClick={() => navigate('/student/complaints/new')}
                >
                  <PlusCircle size={14} />
                  <span>Submit Your First Complaint</span>
                </button>
              )}
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
                  {complaints.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/student/complaints/${c.complaintId || c.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="table-code">{c.complaintId}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a', maxWidth: 280 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.title}
                        </div>
                      </td>
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

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              Showing {complaints.length} of {meta.totalElements} records (Page {meta.number + 1} of {meta.totalPages})
            </span>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                disabled={meta.number === 0 || loading}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                disabled={meta.number >= meta.totalPages - 1 || loading}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
