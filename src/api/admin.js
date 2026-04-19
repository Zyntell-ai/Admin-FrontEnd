import apiClient from './client.js'

// ── Overview (Dashboard) ────────────────────────────────────────────────────
export async function getOverview() {
  const res = await apiClient.get('/admin/overview')
  return res.data
}

// ── Businesses ──────────────────────────────────────────────────────────────
export async function getBusinesses(params = {}) {
  const res = await apiClient.get('/admin/businesses', { params })
  return res.data // { businesses, total }
}

export async function getBusinessProfile(id) {
  const res = await apiClient.get(`/admin/businesses/${id}`)
  return res.data // { business, settings, revenueSummary, commissionLedger, activeAlerts, invoiceHistory }
}

export async function updateBusiness(id, updates) {
  const res = await apiClient.put(`/admin/businesses/${id}`, updates)
  return res.data // { business }
}

export async function suspendBusiness(id, reason, notifyOwner = true) {
  const res = await apiClient.post(`/admin/businesses/${id}/suspend`, { reason, notifyOwner })
  return res.data // { suspended, businessId }
}

// ── Bookings ────────────────────────────────────────────────────────────────
export async function getBookings(params = {}) {
  const res = await apiClient.get('/admin/bookings', { params })
  return res.data // { bookings, total, commissionTotal }
}

// ── Revenue ─────────────────────────────────────────────────────────────────
export async function getRevenue() {
  const res = await apiClient.get('/admin/revenue')
  return res.data // { byMonth, byCategory, byType, currentMrr }
}

// ── Invoices ────────────────────────────────────────────────────────────────
export async function getInvoices(params = {}) {
  const res = await apiClient.get('/admin/invoices', { params })
  return res.data // { invoices, total, totalOutstanding }
}

export async function adjustInvoice(id, amount, reason) {
  const res = await apiClient.post(`/admin/invoices/${id}/adjust`, { amount, reason })
  return res.data // { invoice }
}

export async function generateAllInvoices(month) {
  const res = await apiClient.post('/admin/invoices/generate-all', { month })
  return res.data // { generated, skipped, month }
}

// ── Alerts ──────────────────────────────────────────────────────────────────
export async function getAlerts(params = {}) {
  const res = await apiClient.get('/admin/alerts', { params })
  return res.data // { alerts, total }
}

export async function updateAlert(id, { status, notes }) {
  const res = await apiClient.put(`/admin/alerts/${id}`, { status, notes })
  return res.data // { alert }
}

// ── Categories ──────────────────────────────────────────────────────────────
export async function getCategories() {
  const res = await apiClient.get('/admin/categories')
  return res.data // { categories }
}

export async function createCategory(payload) {
  const res = await apiClient.post('/admin/categories', payload)
  return res.data // { category }
}

export async function updateCategory(id, updates) {
  const res = await apiClient.put(`/admin/categories/${id}`, updates)
  return res.data // { category }
}

// ── Leads ───────────────────────────────────────────────────────────────────
export async function getLeads(params = {}) {
  const res = await apiClient.get('/admin/leads', { params })
  return res.data // { leads, total }
}

// ── Platform Config ─────────────────────────────────────────────────────────
export async function updatePlatformConfig(config) {
  const res = await apiClient.put('/admin/platform-config', config)
  return res.data // { config }
}

// ── Analytics ───────────────────────────────────────────────────────────────
export async function getPlatformAnalytics() {
  const res = await apiClient.get('/admin/analytics')
  return res.data // { funnel, byCategory, byCity }
}