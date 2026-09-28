import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ShieldCheck, Eye, EyeOff, Lock, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (username, password) => {
    const u = (username || form.username).trim();
    const p = (password || form.password).trim();
    if (!u || !p) {
      toast.error('Please enter both student ID/email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi({ username: u, password: p });
      const { token, ...user } = res.data.data;
      if (user.role !== 'STUDENT') {
        toast.error('This portal is for students only. Please use the Admin Portal.');
        return;
      }
      login(token, user);
      toast.success(`Welcome, ${user.fullName}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please verify your Student ID and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit();
  };

  const demoAccounts = [
    { label: 'Alice Johnson', u: 'STU001', p: 'Student@123', dept: 'Computer Science' },
    { label: 'Bob Smith', u: 'STU002', p: 'Student@123', dept: 'Electrical' },
    { label: 'Carol White', u: 'STU003', p: 'Student@123', dept: 'Mechanical' },
  ];

  return (
    <div className="login-page">
      <div className="login-bg" />

      {/* Floating orbs */}
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${120 + i * 60}px`,
          height: `${120 + i * 60}px`,
          borderRadius: '50%',
          border: `1px solid rgba(16,185,129,${0.06 - i * 0.01})`,
          top: `${15 + i * 14}%`,
          left: `${8 + i * 18}%`,
          animation: `spin ${10 + i * 4}s linear infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <div className="login-card fade-in">
        <div className="login-logo">
          <div className="login-logo-icon">
            <BookOpen size={26} color="#fff" />
          </div>
          <h1>Student Portal</h1>
          <p>Campus Complaint & Compliance System</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Student ID or Email</label>
            <div style={{ position: 'relative' }}>
              <BookOpen size={15} style={{
                position: 'absolute', left: 11, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                id="student-login-username"
                className="form-input"
                style={{ paddingLeft: 34 }}
                placeholder="e.g. STU001 or email"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{
                position: 'absolute', left: 11, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                id="student-login-password"
                className="form-input"
                style={{ paddingLeft: 34, paddingRight: 38 }}
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            id="student-login-submit"
            className="btn btn-primary btn-lg btn-full"
            type="submit"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <span className="spinner" /> : <ShieldCheck size={16} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{
            fontSize: 11, color: 'var(--text-muted)', marginBottom: 8,
            textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            ⚡ Demo Student Accounts
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {demoAccounts.map(acc => (
              <button
                key={acc.u}
                type="button"
                onClick={() => {
                  setForm({ username: acc.u, password: acc.p });
                  handleLoginSubmit(acc.u, acc.p);
                }}
                disabled={loading}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{acc.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>({acc.dept})</span>
                </div>
                <span style={{ fontSize: 11, color: '#10b981', fontFamily: 'monospace', fontWeight: 600 }}>{acc.u} →</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: '10px 12px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            🔒 Students only. Admin Portal is at <strong>localhost:5173</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
