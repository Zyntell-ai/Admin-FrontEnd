// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Batch 3: per-business FAQ retrieval mode (OFF / SHADOW / ON) on the business page.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('API: read and set the retrieval mode', () => {
  const api = read('../api/admin.js')
  assert.match(api, /apiClient\.get\(`\/admin\/businesses\/\$\{id\}\/knowledge-retrieval`\)/)
  assert.match(api, /apiClient\.put\(`\/admin\/businesses\/\$\{id\}\/knowledge-retrieval`, \{ mode \}\)/)
})

test('card: three modes, global-switch warning, eligibility reminder, 403 explained; placed on the business page', () => {
  const card = read('../components/business/KnowledgeRetrievalCard.jsx')
  for (const re of [/value: 'OFF'/, /value: 'SHADOW'/, /value: 'ON'/, /platform-wide switch is off/, /Healthcare approval and business classification rules always apply/, /Only Super Admins and Admins/]) assert.match(card, re)
  assert.doesNotMatch(card, /embedding|faqIndex|vector/i)
  assert.match(read('../pages/BusinessDetail.jsx'), /<KnowledgeRetrievalCard businessId=\{id\} \/>/)
})
