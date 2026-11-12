/**
 * @file        FaqApprovals.jsx
 * @module      FAQ approvals (Batch 2)
 * @project     Admin-FrontEnd
 * @layer       Page
 * @description FAQs of healthcare businesses (and of businesses not yet classified) wait here for an explicit admin
 *              decision before the AI receptionist may use them. The admin sees the business, question, answer,
 *              category, version, submission time and any deterministic conflict, then approves or rejects that exact
 *              version (a rejection needs a reason the owner will see). If the owner edited the FAQ meanwhile the
 *              backend refuses the stale decision and the list reloads. Only SUPER_ADMIN / ADMIN (approve_signups) can act.
 *              Consistent with the healthcare classification review on New Clients / Business detail.
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useToast } from '../context/ToastContext'
import { getFaqApprovals, approveFaq, rejectFaq } from '../api/admin'

const REASON = { HEALTHCARE_REVIEW: 'Healthcare business', AWAITING_CLASSIFICATION: 'Business not yet classified' }
const when = (v) => {
  const ms = v?._seconds != null ? v._seconds * 1000 : v?.seconds != null ? v.seconds * 1000 : typeof v === 'string' ? Date.parse(v) : null
  return ms ? new Date(ms).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

function FaqReviewCard({ faq, onDone }) {
  const { addToast } = useToast()
  const [mode, setMode] = useState(null) // null | 'reject'
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const act = async (fn, ok) => {
    setBusy(true)
    try { await fn(); addToast(ok, 'success'); onDone() }
    catch (err) {
      const code = err.response?.data?.code
      addToast(err.response?.data?.error || 'Action failed', 'error')
      if (code === 'STALE_VERSION' || code === 'NOT_PENDING' || code === 'FAQ_DELETED' || code === 'BUSINESS_UNCLASSIFIED' || err.response?.status === 404) onDone()
    } finally { setBusy(false) }
  }

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link to={`/businesses/${faq.businessId}`} className="text-sm font-semibold text-indigo-300 hover:underline">{faq.businessName || faq.businessId}</Link>
          <p className="text-[11px] text-slate-500">{REASON[faq.pendingReason] || 'Awaiting approval'} · version {faq.version} · submitted {when(faq.submittedAt)}{faq.enabled ? '' : ' · currently disabled by the owner'}{faq.legacy ? ' · existing FAQ (created before approvals; not used by the AI until approved)' : ''}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300">{faq.category || 'general'}</span>
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-0.5">Question</p>
        <p className="text-sm text-white break-words">{faq.question}</p>
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-0.5">Answer</p>
        <p className="text-sm text-slate-200 whitespace-pre-line break-words">{faq.answer}</p>
      </div>
      {faq.conflicts?.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
          {faq.conflicts.map((c, i) => <p key={i} className="text-[11px] text-amber-300"><b>{c.type.replace(/_/g, ' ').toLowerCase()}:</b> {c.detail}</p>)}
        </div>
      )}
      {mode === 'reject' ? (
        <div className="space-y-2">
          <label className="block text-[11px] text-slate-400">Reason (shown to the business owner, 3–500 characters)</label>
          <textarea className="input-field w-full text-xs" rows={2} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} disabled={busy} />
          <div className="flex gap-2">
            <button className="btn-ghost text-xs px-3 py-1.5 text-red-400" disabled={busy || text.trim().length < 3}
              onClick={() => act(() => rejectFaq(faq.faqId, faq.version, text.trim()), 'FAQ rejected')}>Confirm rejection</button>
            <button className="btn-ghost text-xs px-3 py-1.5" disabled={busy} onClick={() => setMode(null)}>Cancel</button>
          </div>
        </div>
      ) : faq.requiresClassification ? (
        <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-sky-300">This business is not classified yet. None of its FAQs reach the AI until it is — classify it first (healthcare or not), then review.</p>
          <Link to={`/businesses/${faq.businessId}`} className="btn-ghost text-xs px-3 py-1.5 text-sky-300">Classify business →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          <input className="input-field w-full text-xs py-1" maxLength={500} placeholder="Note (optional)" value={text} onChange={(e) => setText(e.target.value)} disabled={busy} />
          <div className="flex gap-2">
            <button className="btn-primary text-xs px-3 py-1.5" disabled={busy}
              onClick={() => act(() => approveFaq(faq.faqId, faq.version, text.trim()), 'FAQ approved — the AI receptionist can now use it')}>Approve version {faq.version}</button>
            <button className="btn-ghost text-xs px-3 py-1.5 text-red-400" disabled={busy} onClick={() => { setText(''); setMode('reject') }}>Reject…</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FaqApprovals() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setFaqs((await getFaqApprovals()).faqs || []) }
    catch (err) {
      setError(err.response?.status === 403 ? 'Only Super Admins and Admins can review FAQs.' : (err.response?.data?.error || 'FAQs could not be loaded'))
      setFaqs([])
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  return (
    <Layout title="FAQ Approvals">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-xs text-slate-400 flex items-center gap-2 max-w-2xl">
          <ShieldCheck className="w-4 h-4 text-indigo-300 shrink-0" />
          FAQs of healthcare businesses are used by the AI receptionist only after an explicit approval of that exact version. Editing an approved FAQ sends it back here.
        </p>
        <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1" onClick={load} disabled={loading}><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
      </div>
      {loading ? <p className="text-sm text-slate-400">Loading…</p>
        : error ? <div className="card p-5"><p className="text-sm text-red-400">{error}</p></div>
          : !faqs.length ? <div className="card p-8 text-center"><p className="text-sm text-slate-300">No FAQs are awaiting approval.</p></div>
            : <div className="space-y-4">{faqs.map((f) => <FaqReviewCard key={`${f.faqId}:${f.version}`} faq={f} onDone={load} />)}</div>}
    </Layout>
  )
}
