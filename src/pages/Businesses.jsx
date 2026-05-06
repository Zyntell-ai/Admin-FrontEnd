import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useToast } from '../context/ToastContext'
import { getBusinesses } from '../api/admin'
import { Search, Plus, ExternalLink, Building2, RefreshCw, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

// ─── Category colour map (mirrors client's categoryTheme.js, no import needed) ─
// Keys are lowercased backend category values
const CAT_THEMES = {
  healthcare:    { accent: '#7B2D8B', a15: 'rgba(123,45,139,0.15)', a08: 'rgba(123,45,139,0.08)', border: 'rgba(123,45,139,0.35)', glow: 'rgba(123,45,139,0.12)', chip: '#F1E6FF', chipText: '#7B2D8B', label: 'Orchid Care' },
  clinic:        { $ref: 'healthcare' },
  restaurant:    { accent: '#9C6644', a15: 'rgba(156,102,68,0.15)', a08: 'rgba(156,102,68,0.08)', border: 'rgba(156,102,68,0.40)', glow: 'rgba(156,102,68,0.12)', chip: '#EDE0D4', chipText: '#9C6644', label: 'Café Latte' },
  food:          { $ref: 'restaurant' },
  'real estate': { accent: '#C9ADA7', a15: 'rgba(74,78,105,0.20)', a08: 'rgba(74,78,105,0.10)', border: 'rgba(74,78,105,0.45)', glow: 'rgba(74,78,105,0.14)', chip: '#4A4E69', chipText: '#F2E9E4', label: 'Slate & Rose' },
  realestate:    { $ref: 'real estate' },
  education:     { accent: '#F4A11A', a15: 'rgba(244,161,26,0.15)', a08: 'rgba(244,161,26,0.08)', border: 'rgba(244,161,26,0.40)', glow: 'rgba(244,161,26,0.12)', chip: '#7B4F12', chipText: '#FFF9EF', label: 'Amber Scholar' },
  coaching:      { $ref: 'education' },
  salon:         { accent: '#C9184A', a15: 'rgba(201,24,74,0.15)', a08: 'rgba(201,24,74,0.08)', border: 'rgba(201,24,74,0.35)', glow: 'rgba(201,24,74,0.10)', chip: '#F8D7DA', chipText: '#C9184A', label: 'Rose Blush' },
  beauty:        { $ref: 'salon' },
  spa:           { $ref: 'salon' },
  fitness:       { accent: '#0369A1', a15: 'rgba(3,105,161,0.15)', a08: 'rgba(3,105,161,0.08)', border: 'rgba(3,105,161,0.35)', glow: 'rgba(3,105,161,0.12)', chip: '#E0F2FE', chipText: '#0369A1', label: 'Aqua Athlete' },
  gym:           { $ref: 'fitness' },
  legal:         { accent: '#8B4513', a15: 'rgba(139,69,19,0.15)', a08: 'rgba(139,69,19,0.08)', border: 'rgba(139,69,19,0.35)', glow: 'rgba(139,69,19,0.10)', chip: '#FAF0E6', chipText: '#8B4513', label: 'Leather Bound' },
  law:           { $ref: 'legal' },
  insurance:     { $ref: 'legal' },
  travel:        { accent: '#AB83A1', a15: 'rgba(106,5,114,0.18)', a08: 'rgba(106,5,114,0.10)', border: 'rgba(106,5,114,0.40)', glow: 'rgba(106,5,114,0.12)', chip: '#6A0572', chipText: '#FDF4FF', label: 'Aurora' },
  tourism:       { $ref: 'travel' },
  construction:  { accent: '#7A6652', a15: 'rgba(122,102,82,0.15)', a08: 'rgba(122,102,82,0.08)', border: 'rgba(122,102,82,0.30)', glow: 'rgba(122,102,82,0.10)', chip: '#F5F0EB', chipText: '#7A6652', label: 'Sandstone' },
  architecture:  { $ref: 'construction' },
  homeservice:   { $ref: 'construction' },
  finance:       { accent: '#B5985A', a15: 'rgba(181,152,90,0.15)', a08: 'rgba(181,152,90,0.08)', border: 'rgba(181,152,90,0.35)', glow: 'rgba(181,152,90,0.12)', chip: '#F8F6F2', chipText: '#B5985A', label: 'Private Wealth' },
  accounting:    { $ref: 'finance' },
  automobile:    { accent: '#DC2626', a15: 'rgba(220,38,38,0.15)', a08: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.40)', glow: 'rgba(220,38,38,0.12)', chip: '#1A1A1A', chipText: '#F8F8F8', label: 'Racing Red' },
  auto:          { $ref: 'automobile' },
  garage:        { $ref: 'automobile' },
}

const DEFAULT_THEME = { accent: '#6366F1', a15: 'rgba(99,102,241,0.15)', a08: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.30)', glow: 'rgba(99,102,241,0.10)', chip: '#1e1e3f', chipText: '#818cf8', label: '' }

function getCatTheme(category) {
  if (!category) return DEFAULT_THEME
  const key = category.toLowerCase()
  const entry = CAT_THEMES[key]
  if (!entry) return DEFAULT_THEME
  if (entry.$ref) return CAT_THEMES[entry.$ref] || DEFAULT_THEME
  return entry
}

// ─── Category emoji map ──────────────────────────────────────────────────────
const CATEGORY_ICON = {
  healthcare: '🏥', clinic: '🏥',
  restaurant: '🍽️', food: '🍽️',
  'real estate': '🏢', realestate: '🏢',
  education: '🎓', coaching: '🎓',
  salon: '💅', beauty: '💅', spa: '🧖',
  fitness: '💪', gym: '💪',
  legal: '⚖️', law: '⚖️', insurance: '🛡️',
  travel: '✈️', tourism: '🌍',
  construction: '🏗️', architecture: '📐', homeservice: '🔧',
  finance: '💰', accounting: '📊',
  automobile: '🚗', auto: '🚗', garage: '🔩',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUSES = ['All', 'active', 'trial', 'suspended']
const PLANS    = ['All Plans', 'pro', 'plus', 'free']

function deriveStatus(b) {
  if (b.isTrialActive) return 'trial'
  if (b.isActive)      return 'active'
  return 'suspended'
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Businesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [status, setStatus]         = useState('All')
  const [plan, setPlan]             = useState('All Plans')
  const navigate  = useNavigate()
  const { addToast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: 100 }
      if (status !== 'All')      params.status = status
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
    const s = deriveStatus(b)
    const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) ||
                        b.city?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'All' || s === status
    const matchPlan   = plan   === 'All Plans' || b.plan === plan
    return matchSearch && matchStatus && matchPlan
  })

  return (
    <Layout title="Businesses">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Businesses</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${filtered.length} businesses across all categories`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn-primary">
            <Plus size={14} /> Add Business
          </button>
        </div>
      </div>

      {/* ── Stat Strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',     value: businesses.length,                                             color: 'text-white',        border: 'border-white/[0.06]' },
          { label: 'Active',    value: businesses.filter(b => deriveStatus(b) === 'active').length,    color: 'text-emerald-400',   border: 'border-emerald-500/20' },
          { label: 'Trial',     value: businesses.filter(b => deriveStatus(b) === 'trial').length,     color: 'text-amber-400',     border: 'border-amber-500/20' },
          { label: 'Suspended', value: businesses.filter(b => deriveStatus(b) === 'suspended').length, color: 'text-red-400',       border: 'border-red-500/20' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={clsx('card p-4 flex items-center gap-3 border', border)}>
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

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            className="input-field pl-8 text-xs"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input-field w-36 text-xs bg-[#0F1629]">
          {STATUSES.map(s => (
            <option key={s} value={s} className="bg-[#0F1629]">
              {s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select value={plan} onChange={e => setPlan(e.target.value)} className="input-field w-40 text-xs bg-[#0F1629]">
          {PLANS.map(p => (
            <option key={p} value={p} className="bg-[#0F1629]">
              {p === 'All Plans' ? 'All Plans' : p.toUpperCase()}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Loading skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-white/5 rounded mb-1" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="bg-white/[0.03] rounded-lg p-2.5 h-14" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="card p-12 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Failed to load businesses</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── Empty ──────────────────────────────────────────────────────────── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Building2 size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">No businesses found</p>
          <p className="text-xs text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* ── Business Cards ─────────────────────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(b => {
            const bStatus = deriveStatus(b)
            const theme   = getCatTheme(b.category)
            const icon    = CATEGORY_ICON[b.category?.toLowerCase()] || '🏢'

            return (
              <div
                key={b.id}
                onClick={() => navigate(`/businesses/${b.id}`)}
                className="card card-hover p-5 cursor-pointer group animate-fade-in relative overflow-hidden"
                style={{
                  // Left accent bar
                  borderLeft: `3px solid ${theme.accent}`,
                  // Subtle glow around the card on hover via box-shadow (CSS handles :hover via Tailwind,
                  // so we use a CSS custom property trick with inline style for the base shadow)
                  '--cat-glow': theme.glow,
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.04), inset 0 0 24px ${theme.a08}`,
                }}
              >
                {/* Ambient colour wash in top-right corner */}
                <div
                  className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-40"
                  style={{ background: theme.accent }}
                />

                {/* ── Card Header ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between mb-4 relative">
                  <div className="flex items-center gap-3">
                    {/* Category icon with theme background */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border"
                      style={{
                        background: theme.a15,
                        borderColor: theme.border,
                      }}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0">
                      <h3
                        className="text-sm font-semibold text-white flex items-center gap-1 truncate transition-colors"
                        style={{ '--tw-text-opacity': 1 }}
                      >
                        <span className="group-hover:text-[var(--cat-accent)] transition-colors truncate"
                              style={{ '--cat-accent': theme.accent }}>
                          {b.name}
                        </span>
                        <ExternalLink size={10} className="text-slate-600 flex-shrink-0" />
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {b.city} · {b.category}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={clsx(
                    'badge capitalize text-[10px] flex-shrink-0',
                    bStatus === 'active'    ? 'badge-green' :
                    bStatus === 'trial'     ? 'badge-yellow' :
                                              'badge-red'
                  )}>
                    {bStatus}
                  </span>
                </div>

                {/* ── Info Row ────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 mb-4 relative">
                  {[
                    { label: 'Email', value: b.email },
                    { label: 'Phone', value: b.phone },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-lg p-2.5"
                      style={{ background: theme.a08 }}
                    >
                      <p
                        className="text-[9px] uppercase tracking-wider mb-0.5 font-medium"
                        style={{ color: theme.accent }}
                      >
                        {label}
                      </p>
                      <p className="text-xs font-medium text-slate-300 truncate">{value || '—'}</p>
                    </div>
                  ))}
                </div>

                {/* ── Footer: Plan + Category theme chip ──────────────────── */}
                <div
                  className="pt-3 border-t flex items-center justify-between relative"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  {/* Plan badge */}
                  <span className={clsx('badge text-[10px]', {
                    pro:  'bg-gold-muted text-gold',
                    plus: 'badge-indigo',
                    free: 'badge-gray',
                  }[b.plan] || 'badge-gray')}>
                    {b.plan?.toUpperCase() || 'FREE'}
                  </span>

                  {/* Category theme chip — mirrors Morning Paper label */}
                  {theme.label && (
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full tracking-wide"
                      style={{
                        background: theme.chip,
                        color:      theme.chipText,
                      }}
                    >
                      {theme.label}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}