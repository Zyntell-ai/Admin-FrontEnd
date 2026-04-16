import apiClient from './client.js'

// Get my own profile
export async function getMyProfile() {
  const res = await apiClient.get('/admin-users/me')
  return res.data
}

// Update my name or email
export async function updateMyProfile({ name, email }) {
  const res = await apiClient.patch('/admin-users/me', { name, email })
  return res.data
}

// Change my password
export async function changeMyPassword({ currentPassword, newPassword, confirmPassword }) {
  const res = await apiClient.patch('/admin-users/me/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  })
  return res.data
}