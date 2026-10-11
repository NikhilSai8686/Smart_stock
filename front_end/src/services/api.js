import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartstock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unified response and auth errors
api.interceptors.response.use(
  (response) => {
    // Return inner ApiResponse data when present
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Check for 401 Unauthorized
    if (error.response && error.response.status === 401) {
      if (!originalRequest.url.includes('/auth/login')) {
        localStorage.removeItem('smartstock_token');
        localStorage.removeItem('smartstock_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    const enhancedError = new Error(message);
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    enhancedError.validationErrors = error.response?.data?.validationErrors;

    return Promise.reject(enhancedError);
  }
);

export default api;
