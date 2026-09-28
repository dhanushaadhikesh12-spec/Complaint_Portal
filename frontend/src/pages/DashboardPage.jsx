import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { getDashboard } from '../api/services';
import {
  FileText, Clock, CheckCircle2, AlertTriangle, TrendingUp,
  Activity, Users, Zap, XCircle, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

const statusColors = {
  NEW: '#2563eb', VALIDATING: '#8b5cf6', ASSIGNED: '#0284c7',
  IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981', STUDENT_VERIFICATION: '#06b6d4',
  CLOSED: '#64748b', REJECTED: '#ef4444', ESCALATED: '#f97316', REOPENED: '#ec4899',
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Admin Dashboard" subtitle="Real-time campus grievance triage and SLA overview">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading operational analytics...</span>
        </div>
      </Layout>
    );
  }

  const byStatus   = data?.byStatus   || {};
  const byCategory = data?.byCategory || {};
  const byPriority = data?.byPriority || {};

  const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(), value
  }));
  const priorityData = Object.entries(byPriority).map(([name, value]) => ({ name, value }));

  const byDept = data?.byDepartment
    ? Object.entries(data.byDepartment).map(([name, count]) => ({ name, count }))
    : [];

  const total    = data?.totalComplaints      || 0;
  const resolved = data?.resolvedComplaints   || 0;
  const active   = data?.inProgressComplaints || 0;
  const escalated= data?.escalatedComplaints  || 0;
  const closed   = data?.closedComplaints     || 0;

  const statCards = [
    { label: 'Total Incidents',  value: total,                       icon: FileText,     color: '#2563eb', bg: '#eff6ff' },
    { label: 'In Progress',      value: active,                      icon: Activity,     color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Resolved Cases',   value: resolved,                    icon: CheckCircle2, color: '#047857', bg: '#ecfdf5' },
    { label: 'Escalated / Urgent', value: escalated,                 icon: AlertTriangle,color: '#c2410c', bg: '#fff7ed' },
  ];

  return (
    <Layout title="Admin Dashboard" subtitle="Operational metrics, triage volume, and resolution performance">
      {/* 4 Primary KPI Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon-wrap" style={{ backgroundColor: s.bg, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Status Distribution Pie Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Incidents by Status</h3>
              <p className="card-subtitle">Breakdown across active and resolved states</p>
            </div>
          </div>
          <div className="card-body">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={3}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={entry.name} fill={statusColors[entry.name] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ color: '#475569', fontSize: 11.5, fontWeight: 500 }}>{v.replace('_', ' ')}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 32 }}>
                <p>No status records yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Volume by Category</h3>
              <p className="card-subtitle">Grievance distribution by facility domain</p>
            </div>
          </div>
          <div className="card-body">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 32 }}>
                <p>No category records yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SLA & Performance Overview */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">SLA Compliance & Performance</h3>
            <p className="card-subtitle">Resolution rate and operational throughput</p>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { label: 'Overall Resolution Rate', value: total ? Math.round((resolved / total) * 100) : 0, color: '#047857', bg: '#10b981' },
              { label: 'Active Investigation Rate', value: total ? Math.round((active / total) * 100) : 0, color: '#1d4ed8', bg: '#2563eb' },
              { label: 'Escalation Rate', value: total ? Math.round((escalated / total) * 100) : 0, color: '#c2410c', bg: '#f97316' },
              { label: 'Completed Closure Rate', value: total ? Math.round((closed / total) * 100) : 0, color: '#475569', bg: '#64748b' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>{item.value}%</span>
                </div>
                <div style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${item.value}%`,
                    backgroundColor: item.bg,
                    borderRadius: 99,
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
