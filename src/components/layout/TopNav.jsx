import { useState, useEffect } from 'react'
import { Bell, RefreshCw, ChevronDown, X, Zap } from 'lucide-react'
import { notifications } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

export default function TopNav({ title }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState(notifications)
  const [pulse, setPulse] = useState(false)
  const unread = notifs.filter(n => !n.read).length
  const { admin } = useAuth()

  // Simulate a new notification every 30s
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true)
      setNotifs(prev => [{
        id: Date.now(),
        type: 'booking',
        message: `New booking spike detected — ${['MedCare Clinic', 'Spice Route', 'Wellness Hub'][Math.floor(Math.random() * 3)]}`,
        time: 'Just now',
        read: false,
      }, ...prev.slice(0, 9)])
      setTimeout(() => setPulse(false), 2000)
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))

  const typeColors = {
    alert: 'bg-red-500',
    payment: 'bg-amber-500',
    booking: 'bg-indigo-500',
    trial: 'bg-orange-500',
    system: 'bg-slate-500',
  }

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#0B0F1A]/95 backdrop-blur-sm border-b border-white/[0.05] flex items-center gap-3 px-6">
      <div className="flex-1">
        <h2 className="font-display font-semibold text-white text-[15px]">{title}</h2>
      </div>

      {/* Cmd+K Search trigger */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('openCommandPalette'))}
        className="flex items-center gap-2 text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] px-3 py-1.5 rounded-lg text-sm transition-all border border-white/[0.06] group"
      >
        <Zap size={12} className="text-indigo-400" />
        <span className="text-xs text-slate-500">Search anything...</span>
        <div className="flex items-center gap-0.5 ml-2">
          <kbd className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-slate-600">⌘</kbd>
          <kbd className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-slate-600">K</kbd>
        </div>
      </button>

      {/* Refresh */}
      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all border border-white/[0.06]">
        <RefreshCw size={13} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all border border-white/[0.06]"
        >
          <Bell size={14} className={pulse ? 'text-indigo-400' : ''} />
          {unread > 0 && (
            <span className={clsx('absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center', pulse && 'animate-ping-once')}>
              {unread}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-10 w-80 bg-[#0F1629] border border-white/[0.08] rounded-xl shadow-2xl z-50 animate-fade-in overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <div className="flex items-center gap-2">
                <button onClick={markAllRead} className="text-[10px] text-indigo-400 hover:text-indigo-300">Mark all read</button>
                <button onClick={() => setNotifOpen(false)}><X size={13} className="text-slate-500 hover:text-white" /></button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
              {notifs.map(n => (
                <div key={n.id}
                  onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  className={clsx('px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors flex items-start gap-3', !n.read && 'bg-indigo-500/5')}>
                  <div className="mt-1.5 flex-shrink-0 relative">
                    <div className={clsx('w-2 h-2 rounded-full', typeColors[n.type] || 'bg-slate-500')} />
                    {!n.read && <div className={clsx('absolute inset-0 rounded-full animate-ping opacity-60', typeColors[n.type] || 'bg-slate-500')} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-white/[0.05] text-center">
              <button className="text-xs text-indigo-400 hover:text-indigo-300">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <button className="flex items-center gap-2 hover:bg-white/[0.04] px-2 py-1.5 rounded-lg transition-all">
        <div className="w-7 h-7 rounded-full bg-gradient-indigo flex items-center justify-center text-[11px] font-bold text-white">
          {admin?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
        </div>
        <span className="text-sm text-slate-300 font-medium">
          {admin?.name?.split(' ')[0] || 'Admin'}
        </span>
        <ChevronDown size={12} className="text-slate-500" />
      </button>
    </header>
  )
}