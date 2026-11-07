/**
 * @file        CallInvestigationCard.jsx
 * @module      Business Detail — Call investigation (Phase 4)
 * @project     Admin-FrontEnd
 * @layer       Component
 * @description A business's Exotel calls for support / investigation: assigned number, call metadata (only what was
 *              reported — missing values stay "—"), date presets and "load more" pagination.
 *
 *              Recordings (strict policy): the "Play recording" control appears only for admins the backend says may
 *              access recordings (SUPER_ADMIN) and only while recording access is enabled. Each play is an explicit,
 *              audited request; the audio is streamed through the backend, kept only in this tab's memory and released
 *              when the player closes. There is no download control and the Exotel URL is never seen here.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { getBusinessCalls, getCallRecording, getRecordingAccessLog } from '../../api/admin'

const PAGE_SIZE = 25
const OUTCOME_LABEL = { BOOKED: 'Booked', ANSWERED: 'Answered', MISSED: 'Missed', IN_PROGRESS: 'In progress', UNKNOWN: 'Not reported' }
const OUTCOME_CLASS = { BOOKED: 'text-green-400', ANSWERED: 'text-blue-300', MISSED: 'text-red-400', IN_PROGRESS: 'text-amber-300', UNKNOWN: 'text-slate-400' }
const PRESETS = [7, 30, 90]

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const rangeFor = (days) => { const now = new Date(); return { from: isoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1))), to: isoDay(now) } }
const when = (iso) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—')
const duration = (s) => (s === null || s === undefined ? '—' : s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`)

/** In-memory player for one recording; the object URL is revoked when it closes */
function RecordingPlayer({ businessId, callSid, onClose, onAudited }) {
  const [state, setState] = useState({ loading: true, url: null, error: null })
  const urlRef = useRef(null)
  useEffect(() => {
    let cancelled = false
    getCallRecording(businessId, callSid)
      .then((blob) => {
        if (cancelled) return
        urlRef.current = URL.createObjectURL(blob)
        setState({ loading: false, url: urlRef.current, error: null })
      })
      .catch((err) => { if (!cancelled) setState({ loading: false, url: null, error: err.response?.data?.error || 'The recording could not be opened' }) })
      .finally(() => onAudited?.())
    return () => { cancelled = true; if (urlRef.current) URL.revokeObjectURL(urlRef.current) }
  }, [businessId, callSid]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 mt-2">
      {state.loading ? <p className="text-xs text-slate-400">Opening recording (this access is audited)…</p>
        : state.error ? <p className="text-xs text-amber-300">{state.error}</p>
          : <audio controls autoPlay controlsList="nodownload noplaybackrate" onContextMenu={(e) => e.preventDefault()} src={state.url} className="w-full" />}
      <button className="btn-ghost text-[11px] px-2 py-1 mt-2" onClick={onClose}>Close</button>
    </div>
  )
}

export default function CallInvestigationCard({ businessId }) {
  const [days, setDays] = useState(30)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [playing, setPlaying] = useState(null)
  const [audit, setAudit] = useState(null)

  const first = pages[0]
  const canPlay = Boolean(first?.canAccessRecordings && first?.recordingAccessEnabled)
  const seen = new Set()
  const calls = pages.flatMap((p) => p.calls || []).filter((c) => (seen.has(c.id) ? false : seen.add(c.id)))
  const next = pages[pages.length - 1]?.nextCursor

  const load = useCallback(async () => {
    setLoading(true); setError(null); setPlaying(null)
    try { setPages([await getBusinessCalls(businessId, { ...rangeFor(days), limit: PAGE_SIZE })]) }
    catch (err) { setError(err.response?.data?.error || 'Calls could not be loaded'); setPages([]) }
    finally { setLoading(false) }
  }, [businessId, days])
  useEffect(() => { load() }, [load])

  const refreshAudit = useCallback(async () => {
    try { setAudit((await getRecordingAccessLog(businessId)).entries) } catch { setAudit(null) }
  }, [businessId])
  useEffect(() => { if (first?.canAccessRecordings) refreshAudit() }, [first?.canAccessRecordings, refreshAudit])

  const loadMore = async () => {
    setLoadingMore(true)
    try { const page = await getBusinessCalls(businessId, { ...rangeFor(days), cursor: next, limit: PAGE_SIZE }); setPages((p) => [...p, page]) }
    catch (err) { setError(err.response?.data?.error || 'More calls could not be loaded') }
    finally { setLoadingMore(false) }
  }

  const numbers = (first?.assignedNumbers || []).map((n) => n.phoneNumber).filter(Boolean)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h4 className="section-title">Calls (Exotel)</h4>
        <div className="flex gap-1">
          {PRESETS.map((d) => (
            <button key={d} className={`text-[11px] px-2 py-1 rounded ${days === d ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDays(d)}>{d}d</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3">Virtual number: <span className="text-white">{numbers.length ? numbers.join(', ') : 'none active'}</span></p>

      {loading ? <p className="text-xs text-slate-400">Loading calls…</p>
        : error ? (
          <div className="space-y-2">
            <p className="text-xs text-red-400">{error}</p>
            <button className="btn-ghost text-xs px-3 py-1.5" onClick={load}>Try again</button>
          </div>
        ) : !calls.length ? <p className="text-xs text-slate-400">No calls in the last {days} days.</p>
          : (
            <ul className="divide-y divide-white/[0.06]">
              {calls.map((c) => (
                <li key={c.id} className="py-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-white">{c.callerPhone || '—'}</span>
                    <span className={OUTCOME_CLASS[c.outcome] || 'text-slate-400'}>{OUTCOME_LABEL[c.outcome] || c.outcome}{c.aiHandled ? ' · AI' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-500 mt-0.5">
                    <span>{when(c.startedAt)} · {duration(c.durationSeconds)} · {c.status || '—'}{c.missedReason ? ` · ${c.missedReason.replace(/_/g, ' ').toLowerCase()}` : ''}</span>
                    <span className="font-mono">{c.callSid || '—'}</span>
                  </div>
                  {canPlay && c.callSid && playing !== c.id && (
                    <button className="btn-ghost text-[11px] px-2 py-1 mt-1" onClick={() => setPlaying(c.id)}>Play recording (audited)</button>
                  )}
                  {playing === c.id && <RecordingPlayer businessId={businessId} callSid={c.callSid} onClose={() => setPlaying(null)} onAudited={refreshAudit} />}
                </li>
              ))}
            </ul>
          )}
      {next && !loading && (
        <button className="btn-ghost text-xs px-3 py-1.5 mt-3" disabled={loadingMore} onClick={loadMore}>{loadingMore ? 'Loading…' : 'Load more'}</button>
      )}

      <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1">
        <p className="text-[11px] text-slate-500">
          {!first ? '' : !first.canAccessRecordings ? 'Recordings: only a Super Admin can open them, for an investigation.'
            : !first.recordingAccessEnabled ? 'Recordings: access is switched off until the Exotel recording setup is verified.'
              : 'Recordings are streamed for listening only — never downloaded or stored — and every access is logged.'}
        </p>
        {first?.canAccessRecordings && (
          <div>
            <p className="text-[11px] text-slate-500 mb-1">Recording access log</p>
            {!audit ? <p className="text-[11px] text-slate-600">—</p> : !audit.length ? <p className="text-[11px] text-slate-600">No access recorded.</p> : (
              <ul className="text-[11px] text-slate-400 space-y-0.5 max-h-40 overflow-y-auto">
                {audit.map((a) => <li key={a.id}>{when(a.at)} · {a.adminEmail || '—'} · {a.callSid || '—'} · {a.result}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
