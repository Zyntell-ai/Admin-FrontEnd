import axios from 'axios'

// Backend runs on 3001. Admin routes are at /admin/... (NOT /api/admin/...)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://finalbackend-wwua.onrender.com/'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zyntell_admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zyntell_admin_token')
      localStorage.removeItem('zyntell_admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient