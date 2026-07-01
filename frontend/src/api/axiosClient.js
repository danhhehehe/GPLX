import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 20000
});

const pendingGetRequests = new Map();

const normalizeParams = (params) => {
  if (!params) return '';

  return new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)])
  ).toString();
};

const getRequestKey = (url, config = {}) => {
  const baseURL = config.baseURL || axiosClient.defaults.baseURL || '';
  return `${baseURL}:${url || ''}:${normalizeParams(config.params)}`;
};

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;
    const message = status && status < 500
      ? serverMessage || 'Yêu cầu không hợp lệ.'
      : 'Không thể kết nối máy chủ. Vui lòng thử lại sau.';
    return Promise.reject(new Error(message));
  }
);

const originalGet = axiosClient.get.bind(axiosClient);

axiosClient.get = (url, config = {}) => {
  const key = getRequestKey(url, config);

  if (pendingGetRequests.has(key)) {
    return pendingGetRequests.get(key);
  }

  const request = originalGet(url, config).finally(() => {
    pendingGetRequests.delete(key);
  });

  pendingGetRequests.set(key, request);
  return request;
};

export default axiosClient;
