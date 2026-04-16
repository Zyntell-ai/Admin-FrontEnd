import { useState } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { clinicAlerts, funnelData, trials, cancelledBusinesses, lowUsageBusinesses, areaPerformance, categories } from '../data/mockData'
import { AlertCircle, Clock, XCircle, Eye, Wifi, MessageSquare, Percent, CheckCircle, X, UserPlus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

const adminTeam = ['Rahul K.', 'Priya S.', 'Amit M.', 'Nisha P.']

function SeverityBadge({ severity }) {
  const map = { Critical: 'bg-red-500/15 text-red-400 border border-red-500/20', High: 'bg-orange-500/15 text-orange-400 border border-orange-500/20', Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20', Low: 'bg-slate-500/15 text-slate-400 border border-slate-500/20' }
  return <span className={clsx('badge text-[10px]', map[severity] || map.Low)}>{severity}</span>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => <div key={i} className="flex gap-2"><span className="text-slate-300">{p.name}:</span><span className="text-white font-semibold">{p.value}</span></div>)}
    </div>
  )
}

export default function Analytics() {
  const { addToast } = useToast()
  const [alerts, setAlerts] = useState(clinicAlerts)
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [assignModal, setAssignModal] = useState(null)
  const [assignee, setAssignee] = useState('')
  const [monitorTab, setMonitorTab] = useState('trials')
  const [winBackModal, setWinBackModal] = useState(null)
  const [spotCheckModal, setSpotCheckModal] = useState(null)

  const filteredAlerts = alerts.filter(a => {
    const matchSev = severityFilter === 'All' || a.severity === severityFilter
    const matchStat = statusFilter === 'All' || a.status === statusFilter
    return matchSev && matchStat
  })

  const resolveAlert = (id, name) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a))
    addToast(`Alert resolved — ${name}`, 'success')
  }

  const dismissAlert = (id, name) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'DISMISSED' } : a))
    addToast(`Alert dismissed — ${name}`, 'info')
  }

  const doAssign = (id, person) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, assignedTo: person, status: 'IN_REVIEW' } : a))
    addToast(`Alert assigned to ${person}`, 'success')
    setAssignModal(null)
  }

  return (
    <Layout title="Analytics">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-title mb-0.5">Analytics</h1><p className="text-sm text-slate-500">Funnel performance, monitoring, and platform health</p></div>
      </div>

      {/* Funnel */}
      <div className="card p-6 mb-5">
        <h3 className="section-title mb-5">Trial → Paid Conversion Funnel</h3>
        <div className="flex items-end gap-3">
          {funnelData.map((stage, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs font-bold text-white">{stage.count}</div>
              <div className="w-full rounded-lg transition-all hover:brightness-110 cursor-default" style={{ height: `${stage.pct * 1.6}px`, background: `linear-gradient(180deg, ${stage.color}cc 0%, ${stage.color}55 100%)`, border: `1px solid ${stage.color}44` }} />
              <div className="text-center">
                <p className="text-xs font-semibold text-white">{stage.stage}</p>
                <p className="text-[10px]" style={{ color: stage.color }}>{stage.pct}%</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.05]">
          <span className="text-xs text-slate-500">Drop-off:</span>
          {funnelData.slice(1).map((stage, i) => (
            <span key={i} className="text-xs">
              <span className="text-red-400 font-medium">-{(funnelData[i].pct - stage.pct).toFixed(1)}%</span>
              <span className="text-slate-500 ml-1">{funnelData[i].stage} → {stage.stage}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Bot Performance */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Bot Uptime', value: '99.7%', sub: 'Last 30 days', icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Response Rate', value: '94.2%', sub: 'Avg across all bots', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Booking Conversion', value: '68.4%', sub: 'Inquiry → booking', icon: Percent, color: 'text-gold', bg: 'bg-gold-muted' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', bg)}><Icon size={20} className={color} /></div>
            <div>
              <p className="stat-label mb-0.5">{label}</p>
              <p className={clsx('text-2xl font-bold font-display', color)}>{value}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="col-span-5 card p-5">
          <h3 className="section-title mb-4">Category Performance %</h3>
          <div className="space-y-4">
            {categories.filter(c => c.isActive).map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-300">{cat.icon} {cat.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{cat.businesses} biz</span>
                    <span className="text-xs font-bold" style={{ color: ['#4F46E5', '#818CF8', '#D4AF37', '#6EE7B7'][i] }}>{cat.performance}%</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${cat.performance}%`, background: ['#4F46E5', '#818CF8', '#D4AF37', '#6EE7B7'][i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-7 card p-5">
          <h3 className="section-title mb-4">Area-wise Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={areaPerformance} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="area" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" name="bookings" fill="#4F46E5" radius={[3, 3, 0, 0]} opacity={0.8} isAnimationActive animationDuration={800} />
              <Bar dataKey="businesses" name="businesses" fill="#D4AF37" radius={[3, 3, 0, 0]} opacity={0.8} isAnimationActive animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monitoring Queue */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Monitoring Queue</h3>
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
            {[{ key: 'trials', label: 'Trial Expiring', count: trials.length }, { key: 'lowUsage', label: 'Low Usage', count: lowUsageBusinesses.length }, { key: 'cancelled', label: 'Cancelled', count: cancelledBusinesses.length }].map(({ key, label, count }) => (
              <button key={key} onClick={() => setMonitorTab(key)}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all', monitorTab === key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}>
                {label} <span className={clsx('text-[10px] rounded-full px-1.5 py-0.5 font-bold', monitorTab === key ? 'bg-white/20' : 'bg-white/10 text-slate-500')}>{count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {monitorTab === 'trials' && trials.map((t, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-amber-500/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Clock size={14} className="text-amber-400" /></div>
                <div><p className="text-sm font-semibold text-white">{t.businessName}</p><p className="text-xs text-slate-500">{t.category} · {t.conversationCount}/{t.conversationCap} conversations used</p></div>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx('badge', t.daysLeft <= 3 ? 'badge-red' : t.daysLeft <= 7 ? 'badge-yellow' : 'badge-indigo')}>{t.daysLeft} days left</span>
                <button onClick={() => addToast(`Contacting ${t.businessName}`, 'info')} className="btn-ghost text-xs px-2.5 py-1">Contact</button>
                <button onClick={() => addToast(`Trial extended for ${t.businessName}`, 'success')} className="btn-primary text-xs px-2.5 py-1">Extend Trial</button>
              </div>
            </div>
          ))}
          {monitorTab === 'lowUsage' && lowUsageBusinesses.map((b, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-red-500/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><AlertCircle size={14} className="text-red-400" /></div>
                <div><p className="text-sm font-semibold text-white">{b.businessName}</p><p className="text-xs text-slate-500">{b.bookingsLast30} bookings (min {b.expectedMin})</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-white/5 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(b.bookingsLast30 / b.expectedMin) * 100}%` }} /></div>
                  <span className="text-xs text-red-400 font-medium">{Math.round((b.bookingsLast30 / b.expectedMin) * 100)}%</span>
                </div>
                <button onClick={() => setSpotCheckModal(b)} className="btn-ghost text-xs px-2.5 py-1 gap-1"><Eye size={11} /> Spot Check</button>
                <button onClick={() => addToast(`Reaching out to ${b.businessName}`, 'info')} className="btn-ghost text-xs px-2.5 py-1">Reach Out</button>
              </div>
            </div>
          ))}
          {monitorTab === 'cancelled' && cancelledBusinesses.map((b, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-slate-500/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center"><XCircle size={14} className="text-slate-400" /></div>
                <div><p className="text-sm font-semibold text-white">{b.name}</p><p className="text-xs text-slate-500">{b.category} · {b.city} · Left: {b.reason}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Lost ₹{b.totalRevenueLost.toLocaleString()}</span>
                <button onClick={() => setWinBackModal(b)} className="btn-primary text-xs px-2.5 py-1">Win Back</button>
                <button onClick={() => addToast(`${b.name} archived`, 'info')} className="btn-ghost text-xs px-2.5 py-1">Archive</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="section-title">Alerts Management</h3>
            <span className="badge badge-red">{alerts.filter(a => a.severity === 'Critical' && a.status === 'OPEN').length} Critical</span>
            <span className="badge badge-indigo">{alerts.filter(a => a.status === 'OPEN').length} Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
              {['All', 'Critical', 'High', 'Medium'].map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)} className={clsx('px-2.5 py-1 rounded-md text-[10px] font-medium transition-all', severityFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}>{s}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
              {['All', 'OPEN', 'IN_REVIEW', 'RESOLVED'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={clsx('px-2.5 py-1 rounded-md text-[10px] font-medium transition-all', statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}>{s.replace('_', ' ')}</button>
              ))}
            </div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Business', 'Alert Type', 'Severity', 'Status', 'Assigned To', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map(alert => (
              <tr key={alert.id} className={clsx('border-b border-white/[0.04] table-row-hover', alert.severity === 'Critical' && alert.status === 'OPEN' && 'bg-red-500/[0.025]')}>
                <td className="px-4 py-3 text-sm font-semibold text-white">{alert.businessName}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{alert.type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3"><SeverityBadge severity={alert.severity} /></td>
                <td className="px-4 py-3">
                  <span className={clsx('badge text-[10px]', alert.status === 'RESOLVED' ? 'badge-green' : alert.status === 'IN_REVIEW' ? 'badge-indigo' : alert.status === 'DISMISSED' ? 'badge-gray' : 'badge-red')}>
                    {alert.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{alert.assignedTo ? <span className="text-slate-300">{alert.assignedTo}</span> : <span className="text-slate-600 italic">Unassigned</span>}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{alert.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {!['RESOLVED', 'DISMISSED'].includes(alert.status) && (
                      <>
                        <button onClick={() => resolveAlert(alert.id, alert.businessName)}
                          className="flex items-center gap-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md transition-all">
                          <CheckCircle size={9} /> Resolve
                        </button>
                        <button onClick={() => { setAssignModal(alert); setAssignee(alert.assignedTo || '') }}
                          className="flex items-center gap-1 text-[10px] btn-ghost px-2 py-1">
                          <UserPlus size={9} /> Assign
                        </button>
                      </>
                    )}
                    {!['DISMISSED'].includes(alert.status) && (
                      <button onClick={() => dismissAlert(alert.id, alert.businessName)}
                        className="flex items-center gap-1 text-[10px] bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 text-slate-500 px-2 py-1 rounded-md transition-all">
                        <X size={9} /> Dismiss
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAlerts.length === 0 && (
          <div className="py-10 text-center"><CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" /><p className="text-sm text-slate-400">No alerts match the current filters</p></div>
        )}
      </div>

      {/* Assign Modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign — ${assignModal?.businessName}`}>
        {assignModal && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-3">Assign alert to:</p>
            {adminTeam.map(person => (
              <button key={person} onClick={() => setAssignee(person)}
                className={clsx('w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all', assignee === person ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20')}>
                <div className="w-7 h-7 rounded-full bg-gradient-indigo flex items-center justify-center text-xs font-bold text-white">{person.split(' ').map(n => n[0]).join('')}</div>
                <span className="flex-1">{person}</span>
                {assignee === person && <CheckCircle size={14} className="text-indigo-400" />}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => doAssign(assignModal.id, assignee)} disabled={!assignee} className="btn-primary flex-1 justify-center disabled:opacity-50">Confirm</button>
              <button onClick={() => setAssignModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Win Back Modal */}
      <Modal open={!!winBackModal} onClose={() => setWinBackModal(null)} title="Win Back Business" size="sm">
        {winBackModal && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.08]">
              <p className="text-sm font-semibold text-white">{winBackModal.name}</p>
              <p className="text-xs text-slate-400 mt-1">{winBackModal.category} · Left: {winBackModal.reason} · Lost: ₹{winBackModal.totalRevenueLost.toLocaleString()}</p>
            </div>
            <div><label className="text-xs text-slate-400 mb-1 block">Win-back offer</label><textarea rows={3} placeholder="e.g., 20% off for 3 months if they rejoin..." className="input-field resize-none" /></div>
            <div className="flex gap-3">
              <button onClick={() => { setWinBackModal(null); addToast(`Win-back sent to ${winBackModal.name}`, 'success') }} className="btn-primary flex-1 justify-center">Send Offer</button>
              <button onClick={() => setWinBackModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Spot Check Modal */}
      <Modal open={!!spotCheckModal} onClose={() => setSpotCheckModal(null)} title="Spot Check" size="sm">
        {spotCheckModal && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.08]">
              <p className="text-sm font-semibold text-white">{spotCheckModal.businessName}</p>
              <p className="text-xs text-slate-400 mt-1">{spotCheckModal.bookingsLast30} bookings (expected {spotCheckModal.expectedMin})</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setSpotCheckModal(null); addToast('Spot check: Legitimate — marked OK', 'success') }}
                className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm font-medium transition-all">
                <CheckCircle size={14} /> OK — Legit
              </button>
              <button onClick={() => { setSpotCheckModal(null); addToast('Spot check: Issue found — alert escalated', 'warning') }}
                className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium transition-all">
                <X size={14} /> Issue Found
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}