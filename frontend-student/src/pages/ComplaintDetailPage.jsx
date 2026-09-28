import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getComplaintDetail, verifyComplaint, submitFeedback, addComment } from '../api/services';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Clock, CheckCircle, AlertTriangle, XCircle,
  MessageSquare, Send, Star, ThumbsUp, ThumbsDown, RotateCcw,
  Info, Calendar, Tag, Building, User, Shield, ImageIcon,
  ZoomIn, ZoomOut, Download, Eye, X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

function getStatusBadge(s) {
  const map = {
    NEW: 'badge-new', VALIDATING: 'badge-validating', ASSIGNED: 'badge-assigned',
    IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved',
    STUDENT_VERIFICATION: 'badge-verify', CLOSED: 'badge-closed',
    ESCALATED: 'badge-escalated', REJECTED: 'badge-rejected', REOPENED: 'badge-reopened',
  };
  return map[s] || 'badge-new';
}

function getPriorityBadge(p) {
  const map = { CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
  return map[p] || 'badge-medium';
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 className="card-title">
        <Icon size={15} style={{ color: 'var(--primary-400)' }} />{title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 120 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function ComplaintDetailPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify modal
  const [showVerify, setShowVerify] = useState(false);
  const [verifyAction, setVerifyAction] = useState('CLOSE');
  const [verifyNote, setVerifyNote] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Comment
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // Evidence preview modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageZoom, setImageZoom]         = useState(1);
  const [imageErrorMap, setImageErrorMap] = useState({});

  const fetchData = () => {
    setLoading(true);
    getComplaintDetail(complaintId)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load complaint details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [complaintId]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyComplaint(complaintId, { action: verifyAction, feedback: verifyNote });
      toast.success(verifyAction === 'CLOSE' ? 'Complaint closed. Thank you!' : 'Complaint reopened.');
      setShowVerify(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleFeedback = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmittingFeedback(true);
    try {
      await submitFeedback(complaintId, { rating, feedbackText });
      toast.success('Feedback submitted. Thank you!');
      setShowFeedback(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      await addComment(complaintId, { content: commentText.trim() });
      toast.success('Comment added');
      setCommentText('');
      fetchData();
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) return (
    <Layout title="Complaint Details">
      <div className="loading-page"><div className="spinner" /><span>Loading complaint details...</span></div>
    </Layout>
  );

  if (!data) return (
    <Layout title="Complaint Details">
      <div className="empty-state">
        <Info size={36} />
        <h3>Complaint not found</h3>
        <p>This complaint doesn't exist or you don't have access to it.</p>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/complaints')}>
          <ArrowLeft size={14} /> Back to My Complaints
        </button>
      </div>
    </Layout>
  );

  const { complaint: c, statusHistory = [], comments = [], feedback } = data;
  const canVerify = (c.status === 'STUDENT_VERIFICATION' || c.status === 'RESOLVED');
  const canFeedback = !feedback && (c.status === 'CLOSED' || c.status === 'RESOLVED' || c.status === 'STUDENT_VERIFICATION');
  const canComment = !['CLOSED', 'REJECTED'].includes(c.status);

  return (
    <Layout title="Complaint Details">
      <div className="fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/complaints')}>
              <ArrowLeft size={13} /> Back
            </button>
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--primary-400)', fontWeight: 700 }}>
                {c.complaintId}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{c.title}</h2>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`badge ${getStatusBadge(c.status)}`} style={{ fontSize: 12 }}>
              {c.status?.replace(/_/g, ' ')}
            </span>
            <span className={`badge ${getPriorityBadge(c.priority)}`} style={{ fontSize: 12 }}>
              {c.priority}
            </span>
          </div>
        </div>

        {/* STUDENT_VERIFICATION Banner */}
        {c.status === 'STUDENT_VERIFICATION' && (
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Action Required!</strong> Your complaint has been resolved. Please review the resolution and confirm if it has been addressed.
              {c.resolutionNote && <p style={{ marginTop: 6, fontSize: 12 }}><strong>Resolution:</strong> {c.resolutionNote}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { setVerifyAction('CLOSE'); setShowVerify(true); }}>
                  <ThumbsUp size={13} /> Issue Resolved
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => { setVerifyAction('REOPEN'); setShowVerify(true); }}>
                  <ThumbsDown size={13} /> Not Resolved
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback prompt */}
        {canFeedback && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            <Star size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Share Your Feedback</strong>
              <p style={{ fontSize: 12, marginTop: 4 }}>How was your experience with the complaint resolution?</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setShowFeedback(true)}>
                <Star size={13} /> Leave Feedback
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            <Star size={16} />
            <span>
              You rated this complaint <strong>{feedback.rating}/5</strong>.
              {feedback.feedbackText && ` "${feedback.feedbackText}"`}
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
          {/* LEFT COLUMN */}
          <div>
            {/* Complaint Info */}
            <Section title="Complaint Information" icon={Info}>
              <InfoRow label="Complaint ID" value={c.complaintId} />
              <InfoRow label="Category" value={c.category?.replace('_', ' ')} />
              <InfoRow label="Department" value={c.department?.name} />
              <InfoRow label="Assigned To" value={c.handler?.fullName} />
              <InfoRow label="Submitted" value={c.createdAt ? format(new Date(c.createdAt), 'PPpp') : '—'} />
              <InfoRow label="Due Date" value={c.dueDate ? format(new Date(c.dueDate), 'PPpp') : '—'} />
              {c.resolvedAt && <InfoRow label="Resolved On" value={format(new Date(c.resolvedAt), 'PPpp')} />}
              {c.closedAt && <InfoRow label="Closed On" value={format(new Date(c.closedAt), 'PPpp')} />}
              {c.resolutionNote && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(16,185,129,0.07)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Resolution Note</p>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{c.resolutionNote}</p>
                </div>
              )}
              {c.rejectionReason && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.07)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Rejection Reason</p>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{c.rejectionReason}</p>
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Description</p>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{c.description}</p>
              </div>
            </Section>

            {/* Evidence Section */}
            <Section title={`Evidence Images (${(data.attachments || c.attachments || []).length})`} icon={ImageIcon}>
              {(data.attachments || c.attachments || []).length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '20px 14px',
                  background: 'var(--bg-elevated)', borderRadius: 8,
                  border: '1px dashed var(--border-subtle)'
                }}>
                  <ImageIcon size={26} style={{ color: 'var(--text-muted)', margin: '0 auto 6px', opacity: 0.6, display: 'block' }} />
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    No evidence images were uploaded for this complaint.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
                  {(data.attachments || c.attachments || []).map((att, idx) => {
                    const token = localStorage.getItem('student_token') || '';
                    const apiOrigin = import.meta.env.VITE_API_ORIGIN || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : 'http://localhost:8080');
                    const imgUrl = `${apiOrigin}/api/complaints/${c.id || complaintId}/attachments/${att.id}?token=${token}`;
                    const hasError = imageErrorMap[att.id];
                    const formatSize = (b) => {
                      if (!b) return '';
                      if (b < 1024) return b + ' B';
                      if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
                      return (b / (1024 * 1024)).toFixed(2) + ' MB';
                    };

                    return (
                      <div
                        key={att.id || idx}
                        style={{
                          background: 'var(--bg-elevated)',
                          borderRadius: 8,
                          border: '1px solid var(--border-subtle)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onClick={() => {
                          setSelectedImage({ ...att, fullUrl: imgUrl });
                          setImageZoom(1);
                        }}
                      >
                        <div style={{
                          height: 110, background: '#090d16',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative', overflow: 'hidden'
                        }}>
                          {hasError ? (
                            <div style={{ padding: 8, textAlign: 'center', color: '#f87171', fontSize: 11 }}>
                              <AlertTriangle size={18} style={{ margin: '0 auto 4px', display: 'block' }} />
                              <span>Unable to load image</span>
                            </div>
                          ) : (
                            <img
                              src={imgUrl}
                              alt={att.originalFilename || 'Evidence'}
                              onError={() => setImageErrorMap(prev => ({ ...prev, [att.id]: true }))}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                          <p style={{
                            fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                          }} title={att.originalFilename}>
                            {att.originalFilename || `Evidence ${idx + 1}`}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10.5, color: 'var(--text-muted)' }}>
                            <span>{formatSize(att.fileSize)}</span>
                            <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>Inspect →</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Comments */}
            <Section title="Comments & Updates" icon={MessageSquare}>
              {comments.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  No comments yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  {comments.map(cm => (
                    <div key={cm.id} style={{
                      padding: '10px 12px',
                      background: cm.authorRole === 'STUDENT' ? 'rgba(16,185,129,0.06)' : 'var(--bg-elevated)',
                      borderRadius: 8,
                      border: `1px solid ${cm.authorRole === 'STUDENT' ? 'rgba(16,185,129,0.15)' : 'var(--border-subtle)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: cm.authorRole === 'STUDENT' ? 'var(--primary-400)' : 'var(--accent-400)' }}>
                          {cm.authorName} ({cm.authorRole})
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {cm.createdAt ? formatDistanceToNow(new Date(cm.createdAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cm.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {canComment && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <textarea
                    className="form-textarea"
                    placeholder="Add a comment or provide additional information..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    style={{ minHeight: 70, flex: 1 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleAddComment}
                    disabled={addingComment || !commentText.trim()}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    {addingComment ? <span className="spinner" /> : <Send size={14} />}
                  </button>
                </div>
              )}
            </Section>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Status Timeline */}
            <Section title="Status Timeline" icon={Clock}>
              {statusHistory.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No history yet.</p>
              ) : (
                <div className="timeline">
                  {statusHistory.map((h, idx) => (
                    <div key={h.id} className="timeline-item">
                      <div className="timeline-connector">
                        <div className={`timeline-dot ${idx === statusHistory.length - 1 ? 'current' : 'completed'}`}>
                          {idx === statusHistory.length - 1 ? '●' : '✓'}
                        </div>
                        {idx < statusHistory.length - 1 && <div className="timeline-line" />}
                      </div>
                      <div className="timeline-content">
                        <h4>
                          <span className={`badge ${getStatusBadge(h.status)}`} style={{ fontSize: 10 }}>
                            {h.status?.replace(/_/g, ' ')}
                          </span>
                        </h4>
                        {h.actorName && (
                          <p style={{ marginTop: 4 }}>
                            by {h.actorName}
                            {h.actorRole && <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>({h.actorRole})</span>}
                          </p>
                        )}
                        {h.note && <p style={{ fontStyle: 'italic', marginTop: 2 }}>{h.note}</p>}
                        <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                          {h.changedAt ? formatDistanceToNow(new Date(h.changedAt), { addSuffix: true }) : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Quick Info */}
            <Section title="Details" icon={Tag}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Complaint ID', value: <code style={{ fontSize: 12 }}>{c.complaintId}</code> },
                  { label: 'Status', value: <span className={`badge ${getStatusBadge(c.status)}`}>{c.status?.replace(/_/g, ' ')}</span> },
                  { label: 'Priority', value: <span className={`badge ${getPriorityBadge(c.priority)}`}>{c.priority}</span> },
                  { label: 'Category', value: c.category },
                  { label: 'Department', value: c.department?.name },
                ].map(({ label, value }) => value && (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Verify Modal */}
      {showVerify && (
        <div className="modal-overlay" onClick={() => setShowVerify(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {verifyAction === 'CLOSE' ? '✅ Confirm Resolution' : '🔄 Reopen Complaint'}
              </h3>
              <button className="btn btn-ghost" onClick={() => setShowVerify(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`btn ${verifyAction === 'CLOSE' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setVerifyAction('CLOSE')}
                >
                  <ThumbsUp size={13} /> Issue Resolved
                </button>
                <button
                  className={`btn ${verifyAction === 'REOPEN' ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                  onClick={() => setVerifyAction('REOPEN')}
                >
                  <RotateCcw size={13} /> Not Resolved
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {verifyAction === 'CLOSE' ? 'Any additional feedback?' : 'Reason for reopening *'}
                </label>
                <textarea
                  className="form-textarea"
                  placeholder={verifyAction === 'CLOSE' ? 'Optional feedback...' : 'Please explain why the issue was not resolved...'}
                  value={verifyNote}
                  onChange={e => setVerifyNote(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowVerify(false)}>Cancel</button>
              <button
                className={`btn ${verifyAction === 'CLOSE' ? 'btn-primary' : 'btn-danger'} btn-sm`}
                onClick={handleVerify}
                disabled={verifying || (verifyAction === 'REOPEN' && !verifyNote.trim())}
              >
                {verifying ? <span className="spinner" /> : null}
                {verifyAction === 'CLOSE' ? 'Confirm Resolved' : 'Reopen Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⭐ Submit Feedback</h3>
              <button className="btn btn-ghost" onClick={() => setShowFeedback(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
                How was your complaint handled?
              </p>
              <div className="star-rating" style={{ justifyContent: 'center', fontSize: 36, gap: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    className={`star ${n <= rating ? 'active' : ''}`}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </span>
                ))}
              </div>
              {rating > 0 && (
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                  {['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][rating]}
                </p>
              )}
              <div className="form-group">
                <label className="form-label">Additional feedback (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share your experience..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowFeedback(false)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleFeedback}
                disabled={submittingFeedback || rating === 0}
              >
                {submittingFeedback ? <span className="spinner" /> : <Star size={13} />}
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Inspection Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)} style={{ zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <div
            style={{
              maxWidth: 860,
              width: '90vw',
              background: '#0d1524',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '12px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#111b2e'
            }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f6ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={15} color="#10b981" />
                  {selectedImage.originalFilename || 'Evidence Image'}
                </h3>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  Uploaded on {selectedImage.createdAt ? format(new Date(selectedImage.createdAt), 'PPpp') : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))}>
                  <ZoomOut size={13} />
                </button>
                <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 38, textAlign: 'center' }}>
                  {Math.round(imageZoom * 100)}%
                </span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setImageZoom(z => Math.min(3, z + 0.25))}>
                  <ZoomIn size={13} />
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setImageZoom(1)}>
                  <RotateCcw size={13} />
                </button>
                <button type="button" className="icon-btn" onClick={() => setSelectedImage(null)} style={{ marginLeft: 6 }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              minHeight: 320,
              background: '#090d16'
            }}>
              <img
                src={selectedImage.fullUrl}
                alt={selectedImage.originalFilename}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  transform: `scale(${imageZoom})`,
                  transition: 'transform 0.15s ease-out',
                  borderRadius: 6
                }}
              />
            </div>

            <div style={{
              padding: '10px 18px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: '#111b2e',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedImage(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
