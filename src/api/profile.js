/**
 * @file        profile.js
 * @module      Profile API
 * @project     Admin-FrontEnd
 * @layer       API
 * @description Stub API module for admin profile management — all methods throw because the backend does not provide dedicated profile endpoints; profile data is sourced from AuthContext.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - None (no HTTP client required — all functions are stubs)
 *
 * @sideEffects
 *   - None (all functions throw errors)
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// NOTE: The current backend does not have dedicated admin profile endpoints.
// Profile data is returned during login and stored in AuthContext.
// Profile.jsx reads directly from auth context instead of calling these.

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    getMyProfile
 * @purpose     Stub — throws because the profile endpoint does not exist; use AuthContext instead
 * @returns {never} Always throws an error
 */
export async function getMyProfile() {
  // [GUARD]: Direct callers to use auth context rather than a non-existent endpoint
  throw new Error('Profile endpoint not available. Use auth context.')
}

/**
 * @function    updateMyProfile
 * @purpose     Stub — throws because profile update is not available in the current backend
 * @returns {never} Always throws an error
 */
export async function updateMyProfile() {
  // [GUARD]: Prevent accidental calls to an unimplemented endpoint
  throw new Error('Profile update not available in current backend.')
}

/**
 * @function    changeMyPassword
 * @purpose     Stub — throws because password change is not available in the current backend
 * @returns {never} Always throws an error
 */
export async function changeMyPassword() {
  // [GUARD]: Prevent accidental calls to an unimplemented endpoint
  throw new Error('Password change not available in current backend.')
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
