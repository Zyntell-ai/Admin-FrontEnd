import apiClient from './client.js'

// ── Get all admin users ──────────────────────────────────────────────────────
export async function getAdminUsers() {
  const res = await apiClient.get('/admin-users')
  return res.data
}

// ── Invite new admin ─────────────────────────────────────────────────────────
export async function inviteAdmin({ name, email, mobile, role, permissions }) {
  const res = await apiClient.post('/admin-users/invite', {
    name, email, mobile, role, permissions,
  })
  return res.data
}

// ── Send OTP ─────────────────────────────────────────────────────────────────
export async function sendOtp(type, value) {
  const res = await apiClient.post('/admin-users/send-otp', { type, value })
  return res.data
}

// ── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyOtp(value, otp) {
  const res = await apiClient.post('/admin-users/verify-otp', { value, otp })
  return res.data
}

// ── Update permissions ───────────────────────────────────────────────────────
export async function updatePermissions(adminId, permissions) {
  const res = await apiClient.patch(`/admin-users/${adminId}/permissions`, { permissions })
  return res.data
}

// ── Update admin (role, name, isActive) ─────────────────────────────────────
export async function updateAdmin(adminId, updates) {
  const res = await apiClient.patch(`/admin-users/${adminId}`, updates)
  return res.data
}

// ── Delete admin ─────────────────────────────────────────────────────────────
export async function deleteAdmin(adminId) {
  const res = await apiClient.delete(`/admin-users/${adminId}`)
  return res.data
}