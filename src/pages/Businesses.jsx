import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { businessStats, businesses } from '../data/mockData'
import { Search, Plus, ExternalLink, Building2 } from 'lucide-react'
import clsx from 'clsx'

const STATUSES = ['All', 'Active', 'Trial', 'Suspended']
const PLANS = ['All Plans', 'pro', 'growth', 'starter', 'trial']

export default function Businesses() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [plan, setPlan] = useState('All Plans')
  const navigate = useNavigate()

  // Merge businessStats (has booking numbers) with businesses (has plan/status detail)
  const merged = businessStats.map(stat => {
    const biz = businesses.find(b => b.id === stat.businessId) || {}
    return { ...stat, plan: biz.plan || stat.plan, locality: biz.locality || '' }
  })

  const filtered = merged.filter(b => {
    const matchSearch =
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      status === 'All' || b.status === status.toLowerCase()
    const matchPlan =
      plan === 'All Plans' || b.plan === plan
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
            {filtered.length} businesses across all categories
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={14} /> Add Business
        </button>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total',
            value: merged.length,
            color: 'text-white',
            border: '',
          },
          {
            label: 'Active',
            value: merged.filter(b => b.status === 'active').length,
            color: 'text-emerald-400',
            border: 'border-emerald-500/20',
          },
          {
            label: 'Trial',
            value: merged.filter(b => b.status === 'trial').length,
            color: 'text-amber-400',
            border: 'border-amber-500/20',
          },
          {
            label: 'Suspended',
            value: merged.filter(b => b.status === 'suspended').length,
            color: 'text-red-400',
            border: 'border-red-500/20',
          },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={clsx('card p-4 flex items-center gap-3 border', border || 'border-white/[0.06]')}>
            <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="stat-label">{label} Businesses</p>
              <p className={clsx('text-xl font-bold font-display', color)}>{value}</p>
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
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="input-field w-36 text-xs bg-[#0F1629]"
        >
          {STATUSES.map(s => (
            <option key={s} value={s} className="bg-[#0F1629]">{s}</option>
          ))}
        </select>
        <select
          value={plan}
          onChange={e => setPlan(e.target.value)}
          className="input-field w-40 text-xs bg-[#0F1629]"
        >
          {PLANS.map(p => (
            <option key={p} value={p} className="bg-[#0F1629]">
              {p === 'All Plans' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Business Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">No businesses found</p>
          <p className="text-xs text-slate-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(b => (
            <div
              key={b.businessId}
              onClick={() => navigate(`/businesses/${b.businessId}`)}
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
                      {b.businessName}
                      <ExternalLink size={10} className="text-slate-600 flex-shrink-0" />
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {b.city} · {b.category}
                    </p>
                  </div>
                </div>
                <span className={clsx(
                  'badge capitalize text-[10px] flex-shrink-0',
                  b.status === 'active'
                    ? 'badge-green'
                    : b.status === 'trial'
                    ? 'badge-yellow'
                    : 'badge-red'
                )}>
                  {b.status}
                </span>
              </div>

              {/* KPI Row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Bookings</p>
                  <p className="text-sm font-bold text-white">{b.totalBookings}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Revenue</p>
                  <p className="text-sm font-bold metric-gold">
                    ₹{(b.totalRevenue / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Show-up</p>
                  <p className={clsx(
                    'text-sm font-bold',
                    b.showUpRate >= 90
                      ? 'text-emerald-400'
                      : b.showUpRate >= 80
                      ? 'text-amber-400'
                      : 'text-red-400'
                  )}>
                    {b.showUpRate}%
                  </p>
                </div>
              </div>

              {/* Anomaly bar + plan */}
              <div className="pt-3 border-t border-white/[0.05] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Anomaly rate</span>
                  <span className={clsx(
                    'text-[10px] font-semibold',
                    b.anomalyPct > 15 ? 'text-red-400' : b.anomalyPct > 10 ? 'text-amber-400' : 'text-emerald-400'
                  )}>
                    {b.anomalyPct}%
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    className={clsx(
                      'h-1.5 rounded-full transition-all',
                      b.anomalyPct > 15 ? 'bg-red-500' : b.anomalyPct > 10 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${Math.min(b.anomalyPct * 3, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className={clsx('badge text-[10px]', {
                    pro: 'bg-gold-muted text-gold',
                    growth: 'badge-indigo',
                    starter: 'badge-gray',
                    trial: 'badge-yellow',
                  }[b.plan] || 'badge-gray')}>
                    {b.plan?.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ₹{b.commission.toLocaleString()} commission
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}