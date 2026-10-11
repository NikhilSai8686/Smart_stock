import api from './api';

export const saleService = {
  createSale: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  getSales: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getSaleById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  getSaleByInvoice: async (invoiceNumber) => {
    const response = await api.get(`/sales/invoice/${invoiceNumber}`);
    return response.data;
  }
};

export default saleService;
