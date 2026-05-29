/**
 * @file        adminUsers.js
 * @module      Admin API
 * @project     Admin-FrontEnd
 * @layer       API
 * @description Stub API module for admin user management — all methods throw because the current backend does not expose admin CRUD endpoints; accounts are seeded via createAdmin.js.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - None (no HTTP client required — all functions are stubs)
 *
 * @sideEffects
 *   - None (all functions throw errors or return static placeholder data)
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// NOTE: The current backend does not expose admin user CRUD endpoints.
// Admin accounts are created via the seed script: node createAdmin.js
// Settings.jsx shows a banner explaining this gracefully.

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    getAdminUsers
 * @purpose     Stub — returns an empty admins array with an explanatory message
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getAdminUsers() {
  // [GUARD]: Backend does not support this endpoint — return safe empty response
  return { admins: [], message: 'Admin user management not available in current backend.' }
}

/**
 * @function    inviteAdmin
 * @purpose     Stub — throws because admin invite is not available in the current backend
 * @returns {never} Always throws an error
 */
export async function inviteAdmin() {
  // [GUARD]: Prevent accidental calls to an unimplemented endpoint
  throw new Error('Admin invite not available in current backend.')
}

/**
 * @function    sendOtp
 * @purpose     Stub — throws because OTP service is not available in the current backend
 * @returns {never} Always throws an error
 */
export async function sendOtp() {
  // [GUARD]: Prevent accidental calls to an unimplemented endpoint
  throw new Error('OTP service not available in current backend.')
}

/**
 * @function    verifyOtp
 * @purpose     Stub — throws because OTP verification is not available in the current backend
 * @returns {never} Always throws an error
 */
export async function verifyOtp() {
  // [GUARD]: Prevent accidental calls to an unimplemented endpoint
  throw new Error('OTP verification not available in current backend.')
}

/**
 * @function    updatePermissions
 * @purpose     Stub — throws because permission updates are not available in the current backend
 * @returns {never} Always throws an error
 */
export async function updatePermissions() {
  // [GUARD]: Prevent accidental calls to an unimplemented endpoint
  throw new Error('Permission update not available in current backend.')
}

/**
 * @function    updateAdmin
 * @purpose     Stub — throws because admin record updates are not available in the current backend
 * @returns {never} Always throws an error
 */
export async function updateAdmin() {
  // [GUARD]: Prevent accidental calls to an unimplemented endpoint
  throw new Error('Admin update not available in current backend.')
}

/**
 * @function    deleteAdmin
 * @purpose     Stub — throws because admin deletion is not available in the current backend
 * @returns {never} Always throws an error
 */
export async function deleteAdmin() {
  // [GUARD]: Prevent accidental calls to an unimplemented endpoint
  throw new Error('Admin delete not available in current backend.')
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
