import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Shield, Eye, EyeOff, Lock, User, GraduationCap,
  Building2, CheckCircle2, ArrowRight
} from 'lucide-react';

const ADMIN_DEMOS = [
  { label: 'Super Admin',  u: 'superadmin',  p: 'Admin@123',   role: 'Super Admin',   desc: 'Full System' },
  { label: 'IT Admin',     u: 'itadmin',     p: 'Admin@123',   role: 'Dept Admin',    desc: 'IT Dept' },
  { label: 'Hostel Admin', u: 'hosteladmin', p: 'Admin@123',   role: 'Dept Admin',    desc: 'Hostel Dept' },
  { label: 'IT Handler',   u: 'handler1',    p: 'Handler@123', role: 'Staff Handler', desc: 'Resolution' },
];

const STUDENT_DEMOS = [
  { label: 'Alice Johnson', u: 'STU001', p: 'Student@123', dept: 'Comp. Science' },
  { label: 'Bob Smith',     u: 'STU002', p: 'Student@123', dept: 'Electronics' },
  { label: 'Charlie Brown', u: 'STU003', p: 'Student@123', dept: 'Mechanical' },
];

export default function LoginPage() {
  const [portalTab, setPortalTab] = useState('STUDENT'); // 'STUDENT' or 'ADMIN'
  const [form, setForm]           = useState({ username: '', password: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (customUser, customPass) => {
    const u = (customUser !== undefined ? customUser : form.username).trim();
    const p = (customPass !== undefined ? customPass : form.password).trim();

    if (!u || !p) {
      setErrorMsg('Please enter both your identifier and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginApi({ username: u, password: p });
      const { token, ...user } = res.data.data;
      login(token, user);

      if (user.role === 'STUDENT') {
        toast.success(`Welcome, ${user.fullName}`);
        navigate('/student/dashboard');
      } else {
        toast.success(`Welcome, ${user.fullName}`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify your credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit();
  };

  const isStudent = portalTab === 'STUDENT';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Top University Brand Bar */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: 12,
          marginBottom: 12,
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
        }}>
          <Shield size={26} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Campus Grievance & Complaint Portal
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Official University Incident Resolution & SLA Management System
        </p>
      </div>

      {/* Main Authentication Card */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
      }}>
        {/* Portal Role Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          padding: 4,
          gap: 4
        }}>
          <button
            type="button"
            onClick={() => { setPortalTab('STUDENT'); setErrorMsg(''); }}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: isStudent ? '#ffffff' : 'transparent',
              color: isStudent ? '#0f172a' : '#64748b',
              fontWeight: isStudent ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: isStudent ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <GraduationCap size={16} color={isStudent ? '#2563eb' : '#64748b'} />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { setPortalTab('ADMIN'); setErrorMsg(''); }}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: !isStudent ? '#ffffff' : 'transparent',
              color: !isStudent ? '#0f172a' : '#64748b',
              fontWeight: !isStudent ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: !isStudent ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={16} color={!isStudent ? '#2563eb' : '#64748b'} />
            <span>Faculty & Staff</span>
          </button>
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px 28px 24px' }}>
          {/* Header Description */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              {isStudent ? 'Student Account Login' : 'Staff & Administration Login'}
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
              {isStudent
                ? 'Enter your Student ID / Registration No. and password to access your portal.'
                : 'Enter your institutional credentials to access grievance triage.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#b91c1c',
              fontSize: 12.5,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                {isStudent ? 'Student ID / Username' : 'Staff Username / Email'}
                <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="username"
                  type="text"
                  className="form-control"
                  placeholder={isStudent ? 'e.g. STU001 or 2024CS101' : 'e.g. superadmin or itadmin'}
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  style={{ paddingLeft: 36 }}
                  disabled={loading}
                  autoComplete="username"
                  required
                />
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="password">
                Password
                <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4
                  }}
                  tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ borderRadius: 4, cursor: 'pointer' }}
                />
                <span>Remember this session</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff' }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Fast-Login Strip */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Quick Demo Accounts (Evaluation)
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {isStudent ? (
              STUDENT_DEMOS.map(s => (
                <button
                  key={s.u}
                  type="button"
                  onClick={() => {
                    setForm({ username: s.u, password: s.p });
                    handleLoginSubmit(s.u, s.p);
                  }}
                  style={{
                    padding: '5px 10px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  <span>{s.u} ({s.label})</span>
                </button>
              ))
            ) : (
              ADMIN_DEMOS.map(a => (
                <button
                  key={a.u}
                  type="button"
                  onClick={() => {
                    setForm({ username: a.u, password: a.p });
                    handleLoginSubmit(a.u, a.p);
                  }}
                  style={{
                    padding: '5px 10px',
                    fontSize: 11.5,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0f172a' }} />
                  <span>{a.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* University Footer */}
      <footer style={{ marginTop: 24, textAlign: 'center', fontSize: 11.5, color: '#94a3b8' }}>
        <p>© 2026 Campus Grievance & Incident Management System. All rights reserved.</p>
        <p style={{ marginTop: 2 }}>Secure SSL / 256-Bit Encrypted Campus Portal</p>
      </footer>
    </div>
  );
}
