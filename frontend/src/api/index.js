import axios from 'axios';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Resume API
export const resumeApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/api/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyze: (resumeId, resumeText) => {
    return api.post('/api/analyze-resume', { resumeId, resumeText });
  },
};

// Notes API
export const notesApi = {
  generate: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/generate-notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// SGPA API
export const sgpaApi = {
  calculate: (subjects) => {
    return api.post('/api/calculate-sgpa', { subjects });
  },
};

// History API
export const historyApi = {
  getAll: (type) => {
    return api.get('/api/history', { params: { type } });
  },
  getResumes: () => historyApi.getAll('resume'),
  getNotes: () => historyApi.getAll('notes'),
  getSGPA: () => historyApi.getAll('sgpa'),
};

export default api;
