import React, { useEffect, useState } from 'react';
import { createComplaint, getStudents, getDepartments } from '../../api/services';
import { X, Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['ACADEMIC','INFRASTRUCTURE','HOSTEL','TRANSPORT','CANTEEN','IT','MAINTENANCE','SAFETY','OTHER'];
const PRIORITIES  = ['LOW','MEDIUM','HIGH','CRITICAL'];

export default function NewComplaintModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    studentId: '', title: '', description: '',
    category: 'ACADEMIC', priority: 'MEDIUM', departmentId: '',
  });
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStudents().then(r => setStudents(r.data.data || [])).catch(() => {});
    getDepartments().then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.title || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await createComplaint(form);
      toast.success('Complaint logged successfully');
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create complaint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Log New Incident / Complaint</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="modalStudentSelect">
                Student <span className="required">*</span>
              </label>
              <select
                id="modalStudentSelect"
                className="form-control"
                value={form.studentId}
                onChange={e => setForm({ ...form, studentId: e.target.value })}
                required
              >
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modalTitleInput">
                Subject / Title <span className="required">*</span>
              </label>
              <input
                id="modalTitleInput"
                type="text"
                className="form-control"
                placeholder="Brief summary of the issue..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                maxLength={255}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modalDescInput">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="modalDescInput"
                className="form-control"
                rows={4}
                placeholder="Detailed explanation of the grievance..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select
                  className="form-control"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-control"
                  value={form.departmentId}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })}
                >
                  <option value="">-- Auto-assign --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : (
                <>
                  <Plus size={14} />
                  <span>Create Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
