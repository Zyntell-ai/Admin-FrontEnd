/**
 * @file        Commissions.jsx
 * @module      Commission Revenue
 * @project     Admin-FrontEnd
 * @layer       Page
 * @description Displays aggregate commission revenue with monthly trend and category breakdown charts, and provides an approval workflow for pending commission entries.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - React (useState, useEffect, useCallback)
 *   - Layout: ../components/layout/Layout
 *   - ToastContext: ../context/ToastContext
 *   - Admin API: getRevenue, getPendingCommissions, approveCommission, approveBulkCommissions (../api/admin)
 *   - lucide-react: Download, RefreshCw, AlertCircle, TrendingUp, DollarSign, Zap, Users, CheckCircle, Clock
 *   - recharts: BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
 *   - clsx
 *
 * @sideEffects
 *   - Fetches revenue summary and pending commissions in parallel on mount
 *   - Approves single or bulk commissions via admin API
 *   - Displays success/error toasts on all mutation and fetch operations
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
import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/layout/Layout'
import { useToast } from '../context/ToastContext'
import { getRevenue, getPendingCommissions, approveCommission, approveBulkCommissions } from '../api/admin'
import { Download, RefreshCw, AlertCircle, TrendingUp, DollarSign, Zap, Users, CheckCircle, Clock } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────
// [BUSINESS RULE]: Commission types map to distinct colours for chart differentiation
const TYPE_COLORS = { BOOKING: '#4F46E5', SHOWUP: '#6EE7B7', LEAD: '#D4AF37' }
const CATEGORY_COLORS = ['#4F46E5', '#818CF8', '#D4AF37', '#6EE7B7', '#94A3B8']

/**
 * @function    CustomTooltip
 * @purpose     Renders a styled tooltip for Recharts bar and pie charts with INR formatting
 * @param  {boolean} active    - Whether the tooltip is currently visible
 * @param  {Array}   payload   - Array of series data points at the hovered position
 * @param  {string}  label     - X-axis label at the hovered position
 * @returns {JSX.Element|null}
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">₹{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// STATE & HOOKS
// ─────────────────────────────────────────
export default function Commissions() {
  const { addToast } = useToast()

  // [STATE]: Revenue summary from API and async flags
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // [STATE]: Pending commission approvals and selection set
  const [pending, setPending] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [approving, setApproving] = useState(false)

  // ─────────────────────────────────────────
  // CORE LOGIC / HANDLER FUNCTIONS
  // ─────────────────────────────────────────

  /**
   * @function    fetchData
   * @purpose     Fetches revenue summary and pending commissions in parallel from the admin API
   * @returns {Promise<void>}
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // [API CALL]: Parallel fetch of revenue totals and pending approval queue
      const [rev, pen] = await Promise.all([getRevenue(), getPendingCommissions()])
      // [STATE]: Store full revenue object and extract commissions array
      setRevenue(rev)
      setPending(pen.commissions || [])
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load commission data'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { fetchData() }, [fetchData])

  /**
   * @function    toggleSelect
   * @purpose     Adds or removes a single commission ID from the bulk-selection Set
   * @param  {string} id - Commission document ID
   * @returns {void}
   */
  const toggleSelect = (id) => {
    // [STATE]: Immutably update the Set by creating a new copy
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /**
   * @function    toggleAll
   * @purpose     Selects all pending commissions or clears the selection if all are already selected
   * @returns {void}
   */
  const toggleAll = () => {
    // [STATE]: Toggle between full selection and empty selection
    setSelected(prev => prev.size === pending.length ? new Set() : new Set(pending.map(c => c.id)))
  }

  /**
   * @function    handleApprove
   * @purpose     Approves one or more commissions via the admin API, then refreshes data
   * @param  {string[]} ids - Array of commission IDs to approve
   * @returns {Promise<void>}
   */
  const handleApprove = async (ids) => {
    setApproving(true)
    try {
      // [BUSINESS RULE]: Single approval uses dedicated endpoint; multiple use bulk endpoint
      // [API CALL]: Route to single or bulk approval based on array length
      if (ids.length === 1) {
        await approveCommission(ids[0])
      } else {
        await approveBulkCommissions(ids)
      }
      // [ADMIN ACTION]: Inform admin how many commissions were approved
      addToast(`${ids.length} commission${ids.length > 1 ? 's' : ''} approved`, 'success')
      // [STATE]: Clear selection after successful approval
      setSelected(new Set())
      await fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Approval failed', 'error')
    } finally {
      setApproving(false)
    }
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  // [GUARD]: Show skeleton while initial data loads
  if (loading) {
    return (
      <Layout title="Commissions">
        <div className="grid grid-cols-3 gap-4 mb-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-4 animate-pulse h-24" />)}</div>
        <div className="card p-4 animate-pulse h-64" />
      </Layout>
    )
  }

  // [GUARD]: Show full-page error only when no revenue data is available at all
  if (error && !revenue) {
    return (
      <Layout title="Commissions">
        <div className="card p-12 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-white mb-1">Failed to load commissions</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      </Layout>
    )
  }

  // [DATA TRANSFORM]: Destructure revenue response with safe fallbacks for chart rendering
  const byMonth = revenue?.byMonth || []
  const byCategory = revenue?.byCategory || []
  const byType = revenue?.byType || {}
  const currentMrr = revenue?.currentMrr || 0

  // [DATA TRANSFORM]: Sum all commission types for the total KPI card
  const totalCommissions = (byType.BOOKING || 0) + (byType.SHOWUP || 0) + (byType.LEAD || 0)

  // [DATA TRANSFORM]: Build pie chart dataset filtering out zero-value types
  const typePieData = Object.entries(byType)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: key, value, color: TYPE_COLORS[key] || '#94A3B8' }))

  return (
    <Layout title="Commissions">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Commission Revenue</h1>
          <p className="text-sm text-slate-500">Aggregate commission data from all confirmed transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost gap-1.5"><RefreshCw size={13} /> Refresh</button>
          {/* [ADMIN ACTION]: Export triggers a CSV generation toast (handler is inline) */}
          <button onClick={() => addToast('CSV export started', 'success')} className="btn-ghost"><Download size={13} /> Export</button>
        </div>
      </div>

      {/* ── Pending Approvals ── */}
      {pending.length > 0 && (
        <div className="card p-5 mb-6 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-400" />
              <h3 className="section-title mb-0">Pending Approvals ({pending.length})</h3>
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <button
                  onClick={() => handleApprove([...selected])}
                  disabled={approving}
                  className="btn-primary gap-1.5 text-xs px-3 py-1.5"
                >
                  <CheckCircle size={12} />
                  {approving ? 'Approving…' : `Approve ${selected.size} selected`}
                </button>
              )}
              <button onClick={toggleAll} className="btn-ghost text-xs px-3 py-1.5">
                {selected.size === pending.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="pb-2 pr-3 text-left w-8"><input type="checkbox" checked={selected.size === pending.length && pending.length > 0} onChange={toggleAll} className="accent-indigo-500" /></th>
                  <th className="pb-2 pr-4 text-left">Business</th>
                  <th className="pb-2 pr-4 text-left">Type</th>
                  <th className="pb-2 pr-4 text-left">Booking ID</th>
                  <th className="pb-2 pr-4 text-left">Date</th>
                  <th className="pb-2 pr-4 text-right">Amount</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pending.map(c => (
                  <tr key={c.id} className={`transition-colors ${selected.has(c.id) ? 'bg-amber-500/5' : 'hover:bg-white/2'}`}>
                    <td className="py-3 pr-3">
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="accent-indigo-500" />
                    </td>
                    <td className="py-3 pr-4 text-white font-medium">{c.businessName}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-semibold">{c.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400 font-mono">{c.bookingId || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="py-3 pr-4 text-right text-amber-400 font-semibold">₹{(c.amount ?? 0).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      {/* [ADMIN ACTION]: Approve a single commission row inline */}
                      <button
                        onClick={() => handleApprove([c.id])}
                        disabled={approving}
                        className="text-[11px] px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors font-medium"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Commissions', value: `₹${totalCommissions.toLocaleString()}`, icon: DollarSign, color: 'metric-gold', gold: true },
          { label: 'Booking Commissions', value: `₹${(byType.BOOKING || 0).toLocaleString()}`, icon: Zap, color: 'text-indigo-400' },
          { label: 'Showup Commissions', value: `₹${(byType.SHOWUP || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Lead Commissions', value: `₹${(byType.LEAD || 0).toLocaleString()}`, icon: Users, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color, gold }) => (
          <div key={label} className={clsx('card p-5', gold && 'border-gold/20')}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className={color} />
              <span className="stat-label">{label}</span>
            </div>
            <p className={clsx('stat-value', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* MRR Banner */}
      <div className="card p-4 mb-6 flex items-center gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current MRR (Plan Subscriptions)</p>
          <p className="text-2xl font-bold font-display text-white">₹{currentMrr.toLocaleString()}</p>
        </div>
        <div className="flex-1" />
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Total including MRR</p>
          {/* [BUSINESS RULE]: Grand total combines commission revenue with plan subscription MRR */}
          <p className="text-2xl font-bold font-display metric-gold">₹{(totalCommissions + currentMrr).toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-5 mb-6">
        {/* Revenue by Month */}
        <div className="col-span-8 card p-5">
          <h3 className="section-title mb-4">Commission Trend (Monthly)</h3>
          {byMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byMonth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="booking" name="Booking" fill="#4F46E5" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="showup" name="Showup" fill="#6EE7B7" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="lead" name="Lead" fill="#D4AF37" radius={[2, 2, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">No monthly data yet</div>
          )}
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-indigo-500" /><span className="text-xs text-slate-500">Booking</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-emerald-400" /><span className="text-xs text-slate-500">Showup</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-gold" /><span className="text-xs text-slate-500">Lead</span></div>
          </div>
        </div>

        {/* By Type Pie */}
        <div className="col-span-4 card p-5">
          <h3 className="section-title mb-3">By Commission Type</h3>
          {typePieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={typePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {typePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0F1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={v => [`₹${v.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {typePieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-slate-400">{d.name}</span>
                    </div>
                    <span className="text-white font-medium">₹{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* By Category Table */}
      {byCategory.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title mb-4">Commission by Category</h3>
          <div className="space-y-3">
            {/* [DATA TRANSFORM]: Sort categories descending by total commission for visual hierarchy */}
            {byCategory.sort((a, b) => b.total - a.total).map(({ category, total }, i) => {
              const maxTotal = byCategory[0]?.total || 1
              return (
                <div key={category} className="flex items-center gap-4">
                  <span className="text-xs text-white w-32 truncate">{category}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(total / maxTotal) * 100}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  </div>
                  <span className="text-xs font-semibold text-white w-24 text-right">₹{total.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Layout>
  )
}
