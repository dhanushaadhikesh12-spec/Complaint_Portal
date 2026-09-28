import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import {
  getComplaintById, getComments, addComment, assignComplaint,
  updateStatus, updatePriority, escalateComplaint, resolveComplaint,
  closeComplaint, getHandlers, getDepartments, getEscalations,
  getAttachments
} from '../api/services';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, User, Building, AlertTriangle, Clock, CheckCircle2,
  MessageSquare, Send, Shield, X, ImageIcon, Download, Eye, Check
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function getStatusBadge(status) {
  switch (status) {
    case 'RESOLVED':
      return <span className="badge badge-resolved"><span className="badge-dot" />Resolved</span>;
    case 'IN_PROGRESS':
    case 'ASSIGNED':
      return <span className="badge badge-progress"><span className="badge-dot" />In Progress</span>;
    case 'NEW':
    case 'VALIDATING':
    case 'STUDENT_VERIFICATION':
      return <span className="badge badge-pending"><span className="badge-dot" />Pending Review</span>;
    case 'CLOSED':
      return <span className="badge badge-closed"><span className="badge-dot" />Closed</span>;
    case 'ESCALATED':
      return <span className="badge badge-escalated"><span className="badge-dot" />Escalated</span>;
    case 'REJECTED':
      return <span className="badge badge-urgent"><span className="badge-dot" />Rejected</span>;
    default:
      return <span className="badge badge-neutral">{status?.replace('_', ' ') || 'New'}</span>;
  }
}

