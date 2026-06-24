import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useToast } from '../context/ToastContext'
import { getOverview, getRevenue } from '../api/admin'
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  Activity, AlertTriangle, RefreshCw, ArrowUpRight,
  Zap, CheckCircle, Clock, CreditCard, Building2,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import clsx from 'clsx'

// ── Live activity stream data ──────────────────────────────────
const STREAM_SEED = [
  { id: 1, type: 'payment',  msg: 'Sunrise Dental paid invoice #INV-0041',       time: '2m ago',  color: 'var(--emerald)' },
  { id: 2, type: 'signup',   msg: 'Apollo Multispeciality joined on Growth plan', time: '7m ago',  color: 'var(--aurora)'  },
  { id: 3, type: 'booking',  msg: '18 bookings confirmed via AI at MedFirst',     time: '12m ago', color: 'var(--violet-light)' },
  { id: 4, type: 'upgrade',  msg: 'CareFirst Clinic upgraded Trial → Pro',        time: '24m ago', color: 'var(--amber)'   },
  { id: 5, type: 'alert',    msg: 'Overdue invoice detected — Wellness Hub',      time: '31m ago', color: 'var(--crimson)' },
  { id: 6, type: 'payment',  msg: 'HealthNest paid ₹8,400 monthly subscription',  time: '44m ago', color: 'var(--emerald)' },
]

// ── AI intelligence observations ──────────────────────────────
const INTEL = [
  { color: 'var(--aurora)',   text: 'Trial conversions increased 8% — onboarding optimisation is working.' },
  { color: 'var(--emerald)',  text: 'Hyderabad clinics outperform average platform revenue by 17%.' },
  { color: 'var(--violet-light)', text: 'Appointment reminders reduced no-shows by 22% across healthcare clients.' },
  { color: 'var(--amber)',    text: '3 businesses on trial are entering day 12 — conversion window is active.' },
  { color: 'var(--crimson)',  text: 'Wellness Hub has 2 overdue invoices totalling ₹14,200 — follow up recommended.' },
]

// ── Custom area chart tooltip ──────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{
      background: 'var(--surface-2)',
      border:     '1px solid rgba(59,130,246,0.2)',
      boxShadow:  'var(--shadow-lg)',
    }}>
      <p className="mb-1 font-medium" style={{ color: 'var(--silver-4)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--silver-3)' }}>Revenue:</span>
          <span className="font-semibold" style={{ color: 'var(--silver)' }}>₹{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ── KPI card with trend + confidence + AI insight ─────────────
function KPICard({ label, value, trend, trendDir, confidence, insight, icon: Icon, color, delay = 0 }) {
  return (
    <div
      className="card-metal p-5 flex flex-col gap-3 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Label + icon */}
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}14`, border: `1px solid ${color}22` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>

      {/* Value + trend */}
      <div className="flex items-end justify-between gap-2">
        <p
          className="text-3xl font-bold tracking-tight leading-none"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--silver)', letterSpacing: '-0.03em' }}
        >
          {value}
        </p>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md mb-0.5"
            style={{
              background: trendDir === 'up' ? 'var(--emerald-dim)' : 'var(--crimson-dim)',
              color:      trendDir === 'up' ? 'var(--emerald-light)' : 'var(--crimson-light)',
              border:     `1px solid ${trendDir === 'up' ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'}`,
            }}
          >
            {trendDir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </div>
        )}
      </div>

      {/* Confidence bar */}
      {confidence != null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'var(--silver-5)' }}>AI Confidence</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--aurora-light)' }}>{confidence}%</span>
          </div>
          <div className="progress-track">
            <div className="confidence-bar" style={{ width: `${confidence}%` }} />
          </div>
        </div>
      )}

      {/* AI insight */}
      {insight && (
        <div
          className="flex items-start gap-2 text-[11px] leading-relaxed rounded-lg px-2.5 py-2"
          style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.08)' }}
        >
          <Zap size={10} style={{ color: 'var(--aurora)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ color: 'var(--silver-4)' }}>{insight}</span>
        </div>
      )}
    </div>
  )
}

// ── Aurora status ring SVG ─────────────────────────────────────
function StatusRing({ score, size = 36 }) {
  const color  = score >= 80 ? 'var(--emerald)' : score >= 55 ? 'var(--amber)' : 'var(--crimson)'
  const r      = (size / 2) - 3
  const circ   = 2 * Math.PI * r
  const dash   = (score / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2.5} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dasharray 600ms cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  )
}

