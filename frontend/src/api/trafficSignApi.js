import axiosClient from './axiosClient.js';

export const trafficSignApi = {
  getSigns: (params) => axiosClient.get('/traffic-signs', { params }),
  getGroups: () => axiosClient.get('/traffic-signs/groups'),
  getStatistics: () => axiosClient.get('/traffic-signs/statistics'),
  getByCode: (code) => axiosClient.get(`/traffic-signs/${code}`),
  getByGroup: (group) => axiosClient.get(`/traffic-signs/group/${group}`)
};
