import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { getAuditLogs } from '../api/services';
import { Activity, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 25 };
    if (search) params.action = search;
    getAuditLogs(params)
      .then(r => {
        const d = r.data.data;
        if (Array.isArray(d)) {
          setLogs(d);
          setMeta({ totalElements: d.length, totalPages: 1, number: 0 });
        } else {
          setLogs(d.content || []);
          setMeta({ totalElements: d.totalElements, totalPages: d.totalPages, number: d.number });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <Layout title="Audit Logs & Compliance" subtitle="Tamper-evident activity trail for institutional compliance and governance">
      {/* Filter Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <input
              id="audit-search"
              type="text"
              className="form-control"
              placeholder="Filter by action (e.g. ASSIGN, RESOLVE)..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              style={{ paddingLeft: 34 }}
            />
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading compliance log records...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Activity size={28} />
              </div>
              <h3>No Audit Records</h3>
              <p>No activity records match your current query.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor / Staff</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Complaint Ref</th>
                    <th>Description</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                        {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm:ss') : '—'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{log.admin?.fullName || 'System'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{log.admin?.username || 'daemon'}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: 12 }}>{log.entityType || 'Grievance'}</td>
                      <td>
                        {log.complaintId ? (
                          <span className="table-code">{log.complaintId}</span>
                        ) : '—'}
                      </td>
                      <td style={{ color: '#334155', maxWidth: 300 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.details || log.description || 'Action performed'}
                        </div>
                      </td>
                      <td style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'monospace' }}>
                        {log.ipAddress || '127.0.0.1'}
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
              Showing {logs.length} of {meta.totalElements} records (Page {meta.number + 1} of {meta.totalPages})
            </span>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => p - 1)}
                disabled={meta.number === 0 || loading}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => p + 1)}
                disabled={meta.number >= meta.totalPages - 1 || loading}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
