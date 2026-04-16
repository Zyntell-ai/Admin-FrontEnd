import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { businessStats, bookings, commissions, clinicAlerts, invoices } from '../data/mockData'
import {
  ArrowLeft, MapPin, Tag, Star, Ban, AlertOctagon,
  Unlock, TrendingUp, MessageSquare, Edit2, Check,
  X, CheckCircle, Clock, Activity, Zap, Phone
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

const monthlyRevenue = [
  { month: 'Nov', revenue: 6200 }, { month: 'Dec', revenue: 7100 },
  { month: 'Jan', revenue: 6800 }, { month: 'Feb', revenue: 7900 },
  { month: 'Mar', revenue: 8766 }, { month: 'Apr', revenue: 4200 },
]

const heatmapData = [
  [12, 24, 18, 30, 28, 15, 8], [20, 35, 42, 38, 45, 28, 14],
  [18, 32, 38, 41, 39, 22, 11], [22, 40, 48, 44, 50, 32, 16],
]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weeks = ['W1', 'W2', 'W3', 'W4']

function getHeatColor(val) {
  if (val < 15) return 'bg-indigo-900/30'
  if (val < 25) return 'bg-indigo-700/40'
  if (val < 35) return 'bg-indigo-600/60'
  if (val < 45) return 'bg-indigo-500/80'
  return 'bg-indigo-400'
}

// Signal score signals breakdown
const signalBreakdown = [
  { label: 'Day Before Reply', key: 'dayBefore', pts: 20, achieved: true, icon: Clock },
  { label: '"On My Way" Message', key: 'onMyWay', pts: 25, achieved: true, icon: MessageSquare },
  { label: 'GPS Location', key: 'gps', pts: 30, achieved: true, icon: MapPin },
  { label: 'OTP Check-in', key: 'otp', pts: 30, achieved: false, icon: Zap },
  { label: 'Post-slot Reply', key: 'postSlot', pts: 35, achieved: false, icon: Activity },
  { label: 'Review Left', key: 'review', pts: 20, achieved: true, icon: Star },
  { label: 'Clinic Marked', key: 'clinicMarked', pts: 15, achieved: false, icon: CheckCircle },
]

// Timeline events
function generateTimeline(bizName) {
  return [
    { id: 1, type: 'booking', event: 'Booking confirmed — Rajesh P.', detail: 'Dental Cleaning · 10:00 AM', time: 'Today, 09:42', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 2, type: 'alert', event: 'Alert triggered: High Anomaly Rate', detail: '16.9% this week vs 10% avg', time: 'Today, 08:15', icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 3, type: 'payment', event: 'Invoice paid — March 2024', detail: '₹9,740 · Razorpay', time: 'Apr 3, 2024', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 4, type: 'commission', event: 'Show-up commission confirmed', detail: '₹250 · Signal score: 145/175', time: 'Apr 2, 2024', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: 5, type: 'booking', event: 'No-show recorded — Meera S.', detail: 'Root Canal · 11:00 AM', time: 'Apr 2, 2024', icon: X, color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 6, type: 'system', event: 'Bot conversation — patient inquiry', detail: 'Enquiry about teeth whitening', time: 'Apr 1, 2024', icon: MessageSquare, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    { id: 7, type: 'commission', event: 'Lead commission earned', detail: '₹600 · HOT lead captured', time: 'Mar 30, 2024', icon: TrendingUp, color: 'text-gold', bg: 'bg-gold-muted' },
    { id: 8, type: 'booking', event: 'Booking confirmed — Arjun K.', detail: 'Consultation · 09:30 AM', time: 'Mar 29, 2024', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]
}

const TABS = ['Overview', 'Bookings', 'Commission Ledger', 'Alerts', 'Timeline']

export default function BusinessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('Overview')
  const [actionModal, setActionModal] = useState(null)
  const [warningMsg, setWarningMsg] = useState('')
  const [suspended, setSuspended] = useState(false)
  const [editField, setEditField] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [contactModal, setContactModal] = useState(false)
  const [contactMsg, setContactMsg] = useState('')

  const biz = businessStats.find(b => b.businessId === id) || businessStats[0]
  const bizBookings = bookings.filter(b => b.businessId === biz.businessId)
  const bizCommissions = commissions.filter(c => c.businessId === biz.businessId)
  const bizAlerts = clinicAlerts.filter(a => a.businessId === biz.businessId)
  const bizInvoice = invoices.find(i => i.businessId === biz.businessId)
  const timeline = generateTimeline(biz.businessName)

  const categoryIcon = { Healthcare: '🏥', Restaurant: '🍽️', 'Real Estate': '🏢', Beauty: '💅', Education: '🎓' }

  const totalSignalScore = signalBreakdown.filter(s => s.achieved).reduce((a, s) => a + s.pts, 0)
  const maxScore = signalBreakdown.reduce((a, s) => a + s.pts, 0)

  // Inline editing helpers
  const startEdit = (field, value) => {
    setEditField(field)
    setEditValues({ [field]: value })
  }
  const saveEdit = (field) => {
    addToast(`${field} updated`, 'success')
    setEditField(null)
  }
  const cancelEdit = () => setEditField(null)

  const EditableField = ({ field, value, label }) => {
    if (editField === field) {
      return (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={editValues[field] || value}
            onChange={e => setEditValues(v => ({ ...v, [field]: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(field); if (e.key === 'Escape') cancelEdit() }}
            className="input-field text-sm py-1 px-2 w-40"
          />
          <button onClick={() => saveEdit(field)} className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
            <Check size={11} className="text-emerald-400" />
          </button>
          <button onClick={cancelEdit} className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
            <X size={11} className="text-red-400" />
          </button>
        </div>
      )
    }
    return (
      <span className="flex items-center gap-1.5 group cursor-pointer" onClick={() => startEdit(field, value)}>
        <span className="text-sm text-slate-400">{value}</span>
        <Edit2 size={10} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    )
  }

  return (
    <Layout title={biz.businessName}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft size={14} /> Back to Bookings
      </button>

      {/* Hero */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            {categoryIcon[biz.category] || '🏢'}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {editField === 'businessName' ? (
                    <div className="flex items-center gap-2">
                      <input autoFocus value={editValues.businessName || biz.businessName}
                        onChange={e => setEditValues(v => ({ ...v, businessName: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit('businessName'); if (e.key === 'Escape') cancelEdit() }}
                        className="input-field text-xl py-1 px-2 font-bold" />
                      <button onClick={() => saveEdit('businessName')} className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Check size={13} className="text-emerald-400" /></button>
                      <button onClick={cancelEdit} className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center"><X size={13} className="text-red-400" /></button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit('businessName', biz.businessName)} className="group flex items-center gap-2">
                      <h1 className="page-title">{biz.businessName}</h1>
                      <Edit2 size={13} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1 text-slate-400"><Tag size={12} /> {biz.category}</span>
                  <EditableField field="city" value={biz.city} label="City" />
                  <span className="flex items-center gap-1 text-slate-400"><Star size={12} /> {biz.plan?.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx('badge text-xs px-2.5 py-1',
                  suspended ? 'badge-red' : biz.status === 'active' ? 'badge-green' : 'badge-yellow')}>
                  ● {suspended ? 'suspended' : biz.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4 mt-5 pt-4 border-t border-white/[0.05]">
              {[
                { label: 'Total Bookings', value: biz.totalBookings, color: 'text-white' },
                { label: 'Completed', value: biz.completed, color: 'text-emerald-400' },
                { label: 'No-Shows', value: biz.noShows, color: 'text-red-400' },
                { label: 'Show-up Rate', value: `${biz.showUpRate}%`, color: 'text-indigo-400' },
                { label: 'Monthly Revenue', value: `₹${biz.totalRevenue.toLocaleString()}`, color: 'metric-gold' },
                { label: 'Commission', value: `₹${biz.commission.toLocaleString()}`, color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="stat-label">{label}</p>
                  <p className={clsx('text-lg font-bold font-display mt-1', color)}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-white/[0.06] mb-5">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={clsx('px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-2',
              activeTab === tab ? 'text-white border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-200')}>
            {tab}
            {tab === 'Alerts' && bizAlerts.filter(a => a.status === 'OPEN').length > 0 && (
              <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full">
                {bizAlerts.filter(a => a.status === 'OPEN').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* === OVERVIEW === */}
      {activeTab === 'Overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-5 card p-5">
              <h3 className="section-title mb-4">Monthly Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#0F1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} labelStyle={{ color: '#94A3B8' }} itemStyle={{ color: '#D4AF37' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#D4AF37' }} isAnimationActive animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-4 card p-5">
              <h3 className="section-title mb-4">Booking Heatmap</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1 mb-1 pl-7">
                  {days.map(d => <div key={d} className="text-[9px] text-slate-500 text-center">{d}</div>)}
                </div>
                {heatmapData.map((row, wi) => (
                  <div key={wi} className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-600 w-6">{weeks[wi]}</span>
                    <div className="grid grid-cols-7 gap-1 flex-1">
                      {row.map((val, di) => (
                        <div key={di} className={clsx('h-7 rounded text-[8px] font-medium flex items-center justify-center text-white/60 hover:ring-1 hover:ring-white/20 transition-all cursor-default', getHeatColor(val))}>
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[9px] text-slate-500">Less</span>
                <div className="flex gap-1">{['bg-indigo-900/30', 'bg-indigo-700/40', 'bg-indigo-600/60', 'bg-indigo-500/80', 'bg-indigo-400'].map((c, i) => <div key={i} className={clsx('w-4 h-4 rounded', c)} />)}</div>
                <span className="text-[9px] text-slate-500">More</span>
              </div>
            </div>

            <div className="col-span-3 card p-5">
              <h3 className="section-title mb-4">Invoice Summary</h3>
              {bizInvoice ? (
                <div className="space-y-2.5">
                  {[
                    { label: 'Base Fee', value: bizInvoice.baseFee },
                    { label: 'Booking Commissions', value: bizInvoice.bookingCommissions },
                    { label: 'Show-up Commissions', value: bizInvoice.showupCommissions },
                    { label: 'Lead Commissions', value: bizInvoice.leadCommissions },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-xs text-white font-medium">₹{value.toLocaleString()}</span>
                    </div>
                  ))}
                  {bizInvoice.adjustments !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Adjustments</span>
                      <span className={clsx('text-xs font-medium', bizInvoice.adjustments > 0 ? 'text-red-400' : 'text-emerald-400')}>
                        {bizInvoice.adjustments > 0 ? '+' : ''}₹{bizInvoice.adjustments.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-white/[0.08] pt-2.5 flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Total</span>
                    <span className="text-sm font-bold metric-gold">₹{bizInvoice.total.toLocaleString()}</span>
                  </div>
                  <span className={clsx('badge w-full justify-center py-1.5', bizInvoice.status === 'PAID' ? 'badge-green' : bizInvoice.status === 'OVERDUE' ? 'badge-red' : 'badge-indigo')}>{bizInvoice.status}</span>
                </div>
              ) : <p className="text-xs text-slate-500 text-center py-4">No invoice this month</p>}
            </div>
          </div>

          {/* Signal Score Breakdown */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title">Show-up Signal Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">Average across last 30 bookings</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-display text-indigo-400">{totalSignalScore}<span className="text-sm text-slate-500">/{maxScore}</span></p>
                <p className="text-xs text-slate-500">Signal Score</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {signalBreakdown.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.key} className={clsx('rounded-xl p-3 text-center border transition-all', s.achieved ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/[0.03] border-white/[0.05] opacity-50')}>
                    <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2', s.achieved ? 'bg-indigo-500/20' : 'bg-white/5')}>
                      <Icon size={14} className={s.achieved ? 'text-indigo-400' : 'text-slate-500'} />
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight mb-1">{s.label}</p>
                    <p className={clsx('text-xs font-bold', s.achieved ? 'text-indigo-400' : 'text-slate-600')}>+{s.pts}</p>
                    {s.achieved ? <CheckCircle size={10} className="text-emerald-400 mx-auto mt-1" /> : <X size={10} className="text-slate-600 mx-auto mt-1" />}
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500">
                <span>0</span><span className="text-indigo-400 font-medium">{totalSignalScore}/{maxScore}</span><span>{maxScore}</span>
              </div>
              <div className="bg-white/5 rounded-full h-2.5">
                <div className="bg-gradient-indigo h-2.5 rounded-full transition-all duration-1000" style={{ width: `${(totalSignalScore / maxScore) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === BOOKINGS === */}
      {activeTab === 'Bookings' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Booking ID', 'Customer', 'Service', 'Staff', 'Scheduled', 'Source', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bizBookings.length ? bizBookings.map(b => (
                <tr key={b.id} className="border-b border-white/[0.04] table-row-hover">
                  <td className="px-4 py-3 text-indigo-400 font-mono text-xs">{b.id}</td>
                  <td className="px-4 py-3"><p className="text-sm text-white font-medium">{b.customerName}</p><p className="text-[10px] text-slate-500">{b.customerPhone}</p></td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{b.serviceName}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{b.staffName || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{b.scheduledAt}</td>
                  <td className="px-4 py-3"><span className="badge badge-indigo text-[10px]">{b.source}</span></td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge text-[10px]', b.status === 'COMPLETED' ? 'badge-green' : b.status === 'NO_SHOW' ? 'badge-red' : 'badge-indigo')}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">No bookings found for this business</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* === COMMISSION LEDGER === */}
      {activeTab === 'Commission Ledger' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="section-title">Commission Ledger</h3>
            <span className="metric-gold font-bold text-sm">Total: ₹{bizCommissions.reduce((a, c) => a + c.amount, 0).toLocaleString()}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['ID', 'Type', 'Amount', 'Status', 'Triggered By', 'Signal Score', 'Date', 'Invoice'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bizCommissions.map(c => (
                <tr key={c.id} className="border-b border-white/[0.04] table-row-hover">
                  <td className="px-4 py-3 text-indigo-400 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3"><span className={clsx('badge text-[10px]', c.type === 'SHOWUP' ? 'badge-green' : c.type === 'BOOKING' ? 'badge-indigo' : c.type === 'LEAD' ? 'badge-yellow' : 'badge-gray')}>{c.type}</span></td>
                  <td className="px-4 py-3 metric-gold font-semibold">₹{c.amount}</td>
                  <td className="px-4 py-3"><span className={clsx('badge text-[10px]', c.status === 'CONFIRMED' ? 'badge-green' : c.status === 'DISPUTED' ? 'badge-red' : 'badge-indigo')}>{c.status}</span></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.triggeredBy}</td>
                  <td className="px-4 py-3">
                    {c.signalScore != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-white/5 rounded-full h-1.5"><div className={clsx('h-1.5 rounded-full', c.signalScore >= 130 ? 'bg-emerald-500' : 'bg-indigo-500')} style={{ width: `${(c.signalScore / 175) * 100}%` }} /></div>
                        <span className="text-xs text-slate-300">{c.signalScore}/175</span>
                      </div>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{c.createdAt}</td>
                  <td className="px-4 py-3 text-xs">{c.invoiceId ? <span className="text-emerald-400 font-mono">{c.invoiceId}</span> : <span className="text-amber-400">Unbilled</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === ALERTS === */}
      {activeTab === 'Alerts' && (
        <div className="space-y-3">
          {bizAlerts.length ? bizAlerts.map(alert => (
            <div key={alert.id} className={clsx('card p-4 border', alert.severity === 'Critical' ? 'border-red-500/20' : alert.severity === 'High' ? 'border-orange-500/20' : 'border-amber-500/20')}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx('badge text-[10px]', alert.severity === 'Critical' ? 'badge-red' : alert.severity === 'High' ? 'bg-orange-500/15 text-orange-400' : 'badge-yellow')}>{alert.severity}</span>
                    <span className={clsx('badge text-[10px]', alert.status === 'RESOLVED' ? 'badge-green' : alert.status === 'IN_REVIEW' ? 'badge-indigo' : 'badge-red')}>{alert.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{alert.type.replace(/_/g, ' ')}</p>
                  {alert.confirmationRate && <p className="text-xs text-slate-400 mt-1">Rate: {alert.confirmationRate}% (Platform avg: {alert.platformAverage}%)</p>}
                  {alert.notes && <p className="text-xs text-slate-500 mt-1 italic">"{alert.notes}"</p>}
                </div>
                <p className="text-xs text-slate-500">{alert.createdAt}</p>
              </div>
            </div>
          )) : (
            <div className="card p-8 text-center"><CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" /><p className="text-sm text-slate-400">No alerts for this business</p></div>
          )}
        </div>
      )}

      {/* === TIMELINE === */}
      {activeTab === 'Timeline' && (
        <div className="card p-5">
          <h3 className="section-title mb-5">Activity Timeline</h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/[0.06]" />
            <div className="space-y-0">
              {timeline.map((event, i) => {
                const Icon = event.icon
                return (
                  <div key={event.id} className="flex items-start gap-4 pb-6 animate-fade-in">
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border relative z-10', event.bg, 'border-white/[0.08]')}>
                      <Icon size={15} className={event.color} />
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{event.event}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{event.detail}</p>
                        </div>
                        <span className="text-[10px] text-slate-600 flex-shrink-0 ml-4">{event.time}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="card p-5 mt-5">
        <h3 className="section-title mb-4">Admin Actions</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setActionModal('suspend')}
            className={clsx('flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-all',
              suspended ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20')}>
            <Ban size={14} /> {suspended ? 'Reinstate' : 'Suspend Business'}
          </button>
          <button onClick={() => setActionModal('warning')}
            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-sm font-medium transition-all">
            <AlertOctagon size={14} /> Send Warning
          </button>
          <button onClick={() => setActionModal('unlock')}
            className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium transition-all">
            <Unlock size={14} /> Unlock Contacts
          </button>
          <button onClick={() => setContactModal(true)} className="btn-ghost">
            <Phone size={14} /> Contact Owner
          </button>
          <button className="btn-primary ml-auto"><TrendingUp size={14} /> Full Report</button>
        </div>
      </div>

      {/* Suspend Modal */}
      <Modal open={actionModal === 'suspend'} onClose={() => setActionModal(null)} title={suspended ? 'Reinstate Business' : 'Suspend Business'} size="sm">
        <p className="text-sm text-slate-400 mb-4">
          {suspended ? `Reinstate ${biz.businessName} and restore their bot access?` : `Suspend ${biz.businessName} immediately? Their bot will stop accepting bookings.`}
        </p>
        <div className="flex gap-3">
          <button onClick={() => { setSuspended(!suspended); setActionModal(null); addToast(suspended ? `${biz.businessName} reinstated` : `${biz.businessName} suspended`, suspended ? 'success' : 'warning') }}
            className={suspended ? 'btn-primary flex-1 justify-center' : 'flex-1 justify-center flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium'}>
            {suspended ? 'Reinstate' : 'Yes, Suspend'}
          </button>
          <button onClick={() => setActionModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
        </div>
      </Modal>

      {/* Warning Modal */}
      <Modal open={actionModal === 'warning'} onClose={() => setActionModal(null)} title="Send Warning">
        <div className="space-y-3">
          <textarea value={warningMsg} onChange={e => setWarningMsg(e.target.value)} rows={4}
            placeholder="Write the warning message..." className="input-field resize-none" />
          <div className="flex gap-3">
            <button onClick={() => { setWarningMsg(''); setActionModal(null); addToast('Warning sent successfully', 'success', `Message sent to ${biz.businessName}`) }}
              className="btn-primary flex-1 justify-center">Send Warning</button>
            <button onClick={() => setActionModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Unlock Modal */}
      <Modal open={actionModal === 'unlock'} onClose={() => setActionModal(null)} title="Unlock Customer Contacts" size="sm">
        <p className="text-sm text-slate-400 mb-4">Reveal real phone numbers for {biz.businessName}. This action is logged.</p>
        <div className="flex gap-3">
          <button onClick={() => { setActionModal(null); addToast('Contacts unlocked', 'success', 'Phone numbers now visible') }} className="btn-primary flex-1 justify-center">Confirm</button>
          <button onClick={() => setActionModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
        </div>
      </Modal>

      {/* Contact Owner Modal */}
      <Modal open={contactModal} onClose={() => setContactModal(false)} title="Contact Business Owner">
        <div className="space-y-4">
          <div className="flex gap-2">
            {['WhatsApp', 'Email', 'Call'].map(ch => (
              <button key={ch} className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-slate-300 hover:border-indigo-500/30 hover:text-white transition-all">{ch}</button>
            ))}
          </div>
          <textarea value={contactMsg} onChange={e => setContactMsg(e.target.value)} rows={3}
            placeholder="Type your message to the business owner..." className="input-field resize-none" />
          <div className="flex gap-3">
            <button onClick={() => { setContactModal(false); setContactMsg(''); addToast('Message sent to business owner', 'success') }} className="btn-primary flex-1 justify-center">Send Message</button>
            <button onClick={() => setContactModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}