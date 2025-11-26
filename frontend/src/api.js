import axios from 'axios';

// ⚠️ USAR SIEMPRE ESTA VARIABLE EN VITE + PRODUCCIÓN
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Guardar o eliminar token del cliente
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('token');
  }
}

// Cargar token al iniciar la app
export function loadTokenFromStorage() {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
}

export default api;
