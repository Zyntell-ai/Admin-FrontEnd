// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Batch 2: admin FAQ approval page — version-specific approve / reject (reason required), stale-version handling,
// conflicts shown, only approve_signups roles (backend-enforced; the page explains a 403), route + navigation.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('API: list, version-specific approve / reject, history', () => {
  const api = read('../api/admin.js')
  assert.match(api, /apiClient\.get\('\/admin\/faq-approvals', \{ params: businessId \? \{ businessId \} : \{\} \}\)/)
  assert.match(api, /apiClient\.post\(`\/admin\/faqs\/\$\{faqId\}\/approve`, \{ version, \.\.\.\(note \? \{ note \} : \{\}\) \}\)/)
  assert.match(api, /apiClient\.post\(`\/admin\/faqs\/\$\{faqId\}\/reject`, \{ version, reason \}\)/)
  assert.match(api, /apiClient\.get\(`\/admin\/faqs\/\$\{faqId\}\/history`\)/)
})

test('page: shows business, question, answer, category, version, submission time, conflicts; approve the shown version', () => {
  const page = read('../pages/FaqApprovals.jsx')
  for (const re of [/faq\.businessName/, /faq\.question/, /faq\.answer/, /faq\.category/, /version \{faq\.version\}/, /submitted \{when\(faq\.submittedAt\)\}/, /faq\.conflicts/,
    /approveFaq\(faq\.faqId, faq\.version, text\.trim\(\)\)/, /rejectFaq\(faq\.faqId, faq\.version, text\.trim\(\)\)/]) assert.match(page, re)
})

test('page: rejection needs a reason; stale / decided / deleted FAQs reload the list; 403 explained; empty + loading states', () => {
  const page = read('../pages/FaqApprovals.jsx')
  assert.match(page, /disabled=\{busy \|\| text\.trim\(\)\.length < 3\}/)
  assert.match(page, /code === 'STALE_VERSION' \|\| code === 'NOT_PENDING' \|\| code === 'FAQ_DELETED'/)
  assert.match(page, /Only Super Admins and Admins can review FAQs\./)
  assert.match(page, /No FAQs are awaiting approval\./)
  assert.match(page, /Loading…/)
})

test('route and navigation', () => {
  assert.match(read('../App.jsx'), /<Route path="\/faq-approvals" element=\{<ProtectedRoute><FaqApprovals \/><\/ProtectedRoute>\} \/>/)
  assert.match(read('../components/layout/Sidebar.jsx'), /\{ path: '\/faq-approvals', label: 'FAQ Approvals', icon: ShieldCheck \}/)
})

test('unclassified business: no approve button — the admin is sent to classify the business first', () => {
  const page = read('../pages/FaqApprovals.jsx')
  assert.match(page, /faq\.requiresClassification \? \(/)
  assert.match(page, /None of its FAQs reach the AI until it is — classify it first/)
  assert.match(page, /code === 'BUSINESS_UNCLASSIFIED'/)
})
