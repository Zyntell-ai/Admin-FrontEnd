/**
 * @file        NewClients.jsx
 * @module      New Clients
 * @project     Admin-FrontEnd
 * @layer       Page
 * @description Review queue for business signups (admin-approved signup).
 *
 *   Flow (enforced by the backend): a business registers → completes onboarding → its application appears here as
 *   "Awaiting review" → an admin approves (access opens and the 14-day trial starts) or rejects with a reason (the
 *   applicant sees the reason; access stays closed). Until approved, the business cannot use any product feature.
 *   Approval does not assign a phone number or send any message. Only SUPER_ADMIN / ADMIN may decide; other roles
 *   with business access see the queue read-only. A decision made meanwhile by another admin returns a conflict —
 *   the list refreshes and nothing is applied twice.
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { getSignupRequests, getSignupRequest, approveSignupRequest, rejectSignupRequest } from '../api/admin'
import { UserPlus, RefreshCw, CheckCircle, XCircle, Eye } from 'lucide-react'
import clsx from 'clsx'

const FILTERS = [
  { status: 'pending_review', label: 'Awaiting review' },
  { status: 'rejected', label: 'Rejected' },
  { status: 'approved', label: 'Approved' },
  { status: 'pending_onboarding', label: 'Signup in progress' },
]

const STATUS_STYLE = {
  pending_review: 'badge-indigo',
  rejected: 'badge-red',
  approved: 'badge-green',
  pending_onboarding: 'badge-gray',
}
const STATUS_LABEL = Object.fromEntries(FILTERS.map((f) => [f.status, f.label]))
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const REASON_MIN = 3

/** ISO strings or Firestore timestamps ({ _seconds }) over JSON */
const fmt = (v) => {
  if (!v) return '—'
  const d = typeof v === 'string' ? new Date(v) : v._seconds != null ? new Date(v._seconds * 1000) : null
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}
const money = (s) => {
  if (s.price) return `₹${s.price}`
  if (s.priceMin || s.priceMax) return `₹${s.priceMin || '?'}–${s.priceMax || '?'}`
  return '—'
}

