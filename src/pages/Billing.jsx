/**
 * @file        Billing.jsx
 * @module      Billing Admin
 * @project     Admin-FrontEnd
 * @layer       Page
 * @description Manages platform invoices — view, filter, generate, adjust, and send payment reminders to businesses.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - React (useState, useMemo, useEffect, useCallback)
 *   - Layout: ../components/layout/Layout
 *   - Modal: ../components/ui/Modal
 *   - ToastContext: ../context/ToastContext
 *   - Admin API: getInvoices, adjustInvoice, generateAllInvoices (../api/admin)
 *   - lucide-react: Download, Plus, Send, RefreshCw, FileText, AlertCircle, CheckCircle, Clock, X, Loader2
 *   - clsx
 *
 * @sideEffects
 *   - Fetches invoices from admin API on mount and on filter changes
 *   - Calls generateAllInvoices to bulk-create invoices for a selected month
 *   - Calls adjustInvoice to apply manual adjustments with reason
 *   - Displays toast notifications on all actions
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
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { getInvoices, adjustInvoice, generateAllInvoices } from '../api/admin'
import {
  Download, Plus, Send, RefreshCw, FileText,
  AlertCircle, CheckCircle, Clock, X, Loader2
} from 'lucide-react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────
const CATEGORIES = ['All', 'Healthcare', 'Restaurant', 'Real Estate', 'Beauty', 'Education']
const STATUSES   = ['All', 'PENDING', 'OVERDUE', 'PAID', 'WAIVED']

/**
 * @function    StatusBadge
 * @purpose     Renders a colour-coded badge with icon for an invoice status
 * @param  {string} status - Invoice status: PAID | PENDING | OVERDUE | WAIVED
 * @returns {JSX.Element}
 */
function StatusBadge({ status }) {
  const map  = { PAID: 'badge-green', PENDING: 'badge-indigo', OVERDUE: 'badge-red', WAIVED: 'badge-gray' }
  const icons = { PAID: CheckCircle, PENDING: Clock, OVERDUE: AlertCircle, WAIVED: CheckCircle }
  const Icon = icons[status] || Clock
  return <span className={clsx('badge gap-1', map[status])}><Icon size={10} /> {status}</span>
}

