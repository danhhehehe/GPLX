import axiosClient from './axiosClient.js';

const getApiOrigin = () => {
  const baseURL = axiosClient.defaults.baseURL || '';

  try {
    return new URL(baseURL, window.location.origin).origin;
  } catch (error) {
    return window.location.origin;
  }
};

const toMediaUrl = (url) => {
  if (!url || /^https?:\/\//i.test(url)) return url;
  return `${getApiOrigin()}${url.startsWith('/') ? url : `/${url}`}`;
};

const normalizeClip = (clip) => ({
  ...clip,
  videoUrl: toMediaUrl(clip.videoUrl),
  thumbnailUrl: toMediaUrl(clip.thumbnailUrl)
});

export const clipApi = {
  getClips: async () => {
    const response = await axiosClient.get('/clips');
    const data = Array.isArray(response?.data) ? response.data.map(normalizeClip) : [];

    return {
      featured: response?.featured ? normalizeClip(response.featured) : data[0] || null,
      data
    };
  },
  recordView: (clipId) => axiosClient.post(`/clips/${clipId}/view`)
};
