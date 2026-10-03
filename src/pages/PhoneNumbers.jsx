/**
 * @file        PhoneNumbers.jsx
 * @module      Phone Numbers
 * @project     Admin-FrontEnd
 * @layer       Page
 * @description Virtual-number requests and manual Exotel provisioning (pre-launch Phase 4).
 *
 *   Workflow (enforced by the backend):
 *     PENDING → Start (IN_PROGRESS) → buy + configure the number in Exotel (outside Zyntell)
 *       → Allocate (stores the number — NOT live, invisible to the business)
 *       → test call → Activate (ACTIVE: visible to the business and routed to the AI Receptionist)
 *   Reject (reason required) / Cancel are available until the number is active. Leaving ALLOCATED releases
 *   the allocated number. V1: one number per business.
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import {
  getNumberRequests, updateNumberRequestStatus, allocateNumber, activateNumber, releaseNumber,
} from '../api/admin'
import { Phone, RefreshCw, Play, XCircle, Ban, Undo2, Zap, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const FILTERS = ['ALL', 'PENDING', 'IN_PROGRESS', 'ALLOCATED', 'ACTIVE', 'REJECTED', 'CANCELLED']

const STATUS_STYLE = {
  PENDING:     'badge-yellow',
  IN_PROGRESS: 'badge-indigo',
  ALLOCATED:   'badge-violet',
  ACTIVE:      'badge-green',
  REJECTED:    'badge-red',
  CANCELLED:   'badge-gray',
}

/** Firestore timestamps arrive as { _seconds } over JSON */
const fmt = (v) => {
  if (!v) return '—'
  const d = typeof v === 'string' ? new Date(v) : v._seconds != null ? new Date(v._seconds * 1000) : null
  return d ? d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

export default function PhoneNumbers() {
  const { addToast } = useToast()
  const [filter, setFilter] = useState('ALL')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // [STATE]: Action modal — { kind: 'allocate'|'activate'|'reject'|'cancel'|'release', request }
  const [action, setAction] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [note, setNote] = useState('')
  const [tested, setTested] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNumberRequests(filter === 'ALL' ? {} : { status: filter })
      setRequests(data.requests || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load number requests')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  const openAction = (kind, request) => {
    setAction({ kind, request })
    setPhoneNumber(request.preferredNumber || '')
    setNote('')
    setTested(false)
  }

  const run = async (fn, success) => {
    setBusy(true)
    try {
      await fn()
      addToast(success, 'success')
      setAction(null)
      window.dispatchEvent(new Event('zyntell:number-requests-changed'))
      await fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Action failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  const start = (r) => run(() => updateNumberRequestStatus(r.id, 'IN_PROGRESS'), 'Request moved to In progress')
  const backToPending = (r) => run(() => updateNumberRequestStatus(r.id, 'PENDING'), 'Request moved back to Pending')

  const submitAction = () => {
    const { kind, request: r } = action
    if (kind === 'allocate') {
      return run(() => allocateNumber(r.businessId, { phoneNumber, requestId: r.id, note }), 'Number allocated — not live yet. Test it, then activate.')
    }
    if (kind === 'activate') {
      return run(() => activateNumber(r.businessId, r.number.id, note), 'Number is now ACTIVE and visible to the business')
    }
    if (kind === 'release') return run(() => updateNumberRequestStatus(r.id, 'IN_PROGRESS', note), 'Allocated number released')
    if (kind === 'deactivate') return run(() => releaseNumber(r.businessId, r.number.id, note), 'Number deactivated')
    if (kind === 'reject') return run(() => updateNumberRequestStatus(r.id, 'REJECTED', note), 'Request rejected')
    if (kind === 'cancel') return run(() => updateNumberRequestStatus(r.id, 'CANCELLED', note), 'Request cancelled')
    return null
  }

  const modalTitle = {
    allocate: 'Allocate Exotel number',
    activate: 'Activate number',
    release: 'Release allocated number',
    deactivate: 'Deactivate number',
    reject: 'Reject request',
    cancel: 'Cancel request',
  }[action?.kind] || ''

  const submitDisabled = busy
    || (action?.kind === 'allocate' && !phoneNumber.trim())
    || (action?.kind === 'activate' && !tested)
    || (action?.kind === 'reject' && note.trim().length < 3)

  return (
    <Layout title="Phone Numbers">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                filter === f ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-white/5')}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button onClick={fetchData} className="btn-ghost text-xs px-3 py-1.5 gap-1.5"><RefreshCw size={12} /> Refresh</button>
      </div>

      <div className="card p-4 mb-5 text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-200">Workflow:</strong> Start → buy &amp; configure the number in Exotel →
        Allocate (stored, <em>not live</em>) → make a test call → Activate (live for the business and its AI Receptionist).
        One number per business in V1.
      </div>

      {loading ? (
        <div className="card p-4 animate-pulse h-64" />
      ) : error ? (
        <div className="card p-8 text-center text-red-400 text-sm">{error}</div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 text-sm">
          <Phone size={22} className="mx-auto mb-2 opacity-50" />
          No {filter === 'ALL' ? '' : filter.replace('_', ' ').toLowerCase() + ' '}number requests
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-left">
                <th className="p-3">Business</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Requested</th>
                <th className="p-3">Preference / notes</th>
                <th className="p-3">Number</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((r) => (
                <tr key={r.id} className="align-top hover:bg-white/[0.02]">
                  <td className="p-3">
                    <Link to={`/businesses/${r.businessId}`} className="text-white font-medium hover:underline">{r.business?.name || r.businessName || '—'}</Link>
                    <p className="text-slate-500 font-mono text-[10px] mt-0.5">{r.businessId}</p>
                  </td>
                  <td className="p-3 text-slate-300">
                    {r.business?.plan || '—'}
                    {r.business?.isTrialActive && <span className="ml-1 text-amber-400">(trial)</span>}
                  </td>
                  <td className="p-3">
                    <span className={clsx('badge', STATUS_STYLE[r.status] || 'badge-gray')}>{r.status.replace('_', ' ')}</span>
                    {r.statusReason && <p className="text-slate-500 mt-1 max-w-[180px]">{r.statusReason}</p>}
                  </td>
                  <td className="p-3 text-slate-400">{fmt(r.createdAt)}</td>
                  <td className="p-3 text-slate-400 max-w-[220px]">
                    {r.preferredArea && <p>Area: <span className="text-slate-200">{r.preferredArea}</span></p>}
                    {r.preferredNumber && <p>Number: <span className="text-slate-200 font-mono">{r.preferredNumber}</span></p>}
                    {r.notes && <p className="mt-0.5">“{r.notes}”</p>}
                    {!r.preferredArea && !r.preferredNumber && !r.notes && '—'}
                  </td>
                  <td className="p-3">
                    {r.number ? (
                      <>
                        <p className="text-white font-mono">{r.number.phoneNumber}</p>
                        <p className={clsx('mt-0.5 font-semibold', r.number.status === 'ACTIVE' ? 'text-emerald-400' : 'text-violet-300')}>
                          {r.number.status === 'ACTIVE' ? '● Active' : '○ Allocated — not live'}
                        </p>
                        <p className="text-slate-500 mt-0.5">Allocated {fmt(r.number.assignedAt)}</p>
                        {r.number.trial?.isTrialNumber && (
                          <p className={clsx('mt-0.5 font-semibold', r.number.trial.expired ? 'text-red-400' : 'text-amber-400')}>
                            {r.number.trial.expired
                              ? `Trial period ended ${fmt(r.number.trial.endsAt)} — deactivate unless upgraded`
                              : `14-day trial number · ends ${fmt(r.number.trial.endsAt)}`}
                          </p>
                        )}
                        {r.number.activatedAt && <p className="text-slate-500">Activated {fmt(r.number.activatedAt)}</p>}
                      </>
                    ) : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      {r.status === 'PENDING' && (
                        <button disabled={busy} onClick={() => start(r)} className="btn-primary text-[11px] px-2.5 py-1 gap-1"><Play size={11} /> Start</button>
                      )}
                      {r.status === 'IN_PROGRESS' && (
                        <>
                          <button disabled={busy} onClick={() => openAction('allocate', r)} className="btn-primary text-[11px] px-2.5 py-1 gap-1"><Phone size={11} /> Allocate number</button>
                          <button disabled={busy} onClick={() => backToPending(r)} className="btn-ghost text-[11px] px-2.5 py-1 gap-1"><Undo2 size={11} /> Pending</button>
                        </>
                      )}
                      {r.status === 'ALLOCATED' && r.number && (
                        <>
                          <button disabled={busy} onClick={() => openAction('activate', r)} className="btn-primary text-[11px] px-2.5 py-1 gap-1"><Zap size={11} /> Update status: Activate</button>
                          <button disabled={busy} onClick={() => openAction('release', r)} className="btn-ghost text-[11px] px-2.5 py-1 gap-1"><Undo2 size={11} /> Release</button>
                        </>
                      )}
                      {['PENDING', 'IN_PROGRESS', 'ALLOCATED'].includes(r.status) && (
                        <>
                          <button disabled={busy} onClick={() => openAction('reject', r)} className="btn-ghost text-[11px] px-2.5 py-1 gap-1 text-red-400"><XCircle size={11} /> Reject</button>
                          <button disabled={busy} onClick={() => openAction('cancel', r)} className="btn-ghost text-[11px] px-2.5 py-1 gap-1"><Ban size={11} /> Cancel</button>
                        </>
                      )}
                      {r.status === 'ACTIVE' && r.number?.status === 'ACTIVE' && (
                        <>
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Live</span>
                          <button disabled={busy} onClick={() => openAction('deactivate', r)} className="btn-ghost text-[11px] px-2.5 py-1 gap-1 text-red-400"><Ban size={11} /> Deactivate</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!action} onClose={() => setAction(null)} title={modalTitle}>
        {action && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-400">{action.request.business?.name || action.request.businessName}</p>

            {action.kind === 'allocate' && (
              <>
                <p className="text-xs text-slate-400">
                  Enter the Exotel number you have <strong>already bought and configured</strong>. It will be stored for this
                  business but will NOT be live or visible to the business until you activate it.
                </p>
                <label className="block">
                  <span className="text-xs text-slate-400">Exotel phone number</span>
                  <input className="input-field w-full mt-1 font-mono" placeholder="+91 80 4719 1234" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </label>
              </>
            )}

            {action.kind === 'activate' && (
              <>
                <p className="text-xs text-slate-400">
                  Activating makes <span className="font-mono text-white">{action.request.number?.phoneNumber}</span> live: it becomes
                  visible to the business and inbound calls are routed to it. The business must have its map location set.
                  For a trial business this starts a 14-day trial number: you'll be notified when it ends, and it stays
                  active until you deactivate it (or the business upgrades).
                </p>
                <label className="flex items-start gap-2 text-xs text-slate-300">
                  <input type="checkbox" className="mt-0.5 accent-indigo-500" checked={tested} onChange={(e) => setTested(e.target.checked)} />
                  I made a test call to this number and it reached the business's AI Receptionist.
                </label>
              </>
            )}

            {action.kind === 'deactivate' && (
              <p className="text-xs text-slate-400">
                <span className="font-mono text-white">{action.request.number?.phoneNumber}</span> stops being live immediately: it disappears
                from the business's dashboard and calls are no longer routed. The request is closed. Release the number in Exotel
                separately if needed.
              </p>
            )}

            {action.kind === 'release' && (
              <p className="text-xs text-slate-400">The allocated (never live) number is released and the request returns to In progress so a different number can be allocated. Release it in Exotel separately if needed.</p>
            )}

            <label className="block">
              <span className="text-xs text-slate-400">{action.kind === 'reject' ? 'Reason (shown to the business)' : 'Note (optional)'}</span>
              <textarea className="input-field w-full mt-1" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>

            <div className="flex gap-2 justify-end">
              <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => setAction(null)}>Close</button>
              <button className="btn-primary text-xs px-3 py-1.5" disabled={submitDisabled} onClick={submitAction}>
                {busy ? 'Working…' : modalTitle}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
