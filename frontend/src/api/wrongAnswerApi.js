import axiosClient from './axiosClient.js';

export const wrongAnswerApi = {
  getWrongQuestions: (params) => axiosClient.get('/wrong-answers', { params }),
  saveWrongAnswer: (payload) => axiosClient.post('/wrong-answers', payload),
  removeFixedQuestion: (id) => axiosClient.delete(`/wrong-answers/${id}`)
};
