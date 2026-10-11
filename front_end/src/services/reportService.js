import api from './api';

export const reportService = {
  getSalesReport: async (params = {}) => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },

  getProfitReport: async (params = {}) => {
    const response = await api.get('/reports/profit', { params });
    return response.data;
  },

  getBestSelling: async (limit = 5) => {
    const response = await api.get('/reports/best-selling-products', { params: { limit } });
    return response.data;
  },

  getSlowMoving: async (limit = 5) => {
    const response = await api.get('/reports/slow-moving-products', { params: { limit } });
    return response.data;
  }
};

export default reportService;
