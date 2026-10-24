/**
 * @file        businessStatus.js
 * @module      Business status (admin)
 * @description One status label per business, shared by the Businesses list and detail pages. Suspension (isActive)
 *              wins over everything; then the signup application state (approvalStatus — a business without it is an
 *              existing, approved account); then trial vs active.
 */

/** Signup applications that have not been approved yet */
export const APPLICATION_STATUSES = Object.freeze({
  pending_onboarding: 'signup',   // registered, setup not finished
  pending_review: 'pending',      // waiting in New Clients
  rejected: 'rejected',
})

/**
 * @param  {Object} b - business ({ isActive, isTrialActive, approvalStatus })
 * @returns {'unknown'|'suspended'|'signup'|'pending'|'rejected'|'trial'|'active'}
 */
export function deriveStatus(b) {
  if (!b) return 'unknown'
  if (b.isActive === false) return 'suspended'
  if (APPLICATION_STATUSES[b.approvalStatus]) return APPLICATION_STATUSES[b.approvalStatus]
  if (b.isTrialActive) return 'trial'
  return 'active'
}
