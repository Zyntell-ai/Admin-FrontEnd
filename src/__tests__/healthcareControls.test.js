// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Phase 2 admin controls: healthcare classification at approval, on the business page, and owners' change requests.
// Also keeps the Phase 1 "OTP check-in always on" presentation covered.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('approval: an explicit healthcare choice is required before Approve is enabled and is sent to the backend', () => {
  const page = read('../pages/NewClients.jsx')
  assert.match(page, /const \[healthcare, setHealthcare\] = useState\(null\)/)
  assert.match(page, /disabled=\{busy \|\| healthcare === null\} onClick=\{\(\) => decide\('approve'\)\}/)
  assert.match(page, /approveSignupRequest\(selected\.id, \{ isHealthcare: healthcare \}\)/)
  assert.match(page, /the category alone does not decide this/)
  assert.match(page, /setSelected\(r\)\n\s+setHealthcare\(null\)/) // a new review never reuses the previous choice
  const api = read('../api/admin.js')
  assert.match(api, /apiClient\.post\(`\/admin\/signup-requests\/\$\{id\}\/approve`, \{ isHealthcare \}\)/)
})

test('business page: classification card with set / approve / reject, and the business\'s own emergency contact (read-only)', () => {
  const page = read('../pages/BusinessDetail.jsx')
  assert.match(page, /<HealthcareCard businessId=\{id\} business=\{biz\} settings=\{data\.settings\} onSaved=\{fetchData\} \/>/)
  assert.match(page, /setHealthcareClassification\(businessId, true, note\.trim\(\)\)/)
  assert.match(page, /setHealthcareClassification\(businessId, false, note\.trim\(\)\)/)
  assert.match(page, /decideHealthcareRequest\(businessId, 'approve', note\.trim\(\)\)/)
  assert.match(page, /disabled=\{busy \|\| note\.trim\(\)\.length < 3\}\s+onClick=\{\(\) => run\(\(\) => decideHealthcareRequest\(businessId, 'reject'/) // reject needs a note
  assert.match(page, /Not configured — the AI never invents one/)
  assert.doesNotMatch(page, /updateSettings|emergencyContact:/) // admins view, never edit, the business's contact
  const api = read('../api/admin.js')
  assert.match(api, /apiClient\.put\(`\/admin\/businesses\/\$\{id\}\/healthcare`/)
  assert.match(api, /apiClient\.post\(`\/admin\/businesses\/\$\{id\}\/healthcare-request\/\$\{decision\}`/)
  assert.match(api, /apiClient\.get\('\/admin\/healthcare-requests'\)/)
})

test('pending owner requests are listed for signup approvers only, linking to the business page', () => {
  const page = read('../pages/NewClients.jsx')
  assert.match(page, /if \(!canDecide \|\| !requests\.length\) return null/)
  assert.match(page, /<Link to=\{`\/businesses\/\$\{r\.businessId\}`\}/)
})

test('Phase 1: OTP check-in is still shown as always on (no misleading override)', () => {
  assert.match(read('../pages/BusinessDetail.jsx'), /showupVerification: 'Always on — every plan \(an override has no effect\)'/)
})
