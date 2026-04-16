import apiClient from './client.js'

export async function loginApi(email, password) {
  const response = await apiClient.post('/admin-users/login', { email, password })
  return response.data
}