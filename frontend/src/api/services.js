import api from './axios';

// Auth
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Complaints
export const getComplaints = (params) => api.get('/complaints', { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const createComplaint = (data) => api.post('/complaints', data);
export const assignComplaint = (id, data) => api.put(`/complaints/${id}/assign`, data);
export const updateStatus = (id, data) => api.put(`/complaints/${id}/status`, data);
export const updatePriority = (id, data) => api.put(`/complaints/${id}/priority`, data);
export const escalateComplaint = (id, data) => api.post(`/complaints/${id}/escalate`, data);
export const resolveComplaint = (id, data) => api.post(`/complaints/${id}/resolve`, data);
export const closeComplaint = (id) => api.post(`/complaints/${id}/close`);
export const getComments = (id) => api.get(`/complaints/${id}/comments`);
export const addComment = (id, data) => api.post(`/complaints/${id}/comments`, data);
export const getEscalations = (id) => api.get(`/complaints/${id}/escalations`);
export const getAttachments = (id) => api.get(`/complaints/${id}/attachments`);
export const uploadAttachment = (id, formData) => api.post(`/complaints/${id}/attachments`, formData);

// Lookups
export const getStudents = () => api.get('/complaints/students');
export const getHandlers = () => api.get('/complaints/handlers');

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// Admin Management (Super Admin)
export const getAdmins = () => api.get('/admin-mgmt');
export const createAdmin = (data) => api.post('/admin-mgmt', data);
export const getDepartments = () => api.get('/admin-mgmt/departments');

// Audit Logs
export const getAuditLogs = (params) => api.get('/audit-logs', { params });

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

// ==========================================
// Student Portal Endpoints
// ==========================================
export const getStudentDashboard = () => api.get('/student/dashboard');
export const getMyComplaints = (params) => api.get('/student/complaints', { params });
export const getStudentComplaintDetail = (id) => api.get(`/student/complaints/${id}`);
export const submitStudentComplaint = (data) => api.post('/student/complaints', data);
export const getStudentStatusHistory = (id) => api.get(`/student/complaints/${id}/status-history`);
export const uploadStudentAttachment = (id, formData) => api.post(`/student/complaints/${id}/attachments`, formData);
export const verifyComplaint = (id, data) => api.post(`/student/complaints/${id}/verify`, data);
export const submitFeedback = (id, data) => api.post(`/student/complaints/${id}/feedback`, data);
export const addStudentComment = (id, data) => api.post(`/student/complaints/${id}/comments`, data);
export const getStudentNotifications = () => api.get('/student/notifications');
export const markStudentNotificationRead = (id) => api.put(`/student/notifications/${id}/read`);
export const markAllStudentNotificationsRead = () => api.put('/student/notifications/read-all');
export const getStudentProfile = () => api.get('/student/profile');
export const updateStudentProfile = (data) => api.put('/student/profile', data);
export const getStudentDepartments = () => api.get('/student/departments');
