import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/layout/Layout'
import { useToast } from '../context/ToastContext'
import { getPlatformAnalytics, getRevenue } from '../api/admin'
import { AlertCircle, RefreshCw, TrendingUp, Users, DollarSign, Percent } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import clsx from 'clsx'

const COLORS = ['#4F46E5', '#818CF8', '#D4AF37', '#6EE7B7', '#94A3B8', '#F59E0B']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{typeof p.value === 'number' && p.name?.includes('Revenue') ? `₹${p.value.toLocaleString()}` : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { addToast } = useToast()
  const [analytics, setAnalytics] = useState(null)
  const [revenue, setRevenue]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [an, rev] = await Promise.all([getPlatformAnalytics(), getRevenue()])
      setAnalytics(an)
      setRevenue(rev)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load analytics'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [])                        // ← empty array, addToast removed

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="grid grid-cols-4 gap-4 mb-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-4 animate-pulse h-24" />)}</div>
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="card p-4 animate-pulse h-64" />)}</div>
      </Layout>
    )
  }

  if (error && !analytics) {
    return (
      <Layout title="Analytics">
        <div className="card p-12 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-white mb-1">Failed to load analytics</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      </Layout>
    )
  }

  const funnel    = analytics?.funnel    || {}
  const byCategory = analytics?.byCategory || []
  const byCity    = analytics?.byCity    || []
  const revenueByMonth = revenue?.byMonth || []
  const revenueByType  = revenue?.byType  || {}
  const currentMrr     = revenue?.currentMrr || 0

  const funnelSteps = [
    { label: 'Total Signups', value: funnel.signups || 0, icon: Users, color: 'text-white' },
    { label: 'Trial Active', value: funnel.trialActive || 0, icon: TrendingUp, color: 'text-amber-400' },
    { label: 'Got First Booking', value: funnel.firstBooking || 0, icon: Percent, color: 'text-indigo-400' },
    { label: 'Paid Plans', value: funnel.paid || 0, icon: DollarSign, color: 'metric-gold' },
  ]

  return (
    <Layout title="Analytics">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Platform Analytics</h1>
          <p className="text-sm text-slate-500">Funnel, revenue, and category breakdowns</p>
        </div>
        <button onClick={fetchData} className="btn-ghost gap-1.5"><RefreshCw size={13} /> Refresh</button>
      </div>

      {/* Funnel KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {funnelSteps.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className={color} />
              <span className="stat-label">{label}</span>
            </div>
            <p className={clsx('stat-value', color)}>{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Conversion Rate Banner */}
      <div className="card p-4 mb-6 flex items-center gap-6">
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Trial Conversion Rate</p>
          <p className="text-3xl font-bold font-display metric-gold">{funnel.trialConversionRate || 0}%</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Current MRR</p>
          <p className="text-3xl font-bold font-display text-white">₹{currentMrr.toLocaleString()}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Revenue by Booking</p>
          <p className="text-3xl font-bold font-display text-indigo-400">₹{(revenueByType.BOOKING || 0).toLocaleString()}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Revenue by Show-up</p>
          <p className="text-3xl font-bold font-display text-emerald-400">₹{(revenueByType.SHOWUP || 0).toLocaleString()}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Revenue by Lead</p>
          <p className="text-3xl font-bold font-display text-amber-400">₹{(revenueByType.LEAD || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-5 mb-6">
        {/* Revenue by Month */}
        <div className="col-span-8 card p-5">
          <h3 className="section-title mb-4">Revenue Trend (Confirmed Commissions)</h3>
          {revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByMonth} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="booking" name="Booking Revenue" fill="#4F46E5" radius={[2, 2, 0, 0]} />
                <Bar dataKey="showup" name="Showup Revenue" fill="#6EE7B7" radius={[2, 2, 0, 0]} />
                <Bar dataKey="lead" name="Lead Revenue" fill="#D4AF37" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">No revenue data yet</div>
          )}
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-indigo-500" /><span className="text-xs text-slate-500">Booking</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-emerald-400" /><span className="text-xs text-slate-500">Showup</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-gold" /><span className="text-xs text-slate-500">Lead</span></div>
          </div>
        </div>

        {/* Top Cities */}
        <div className="col-span-4 card p-5">
          <h3 className="section-title mb-4">Top Cities</h3>
          {byCity.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8">No city data</div>
          ) : (
            <div className="space-y-3">
              {byCity.slice(0, 8).map(({ city, count }, i) => (
                <div key={city} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white">{city}</span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1">
                      <div className="h-1 rounded-full bg-indigo-500/70" style={{ width: `${Math.min((count / (byCity[0]?.count || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Businesses & Bookings by Category</h3>
        {byCategory.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-8">No category data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Category', 'Businesses', 'Bookings', 'Booking/Business'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byCategory.sort((a, b) => b.businesses - a.businesses).map((row, i) => (
                  <tr key={row.category} className="border-b border-white/[0.04] table-row-hover">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-white font-medium">{row.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{row.businesses}</td>
                    <td className="px-4 py-3 text-slate-300">{row.bookings}</td>
                    <td className="px-4 py-3 text-indigo-400 font-medium">
                      {row.businesses > 0 ? (row.bookings / row.businesses).toFixed(1) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}