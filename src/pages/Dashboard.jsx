import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import {
  CalendarCheck, DollarSign, TrendingUp, TrendingDown,
  Activity, AlertTriangle, FileText, Send, Bell,
  Plus, ArrowRight, ShieldAlert, CreditCard, UserX,
  RefreshCw, Users
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Sector
} from 'recharts'
import {
  dashboardMetrics, categoryDayStats, revenueChartData,
  bookingsChartData, categoryRevenueData
} from '../data/mockData'
import clsx from 'clsx'

const PERIOD_TABS = ['Today', 'Weekly', 'Monthly']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs border-white/10">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300 capitalize">{p.name}:</span>
          <span className="text-white font-semibold">
            {p.name === 'revenue' || p.name === 'target' ? `₹${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// Active pie slice renderer
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  )
}

export default function Dashboard() {
  const [period, setPeriod] = useState('Today')
  const [loading, setLoading] = useState(true)
  const [liveData, setLiveData] = useState(dashboardMetrics.today)
  const [lastUpdated, setLastUpdated] = useState(0)
  const [activePieIdx, setActivePieIdx] = useState(null)
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Simulated skeleton load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  // Update metrics when period changes
  useEffect(() => {
    const key = period.toLowerCase()
    setLiveData(dashboardMetrics[key])
    setLastUpdated(0)
  }, [period])

  // Live counter — increments bookings every 8s
  useEffect(() => {
    if (loading) return
    const t = setInterval(() => {
      const delta = Math.floor(Math.random() * 3) + 1
      setLiveData(prev => ({ ...prev, bookings: prev.bookings + delta, revenue: prev.revenue + delta * 540 }))
      setLastUpdated(0)
    }, 8000)
    return () => clearInterval(t)
  }, [loading])

  // "Last updated" ticker
  useEffect(() => {
    const t = setInterval(() => setLastUpdated(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setLastUpdated(0); addToast('Dashboard refreshed', 'success', 'All metrics updated') }, 800)
  }

  const handlePieClick = (data) => {
    navigate(`/bookings?category=${data.name}`)
    addToast(`Filtered by ${data.name}`, 'info', 'Showing bookings page')
  }

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-between mb-6">
          <div><div className="h-7 w-48 bg-white/5 rounded animate-pulse mb-1" /><div className="h-4 w-64 bg-white/5 rounded animate-pulse" /></div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-5">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        <div className="h-32 bg-white/5 rounded-xl animate-pulse mb-5" />
        <div className="grid grid-cols-4 gap-4 mb-5">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        <div className="grid grid-cols-12 gap-4 mb-5">
          <div className="col-span-5"><SkeletonChart height={200} /></div>
          <div className="col-span-4"><SkeletonChart height={200} /></div>
          <div className="col-span-3 card p-5"><div className="h-4 w-32 bg-white/5 rounded animate-pulse mb-4" /><div className="h-40 bg-white/5 rounded animate-pulse" /></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Platform Overview</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">Real-time insights across all businesses</p>
            <span className="text-[10px] text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Updated {lastUpdated === 0 ? 'just now' : `${lastUpdated}s ago`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="btn-ghost gap-1.5"><RefreshCw size={13} /> Refresh</button>
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
            {PERIOD_TABS.map(t => (
              <button key={t} onClick={() => setPeriod(t)}
                className={clsx('px-3 py-1.5 rounded-md text-xs font-medium transition-all', period === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: `${period} Bookings`, value: liveData.bookings.toLocaleString(), sub: `Expected: ${liveData.expectedBookings}`, icon: CalendarCheck, trend: 4.2, up: true },
          { label: `${period} Revenue`, value: `₹${liveData.revenue.toLocaleString()}`, sub: 'Gross collected', icon: DollarSign, trend: 7.8, up: true, gold: true },
          { label: 'Expected Today', value: liveData.expectedBookings.toLocaleString(), sub: `${Math.round((liveData.bookings / liveData.expectedBookings) * 100)}% fulfilled`, icon: Activity },
          { label: 'Anomaly Rate', value: `${liveData.anomalyRate}%`, sub: 'No-shows / Total bookings', icon: AlertTriangle, trend: 1.2, up: false },
        ].map(({ label, value, sub, icon: Icon, trend, up, gold }) => (
          <div key={label} className={clsx('card p-5 card-hover animate-fade-in group cursor-default', gold && 'border-gold/20')}>
            <div className="flex items-start justify-between mb-3">
              <span className="stat-label">{label}</span>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', gold ? 'bg-gold-muted' : 'bg-indigo-500/10')}>
                <Icon size={15} className={gold ? 'text-gold' : 'text-indigo-400'} />
              </div>
            </div>
            <p className={clsx('stat-value tabular-nums', gold && 'metric-gold')}>{value}</p>
            {trend != null && (
              <div className={clsx('flex items-center gap-1 mt-1 text-xs font-medium', up ? 'text-emerald-400' : 'text-red-400')}>
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>{trend}% vs last period</span>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Today's Bookings by Category</h3>
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {categoryDayStats.map(cat => (
            <button key={cat.category}
              onClick={() => { navigate('/bookings'); addToast(`Viewing ${cat.category} bookings`, 'info') }}
              className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left group">
              <p className="text-xs font-semibold text-slate-400 mb-2 group-hover:text-indigo-300 transition-colors">{cat.category}</p>
              <p className="text-xl font-bold font-display text-white">{cat.bookings}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">bookings today</p>
              <div className="mt-2 pt-2 border-t border-white/[0.05]">
                <p className="text-xs metric-gold font-semibold">₹{cat.revenue.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">{cat.showUps} show-ups</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Business Health */}
      <h3 className="section-title mb-3">Business Health</h3>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Active Businesses', value: 7, sub: '78% of capacity', color: 'text-emerald-400', bar: 'bg-emerald-500/70', pct: 78, icon: Users },
          { label: 'Trial Businesses', value: 3, sub: 'Avg 11 days left', color: 'text-amber-400', bar: 'bg-amber-500/60', pct: 20, icon: Activity },
          { label: 'Trial → Paid Rate', value: '68.4%', sub: 'Industry avg: 58%', color: 'text-indigo-400', bar: 'bg-indigo-500/70', pct: 68.4, icon: TrendingUp },
          { label: 'Monthly MRR', value: '₹87,400', sub: '87% of target', color: 'metric-gold', bar: 'bg-gradient-gold', pct: 87, gold: true, icon: DollarSign },
        ].map(({ label, value, sub, color, bar, pct, gold, icon: Icon }) => (
          <div key={label} className={clsx('card p-5', gold && 'border-gold/15')}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className={color} />
              <span className="stat-label">{label}</span>
            </div>
            <p className={clsx('stat-value', color)}>{value}</p>
            <div className="mt-2 bg-white/5 rounded-full h-1.5"><div className={clsx('h-1.5 rounded-full', bar)} style={{ width: `${pct}%` }} /></div>
            <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Platform Signals */}
      <h3 className="section-title mb-3">Platform Signals</h3>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Active Alerts', value: 7, sub: '3 critical', icon: Bell, border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400', path: '/alerts' },
          { label: 'Critical Anomalies', value: 4, sub: 'Needs review', icon: ShieldAlert, border: 'border-red-500/20', bg: 'bg-red-500/10', text: 'text-red-400', path: '/analytics' },
          { label: 'Overdue Payments', value: 2, sub: '₹7,680 pending', icon: CreditCard, border: 'border-orange-500/20', bg: 'bg-orange-500/10', text: 'text-orange-400', path: '/billing' },
          { label: 'Low Performing', value: 2, sub: '<5 bookings/week', icon: UserX, border: 'border-slate-500/20', bg: 'bg-slate-500/10', text: 'text-slate-400', path: '/analytics' },
        ].map(({ label, value, sub, icon: Icon, border, bg, text, path }) => (
          <button key={label} onClick={() => navigate(path)}
            className={clsx('card p-4 border text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 cursor-pointer', border)}>
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', bg)}><Icon size={17} className={text} /></div>
            <div className={clsx('text-2xl font-bold font-display mb-0.5', text)}>{value}</div>
            <div className="text-xs font-semibold text-white">{label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-4 mb-5">
        {/* Revenue */}
        <div className="col-span-5 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Revenue Trend</h3>
            <span className="badge badge-indigo">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="revenue" stroke="#4F46E5" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#4F46E5', stroke: '#818CF8', strokeWidth: 2 }} isAnimationActive animationDuration={1000} />
              <Line type="monotone" dataKey="target" name="target" stroke="#D4AF37" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-indigo-500 rounded" /><span className="text-xs text-slate-500">Revenue</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-px bg-gold" style={{ borderTop: '1px dashed #D4AF37' }} /><span className="text-xs text-slate-500">Target</span></div>
          </div>
        </div>

        {/* Bookings vs Show-ups */}
        <div className="col-span-4 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Bookings vs Show-ups</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bookingsChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" name="bookings" fill="#4F46E5" radius={[3, 3, 0, 0]} opacity={0.85} isAnimationActive animationDuration={800} />
              <Bar dataKey="showups" name="showups" fill="#D4AF37" radius={[3, 3, 0, 0]} opacity={0.85} isAnimationActive animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-indigo-500" /><span className="text-xs text-slate-500">Bookings</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-gold" /><span className="text-xs text-slate-500">Show-ups</span></div>
          </div>
        </div>

        {/* Clickable Pie */}
        <div className="col-span-3 card p-5">
          <h3 className="section-title mb-1">Revenue by Category</h3>
          <p className="text-[10px] text-slate-500 mb-3">Click slice to filter bookings</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={categoryRevenueData}
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                activeIndex={activePieIdx}
                activeShape={renderActiveShape}
                onMouseEnter={(_, idx) => setActivePieIdx(idx)}
                onMouseLeave={() => setActivePieIdx(null)}
                onClick={handlePieClick}
                style={{ cursor: 'pointer' }}
                isAnimationActive
                animationDuration={800}
              >
                {categoryRevenueData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0F1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {categoryRevenueData.map((d, i) => (
              <button key={i} onClick={() => handlePieClick(d)}
                className="w-full flex items-center justify-between text-xs hover:bg-white/[0.04] rounded px-1 py-0.5 transition-colors group">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span className="text-slate-400 group-hover:text-white transition-colors">{d.name}</span></div>
                <span className="text-white font-medium">{d.value}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="section-title mb-3">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Generate Invoices', sub: 'Bulk for all businesses', icon: FileText, path: '/billing', toast: 'Navigating to Billing' },
          { label: 'Send Reminders', sub: '2 overdue payments', icon: Send, path: '/billing', toast: 'Navigating to Billing' },
          { label: 'View All Alerts', sub: '7 active alerts', icon: Bell, path: '/alerts', toast: 'Navigating to Alerts' },
          { label: 'Add Business', sub: 'Onboard new client', icon: Plus, path: '/businesses', toast: 'Navigating to Businesses' },
        ].map(({ label, sub, icon: Icon, path, toast }) => (
          <button key={label}
            onClick={() => { navigate(path); addToast(toast, 'info') }}
            className="card card-hover p-4 text-left group flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-all">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-500/20 transition-colors">
              <Icon size={16} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
            </div>
            <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
          </button>
        ))}
      </div>
    </Layout>
  )
}