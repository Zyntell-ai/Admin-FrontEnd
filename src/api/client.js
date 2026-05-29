/**
 * @file        client.js
 * @module      API Client
 * @project     Admin-FrontEnd
 * @layer       API
 * @description Configures and exports the shared Axios instance used by all API modules, with request and response interceptors for JWT injection and 401 handling.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - axios
 *
 * @sideEffects
 *   - Reads 'zyntell_admin_token' from localStorage on every request
 *   - On 401 response: clears localStorage tokens and redirects to /login
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import axios from 'axios'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// Backend runs on 3001. Admin routes are at /admin/... (NOT /api/admin/...)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://finalbackend-wwua.onrender.com'

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    apiClient
 * @purpose     Pre-configured Axios instance targeting the admin backend with a 60-second timeout
 * @returns {AxiosInstance} Shared HTTP client for all API modules
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// [AUTH]: Attach the admin JWT token to every outgoing request if one exists in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zyntell_admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// [AUTH]: On 401 Unauthorized — clear stored credentials and force re-login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // [GUARD]: Session expired or invalid token — purge local state and redirect
      localStorage.removeItem('zyntell_admin_token')
      localStorage.removeItem('zyntell_admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
export default apiClient
