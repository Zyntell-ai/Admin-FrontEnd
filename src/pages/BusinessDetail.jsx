import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { getBusinessProfile, updateBusiness, suspendBusiness } from '../api/admin'
import {
  ArrowLeft, MapPin, Tag, Star, Ban, AlertOctagon,
  Unlock, TrendingUp, MessageSquare, Edit2, Check,
  X, CheckCircle, Clock, Activity, Zap, Phone,
  RefreshCw, AlertTriangle, DollarSign, FileText
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

const TABS = ['Overview', 'Commission Ledger', 'Alerts', 'Invoice History']

function deriveStatus(b) {
  if (!b) return 'unknown'
  if (b.isTrialActive) return 'trial'
  if (b.isActive) return 'active'
  return 'suspended'
}

export default function BusinessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [activeTab, setActiveTab]   = useState('Overview')
  const [actionModal, setActionModal] = useState(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [suspending, setSuspending] = useState(false)
  const [editField, setEditField]   = useState(null)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving]         = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getBusinessProfile(id)
      setData(res)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load business profile'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSuspend = async () => {
    if (!suspendReason.trim()) { addToast('Please provide a reason', 'error'); return }
    setSuspending(true)
    try {
      await suspendBusiness(id, suspendReason)
      addToast('Business suspended', 'success')
      setActionModal(null)
      setSuspendReason('')
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Suspend failed', 'error')
    } finally {
      setSuspending(false)
    }
  }

  const handleSaveField = async (field) => {
    setSaving(true)
    try {
      await updateBusiness(id, { [field]: editValues[field] })
      addToast(`${field} updated`, 'success')
      setEditField(null)
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Business Detail">
        <div className="card p-6 mb-5 animate-pulse">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-white/5" />
            <div className="flex-1">
              <div className="h-6 w-48 bg-white/5 rounded mb-2" />
              <div className="h-4 w-64 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !data) {
    return (
      <Layout title="Business Detail">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="card p-12 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Failed to load business</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      </Layout>
    )
  }

  const { business: biz, revenueSummary, commissionLedger = [], activeAlerts = [], invoiceHistory = [] } = data
  const bStatus = deriveStatus(biz)
  const categoryIcon = { Healthcare: '🏥', Restaurant: '🍽️', 'Real Estate': '🏢', Beauty: '💅', Education: '🎓' }

  // Build revenue chart from invoiceHistory
  const revenueChart = invoiceHistory.slice().reverse().map(inv => ({
    month: inv.month?.slice(5) || '—',
    revenue: inv.total || 0,
  }))

  return (
    <Layout title={biz.name}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft size={14} /> Back to Businesses
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
                  {editField === 'name' ? (
                    <div className="flex items-center gap-2">
                      <input autoFocus value={editValues.name || biz.name}
                        onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveField('name'); if (e.key === 'Escape') setEditField(null) }}
                        className="input-field text-xl py-1 px-2 font-bold" />
                      <button onClick={() => handleSaveField('name')} disabled={saving}
                        className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Check size={13} className="text-emerald-400" />
                      </button>
                      <button onClick={() => setEditField(null)} className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <X size={13} className="text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditField('name'); setEditValues({ name: biz.name }) }} className="group flex items-center gap-2">
                      <h1 className="page-title">{biz.name}</h1>
                      <Edit2 size={13} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1 text-slate-400"><Tag size={12} /> {biz.category}</span>
                  <span className="flex items-center gap-1 text-slate-400"><MapPin size={12} /> {biz.city}</span>
                  <span className="flex items-center gap-1 text-slate-400"><Phone size={12} /> {biz.phone || '—'}</span>
                  <span className="flex items-center gap-1 text-slate-400"><Star size={12} /> {biz.plan?.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx('badge text-xs px-2.5 py-1',
                  bStatus === 'active' ? 'badge-green' : bStatus === 'trial' ? 'badge-yellow' : 'badge-red')}>
                  ● {bStatus}
                </span>
                {bStatus === 'active' && (
                  <button onClick={() => setActionModal('suspend')}
                    className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all">
                    <Ban size={12} /> Suspend
                  </button>
                )}
                <button onClick={fetchData} className="btn-ghost gap-1 text-xs">
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
            </div>

            {/* Revenue Summary */}
            {revenueSummary && (
              <div className="grid grid-cols-5 gap-4 mt-5 pt-4 border-t border-white/[0.05]">
                {[
                  { label: 'Booking Comm.', value: `₹${(revenueSummary.bookingCommissions || 0).toLocaleString()}`, color: 'text-indigo-400' },
                  { label: 'Showup Comm.', value: `₹${(revenueSummary.showupCommissions || 0).toLocaleString()}`, color: 'text-emerald-400' },
                  { label: 'Lead Comm.', value: `₹${(revenueSummary.leadCommissions || 0).toLocaleString()}`, color: 'text-amber-400' },
                  { label: 'Plan Fees', value: `₹${(revenueSummary.planFees || 0).toLocaleString()}`, color: 'text-white' },
                  { label: 'Total Revenue', value: `₹${(revenueSummary.total || 0).toLocaleString()}`, color: 'metric-gold' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="stat-label">{label}</p>
                    <p className={clsx('text-lg font-bold font-display mt-1', color)}>{value}</p>
                  </div>
                ))}
              </div>
            )}
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
            {tab === 'Alerts' && activeAlerts.length > 0 && (
              <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full">{activeAlerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-12 gap-5">
          {/* Left: Info */}
          <div className="col-span-5 space-y-4">
            <div className="card p-5">
              <h4 className="section-title mb-4">Business Info</h4>
              {[
                { label: 'Name', value: biz.name },
                { label: 'Email', value: biz.email },
                { label: 'Phone', value: biz.phone },
                { label: 'City', value: biz.city },
                { label: 'Category', value: biz.category },
                { label: 'Sub-category', value: biz.subCategory || '—' },
                { label: 'Plan', value: biz.plan?.toUpperCase() },
                { label: 'Status', value: bStatus },
                { label: 'Trial Active', value: biz.isTrialActive ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs text-white font-medium">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Revenue Chart */}
          <div className="col-span-7 space-y-4">
            <div className="card p-5">
              <h4 className="section-title mb-4">Revenue by Month (Invoice History)</h4>
              {revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: '#0F1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} dot={false}
                      activeDot={{ r: 5, fill: '#4F46E5', stroke: '#818CF8', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No invoice history yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Commission Ledger Tab */}
      {activeTab === 'Commission Ledger' && (
        <div className="card overflow-hidden">
          {commissionLedger.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No commission records</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Type', 'Amount', 'Status', 'Category', 'Triggered By', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissionLedger.map((c) => (
                    <tr key={c.id} className="border-b border-white/[0.04] table-row-hover">
                      <td className="px-4 py-3">
                        <span className={clsx('badge text-[10px]', { BOOKING: 'badge-indigo', SHOWUP: 'badge-green', LEAD: 'badge-yellow', ADJUSTMENT: 'badge-gray' }[c.type] || 'badge-gray')}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold metric-gold">₹{(c.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('badge text-[10px]', { CONFIRMED: 'badge-green', PENDING: 'badge-indigo', DISPUTED: 'badge-red', WAIVED: 'badge-gray' }[c.status] || 'badge-gray')}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{c.category || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{c.triggeredBy || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : (c.createdAt || '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'Alerts' && (
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="card p-12 text-center text-slate-500 text-sm">No active alerts</div>
          ) : activeAlerts.map(alert => (
            <div key={alert.id} className="card p-4 border border-amber-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertOctagon size={14} className="text-amber-400" />
                    <span className="text-sm font-semibold text-white">{alert.type}</span>
                    <span className="badge badge-yellow text-[10px]">{alert.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">{alert.notes || 'No notes'}</p>
                </div>
                <span className="text-[10px] text-slate-500">
                  {alert.createdAt?.toDate ? alert.createdAt.toDate().toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice History Tab */}
      {activeTab === 'Invoice History' && (
        <div className="card overflow-hidden">
          {invoiceHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No invoice history</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Month', 'Plan', 'Base Fee', 'Commissions', 'Total', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoiceHistory.map(inv => (
                    <tr key={inv.id} className="border-b border-white/[0.04] table-row-hover">
                      <td className="px-4 py-3 text-white font-medium">{inv.month}</td>
                      <td className="px-4 py-3"><span className="badge badge-indigo">{inv.plan?.toUpperCase()}</span></td>
                      <td className="px-4 py-3 text-slate-300">₹{(inv.baseFee || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-300">₹{((inv.bookingCommissions || 0) + (inv.showupCommissions || 0) + (inv.leadCommissions || 0)).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold metric-gold">₹{(inv.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('badge text-[10px]', { PAID: 'badge-green', PENDING: 'badge-indigo', OVERDUE: 'badge-red' }[inv.status] || 'badge-gray')}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Suspend Modal */}
      <Modal isOpen={actionModal === 'suspend'} onClose={() => setActionModal(null)} title="Suspend Business" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Suspending <span className="text-white font-semibold">{biz.name}</span> will disable their access. The owner will be notified via WhatsApp.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Reason *</label>
            <textarea
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              placeholder="Provide a clear reason for suspension..."
              rows={3}
              className="input-field w-full resize-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSuspend} disabled={suspending || !suspendReason.trim()}
              className="flex-1 btn-danger justify-center flex items-center gap-2">
              {suspending ? <><RefreshCw size={13} className="animate-spin" /> Suspending...</> : <><Ban size={13} /> Confirm Suspend</>}
            </button>
            <button onClick={() => setActionModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}