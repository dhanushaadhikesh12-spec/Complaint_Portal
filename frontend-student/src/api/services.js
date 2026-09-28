import api from './axios';

// Auth
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Dashboard
export const getStudentDashboard = () => api.get('/student/dashboard');

// Complaints
export const getMyComplaints = (params) => api.get('/student/complaints', { params });
export const getComplaintDetail = (id) => api.get(`/student/complaints/${id}`);
export const submitComplaint = (data) => api.post('/student/complaints', data);
export const getStatusHistory = (id) => api.get(`/student/complaints/${id}/status-history`);
export const uploadAttachment = (id, formData) => api.post(`/student/complaints/${id}/attachments`, formData);
export const getAttachments = (id) => api.get(`/complaints/${id}/attachments`);

// Verification & Feedback
export const verifyComplaint = (id, data) => api.post(`/student/complaints/${id}/verify`, data);
export const submitFeedback = (id, data) => api.post(`/student/complaints/${id}/feedback`, data);

// Comments
export const addComment = (id, data) => api.post(`/student/complaints/${id}/comments`, data);

// Notifications
export const getNotifications = () => api.get('/student/notifications');
export const markNotificationRead = (id) => api.put(`/student/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/student/notifications/read-all');

// Profile
export const getProfile = () => api.get('/student/profile');
export const updateProfile = (data) => api.put('/student/profile', data);

// Departments
export const getDepartments = () => api.get('/student/departments');
