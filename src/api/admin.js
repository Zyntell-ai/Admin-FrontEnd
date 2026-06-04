/**
 * @file        admin.js
 * @module      Admin API
 * @project     Admin-FrontEnd
 * @layer       API
 * @description Centralised API functions for all admin-only backend endpoints covering businesses, bookings, revenue, invoices, alerts, categories, commissions, leads, platform config, and analytics.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./client.js (apiClient — Axios instance with auth interceptors)
 *
 * @sideEffects
 *   - HTTP GET/POST/PUT requests to the backend admin namespace (/admin/*)
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import apiClient from './client.js'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

// ── Overview (Dashboard) ────────────────────────────────────────────────────

/**
 * @function    getOverview
 * @purpose     Fetches the main dashboard overview metrics
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getOverview() {
  // [API CALL]: Load top-level KPIs for the admin dashboard
  const res = await apiClient.get('/admin/overview')
  return res.data
}

// ── Businesses ──────────────────────────────────────────────────────────────

/**
 * @function    getBusinesses
 * @purpose     Retrieves a paginated / filtered list of all registered businesses
 * @param  {Object} params - Query parameters (filters, pagination, search)
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getBusinesses(params = {}) {
  // [API CALL]: Fetch businesses with optional filter/search/pagination params
  const res = await apiClient.get('/admin/businesses', { params })
  return res.data // { businesses, total }
}

/**
 * @function    getBusinessProfile
 * @purpose     Retrieves the full profile of a single business by ID
 * @param  {string} id - Business document ID
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getBusinessProfile(id) {
  // [API CALL]: Load full business detail view including financial and alert history
  const res = await apiClient.get(`/admin/businesses/${id}`)
  return res.data // { business, settings, revenueSummary, commissionLedger, activeAlerts, invoiceHistory }
}

/**
 * @function    updateBusiness
 * @purpose     Updates mutable fields on an existing business record
 * @param  {string} id - Business document ID
 * @param  {Object} updates - Partial business fields to update
 * @returns {Promise<AxiosResponse>} API response
 */
export async function updateBusiness(id, updates) {
  // [API CALL]: Persist business field changes submitted by admin
  const res = await apiClient.put(`/admin/businesses/${id}`, updates)
  return res.data // { business }
}

/**
 * @function    suspendBusiness
 * @purpose     Suspends a business account with an optional owner notification
 * @param  {string}  id           - Business document ID
 * @param  {string}  reason       - Reason for suspension
 * @param  {boolean} notifyOwner  - Whether to notify the business owner (default: true)
 * @returns {Promise<AxiosResponse>} API response
 */
export async function suspendBusiness(id, reason, notifyOwner = true) {
  // [API CALL]: Suspend business and optionally notify the owner via the backend
  const res = await apiClient.post(`/admin/businesses/${id}/suspend`, { reason, notifyOwner })
  return res.data // { suspended, businessId }
}

// ── Bookings ────────────────────────────────────────────────────────────────

/**
 * @function    getBookings
 * @purpose     Retrieves a filtered list of all platform bookings
 * @param  {Object} params - Query parameters (date range, status, business, etc.)
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getBookings(params = {}) {
  // [API CALL]: Fetch booking records with optional filters
  const res = await apiClient.get('/admin/bookings', { params })
  return res.data // { bookings, total, commissionTotal }
}

// ── Revenue ─────────────────────────────────────────────────────────────────

/**
 * @function    getRevenue
 * @purpose     Retrieves platform-wide revenue breakdown data
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getRevenue() {
  // [API CALL]: Load revenue analytics for the billing/analytics pages
  const res = await apiClient.get('/admin/revenue')
  return res.data // { byMonth, byCategory, byType, currentMrr }
}

// ── Invoices ────────────────────────────────────────────────────────────────

/**
 * @function    getInvoices
 * @purpose     Retrieves a filtered list of all business invoices
 * @param  {Object} params - Query parameters (status, month, business, etc.)
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getInvoices(params = {}) {
  // [API CALL]: Fetch invoice records for the billing page
  const res = await apiClient.get('/admin/invoices', { params })
  return res.data // { invoices, total, totalOutstanding }
}

/**
 * @function    adjustInvoice
 * @purpose     Applies a manual adjustment (credit or debit) to an existing invoice
 * @param  {string} id     - Invoice document ID
 * @param  {number} amount - Adjustment amount (positive = add, negative = deduct)
 * @param  {string} reason - Reason for the adjustment
 * @returns {Promise<AxiosResponse>} API response
 */
export async function adjustInvoice(id, amount, reason) {
  // [API CALL]: Apply a manual financial correction to an invoice
  const res = await apiClient.post(`/admin/invoices/${id}/adjust`, { amount, reason })
  return res.data // { invoice }
}

/**
 * @function    generateAllInvoices
 * @purpose     Triggers bulk invoice generation for all active businesses for a given month
 * @param  {string} month - Target month in YYYY-MM format
 * @returns {Promise<AxiosResponse>} API response
 */
export async function generateAllInvoices(month) {
  // [API CALL]: Bulk-generate monthly invoices for all eligible businesses
  const res = await apiClient.post('/admin/invoices/generate-all', { month })
  return res.data // { generated, skipped, month }
}

// ── Alerts ──────────────────────────────────────────────────────────────────

