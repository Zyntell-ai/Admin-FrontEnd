/**
 * @file        KnowledgeRetrievalCard.jsx
 * @module      Business Detail — FAQ retrieval mode (Batch 3)
 * @project     Admin-FrontEnd
 * @layer       Component
 * @description OFF (existing behaviour) · SHADOW (retrieval runs and is recorded, replies unchanged) · ON (the AI gets only
 *              the FAQs relevant to each question). Only SUPER_ADMIN / ADMIN can change it (the backend enforces it and
 *              audits every change). The mode never bypasses healthcare approval or classification rules, and it has
 *              no effect while the platform-wide switch is off.
 */
import { useState, useEffect, useCallback } from 'react'
import { getKnowledgeRetrieval, setKnowledgeRetrieval } from '../../api/admin'
import { useToast } from '../../context/ToastContext'

const MODES = [
  { value: 'OFF', label: 'Off', help: 'All usable FAQs are given to the AI as today.' },
  { value: 'SHADOW', label: 'Shadow', help: 'Retrieval runs and is recorded in insights; replies are unchanged.' },
  { value: 'ON', label: 'On', help: 'The AI gets only the FAQs relevant to each question.' },
]

export default function KnowledgeRetrievalCard({ businessId }) {
  const { addToast } = useToast()
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try { setState(await getKnowledgeRetrieval(businessId)) }
    catch (err) { setError(err.response?.status === 403 ? 'Only Super Admins and Admins can view this setting.' : 'Could not load the FAQ retrieval setting.') }
  }, [businessId])
  useEffect(() => { load() }, [load])

  const change = async (mode) => {
    setBusy(true)
    try { setState(await setKnowledgeRetrieval(businessId, mode)); addToast(`FAQ retrieval set to ${mode}`, 'success') }
    catch (err) { addToast(err.response?.data?.error || 'Could not change the setting', 'error') }
    finally { setBusy(false) }
  }

  return (
    <div className="card p-5">
      <h4 className="section-title mb-3">FAQ retrieval (smart search)</h4>
      {error ? <p className="text-xs text-red-400">{error}</p> : !state ? <p className="text-xs text-slate-400">Loading…</p> : (
        <div className="space-y-2">
          <div className="flex gap-1 flex-wrap">
            {MODES.map((m) => (
              <button key={m.value} disabled={busy || state.mode === m.value} onClick={() => change(m.value)}
                className={`text-xs px-3 py-1.5 rounded ${state.mode === m.value ? 'btn-primary' : 'btn-ghost'}`}>{m.label}</button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">{MODES.find((m) => m.value === state.mode)?.help}</p>
          {!state.globallyAllowed && <p className="text-[11px] text-amber-300">The platform-wide switch is off, so this business currently runs as Off.</p>}
          <p className="text-[11px] text-slate-500">Healthcare approval and business classification rules always apply, whatever the mode.</p>
        </div>
      )}
    </div>
  )
}
