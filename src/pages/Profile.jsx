/**
 * @file        Profile.jsx
 * @module      Admin Profile
 * @project     Admin-FrontEnd
 * @layer       Page
 * @description Displays the authenticated admin's identity, account details, role badge, active status, and permission set, with a sign-out action.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - React (useState)
 *   - react-router-dom (useNavigate)
 *   - AuthContext (useAuth → admin, logout)
 *   - ToastContext (useToast → addToast)
 *   - ../components/layout/Layout
 *   - lucide-react (User, Mail, Shield, Calendar, Clock, Edit2, Check, X, Lock, Key, AlertCircle, ChevronRight, LogOut, ArrowLeft)
 *   - clsx
 *
 * @sideEffects
 *   - Calls logout() which clears JWT token from AuthContext / localStorage
 *   - Navigates to "/login" on sign-out
 *   - Fires toast notification on sign-out
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
import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  User, Mail, Shield, Calendar, Clock, Edit2,
  Check, X, Lock, Key, AlertCircle, ChevronRight,
  LogOut, ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/** Tailwind class mapping from admin role to badge colour scheme */
const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-gold-muted text-gold border border-gold/30',
  ADMIN:       'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  SUPPORT:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  FINANCE:     'bg-amber-500/10 text-amber-400 border border-amber-500/30',
}

/** Full list of permission keys and their display metadata used to render the permissions grid */
const ALL_PERMISSIONS = [
  { key: 'manage_businesses', label: 'Manage Businesses', desc: 'View, edit, suspend businesses' },
  { key: 'view_revenue',      label: 'View Revenue',      desc: 'Access billing and financial data' },
  { key: 'handle_alerts',     label: 'Handle Alerts',     desc: 'Resolve, assign, dismiss alerts' },
  { key: 'manage_categories', label: 'Manage Categories', desc: 'Edit categories and commission rates' },
  { key: 'manage_admins',     label: 'Manage Admins',     desc: 'Create and manage admin users' },
]

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

export default function Profile() {
  // [AUTH]: Read current admin session and logout action from context
  const { admin, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  /**
   * @function    handleLogout
   * @purpose     Clears the admin session, shows a success toast, and redirects to the login page
   * @returns     {void}
   */
  const handleLogout = () => {
    // [AUTH]: Invalidate token and clear stored admin state
    logout()
    addToast('Signed out successfully', 'success')
    navigate('/login', { replace: true })
  }

  // [GUARD]: If no active admin session exists, render a fallback empty-state card
  if (!admin) {
    return (
      <Layout title="Profile">
        <div className="card p-12 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-white">No admin session found</p>
        </div>
      </Layout>
    )
  }

  // [STATE]: Derive effective permissions — SUPER_ADMIN inherits all, others use their assigned array
  const permissions = admin.role === 'SUPER_ADMIN'
    ? ALL_PERMISSIONS.map(p => p.key)
    : (admin.permissions || [])

// ─────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────

  return (
    <Layout title="Profile">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="max-w-2xl">
        {/* Profile Hero */}
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-indigo flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {admin.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1">{admin.name}</h1>
              <p className="text-sm text-slate-400">{admin.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={clsx('badge text-[10px]', ROLE_COLORS[admin.role] || 'badge-gray')}>
                  {admin.role}
                </span>
                <span className={clsx('badge text-[10px]', admin.isActive ? 'badge-green' : 'badge-red')}>
                  {admin.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-red-400 border border-red-500/20 bg-red-500/10 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-all flex-shrink-0">
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div className="card p-5 mb-5">
          <h3 className="section-title mb-4">Account Details</h3>
          <div className="space-y-0">
            {[
              { label: 'Full Name', value: admin.name, icon: User },
              { label: 'Email', value: admin.email, icon: Mail },
              { label: 'Role', value: admin.role, icon: Shield },
              { label: 'Admin ID', value: admin.id, icon: Key },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0">
                <div className="flex items-center gap-3 w-44">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Icon size={14} className="text-indigo-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
                </div>
                <div className="flex-1 mx-4">
                  <span className="text-sm text-slate-300 font-mono break-all">{value || '—'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Note about editing */}
          <div className="mt-4 flex items-start gap-2 bg-white/[0.03] rounded-xl p-3">
            <AlertCircle size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">
              Profile editing is not available in the current backend version. To update your account details or password, contact a Super Admin or use direct Firestore access.
            </p>
          </div>
        </div>

        {/* Permissions */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Your Permissions</h3>
          <div className="space-y-3">
            {ALL_PERMISSIONS.map(p => {
              const has = permissions.includes(p.key)
              return (
                <div key={p.key} className={clsx('flex items-center gap-3 p-3 rounded-xl border', has ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/[0.05] opacity-50')}>
                  <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', has ? 'bg-emerald-500/20' : 'bg-white/5')}>
                    {has ? <Check size={12} className="text-emerald-400" /> : <X size={12} className="text-slate-500" />}
                  </div>
                  <div>
                    <p className={clsx('text-xs font-semibold', has ? 'text-white' : 'text-slate-500')}>{p.label}</p>
                    <p className="text-[10px] text-slate-500">{p.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}
