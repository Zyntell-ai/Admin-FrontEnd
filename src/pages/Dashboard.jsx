import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { SkeletonCard, SkeletonChart } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { getOverview, getRevenue } from '../api/admin'
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
import clsx from 'clsx'

const CATEGORY_COLORS = ['#4F46E5', '#818CF8', '#D4AF37', '#6EE7B7', '#94A3B8', '#F59E0B', '#EF4444']

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
            {p.name === 'revenue' || p.name === 'total' ? `₹${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(0)
  const [activePieIdx, setActivePieIdx] = useState(null)
  const navigate = useNavigate()
  const { addToast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ovResult, revResult] = await Promise.allSettled([getOverview(), getRevenue()])
      if (ovResult.status === 'fulfilled') setOverview(ovResult.value)
      else addToast('Overview failed to load', 'error')
      if (revResult.status === 'fulfilled') setRevenue(revResult.value)
      // revenue failure is silent — charts just show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // "Last updated" ticker
  useEffect(() => {
    const t = setInterval(() => setLastUpdated(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const handleRefresh = () => {
    fetchData().then(() => addToast('Dashboard refreshed', 'success', 'All metrics updated'))
  }

  const handlePieClick = (data) => {
    navigate(`/bookings?category=${data.category || data.name}`)
    addToast(`Filtered by ${data.category || data.name}`, 'info', 'Showing bookings page')
  }

  // Build chart data from revenue API
  const revenueChartData = revenue?.byMonth?.slice(-9).map(m => ({
    month: m.month.slice(5), // "2024-03" → "03"
    revenue: m.total,
  })) || []

  const categoryPieData = revenue?.byCategory?.map((c, i) => ({
    name: c.category,
    category: c.category,
    value: c.total,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  })) || []

  const categoryPiePercents = (() => {
    const total = categoryPieData.reduce((s, d) => s + d.value, 0)
    return categoryPieData.map(d => ({ ...d, pct: total > 0 ? Math.round((d.value / total) * 100) : 0 }))
  })()

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

  if (error && !overview) {
    return (
      <Layout title="Dashboard">
        <div className="card p-12 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Failed to load dashboard</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      </Layout>
    )
  }

  const ov = overview || {}
  const mrr = ov.mrr || 0
  const activeBusinesses = ov.activeBusinesses || 0
  const trialBusinesses = ov.trialBusinesses || 0
  const trialToPaidRate = ov.trialToPaidRate || 0
  const platformConfirmationRate = ov.platformConfirmationRate || 0
  const totalBookingsToday = ov.totalBookingsToday || 0
  const overdueInvoices = ov.overdueInvoices || 0
  const newSignupsToday = ov.newSignupsToday || 0
  const totalCommissionThisMonth = ov.totalCommissionThisMonth || 0
  const currentMrr = revenue?.currentMrr || mrr

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
        <button onClick={handleRefresh} className="btn-ghost gap-1.5">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Bookings Today', value: totalBookingsToday.toLocaleString(), sub: `${newSignupsToday} new signups today`, icon: CalendarCheck },
          { label: 'Commission This Month', value: `₹${totalCommissionThisMonth.toLocaleString()}`, sub: 'Confirmed commissions', icon: DollarSign, gold: true },
          { label: 'Platform Confirmation Rate', value: `${platformConfirmationRate}%`, sub: 'Completed / Total bookings', icon: Activity },
          { label: 'Overdue Invoices', value: overdueInvoices.toLocaleString(), sub: 'Need attention', icon: AlertTriangle },
        ].map(({ label, value, sub, icon: Icon, gold }) => (
          <div key={label} className={clsx('card p-5 card-hover animate-fade-in cursor-default', gold && 'border-gold/20')}>
            <div className="flex items-start justify-between mb-3">
              <span className="stat-label">{label}</span>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', gold ? 'bg-gold-muted' : 'bg-indigo-500/10')}>
                <Icon size={15} className={gold ? 'text-gold' : 'text-indigo-400'} />
              </div>
            </div>
            <p className={clsx('stat-value tabular-nums', gold && 'metric-gold')}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Business Health */}
      <h3 className="section-title mb-3">Business Health</h3>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Active Businesses', value: activeBusinesses, sub: 'Paid plan (plus/pro)', color: 'text-emerald-400', bar: 'bg-emerald-500/70', pct: Math.min(activeBusinesses * 10, 100), icon: Users },
          { label: 'Trial Businesses', value: trialBusinesses, sub: 'Currently on trial', color: 'text-amber-400', bar: 'bg-amber-500/60', pct: Math.min(trialBusinesses * 10, 100), icon: Activity },
          { label: 'Trial → Paid Rate', value: `${trialToPaidRate}%`, sub: 'Conversion rate', color: 'text-indigo-400', bar: 'bg-indigo-500/70', pct: trialToPaidRate, icon: TrendingUp },
          { label: 'Current MRR', value: `₹${currentMrr.toLocaleString()}`, sub: 'Monthly recurring revenue', color: 'metric-gold', bar: 'bg-gradient-gold', pct: Math.min((currentMrr / 100000) * 100, 100), gold: true, icon: DollarSign },
        ].map(({ label, value, sub, color, bar, pct, gold, icon: Icon }) => (
          <div key={label} className={clsx('card p-5', gold && 'border-gold/15')}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className={color} />
              <span className="stat-label">{label}</span>
            </div>
            <p className={clsx('stat-value', color)}>{value}</p>
            <div className="mt-2 bg-white/5 rounded-full h-1.5">
              <div className={clsx('h-1.5 rounded-full', bar)} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Platform Signals */}
      <h3 className="section-title mb-3">Platform Signals</h3>
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Overdue Invoices', value: overdueInvoices, sub: 'Need immediate action', icon: CreditCard, border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400', path: '/billing' },
          { label: 'Commission This Month', value: `₹${totalCommissionThisMonth.toLocaleString()}`, sub: 'Confirmed commissions', icon: ShieldAlert, border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', text: 'text-indigo-400', path: '/commissions' },
          { label: 'Trial Businesses', value: trialBusinesses, sub: 'Being evaluated', icon: Bell, border: 'border-orange-500/20', bg: 'bg-orange-500/10', text: 'text-orange-400', path: '/businesses' },
          { label: 'Today\'s Signups', value: newSignupsToday, sub: 'New businesses registered', icon: UserX, border: 'border-slate-500/20', bg: 'bg-slate-500/10', text: 'text-slate-400', path: '/businesses' },
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
        {/* Revenue Trend */}
        <div className="col-span-6 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Revenue Trend</h3>
            <span className="badge badge-indigo">By Month</span>
          </div>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="revenue" stroke="#4F46E5" strokeWidth={2.5} dot={false}
                  activeDot={{ r: 5, fill: '#4F46E5', stroke: '#818CF8', strokeWidth: 2 }} isAnimationActive animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Revenue by Category Pie */}
        <div className="col-span-6 card p-5">
          <h3 className="section-title mb-1">Revenue by Category</h3>
          <p className="text-[10px] text-slate-500 mb-3">Click slice to filter bookings</p>
          {categoryPiePercents.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={categoryPiePercents}
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
                    {categoryPiePercents.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0F1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
                {categoryPiePercents.map((d, i) => (
                  <button key={i} onClick={() => handlePieClick(d)}
                    className="flex items-center justify-between text-xs hover:bg-white/[0.04] rounded px-1 py-0.5 transition-colors group">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span className="text-slate-400 group-hover:text-white transition-colors truncate">{d.name}</span></div>
                    <span className="text-white font-medium">{d.pct}%</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No category data yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {ov.recentActivity?.length > 0 && (
        <>
          <h3 className="section-title mb-3">Recent Activity</h3>
          <div className="card p-4 mb-5">
            <div className="space-y-2">
              {ov.recentActivity.map((item, i) => (
                <div key={item.id || i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-xs text-white font-medium">{item.businessName}</span>
                  <span className="badge badge-yellow text-[10px]">{item.type}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">
                    {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <h3 className="section-title mb-3">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Generate Invoices', sub: 'Bulk for all businesses', icon: FileText, path: '/billing', toast: 'Navigating to Billing' },
          { label: 'Send Reminders', sub: `${overdueInvoices} overdue payments`, icon: Send, path: '/billing', toast: 'Navigating to Billing' },
          { label: 'View All Alerts', sub: 'Review open alerts', icon: Bell, path: '/alerts', toast: 'Navigating to Alerts' },
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