/**
 * @function    getAlerts
 * @purpose     Retrieves the list of platform alerts with optional filters
 * @param  {Object} params - Query parameters (severity, status, type, etc.)
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getAlerts(params = {}) {
  // [API CALL]: Load active and historical platform alerts
  const res = await apiClient.get('/admin/alerts', { params })
  return res.data // { alerts, total }
}

/**
 * @function    updateAlert
 * @purpose     Updates the status or notes on an existing alert
 * @param  {string} id     - Alert document ID
 * @param  {Object} update - Object containing { status, notes }
 * @param  {string} update.status - New alert status (e.g., IN_REVIEW, RESOLVED)
 * @param  {string} update.notes  - Admin notes for the alert
 * @returns {Promise<AxiosResponse>} API response
 */
export async function updateAlert(id, { status, notes }) {
  // [API CALL]: Triage or resolve a platform alert
  const res = await apiClient.put(`/admin/alerts/${id}`, { status, notes })
  return res.data // { alert }
}

// ── Categories ──────────────────────────────────────────────────────────────

/**
 * @function    getCategories
 * @purpose     Retrieves all platform service categories
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getCategories() {
  // [API CALL]: Fetch all service category definitions
  const res = await apiClient.get('/admin/categories')
  return res.data // { categories }
}

/**
 * @function    createCategory
 * @purpose     Creates a new service category on the platform
 * @param  {Object} payload - Category definition object
 * @returns {Promise<AxiosResponse>} API response
 */
export async function createCategory(payload) {
  // [API CALL]: Add a new category to the platform
  const res = await apiClient.post('/admin/categories', payload)
  return res.data // { category }
}

/**
 * @function    updateCategory
 * @purpose     Updates fields on an existing service category
 * @param  {string} id      - Category document ID
 * @param  {Object} updates - Partial category fields to update
 * @returns {Promise<AxiosResponse>} API response
 */
export async function updateCategory(id, updates) {
  // [API CALL]: Modify category settings such as commission rates or active state
  const res = await apiClient.put(`/admin/categories/${id}`, updates)
  return res.data // { category }
}

// ── Commission Approval ─────────────────────────────────────────────────────

/**
 * @function    getPendingCommissions
 * @purpose     Retrieves commissions that are awaiting admin approval
 * @param  {Object} params - Query parameters (page, limit, filters)
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getPendingCommissions(params = {}) {
  // [API CALL]: Fetch commissions queued for review
  const res = await apiClient.get('/admin/commissions/pending', { params })
  return res.data // { commissions, total }
}

/**
 * @function    approveCommission
 * @purpose     Approves a single pending commission record
 * @param  {string} id - Commission document ID
 * @returns {Promise<AxiosResponse>} API response
 */
export async function approveCommission(id) {
  // [API CALL]: Approve one commission for inclusion in the next invoice
  const res = await apiClient.post(`/admin/commissions/${id}/approve`)
  return res.data // { success, id }
}

/**
 * @function    approveBulkCommissions
 * @purpose     Approves multiple commission records in a single request
 * @param  {string[]} ids - Array of commission document IDs to approve
 * @returns {Promise<AxiosResponse>} API response
 */
export async function approveBulkCommissions(ids) {
  // [API CALL]: Bulk-approve commissions to reduce manual overhead
  const res = await apiClient.post('/admin/commissions/approve-bulk', { ids })
  return res.data // { success, approved }
}

// ── Leads ───────────────────────────────────────────────────────────────────

/**
 * @function    getLeads
 * @purpose     Retrieves the list of platform leads with optional filters
 * @param  {Object} params - Query parameters (status, category, business, etc.)
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getLeads(params = {}) {
  // [API CALL]: Fetch lead records for review or analytics
  const res = await apiClient.get('/admin/leads', { params })
  return res.data // { leads, total }
}

// ── Platform Config ─────────────────────────────────────────────────────────

/**
 * @function    updatePlatformConfig
 * @purpose     Updates global platform configuration settings
 * @param  {Object} config - Key-value platform config fields to update
 * @returns {Promise<AxiosResponse>} API response
 */
export async function updatePlatformConfig(config) {
  // [API CALL]: Persist platform-wide configuration changes
  const res = await apiClient.put('/admin/platform-config', config)
  return res.data // { config }
}

// ── Analytics ───────────────────────────────────────────────────────────────

/**
 * @function    getPlatformAnalytics
 * @purpose     Retrieves platform-wide analytics including conversion funnel, category breakdown, and city stats
 * @returns {Promise<AxiosResponse>} API response
 */
export async function getPlatformAnalytics() {
  // [API CALL]: Load analytics data for the analytics page charts
  const res = await apiClient.get('/admin/analytics')
  return res.data // { funnel, byCategory, byCity }
}

// ── Feature Overrides ───────────────────────────────────────────────────────

/**
 * @function    getFeatureOverrides
 * @purpose     Returns plan features + admin overrides + audit log for a business
 */
export async function getFeatureOverrides(id) {
  const res = await apiClient.get(`/admin/businesses/${id}/features`)
  return res.data
}

/**
 * @function    saveFeatureOverrides
 * @purpose     Saves admin feature overrides for a business
 */
export async function saveFeatureOverrides(id, overrides) {
  const res = await apiClient.put(`/admin/businesses/${id}/features`, { overrides })
  return res.data
}

/**
 * @function    changePlan
 * @purpose     Admin-changes a business plan without payment
 */
export async function changePlan(id, plan, reason) {
  const res = await apiClient.put(`/admin/businesses/${id}/plan`, { plan, reason })
  return res.data
}

/**
 * @function    getPlanHistory
 * @purpose     Returns the plan change history for a business
 */
export async function getPlanHistory(id) {
  const res = await apiClient.get(`/admin/businesses/${id}/plan-history`)
  return res.data
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
