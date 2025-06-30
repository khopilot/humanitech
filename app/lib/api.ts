import axios from 'axios';
import { useAuthStore } from '~/store/auth';

// Configuration de l'URL de l'API selon l'environnement
const API_BASE_URL = import.meta.env.PROD
  ? 'https://humanitech.pienikdelrieu.workers.dev/api'
  : 'http://localhost:8787/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT et CSRF
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === Documents API ===
export const documentsApi = {
  upload: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  list: (params?: { type?: string; limit?: number; offset?: number }) => 
    apiClient.get('/documents', { params }),
  
  getById: (id: string) => 
    apiClient.get(`/documents/${id}`),
  
  delete: (id: string) => 
    apiClient.delete(`/documents/${id}`),
};

// === Reports API ===
export const reportsApi = {
  generate: (data: {
    reportType: string;
    dataSource: string;
    donorSpecific?: string;
    dateRange?: { start: string; end: string };
  }) => apiClient.post('/reports/generate', data),
  
  list: (params?: { type?: string; limit?: number; offset?: number }) =>
    apiClient.get('/reports', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/reports/${id}`),
};

// === Chat API ===
export const chatApi = {
  sendMessage: (data: {
    messages: Array<{ role: string; content: string }>;
    chatId?: string;
  }) => apiClient.post('/chat', data),
  
  getHistory: (params?: { limit?: number; offset?: number }) =>
    apiClient.get('/chat/history', { params }),
  
  getChat: (id: string) =>
    apiClient.get(`/chat/${id}`),
};

// === Risk Analysis API ===
export const riskAnalysisApi = {
  analyze: (data: { area: string; includeHistorical?: boolean }) =>
    apiClient.post('/risk-analysis', data),
  
  list: (params?: { area?: string; limit?: number; offset?: number }) =>
    apiClient.get('/risk-analysis', { params }),
};

// === SOP API ===
export const sopApi = {
  generate: (data: {
    topic: string;
    category: string;
    imasStandards: string[];
  }) => apiClient.post('/sop/generate', data),
  
  list: (params?: { category?: string; limit?: number; offset?: number }) =>
    apiClient.get('/sop', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/sop/${id}`),
};

// === Auth API ===
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    apiClient.post('/auth/register', data),
  
  refresh: () =>
    apiClient.post('/auth/refresh'),
  
  profile: () =>
    apiClient.get('/auth/profile'),
};

// === Analytics API ===
export const analyticsApi = {
  getStats: () =>
    apiClient.get('/analytics/stats'),
  
  getActivity: (params?: { days?: number }) =>
    apiClient.get('/analytics/activity', { params }),
};