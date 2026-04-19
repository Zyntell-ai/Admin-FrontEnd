import apiClient from './client.js'

// Backend: POST /admin/auth/login → { token, admin }
export async function loginApi(email, password) {
  const response = await apiClient.post('/admin/auth/login', { email, password })
  return response.data
}