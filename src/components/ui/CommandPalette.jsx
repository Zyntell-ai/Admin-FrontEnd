import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { businesses, businessStats } from '../../data/mockData'
import {
  Search, LayoutDashboard, CalendarCheck, BarChart3,
  CreditCard, DollarSign, Building2, Tag, Bell,
  Settings, Zap, ArrowRight, X, Clock
} from 'lucide-react'
import clsx from 'clsx'

const PAGES = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, group: 'Pages' },
  { label: 'Bookings', path: '/bookings', icon: CalendarCheck, group: 'Pages' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, group: 'Pages' },
  { label: 'Billing', path: '/billing', icon: CreditCard, group: 'Pages' },
  { label: 'Commissions', path: '/commissions', icon: DollarSign, group: 'Pages' },
  { label: 'Businesses', path: '/businesses', icon: Building2, group: 'Pages' },
  { label: 'Categories', path: '/categories', icon: Tag, group: 'Pages' },
  { label: 'Alerts', path: '/alerts', icon: Bell, group: 'Pages' },
  { label: 'Settings', path: '/settings', icon: Settings, group: 'Pages' },
]

const ACTIONS = [
  { label: 'Generate Invoices', path: '/billing', icon: CreditCard, group: 'Actions' },
  { label: 'View Critical Alerts', path: '/alerts', icon: Bell, group: 'Actions' },
  { label: 'View Overdue Payments', path: '/billing', icon: CreditCard, group: 'Actions' },
  { label: 'Monitor Trial Businesses', path: '/analytics', icon: BarChart3, group: 'Actions' },
]

const RECENT_KEY = 'zyntell_recent_searches'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
  })
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  // Open on Cmd+K
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    const handleCustom = () => setOpen(true)
    document.addEventListener('keydown', handle)
    window.addEventListener('openCommandPalette', handleCustom)
    return () => {
      document.removeEventListener('keydown', handle)
      window.removeEventListener('openCommandPalette', handleCustom)
    }
  }, [])

  useEffect(() => {
    if (open) { setQuery(''); setActiveIdx(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  const bizResults = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return businesses
      .filter(b => b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
      .slice(0, 4)
      .map(b => ({ label: b.name, sub: `${b.category} · ${b.city}`, path: `/businesses/${b.id}`, icon: Building2, group: 'Businesses' }))
  }, [query])

  const pageResults = useMemo(() => {
    if (!query) return PAGES
    const q = query.toLowerCase()
    return PAGES.filter(p => p.label.toLowerCase().includes(q))
  }, [query])

  const actionResults = useMemo(() => {
    if (!query) return ACTIONS
    const q = query.toLowerCase()
    return ACTIONS.filter(a => a.label.toLowerCase().includes(q))
  }, [query])

  const allItems = useMemo(() => {
    if (!query) return [
      ...recent.slice(0, 3).map(r => ({ ...r, group: 'Recent' })),
      ...pageResults,
      ...actionResults,
    ]
    return [...bizResults, ...pageResults, ...actionResults]
  }, [query, bizResults, pageResults, actionResults, recent])

  const grouped = useMemo(() => {
    const groups = {}
    allItems.forEach(item => {
      if (!groups[item.group]) groups[item.group] = []
      groups[item.group].push(item)
    })
    return groups
  }, [allItems])

  const flatItems = useMemo(() => allItems, [allItems])

  const go = (item) => {
    navigate(item.path)
    const newRecent = [item, ...recent.filter(r => r.path !== item.path)].slice(0, 5)
    setRecent(newRecent)
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent))
    setOpen(false)
  }

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flatItems.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && flatItems[activeIdx]) go(flatItems[activeIdx])
  }

  if (!open) return null

  let flatIdx = 0

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-[#0B0F1A] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0) }}
            onKeyDown={handleKey}
            placeholder="Search pages, businesses, actions..."
            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="text-[10px] text-slate-600 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {flatItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No results for "<span className="text-white">{query}</span>"
            </div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="px-4 py-1.5">
                <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                  {group === 'Recent' && <Clock size={9} />}
                  {group}
                </span>
              </div>
              {items.map((item) => {
                const idx = flatIdx++
                const isActive = idx === activeIdx
                const Icon = item.icon
                return (
                  <button
                    key={`${group}-${item.path}-${item.label}`}
                    onClick={() => go(item)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      isActive ? 'bg-indigo-600/15' : 'hover:bg-white/[0.03]'
                    )}
                  >
                    <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', isActive ? 'bg-indigo-600/30' : 'bg-white/[0.05]')}>
                      <Icon size={13} className={isActive ? 'text-indigo-300' : 'text-slate-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx('text-sm font-medium truncate', isActive ? 'text-white' : 'text-slate-300')}>{item.label}</p>
                      {item.sub && <p className="text-[10px] text-slate-500 truncate">{item.sub}</p>}
                    </div>
                    {isActive && <ArrowRight size={13} className="text-indigo-400 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-slate-600">
          <span className="flex items-center gap-1"><kbd className="bg-white/5 border border-white/10 px-1 py-0.5 rounded font-mono">↑↓</kbd> Navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-white/5 border border-white/10 px-1 py-0.5 rounded font-mono">↵</kbd> Select</span>
          <span className="flex items-center gap-1"><kbd className="bg-white/5 border border-white/10 px-1 py-0.5 rounded font-mono">Esc</kbd> Close</span>
          <span className="ml-auto flex items-center gap-1"><Zap size={9} className="text-indigo-400" /> ZYNTELL</span>
        </div>
      </div>
    </div>
  )
}