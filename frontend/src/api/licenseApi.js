import axiosClient from './axiosClient.js';

export const licenseApi = {
  getLicenses: () => axiosClient.get('/licenses'),
  getLicenseByCode: (code) => axiosClient.get(`/licenses/${code}`),
  getLicenseStatistics: () => axiosClient.get('/licenses/statistics')
};
