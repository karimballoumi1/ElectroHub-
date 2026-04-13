import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8088/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on expired/invalid token (403 on protected endpoints)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && localStorage.getItem('token')) {
      // Token is likely expired - clear it and redirect to login
      const isPublicEndpoint = error.config?.url?.includes('/auth/');
      if (!isPublicEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
