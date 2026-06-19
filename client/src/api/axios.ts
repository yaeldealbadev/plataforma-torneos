import axios, { isAxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// CONTRATO DE INTEGRACIÓN — NO mover sin coordinar con el equipo:
// Este interceptor lee el JWT de localStorage con la key 'token'.
// El AuthContext (dominio de Yael/Carlos) DEBE cumplir:
//   • login()  → localStorage.setItem('token', jwt)
//   • logout() → localStorage.removeItem('token')
// Sin eso, ninguna petición autenticada enviará el header Authorization.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
