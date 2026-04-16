import { useState, useMemo, useEffect, useCallback } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { invoices, businesses } from '../data/mockData'
import {
  Download, Plus, Send, RefreshCw, FileText,
  AlertCircle, CheckCircle, Clock, SlidersHorizontal, Mail, X
} from 'lucide-react'
import clsx from 'clsx'

const CATEGORIES = ['All', 'Healthcare', 'Restaurant', 'Real Estate', 'Beauty']

function StatusBadge({ status }) {
  const map = { PAID: 'badge-green', PENDING: 'badge-indigo', OVERDUE: 'badge-red', WAIVED: 'badge-gray' }
  const icons = { PAID: CheckCircle, PENDING: Clock, OVERDUE: AlertCircle, WAIVED: CheckCircle }
  const Icon = icons[status] || Clock
  return <span className={clsx('badge gap-1', map[status])}><Icon size={10} /> {status}</span>
}

// Countdown confirm button
function CountdownConfirm({ label, onConfirm, onCancel, seconds = 5, className }) {
  const [count, setCount] = useState(seconds)
  useEffect(() => {
    if (count <= 0) { onConfirm(); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, onConfirm])
  return (
    <div className="flex gap-3">
      <button onClick={onConfirm} className={clsx('flex-1 justify-center flex items-center gap-2', className)}>
        {label} {count > 0 && <span className="text-xs opacity-70">({count}s)</span>}
      </button>
      <button onClick={onCancel} className="btn-ghost flex-1 justify-center">Cancel</button>
    </div>
  )
}

export default function Billing() {
  const { addToast } = useToast()
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState([])
  const [invoiceList, setInvoiceList] = useState(invoices)

  const [generateModal, setGenerateModal] = useState(false)
  const [adjustModal, setAdjModal] = useState(null)
  const [manualModal, setManualModal] = useState(false)
  const [reminderModal, setReminderModal] = useState(null)
  const [paidModal, setPaidModal] = useState(null)

  const [genForm, setGenForm] = useState({ businessId: '', month: '2024-04', baseFee: 3000 })
  const [adjForm, setAdjForm] = useState({ amount: '', reason: '', type: 'add' })

  const filtered = useMemo(() =>
    activeCategory === 'All' ? invoiceList : invoiceList.filter(i => i.category === activeCategory)
  , [activeCategory, invoiceList])

  const totals = useMemo(() => filtered.reduce((acc, i) => {
    if (i.status === 'PAID') acc.paid += i.total
    else if (i.status === 'PENDING') acc.pending += i.total
    else if (i.status === 'OVERDUE') acc.overdue += i.total
    return acc
  }, { paid: 0, pending: 0, overdue: 0 }), [filtered])

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(i => i.id))

  const handleMarkPaid = useCallback((invoiceId) => {
    setInvoiceList(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'PAID', paidAt: '2024-04-14' } : i))
    setPaidModal(null)
    addToast('Invoice marked as paid', 'success')
  }, [addToast])

  const handleAdjustment = () => {
    const delta = adjForm.type === 'add' ? parseInt(adjForm.amount) : -parseInt(adjForm.amount)
    setInvoiceList(prev => prev.map(i => i.id === adjustModal.id ? { ...i, adjustments: i.adjustments + delta, total: i.total + delta } : i))
    setAdjModal(null)
    addToast(`Adjustment of ${adjForm.type === 'add' ? '+' : '-'}₹${adjForm.amount} applied`, 'success', adjForm.reason)
    setAdjForm({ amount: '', reason: '', type: 'add' })
  }

  const sameDayDue = filtered.filter(i => i.status !== 'PAID' && i.dueDate === '2024-04-15').length

  return (
    <Layout title="Billing">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title mb-0.5">Billing</h1>
          <p className="text-sm text-slate-500">Invoice management and payment tracking</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {sameDayDue > 0 && (
            <button onClick={() => addToast(`Reminders sent for ${sameDayDue} due-today invoices`, 'success')}
              className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-2 rounded-lg font-medium hover:bg-amber-500/20 transition-all">
              <Clock size={12} /> {sameDayDue} Due Today — Send All
            </button>
          )}
          <button onClick={() => setManualModal(true)} className="btn-ghost"><SlidersHorizontal size={13} /> Manual Entry</button>
          <button onClick={() => { addToast('CSV export started', 'success') }} className="btn-ghost"><Download size={13} /> Export</button>
          <button onClick={() => setGenerateModal(true)} className="btn-primary"><Plus size={13} /> Generate Invoice</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card p-5 border-emerald-500/15">
          <div className="flex items-center justify-between mb-2"><span className="stat-label">Collected</span><CheckCircle size={16} className="text-emerald-400" /></div>
          <p className="text-2xl font-bold font-display text-emerald-400">₹{totals.paid.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{filtered.filter(i => i.status === 'PAID').length} invoices paid</p>
        </div>
        <div className="card p-5 border-indigo-500/15">
          <div className="flex items-center justify-between mb-2"><span className="stat-label">Pending</span><Clock size={16} className="text-indigo-400" /></div>
          <p className="text-2xl font-bold font-display text-indigo-400">₹{totals.pending.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{filtered.filter(i => i.status === 'PENDING').length} invoices pending</p>
        </div>
        <div className="card p-5 border-red-500/15">
          <div className="flex items-center justify-between mb-2"><span className="stat-label">Overdue</span><AlertCircle size={16} className="text-red-400" /></div>
          <p className="text-2xl font-bold font-display text-red-400">₹{totals.overdue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{filtered.filter(i => i.status === 'OVERDUE').length} invoices overdue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-white/[0.06] mb-0">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={clsx('px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              activeCategory === cat ? 'text-white border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-200')}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll} className="rounded accent-indigo-500 cursor-pointer" />
              </th>
              {['Business', 'Category', 'Month', 'Base Fee', 'Commissions', 'Adjustments', 'Total', 'Status', 'Due Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className={clsx('border-b border-white/[0.04] table-row-hover', inv.status === 'OVERDUE' && 'bg-red-500/[0.02]', selected.includes(inv.id) && 'bg-indigo-500/5')}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(inv.id)} onChange={() => toggleSelect(inv.id)} className="rounded accent-indigo-500 cursor-pointer" />
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-white">{inv.businessName}</td>
                <td className="px-3 py-3"><span className="badge badge-indigo text-[10px]">{inv.category}</span></td>
                <td className="px-3 py-3 text-slate-400 text-xs">{inv.month}</td>
                <td className="px-3 py-3 text-slate-300 text-xs">₹{inv.baseFee.toLocaleString()}</td>
                <td className="px-3 py-3 text-slate-300 text-xs">₹{(inv.bookingCommissions + inv.showupCommissions + inv.leadCommissions).toLocaleString()}</td>
                <td className="px-3 py-3 text-xs">
                  {inv.adjustments !== 0
                    ? <span className={inv.adjustments > 0 ? 'text-red-400' : 'text-emerald-400'}>{inv.adjustments > 0 ? '+' : ''}₹{inv.adjustments.toLocaleString()}</span>
                    : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-3 py-3">
                  <span className={clsx('text-sm font-bold font-display', inv.status === 'OVERDUE' ? 'text-red-400' : inv.status === 'PAID' ? 'metric-gold' : 'text-white')}>
                    ₹{inv.total.toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-3 py-3 text-xs text-slate-400">{inv.dueDate}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => addToast('PDF generated', 'success', inv.businessName)} className="text-[10px] btn-ghost px-1.5 py-1 gap-1"><FileText size={9} /> PDF</button>
                    {inv.status !== 'PAID' && (
                      <>
                        <button onClick={() => setReminderModal(inv)} className="text-[10px] btn-ghost px-1.5 py-1 gap-1"><Send size={9} /> Remind</button>
                        <button onClick={() => setPaidModal(inv)}
                          className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-1.5 py-1 rounded-md transition-all">
                          Mark Paid
                        </button>
                      </>
                    )}
                    <button onClick={() => { setAdjModal(inv); setAdjForm({ amount: '', reason: '', type: 'add' }) }}
                      className="text-[10px] btn-ghost px-1.5 py-1 gap-1"><SlidersHorizontal size={9} /></button>
                    <button onClick={() => addToast('Invoice regenerated', 'info')} className="text-[10px] btn-ghost px-1.5 py-1 gap-1"><RefreshCw size={9} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="flex items-center gap-3 bg-[#0F1629] border border-indigo-500/30 rounded-2xl px-5 py-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{selected.length}</div>
              <span className="text-sm text-white font-medium">{selected.length} selected</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => { addToast(`Reminders sent for ${selected.length} invoices`, 'success'); setSelected([]) }}
              className="flex items-center gap-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg font-medium">
              <Mail size={12} /> Send Reminders
            </button>
            <button onClick={() => { addToast(`PDF batch generated for ${selected.length} invoices`, 'success'); setSelected([]) }}
              className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg font-medium">
              <FileText size={12} /> Bulk PDF
            </button>
            <button onClick={() => { addToast('Exported to CSV', 'success'); setSelected([]) }}
              className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg font-medium">
              <Download size={12} /> Export
            </button>
            <button onClick={() => setSelected([])} className="text-slate-500 hover:text-white transition-colors"><X size={15} /></button>
          </div>
        </div>
      )}

      {/* Mark Paid Modal with Countdown */}
      <Modal open={!!paidModal} onClose={() => setPaidModal(null)} title="Confirm Payment" size="sm">
        {paidModal && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.08]">
              <p className="text-sm font-semibold text-white">{paidModal.businessName}</p>
              <p className="text-xs text-slate-400 mt-1">Marking ₹{paidModal.total.toLocaleString()} as PAID for {paidModal.month}</p>
            </div>
            <p className="text-xs text-slate-500">This will update the invoice status and send a receipt to the business. Auto-confirming in a few seconds...</p>
            <CountdownConfirm
              label="Confirm Payment"
              seconds={5}
              onConfirm={() => handleMarkPaid(paidModal.id)}
              onCancel={() => setPaidModal(null)}
              className="btn-primary"
            />
          </div>
        )}
      </Modal>

      {/* Generate Invoice Modal */}
      <Modal open={generateModal} onClose={() => setGenerateModal(false)} title="Generate Invoice">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Business</label>
            <select value={genForm.businessId} onChange={e => setGenForm(f => ({ ...f, businessId: e.target.value }))} className="input-field">
              <option value="" className="bg-[#0F1629]">Select business...</option>
              {businesses.map(b => <option key={b.id} value={b.id} className="bg-[#0F1629]">{b.name} — {b.category}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Month</label>
              <input type="month" value={genForm.month} onChange={e => setGenForm(f => ({ ...f, month: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Base Fee (₹)</label>
              <input type="number" value={genForm.baseFee} onChange={e => setGenForm(f => ({ ...f, baseFee: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setGenerateModal(false); addToast('Invoice generated successfully', 'success') }} className="btn-primary flex-1 justify-center gap-2 flex items-center"><FileText size={13} /> Generate</button>
            <button onClick={() => setGenerateModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Adjustment Modal */}
      <Modal open={!!adjustModal} onClose={() => setAdjModal(null)} title={`Adjustment — ${adjustModal?.businessName}`}>
        {adjustModal && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.08] flex justify-between">
              <span className="text-xs text-slate-400">Current Total</span>
              <span className="text-white font-semibold text-sm">₹{adjustModal.total.toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              {['add', 'subtract'].map(t => (
                <button key={t} onClick={() => setAdjForm(f => ({ ...f, type: t }))}
                  className={clsx('flex-1 py-2.5 rounded-lg text-xs font-medium transition-all border', adjForm.type === t
                    ? t === 'add' ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-slate-400')}>
                  {t === 'add' ? '+ Add Charge' : '− Give Credit'}
                </button>
              ))}
            </div>
            <div><label className="text-xs text-slate-400 mb-1 block">Amount (₹)</label><input type="number" value={adjForm.amount} onChange={e => setAdjForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g., 500" className="input-field" /></div>
            <div><label className="text-xs text-slate-400 mb-1 block">Reason <span className="text-red-400">*</span></label><textarea value={adjForm.reason} onChange={e => setAdjForm(f => ({ ...f, reason: e.target.value }))} rows={2} placeholder="Reason for this adjustment..." className="input-field resize-none" /></div>
            <div className="flex gap-3">
              <button onClick={handleAdjustment} disabled={!adjForm.amount || !adjForm.reason} className="btn-primary flex-1 justify-center disabled:opacity-50">Apply Adjustment</button>
              <button onClick={() => setAdjModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reminder Modal */}
      <Modal open={!!reminderModal} onClose={() => setReminderModal(null)} title={reminderModal === 'bulk' ? 'Bulk Reminders' : `Reminder — ${reminderModal?.businessName}`} size="sm">
        {reminderModal && (
          <div className="space-y-4">
            <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.08] text-xs text-slate-300">
              Will send reminder to {reminderModal === 'bulk' ? `${selected.length} businesses` : `${reminderModal.businessName} for ₹${reminderModal.total?.toLocaleString()}`}
            </div>
            <textarea rows={2} placeholder="Optional personalised note..." className="input-field resize-none" />
            <div className="flex gap-3">
              <button onClick={() => { setReminderModal(null); addToast('Reminder sent', 'success') }} className="btn-primary flex-1 justify-center gap-2 flex items-center"><Mail size={13} /> Send</button>
              <button onClick={() => setReminderModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Entry Modal */}
      <Modal open={manualModal} onClose={() => setManualModal(false)} title="Manual Invoice Entry">
        <div className="space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"><p className="text-xs text-amber-400 font-medium">⚠ Manual Entry — use only for exceptional cases</p></div>
          {[{ label: 'Business Name', type: 'text' }, { label: 'Month', type: 'month' }, { label: 'Total Amount (₹)', type: 'number' }].map(({ label, type }) => (
            <div key={label}><label className="text-xs text-slate-400 mb-1 block">{label}</label><input type={type} className="input-field" /></div>
          ))}
          <div><label className="text-xs text-slate-400 mb-1 block">Reason</label><textarea rows={2} className="input-field resize-none" /></div>
          <div className="flex gap-3">
            <button onClick={() => { setManualModal(false); addToast('Manual invoice created', 'success') }} className="btn-primary flex-1 justify-center">Create Invoice</button>
            <button onClick={() => setManualModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}