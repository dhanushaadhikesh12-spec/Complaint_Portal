import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getProfile, updateProfile } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, BookOpen, Calendar, Shield, Edit2, Save, X } from 'lucide-react';

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: 'var(--bg-elevated)',
      borderRadius: 8,
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: 'rgba(16,185,129,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--primary-400)', flexShrink: 0,
      }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, marginTop: 2 }}>{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then(res => {
        const p = res.data.data;
        setProfile(p);
        setEditForm({ fullName: p.fullName || '', phone: p.phone || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editForm.fullName.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await updateProfile(editForm);
      const updated = res.data.data;
      setProfile(updated);
      // Update auth context too
      login(token, { ...authUser, fullName: updated.fullName });
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Layout title="Profile">
      <div className="loading-page"><div className="spinner" /><span>Loading profile...</span></div>
    </Layout>
  );

  const p = profile || {};
  const initials = p.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return (
    <Layout title="My Profile">
      <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Avatar Card */}
        <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '28px 20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff',
            margin: '0 auto 16px',
            boxShadow: '0 6px 24px rgba(16,185,129,0.35)',
          }}>
            {initials}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{p.fullName}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{p.email}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <span className="badge badge-resolved" style={{ fontSize: 11 }}>
              <Shield size={10} /> Student
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '3px 8px' }}>
              {p.department}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>
              <User size={15} style={{ color: 'var(--primary-400)' }} /> Personal Information
            </h3>
            {!editing ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <Edit2 size={12} /> Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(false); setEditForm({ fullName: p.fullName, phone: p.phone || '' }); }}>
                  <X size={12} /> Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" /> : <Save size={12} />} Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="alert alert-warning" style={{ fontSize: 12 }}>
                <Shield size={13} />
                <span>Email, Student ID, Department, and Year cannot be changed here. Contact administration for those changes.</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <InfoItem icon={User}     label="Full Name"   value={p.fullName} />
              <InfoItem icon={BookOpen} label="Student ID"  value={p.studentId} />
              <InfoItem icon={Mail}     label="Email"       value={p.email} />
              <InfoItem icon={Phone}    label="Phone"       value={p.phone} />
              <InfoItem icon={BookOpen} label="Department"  value={p.department} />
              <InfoItem icon={Calendar} label="Year of Study" value={p.yearOfStudy ? `Year ${p.yearOfStudy}` : null} />
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 10 }}>
            <Shield size={15} style={{ color: 'var(--primary-400)' }} /> Security & Access
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Portal Role', 'Student'],
              ['Access Level', 'Student Portal Only'],
              ['Session', 'JWT-based (stateless)'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
