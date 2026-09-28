import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getMyComplaints } from '../api/services';
import { FileText, Search, RefreshCw, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_OPTIONS = ['ALL', 'NEW', 'VALIDATING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'STUDENT_VERIFICATION', 'CLOSED', 'ESCALATED', 'REJECTED'];
const CATEGORY_OPTIONS = ['ALL', 'ACADEMIC', 'IT', 'HOSTEL', 'TRANSPORT', 'INFRASTRUCTURE', 'MAINTENANCE', 'CANTEEN', 'SAFETY', 'OTHER'];
const PRIORITY_OPTIONS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function getStatusBadge(s) {
  const map = {
    NEW: 'badge-new', VALIDATING: 'badge-validating', ASSIGNED: 'badge-assigned',
    IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved',
    STUDENT_VERIFICATION: 'badge-verify', CLOSED: 'badge-closed',
    ESCALATED: 'badge-escalated', REJECTED: 'badge-rejected', REOPENED: 'badge-reopened',
  };
  return map[s] || 'badge-new';
}

function getPriorityBadge(p) {
  const map = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
  return map[p] || 'badge-medium';
}

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, number: 0 });
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', page: 0 });
  const [searchVal, setSearchVal] = useState('');

  const fetchComplaints = useCallback(() => {
    setLoading(true);
    const params = { page: filters.page, size: 15 };
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

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  useEffect(() => {
    const t = setTimeout(() => setFilters(f => ({ ...f, page: 0 })), 400);
    return () => clearTimeout(t);
  }, [searchVal]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val === 'ALL' ? '' : val, page: 0 }));

  return (
    <Layout title="My Complaints">
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>My Complaints</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {meta.totalElements} total complaints
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchComplaints}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/new')}>
              + New Complaint
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrapper" style={{ maxWidth: 280 }}>
            <Search size={14} />
            <input
              id="complaint-search"
              className="form-input search-input"
              placeholder="Search title or ID..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ width: 150 }} value={filters.status || 'ALL'}
            onChange={e => setFilter('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
          </select>
          <select className="form-select" style={{ width: 150 }} value={filters.category || 'ALL'}
            onChange={e => setFilter('category', e.target.value)}>
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
          </select>
          <select className="form-select" style={{ width: 130 }} value={filters.priority || 'ALL'}
            onChange={e => setFilter('priority', e.target.value)}>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p === 'ALL' ? 'All Priority' : p}</option>)}
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Department</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <FileText size={34} />
                    <h3>No complaints found</h3>
                    <p>Try adjusting your filters or create a new complaint.</p>
                  </div>
                </td></tr>
              ) : complaints.map(c => (
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
                  <td style={{ fontSize: 12, textTransform: 'capitalize' }}>
                    {c.category?.toLowerCase()}
                  </td>
                  <td><span className={`badge ${getPriorityBadge(c.priority)}`}>{c.priority}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {c.department?.name || '—'}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(c.status)}`}>
                      {c.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : '-'}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {c.updatedAt ? formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true }) : '-'}
                  </td>
                  <td><ArrowRight size={14} style={{ color: 'var(--text-muted)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="pagination">
            <span>Showing {complaints.length} of {meta.totalElements}</span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} disabled={meta.number === 0}>
                <ChevronLeft size={13} />
              </button>
              {[...Array(Math.min(meta.totalPages, 7))].map((_, i) => (
                <button key={i} className={`page-btn ${i === meta.number ? 'active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, page: i }))}>
                  {i + 1}
                </button>
              ))}
              <button className="page-btn" onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={meta.number >= meta.totalPages - 1}>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
