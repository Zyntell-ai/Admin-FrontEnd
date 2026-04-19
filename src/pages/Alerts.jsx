import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { getAlerts, updateAlert } from '../api/admin'
import {
  CheckCircle, AlertOctagon, AlertTriangle, Info,
  Eye, RefreshCw, AlertCircle
} from 'lucide-react'
import clsx from 'clsx'

const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low']
const STATUSES   = ['All', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']
const TYPES      = ['All', 'LOW_CONFIRMATION_RATE', 'PAYMENT_OVERDUE', 'SUSPICIOUS_ACTIVITY', 'TRIAL_EXPIRING']

function SeverityBadge({ severity }) {
  const map = {
    Critical: 'bg-red-500/15 text-red-400 border border-red-500/20',
    High:     'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    Medium:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    Low:      'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  }
  const icons = { Critical: AlertOctagon, High: AlertTriangle, Medium: AlertTriangle, Low: Info }
  const Icon = icons[severity] || Info
  return (
    <span className={clsx('badge gap-1 text-[10px]', map[severity] || map.Low)}>
      <Icon size={10} /> {severity}
    </span>
  )
}

function TypeLabel({ type }) {
  const map = {
    LOW_CONFIRMATION_RATE: { label: 'Low Confirmation Rate', color: 'badge-yellow' },
    PAYMENT_OVERDUE:       { label: 'Payment Overdue',        color: 'badge-red' },
    SUSPICIOUS_ACTIVITY:   { label: 'Suspicious Activity',    color: 'bg-purple-500/15 text-purple-400' },
    TRIAL_EXPIRING:        { label: 'Trial Expiring',          color: 'badge-indigo' },
  }
  const m = map[type] || { label: type, color: 'badge-gray' }
  return <span className={clsx('badge text-[10px]', m.color)}>{m.label}</span>
}

export default function Alerts() {
  const { addToast } = useToast()
  const [alerts, setAlerts]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter]     = useState('OPEN')
  const [typeFilter, setTypeFilter]         = useState('All')
  const [resolveModal, setResolveModal]     = useState(null)
  const [resolveNotes, setResolveNotes]     = useState('')
  const [updating, setUpdating]             = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (statusFilter !== 'All') params.status = statusFilter
      if (typeFilter !== 'All')   params.type = typeFilter
      const data = await getAlerts(params)
      setAlerts(data.alerts || [])
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load alerts'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredAlerts = alerts.filter(a => {
    const matchSev  = severityFilter === 'All' || a.severity === severityFilter
    return matchSev
  })

  const handleResolve = async (status) => {
    if (!resolveModal) return
    setUpdating(true)
    try {
      await updateAlert(resolveModal.id, { status, notes: resolveNotes })
      addToast(`Alert ${status === 'RESOLVED' ? 'resolved' : 'dismissed'} — ${resolveModal.businessName}`, 'success')
      setResolveModal(null)
      setResolveNotes('')
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkInReview = async (alert) => {
    try {
      await updateAlert(alert.id, { status: 'IN_REVIEW', notes: alert.notes || '' })
      addToast(`Marked in review — ${alert.businessName}`, 'success')
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error')
    }
  }

  const criticalCount = alerts.filter(a => a.severity === 'Critical' && a.status === 'OPEN').length
  const openCount     = alerts.filter(a => a.status === 'OPEN').length
  const reviewCount   = alerts.filter(a => a.status === 'IN_REVIEW').length

  return (
    <Layout title="Alerts">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Alerts</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading...' : `${openCount} open · ${criticalCount} critical · ${reviewCount} in review`}
          </p>
        </div>
        <button onClick={fetchData} className="btn-ghost gap-1.5"><RefreshCw size={13} /> Refresh</button>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Open Alerts', value: openCount, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Critical', value: criticalCount, color: 'text-red-400', border: 'border-red-500/20' },
          { label: 'In Review', value: reviewCount, color: 'text-indigo-400', border: 'border-indigo-500/20' },
          { label: 'Total Loaded', value: alerts.length, color: 'text-white', border: '' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={clsx('card p-4 border', border || 'border-white/[0.06]')}>
            <p className="stat-label">{label}</p>
            <p className={clsx('text-2xl font-bold font-display mt-1', color)}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-40 text-xs bg-[#0F1629]">
          {STATUSES.map(s => <option key={s} value={s} className="bg-[#0F1629]">{s === 'All' ? 'All Statuses' : s}</option>)}
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="input-field w-36 text-xs bg-[#0F1629]">
          {SEVERITIES.map(s => <option key={s} value={s} className="bg-[#0F1629]">{s === 'All' ? 'All Severity' : s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field w-52 text-xs bg-[#0F1629]">
          {TYPES.map(t => <option key={t} value={t} className="bg-[#0F1629]">
            {t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}
          </option>)}
        </select>
        <p className="text-xs text-slate-500 ml-auto">{filteredAlerts.length} shown</p>
      </div>

      {/* Alert List */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1"><div className="h-4 w-48 bg-white/5 rounded mb-2" /><div className="h-3 w-64 bg-white/5 rounded" /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card p-12 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-white mb-1">Failed to load alerts</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      )}

      {!loading && !error && filteredAlerts.length === 0 && (
        <div className="card p-12 text-center">
          <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">No alerts matching filters</p>
          <p className="text-xs text-slate-500">Try changing your filter criteria</p>
        </div>
      )}

      {!loading && !error && filteredAlerts.length > 0 && (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div key={alert.id}
              className={clsx('card p-5 border transition-all', {
                'border-red-500/20':    alert.severity === 'Critical',
                'border-orange-500/20': alert.severity === 'High',
                'border-amber-500/20':  alert.severity === 'Medium',
                'border-slate-500/20':  alert.severity === 'Low' || !alert.severity,
              })}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-sm font-semibold text-white">{alert.businessName}</span>
                    {alert.severity && <SeverityBadge severity={alert.severity} />}
                    <TypeLabel type={alert.type} />
                    <span className={clsx('badge text-[10px]', {
                      OPEN: 'badge-yellow', IN_REVIEW: 'badge-indigo',
                      RESOLVED: 'badge-green', DISMISSED: 'badge-gray'
                    }[alert.status] || 'badge-gray')}>{alert.status}</span>
                  </div>
                  {alert.notes && (
                    <p className="text-xs text-slate-400 mb-1">{alert.notes}</p>
                  )}
                  {alert.assignedTo && (
                    <p className="text-[10px] text-slate-500">Assigned to: {alert.assignedTo}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-slate-500">
                    {alert.createdAt?.toDate ? alert.createdAt.toDate().toLocaleDateString() : (alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : '—')}
                  </span>
                  {(alert.status === 'OPEN' || alert.status === 'IN_REVIEW') && (
                    <>
                      {alert.status === 'OPEN' && (
                        <button onClick={() => handleMarkInReview(alert)}
                          className="text-xs text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-all">
                          In Review
                        </button>
                      )}
                      <button onClick={() => { setResolveModal(alert); setResolveNotes(alert.notes || '') }}
                        className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                        <CheckCircle size={11} /> Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      <Modal isOpen={!!resolveModal} onClose={() => { setResolveModal(null); setResolveNotes('') }}
        title={`Resolve Alert — ${resolveModal?.businessName}`} size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TypeLabel type={resolveModal?.type} />
            {resolveModal?.severity && <SeverityBadge severity={resolveModal.severity} />}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Resolution Notes</label>
            <textarea value={resolveNotes} onChange={e => setResolveNotes(e.target.value)}
              placeholder="Describe what was done to resolve this alert..."
              rows={3} className="input-field w-full resize-none text-sm" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleResolve('RESOLVED')} disabled={updating}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all">
              {updating ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />} Resolve
            </button>
            <button onClick={() => handleResolve('DISMISSED')} disabled={updating}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all">
              Dismiss
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}