import api from './api';

export const alertService = {
  getLowStockAlerts: async () => {
    const response = await api.get('/alerts/low-stock');
    return response.data;
  },

  getExpiryAlerts: async () => {
    const response = await api.get('/alerts/expiry');
    return response.data;
  }
};

export default alertService;
