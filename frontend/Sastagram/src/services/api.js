import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  getUser: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/me', data),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  search: (q) => api.get('/users/search', { params: { q } }),
  getFollowers: (username) => api.get(`/users/${username}/followers`),
  getFollowing: (username) => api.get(`/users/${username}/following`),
  follow: (username) => api.post(`/users/${username}/follow`),
  unfollow: (username) => api.delete(`/users/${username}/follow`),
};

export const postsApi = {
  getFeed: (page = 1) => api.get('/posts/feed', { params: { page, pageSize: 10 } }),
  getExplore: (page = 1) => api.get('/posts/explore', { params: { page, pageSize: 12 } }),
  getUserPosts: (username, page = 1) => api.get(`/posts/${username}/posts`, { params: { page } }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (formData) => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  unlikePost: (id) => api.delete(`/posts/${id}/like`),
  savePost: (id) => api.post(`/posts/${id}/save`),
  unsavePost: (id) => api.delete(`/posts/${id}/save`),
  getSaved: (page = 1) => api.get('/posts/saved', { params: { page } }),
};

export const commentsApi = {
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
  likeComment: (postId, commentId) => api.post(`/posts/${postId}/comments/${commentId}/like`),
  unlikeComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}/like`),
};

export const storiesApi = {
  getStories: () => api.get('/stories'),
  createStory: (formData) => api.post('/stories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  viewStory: (id) => api.post(`/stories/${id}/view`),
  deleteStory: (id) => api.delete(`/stories/${id}`),
};

export const notificationsApi = {
  getNotifications: () => api.get('/notifications'),
  markAllRead: () => api.post('/notifications/read'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};
