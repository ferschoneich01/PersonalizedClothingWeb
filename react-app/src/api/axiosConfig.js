import axios from 'axios'

// En desarrollo local (localhost o 127.0.0.1), usar el proxy '/api' de Vite para conectar
// con el backend local (puerto 8080) donde residen las nuevas rutas y cambios de desarrollo.
// En producción, usar VITE_API_URL si está definido, o '/api'.
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')

const baseURL = isLocalhost
  ? '/api'
  : (import.meta.env.VITE_API_URL || '/api')

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
