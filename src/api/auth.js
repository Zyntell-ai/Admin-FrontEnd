/**
 * @file        auth.js
 * @module      Admin Auth API
 * @project     Admin-FrontEnd
 * @layer       API
 * @description Provides the login API call for admin authentication against the backend.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./client.js (apiClient — Axios instance with auth interceptors)
 *
 * @sideEffects
 *   - HTTP POST to /admin/auth/login — returns JWT token and admin profile on success
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import apiClient from './client.js'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    loginApi
 * @purpose     Sends admin credentials to the backend and returns a JWT token with the admin profile
 * @param  {string} email    - Admin account email address
 * @param  {string} password - Admin account password
 * @returns {Promise<AxiosResponse>} API response
 */
// [AUTH]: Backend: POST /admin/auth/login → { token, admin }
export async function loginApi(email, password) {
  // [AUTH]: Exchange credentials for a JWT token and admin profile object
  const response = await apiClient.post('/admin/auth/login', { email, password })
  return response.data
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
