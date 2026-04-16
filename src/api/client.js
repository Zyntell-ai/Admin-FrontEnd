import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zyntell_admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 globally — redirect to login
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