/**
 * Configurarea instanței globale Axios pentru interacțiunea cu API-ul backend.
 * Implementează un interceptor pentru injectarea automată a token-ului JWT
 * în antetele de autorizare ale cererilor HTTP.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;