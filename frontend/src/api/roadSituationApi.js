import axiosClient from './axiosClient.js';

export const roadSituationApi = {
  getSituations: (params) => axiosClient.get('/road-situations', { params }),
  createSituation: (payload) => axiosClient.post('/road-situations', payload),
  updateSituation: (id, payload) => axiosClient.put(`/road-situations/${id}`, payload),
  deleteSituation: (id) => axiosClient.delete(`/road-situations/${id}`)
};
