// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Phase 4 admin call investigation + recording policy, and the Phase 5 healthcare classification backlog.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const card = () => read('../components/business/CallInvestigationCard.jsx')

test('API: call metadata, audited recording stream (blob, never a URL), access log, classification backlog', () => {
  const api = read('../api/admin.js')
  assert.match(api, /apiClient\.get\(`\/admin\/businesses\/\$\{id\}\/calls`, \{ params: \{ from, to, cursor, limit \} \}\)/)
  assert.match(api, /apiClient\.get\(`\/admin\/businesses\/\$\{id\}\/calls\/\$\{encodeURIComponent\(callSid\)\}\/recording`, \{ responseType: 'blob' \}\)/)
  assert.match(api, /apiClient\.get\(`\/admin\/businesses\/\$\{id\}\/recording-access-log`\)/)
  assert.match(api, /apiClient\.get\('\/admin\/healthcare-classification\/unclassified'\)/)
  assert.doesNotMatch(api, /recordingUrl|RecordingUrl/)
})

test('recording control: only when the backend grants it (SUPER_ADMIN) AND access is enabled; explicit per call', () => {
  const c = card()
  assert.match(c, /const canPlay = Boolean\(first\?\.canAccessRecordings && first\?\.recordingAccessEnabled\)/)
  assert.match(c, /\{canPlay && c\.callSid && playing !== c\.id && \(/)
  assert.match(c, /Play recording \(audited\)/)
  assert.match(c, /only a Super Admin can open them/)
  assert.match(c, /access is switched off until the Exotel recording setup is verified/)
})

test('recording playback: in-memory only — object URL revoked on close, no download control, no stored copy', () => {
  const c = card()
  assert.match(c, /URL\.createObjectURL\(blob\)/)
  assert.match(c, /URL\.revokeObjectURL\(urlRef\.current\)/)
  assert.match(c, /controlsList="nodownload/)
  assert.doesNotMatch(c, /\bdownload=|localStorage|sessionStorage|indexedDB|caches\./)
  assert.match(c, /The recording could not be opened/) // unavailable / expired / refused states come from the backend
})

test('call list: states, pagination, date presets, recording-access log for recording admins; placed on the business page', () => {
  const c = card()
  for (const re of [/Loading calls…/, /Try again/, /No calls in the last/, /Load more/, /PRESETS = \[7, 30, 90\]/, /Recording access log/]) assert.match(c, re)
  assert.match(c, /if \(first\?\.canAccessRecordings\) refreshAudit\(\)/)
  const page = read('../pages/BusinessDetail.jsx')
  assert.match(page, /<CallInvestigationCard businessId=\{id\} \/>/)
})

test('healthcare backlog: read-only list for signup approvers; classification stays an explicit decision', () => {
  const page = read('../pages/NewClients.jsx')
  assert.match(page, /<UnclassifiedBacklog canDecide=\{canDecide\} \/>/)
  assert.match(page, /if \(!canDecide \|\| !data\?\.total\) return null/)
  assert.match(page, /category suggests healthcare — please verify/)
  assert.match(page, /Classify →/)
  assert.doesNotMatch(page.slice(page.indexOf('function UnclassifiedBacklog'), page.indexOf('export default function NewClients')), /setHealthcareClassification/)
})
