import axiosClient from './axiosClient.js';

export const memoryTipApi = {
  getTips: (params) => axiosClient.get('/memory-tips', { params }),
  createTip: (payload) => axiosClient.post('/memory-tips', payload),
  updateTip: (id, payload) => axiosClient.put(`/memory-tips/${id}`, payload),
  deleteTip: (id) => axiosClient.delete(`/memory-tips/${id}`)
};
