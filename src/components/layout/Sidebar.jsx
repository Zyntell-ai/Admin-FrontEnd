/**
 * @file        Sidebar.jsx
 * @module      Sidebar Navigation
 * @project     Admin-FrontEnd
 * @layer       Component
 * @description Fixed left sidebar component providing branded navigation links, active-route highlighting, logout functionality, and a profile shortcut.
 *
 * @updated     2026-05-28
 * @version     1.0.0
 *
 * @dependencies
 *   - react-router-dom (NavLink, useLocation, useNavigate)
 *   - ../../context/AuthContext (useAuth)
 *   - ../../context/ToastContext (useToast)
 *   - lucide-react (LayoutDashboard, CalendarCheck, BarChart3, CreditCard,
 *                   DollarSign, Building2, Tag, Bell, Settings, Zap, ChevronRight, LogOut)
 *   - clsx
 *
 * @sideEffects
 *   - Calls logout() from AuthContext on sign-out — clears localStorage tokens
 *   - Dispatches a toast notification on logout
 *   - Navigates to /login on logout
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
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  LayoutDashboard, CalendarCheck, BarChart3, CreditCard,
  DollarSign, Building2, Tag, Bell, Settings,
  ChevronRight, LogOut
} from 'lucide-react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/** Primary navigation items rendered in the sidebar menu */
const navItems = [
  { path: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/bookings',    label: 'Bookings',     icon: CalendarCheck },
  { path: '/analytics',   label: 'Analytics',    icon: BarChart3 },
  { path: '/billing',     label: 'Billing',      icon: CreditCard },
  { path: '/commissions', label: 'Commissions',  icon: DollarSign },
  { path: '/businesses',  label: 'Businesses',   icon: Building2 },
  { path: '/categories',  label: 'Categories',   icon: Tag },
  { path: '/alerts',      label: 'Alerts',       icon: Bell },
  { path: '/settings',    label: 'Settings',     icon: Settings },
]

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    Sidebar
 * @purpose     Renders the fixed left sidebar with logo, navigation links, logout button, and admin profile chip
 * @returns {JSX.Element} Fixed-position sidebar element
 */
export default function Sidebar() {
  const location = useLocation()
  const navigate  = useNavigate()
  // [AUTH]: Read admin profile and logout action from auth context
  const { admin, logout } = useAuth()
  // [CONTEXT]: Use toast to confirm logout action to the user
  const { addToast } = useToast()

  /**
   * @function    handleLogout
   * @purpose     Logs the admin out, shows a confirmation toast, and redirects to the login page
   * @returns {void}
   */
  const handleLogout = () => {
    // [AUTH]: Clear session state via context then navigate to login
    logout()
    addToast('Logged out successfully', 'info')
    navigate('/login', { replace: true })
  }

  // Get initials from name
  const initials = admin?.name
    ? admin.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-gradient-sidebar border-r border-white/[0.05] flex flex-col z-50">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Zyntell" className="w-9 h-9 object-contain flex-shrink-0" />
          <div>
            <h1 className="font-display text-white text-[17px] font-bold tracking-wide leading-none">ZYNTELL</h1>
            <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest uppercase">AI Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[9px] font-semibold text-slate-600 tracking-widest uppercase px-2 mb-3">Main Menu</p>
        <ul className="space-y-0.5">
          {navItems.map(({ path, label, icon: Icon, badge }) => {
            // [CONTEXT]: Exact match for root, prefix match for all other routes
            const isActive = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path)

            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group',
                    isActive
                      ? 'nav-item-active text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  )}
                >
                  <Icon
                    size={16}
                    className={clsx(
                      'flex-shrink-0 transition-colors',
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight size={12} className="text-indigo-400 opacity-60" />
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom — User info + Logout */}
      <div className="px-3 py-4 border-t border-white/[0.05] space-y-2">

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 group"
        >
          <LogOut size={15} className="flex-shrink-0 group-hover:text-red-400 transition-colors" />
          <span>Sign Out</span>
        </button>
        {/* User info — clicking goes to profile */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-indigo flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
              {admin?.name || 'Admin'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{admin?.role || 'SUPER_ADMIN'}</p>
          </div>

          <ChevronRight size={12} className="text-slate-600 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
        </button>
      </div>
    </aside>
  )
}
