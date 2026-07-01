import axiosClient from './axiosClient.js';

export const examApi = {
  getExamSets: (licenseType = 'A1') => axiosClient.get('/exam/sets', { params: { licenseType } }),
  createExamSession: (payload) => axiosClient.post('/exam/create', payload),
  submitExam: (payload) => axiosClient.post('/exam/submit', payload),
  getExam: (licenseType = 'A1') => axiosClient.get(`/exam/${licenseType}`),
  getA1Exam: () => axiosClient.get('/exam/a1'),
  submit: (answers, licenseType = 'A1') => axiosClient.post('/exam/submit', { answers, licenseType })
};
