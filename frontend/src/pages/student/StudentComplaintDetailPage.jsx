import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import { getStudentComplaintDetail, verifyComplaint, submitFeedback, addStudentComment } from '../../api/services';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Clock, CheckCircle2, AlertTriangle, XCircle,
  MessageSquare, Send, Star, ThumbsUp, ThumbsDown, RotateCcw,
  Info, Calendar, Tag, Building, User, Shield, ImageIcon,
  ZoomIn, ZoomOut, Download, Eye, X, Check
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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

export default function StudentComplaintDetailPage() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verification modal
  const [showVerify, setShowVerify] = useState(false);
  const [verifyAction, setVerifyAction] = useState('CLOSE');
  const [verifyNote, setVerifyNote] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Feedback modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // Evidence enlarge preview modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  const fetchData = () => {
    setLoading(true);
    getStudentComplaintDetail(complaintId)
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load complaint details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [complaintId]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyComplaint(complaintId, { action: verifyAction, feedback: verifyNote });
      toast.success(verifyAction === 'CLOSE' ? 'Complaint confirmed resolved & closed. Thank you!' : 'Complaint reopened for staff review.');
      setShowVerify(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a star rating');
      return;
    }
    setSubmittingFeedback(true);
    try {
      await submitFeedback(complaintId, { rating, comments: feedbackText });
      toast.success('Thank you for rating our resolution service!');
      setShowFeedback(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      await addStudentComment(complaintId, { comment: commentText.trim() });
      toast.success('Comment added to case history');
      setCommentText('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Complaint Details">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading ticket #{complaintId}...</span>
        </div>
      </StudentLayout>
    );
  }

  if (!data) {
    return (
      <StudentLayout title="Complaint Not Found">
        <div className="empty-state">
          <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <h3>Complaint Record Not Found</h3>
          <p>The requested complaint identifier does not exist or you do not have permission to view it.</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/student/complaints')}>
            <ArrowLeft size={14} /> Back to My Complaints
          </button>
        </div>
      </StudentLayout>
    );
  }

  const c = data?.complaint || data || {};
  const isResolvedOrClosed = c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'STUDENT_VERIFICATION';
  const attachments = data?.attachments || c.attachments || [];
  const history = data?.statusHistory || c.history || [];
  const comments = data?.comments || c.comments || [];

  return (
    <StudentLayout
      title={`Complaint #${c.complaintId || c.id}`}
      subtitle={`Lodged on ${c.createdAt ? format(new Date(c.createdAt), 'PPP p') : '—'}`}
    >
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/complaints')}>
          <ArrowLeft size={14} />
          <span>Back to Complaints</span>
        </button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {c.status === 'STUDENT_VERIFICATION' && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => { setVerifyAction('CLOSE'); setShowVerify(true); }}
            >
              <CheckCircle2 size={14} />
              <span>Verify & Close Ticket</span>
            </button>
          )}

          {isResolvedOrClosed && !c.feedback && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowFeedback(true)}
            >
              <Star size={14} />
              <span>Provide Resolution Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Timeline & Evidence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Subject, Description, Evidence, Activity */}
        <div>
          {/* Main Ticket Card */}
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
                Description
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

              {/* Resolution Note if available */}
              {c.resolutionNote && (
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
                    {c.resolutionNote}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photo Evidence & Attachments */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <ImageIcon size={16} style={{ color: '#2563eb' }} />
                Evidence & Photo Attachments ({attachments.length})
              </h3>
            </div>
            <div className="card-body">
              {attachments.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
                  No photo attachments were uploaded for this complaint.
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
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'transform 0.15s ease'
                        }}
                        onClick={() => { setSelectedImage(fileUrl); setImageZoom(1); }}
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

          {/* Activity / Comments Thread */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <MessageSquare size={16} style={{ color: '#2563eb' }} />
                Case Activity & Communication ({comments.length})
              </h3>
            </div>
            <div className="card-body">
              {comments.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', marginBottom: 16 }}>
                  No messages yet. You can post a message or inquiry below.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {comments.map((cm, idx) => (
                    <div
                      key={cm.id || idx}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: cm.authorRole === 'STUDENT' ? '#f0f7ff' : '#f8fafc',
                        border: `1px solid ${cm.authorRole === 'STUDENT' ? '#bae0fd' : '#e2e8f0'}`,
                        borderRadius: 8
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: cm.authorRole === 'STUDENT' ? '#0369a1' : '#0f172a' }}>
                          {cm.authorName || 'Staff Member'} {cm.authorRole && `(${cm.authorRole.replace('_', ' ')})`}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          {cm.createdAt ? formatDistanceToNow(new Date(cm.createdAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                        {cm.comment || cm.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment}>
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Type an update or reply for the assigned staff..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    disabled={addingComment}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={addingComment || !commentText.trim()}
                  >
                    {addingComment ? 'Sending...' : (
                      <>
                        <Send size={13} />
                        <span>Post Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Case Meta & Timeline */}
        <div>
          {/* Metadata Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Case Metadata</h3>
            </div>
            <div className="card-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Category</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{c.category}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {c.departmentName || c.department?.name || 'General Campus Triage'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned Handler</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {c.assignedToName || c.assignedTo?.fullName || 'Awaiting Handler Assignment'}
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

          {/* Lifecycle Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Resolution Timeline</h3>
            </div>
            <div className="card-body">
              <div className="timeline-track">
                {/* Step 1: Submitted */}
                <div className="timeline-step completed">
                  <div className="timeline-step-marker">
                    <Check size={12} />
                  </div>
                  <div className="timeline-step-content">
                    <div className="timeline-step-title">Complaint Submitted</div>
                    <div className="timeline-step-desc">
                      {c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : 'Completed'}
                    </div>
                  </div>
                </div>

                {/* Step 2: Under Review */}
                <div className={`timeline-step ${c.status !== 'NEW' ? 'completed' : 'current'}`}>
                  <div className="timeline-step-marker">
                    {c.status !== 'NEW' ? <Check size={12} /> : '2'}
                  </div>
                  <div className="timeline-step-content">
                    <div className="timeline-step-title">Department Review & Triage</div>
                    <div className="timeline-step-desc">Assigned to resolution team</div>
                  </div>
                </div>

                {/* Step 3: In Progress */}
                <div className={`timeline-step ${['RESOLVED', 'CLOSED', 'STUDENT_VERIFICATION'].includes(c.status) ? 'completed' : (c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' ? 'current' : '')}`}>
                  <div className="timeline-step-marker">
                    {['RESOLVED', 'CLOSED', 'STUDENT_VERIFICATION'].includes(c.status) ? <Check size={12} /> : '3'}
                  </div>
                  <div className="timeline-step-content">
                    <div className="timeline-step-title">Investigation & Action</div>
                    <div className="timeline-step-desc">Maintenance staff working on fix</div>
                  </div>
                </div>

                {/* Step 4: Resolved */}
                <div className={`timeline-step ${['RESOLVED', 'CLOSED'].includes(c.status) ? 'completed' : ''}`}>
                  <div className="timeline-step-marker">
                    {['RESOLVED', 'CLOSED'].includes(c.status) ? <Check size={12} /> : '4'}
                  </div>
                  <div className="timeline-step-content">
                    <div className="timeline-step-title">Resolved & Verified</div>
                    <div className="timeline-step-desc">
                      {c.resolvedAt ? format(new Date(c.resolvedAt), 'MMM d, h:mm a') : 'Resolution pending'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 720 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">Evidence Photo Preview</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.open(selectedImage, '_blank')}
                  title="Open Original"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
                <button
                  className="modal-close"
                  onClick={() => setSelectedImage(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="modal-body" style={{ padding: 0, backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
              <img
                src={selectedImage}
                alt="Enlarged Evidence"
                style={{
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="modal-backdrop" onClick={() => setShowFeedback(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Rate Incident Resolution</span>
              <button className="modal-close" onClick={() => setShowFeedback(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleFeedback}>
              <div className="modal-body">
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                    How satisfied are you with the timeliness and quality of this resolution?
                  </p>
                  <div style={{ display: 'inline-flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 4
                        }}
                      >
                        <Star
                          size={30}
                          fill={star <= rating ? '#f59e0b' : 'none'}
                          color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="feedbackText">
                    Additional Comments <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea
                    id="feedbackText"
                    className="form-control"
                    rows={3}
                    placeholder="Share any feedback on the staff response..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFeedback(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingFeedback}>
                  {submittingFeedback ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify & Close Modal */}
      {showVerify && (
        <div className="modal-backdrop" onClick={() => setShowVerify(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Verify Complaint Resolution</span>
              <button className="modal-close" onClick={() => setShowVerify(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13.5, color: '#334155', marginBottom: 16 }}>
                Please confirm whether the reported grievance has been satisfactorily resolved by campus personnel.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setVerifyAction('CLOSE')}
                  style={{
                    padding: '14px',
                    borderRadius: 8,
                    border: `2px solid ${verifyAction === 'CLOSE' ? '#10b981' : '#e2e8f0'}`,
                    backgroundColor: verifyAction === 'CLOSE' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <CheckCircle2 size={22} color="#10b981" />
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#065f46' }}>Issue is Resolved</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyAction('REOPEN')}
                  style={{
                    padding: '14px',
                    borderRadius: 8,
                    border: `2px solid ${verifyAction === 'REOPEN' ? '#ef4444' : '#e2e8f0'}`,
                    backgroundColor: verifyAction === 'REOPEN' ? '#fef2f2' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <RotateCcw size={22} color="#ef4444" />
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#991b1b' }}>Reopen Ticket</span>
                </button>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="verifyNote">
                  Verification Note <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  id="verifyNote"
                  className="form-control"
                  rows={3}
                  placeholder={verifyAction === 'CLOSE' ? 'Thank you for resolving this...' : 'Please explain why this issue is not yet resolved...'}
                  value={verifyNote}
                  onChange={e => setVerifyNote(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowVerify(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${verifyAction === 'CLOSE' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying ? 'Processing...' : (verifyAction === 'CLOSE' ? 'Confirm & Close Ticket' : 'Reopen Ticket')}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
