import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

const ToastContext = createContext(null)

const STYLES = {
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', bar: 'bg-emerald-500' },
  error:   { icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     bar: 'bg-red-500' },
  warning: { icon: AlertTriangle,color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   bar: 'bg-amber-500' },
  info:    { icon: Info,         color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/25',  bar: 'bg-indigo-500' },
}

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
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          className={clsx('h-0.5 rounded-full', s.bar)}
          style={{ animation: `shrink ${toast.duration}ms linear forwards` }}
        />
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', sub = '', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-5), { id, message, type, sub, duration }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration + 300)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
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

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}