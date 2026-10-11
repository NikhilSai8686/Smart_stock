import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('smartstock_token', response.data.token);
      localStorage.setItem('smartstock_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('smartstock_token');
    localStorage.removeItem('smartstock_user');
  },

  getStoredUser: () => {
    try {
      const user = localStorage.getItem('smartstock_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('smartstock_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('smartstock_token');
  }
};

export default authService;
