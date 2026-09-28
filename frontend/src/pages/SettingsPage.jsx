import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { getDepartments, getHandlers } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Settings, Building, Users, Shield, Info, CheckCircle2, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user, isSuperAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [handlers, setHandlers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDepartments(), getHandlers()])
      .then(([d, h]) => {
        setDepartments(d.data.data || []);
        setHandlers(h.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="System Settings & Overview" subtitle="System parameters, departmental units, and operator directory">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Administrator Profile Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={16} style={{ color: '#2563eb' }} />
              Administrator Account
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Full Name',  value: user?.fullName },
                { label: 'Username',   value: user?.username },
                { label: 'Email',      value: user?.email },
                { label: 'System Role', value: user?.role?.replace('_', ' ') },
                { label: 'Department', value: user?.department || 'Institutional Authority' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Academic & Service Departments */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <Building size={16} style={{ color: '#2563eb' }} />
              Configured Departments ({departments.length})
            </h3>
          </div>
          <div className="card-body" style={{ maxHeight: 340, overflowY: 'auto', padding: 16 }}>
            {loading ? (
              <div className="loading-state" style={{ minHeight: 120 }}><div className="spinner" /></div>
            ) : departments.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No departments configured.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {departments.map(d => (
                  <div key={d.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', backgroundColor: '#f8fafc',
                    borderRadius: 8, border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{d.name}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>{d.description || 'Campus Facility Unit'}</div>
                    </div>
                    <span className="table-code" style={{ fontSize: 11, padding: '2px 8px', backgroundColor: '#eff6ff', borderRadius: 4 }}>
                      {d.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Handlers */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <Users size={16} style={{ color: '#2563eb' }} />
              Active Handlers ({handlers.length})
            </h3>
          </div>
          <div className="card-body" style={{ maxHeight: 340, overflowY: 'auto', padding: 16 }}>
            {loading ? (
              <div className="loading-state" style={{ minHeight: 120 }}><div className="spinner" /></div>
            ) : handlers.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No handlers assigned.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {handlers.map(h => (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', backgroundColor: '#f8fafc',
                    borderRadius: 8, border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      backgroundColor: '#0f172a', color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0
                    }}>
                      {h.fullName?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{h.fullName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{h.department || 'All Departments'}</div>
                    </div>
                    <span className="badge badge-resolved" style={{ fontSize: 10 }}>Available</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Security & SLA Policies */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <Lock size={16} style={{ color: '#2563eb' }} />
              SLA Policy & Security
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>SLA Target Enforcement</div>
              <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                Critical: 4 Hours • High: 24 Hours • Medium: 3 Days • Low: 7 Days
              </p>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} /> TLS & SHA-256 Audit Integrity
              </div>
              <p style={{ fontSize: 11.5, color: '#047857', marginTop: 2 }}>
                Immutable database audit logs enabled for all admin triage operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