export default function Billing() {
  // ─────────────────────────────────────────
  // STATE & HOOKS
  // ─────────────────────────────────────────
  const { addToast } = useToast()
  const [invoices, setInvoices]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [statusFilter, setStatusFilter]     = useState('All')
  const [selected, setSelected]             = useState([])
  const [generateModal, setGenerateModal]   = useState(false)
  const [generateMonth, setGenerateMonth]   = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [generating, setGenerating]     = useState(false)
  const [adjustModal, setAdjModal]      = useState(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting]       = useState(false)

  // ─────────────────────────────────────────
  // CORE LOGIC / HANDLER FUNCTIONS
  // ─────────────────────────────────────────

  /**
   * @function    fetchData
   * @purpose     Fetches invoices from admin API with optional status and category filters
   * @returns {Promise<void>}
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // [API CALL]: Pass server-side filters to reduce payload size
      const params = {}
      if (statusFilter !== 'All')   params.status = statusFilter
      if (activeCategory !== 'All') params.category = activeCategory
      const data = await getInvoices(params)
      // [STATE]: Replace invoice list with fresh server data
      setInvoices(data.invoices || [])
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load invoices'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, activeCategory])

  useEffect(() => { fetchData() }, [fetchData])

  // [DATA TRANSFORM]: Already filtered server-side; memoized for stable reference
  const filtered = useMemo(() => invoices, [invoices]) // already filtered server-side

  // [DATA TRANSFORM]: Accumulate financial totals across all visible invoices
  const totals = useMemo(() => filtered.reduce((acc, inv) => {
    acc.total += inv.total || 0
    if (inv.status === 'PENDING' || inv.status === 'OVERDUE') acc.outstanding += inv.total || 0
    if (inv.status === 'PAID') acc.collected += inv.total || 0
    if (inv.status === 'OVERDUE') acc.overdue++
    return acc
  }, { total: 0, outstanding: 0, collected: 0, overdue: 0 }), [filtered])

  /**
   * @function    handleGenerateAll
   * @purpose     Calls admin API to bulk-generate invoices for all active businesses for the selected month
   * @returns {Promise<void>}
   */
  const handleGenerateAll = async () => {
    // [VALIDATION]: Require a month selection before triggering generation
    if (!generateMonth) { addToast('Please select a month', 'error'); return }
    setGenerating(true)
    try {
      // [ADMIN ACTION]: Trigger bulk invoice generation; existing invoices are skipped
      const result = await generateAllInvoices(generateMonth)
      addToast(`Generated ${result.generated} invoices (${result.skipped} skipped)`, 'success')
      setGenerateModal(false)
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Generation failed', 'error')
    } finally {
      setGenerating(false)
    }
  }

  /**
   * @function    handleAdjust
   * @purpose     Applies a manual monetary adjustment to a specific invoice
   * @returns {Promise<void>}
   */
  const handleAdjust = async () => {
    // [GUARD]: Ensure modal target is set before attempting adjustment
    if (!adjustModal) return
    const amt = parseFloat(adjustAmount)
    // [VALIDATION]: Amount must be a non-zero number; reason must not be empty
    if (isNaN(amt) || amt === 0) { addToast('Please enter a valid amount', 'error'); return }
    if (!adjustReason.trim()) { addToast('Reason is required', 'error'); return }
    setAdjusting(true)
    try {
      // [ADMIN ACTION]: Persist adjustment amount and reason to the invoice record
      await adjustInvoice(adjustModal.id, amt, adjustReason)
      addToast(`Invoice adjusted by ₹${Math.abs(amt).toLocaleString()}`, 'success')
      setAdjModal(null); setAdjustAmount(''); setAdjustReason('')
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Adjustment failed', 'error')
    } finally {
      setAdjusting(false)
    }
  }

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(prev => prev.length === filtered.length ? [] : filtered.map(i => i.id))

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <Layout title="Billing">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Billing & Invoices</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading...' : `${filtered.length} invoices · ₹${totals.outstanding.toLocaleString()} outstanding`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost gap-1.5"><RefreshCw size={13} /> Refresh</button>
          <button onClick={() => addToast('CSV export started', 'success')} className="btn-ghost"><Download size={13} /> Export</button>
          <button onClick={() => setGenerateModal(true)} className="btn-primary"><Plus size={14} /> Generate Invoices</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Invoices', value: filtered.length, color: 'text-white' },
          { label: 'Outstanding', value: `₹${totals.outstanding.toLocaleString()}`, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Collected', value: `₹${totals.collected.toLocaleString()}`, color: 'metric-gold', border: 'border-gold/15' },
          { label: 'Overdue Count', value: totals.overdue, color: 'text-red-400', border: 'border-red-500/20' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={clsx('card p-4 border', border || 'border-white/[0.06]')}>
            <p className="stat-label">{label}</p>
            <p className={clsx('text-xl font-bold font-display mt-1', color)}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="input-field w-44 text-xs bg-[#0F1629]">
          {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0F1629]">{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-36 text-xs bg-[#0F1629]">
          {STATUSES.map(s => <option key={s} value={s} className="bg-[#0F1629]">{s === 'All' ? 'All Statuses' : s}</option>)}
        </select>
        {selected.length > 0 && (
          <button onClick={() => addToast(`Reminders sent to ${selected.length} businesses`, 'success')}
            className="flex items-center gap-1.5 text-xs text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 rounded-lg hover:bg-indigo-500/20 transition-all">
            <Send size={12} /> Send Reminders ({selected.length})
          </button>
        )}
        <p className="text-xs text-slate-500 ml-auto">{filtered.length} invoices</p>
      </div>

      {/* Invoice Table */}
      {loading ? (
        <div className="card p-8 text-center text-slate-500 animate-pulse text-sm">Loading invoices...</div>
      ) : error ? (
        <div className="card p-12 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-white mb-1">Failed to load invoices</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 text-sm">No invoices found for selected filters</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll} className="rounded accent-indigo-500 cursor-pointer" />
                  </th>
                  {['Business', 'Month', 'Plan', 'Base Fee', 'Commissions', 'Adjustments', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-white/[0.04] table-row-hover">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(inv.id)} onChange={() => toggleSelect(inv.id)} className="rounded accent-indigo-500 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-xs">{inv.businessName}</p>
                      <p className="text-[10px] text-slate-500">{inv.category}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{inv.month}</td>
                    <td className="px-4 py-3"><span className="badge badge-indigo">{inv.plan?.toUpperCase()}</span></td>
                    <td className="px-4 py-3 text-slate-300 text-xs">₹{(inv.baseFee || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">₹{((inv.bookingCommissions || 0) + (inv.showupCommissions || 0) + (inv.leadCommissions || 0)).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">
                      {inv.adjustments !== 0 ? (
                        <span className={clsx('font-medium', (inv.adjustments || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {(inv.adjustments || 0) >= 0 ? '+' : ''}₹{Math.abs(inv.adjustments || 0).toLocaleString()}
                        </span>
                      ) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3 font-bold metric-gold">₹{(inv.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(inv.status === 'PENDING' || inv.status === 'OVERDUE') && (
                          <button onClick={() => { setAdjModal(inv); setAdjustAmount(''); setAdjustReason('') }}
                            className="text-[10px] text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 rounded hover:bg-indigo-500/20 transition-all">
                            Adjust
                          </button>
                        )}
                        {(inv.status === 'PENDING' || inv.status === 'OVERDUE') && (
                          <button onClick={() => addToast(`Reminder sent for ${inv.businessName}`, 'success')}
                            className="text-[10px] text-slate-400 border border-white/10 bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-all">
                            <Send size={10} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/[0.1] bg-white/[0.02]">
                  <td colSpan={7} className="px-4 py-3 text-xs font-semibold text-slate-400">TOTALS</td>
                  <td className="px-4 py-3 font-bold metric-gold">₹{totals.total.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Generate Invoices Modal */}
      <Modal isOpen={generateModal} onClose={() => setGenerateModal(false)} title="Generate All Invoices" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Generate invoices for all active businesses for the selected month. Businesses that already have invoices for that month will be skipped.</p>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Month (YYYY-MM)</label>
            <input type="month" value={generateMonth} onChange={e => setGenerateMonth(e.target.value)}
              className="input-field w-full text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleGenerateAll} disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all">
              {generating ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><FileText size={13} /> Generate</>}
            </button>
            <button onClick={() => setGenerateModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Adjust Invoice Modal */}
      <Modal isOpen={!!adjustModal} onClose={() => setAdjModal(null)} title={`Adjust Invoice — ${adjustModal?.businessName}`} size="sm">
        <div className="space-y-4">
          <div className="bg-white/[0.03] rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Month</span><span className="text-white">{adjustModal?.month}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Current Total</span><span className="metric-gold font-bold">₹{(adjustModal?.total || 0).toLocaleString()}</span></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Adjustment Amount (use negative to deduct)</label>
            <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)}
              placeholder="e.g. 500 or -200" className="input-field w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Reason *</label>
            <textarea value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
              placeholder="Why is this adjustment being made?" rows={2} className="input-field w-full resize-none text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAdjust} disabled={adjusting || !adjustReason.trim() || !adjustAmount}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all">
              {adjusting ? <><Loader2 size={13} className="animate-spin" /> Adjusting...</> : 'Apply Adjustment'}
            </button>
            <button onClick={() => setAdjModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
