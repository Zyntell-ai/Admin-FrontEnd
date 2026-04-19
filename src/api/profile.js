// NOTE: The current backend does not have dedicated admin profile endpoints.
// Profile data is returned during login and stored in AuthContext.
// Profile.jsx reads directly from auth context instead of calling these.

export async function getMyProfile() {
  throw new Error('Profile endpoint not available. Use auth context.')
}

export async function updateMyProfile() {
  throw new Error('Profile update not available in current backend.')
}

export async function changeMyPassword() {
  throw new Error('Password change not available in current backend.')
}