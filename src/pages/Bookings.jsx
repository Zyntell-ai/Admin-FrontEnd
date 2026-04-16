import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ContextMenu from '../components/ui/ContextMenu'
import { SkeletonTable } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { businessStats } from '../data/mockData'
import {
  Download, Filter, Calendar, ExternalLink, Search,
  X, ChevronDown, ChevronRight, Send, FileText,
  Trash2, Eye, ArrowUpDown
} from 'lucide-react'
import clsx from 'clsx'

const CATEGORIES = ['All', 'Healthcare', 'Restaurant', 'Real Estate', 'Beauty', 'Education']
const VIEWS = ['Weekly', 'Monthly']
const LS_KEY = 'zyntell_bookings_filters'

function StatusBadge({ status }) {
  const map = { active: 'badge-green', trial: 'badge-yellow', suspended: 'badge-red' }
  return <span className={clsx('badge capitalize', map[status] || 'badge-gray')}>{status}</span>
}

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

// Expanded row content
function ExpandedContent({ row }) {
  const fakeBookings = [
    { id: 'BK001', customer: 'Rajesh P.', service: 'Consultation', time: '09:00', status: 'COMPLETED' },
    { id: 'BK002', customer: 'Meera S.', service: 'Follow-up', time: '10:30', status: 'NO_SHOW' },
    { id: 'BK003', customer: 'Arjun K.', service: 'Consultation', time: '11:00', status: 'CONFIRMED' },
    { id: 'BK004', customer: 'Pooja M.', service: 'Review', time: '14:00', status: 'COMPLETED' },
  ]
  return (
    <tr>
      <td colSpan={13} className="bg-[#0A0E1A] border-b border-white/[0.06] px-6 py-4 animate-fade-in">
        <div className="flex items-start gap-6">
          {/* Recent bookings mini-table */}
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Recent Bookings</p>
            <div className="space-y-1.5">
              {fakeBookings.map(b => (
                <div key={b.id} className="flex items-center gap-4 px-3 py-2 bg-white/[0.03] rounded-lg">
                  <span className="text-indigo-400 font-mono text-[10px] w-16">{b.id}</span>
                  <span className="text-xs text-white font-medium flex-1">{b.customer}</span>
                  <span className="text-xs text-slate-400 flex-1">{b.service}</span>
                  <span className="text-[10px] text-slate-500">{b.time}</span>
                  <span className={clsx('badge text-[10px]', b.status === 'COMPLETED' ? 'badge-green' : b.status === 'NO_SHOW' ? 'badge-red' : 'badge-indigo')}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 flex-shrink-0">
            {[
              { label: 'Anomaly', value: `${row.anomalyPct}%`, color: row.anomalyPct > 15 ? 'text-red-400' : 'text-amber-400' },
              { label: 'Bill', value: `₹${row.generatedBill.toLocaleString()}`, color: 'text-white' },
              { label: 'Revenue', value: `₹${row.totalRevenue.toLocaleString()}`, color: 'metric-gold' },
              { label: 'Commission', value: `₹${row.commission.toLocaleString()}`, color: 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center bg-white/[0.03] rounded-lg px-4 py-3">
                <p className="text-[10px] text-slate-500 mb-1">{label}</p>
                <p className={clsx('text-sm font-bold font-display', color)}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function Bookings() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Restore filters from localStorage
  const savedFilters = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
  }, [])

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || savedFilters.category || 'All')
  const [activeView, setActiveView] = useState(savedFilters.view || 'Monthly')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('totalBookings')
  const [sortDir, setSortDir] = useState('desc')
  const [expandedRow, setExpandedRow] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [contextMenu, setContextMenu] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t) }, [])

  // Persist filters
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ category: activeCategory, view: activeView }))
  }, [activeCategory, activeView])

  const filtered = useMemo(() => {
    let rows = activeCategory === 'All' ? businessStats : businessStats.filter(b => b.category === activeCategory)
    if (search) rows = rows.filter(b => b.businessName.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase()))
    const k = activeView === 'Weekly' ? 'weeklyBookings' : 'monthlyBookings'
    return [...rows].sort((a, b) => {
      const aVal = sortKey === 'weeklyBookings' || sortKey === 'monthlyBookings' ? a[k] : a[sortKey]
      const bVal = sortKey === 'weeklyBookings' || sortKey === 'monthlyBookings' ? b[k] : b[sortKey]
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [activeCategory, search, sortKey, sortDir, activeView])

  const getViewBookings = (row) => activeView === 'Weekly' ? row.weeklyBookings : row.monthlyBookings

  const totals = useMemo(() => filtered.reduce((acc, b) => ({
    bookings: acc.bookings + getViewBookings(b),
    revenue: acc.revenue + b.totalRevenue,
    commission: acc.commission + b.commission,
    noShows: acc.noShows + b.noShows,
    bill: acc.bill + b.generatedBill,
  }), { bookings: 0, revenue: 0, commission: 0, noShows: 0, bill: 0 }), [filtered, activeView])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const toggleRow = (id) => {
    setExpandedRow(prev => prev === id ? null : id)
    setContextMenu(null)
  }

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAll = () => setSelectedRows(prev => prev.length === filtered.length ? [] : filtered.map(b => b.businessId))

  const handleContextMenu = (e, row) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, row })
  }

  const bulkAction = (action) => {
    addToast(`${action} for ${selectedRows.length} businesses`, 'success', 'Action completed')
    setSelectedRows([])
  }

  const SortHeader = ({ label, sKey }) => (
    <th onClick={() => toggleSort(sKey)}
      className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-300 select-none">
      <span className="flex items-center gap-1">
        {label}
        {sortKey === sKey ? <span className="text-indigo-400">{sortDir === 'asc' ? '↑' : '↓'}</span> : <ArrowUpDown size={9} className="text-slate-700" />}
      </span>
    </th>
  )

  if (loading) {
    return (
      <Layout title="Bookings">
        <div className="mb-6 flex items-center justify-between">
          <div><div className="h-7 w-32 bg-white/5 rounded animate-pulse mb-1" /><div className="h-4 w-48 bg-white/5 rounded animate-pulse" /></div>
        </div>
        <div className="grid grid-cols-5 gap-3 mb-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-4 animate-pulse"><div className="h-3 w-20 bg-white/5 rounded mb-2" /><div className="h-6 w-24 bg-white/5 rounded" /></div>)}</div>
        <SkeletonTable rows={6} cols={8} />
      </Layout>
    )
  }

  return (
    <Layout title="Bookings">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title mb-0.5">Bookings</h1>
          <p className="text-sm text-slate-500">Click any row to expand · Right-click for quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { addToast('CSV export started', 'success', 'Download will begin shortly') }} className="btn-ghost"><Download size={13} /> Export CSV</button>
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
            {VIEWS.map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                className={clsx('px-3 py-1 rounded-md text-xs font-medium transition-all', activeView === v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total Bookings', value: totals.bookings.toLocaleString() },
          { label: 'Generated Bill', value: `₹${totals.bill.toLocaleString()}` },
          { label: 'Total Revenue', value: `₹${totals.revenue.toLocaleString()}`, gold: true },
          { label: 'Commission', value: `₹${totals.commission.toLocaleString()}` },
          { label: 'Total No-Shows', value: totals.noShows.toLocaleString() },
        ].map(({ label, value, gold }) => (
          <div key={label} className={clsx('card p-4', gold && 'border-gold/15')}>
            <p className="stat-label mb-1">{label}</p>
            <p className={clsx('text-xl font-bold font-display', gold ? 'metric-gold' : 'text-white')}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex items-center gap-3 mb-0">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search business or city..."
            className="input-field pl-8 w-56 text-xs" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X size={12} className="text-slate-400" /></button>}
        </div>
        <p className="text-xs text-slate-500">{filtered.length} businesses</p>
      </div>

      <div className="flex items-center gap-0 border-b border-white/[0.06] mt-3 mb-0">
        {CATEGORIES.map(cat => {
          const count = cat === 'All' ? businessStats.length : businessStats.filter(b => b.category === cat).length
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
                <SortHeader label="Bookings" sKey={activeView === 'Weekly' ? 'weeklyBookings' : 'monthlyBookings'} />
                <SortHeader label="Confirmed" sKey="confirmed" />
                <SortHeader label="Completed" sKey="completed" />
                <SortHeader label="No-Shows" sKey="noShows" />
                <SortHeader label="Patient Show-ups %" sKey="showUpRate" />
                <SortHeader label="Anomaly %" sKey="anomalyPct" />
                <SortHeader label="Generated Bill" sKey="generatedBill" />
                <SortHeader label="Revenue" sKey="totalRevenue" />
                <SortHeader label="Commission" sKey="commission" />
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const isExpanded = expandedRow === b.businessId
                const isSelected = selectedRows.includes(b.businessId)
                return (
                  <>
                    <tr
                      key={b.businessId}
                      className={clsx(
                        'border-b border-white/[0.04] transition-colors cursor-pointer select-none',
                        isExpanded ? 'bg-indigo-500/5 border-indigo-500/20' : 'table-row-hover',
                        isSelected && 'bg-indigo-500/10'
                      )}
                      onClick={() => toggleRow(b.businessId)}
                      onContextMenu={e => handleContextMenu(e, b)}
                    >
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={e => toggleSelect(b.businessId, e)} className="rounded accent-indigo-500 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3">
                        {isExpanded
                          ? <ChevronDown size={14} className="text-indigo-400" />
                          : <ChevronRight size={14} className="text-slate-600" />}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/businesses/${b.businessId}`) }}
                          className="flex items-center gap-1 text-white font-medium hover:text-indigo-400 transition-colors group">
                          {b.businessName}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 text-indigo-400" />
                        </button>
                        <p className="text-[10px] text-slate-500">{b.city}</p>
                      </td>
                      <td className="px-4 py-3"><span className="badge badge-indigo">{b.category}</span></td>
                      <td className="px-4 py-3 text-white font-semibold">{getViewBookings(b)}</td>
                      <td className="px-4 py-3 text-slate-300">{b.confirmed}</td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">{b.completed}</td>
                      <td className="px-4 py-3 text-red-400 font-medium">{b.noShows}</td>
                      <td className="px-4 py-3"><RateBar value={b.showUpRate} /></td>
                      <td className="px-4 py-3"><RateBar value={b.anomalyPct} warning /></td>
                      <td className="px-4 py-3 text-slate-300 text-xs">₹{b.generatedBill.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold metric-gold text-sm">₹{b.totalRevenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-400 font-medium text-xs">₹{b.commission.toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    </tr>
                    {isExpanded && <ExpandedContent key={`exp-${b.businessId}`} row={b} />}
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
                <td /><td /><td /><td /><td />
                <td className="px-4 py-3 text-slate-300 text-xs font-bold">₹{totals.bill.toLocaleString()}</td>
                <td className="px-4 py-3 metric-gold font-bold">₹{totals.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-emerald-400 font-bold text-xs">₹{totals.commission.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { label: 'View Full Detail', icon: Eye, action: () => navigate(`/businesses/${contextMenu.row.businessId}`) },
            { label: 'Expand Row', icon: ChevronDown, action: () => toggleRow(contextMenu.row.businessId) },
            { divider: true },
            { label: 'Send Reminder', icon: Send, action: () => addToast(`Reminder sent to ${contextMenu.row.businessName}`, 'success') },
            { label: 'Generate Invoice', icon: FileText, action: () => { navigate('/billing'); addToast('Navigating to Billing', 'info') } },
            { divider: true },
            { label: 'View Alerts', icon: Eye, action: () => navigate('/alerts'), shortcut: 'A' },
          ]}
        />
      )}

      {/* Floating Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="flex items-center gap-3 bg-[#0F1629] border border-indigo-500/30 rounded-2xl px-5 py-3 shadow-2xl shadow-indigo-500/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {selectedRows.length}
              </div>
              <span className="text-sm text-white font-medium">{selectedRows.length} selected</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => bulkAction('Reminders sent')} className="flex items-center gap-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-all font-medium">
              <Send size={12} /> Send Reminders
            </button>
            <button onClick={() => { navigate('/billing'); addToast('Generating invoices', 'info') }} className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-all font-medium">
              <FileText size={12} /> Generate Bills
            </button>
            <button onClick={() => { addToast('CSV exported', 'success') }} className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-all font-medium">
              <Download size={12} /> Export
            </button>
            <button onClick={() => setSelectedRows([])} className="text-slate-500 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}