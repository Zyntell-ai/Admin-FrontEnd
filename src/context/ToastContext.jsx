/**
 * @file        ToastContext.jsx
 * @module      Toast Context
 * @project     Admin-FrontEnd
 * @layer       Context
 * @description Provides a global toast notification system with typed variants (success, error, warning, info), auto-dismiss timers, and an animated bottom-right stack.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react (createContext, useContext, useState, useCallback)
 *   - lucide-react (CheckCircle, XCircle, AlertTriangle, Info, X)
 *   - clsx
 *
 * @sideEffects
 *   - setTimeout to auto-remove each toast after its duration elapses
 *   - Renders a fixed overlay container at bottom-right z-[300]
 */

/*
 * ╔══════════════════════════════════════════╗
 * ║           SDLC LIFECYCLE STATUS          ║
 * ╠══════════════════════════════════════════╣
 * ║ Planning     : ✅ Complete               ║
 * ║ Design       : ✅ Complete               ║
 * ║ Development  : ✅ Complete               ║
 * ║ Testing      : ⚠️  Partial              ║
 * ║ Deployment   : ✅ Complete               ║
 * ║ Maintenance  : 🔄 Active                ║
 * ╚══════════════════════════════════════════╝
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/** Context object — null default forces consumers to be inside the provider */
const ToastContext = createContext(null)

/** Style map keyed by toast type — defines icon, text color, background, border, and progress bar color */
const STYLES = {
  success: { icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', bar: 'bg-emerald-500' },
  error:   { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     bar: 'bg-red-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   bar: 'bg-amber-500' },
  info:    { icon: Info,          color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/25',  bar: 'bg-indigo-500' },
}

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    ToastItem
 * @purpose     Renders a single toast notification with icon, message, optional subtitle, dismiss button, and a CSS progress bar
 * @param  {Object}   toast    - Toast data object { id, message, type, sub, duration }
 * @param  {Function} onRemove - Callback to remove the toast by ID
 * @returns {JSX.Element} Single toast notification card
 */
function ToastItem({ toast, onRemove }) {
  const s = STYLES[toast.type] || STYLES.info
  const Icon = s.icon
  return (
    <div className={clsx(
      'relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-fade-in overflow-hidden',
      'bg-[#0F1629] min-w-[320px] max-w-[400px]', s.border
    )}>
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', s.bg)}>
        <Icon size={15} className={s.color} />
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm text-white font-medium leading-snug">{toast.message}</p>
        {toast.sub && <p className="text-xs text-slate-500 mt-0.5">{toast.sub}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="text-slate-600 hover:text-white transition-colors mt-0.5">
        <X size={13} />
      </button>
      {/* [UI]: Progress bar — animates from full width to zero over the toast duration */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          className={clsx('h-0.5 rounded-full', s.bar)}
          style={{ animation: `shrink ${toast.duration}ms linear forwards` }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// CONTEXT / STATE
// ─────────────────────────────────────────

/**
 * @function    ToastProvider
 * @purpose     Provides addToast action to the component tree and renders the toast stack overlay
 * @param  {React.ReactNode} children - Child components that will consume the toast context
 * @returns {JSX.Element} Context provider with the toast overlay portal
 */
export function ToastProvider({ children }) {
  // [STATE]: Active toast stack — capped at 6 entries; each entry is auto-removed after duration
  const [toasts, setToasts] = useState([])

  /**
   * @function    addToast
   * @purpose     Creates a new toast notification and schedules its automatic removal
   * @param  {string} message         - Main notification message text
   * @param  {string} [type='success'] - Toast variant: 'success' | 'error' | 'warning' | 'info'
   * @param  {string} [sub='']        - Optional subtitle text
   * @param  {number} [duration=3500] - Auto-dismiss delay in milliseconds
   * @returns {void}
   */
  const addToast = useCallback((message, type = 'success', sub = '', duration = 3500) => {
    const id = Date.now() + Math.random()
    // [CONTEXT]: Cap the visible stack at 6 toasts by slicing the oldest entries
    setToasts(prev => [...prev.slice(-5), { id, message, type, sub, duration }])
    // [CONTEXT]: Schedule removal slightly after the CSS animation completes
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration + 300)
  }, [])

  /**
   * @function    removeToast
   * @purpose     Immediately removes a toast from the stack by its ID
   * @param  {number} id - Unique toast identifier
   * @returns {void}
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* [UI]: Fixed bottom-right toast stack — pointer-events-none on container so it doesn't block underlying UI */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    useToast
 * @purpose     Custom hook to consume the ToastContext — throws if called outside ToastProvider
 * @returns {{ addToast: Function }} Toast context value with the addToast action
 */
export const useToast = () => {
  const ctx = useContext(ToastContext)
  // [GUARD]: Enforce correct provider usage — context will be null if called outside tree
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
