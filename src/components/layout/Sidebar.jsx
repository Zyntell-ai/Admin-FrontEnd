import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useSidebar } from '../../context/SidebarContext'
import {
  LayoutDashboard, CalendarCheck, BarChart3, CreditCard,
  DollarSign, Building2, Tag, Bell, Settings,
  LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { path: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/bookings',    label: 'Bookings',     icon: CalendarCheck   },
  { path: '/analytics',   label: 'Analytics',    icon: BarChart3       },
  { path: '/billing',     label: 'Billing',      icon: CreditCard      },
  { path: '/commissions', label: 'Commissions',  icon: DollarSign      },
  { path: '/businesses',  label: 'Businesses',   icon: Building2       },
  { path: '/categories',  label: 'Categories',   icon: Tag             },
  { path: '/alerts',      label: 'Alerts',       icon: Bell            },
  { path: '/settings',    label: 'Settings',     icon: Settings        },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { admin, logout }     = useAuth()
  const { addToast }          = useToast()
  const { collapsed, setCollapsed } = useSidebar()

  const initials = admin?.name
    ? admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  const handleLogout = () => {
    logout()
    addToast('Logged out successfully', 'info')
    navigate('/login', { replace: true })
  }

  const W = collapsed ? 80 : 260

  return (
    <aside
      className="sidebar-transition fixed left-0 top-0 h-screen flex flex-col z-50 overflow-hidden"
      style={{
        width: W,
        background: 'linear-gradient(180deg, #0D1117 0%, #080B12 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Brand ────────────────────────────────────────────── */}
      <div
        className="flex items-center px-4 py-5 flex-shrink-0"
        style={{
          borderBottom:  '1px solid rgba(255,255,255,0.04)',
          minHeight:     64,
          gap:           collapsed ? 0 : 12,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <img src="/logo.png" alt="Zyntell" className="w-8 h-8 object-contain flex-shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <p
              className="font-bold leading-none"
              style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--silver)', letterSpacing: '0.08em' }}
            >
              ZYNTELL
            </p>
            <p className="text-[9px] mt-0.5 tracking-widest uppercase" style={{ color: 'var(--silver-5)' }}>
              AI Platform
            </p>
          </div>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {!collapsed && (
          <p className="px-2 mb-2 text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--silver-5)' }}>
            Main Menu
          </p>
        )}
        <ul className="space-y-0.5">
          {NAV.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path)

            return (
              <li key={path}>
                <NavLink
                  to={path}
                  title={collapsed ? label : undefined}
                  className={clsx(
                    'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 relative group',
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                    isActive ? 'nav-item-active' : 'text-[var(--silver-4)] hover:text-[var(--silver-2)] hover:bg-white/[0.03]'
                  )}
                >
                  {/* Left aurora accent bar */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0, top: '20%', bottom: '20%',
                        width: 2,
                        borderRadius: '0 2px 2px 0',
                        background: 'linear-gradient(180deg, var(--aurora), var(--violet))',
                        boxShadow: '0 0 6px var(--aurora-glow)',
                      }}
                    />
                  )}
                  <Icon
                    size={17}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: isActive ? 'var(--aurora)' : undefined }}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{label}</span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Bottom ───────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-2 py-3 space-y-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={clsx(
            'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 group py-2',
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
          style={{ color: 'var(--silver-4)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--crimson-light)'; e.currentTarget.style.background = 'var(--crimson-dim)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--silver-4)'; e.currentTarget.style.background = '' }}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Profile chip */}
        <button
          onClick={() => navigate('/profile')}
          title={collapsed ? admin?.name || 'Profile' : undefined}
          className={clsx(
            'w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 py-2',
            collapsed ? 'justify-center px-2' : 'px-2'
          )}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--silver-2)' }}>
                {admin?.name || 'Admin'}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--silver-5)' }}>
                {admin?.role || 'SUPER_ADMIN'}
              </p>
            </div>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={clsx(
            'w-full flex items-center gap-2 rounded-lg py-2 text-xs font-medium transition-all duration-150',
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
          style={{ color: 'var(--silver-5)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--silver-3)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--silver-5)'}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <><ChevronLeft size={14} /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}
