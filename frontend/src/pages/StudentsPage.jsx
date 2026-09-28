import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getStudents } from '../api/services';
import { Search, Users, Mail, Phone, BookOpen, FileText, ArrowRight } from 'lucide-react';

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getStudents()
      .then(r => setStudents(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    !search ||
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return (
    <Layout title="Student Directory" subtitle="Registered students and grievance participation records">
      {/* Search Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <input
              id="student-search"
              type="text"
              className="form-control"
              placeholder="Search by student name, ID, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 34 }}
            />
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading student records...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={28} />
            </div>
            <h3>No Students Found</h3>
            <p>No student accounts match your search filter.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(s => (
            <div key={s.id} className="card" style={{ marginBottom: 0 }}>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {initials(s.fullName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }} className="truncate">
                      {s.fullName}
                    </div>
                    <div className="table-code" style={{ fontSize: 11.5 }}>
                      {s.studentId}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#475569' }}>
                  {s.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {(s.department || s.yearOfStudy) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpen size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <span>{[s.department, s.yearOfStudy && `Year ${s.yearOfStudy}`].filter(Boolean).join(' · ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
