import api from './api';

export const purchaseService = {
  createPurchase: async (purchaseData) => {
    const response = await api.post('/purchases', purchaseData);
    return response.data;
  },

  getPurchases: async (params = {}) => {
    const response = await api.get('/purchases', { params });
    return response.data;
  },

  getPurchaseById: async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  }
};

export default purchaseService;
