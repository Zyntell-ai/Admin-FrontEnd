import { useState, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { commissions } from '../data/mockData'
import { Download, CheckCircle, Zap, User, X } from 'lucide-react'
import clsx from 'clsx'

const CATEGORIES = ['All', 'Healthcare', 'Restaurant', 'Real Estate', 'Beauty']
const STATUSES = ['All', 'PENDING', 'CONFIRMED', 'DISPUTED', 'WAIVED']

function TypeBadge({ type }) {
  const map = { SHOWUP: 'badge-green', BOOKING: 'badge-indigo', LEAD: 'badge-yellow', ADJUSTMENT: 'badge-gray' }
  return <span className={clsx('badge text-[10px]', map[type])}>{type}</span>
}

function StatusBadge({ status }) {
  const map = { CONFIRMED: 'badge-green', PENDING: 'badge-indigo', DISPUTED: 'badge-red', WAIVED: 'badge-gray' }
  return <span className={clsx('badge text-[10px]', map[status])}>{status}</span>
}

export default function Commissions() {
  const { addToast } = useToast()
  const [activeCategory, setActiveCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [commList, setCommList] = useState(commissions)
  const [disputeModal, setDisputeModal] = useState(null)
  const [disputeNote, setDisputeNote] = useState('')

  const filtered = useMemo(() => {
    let rows = activeCategory === 'All' ? commList : commList.filter(c => c.category === activeCategory)
    if (statusFilter !== 'All') rows = rows.filter(c => c.status === statusFilter)
    return rows
  }, [commList, activeCategory, statusFilter])

  const totals = useMemo(() => filtered.reduce((acc, c) => {
    acc.total += c.amount
    if (c.status === 'CONFIRMED') acc.confirmed += c.amount
    if (c.status === 'PENDING') acc.pending += c.amount
    if (c.status === 'DISPUTED') acc.disputed += c.amount
    return acc
  }, { total: 0, confirmed: 0, pending: 0, disputed: 0 }), [filtered])

  const confirmComm = (id, bizName) => {
    setCommList(prev => prev.map(c => c.id === id ? { ...c, status: 'CONFIRMED' } : c))
    addToast(`Commission confirmed — ${bizName}`, 'success')
  }

  const waiveComm = (id, bizName) => {
    setCommList(prev => prev.map(c => c.id === id ? { ...c, status: 'WAIVED' } : c))
    addToast(`Commission waived — ${bizName}`, 'warning')
  }

  const resolveDispute = (id) => {
    setCommList(prev => prev.map(c => c.id === id ? { ...c, status: 'CONFIRMED' } : c))
    addToast('Dispute resolved — Commission confirmed', 'success')
    setDisputeModal(null)
    setDisputeNote('')
  }

  const confirmAll = () => {
    const pendingCount = commList.filter(c => c.status === 'PENDING').length
    setCommList(prev => prev.map(c => c.status === 'PENDING' ? { ...c, status: 'CONFIRMED' } : c))
    addToast(`${pendingCount} commissions confirmed`, 'success')
  }

  const confirmRate = Math.round((commList.filter(c => c.status === 'CONFIRMED').length / commList.length) * 100)

  return (
    <Layout title="Commissions">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="page-title mb-0.5">Commissions</h1><p className="text-sm text-slate-500">Track, verify, and manage all commission events</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => addToast('CSV exported', 'success')} className="btn-ghost"><Download size={13} /> Export</button>
          <button onClick={confirmAll} className="btn-primary">Confirm All Pending</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Commission', value: `₹${totals.total.toLocaleString()}`, color: 'metric-gold', gold: true },
          { label: 'Confirmed', value: `₹${totals.confirmed.toLocaleString()}`, color: 'text-emerald-400' },
          { label: 'Pending', value: `₹${totals.pending.toLocaleString()}`, color: 'text-indigo-400' },
          { label: 'Disputed', value: `₹${totals.disputed.toLocaleString()}`, color: 'text-red-400' },
        ].map(({ label, value, color, gold }) => (
          <div key={label} className={clsx('card p-5', gold && 'border-gold/15')}>
            <p className="stat-label mb-1">{label}</p>
            <p className={clsx('text-2xl font-bold font-display', color)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-5 flex items-center gap-5">
        <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-400 font-medium">Overall Confirmation Rate</p>
            <p className="text-sm font-bold text-white">{confirmRate}%</p>
          </div>
          <div className="bg-white/5 rounded-full h-2"><div className="bg-gradient-indigo h-2 rounded-full transition-all duration-700" style={{ width: `${confirmRate}%` }} /></div>
        </div>
        <p className="text-xs text-slate-500 flex-shrink-0">{commList.filter(c => c.status === 'CONFIRMED').length} of {commList.length}</p>
      </div>

      <div className="flex items-center justify-between mb-0">
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={clsx('px-3 py-1.5 rounded-md text-[10px] font-medium transition-all', statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}>{s}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-0 border-b border-white/[0.06] mt-3">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={clsx('px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px', activeCategory === cat ? 'text-white border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-200')}>
            {cat}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Business', 'Category', 'Type', 'Amount', 'Status', 'Triggered By', 'Signal Score', 'Date', 'Invoice', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] table-row-hover">
                <td className="px-4 py-3 text-sm font-semibold text-white">{c.businessName}</td>
                <td className="px-4 py-3"><span className="badge badge-indigo text-[10px]">{c.category}</span></td>
                <td className="px-4 py-3"><TypeBadge type={c.type} /></td>
                <td className="px-4 py-3"><span className={clsx('font-bold font-display text-sm', c.status === 'CONFIRMED' ? 'metric-gold' : 'text-white')}>₹{c.amount}</span></td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {['BOT', 'GPS', 'OTP'].includes(c.triggeredBy) ? <Zap size={12} className="text-indigo-400" /> : <User size={12} className="text-amber-400" />}
                    <span className="text-xs text-slate-400">{c.triggeredBy}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {c.signalScore != null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-white/5 rounded-full h-1.5"><div className={clsx('h-1.5 rounded-full', c.signalScore >= 130 ? 'bg-emerald-500' : c.signalScore >= 80 ? 'bg-indigo-500' : 'bg-amber-500')} style={{ width: `${(c.signalScore / 175) * 100}%` }} /></div>
                      <span className={clsx('text-xs font-bold', c.signalScore >= 130 ? 'text-emerald-400' : c.signalScore >= 80 ? 'text-indigo-400' : 'text-amber-400')}>{c.signalScore}</span>
                    </div>
                  ) : <span className="text-slate-600 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.createdAt}</td>
                <td className="px-4 py-3 text-xs">{c.invoiceId ? <span className="text-emerald-400 font-mono">{c.invoiceId}</span> : <span className="text-amber-400 font-medium">Unbilled</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {c.status === 'PENDING' && (
                      <button onClick={() => confirmComm(c.id, c.businessName)} className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md transition-all">Confirm</button>
                    )}
                    {c.status === 'DISPUTED' && (
                      <button onClick={() => setDisputeModal(c)} className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-md transition-all">Resolve</button>
                    )}
                    {c.status === 'CONFIRMED' && (
                      <button onClick={() => waiveComm(c.id, c.businessName)} className="text-[10px] btn-ghost px-2 py-1">Waive</button>
                    )}
                    <button className="text-[10px] btn-ghost px-2 py-1">Details</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-8 text-center text-sm text-slate-500">No commissions match the current filters</div>}
      </div>

      <Modal open={!!disputeModal} onClose={() => setDisputeModal(null)} title="Resolve Dispute">
        {disputeModal && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.08]">
              <p className="text-sm font-semibold text-white">{disputeModal.businessName}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span>Type: <span className="text-white">{disputeModal.type}</span></span>
                <span>Amount: <span className="text-white font-semibold">₹{disputeModal.amount}</span></span>
                <span>Score: <span className="text-white">{disputeModal.signalScore}/175</span></span>
              </div>
            </div>
            <div><label className="text-xs text-slate-400 mb-1 block">Resolution Notes</label><textarea value={disputeNote} onChange={e => setDisputeNote(e.target.value)} rows={3} placeholder="Describe how the dispute was resolved..." className="input-field resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => resolveDispute(disputeModal.id)} className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"><CheckCircle size={14} /> Confirm Commission</button>
              <button onClick={() => { waiveComm(disputeModal.id, disputeModal.businessName); setDisputeModal(null) }} className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"><X size={14} /> Waive</button>
            </div>
            <button onClick={() => setDisputeModal(null)} className="btn-ghost w-full justify-center">Cancel</button>
          </div>
        )}
      </Modal>
    </Layout>
  )
}