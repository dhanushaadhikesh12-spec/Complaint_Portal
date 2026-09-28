import React, { useEffect, useState } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import { getStudentProfile, updateStudentProfile } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, BookOpen, Calendar, Shield, Edit2, Save, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentProfilePage() {
  const { user: authUser, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStudentProfile()
      .then(res => {
        const p = res.data.data;
        setProfile(p);
        setEditForm({ fullName: p.fullName || '', phone: p.phone || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      toast.error('Full Name cannot be blank');
      return;
    }
    setSaving(true);
    try {
      const res = await updateStudentProfile(editForm);
      const updated = res.data.data;
      setProfile(updated);
      login(token, { ...authUser, fullName: updated.fullName });
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Student Profile">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading student details...</span>
        </div>
      </StudentLayout>
    );
  }

  const p = profile || {};
  const initials = p.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return (
    <StudentLayout
      title="Student Profile"
      subtitle="View and manage your academic profile information"
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-body" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: 22,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {initials}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{p.fullName || 'Student Name'}</h2>
                  <span className="badge badge-resolved">
                    <span className="badge-dot" />
                    Active Student
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{p.email}</p>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                  Student ID / Roll No: <strong>{p.studentId || 'STU001'}</strong>
                </div>
              </div>

              {!editing && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 size={13} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Academic Details & Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Institutional Information</h3>
          </div>

          <div className="card-body">
            {editing ? (
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="form-control"
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +91 9876543210"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditing(false);
                      setEditForm({ fullName: p.fullName || '', phone: p.phone || '' });
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (
                      <>
                        <Save size={13} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Academic Department</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{p.department || 'Computer Science & Engineering'}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact Email</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{p.email}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact Phone</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{p.phone || 'Not provided'}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Hostel / Residence</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{p.hostel || 'Campus Block A'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
