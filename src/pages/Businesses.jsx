import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useToast } from '../context/ToastContext'
import { getBusinesses } from '../api/admin'
import { Search, Plus, ExternalLink, Building2, RefreshCw, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const STATUSES = ['All', 'active', 'trial', 'suspended']
const PLANS = ['All Plans', 'pro', 'plus', 'free']

// Map backend fields to a normalised status string
function deriveStatus(b) {
  if (b.isTrialActive) return 'trial'
  if (b.isActive) return 'active'
  return 'suspended'
}

export default function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [status, setStatus]         = useState('All')
  const [plan, setPlan]             = useState('All Plans')
  const navigate = useNavigate()
  const { addToast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 100 }
      if (status !== 'All') params.status = status
      if (plan !== 'All Plans') params.plan = plan
      const data = await getBusinesses(params)
      setBusinesses(data.businesses || [])
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load businesses'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [status, plan])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = businesses.filter(b => {
    const s = deriveStatus(b)
    const matchSearch =
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.city?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'All' || s === status
    const matchPlan   = plan === 'All Plans' || b.plan === plan
    return matchSearch && matchStatus && matchPlan
  })

  const categoryIcon = {
    Healthcare: '🏥', Restaurant: '🍽️',
    'Real Estate': '🏢', Beauty: '💅', Education: '🎓',
  }

  return (
    <Layout title="Businesses">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Businesses</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading...' : `${filtered.length} businesses across all categories`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost gap-1.5"><RefreshCw size={13} /> Refresh</button>
          <button className="btn-primary"><Plus size={14} /> Add Business</button>
        </div>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: businesses.length, color: 'text-white', border: '' },
          { label: 'Active', value: businesses.filter(b => deriveStatus(b) === 'active').length, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Trial', value: businesses.filter(b => deriveStatus(b) === 'trial').length, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Suspended', value: businesses.filter(b => deriveStatus(b) === 'suspended').length, color: 'text-red-400', border: 'border-red-500/20' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={clsx('card p-4 flex items-center gap-3 border', border || 'border-white/[0.06]')}>
            <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="stat-label">{label} Businesses</p>
              <p className={clsx('text-xl font-bold font-display', color)}>{loading ? '—' : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or city..."
            className="input-field pl-8 text-xs"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input-field w-36 text-xs bg-[#0F1629]">
          {STATUSES.map(s => (
            <option key={s} value={s} className="bg-[#0F1629]">{s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={plan} onChange={e => setPlan(e.target.value)} className="input-field w-40 text-xs bg-[#0F1629]">
          {PLANS.map(p => (
            <option key={p} value={p} className="bg-[#0F1629]">{p === 'All Plans' ? 'All Plans' : p.toUpperCase()}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Loading / Error / Empty */}
      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl" />
                <div className="flex-1"><div className="h-4 w-32 bg-white/5 rounded mb-1" /><div className="h-3 w-24 bg-white/5 rounded" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">{Array.from({ length: 3 }).map((_, j) => <div key={j} className="bg-white/[0.03] rounded-lg p-2.5 h-14" />)}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card p-12 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Failed to load businesses</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Building2 size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">No businesses found</p>
          <p className="text-xs text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(b => {
            const bStatus = deriveStatus(b)
            return (
              <div
                key={b.id}
                onClick={() => navigate(`/businesses/${b.id}`)}
                className="card card-hover p-5 cursor-pointer group animate-fade-in"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-lg flex-shrink-0">
                      {categoryIcon[b.category] || '🏢'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1 truncate">
                        {b.name}
                        <ExternalLink size={10} className="text-slate-600 flex-shrink-0" />
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {b.city} · {b.category}
                      </p>
                    </div>
                  </div>
                  <span className={clsx(
                    'badge capitalize text-[10px] flex-shrink-0',
                    bStatus === 'active' ? 'badge-green' : bStatus === 'trial' ? 'badge-yellow' : 'badge-red'
                  )}>
                    {bStatus}
                  </span>
                </div>

                {/* Info Row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/[0.03] rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-xs font-medium text-slate-300 truncate">{b.email || '—'}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-2.5">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-xs font-medium text-slate-300">{b.phone || '—'}</p>
                  </div>
                </div>

                {/* Plan + sub-category */}
                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className={clsx('badge text-[10px]', {
                    pro: 'bg-gold-muted text-gold',
                    plus: 'badge-indigo',
                    free: 'badge-gray',
                  }[b.plan] || 'badge-gray')}>
                    {b.plan?.toUpperCase() || 'FREE'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {b.subCategory || b.category || '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}