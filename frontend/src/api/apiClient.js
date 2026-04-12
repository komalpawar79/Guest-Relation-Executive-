import axios from 'axios';

const API_BASE_URL = 'https://gre-bxnz.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Client endpoints
export const clientAPI = {
  addClient: (data) => api.post('/clients', data),
  getClients: (filters) => api.get('/clients', { params: filters }),
  getClient: (id) => api.get(`/clients/${id}`),
  updateClient: (id, data) => api.put(`/clients/${id}`, data),
  updateRemark: (id, remark) => api.put(`/clients/${id}/remark`, { remark }),
  markAttended: (id, data) => api.put(`/clients/${id}/attendance`, data),
  deleteClient: (id) => api.delete(`/clients/${id}`),
};

// Report endpoints
export const reportAPI = {
  getDailyReport: (date) => api.get('/reports/daily', { params: { date } }),
  getMonthlyReport: (month, year) =>
    api.get('/reports/monthly', { params: { month, year } }),
  getYearlyReport: (year) => api.get('/reports/yearly', { params: { year } }),
  getManagerAnalytics: (filters) =>
    api.get('/reports/manager-analytics', { params: filters }),
  getAnalytics: (filters) => api.get('/reports/analytics', { params: filters }),
};

// Excel endpoints
export const excelAPI = {
  exportClients: (filters) =>
    api.get('/excel/export', { params: filters, responseType: 'blob' }),
};

// Attendance endpoints
export const attendanceAPI = {
  addAttendance: (data) => api.post('/attendance', data),
  getAttendance: (filters) => api.get('/attendance', { params: filters }),
  getManagerStats: (filters) =>
    api.get('/attendance/stats/manager', { params: filters }),
  getAttendanceById: (id) => api.get(`/attendance/${id}`),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
};

export default api;
