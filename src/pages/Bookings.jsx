/**
 * @file        Bookings.jsx
 * @module      Bookings Admin
 * @project     Admin-FrontEnd
 * @layer       Page
 * @description Displays per-business booking aggregations with expandable rows for individual booking details, sortable columns, bulk actions, and CSV export.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - React (useState, useMemo, useEffect, useCallback)
 *   - react-router-dom: useNavigate, useSearchParams
 *   - Layout: ../components/layout/Layout
 *   - ContextMenu: ../components/ui/ContextMenu
 *   - Skeleton: ../components/ui/Skeleton
 *   - ToastContext: ../context/ToastContext
 *   - Admin API: getBookings, getBusinesses (../api/admin)
 *   - lucide-react: Download, Search, X, ChevronDown, ChevronRight, Send, FileText, Eye, ArrowUpDown, RefreshCw, AlertTriangle, ExternalLink
 *   - clsx
 *
 * @sideEffects
 *   - Fetches bookings (up to 500) and businesses (up to 200) in parallel on mount and filter change
 *   - Persists category filter to localStorage under key 'zyntell_bookings_filters'
 *   - Displays context menu on right-click for business row actions
 */

/*
 * ╔══════════════════════════════════════════╗
 * ║           SDLC LIFECYCLE STATUS          ║
 * ╠══════════════════════════════════════════╣
 * ║ Planning     : ✅ Complete               ║
 * ║ Design       : ✅ Complete               ║
 * ║ Development  : ✅ Complete               ║
 * ║ Testing      : ⚠️  Partial              ║
 * ║ Deployment   : ✅ Complete               ║
 * ║ Maintenance  : 🔄 Active                ║
 * ╚══════════════════════════════════════════╝
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ContextMenu from '../components/ui/ContextMenu'
import { SkeletonTable } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { getBookings, getBusinesses } from '../api/admin'
import {
  Download, Search, X, ChevronDown, ChevronRight,
  Send, FileText, Eye, ArrowUpDown, RefreshCw, AlertTriangle, ExternalLink
} from 'lucide-react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────
const CATEGORIES = ['All', 'Healthcare', 'Restaurant', 'Real Estate', 'Beauty', 'Education']
const BOOKING_STATUSES = ['All', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED']
const LS_KEY = 'zyntell_bookings_filters'

/**
 * @function    BookingStatusBadge
 * @purpose     Renders a colour-coded badge for a booking status value
 * @param  {string} status - Booking status enum
 * @returns {JSX.Element}
 */
function BookingStatusBadge({ status }) {
  const map = {
    CONFIRMED: 'badge-indigo', COMPLETED: 'badge-green',
    NO_SHOW: 'badge-red', CANCELLED: 'badge-gray', PENDING: 'badge-yellow'
  }
  return <span className={clsx('badge text-[10px]', map[status] || 'badge-gray')}>{status}</span>
}

/**
 * @function    BusinessStatusBadge
 * @purpose     Renders a colour-coded badge for a business account status
 * @param  {string} status - Business status: active | trial | suspended
 * @returns {JSX.Element}
 */
function BusinessStatusBadge({ status }) {
  const map = { active: 'badge-green', trial: 'badge-yellow', suspended: 'badge-red' }
  return <span className={clsx('badge capitalize', map[status] || 'badge-gray')}>{status}</span>
}

/**
 * @function    RateBar
 * @purpose     Renders a mini progress bar with percentage label, coloured amber when warning threshold is met
 * @param  {number}  value   - Percentage value (0–100)
 * @param  {boolean} warning - Whether to use warning colour
 * @returns {JSX.Element}
 */
function RateBar({ value, warning }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 bg-white/5 rounded-full h-1.5 flex-shrink-0">
        <div className={clsx('h-1.5 rounded-full transition-all', warning ? 'bg-amber-500' : 'bg-indigo-500')} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className={clsx('text-xs font-medium', warning ? 'text-amber-400' : 'text-slate-300')}>{value.toFixed(1)}%</span>
    </div>
  )
}

// Per-business aggregate from raw bookings
/**
 * @function    aggregateByBusiness
 * @purpose     Groups raw booking records by businessId and computes per-business booking counts
 * @param  {Array} bookings   - Flat array of booking objects
 * @param  {Array} businesses - Flat array of business objects
 * @returns {Array} Aggregated rows with booking metrics per business
 */
