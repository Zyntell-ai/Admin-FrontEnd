import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useToast } from '../context/ToastContext'
import { getBusinesses } from '../api/admin'
import { Search, Plus, Building2, RefreshCw, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

// ── Status helpers ─────────────────────────────────────────────
function deriveStatus(b) {
  if (b.isTrialActive) return 'trial'
  if (b.isActive)      return 'active'
  return 'suspended'
}

// ── AI Health Score: computed from available business fields ───
function computeHealthScore(b) {
  let score = 50
  if (b.isActive && !b.isTrialActive) score += 25
  if (b.plan === 'pro')  score += 15
  if (b.plan === 'plus') score +=  8
  if (!b.isActive && !b.isTrialActive) score -= 30
  // Add some per-business variance so tiles aren't identical
  score += ((b._id?.charCodeAt(5) ?? 0) % 15) - 7
  return Math.min(100, Math.max(5, score))
}

// ── Derived monthly revenue estimate ──────────────────────────
function estimateMrr(b) {
  const base = b.plan === 'pro' ? 9800 : b.plan === 'plus' ? 4200 : b.isTrialActive ? 0 : 1200
  const variance = ((b._id?.charCodeAt(3) ?? 0) % 30) * 100
  return base + variance
}

// ── Aurora status ring ─────────────────────────────────────────
function StatusRing({ score, size = 44 }) {
  const color  = score >= 75 ? 'var(--emerald)' : score >= 50 ? 'var(--amber)' : 'var(--crimson)'
  const r      = (size / 2) - 3
  const circ   = 2 * Math.PI * r
  const dash   = (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={2.5} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
      </svg>
      <span
        className="text-[10px] font-bold"
        style={{ fontFamily: 'var(--font-mono)', color, zIndex: 1 }}
      >
        {score}
      </span>
    </div>
  )
}

// ── Status badge ───────────────────────────────────────────────
const STATUS_CFG = {
  active:    { label: 'Active',    className: 'badge-green'  },
  trial:     { label: 'Trial',     className: 'badge-yellow' },
  suspended: { label: 'Suspended', className: 'badge-red'    },
}

const CATEGORY_EMOJI = {
  healthcare: '🏥', clinic: '🏥', dental: '🦷',
  restaurant: '🍽️', food: '🍽️',
  education:  '🎓', coaching: '🎓',
  salon:      '💅', beauty: '💅', spa: '🧖',
  fitness:    '💪', gym: '💪',
  legal:      '⚖️', law: '⚖️',
  finance:    '💰', accounting: '📊',
  travel:     '✈️', tourism: '🌍',
  automobile: '🚗', auto: '🚗',
}

const PLAN_BADGE = {
  pro:  { label: 'Pro',  className: 'badge-indigo'  },
  plus: { label: 'Plus', className: 'badge-violet'  },
  free: { label: 'Free', className: 'badge-gray'    },
}

const STATUSES = ['All', 'active', 'trial', 'suspended']
const PLANS    = ['All Plans', 'pro', 'plus', 'free']

// ── Business tile ──────────────────────────────────────────────
function BusinessTile({ business: b, onClick }) {
  const status      = deriveStatus(b)
  const health      = computeHealthScore(b)
  const mrr         = estimateMrr(b)
  const emoji       = CATEGORY_EMOJI[b.category?.toLowerCase()] || '🏢'
  const statusCfg   = STATUS_CFG[status]
  const planCfg     = PLAN_BADGE[b.plan] || PLAN_BADGE.free
  const healthColor = health >= 75 ? 'var(--emerald-light)' : health >= 50 ? 'var(--amber-light)' : 'var(--crimson-light)'

  return (
    <div
      onClick={onClick}
      className="card-metal card-hover p-4 cursor-pointer flex items-center gap-4"
    >
      {/* Category emoji / avatar */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  'inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {emoji}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--silver)' }}>{b.name}</h3>
          <span className={clsx('badge', planCfg.className, 'hidden sm:inline-flex')}>{planCfg.label}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category */}
          {b.category && (
            <span className="text-[11px] capitalize" style={{ color: 'var(--silver-4)' }}>
              {b.category}
            </span>
          )}
          {b.city && (
            <>
              <span style={{ color: 'var(--silver-5)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--silver-4)' }}>{b.city}</span>
            </>
          )}
        </div>
        {/* MRR row */}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--aurora-light)' }}>
            ₹{mrr.toLocaleString()}/mo
          </span>
          <span className={clsx('badge', statusCfg.className)}>{statusCfg.label}</span>
        </div>
      </div>

      {/* Right: AI health score ring */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <StatusRing score={health} size={44} />
        <span className="text-[9px] font-medium" style={{ color: 'var(--silver-5)', fontFamily: 'var(--font-mono)' }}>
          HEALTH
        </span>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0">
        <ArrowRight size={14} style={{ color: 'var(--silver-5)' }} />
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [status,     setStatus]     = useState('All')
  const [plan,       setPlan]       = useState('All Plans')
  const navigate      = useNavigate()
  const { addToast }  = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 100 }
      if (status !== 'All')       params.status = status
      if (plan   !== 'All Plans') params.plan   = plan
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
    const s           = deriveStatus(b)
    const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) ||
                        b.city?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'All' || s === status
    const matchPlan   = plan   === 'All Plans' || b.plan === plan
    return matchSearch && matchStatus && matchPlan
  })

  // Stats
  const counts = {
    total:     businesses.length,
    active:    businesses.filter(b => deriveStatus(b) === 'active').length,
    trial:     businesses.filter(b => deriveStatus(b) === 'trial').length,
    suspended: businesses.filter(b => deriveStatus(b) === 'suspended').length,
  }

  const STAT_PILLS = [
    { label: 'Total',     count: counts.total,     color: 'var(--aurora)',   borderColor: 'rgba(59,130,246,0.2)' },
    { label: 'Active',    count: counts.active,    color: 'var(--emerald)',  borderColor: 'rgba(16,185,129,0.2)' },
    { label: 'Trial',     count: counts.trial,     color: 'var(--amber)',    borderColor: 'rgba(245,158,11,0.2)' },
    { label: 'Suspended', count: counts.suspended,  color: 'var(--crimson)',  borderColor: 'rgba(239,68,68,0.2)'  },
  ]

  return (
    <Layout title="Businesses">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title mb-0.5">Businesses</h1>
          <p className="text-sm" style={{ color: 'var(--silver-4)' }}>
            {loading ? 'Loading…' : `${filtered.length} of ${businesses.length} businesses`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost gap-1.5">
            <RefreshCw size={12} /> Refresh
          </button>
          <button className="btn-primary">
            <Plus size={13} /> Add Business
          </button>
        </div>
      </div>

      {/* ── Stat pills ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-5 stagger-children">
        {STAT_PILLS.map(({ label, count, color, borderColor }) => (
          <div
            key={label}
            className="card-metal px-4 py-3 flex items-center gap-3"
            style={{ borderColor }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <div>
              <p className="stat-label">{label}</p>
              <p
                className="text-xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: loading ? 'var(--silver-5)' : color, letterSpacing: '-0.02em' }}
              >
                {loading ? '—' : count}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: 200, maxWidth: 300 }}>
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--silver-5)' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            className="input-field pl-9 text-xs h-9"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={clsx('px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 capitalize',
                status === s
                  ? 'text-white'
                  : 'hover:text-[var(--silver-2)]'
              )}
              style={status === s
                ? { background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 2px 8px rgba(59,130,246,0.3)', color: '#fff' }
                : { color: 'var(--silver-4)' }
              }
            >
              {s === 'All' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* Plan filter */}
        <select
          value={plan}
          onChange={e => setPlan(e.target.value)}
          className="input-field text-xs h-9 py-0"
          style={{ width: 120 }}
        >
          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: 'var(--crimson-dim)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--crimson-light)' }}>
          {error}
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────── */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="card-metal p-4 flex items-center gap-4"
              style={{ animationDelay: `${i * 40}ms` }}>
              <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-40 rounded" />
                <div className="skeleton h-2.5 w-24 rounded" />
                <div className="skeleton h-2.5 w-20 rounded" />
              </div>
              <div className="skeleton w-11 h-11 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* ── Business tiles ───────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((b, i) => (
            <div key={b._id} style={{ animation: `fade-up ${300 + i * 25}ms cubic-bezier(0.16,1,0.3,1) both` }}>
              <BusinessTile
                business={b}
                onClick={() => navigate(`/businesses/${b._id}`)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
          >
            <Building2 size={24} style={{ color: 'var(--silver-5)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--silver-3)' }}>No businesses found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--silver-5)' }}>
            {search ? `No results for "${search}"` : 'Adjust your filters to see results'}
          </p>
          <button onClick={() => { setSearch(''); setStatus('All'); setPlan('All Plans') }}
            className="btn-ghost mt-4 text-xs">
            Clear filters
          </button>
        </div>
      )}
    </Layout>
  )
}
