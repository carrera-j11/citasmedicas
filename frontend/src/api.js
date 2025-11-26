import axios from 'axios';

// URL base de la API:
// - En producción: viene de VITE_API_BASE_URL (Vercel)
// - En desarrollo: http://localhost:4000
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Crear instancia de axios con la URL correcta
const api = axios.create({
  // El backend expone las rutas bajo /api ( /api/auth, /api/appointments, etc.)
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
