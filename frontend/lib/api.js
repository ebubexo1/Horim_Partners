import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const saveSession = (token, user) => {
  localStorage.setItem('hp_token', token);
  localStorage.setItem('hp_user', JSON.stringify(user));
};

export const getSessionUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('hp_user');
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = () => {
  localStorage.removeItem('hp_token');
  localStorage.removeItem('hp_user');
};

export default api;