export default function NewClients() {
  const { addToast } = useToast()
  const [filter, setFilter] = useState('pending_review')
  const [requests, setRequests] = useState([])
  const [canDecide, setCanDecide] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // [STATE]: Review modal — the selected application and its full details
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailError, setDetailError] = useState(null)
  const [mode, setMode] = useState('review') // 'review' | 'reject'
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSignupRequests(filter)
      setRequests(data.requests || [])
      setCanDecide(!!data.canDecide)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load signup applications')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  const openReview = async (r) => {
    setSelected(r)
    setDetail(null)
    setDetailError(null)
    setMode('review')
    setReason('')
    try {
      setDetail(await getSignupRequest(r.id))
    } catch (err) {
      setDetailError(err.response?.data?.error || 'Failed to load this application')
    }
  }
  const close = () => { if (!busy) setSelected(null) }

  const decide = async (kind) => {
    setBusy(true)
    try {
      if (kind === 'approve') {
        const res = await approveSignupRequest(selected.id)
        const access = res.trialStarted
          ? 'access is open and the 14-day trial has started'
          : `access is open on its existing ${res.plan || ''} plan (no trial started)`
        addToast(res.suspended
          ? `${selected.name} approved — ${res.trialStarted ? 'trial started, but ' : ''}the account is still suspended`
          : `${selected.name} approved — ${access}`, 'success')
      } else {
        await rejectSignupRequest(selected.id, reason.trim())
        addToast(`${selected.name} rejected`, 'success')
      }
      setSelected(null)
      window.dispatchEvent(new Event('zyntell:signup-requests-changed'))
      await fetchData()
    } catch (err) {
      const code = err.response?.data?.code
      addToast(err.response?.data?.error || 'Action failed', 'error')
      // [GUARD]: Stale application (decided meanwhile by another admin) — close and show the current list
      if (code === 'APPROVAL_CONFLICT' || err.response?.status === 404) {
        setSelected(null)
        window.dispatchEvent(new Event('zyntell:signup-requests-changed'))
        await fetchData()
      }
    } finally {
      setBusy(false)
    }
  }

  const pendingView = filter === 'pending_review'

  return (
    <Layout title="New Clients">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.status}
              onClick={() => setFilter(f.status)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                filter === f.status ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-white/5')}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={fetchData} className="btn-ghost text-xs px-3 py-1.5 gap-1.5"><RefreshCw size={12} /> Refresh</button>
      </div>

      <div className="card p-4 mb-5 text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-200">Review:</strong> a business appears here after it completes signup and setup.
        It cannot use Zyntell until approved. <strong className="text-slate-200">Approve</strong> opens access and starts
        its 14-day free trial (no phone number is assigned and no message is sent).{' '}
        <strong className="text-slate-200">Reject</strong> keeps access closed; your reason is shown to the applicant.
        {!canDecide && <span className="block mt-1 text-amber-400">Your role can view applications but not approve or reject them.</span>}
      </div>

      {loading ? (
        <div className="card p-4 animate-pulse h-64" />
      ) : error ? (
        <div className="card p-8 text-center text-red-400 text-sm">{error}</div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 text-sm">
          <UserPlus size={22} className="mx-auto mb-2 opacity-50" />
          {pendingView ? 'No applications awaiting review' : `No ${STATUS_LABEL[filter].toLowerCase()} applications`}
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-left">
                <th className="p-3">Business</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Contact</th>
                <th className="p-3">{pendingView ? 'Submitted' : 'Signed up'}</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((r) => (
                <tr key={r.id} className="align-top hover:bg-white/[0.02]">
                  <td className="p-3">
                    <Link to={`/businesses/${r.id}`} className="text-white font-medium hover:underline">{r.name || '—'}</Link>
                    <p className="text-slate-500 font-mono text-[10px] mt-0.5">{r.id}</p>
                  </td>
                  <td className="p-3 text-slate-300">
                    {r.category || '—'}
                    {r.subCategory && <span className="text-slate-500"> · {r.subCategory}</span>}
                    {r.categoryType === 'custom' && <span className="ml-1 text-amber-400">(custom)</span>}
                  </td>
                  <td className="p-3 text-slate-300">{[r.locality, r.city].filter(Boolean).join(', ') || '—'}</td>
                  <td className="p-3 text-slate-400">
                    <p>{r.email || '—'}</p>
                    {r.phone && <p className="font-mono mt-0.5">{r.phone}</p>}
                  </td>
                  <td className="p-3 text-slate-400">{fmt(pendingView ? r.submittedForReviewAt : r.createdAt)}</td>
                  <td className="p-3">
                    <span className={clsx('badge', STATUS_STYLE[r.approvalStatus] || 'badge-gray')}>{STATUS_LABEL[r.approvalStatus] || r.approvalStatus}</span>
                    {!r.isActive && <p className="text-red-400 mt-1">Suspended</p>}
                    {r.rejectionReason && <p className="text-slate-500 mt-1 max-w-[220px]">{r.rejectionReason}</p>}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <button onClick={() => openReview(r)} className={clsx('text-[11px] px-2.5 py-1 gap-1', r.approvalStatus === 'pending_review' && canDecide ? 'btn-primary' : 'btn-ghost')}>
                        <Eye size={11} /> {r.approvalStatus === 'pending_review' && canDecide ? 'Review' : 'View'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!selected} onClose={close} title={selected ? `Application — ${selected.name}` : ''} size="lg">
        {selected && (
          <div className="space-y-5 text-sm">
            {detailError ? (
              <p className="text-red-400 text-xs">{detailError}</p>
            ) : !detail ? (
              <div className="animate-pulse h-40 rounded-lg bg-white/5" />
            ) : (
              <>
                <section className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {[
                    ['Business', detail.business.name],
                    ['Category', [detail.business.category, detail.business.subCategory].filter(Boolean).join(' · ')],
                    ['City / locality', [detail.business.locality, detail.business.city].filter(Boolean).join(', ')],
                    ['Email', detail.business.email],
                    ['Phone', detail.business.phone],
                    ['Address', detail.location?.address],
                    ['Map pin', detail.location?.mapPinSet ? 'Set' : 'Not set (needed before a number can go live)'],
                    ['Bot persona / language', [detail.settings.botPersona, detail.settings.language].filter(Boolean).join(' · ')],
                    ['Signed up', fmt(detail.business.createdAt)],
                    ['Submitted', fmt(detail.request.submittedForReviewAt)],
                    ['Status', STATUS_LABEL[detail.request.approvalStatus] || detail.request.approvalStatus],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-slate-500">{label}</p>
                      <p className="text-slate-200 break-words">{value || '—'}</p>
                    </div>
                  ))}
                </section>
                {!detail.request.isActive && (
                  <p className="text-xs text-red-400">This account is suspended. Approving it will not lift the suspension.</p>
                )}

                <section>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Services ({detail.services.length})</h4>
                  {detail.services.length === 0 ? <p className="text-xs text-slate-500">None</p> : (
                    <ul className="text-xs text-slate-400 space-y-0.5">
                      {detail.services.map((s) => (
                        <li key={s.id}><span className="text-slate-200">{s.name}</span> · {s.duration ? `${s.duration} min` : '—'} · {money(s)}{s.description && <span className="text-slate-500"> — {s.description}</span>}</li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Staff ({detail.staff.length})</h4>
                  {detail.staff.length === 0 ? <p className="text-xs text-slate-500">None</p> : (
                    <ul className="text-xs text-slate-400 space-y-0.5">
                      {detail.staff.map((m) => <li key={m.id}><span className="text-slate-200">{m.name}</span>{m.role && ` · ${m.role}`}{m.specialization && ` · ${m.specialization}`}</li>)}
                    </ul>
                  )}
                </section>

                <section>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1.5">Working hours</h4>
                  <div className="grid grid-cols-7 gap-1 text-[11px]">
                    {detail.workingHours.map((h) => (
                      <div key={h.dayOfWeek} className="rounded bg-white/5 p-1.5 text-center">
                        <p className="text-slate-400">{DAYS[h.dayOfWeek]}</p>
                        <p className={h.isOpen ? 'text-slate-200' : 'text-slate-500'}>{h.isOpen ? `${h.startTime}–${h.endTime}` : 'Closed'}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {detail.history.length > 0 && (
                  <section>
                    <h4 className="text-xs font-semibold text-slate-300 mb-1.5">History</h4>
                    <ul className="text-xs text-slate-400 space-y-0.5">
                      {detail.history.map((h) => (
                        <li key={h.id}>
                          {fmt(h.at)} — <span className="text-slate-200">{h.action}</span>
                          {h.actorEmail && ` by ${h.actorEmail}`}
                          {h.reason && <span className="text-slate-500"> — “{h.reason}”</span>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {detail.request.approvalStatus === 'pending_review' && detail.canDecide && (
                  mode === 'reject' ? (
                    <section className="space-y-2">
                      <label className="block">
                        <span className="text-xs text-slate-400">Reason for rejection (shown to the applicant)</span>
                        <textarea className="input-field w-full mt-1" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
                      </label>
                      <div className="flex gap-2 justify-end">
                        <button className="btn-ghost text-xs px-3 py-1.5" disabled={busy} onClick={() => setMode('review')}>Back</button>
                        <button className="btn-primary text-xs px-3 py-1.5 gap-1 bg-red-600 hover:bg-red-500" disabled={busy || reason.trim().length < REASON_MIN} onClick={() => decide('reject')}>
                          <XCircle size={12} /> {busy ? 'Working…' : 'Reject application'}
                        </button>
                      </div>
                    </section>
                  ) : (
                    <div className="flex gap-2 justify-end pt-1">
                      <button className="btn-ghost text-xs px-3 py-1.5 gap-1 text-red-400" disabled={busy} onClick={() => setMode('reject')}><XCircle size={12} /> Reject…</button>
                      <button className="btn-primary text-xs px-3 py-1.5 gap-1" disabled={busy} onClick={() => decide('approve')}>
                        <CheckCircle size={12} /> {busy ? 'Working…' : 'Approve & start trial'}
                      </button>
                    </div>
                  )
                )}
              </>
            )}
            {(!detail || detail.request.approvalStatus !== 'pending_review' || !detail.canDecide) && (
              <div className="flex justify-end"><button className="btn-ghost text-xs px-3 py-1.5" onClick={close}>Close</button></div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