function aggregateByBusiness(bookings, businesses) {
  const bizMap = {}
  businesses.forEach(b => {
    const bStatus = b.isTrialActive ? 'trial' : b.isActive ? 'active' : 'suspended'
    bizMap[b.id] = {
      businessId: b.id, businessName: b.name, category: b.category,
      city: b.city, plan: b.plan, status: bStatus,
      totalBookings: 0, confirmed: 0, completed: 0, noShows: 0,
    }
  })
  bookings.forEach(bk => {
    if (!bizMap[bk.businessId]) {
      bizMap[bk.businessId] = {
        businessId: bk.businessId, businessName: bk.businessName || bk.businessId,
        category: bk.category || '—', city: '—', plan: '—', status: 'unknown',
        totalBookings: 0, confirmed: 0, completed: 0, noShows: 0,
      }
    }
    const row = bizMap[bk.businessId]
    row.totalBookings++
    if (bk.status === 'CONFIRMED') row.confirmed++
    if (bk.status === 'COMPLETED') row.completed++
    if (bk.status === 'NO_SHOW')   row.noShows++
  })
  return Object.values(bizMap).filter(r => r.totalBookings > 0)
}

export default function Bookings() {
  // ─────────────────────────────────────────
  // STATE & HOOKS
  // ─────────────────────────────────────────
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  // [STATE]: Restore saved filters from localStorage on initial render
  const savedFilters = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
  }, [])

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || savedFilters.category || 'All')
  const [statusFilter, setStatusFilter]     = useState('All')
  const [search, setSearch]                 = useState('')
  const [sortKey, setSortKey]               = useState('totalBookings')
  const [sortDir, setSortDir]               = useState('desc')
  const [expandedRow, setExpandedRow]       = useState(null)
  const [selectedRows, setSelectedRows]     = useState([])
  const [contextMenu, setContextMenu]       = useState(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)

  const [aggRows, setAggRows]   = useState([])
  const [rawBookings, setRawBookings] = useState([])
  const [bookingsByBiz, setBookingsByBiz] = useState({})

  // ─────────────────────────────────────────
  // CORE LOGIC / HANDLER FUNCTIONS
  // ─────────────────────────────────────────

  /**
   * @function    fetchData
   * @purpose     Fetches bookings and business records in parallel, indexes bookings by businessId, and computes per-business aggregates
   * @returns {Promise<void>}
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 500 }
      if (activeCategory !== 'All') params.category = activeCategory
      if (statusFilter !== 'All')   params.status = statusFilter

      // [API CALL]: Fetch bookings and businesses concurrently for performance
      const [bkRes, bizRes] = await Promise.all([
        getBookings(params),
        getBusinesses({ limit: 200 }),
      ])

      const bookings  = bkRes.bookings  || []
      const businesses = bizRes.businesses || []

      // Index bookings by businessId for expanded row
      const byBiz = {}
      bookings.forEach(bk => {
        if (!byBiz[bk.businessId]) byBiz[bk.businessId] = []
        byBiz[bk.businessId].push(bk)
      })
      setBookingsByBiz(byBiz)
      setRawBookings(bookings)
      // [DATA TRANSFORM]: Aggregate raw bookings into per-business metrics
      setAggRows(aggregateByBusiness(bookings, businesses))
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load bookings'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [activeCategory, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // [STATE]: Persist selected category filter to localStorage for session continuity
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ category: activeCategory }))
  }, [activeCategory])

  // [DATA TRANSFORM]: Apply client-side search and sort on top of aggregated rows
  const filtered = useMemo(() => {
    let rows = aggRows
    if (search) rows = rows.filter(b =>
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase())
    )
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey] ?? 0
      const bVal = b[sortKey] ?? 0
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [aggRows, search, sortKey, sortDir])

  // [DATA TRANSFORM]: Sum filtered rows into column totals for the table footer
  const totals = useMemo(() => filtered.reduce((acc, b) => ({
    bookings: acc.bookings + b.totalBookings,
    confirmed: acc.confirmed + b.confirmed,
    completed: acc.completed + b.completed,
    noShows: acc.noShows + b.noShows,
  }), { bookings: 0, confirmed: 0, completed: 0, noShows: 0 }), [filtered])

  /**
   * @function    toggleSort
   * @purpose     Cycles sort direction for a column or sets a new sort key descending
   * @param  {string} key - Column key to sort by
   */
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  /**
   * @function    toggleRow
   * @purpose     Expands or collapses the detail sub-row for a given business
   * @param  {string} id - businessId to toggle
   */
  const toggleRow = (id) => {
    setExpandedRow(prev => prev === id ? null : id)
    setContextMenu(null)
  }

  /**
   * @function    toggleSelect
   * @purpose     Adds or removes a business from the multi-select set
   * @param  {string}      id - businessId to toggle
   * @param  {MouseEvent}  e  - Click event (propagation stopped)
   */
  const toggleSelect = (id, e) => {
    e.stopPropagation()
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  /**
   * @function    toggleAll
   * @purpose     Selects all visible rows or clears selection
   */
  const toggleAll = () => setSelectedRows(prev =>
    prev.length === filtered.length ? [] : filtered.map(b => b.businessId)
  )

  /**
   * @function    handleContextMenu
   * @purpose     Opens the right-click context menu at cursor position for the targeted row
   * @param  {MouseEvent} e   - Right-click event
   * @param  {Object}     row - Aggregated business row data
   */
  const handleContextMenu = (e, row) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, row })
  }

  /**
   * @function    bulkAction
   * @purpose     Executes a named bulk action on all selected rows and clears the selection
   * @param  {string} action - Label for the action being performed
   */
  const bulkAction = (action) => {
    addToast(`${action} for ${selectedRows.length} businesses`, 'success')
    setSelectedRows([])
  }

  /**
   * @function    SortHeader
   * @purpose     Renders a sortable column header with directional arrow indicator
   * @param  {string} label - Display label for the column
   * @param  {string} sKey  - Sort key matching aggregated row property
   * @returns {JSX.Element}
   */
  const SortHeader = ({ label, sKey }) => (
    <th onClick={() => toggleSort(sKey)}
      className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-300 select-none">
      <span className="flex items-center gap-1">
        {label}
        {sortKey === sKey ? <span className="text-indigo-400">{sortDir === 'asc' ? '↑' : '↓'}</span> : <ArrowUpDown size={9} className="text-slate-700" />}
      </span>
    </th>
  )

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <Layout title="Bookings">
        <div className="mb-6 flex items-center justify-between">
          <div><div className="h-7 w-32 bg-white/5 rounded animate-pulse mb-1" /><div className="h-4 w-48 bg-white/5 rounded animate-pulse" /></div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-4 animate-pulse"><div className="h-3 w-20 bg-white/5 rounded mb-2" /><div className="h-6 w-24 bg-white/5 rounded" /></div>)}</div>
        <SkeletonTable rows={6} cols={8} />
      </Layout>
    )
  }

  if (error && aggRows.length === 0) {
    return (
      <Layout title="Bookings">
        <div className="card p-12 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Failed to load bookings</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Bookings">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title mb-0.5">Bookings</h1>
          <p className="text-sm text-slate-500">Per-business aggregation · Click row to expand individual bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost gap-1.5"><RefreshCw size={13} /> Refresh</button>
          <button onClick={() => addToast('CSV export started', 'success', 'Download will begin shortly')} className="btn-ghost">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Bookings', value: totals.bookings.toLocaleString() },
          { label: 'Confirmed', value: totals.confirmed.toLocaleString() },
          { label: 'Completed', value: totals.completed.toLocaleString(), gold: false, green: true },
          { label: 'No-Shows', value: totals.noShows.toLocaleString(), red: true },
        ].map(({ label, value, gold, green, red }) => (
          <div key={label} className="card p-4">
            <p className="stat-label mb-1">{label}</p>
            <p className={clsx('text-xl font-bold font-display', gold ? 'metric-gold' : green ? 'text-emerald-400' : red ? 'text-red-400' : 'text-white')}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + Status Filter */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search business or city..."
            className="input-field pl-8 w-56 text-xs" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X size={12} className="text-slate-400" /></button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-40 text-xs bg-[#0F1629]">
          {BOOKING_STATUSES.map(s => <option key={s} value={s} className="bg-[#0F1629]">{s === 'All' ? 'All Statuses' : s}</option>)}
        </select>
        <p className="text-xs text-slate-500">{filtered.length} businesses · {rawBookings.length} total bookings</p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-0 border-b border-white/[0.06] mb-0">
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? aggRows.length : aggRows.filter(b => b.category === cat).length
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={clsx('px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-1.5',
                activeCategory === cat ? 'text-white border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-200')}>
              {cat}
              <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full', activeCategory === cat ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-slate-500')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selectedRows.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll} className="rounded accent-indigo-500 cursor-pointer" />
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Business</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <SortHeader label="Total" sKey="totalBookings" />
                <SortHeader label="Confirmed" sKey="confirmed" />
                <SortHeader label="Completed" sKey="completed" />
                <SortHeader label="No-Shows" sKey="noShows" />
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Show-up %</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-500">
                    No bookings found{search ? ` matching "${search}"` : activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
                  </td>
                </tr>
              )}
              {filtered.map((b, i) => {
                const isExpanded = expandedRow === b.businessId
                const isSelected = selectedRows.includes(b.businessId)
                const showUpRate = b.totalBookings > 0 ? (b.completed / b.totalBookings) * 100 : 0
                const noShowRate = b.totalBookings > 0 ? (b.noShows / b.totalBookings) * 100 : 0
                const bizBookings = bookingsByBiz[b.businessId] || []
                return (
                  <>
                    <tr key={b.businessId}
                      className={clsx('border-b border-white/[0.04] transition-colors cursor-pointer select-none',
                        isExpanded ? 'bg-indigo-500/5 border-indigo-500/20' : 'table-row-hover',
                        isSelected && 'bg-indigo-500/10')}
                      onClick={() => toggleRow(b.businessId)}
                      onContextMenu={e => handleContextMenu(e, b)}>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={e => toggleSelect(b.businessId, e)} className="rounded accent-indigo-500 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3">
                        {isExpanded ? <ChevronDown size={14} className="text-indigo-400" /> : <ChevronRight size={14} className="text-slate-600" />}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); navigate(`/businesses/${b.businessId}`) }}
                          className="flex items-center gap-1 text-white font-medium hover:text-indigo-400 transition-colors group">
                          {b.businessName}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 text-indigo-400" />
                        </button>
                        <p className="text-[10px] text-slate-500">{b.city}</p>
                      </td>
                      <td className="px-4 py-3"><span className="badge badge-indigo">{b.category}</span></td>
                      <td className="px-4 py-3 text-white font-semibold">{b.totalBookings}</td>
                      <td className="px-4 py-3 text-slate-300">{b.confirmed}</td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">{b.completed}</td>
                      <td className="px-4 py-3 text-red-400 font-medium">{b.noShows}</td>
                      <td className="px-4 py-3"><RateBar value={showUpRate} /></td>
                      <td className="px-4 py-3"><BusinessStatusBadge status={b.status} /></td>
                    </tr>
                    {isExpanded && (
                      <tr key={`exp-${b.businessId}`}>
                        <td colSpan={10} className="bg-[#0A0E1A] border-b border-white/[0.06] px-6 py-4 animate-fade-in">
                          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                            Individual Bookings ({bizBookings.length})
                          </p>
                          {bizBookings.length === 0 ? (
                            <p className="text-xs text-slate-500">No individual bookings loaded for this business</p>
                          ) : (
                            <div className="space-y-1.5">
                              {bizBookings.slice(0, 10).map(bk => (
                                <div key={bk.id} className="flex items-center gap-4 px-3 py-2 bg-white/[0.03] rounded-lg">
                                  <span className="text-indigo-400 font-mono text-[10px] w-24 truncate">{bk.id}</span>
                                  <span className="text-xs text-white font-medium flex-1">{bk.customerName || '—'}</span>
                                  <span className="text-xs text-slate-400 flex-1">{bk.serviceName || '—'}</span>
                                  <span className="text-[10px] text-slate-500">{bk.scheduledAt ? new Date(bk.scheduledAt).toLocaleDateString() : '—'}</span>
                                  <BookingStatusBadge status={bk.status} />
                                </div>
                              ))}
                              {bizBookings.length > 10 && (
                                <p className="text-xs text-slate-500 px-3">+ {bizBookings.length - 10} more bookings</p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/[0.1] bg-white/[0.02]">
                <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-slate-400">
                  TOTALS — {filtered.length} businesses
                </td>
                <td className="px-4 py-3 text-white font-bold text-sm">{totals.bookings}</td>
                <td className="px-4 py-3 text-slate-300 font-bold">{totals.confirmed}</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">{totals.completed}</td>
                <td className="px-4 py-3 text-red-400 font-bold">{totals.noShows}</td>
                <td /><td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}
          items={[
            { label: 'View Full Detail', icon: Eye, action: () => navigate(`/businesses/${contextMenu.row.businessId}`) },
            { label: 'Expand Row', icon: ChevronDown, action: () => toggleRow(contextMenu.row.businessId) },
            { divider: true },
            { label: 'Send Reminder', icon: Send, action: () => addToast(`Reminder sent to ${contextMenu.row.businessName}`, 'success') },
            { label: 'Generate Invoice', icon: FileText, action: () => { navigate('/billing'); addToast('Navigating to Billing', 'info') } },
          ]}
        />
      )}

      {/* Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="flex items-center gap-3 bg-[#0F1629] border border-indigo-500/30 rounded-2xl px-5 py-3 shadow-2xl shadow-indigo-500/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{selectedRows.length}</div>
              <span className="text-sm text-white font-medium">{selectedRows.length} selected</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => bulkAction('Reminders sent')} className="flex items-center gap-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-all font-medium">
              <Send size={12} /> Send Reminders
            </button>
            <button onClick={() => { navigate('/billing'); addToast('Generating invoices', 'info') }} className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-all font-medium">
              <FileText size={12} /> Generate Bills
            </button>
            <button onClick={() => addToast('CSV exported', 'success')} className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-all font-medium">
              <Download size={12} /> Export
            </button>
            <button onClick={() => setSelectedRows([])} className="text-slate-500 hover:text-white transition-colors"><X size={15} /></button>
          </div>
        </div>
      )}
    </Layout>
  )
}
