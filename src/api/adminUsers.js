// NOTE: The current backend does not expose admin user CRUD endpoints.
// Admin accounts are created via the seed script: node createAdmin.js
// Settings.jsx shows a banner explaining this gracefully.

export async function getAdminUsers() {
  return { admins: [], message: 'Admin user management not available in current backend.' }
}

export async function inviteAdmin() {
  throw new Error('Admin invite not available in current backend.')
}

export async function sendOtp() {
  throw new Error('OTP service not available in current backend.')
}

export async function verifyOtp() {
  throw new Error('OTP verification not available in current backend.')
}

export async function updatePermissions() {
  throw new Error('Permission update not available in current backend.')
}

export async function updateAdmin() {
  throw new Error('Admin update not available in current backend.')
}

export async function deleteAdmin() {
  throw new Error('Admin delete not available in current backend.')
}