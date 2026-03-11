import axios from 'axios';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export const authAPI = {
  register: d => api.post('/auth/register', d),
  login: d => api.post('/auth/login', d),
};

export const productAPI = {
  getAll: p => api.get('/products', { params: p }),
  getById: id => api.get(`/products/${id}`),
  search: p => api.get('/products/search', { params: p }),
  create: d => api.post('/products', d),
  update: (id, d) => api.put(`/products/${id}`, d),
  delete: id => api.delete(`/products/${id}`),
  addImages: (id, fd) => api.post(`/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  markSold: id => api.patch(`/products/${id}/mark-sold`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: d => api.post('/categories', d),
  update: (id, d) => api.put(`/categories/${id}`, d),
  delete: id => api.delete(`/categories/${id}`),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  getById: id => api.get(`/users/${id}`),
  update: d => api.put('/users/me', d),
  uploadAvatar: fd => api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getListings: (id, p) => api.get(`/users/${id}/listings`, { params: p }),
};

export const messageAPI = {
  send: d => api.post('/messages', d),
  getConversations: () => api.get('/messages/conversations'),
  getConversation: id => api.get(`/messages/conversations/${id}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

export const notificationAPI = {
  getAll: p => api.get('/notifications', { params: p }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: id => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const orderAPI = {
  create: d => api.post('/orders', d),
  getPurchases: p => api.get('/orders/my-purchases', { params: p }),
  getSales: p => api.get('/orders/my-sales', { params: p }),
  complete: id => api.patch(`/orders/${id}/complete`),
  cancel: id => api.patch(`/orders/${id}/cancel`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  toggleUser: id => api.patch(`/admin/users/${id}/toggle`),
};

export default api;
