import { useState, useEffect } from 'react'
import { Bell, X, Search } from 'lucide-react'
import { notifications } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const TYPE_COLOR = {
  alert:   'var(--crimson)',
  payment: 'var(--amber)',
  booking: 'var(--aurora)',
  trial:   'var(--violet-light)',
  system:  'var(--silver-4)',
}

export default function TopNav({ title }) {
  const [notifOpen, setNotifOpen]   = useState(false)
  const [notifs,    setNotifs]      = useState(notifications)
  const [pulse,     setPulse]       = useState(false)
  const unread = notifs.filter(n => !n.read).length
  const { admin } = useAuth()

  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true)
      setNotifs(prev => [{
        id:      Date.now(),
        type:    'booking',
        message: `New booking — ${['Sunrise Dental', 'Apollo Clinic', 'CareFirst'][Math.floor(Math.random() * 3)]}`,
        time:    'Just now',
        read:    false,
      }, ...prev.slice(0, 9)])
      setTimeout(() => setPulse(false), 2000)
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))

  const initials = admin?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'

  return (
    <header className="sticky top-0 z-40 px-4 py-2.5">
      {/* Floating nav pill */}
      <div className="topnav-float flex items-center gap-3 px-4 h-11">

        {/* Page title */}
        <h2
          className="font-semibold text-sm flex-shrink-0"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--silver)', letterSpacing: '-0.01em' }}
        >
          {title}
        </h2>

        {/* Divider */}
        <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--border-bright)' }} />

        {/* AI Search — "Ask Zyntell anything" */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openCommandPalette'))}
          className="flex items-center gap-2 flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 text-left"
          style={{
            background:   'rgba(255,255,255,0.03)',
            border:       '1px solid rgba(255,255,255,0.05)',
            color:        'var(--silver-4)',
            maxWidth:     320,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background    = 'rgba(59,130,246,0.05)'
            e.currentTarget.style.borderColor   = 'rgba(59,130,246,0.18)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background    = 'rgba(255,255,255,0.03)'
            e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.05)'
          }}
        >
          <Search size={12} style={{ color: 'var(--silver-5)', flexShrink: 0 }} />
          <span className="truncate">Ask Zyntell anything...</span>
          <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
            <kbd className="text-[9px] px-1 py-0.5 rounded font-mono"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--silver-5)' }}>
              ⌘K
            </kbd>
          </div>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Notification bell */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="btn-icon relative"
            style={unread > 0 ? { borderColor: 'rgba(59,130,246,0.2)' } : {}}
          >
            <Bell size={14} style={{ color: pulse ? 'var(--aurora)' : 'var(--silver-4)', transition: 'color 300ms' }} />
            {unread > 0 && (
              <>
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                  style={{ fontSize: 9, background: 'var(--crimson)', zIndex: 1 }}
                >
                  {unread > 9 ? '9+' : unread}
                </span>
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full"
                  style={{ background: 'var(--crimson)', animation: 'notif-ping 1.5s ease-out infinite', opacity: 0.5 }}
                />
              </>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-10 w-80 rounded-xl overflow-hidden z-50 animate-fade-in"
              style={{
                background: 'var(--surface-2)',
                border:     '1px solid rgba(59,130,246,0.15)',
                boxShadow:  'var(--shadow-panel)',
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--silver)' }}>Notifications</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-medium transition-colors"
                    style={{ color: 'var(--aurora-light)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--aurora)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--aurora-light)'}
                  >
                    Mark all read
                  </button>
                  <button onClick={() => setNotifOpen(false)} className="btn-icon w-6 h-6">
                    <X size={12} />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    className="px-4 py-3 cursor-pointer transition-colors flex items-start gap-3"
                    style={{
                      borderBottom:   '1px solid rgba(255,255,255,0.03)',
                      background:     !n.read ? 'rgba(59,130,246,0.04)' : '',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'rgba(59,130,246,0.04)' : ''}
                  >
                    <div className="mt-1.5 flex-shrink-0 relative">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLOR[n.type] || 'var(--silver-4)' }} />
                      {!n.read && (
                        <div className="absolute inset-0 rounded-full"
                          style={{ background: TYPE_COLOR[n.type], animation: 'pulse 2s ease-out infinite', opacity: 0.5 }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--silver-3)' }}>{n.message}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--silver-5)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="px-4 py-2.5 text-center"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
              >
                <button className="text-xs font-medium transition-colors" style={{ color: 'var(--aurora-light)' }}>
                  View all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin chip */}
        <button
          className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-150 flex-shrink-0"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            {initials}
          </div>
          <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--silver-3)' }}>
            {admin?.name?.split(' ')[0] || 'Admin'}
          </span>
        </button>
      </div>
    </header>
  )
}
