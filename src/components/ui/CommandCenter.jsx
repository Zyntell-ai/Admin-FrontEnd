import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, ArrowRight, TrendingDown, FileText, BarChart3, Users, AlertCircle, DollarSign } from 'lucide-react'

const SUGGESTIONS = [
  { icon: TrendingDown, label: 'Find businesses likely to churn', action: '/businesses?filter=churn-risk',    color: 'var(--crimson)' },
  { icon: FileText,     label: 'Show unpaid invoices',            action: '/billing?status=overdue',          color: 'var(--amber)'  },
  { icon: BarChart3,    label: 'Compare this month vs last month', action: '/analytics?view=comparison',      color: 'var(--aurora)' },
  { icon: Users,        label: 'Trial users expiring this week',   action: '/businesses?filter=trial-expiry', color: 'var(--violet-light)' },
  { icon: DollarSign,   label: 'Generate commission report',       action: '/commissions',                    color: 'var(--emerald)' },
  { icon: AlertCircle,  label: 'Businesses with declining revenue', action: '/businesses?filter=declining',   color: 'var(--amber)' },
]

export default function CommandCenter() {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const inputRef  = useRef(null)
  const navigate  = useNavigate()

  // ⌘J / Ctrl+J
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setResponse(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    // Simulate AI response — replace with real API call
    await new Promise(r => setTimeout(r, 900))
    setResponse(`I found insights for "${query}". Navigating to the most relevant section...`)
    setLoading(false)
  }

  const handleSuggestion = (s) => {
    navigate(s.action)
    setOpen(false)
  }

  const filtered = SUGGESTIONS.filter(s =>
    !query || s.label.toLowerCase().includes(query.toLowerCase())
  )

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Zyntell Copilot (⌘J)"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          boxShadow: '0 0 0 1px rgba(147,197,253,0.3), 0 4px 24px rgba(59,130,246,0.45), 0 0 40px rgba(124,58,237,0.2)',
        }}
      >
        <Sparkles size={18} className="text-white" />
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div
        className="fixed bottom-6 right-6 z-50 w-[420px] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #111827 0%, #0D1117 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06), 0 0 60px rgba(59,130,246,0.08)',
          animation: 'copilot-open 250ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(59,130,246,0.12)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', boxShadow: '0 0 12px rgba(59,130,246,0.4)' }}>
            <Sparkles size={13} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white leading-none">Zyntell Copilot</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--silver-4)' }}>AI operations assistant</p>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono" style={{ color: 'var(--silver-4)' }}>⌘J</kbd>
            <button onClick={() => setOpen(false)} className="btn-icon w-7 h-7">
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 pt-3 pb-2">
          <div className="relative">
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setResponse(null) }}
              placeholder="Ask anything about your platform..."
              className="w-full px-3 py-2.5 rounded-lg text-sm pr-10"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: 'var(--silver)',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                boxShadow: loading ? '0 0 0 2px rgba(59,130,246,0.15)' : 'none',
                transition: 'box-shadow 150ms',
              }}
            />
            {query && (
              <button type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center transition-colors"
                style={{ background: 'var(--aurora-mid)', color: 'var(--aurora-light)' }}>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </form>

        {/* AI response */}
        {loading && (
          <div className="px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--aurora)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--silver-4)' }}>Thinking...</span>
          </div>
        )}
        {response && !loading && (
          <div className="mx-4 mb-3 px-3 py-2.5 rounded-lg text-xs leading-relaxed"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', color: 'var(--silver-3)' }}>
            {response}
          </div>
        )}

        {/* Suggestions */}
        {!loading && !response && (
          <div className="px-2 pb-3">
            {filtered.length > 0 && (
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--silver-5)' }}>
                Quick commands
              </p>
            )}
            {filtered.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-all group"
                style={{ '--hover-bg': 'rgba(59,130,246,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}22` }}>
                  <s.icon size={12} style={{ color: s.color }} />
                </div>
                <span className="text-xs flex-1 leading-snug" style={{ color: 'var(--silver-3)' }}>{s.label}</span>
                <ArrowRight size={11} style={{ color: 'var(--silver-5)' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 border-t flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-[10px]" style={{ color: 'var(--silver-5)' }}>Powered by Zyntell AI</span>
          <span className="text-[10px]" style={{ color: 'var(--silver-5)' }}>ESC to close</span>
        </div>
      </div>
    </>
  )
}
