import axiosClient from './axiosClient.js';

export const questionApi = {
  getQuestions: (params) => axiosClient.get('/questions', { params }),
  getA1Questions: (params) => axiosClient.get('/questions/a1', { params }),
  getPointDeduction: (params) => axiosClient.get('/questions/point-deduction', { params }),
  getWithImages: (params) => axiosClient.get('/questions/with-images', { params }),
  getNoImages: (params) => axiosClient.get('/questions/no-images', { params }),
  getImageCheck: () => axiosClient.get('/questions/image-check'),
  getStatistics: () => axiosClient.get('/questions/statistics'),
  getCategories: () => axiosClient.get('/questions/categories'),
  getByLicense: (type, params) => axiosClient.get(`/questions/license/${type}`, { params })
};