function getPriorityBadge(priority) {
  switch (priority) {
    case 'CRITICAL':
      return <span className="badge badge-critical">Critical</span>;
    case 'HIGH':
      return <span className="badge badge-escalated">High</span>;
    case 'MEDIUM':
      return <span className="badge badge-pending">Medium</span>;
    case 'LOW':
    default:
      return <span className="badge badge-neutral">Low</span>;
  }
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canManage, isSuperAdmin } = useAuth();

  const [complaint, setComplaint]     = useState(null);
  const [comments, setComments]       = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [handlers, setHandlers]       = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal]   = useState(false);
  const [sending, setSending]         = useState(false);

  // Evidence modal state
  const [selectedImage, setSelectedImage] = useState(null);

  // Action Modals
  const [showAssign,   setShowAssign]   = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [showStatus,   setShowStatus]   = useState(false);
  const [showResolve,  setShowResolve]  = useState(false);

  const [assignForm,   setAssignForm]   = useState({ handlerId: '', departmentId: '', note: '' });
  const [escalateForm, setEscalateForm] = useState({ reason: '', newHandlerId: '' });
  const [statusForm,   setStatusForm]   = useState({ status: '', reason: '' });
  const [resolveNote,  setResolveNote]  = useState('');
  const [departments,  setDepartments]  = useState([]);

  const refresh = () => {
    getComplaintById(id).then(r => {
      setComplaint(r.data.data);
      if (r.data.data?.attachments) setAttachments(r.data.data.attachments);
    }).catch(() => {});
    getComments(id).then(r => setComments(r.data.data || [])).catch(() => {});
    getEscalations(id).then(r => setEscalations(r.data.data || [])).catch(() => {});
    getAttachments(id).then(r => setAttachments(r.data.data || [])).catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      getComplaintById(id),
      getComments(id),
      getHandlers(),
      getDepartments(),
      getEscalations(id),
      getAttachments(id),
    ]).then(([c, cm, h, d, e, att]) => {
      setComplaint(c.data.data);
      setComments(cm.data.data || []);
      setHandlers(h.data.data || []);
      setDepartments(d.data.data || []);
      setEscalations(e.data.data || []);
      setAttachments(att.data?.data || c.data?.data?.attachments || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      await addComment(id, { content: commentText.trim(), internal: isInternal });
      setCommentText('');
      getComments(id).then(r => setComments(r.data.data || []));
      toast.success('Note added to record');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignComplaint(id, assignForm);
      toast.success('Assigned successfully');
      setShowAssign(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      await updateStatus(id, statusForm);
      toast.success('Status updated');
      setShowStatus(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      await escalateComplaint(id, escalateForm);
      toast.success('Ticket escalated');
      setShowEscalate(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Escalation failed');
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      await resolveComplaint(id, { resolutionNotes: resolveNote });
      toast.success('Complaint resolved');
      setShowResolve(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resolution failed');
    }
  };

  if (loading) {
    return (
      <Layout title="Incident Review">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading ticket details...</span>
        </div>
      </Layout>
    );
  }

  if (!complaint) {
    return (
      <Layout title="Incident Not Found">
        <div className="empty-state">
          <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <h3>Record Not Found</h3>
          <p>The requested complaint identifier does not exist or has been archived.</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/complaints')}>
            <ArrowLeft size={14} /> Back to Complaints List
          </button>
        </div>
      </Layout>
    );
  }

  const c = complaint;

  return (
    <Layout
      title={`Ticket #${c.complaintId || c.id}`}
      subtitle={`Submitted by ${c.studentName || c.student?.fullName || 'Student'} on ${c.createdAt ? format(new Date(c.createdAt), 'PPP p') : '—'}`}
    >
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>
          <ArrowLeft size={14} />
          <span>Back to Complaints</span>
        </button>

        {canManage && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setAssignForm({ handlerId: c.assignedToId || '', departmentId: c.departmentId || '', note: '' });
                setShowAssign(true);
              }}
            >
              Assign Handler
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setStatusForm({ status: c.status, reason: '' });
                setShowStatus(true);
              }}
            >
              Update Status
            </button>

            {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
              <>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowEscalate(true)}
                >
                  Escalate
                </button>

                <button
                  className="btn btn-success btn-sm"
                  onClick={() => setShowResolve(true)}
                >
                  <Check size={14} />
                  <span>Resolve Ticket</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left Column */}
        <div>
          {/* Main Ticket Info */}
          <div className="card">
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span className="table-code" style={{ fontSize: 13 }}>{c.complaintId}</span>
                  {getStatusBadge(c.status)}
                  {getPriorityBadge(c.priority)}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{c.title}</h2>
              </div>
            </div>

            <div className="card-body">
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Student Grievance Description
              </h4>
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '14px 16px',
                fontSize: 13.5,
                lineHeight: 1.6,
                color: '#1e293b',
                whiteSpace: 'pre-wrap'
              }}>
                {c.description}
              </div>

              {c.resolutionNotes && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={15} /> Resolution Summary
                  </h4>
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 8,
                    padding: '14px 16px',
                    fontSize: 13.5,
                    color: '#065f46',
                    lineHeight: 1.5
                  }}>
                    {c.resolutionNotes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student Photo Evidence */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <ImageIcon size={16} style={{ color: '#2563eb' }} />
                Student Photo Evidence ({attachments.length})
              </h3>
            </div>
            <div className="card-body">
              {attachments.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
                  No photo attachments were uploaded by the student for this ticket.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
                  {attachments.map((att, idx) => {
                    const origin = import.meta.env.VITE_API_BASE_URL
                      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
                      : 'http://localhost:8080';
                    const rawUrl = att.url || att.fileUrl || `/api/complaints/${c.complaintId || c.id}/attachments/${att.id}`;
                    const fileUrl = rawUrl.startsWith('http') ? rawUrl : `${origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                    const fileName = att.originalFilename || att.fileName || `Evidence #${idx + 1}`;

                    return (
                      <div
                        key={att.id || idx}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                        onClick={() => setSelectedImage(fileUrl)}
                      >
                        <div style={{ height: 110, backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img
                            src={fileUrl}
                            alt={fileName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement.innerHTML = '<div style="font-size:11px;color:#94a3b8;padding:8px;text-align:center;">Preview unavailable</div>';
                            }}
                          />
                        </div>
                        <div style={{ padding: '8px 10px', fontSize: 11.5, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fileName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Activity & Staff Notes */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <MessageSquare size={16} style={{ color: '#2563eb' }} />
                Case Notes & Communication ({comments.length})
              </h3>
            </div>
            <div className="card-body">
              {comments.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', marginBottom: 16 }}>
                  No comments logged yet. Use the form below to post a response or internal note.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {comments.map((cm, idx) => (
                    <div
                      key={cm.id || idx}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: cm.internal ? '#fffbeb' : (cm.authorRole === 'STUDENT' ? '#f0f7ff' : '#f8fafc'),
                        border: `1px solid ${cm.internal ? '#fde68a' : (cm.authorRole === 'STUDENT' ? '#bae0fd' : '#e2e8f0')}`,
                        borderRadius: 8
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                            {cm.authorName || 'Staff Member'}
                          </span>
                          {cm.internal && (
                            <span className="badge badge-pending" style={{ fontSize: 10, padding: '1px 6px' }}>
                              Internal Note
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          {cm.createdAt ? formatDistanceToNow(new Date(cm.createdAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                        {cm.content || cm.comment || cm.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleSendComment}>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Log a progress note or reply..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={e => setIsInternal(e.target.checked)}
                      style={{ borderRadius: 4 }}
                    />
                    <span>Mark as Internal Staff Note (Hidden from Student)</span>
                  </label>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={sending || !commentText.trim()}
                  >
                    {sending ? 'Posting...' : (
                      <>
                        <Send size={13} />
                        <span>Post Note</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Case Info & Metadata */}
        <div>
          {/* Student Info Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Student Details</h3>
            </div>
            <div className="card-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Full Name</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {c.studentName || c.student?.fullName || 'Student'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student ID</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2563eb', marginTop: 2 }}>
                  {c.studentId || c.student?.studentId || 'STU001'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</div>
                <div style={{ fontSize: 13, color: '#334155', marginTop: 2 }}>
                  {c.departmentName || c.department?.name || 'Computer Science'}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Assignment */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Operational Assignment</h3>
            </div>
            <div className="card-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned Handler</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {c.assignedToName || c.assignedTo?.fullName || 'Unassigned'}
                </div>
              </div>

              {c.slaDeadline && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>SLA Target</div>
                  <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>
                    {format(new Date(c.slaDeadline), 'PPP p')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="modal-dialog" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Evidence Photo Viewer</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.open(selectedImage, '_blank')}
                >
                  <Download size={13} /> Download
                </button>
                <button className="modal-close" onClick={() => setSelectedImage(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="modal-body" style={{ padding: 0, backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
              <img
                src={selectedImage}
                alt="Evidence preview"
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Assign Handler Modal */}
      {showAssign && (
        <div className="modal-backdrop" onClick={() => setShowAssign(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Assign Incident Handler</span>
              <button className="modal-close" onClick={() => setShowAssign(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="handlerId">Select Staff Handler</label>
                  <select
                    id="handlerId"
                    className="form-control"
                    value={assignForm.handlerId}
                    onChange={e => setAssignForm({ ...assignForm, handlerId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Handler --</option>
                    {handlers.map(h => (
                      <option key={h.id} value={h.id}>{h.fullName} ({h.department || h.role})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="departmentId">Assign Department</label>
                  <select
                    id="departmentId"
                    className="form-control"
                    value={assignForm.departmentId}
                    onChange={e => setAssignForm({ ...assignForm, departmentId: e.target.value })}
                  >
                    <option value="">-- Leave Unchanged --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="assignNote">Assignment Note</label>
                  <textarea
                    id="assignNote"
                    className="form-control"
                    rows={3}
                    placeholder="Instructions for the assigned handler..."
                    value={assignForm.note}
                    onChange={e => setAssignForm({ ...assignForm, note: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssign(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatus && (
        <div className="modal-backdrop" onClick={() => setShowStatus(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Update Complaint Status</span>
              <button className="modal-close" onClick={() => setShowStatus(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleStatusChange}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="newStatus">New Status</label>
                  <select
                    id="newStatus"
                    className="form-control"
                    value={statusForm.status}
                    onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                  >
                    <option value="NEW">New</option>
                    <option value="VALIDATING">Validating</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="STUDENT_VERIFICATION">Student Verification</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="statusReason">Reason / Status Note</label>
                  <textarea
                    id="statusReason"
                    className="form-control"
                    rows={3}
                    placeholder="Provide reason for this status transition..."
                    value={statusForm.reason}
                    onChange={e => setStatusForm({ ...statusForm, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatus(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolve && (
        <div className="modal-backdrop" onClick={() => setShowResolve(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Resolve Ticket</span>
              <button className="modal-close" onClick={() => setShowResolve(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleResolve}>
              <div className="modal-body">
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                  Provide a resolution summary for the student explaining what corrective action was taken.
                </p>
                <div className="form-group">
                  <label className="form-label" htmlFor="resolveNote">
                    Resolution Notes <span className="required">*</span>
                  </label>
                  <textarea
                    id="resolveNote"
                    className="form-control"
                    rows={4}
                    placeholder="e.g. Electrician repaired the faulty circuit breaker in Block B Room 304..."
                    value={resolveNote}
                    onChange={e => setResolveNote(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResolve(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalate && (
        <div className="modal-backdrop" onClick={() => setShowEscalate(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Escalate Incident</span>
              <button className="modal-close" onClick={() => setShowEscalate(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEscalate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="escalateReason">
                    Escalation Reason <span className="required">*</span>
                  </label>
                  <textarea
                    id="escalateReason"
                    className="form-control"
                    rows={4}
                    placeholder="State reason for escalation..."
                    value={escalateForm.reason}
                    onChange={e => setEscalateForm({ ...escalateForm, reason: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEscalate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Escalate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
