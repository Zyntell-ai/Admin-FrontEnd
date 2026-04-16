import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { clinicAlerts } from '../data/mockData'
import {
  Filter, CheckCircle, UserPlus, X, AlertOctagon,
  AlertTriangle, Info, Zap, Eye, Keyboard
} from 'lucide-react'
import clsx from 'clsx'

const adminTeam = ['Rahul K.', 'Priya S.', 'Amit M.', 'Nisha P.', 'Tech Team']
const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low']
const STATUSES = ['All', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']
const TYPES = ['All', 'LOW_CONFIRMATION_RATE', 'PAYMENT_OVERDUE', 'SUSPICIOUS_ACTIVITY', 'TRIAL_EXPIRING']

function SeverityBadge({ severity }) {
  const map = {
    Critical: 'bg-red-500/15 text-red-400 border border-red-500/20',
    High: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    Low: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  }
  const icons = {
    Critical: AlertOctagon,
    High: AlertTriangle,
    Medium: AlertTriangle,
    Low: Info,
  }
  const Icon = icons[severity] || Info
  return (
    <span className={clsx('badge gap-1 text-[10px]', map[severity] || map.Low)}>
      <Icon size={10} /> {severity}
    </span>
  )
}

function TypeLabel({ type }) {
  const map = {
    LOW_CONFIRMATION_RATE: { label: 'Low Confirmation Rate', color: 'badge-yellow' },
    PAYMENT_OVERDUE: { label: 'Payment Overdue', color: 'badge-red' },
    SUSPICIOUS_ACTIVITY: { label: 'Suspicious Activity', color: 'bg-purple-500/15 text-purple-400' },
    TRIAL_EXPIRING: { label: 'Trial Expiring', color: 'badge-indigo' },
  }
  const m = map[type] || { label: type, color: 'badge-gray' }
  return <span className={clsx('badge text-[10px]', m.color)}>{m.label}</span>
}

export default function Alerts() {
  const { addToast } = useToast()
  const [alerts, setAlerts] = useState(clinicAlerts)
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [assignModal, setAssignModal] = useState(null)
  const [spotCheckModal, setSpotCheckModal] = useState(null)
  const [notesModal, setNotesModal] = useState(null)
  const [assignee, setAssignee] = useState('')
  const [noteText, setNoteText] = useState('')
  const [hoveredAlert, setHoveredAlert] = useState(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // ─── Filtered alerts ────────────────────────────────────────────────────────
  const filtered = useMemo(() => alerts.filter(a => {
    const matchSev  = severityFilter === 'All' || a.severity === severityFilter
    const matchStat = statusFilter   === 'All' || a.status   === statusFilter
    const matchType = typeFilter     === 'All' || a.type     === typeFilter
    return matchSev && matchStat && matchType
  }), [alerts, severityFilter, statusFilter, typeFilter])

  // ─── Actions ────────────────────────────────────────────────────────────────
  const resolve = (id, name) => {
    setAlerts(prev => prev.map(a =>
      a.id === id
        ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString().split('T')[0] }
        : a
    ))
    addToast(`Alert resolved — ${name}`, 'success')
  }

  const dismiss = (id, name) => {
    setAlerts(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'DISMISSED' } : a
    ))
    addToast(`Alert dismissed — ${name}`, 'info')
  }

  const doAssign = (id, person) => {
    setAlerts(prev => prev.map(a =>
      a.id === id ? { ...a, assignedTo: person, status: 'IN_REVIEW' } : a
    ))
    addToast(`Alert assigned to ${person}`, 'success')
    setAssignModal(null)
  }

  const saveNote = (id) => {
    setAlerts(prev => prev.map(a =>
      a.id === id ? { ...a, notes: noteText } : a
    ))
    addToast('Note saved', 'success')
    setNotesModal(null)
    setNoteText('')
  }

  // ─── Keyboard shortcuts (active when hovering a row) ────────────────────────
  useEffect(() => {
    const handle = (e) => {
      if (!hoveredAlert) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const alert = alerts.find(a => a.id === hoveredAlert)
      if (!alert) return

      if ((e.key === 'r' || e.key === 'R') && !['RESOLVED', 'DISMISSED'].includes(alert.status)) {
        resolve(alert.id, alert.businessName)
      }
      if ((e.key === 'a' || e.key === 'A') && !['RESOLVED', 'DISMISSED'].includes(alert.status)) {
        setAssignModal(alert)
        setAssignee(alert.assignedTo || '')
      }
      if ((e.key === 'd' || e.key === 'D') && !['DISMISSED'].includes(alert.status)) {
        dismiss(alert.id, alert.businessName)
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [hoveredAlert, alerts])

  // ─── Summary counts ─────────────────────────────────────────────────────────
  const counts = {
    critical:       alerts.filter(a => a.severity === 'Critical' && !['RESOLVED', 'DISMISSED'].includes(a.status)).length,
    open:           alerts.filter(a => a.status === 'OPEN').length,
    inReview:       alerts.filter(a => a.status === 'IN_REVIEW').length,
    paymentOverdue: alerts.filter(a => a.type === 'PAYMENT_OVERDUE' && a.status === 'OPEN').length,
  }

  // ─── Resolve All visible open alerts ────────────────────────────────────────
  const resolveAll = () => {
    const openIds = filtered.filter(a => a.status === 'OPEN').map(a => a.id)
    if (!openIds.length) { addToast('No open alerts to resolve', 'info'); return }
    setAlerts(prev => prev.map(a =>
      openIds.includes(a.id)
        ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString().split('T')[0] }
        : a
    ))
    addToast(`${openIds.length} alerts resolved`, 'success')
  }

  return (
    <Layout title="Alerts">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Alerts</h1>
          <p className="text-sm text-slate-500">
            Monitor and manage all platform alerts and anomalies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcuts(true)}
            className="btn-ghost text-xs gap-1.5"
          >
            <Keyboard size={13} /> Shortcuts
          </button>
          <button
            onClick={resolveAll}
            className="btn-ghost text-xs gap-1.5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
          >
            <CheckCircle size={13} /> Resolve All Open
          </button>
          <button
            onClick={() => addToast('Alert rules configured', 'info')}
            className="btn-ghost"
          >
            <Filter size={13} /> Configure Rules
          </button>
        </div>
      </div>

      {/* ── Keyboard shortcut hint (only when a row is hovered) ─────────────── */}
      {hoveredAlert && (
        <div className="mb-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center gap-5 text-xs text-indigo-300 animate-fade-in">
          <span className="font-semibold text-indigo-200">Shortcuts active:</span>
          {[
            { key: 'R', label: 'Resolve' },
            { key: 'A', label: 'Assign' },
            { key: 'D', label: 'Dismiss' },
          ].map(({ key, label }) => (
            <span key={key} className="flex items-center gap-1.5">
              <kbd className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded font-mono text-white text-[10px]">
                {key}
              </kbd>
              <span className="text-indigo-300/70">{label}</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Summary cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Critical Alerts',
            value: counts.critical,
            border: 'border-red-500/20',
            bg: 'bg-red-500/10',
            text: 'text-red-400',
            icon: AlertOctagon,
            onClick: () => setSeverityFilter('Critical'),
          },
          {
            label: 'Open Alerts',
            value: counts.open,
            border: 'border-amber-500/20',
            bg: 'bg-amber-500/10',
            text: 'text-amber-400',
            icon: Zap,
            onClick: () => setStatusFilter('OPEN'),
          },
          {
            label: 'In Review',
            value: counts.inReview,
            border: 'border-indigo-500/20',
            bg: 'bg-indigo-500/10',
            text: 'text-indigo-400',
            icon: Eye,
            onClick: () => setStatusFilter('IN_REVIEW'),
          },
          {
            label: 'Payment Overdue',
            value: counts.paymentOverdue,
            border: 'border-orange-500/20',
            bg: 'bg-orange-500/10',
            text: 'text-orange-400',
            icon: AlertTriangle,
            onClick: () => setTypeFilter('PAYMENT_OVERDUE'),
          },
        ].map(({ label, value, border, bg, text, icon: Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={clsx(
              'card p-4 border text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 cursor-pointer',
              border
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="stat-label">{label}</span>
              <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', bg)}>
                <Icon size={13} className={text} />
              </div>
            </div>
            <p className={clsx('text-2xl font-bold font-display', text)}>{value}</p>
            <p className="text-[10px] text-slate-600 mt-1">Click to filter</p>
          </button>
        ))}
      </div>

      {/* ── Active filter chips ──────────────────────────────────────────────── */}
      {(severityFilter !== 'All' || statusFilter !== 'All' || typeFilter !== 'All') && (
        <div className="flex items-center gap-2 mb-3 animate-fade-in">
          <span className="text-xs text-slate-500">Active filters:</span>
          {severityFilter !== 'All' && (
            <button
              onClick={() => setSeverityFilter('All')}
              className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full hover:bg-indigo-500/20 transition-colors"
            >
              {severityFilter} <X size={10} />
            </button>
          )}
          {statusFilter !== 'All' && (
            <button
              onClick={() => setStatusFilter('All')}
              className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full hover:bg-indigo-500/20 transition-colors"
            >
              {statusFilter.replace('_', ' ')} <X size={10} />
            </button>
          )}
          {typeFilter !== 'All' && (
            <button
              onClick={() => setTypeFilter('All')}
              className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full hover:bg-indigo-500/20 transition-colors"
            >
              {typeFilter.replace(/_/g, ' ')} <X size={10} />
            </button>
          )}
          <button
            onClick={() => { setSeverityFilter('All'); setStatusFilter('All'); setTypeFilter('All') }}
            className="text-xs text-slate-500 hover:text-white transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Severity */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
          {SEVERITIES.map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
                severityFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
                statusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Type */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
                typeFilter === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              {t === 'All' ? 'All Types' : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} alert{filtered.length !== 1 ? 's' : ''} shown
        </span>
      </div>

      {/* ── Main table ──────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {[
                'Business', 'Alert Type', 'Severity', 'Status',
                'Assigned To', 'Notes', 'Date', 'Actions',
              ].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map(alert => {
              const isHovered = hoveredAlert === alert.id
              const isCriticalOpen = alert.severity === 'Critical' && alert.status === 'OPEN'
              const isResolved = alert.status === 'RESOLVED'
              const isDismissed = alert.status === 'DISMISSED'
              const isActionable = !isResolved && !isDismissed

              return (
                <tr
                  key={alert.id}
                  className={clsx(
                    'border-b border-white/[0.04] transition-colors cursor-default',
                    isCriticalOpen && 'bg-red-500/[0.025]',
                    isHovered ? 'bg-indigo-500/[0.06]' : 'hover:bg-white/[0.02]',
                    (isResolved || isDismissed) && 'opacity-60'
                  )}
                  onMouseEnter={() => setHoveredAlert(alert.id)}
                  onMouseLeave={() => setHoveredAlert(null)}
                >
                  {/* Business */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">{alert.businessName}</p>
                    {alert.confirmationRate && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Rate: {alert.confirmationRate}% vs {alert.platformAverage}% avg
                      </p>
                    )}
                  </td>

                  {/* Alert Type */}
                  <td className="px-4 py-3">
                    <TypeLabel type={alert.type} />
                  </td>

                  {/* Severity */}
                  <td className="px-4 py-3">
                    <SeverityBadge severity={alert.severity} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'badge text-[10px]',
                      alert.status === 'RESOLVED'   ? 'badge-green'  :
                      alert.status === 'IN_REVIEW'  ? 'badge-indigo' :
                      alert.status === 'DISMISSED'  ? 'badge-gray'   :
                      'badge-red'
                    )}>
                      {alert.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Assigned To */}
                  <td className="px-4 py-3 text-xs">
                    {alert.assignedTo ? (
                      <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                          {alert.assignedTo.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-slate-300">{alert.assignedTo}</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="px-4 py-3 text-xs max-w-[150px]">
                    {alert.notes ? (
                      <button
                        onClick={() => { setNotesModal(alert); setNoteText(alert.notes) }}
                        className="text-slate-400 hover:text-white transition-colors truncate block text-left w-full"
                        title={alert.notes}
                      >
                        {alert.notes}
                      </button>
                    ) : (
                      <button
                        onClick={() => { setNotesModal(alert); setNoteText('') }}
                        className="text-slate-600 hover:text-indigo-400 transition-colors"
                      >
                        + Add note
                      </button>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {alert.createdAt}
                    {alert.resolvedAt && (
                      <p className="text-[10px] text-emerald-600 mt-0.5">Resolved {alert.resolvedAt}</p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {isActionable && (
                        <>
                          {/* Resolve */}
                          <button
                            onClick={() => resolve(alert.id, alert.businessName)}
                            className="flex items-center gap-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md transition-all"
                            title="Resolve (R)"
                          >
                            <CheckCircle size={9} /> Resolve
                          </button>

                          {/* Assign */}
                          <button
                            onClick={() => { setAssignModal(alert); setAssignee(alert.assignedTo || '') }}
                            className="flex items-center gap-1 text-[10px] btn-ghost px-2 py-1"
                            title="Assign (A)"
                          >
                            <UserPlus size={9} /> Assign
                          </button>
                        </>
                      )}

                      {/* Spot Check */}
                      {alert.spotCheckPatients?.length > 0 && (
                        <button
                          onClick={() => setSpotCheckModal(alert)}
                          className="flex items-center gap-1 text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md transition-all"
                          title="Spot Check"
                        >
                          <Eye size={9} /> Spot
                        </button>
                      )}

                      {/* Dismiss */}
                      {!isDismissed && (
                        <button
                          onClick={() => dismiss(alert.id, alert.businessName)}
                          className="flex items-center gap-1 text-[10px] bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 text-slate-500 hover:text-slate-300 px-2 py-1 rounded-md transition-all"
                          title="Dismiss (D)"
                        >
                          <X size={9} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">All clear!</p>
            <p className="text-xs text-slate-500">No alerts match the current filters</p>
            <button
              onClick={() => { setSeverityFilter('All'); setStatusFilter('All'); setTypeFilter('All') }}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ── Keyboard Shortcuts Modal ─────────────────────────────────────────── */}
      <Modal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        title="Keyboard Shortcuts"
        size="sm"
      >
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-4">
            Hover any alert row to activate row-level shortcuts:
          </p>
          {[
            { key: 'R',   label: 'Resolve hovered alert',    color: 'text-emerald-400' },
            { key: 'A',   label: 'Open assign dialog',        color: 'text-indigo-400'  },
            { key: 'D',   label: 'Dismiss hovered alert',     color: 'text-slate-300'   },
            { key: '⌘K',  label: 'Open command palette',      color: 'text-indigo-400'  },
            { key: 'Esc', label: 'Close any open modal',      color: 'text-slate-400'   },
          ].map(({ key, label, color }) => (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.05] hover:border-white/[0.1] transition-colors"
            >
              <span className="text-sm text-slate-300">{label}</span>
              <kbd className={clsx(
                'bg-white/10 border border-white/15 px-2 py-1 rounded font-mono text-xs font-semibold',
                color
              )}>
                {key}
              </kbd>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-slate-600 text-center">
              More shortcuts coming soon
            </p>
          </div>
        </div>
      </Modal>

      {/* ── Assign Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={`Assign Alert — ${assignModal?.businessName}`}
      >
        {assignModal && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <TypeLabel type={assignModal.type} />
              <SeverityBadge severity={assignModal.severity} />
            </div>
            <p className="text-xs text-slate-400">Assign to a team member:</p>

            {adminTeam.map(person => (
              <button
                key={person}
                onClick={() => setAssignee(person)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all',
                  assignee === person
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-indigo flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {person.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="flex-1 text-sm font-medium">{person}</span>
                {assignee === person && (
                  <CheckCircle size={15} className="text-indigo-400 flex-shrink-0" />
                )}
              </button>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => doAssign(assignModal.id, assignee)}
                disabled={!assignee}
                className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Assignment
              </button>
              <button onClick={() => setAssignModal(null)} className="btn-ghost flex-1 justify-center">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Spot Check Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={!!spotCheckModal}
        onClose={() => setSpotCheckModal(null)}
        title={`Spot Check — ${spotCheckModal?.businessName}`}
        size="md"
      >
        {spotCheckModal && (
          <div className="space-y-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3">
              <p className="text-xs text-indigo-300">
                Call each patient and confirm whether they visited{' '}
                <span className="font-semibold text-white">{spotCheckModal.businessName}</span>.
                Results are logged for commission verification.
              </p>
            </div>

            <div className="space-y-2">
              {spotCheckModal.spotCheckPatients.length > 0 ? (
                spotCheckModal.spotCheckPatients.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 bg-white/[0.04] rounded-lg border border-white/[0.08]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.phone} · Booking: {p.bookingDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToast(`${p.name} — Visited ✓`, 'success')}
                        className="flex items-center gap-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg transition-all font-medium"
                      >
                        <CheckCircle size={11} /> Visited
                      </button>
                      <button
                        onClick={() => addToast(`${p.name} — No-Show recorded`, 'warning')}
                        className="flex items-center gap-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-all font-medium"
                      >
                        <X size={11} /> No Show
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-slate-500">
                  No patients queued for spot check
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  resolve(spotCheckModal.id, spotCheckModal.businessName)
                  setSpotCheckModal(null)
                }}
                className="btn-primary flex-1 justify-center"
              >
                Mark Resolved
              </button>
              <button onClick={() => setSpotCheckModal(null)} className="btn-ghost flex-1 justify-center">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Notes Modal ──────────────────────────────────────────────────────── */}
      <Modal
        open={!!notesModal}
        onClose={() => setNotesModal(null)}
        title={`${notesModal?.notes ? 'Edit' : 'Add'} Note — ${notesModal?.businessName}`}
        size="sm"
      >
        {notesModal && (
          <div className="space-y-3">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              rows={5}
              placeholder="Write an internal note about this alert..."
              className="input-field resize-none"
              autoFocus
            />
            <p className="text-[10px] text-slate-600">
              Notes are internal only — not visible to the business.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => saveNote(notesModal.id)}
                disabled={!noteText.trim()}
                className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
              <button onClick={() => setNotesModal(null)} className="btn-ghost flex-1 justify-center">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}