import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import { submitStudentComplaint, uploadStudentAttachment, getStudentDepartments } from '../../api/services';
import toast from 'react-hot-toast';
import {
  PlusCircle, Send, X, Upload, ImageIcon, ArrowLeft,
  Info, CheckCircle2, AlertTriangle, FileText
} from 'lucide-react';

const CATEGORIES = ['ACADEMIC', 'IT', 'HOSTEL', 'TRANSPORT', 'INFRASTRUCTURE', 'MAINTENANCE', 'CANTEEN', 'SAFETY', 'OTHER'];

const PRIORITIES = [
  { value: 'LOW',      label: 'Low',      sla: 'SLA: 7 Business Days',   desc: 'Minor issue or general inquiry' },
  { value: 'MEDIUM',   label: 'Medium',   sla: 'SLA: 3 Business Days',   desc: 'Standard issue impacting routine activity' },
  { value: 'HIGH',     label: 'High',     sla: 'SLA: 24 Hours',          desc: 'Urgent issue affecting daily campus life' },
  { value: 'CRITICAL', label: 'Critical', sla: 'SLA: 4 Hours Emergency', desc: 'Emergency hazard, safety or security risk' },
];

export default function StudentNewComplaintPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [dragging, setDragging] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    departmentId: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getStudentDepartments()
      .then(res => setDepartments(res.data.data || []))
      .catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Please enter a clear subject for your complaint';
    else if (form.title.trim().length < 5) e.title = 'Subject must be at least 5 characters';

    if (!form.category) e.category = 'Please select an incident category';

    if (!form.description.trim()) e.description = 'Please describe the incident or grievance in detail';
    else if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters';

    if (!form.priority) e.priority = 'Please select an urgency priority';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageSelect = (files) => {
    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB
    const valid = [];

    Array.from(files).forEach(file => {
      if (!ALLOWED.includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG, WEBP allowed`);
      } else if (file.size > MAX_SIZE) {
        toast.error(`${file.name}: Max file size is 15MB`);
      } else if (images.length + valid.length >= 5) {
        toast.error('Maximum 5 images allowed');
      } else {
        valid.push({ file, preview: URL.createObjectURL(file) });
      }
    });

    if (valid.length > 0) setImages(prev => [...prev, ...valid]);
  };

  const removeImage = (idx) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleImageSelect(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        departmentId: form.departmentId || null,
      };

      const res = await submitStudentComplaint(payload);
      const created = res.data.data;

      // Upload attached evidence files
      if (images.length > 0) {
        const uploadPromises = images.map(async (img) => {
          const fd = new FormData();
          fd.append('file', img.file);
          return uploadStudentAttachment(created.complaintId || created.id, fd);
        });

        try {
          await Promise.all(uploadPromises);
          toast.success(`Complaint #${created.complaintId} and ${images.length} attachment(s) submitted successfully!`);
        } catch (uploadErr) {
          console.error('Failed to upload some attachments:', uploadErr);
          toast.success(`Complaint #${created.complaintId} created successfully.`);
        }
      } else {
        toast.success(`Complaint #${created.complaintId} submitted successfully!`);
      }

      navigate(`/student/complaints/${created.complaintId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout
      title="Submit a Complaint"
      subtitle="Provide clear details and optional photo evidence to initiate institutional review"
    >
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Back Link */}
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 16 }}
          onClick={() => navigate('/student/complaints')}
        >
          <ArrowLeft size={14} />
          <span>Back to Complaints</span>
        </button>

        <form onSubmit={handleSubmit}>
          {/* Main Card: Details */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <FileText size={16} style={{ color: '#2563eb' }} />
                  Grievance Information
                </h3>
                <p className="card-subtitle">Fill in all required fields accurately for prompt SLA triage</p>
              </div>
            </div>

            <div className="card-body">
              {/* Subject / Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Subject / Title <span className="required">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className="form-control"
                  placeholder="e.g. WiFi connectivity issue in Block B 3rd Floor"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  disabled={loading}
                  maxLength={150}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {errors.title ? <span className="form-error">{errors.title}</span> : <span className="form-hint">A concise summary of the issue (min 5 characters)</span>}
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{form.title.length}/150</span>
                </div>
              </div>

              {/* Category & Department Grid */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    className="form-control"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">-- Select Category --</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <span className="form-error">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="departmentId">
                    Target Department <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <select
                    id="departmentId"
                    className="form-control"
                    value={form.departmentId}
                    onChange={e => setForm({ ...form, departmentId: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">-- Auto-Assign based on Category --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <span className="form-hint">Leave blank if unsure; campus triage will route automatically</span>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="form-group">
                <label className="form-label">
                  Severity / Priority Level <span className="required">*</span>
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 10,
                  marginTop: 4
                }}>
                  {PRIORITIES.map(p => {
                    const isSelected = form.priority === p.value;
                    return (
                      <div
                        key={p.value}
                        onClick={() => setForm({ ...form, priority: p.value })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#1e40af' : '#0f172a' }}>
                            {p.label}
                          </span>
                          {isSelected && <CheckCircle2 size={14} color="#2563eb" />}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? '#2563eb' : '#64748b' }}>
                          {p.sla}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {p.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="description">
                  Detailed Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  className="form-control"
                  rows={5}
                  placeholder="Describe the exact location, context, when it occurred, and any relevant details..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  disabled={loading}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {errors.description ? <span className="form-error">{errors.description}</span> : <span className="form-hint">Minimum 10 characters</span>}
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{form.description.length} chars</span>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Upload Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <ImageIcon size={16} style={{ color: '#2563eb' }} />
                  Photo Evidence & Attachments
                </h3>
                <p className="card-subtitle">Upload pictures of the issue (optional, max 5 images, up to 15MB each)</p>
              </div>
            </div>

            <div className="card-body">
              <div
                className={`dropzone ${dragging ? 'active' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('evidence-input').click()}
              >
                <input
                  id="evidence-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={e => handleImageSelect(e.target.files)}
                />
                <div className="dropzone-icon">
                  <Upload size={22} />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>
                  Click to select photos or drag & drop here
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Supported formats: JPG, PNG, WEBP (Max 15MB per file)
                </p>
              </div>

              {/* Previews */}
              {images.length > 0 && (
                <div className="evidence-preview-wrap">
                  {images.map((img, idx) => (
                    <div key={idx} className="evidence-thumb">
                      <img src={img.preview} alt={`Evidence ${idx + 1}`} />
                      <button
                        type="button"
                        className="evidence-thumb-remove"
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        title="Remove image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                <Info size={14} />
                <span>Your complaint will be logged under institutional audit records</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/student/complaints')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#fff' }} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Complaint</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}
