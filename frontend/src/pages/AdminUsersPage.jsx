import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { getAdmins, createAdmin, getDepartments } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, X, User, Mail, Lock, Building, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full system & staff management access' },
  { value: 'DEPARTMENT_ADMIN', label: 'Department Admin', desc: 'Manage department complaints and handlers' },
  { value: 'COMPLAINT_HANDLER', label: 'Complaint Handler', desc: 'Resolve assigned grievances & update status' },
];

function getRoleBadge(role) {
  switch (role) {
    case 'SUPER_ADMIN':
      return <span className="badge badge-critical">Super Admin</span>;
    case 'DEPARTMENT_ADMIN':
      return <span className="badge badge-progress">Dept Admin</span>;
    case 'COMPLAINT_HANDLER':
    default:
      return <span className="badge badge-pending">Staff Handler</span>;
  }
}

export default function AdminUsersPage() {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', fullName: '', password: '', role: 'COMPLAINT_HANDLER', departmentId: ''
  });
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    getAdmins().then(r => setAdmins(r.data.data || [])).catch(() => {});
  };

  useEffect(() => {
    Promise.all([getAdmins(), getDepartments()])
      .then(([a, d]) => {
        setAdmins(a.data.data || []);
        setDepartments(d.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await createAdmin(form);
      toast.success('Admin account created successfully');
      setShowNew(false);
      setForm({ username: '', email: '', fullName: '', password: '', role: 'COMPLAINT_HANDLER', departmentId: '' });
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create admin user');
    } finally {
      setSaving(false);
    }
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  return (
    <Layout title="Staff & Admin Management" subtitle="Manage university staff, handlers, and administrative permissions">
      {/* Top Header Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {admins.length} authorized administrative accounts active
          </div>

          {isSuperAdmin && (
            <button id="create-admin-btn" className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
              <Plus size={14} />
              <span>Create Staff Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Staff Table Card */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading staff directory...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Role Level</th>
                    <th>Department</th>
                    <th>Account Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {initials(a.fullName)}
                          </div>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{a.fullName}</span>
                        </div>
                      </td>
                      <td className="table-code">{a.username}</td>
                      <td style={{ color: '#475569' }}>{a.email}</td>
                      <td>{getRoleBadge(a.role)}</td>
                      <td style={{ color: '#334155' }}>{a.departmentName || a.department?.name || 'All Departments'}</td>
                      <td>
                        <span className="badge badge-resolved">
                          <span className="badge-dot" /> Active
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>
                        {a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showNew && (
        <div className="modal-backdrop" onClick={() => setShowNew(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Staff User</span>
              <button className="modal-close" onClick={() => setShowNew(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="adminFullName">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="adminFullName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Robert Chen"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="adminUsername">
                      Username <span className="required">*</span>
                    </label>
                    <input
                      id="adminUsername"
                      type="text"
                      className="form-control"
                      placeholder="e.g. rchen"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="adminEmail">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      id="adminEmail"
                      type="email"
                      className="form-control"
                      placeholder="e.g. rchen@campus.edu"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adminPassword">
                    Initial Password <span className="required">*</span>
                  </label>
                  <input
                    id="adminPassword"
                    type="password"
                    className="form-control"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="adminRole">
                      System Role <span className="required">*</span>
                    </label>
                    <select
                      id="adminRole"
                      className="form-control"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="adminDept">
                      Department Assignment
                    </label>
                    <select
                      id="adminDept"
                      className="form-control"
                      value={form.departmentId}
                      onChange={e => setForm({ ...form, departmentId: e.target.value })}
                    >
                      <option value="">-- All / Institutional --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNew(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
