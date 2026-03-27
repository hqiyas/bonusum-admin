import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('bonusum_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bonusum_admin_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const companiesApi = {
  getAll:  ()           => api.get('/companies'),
  create:  (data: any)  => api.post('/companies', data),
  update:  (id: string, data: any) => api.put(`/companies/${id}`, data),
  delete:  (id: string) => api.delete(`/companies/${id}`),
};

export const licensesApi = {
  getAll:      ()           => api.get('/licenses/all'),
  generate:    (data: any)  => api.post('/licenses/generate', data),
  revoke:      (id: string) => api.put(`/licenses/${id}/revoke`),
};

export const vendorsApi = {
  getAll:  ()           => api.get('/vendors'),
  create:  (data: any)  => api.post('/vendors', data),
  update:  (id: string, data: any) => api.put(`/vendors/${id}`, data),
  delete:  (id: string) => api.delete(`/vendors/${id}`),
};

export const statsApi = {
  getDashboard: () => api.get('/stats/dashboard'),
};