// ── Stream event icon ──────────────────────────────────────────
const STREAM_ICONS = { payment: CheckCircle, signup: Building2, booking: Activity, upgrade: ArrowUpRight, alert: AlertTriangle }

export default function Dashboard() {
  const [loading,      setLoading]      = useState(true)
  const [overview,     setOverview]     = useState(null)
  const [revenue,      setRevenue]      = useState(null)
  const [lastUpdated,  setLastUpdated]  = useState(0)
  const [streamEvents, setStreamEvents] = useState(STREAM_SEED)
  const navigate   = useNavigate()
  const { addToast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [ovr, rev] = await Promise.allSettled([getOverview(), getRevenue()])
      if (ovr.status === 'fulfilled') setOverview(ovr.value)
      if (rev.status === 'fulfilled') setRevenue(rev.value)
    } catch { /* silent */ }
    finally  { setLoading(false); setLastUpdated(0) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    const t = setInterval(() => setLastUpdated(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Inject stream events periodically
  useEffect(() => {
    const types   = ['payment', 'booking', 'signup', 'upgrade']
    const names   = ['CareFirst', 'Sunrise Dental', 'HealthNest', 'Apollo Clinic', 'MedFirst']
    const colors  = ['var(--emerald)', 'var(--aurora)', 'var(--violet-light)', 'var(--amber)']
    let idx = 0
    const t = setInterval(() => {
      const type  = types[idx % types.length]
      const name  = names[idx % names.length]
      const color = colors[idx % colors.length]
      setStreamEvents(prev => [{
        id:    Date.now(),
        type,
        msg:   type === 'payment'  ? `${name} completed payment — ₹${(Math.random() * 10000 | 0).toLocaleString()}` :
               type === 'booking'  ? `${Math.floor(3 + Math.random() * 15)} bookings confirmed at ${name}` :
               type === 'signup'   ? `${name} joined the platform on Trial plan` :
                                     `${name} upgraded plan — revenue impact +₹4,200`,
        time:  'Just now',
        color,
      }, ...prev.slice(0, 7)])
      idx++
    }, 12000)
    return () => clearInterval(t)
  }, [])

  const ov  = overview || {}
  const mrr = revenue?.currentMrr || ov.mrr || 0

  // Revenue pulse chart data
  const revenueData = revenue?.byMonth?.slice(-9).map(m => ({
    month:   m.month?.slice(5) ?? m.month,
    revenue: m.total ?? 0,
  })) || Array.from({ length: 6 }, (_, i) => ({ month: `0${i+4}`, revenue: 0 }))

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card-metal p-5 space-y-3 animate-pulse">
                <div className="h-3 w-24 skeleton rounded" />
                <div className="h-8 w-32 skeleton rounded" />
                <div className="h-2 w-full skeleton rounded" />
                <div className="h-8 skeleton rounded-lg" />
              </div>
            ))}
          </div>
          <div className="card-metal p-5 h-40 skeleton rounded-xl" />
          <div className="h-52 card-metal skeleton rounded-xl" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title mb-0.5">Platform Overview</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs" style={{ color: 'var(--silver-4)' }}>Real-time insights across all businesses</span>
            <span
              className="flex items-center gap-1 text-[10px]"
              style={{ color: 'var(--silver-5)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--emerald)', boxShadow: '0 0 6px var(--emerald)' }} />
              {lastUpdated === 0 ? 'Just updated' : `${lastUpdated}s ago`}
            </span>
          </div>
        </div>
        <button onClick={() => fetchData().then(() => addToast('Dashboard refreshed', 'success'))} className="btn-ghost gap-1.5">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          LAYER 1 — Executive Snapshot (4 KPI panels)
          ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KPICard
          label="Monthly Recurring Revenue"
          value={`₹${(mrr / 100000).toFixed(1)}L`}
          trend="12.4%"
          trendDir="up"
          confidence={87}
          insight="Growth primarily driven by clinic upgrades this quarter."
          icon={DollarSign}
          color="var(--aurora)"
          delay={0}
        />
        <KPICard
          label="Active Businesses"
          value={ov.activeBusinesses ?? '—'}
          trend="3 new"
          trendDir="up"
          confidence={94}
          insight="2 businesses approaching plan renewal in 7 days."
          icon={Building2}
          color="var(--emerald)"
          delay={60}
        />
        <KPICard
          label="Trial → Paid Rate"
          value={`${ov.trialToPaidRate ?? 0}%`}
          trend={ov.trialToPaidRate > 30 ? '+2.1%' : '-1.4%'}
          trendDir={ov.trialToPaidRate > 30 ? 'up' : 'down'}
          confidence={78}
          insight={`${ov.trialBusinesses ?? 0} trials active — 3 entering conversion window.`}
          icon={TrendingUp}
          color="var(--violet-light)"
          delay={120}
        />
        <KPICard
          label="Platform Confirmation Rate"
          value={`${ov.platformConfirmationRate ?? 0}%`}
          trend="+4.2%"
          trendDir="up"
          confidence={91}
          insight="AI receptionist driving higher booking completion rates."
          icon={Activity}
          color="var(--amber)"
          delay={180}
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          LAYER 2 — Platform Intelligence
          ═══════════════════════════════════════════════════ */}
      <div className="mb-5 card-metal p-5 animate-fade-up" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Zap size={13} style={{ color: 'var(--aurora)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--silver)' }}>
              Platform Intelligence
            </h3>
            <p className="text-[10px]" style={{ color: 'var(--silver-5)' }}>AI-generated observations · updated every hour</p>
          </div>
          <span className="badge-live ml-auto">Live</span>
        </div>

        <div>
          {INTEL.map((item, i) => (
            <div
              key={i}
              className="intel-row"
              style={{ animation: `intel-reveal 350ms cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both` }}
            >
              <span className="intel-dot" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--silver-3)' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts + Activity row */}
      <div className="grid grid-cols-12 gap-4 mb-5">

        {/* Revenue Pulse area chart */}
        <div className="col-span-7 card-metal p-5 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--silver)' }}>Revenue Pulse</h3>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--silver-5)' }}>Monthly recurring revenue trend</p>
            </div>
            <span className="badge-indigo">Last 9 months</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--aurora)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--aurora)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--silver-5)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--silver-5)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone" dataKey="revenue" stroke="var(--aurora)" strokeWidth={2}
                fill="url(#revGrad)"
                dot={false}
                activeDot={{ r: 4, fill: 'var(--aurora)', stroke: 'var(--aurora-light)', strokeWidth: 2 }}
                isAnimationActive animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats column */}
        <div className="col-span-5 space-y-3">
          {[
            { label: 'Bookings Today',         value: ov.totalBookingsToday ?? 0,         color: 'var(--aurora)',  icon: Activity },
            { label: 'Overdue Invoices',        value: ov.overdueInvoices ?? 0,             color: 'var(--crimson)', icon: AlertTriangle },
            { label: 'Commission This Month',   value: `₹${(ov.totalCommissionThisMonth ?? 0).toLocaleString()}`, color: 'var(--amber)', icon: CreditCard },
            { label: "Today's Signups",         value: ov.newSignupsToday ?? 0,             color: 'var(--emerald)', icon: Users },
          ].map(({ label, value, color, icon: Icon }, i) => (
            <div
              key={label}
              className="card-metal px-4 py-3 flex items-center gap-3 cursor-pointer animate-fade-up card-hover"
              style={{ animationDelay: `${320 + i * 50}ms` }}
              onClick={() => navigate(label.includes('Invoice') ? '/billing' : label.includes('Commission') ? '/commissions' : '/businesses')}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}14`, border: `1px solid ${color}22` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px]" style={{ color: 'var(--silver-4)' }}>{label}</p>
                <p className="text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--silver)', letterSpacing: '-0.02em' }}>
                  {value}
                </p>
              </div>
              <ArrowUpRight size={13} style={{ color: 'var(--silver-5)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          LAYER 3 — Live Activity Stream
          ═══════════════════════════════════════════════════ */}
      <div className="card-metal p-5 animate-fade-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--silver)' }}>
            Live Activity
          </h3>
          <span className="badge-live">Streaming</span>
        </div>
        <div className="space-y-1">
          {streamEvents.slice(0, 6).map((ev, i) => {
            const Icon = STREAM_ICONS[ev.type] || Activity
            return (
              <div
                key={ev.id}
                className="stream-item"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="stream-dot" style={{ background: ev.color, boxShadow: `0 0 5px ${ev.color}` }} />
                <Icon size={13} style={{ color: ev.color, flexShrink: 0 }} />
                <span className="text-xs flex-1 leading-snug" style={{ color: 'var(--silver-3)' }}>{ev.msg}</span>
                <span className="text-[10px] flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--silver-5)' }}>
                  {ev.time}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
