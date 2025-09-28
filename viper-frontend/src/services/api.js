import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Don't show toast for certain endpoints
    const silentEndpoints = ['/auth/me', '/auth/verify-token'];
    const shouldShowToast = !silentEndpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );
    
    if (shouldShowToast) {
      const message = error.response?.data?.message || 'An error occurred';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  updateSettings: (data) => api.put('/auth/settings', data),
  verifyToken: () => api.post('/auth/verify-token'),
};

// Proofs API
export const proofsAPI = {
  getProofs: (params) => api.get('/proofs', { params }),
  getProof: (id) => api.get(`/proofs/${id}`),
  uploadProof: (formData) => api.post('/proofs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProof: (id, data) => api.put(`/proofs/${id}`, data),
  updateProofStatus: (id, data) => api.put(`/proofs/${id}/status`, data),
  deleteProof: (id) => api.delete(`/proofs/${id}`),
  downloadProof: (id) => api.get(`/proofs/${id}/download`, {
    responseType: 'blob',
  }),
  getProofStats: () => api.get('/proofs/stats/summary'),
};

// Certificates API
export const certificatesAPI = {
  getCertificates: (params) => api.get('/certificates', { params }),
  getCertificate: (id) => api.get(`/certificates/${id}`),
  generateCertificate: (data) => api.post('/certificates', data),
  updateCertificate: (id, data) => api.put(`/certificates/${id}`, data),
  issueCertificate: (id) => api.put(`/certificates/${id}/issue`),
  revokeCertificate: (id, data) => api.put(`/certificates/${id}/revoke`, data),
  downloadCertificate: (id, format = 'pdf') => api.get(`/certificates/${id}/download`, {
    params: { format },
    responseType: 'blob',
  }),
  verifyCertificate: (verificationCode) => api.get(`/certificates/verify/${verificationCode}`),
  getCertificateStats: () => api.get('/certificates/stats/summary'),
};

// Statistics API
export const statisticsAPI = {
  getDashboardStats: (params) => api.get('/statistics/dashboard', { params }),
  getPerformanceStats: (params) => api.get('/statistics/performance', { params }),
  getComplianceStats: (params) => api.get('/statistics/compliance', { params }),
  exportStats: (params) => api.get('/statistics/export', { 
    params,
    responseType: 'blob',
  }),
};

// Audit API
export const auditAPI = {
  getAuditLogs: (params) => api.get('/audit/logs', { params }),
  getAuditLog: (id) => api.get(`/audit/logs/${id}`),
  getAuditStats: (params) => api.get('/audit/statistics', { params }),
  exportAuditLogs: (params) => api.get('/audit/export', { 
    params,
    responseType: 'blob',
  }),
  archiveOldLogs: (daysOld) => api.post('/audit/archive', null, {
    params: { daysOld },
  }),
  getSecurityAlerts: (params) => api.get('/audit/security-alerts', { params }),
};

// Users API (Admin only)
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deactivateUser: (id) => api.put(`/users/${id}/deactivate`),
  activateUser: (id) => api.put(`/users/${id}/activate`),
  unlockUser: (id) => api.put(`/users/${id}/unlock`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats/summary'),
};

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const getStatusColor = (status) => {
  const colors = {
    success: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    verified: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
    processing: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    failed: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
    error: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
    warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
    info: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    expired: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400',
    revoked: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
    issued: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    draft: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400',
    generated: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
  };
  
  return colors[status] || colors.info;
};

export const getSeverityColor = (severity) => {
  const colors = {
    low: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
    high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
    critical: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
  };
  
  return colors[severity] || colors.low;
};

export default api;
