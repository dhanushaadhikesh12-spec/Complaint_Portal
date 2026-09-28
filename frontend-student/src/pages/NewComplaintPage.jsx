import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { submitComplaint, uploadAttachment, getDepartments } from '../api/services';
import toast from 'react-hot-toast';
import { PlusCircle, Send, X, Upload, ImageIcon } from 'lucide-react';

const CATEGORIES = ['ACADEMIC', 'IT', 'HOSTEL', 'TRANSPORT', 'INFRASTRUCTURE', 'MAINTENANCE', 'CANTEEN', 'SAFETY', 'OTHER'];
const PRIORITIES = [
  { value: 'LOW',      label: 'Low',      desc: 'SLA: 7 days',   color: '#34d399' },
  { value: 'MEDIUM',   label: 'Medium',   desc: 'SLA: 3 days',   color: '#fbbf24' },
  { value: 'HIGH',     label: 'High',     desc: 'SLA: 24 hours', color: '#fb923c' },
  { value: 'CRITICAL', label: 'Critical', desc: 'SLA: 4 hours',  color: '#f87171' },
];

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [dragging, setDragging] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    departmentId: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getDepartments()
      .then(res => setDepartments(res.data.data || []))
      .catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.category) e.category = 'Category is required';
    if (!form.priority) e.priority = 'Priority is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageSelect = (files) => {
    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const valid = [];
    let hasError = false;

    Array.from(files).forEach(file => {
      if (!ALLOWED.includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG, WEBP allowed`);
        hasError = true;
      } else if (file.size > MAX_SIZE) {
        toast.error(`${file.name}: Max file size is 5MB`);
        hasError = true;
      } else if (images.length + valid.length >= 5) {
        toast.error('Maximum 5 images allowed');
        hasError = true;
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

      const res = await submitComplaint(payload);
      const created = res.data.data;

      // Upload any attached evidence files
      if (images.length > 0) {
        const uploadPromises = images.map(async (img) => {
          const fd = new FormData();
          fd.append('file', img.file);
          return uploadAttachment(created.complaintId || created.id, fd);
        });

        try {
          await Promise.all(uploadPromises);
          toast.success(`Complaint and ${images.length} evidence file(s) submitted successfully! ID: ${created.complaintId}`);
        } catch (uploadErr) {
          console.error('Failed to upload some evidence images:', uploadErr);
          toast.warn(`Complaint submitted (ID: ${created.complaintId}), but one or more evidence files could not be uploaded.`);
        }
      } else {
        toast.success(`Complaint submitted! ID: ${created.complaintId}`);
      }

      navigate(`/complaints/${created.complaintId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  return (
    <Layout title="Create Complaint">
      <div className="fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Create New Complaint</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Fill in the details below to submit your complaint. All fields marked * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card-title"><PlusCircle size={15} style={{ color: 'var(--primary-400)' }} /> Complaint Details</h3>

            {/* Title */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Title *</label>
              <input
                id="complaint-title"
                className="form-input"
                placeholder="Brief, clear description of the issue"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                maxLength={200}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.title.length}/200 characters</span>
            </div>

            {/* Category + Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  id="complaint-category"
                  className="form-select"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                </select>
                {errors.category && <span className="form-error">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Department (optional)</label>
                <select
                  id="complaint-department"
                  className="form-select"
                  value={form.departmentId}
                  onChange={e => set('departmentId', e.target.value)}
                >
                  <option value="">Auto-assign by category</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Priority Selection */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Priority *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set('priority', p.value)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 8,
                      border: `2px solid ${form.priority === p.value ? p.color : 'var(--border-subtle)'}`,
                      background: form.priority === p.value ? `${p.color}15` : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{p.desc}</div>
                  </button>
                ))}
              </div>
              {errors.priority && <span className="form-error">{errors.priority}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                id="complaint-description"
                className="form-textarea"
                placeholder="Provide a detailed description of the issue. Include relevant details like location, time, and impact..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                style={{ minHeight: 120 }}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.description.length} characters</span>
            </div>
          </div>

          {/* Evidence Upload (UI-only, note: file storage would need multipart endpoint) */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="card-title"><ImageIcon size={15} style={{ color: 'var(--primary-400)' }} /> Evidence Images (optional)</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Upload up to 5 images (JPG, PNG, WEBP, max 5MB each) as evidence.
            </p>

            <div
              className={`upload-area ${dragging ? 'dragging' : ''}`}
              onClick={() => document.getElementById('evidence-upload').click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <Upload size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Drop images here or click to browse
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                JPG, PNG, WEBP — max 5MB each, up to 5 files
              </p>
              <input
                id="evidence-upload"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
                onChange={e => handleImageSelect(e.target.files)}
              />
            </div>

            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((img, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={img.preview} alt={`evidence-${idx + 1}`} />
                    <button type="button" className="preview-remove" onClick={() => removeImage(idx)}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/complaints')}>
              Cancel
            </button>
            <button id="submit-complaint" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : <Send size={16} />}
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
