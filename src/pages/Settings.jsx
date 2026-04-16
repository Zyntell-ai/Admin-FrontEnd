import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getAdminUsers, inviteAdmin, sendOtp, verifyOtp,
  updatePermissions, updateAdmin, deleteAdmin,
} from '../api/adminUsers'
import {
  Users, Shield, Settings2, Globe, Plus, Edit2,
  Trash2, CheckCircle, XCircle, Key, Save,
  Loader2, Mail, Phone, Send, RefreshCw,
  AlertTriangle, Lock, ChevronDown, ChevronUp,
  Eye, EyeOff
} from 'lucide-react'
import clsx from 'clsx'

// ── Constants ──────────────────────────────────────────────────────────────────
const TABS = ['Users & Roles', 'Permissions', 'System Settings']

const ROLES = ['ADMIN', 'SUPPORT', 'FINANCE']  // SUPER_ADMIN only created via seed

const ALL_PERMISSIONS = [
  { key: 'manage_businesses', label: 'Manage Businesses', desc: 'View, edit, suspend businesses' },
  { key: 'view_revenue',      label: 'View Revenue',      desc: 'Access billing and financial data' },
  { key: 'handle_alerts',     label: 'Handle Alerts',     desc: 'Resolve, assign, dismiss alerts' },
  { key: 'manage_categories', label: 'Manage Categories', desc: 'Edit categories and commission rates' },
]

const ROLE_DEFAULT_PERMISSIONS = {
  ADMIN:   ['manage_businesses', 'view_revenue', 'handle_alerts', 'manage_categories'],
  SUPPORT: ['manage_businesses', 'handle_alerts'],
  FINANCE: ['view_revenue'],
}

const roleColors = {
  SUPER_ADMIN: 'bg-gold-muted text-gold border border-gold/30',
  ADMIN:       'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  SUPPORT:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  FINANCE:     'bg-amber-500/10 text-amber-400 border border-amber-500/30',
}

const permissionsMatrix = [
  { resource: 'Dashboard',      superAdmin: true, admin: true,  support: true,  finance: false },
  { resource: 'Bookings',       superAdmin: true, admin: true,  support: true,  finance: false },
  { resource: 'Analytics',      superAdmin: true, admin: true,  support: false, finance: false },
  { resource: 'Billing',        superAdmin: true, admin: true,  support: false, finance: true  },
  { resource: 'Commissions',    superAdmin: true, admin: true,  support: false, finance: true  },
  { resource: 'Businesses',     superAdmin: true, admin: true,  support: true,  finance: false },
  { resource: 'Categories',     superAdmin: true, admin: true,  support: false, finance: false },
  { resource: 'Alerts',         superAdmin: true, admin: true,  support: true,  finance: false },
  { resource: 'Settings',       superAdmin: true, admin: false, support: false, finance: false },
  { resource: 'Export Data',    superAdmin: true, admin: true,  support: false, finance: true  },
  { resource: 'Suspend Business', superAdmin: true, admin: false, support: false, finance: false },
  { resource: 'Manage Admins',  superAdmin: true, admin: false, support: false, finance: false },
]

const systemSettings = [
  { key: 'auto_invoice',   label: 'Auto-generate Monthly Invoices',      value: true,  type: 'toggle' },
  { key: 'trial_days',     label: 'Trial Period',                        value: '14',  type: 'number', unit: 'days' },
  { key: 'anomaly_thresh', label: 'Anomaly Alert Threshold',             value: '15',  type: 'number', unit: '%' },
  { key: 'low_usage',      label: 'Low Usage Threshold',                 value: '5',   type: 'number', unit: 'bookings/week' },
  { key: 'signal_min',     label: 'Commission Auto-confirm Signal Score', value: '85',  type: 'number', unit: '/175' },
  { key: 'grace_days',     label: 'Overdue Invoice Grace Period',        value: '7',   type: 'number', unit: 'days' },
  { key: 'conv_cap',       label: 'Trial Conversation Cap',              value: '50',  type: 'number', unit: 'messages' },
  { key: 'retention',      label: 'Data Retention Policy',               value: '24',  type: 'number', unit: 'months' },
]

// ── OTP Input Component ────────────────────────────────────────────────────────
function OtpField({ label, type, value, onChange, onSend, onVerify, sending, verifying, verified, disabled, devOtp }) {
  const [otp, setOtp]         = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [countdown, setCount] = useState(0)

  const startCountdown = () => {
    setCount(60)
    const t = setInterval(() => {
      setCount(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 })
    }, 1000)
  }

  const handleSend = async () => {
    const err = await onSend()
    if (!err) startCountdown()
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
        {label}
      </label>

      {/* Input + Send OTP button */}
      <div className="flex gap-2">
        <input
          type={type === 'mobile' ? 'tel' : 'email'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={type === 'mobile' ? '+91 9876543210' : 'admin@zyntell.in'}
          disabled={verified || disabled}
          className={clsx(
            'flex-1 bg-white/[0.06] border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600',
            'focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            verified ? 'border-emerald-500/40' : 'border-white/[0.08] focus:border-indigo-500/60'
          )}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!value || verified || countdown > 0 || sending || disabled}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border',
            verified
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          {verified ? (
            <><CheckCircle size={12} /> Verified</>
          ) : sending ? (
            <><Loader2 size={12} className="animate-spin" /> Sending...</>
          ) : countdown > 0 ? (
            <><RefreshCw size={12} /> {countdown}s</>
          ) : (
            <><Send size={12} /> Send OTP</>
          )}
        </button>
      </div>

      {/* Dev OTP hint */}
      {devOtp && !verified && (
        <p className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          🔧 Dev mode OTP: <span className="font-mono font-bold">{devOtp}</span>
        </p>
      )}

      {/* OTP verification input */}
      {!verified && countdown > 0 && (
        <div className="flex gap-2 animate-fade-in">
          <div className="relative flex-1">
            <input
              type={showOtp ? 'text' : 'password'}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all font-mono tracking-widest"
            />
            <button type="button" onClick={() => setShowOtp(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors" tabIndex={-1}>
              {showOtp ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <button
            type="button"
            onClick={async () => {
              const err = await onVerify(otp)
              if (!err) setOtp('')
            }}
            disabled={otp.length < 6 || verifying}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {verifying ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            Verify
          </button>
        </div>
      )}
    </div>
  )
}

// ── Permission Checkbox Grid ───────────────────────────────────────────────────
function PermissionGrid({ selected, onChange, disabled = false }) {
  const toggle = (key) => {
    if (disabled) return
    onChange(
      selected.includes(key)
        ? selected.filter(p => p !== key)
        : [...selected, key]
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {ALL_PERMISSIONS.map(perm => {
        const isSelected = selected.includes(perm.key)
        return (
          <button
            key={perm.key}
            type="button"
            onClick={() => toggle(perm.key)}
            disabled={disabled}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
              isSelected
                ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-200',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <div className={clsx(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
              isSelected ? 'bg-indigo-600 border-indigo-500' : 'border-white/20'
            )}>
              {isSelected && <CheckCircle size={12} className="text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none">{perm.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{perm.desc}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Main Settings Page ─────────────────────────────────────────────────────────
export default function Settings() {
  const { admin: me } = useAuth()
  const { addToast }  = useToast()

  const [activeTab, setActiveTab]     = useState('Users & Roles')
  const [users, setUsers]             = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [settings, setSettings]       = useState(systemSettings)

  // ── Modals ───────────────────────────────────────────────────────────────────
  const [inviteModal, setInviteModal]   = useState(false)
  const [editPermModal, setEditPermModal] = useState(null)   // admin object
  const [deleteModal, setDeleteModal]   = useState(null)     // admin object

  // ── Invite form state ─────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:        '',
    email:       '',
    mobile:      '',
    role:        'ADMIN',
    permissions: ROLE_DEFAULT_PERMISSIONS['ADMIN'],
  })
  const [formErrors, setFormErrors]     = useState({})
  const [inviteLoading, setInviteLoading] = useState(false)

  // OTP states
  const [emailOtp, setEmailOtp]           = useState({ sending: false, verifying: false, verified: false, devOtp: '' })
  const [mobileOtp, setMobileOtp]         = useState({ sending: false, verifying: false, verified: false, devOtp: '' })
  const [emailOtpError, setEmailOtpError] = useState('')
  const [mobileOtpError, setMobileOtpError] = useState('')

  // ── Edit permissions state ────────────────────────────────────────────────────
  const [editedPerms, setEditedPerms]   = useState([])
  const [editPermLoading, setEditPermLoading] = useState(false)

  // ── Delete state ──────────────────────────────────────────────────────────────
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // ── Load admin users ──────────────────────────────────────────────────────────
  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await getAdminUsers()
      if (data.success) setUsers(data.users)
    } catch (err) {
      addToast('Could not load admin users', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  // ── Role change auto-fills default permissions ────────────────────────────────
  const handleRoleChange = (role) => {
    setForm(f => ({ ...f, role, permissions: ROLE_DEFAULT_PERMISSIONS[role] || [] }))
  }

  // ── Send OTP ──────────────────────────────────────────────────────────────────
  const handleSendEmailOtp = async () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setFormErrors(e => ({ ...e, email: 'Enter a valid email first' }))
      return 'invalid email'
    }
    setEmailOtp(s => ({ ...s, sending: true }))
    setEmailOtpError('')
    try {
      const data = await sendOtp('email', form.email)
      setEmailOtp(s => ({ ...s, sending: false, devOtp: data.devOtp || '' }))
      addToast('OTP sent to email', 'success')
      return null
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP'
      setEmailOtp(s => ({ ...s, sending: false }))
      setEmailOtpError(msg)
      return msg
    }
  }

  const handleSendMobileOtp = async () => {
    if (!form.mobile || !/^\+?[0-9]{10,13}$/.test(form.mobile.replace(/\s/g, ''))) {
      setFormErrors(e => ({ ...e, mobile: 'Enter a valid mobile number first' }))
      return 'invalid mobile'
    }
    setMobileOtp(s => ({ ...s, sending: true }))
    setMobileOtpError('')
    try {
      const data = await sendOtp('mobile', form.mobile)
      setMobileOtp(s => ({ ...s, sending: false, devOtp: data.devOtp || '' }))
      addToast('OTP sent to mobile', 'success')
      return null
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP'
      setMobileOtp(s => ({ ...s, sending: false }))
      setMobileOtpError(msg)
      return msg
    }
  }

  const handleVerifyEmailOtp = async (otp) => {
    setEmailOtp(s => ({ ...s, verifying: true }))
    setEmailOtpError('')
    try {
      await verifyOtp(form.email, otp)
      setEmailOtp(s => ({ ...s, verifying: false, verified: true }))
      addToast('Email verified ✓', 'success')
      return null
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid OTP'
      setEmailOtp(s => ({ ...s, verifying: false }))
      setEmailOtpError(msg)
      return msg
    }
  }

  const handleVerifyMobileOtp = async (otp) => {
    setMobileOtp(s => ({ ...s, verifying: true }))
    setMobileOtpError('')
    try {
      await verifyOtp(form.mobile, otp)
      setMobileOtp(s => ({ ...s, verifying: false, verified: true }))
      addToast('Mobile verified ✓', 'success')
      return null
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid OTP'
      setMobileOtp(s => ({ ...s, verifying: false }))
      setMobileOtpError(msg)
      return msg
    }
  }

  // ── Validate invite form ───────────────────────────────────────────────────────
  const validateInvite = () => {
    const errors = {}
    if (!form.name.trim() || form.name.trim().length < 2)  errors.name   = 'Full name is required (min 2 chars)'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))  errors.email  = 'Valid email is required'
    if (!form.mobile || !/^\+?[0-9]{10,13}$/.test(form.mobile.replace(/\s/g, ''))) errors.mobile = 'Valid mobile number is required'
    if (!emailOtp.verified)  errors.emailVerify  = 'Please verify the email address'
    if (!mobileOtp.verified) errors.mobileVerify = 'Please verify the mobile number'
    if (form.permissions.length === 0) errors.permissions = 'Select at least one permission'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ── Submit invite ─────────────────────────────────────────────────────────────
  const handleInvite = async () => {
    if (!validateInvite()) return

    setInviteLoading(true)
    try {
      const data = await inviteAdmin({
        name:        form.name.trim(),
        email:       form.email.trim().toLowerCase(),
        mobile:      form.mobile.trim(),
        role:        form.role,
        permissions: form.permissions,
      })

      if (data.success) {
        addToast(`${form.name} invited successfully`, 'success',
          data.tempPassword ? `Temp password: ${data.tempPassword}` : 'Credentials sent via email'
        )
        setInviteModal(false)
        resetInviteForm()
        loadUsers()
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to invite admin'
      addToast(msg, 'error')
    } finally {
      setInviteLoading(false)
    }
  }

  const resetInviteForm = () => {
    setForm({ name: '', email: '', mobile: '', role: 'ADMIN', permissions: ROLE_DEFAULT_PERMISSIONS['ADMIN'] })
    setFormErrors({})
    setEmailOtp({ sending: false, verifying: false, verified: false, devOtp: '' })
    setMobileOtp({ sending: false, verifying: false, verified: false, devOtp: '' })
    setEmailOtpError('')
    setMobileOtpError('')
  }

  // ── Open edit permissions modal ────────────────────────────────────────────────
  const openEditPerms = (admin) => {
    setEditPermModal(admin)
    setEditedPerms([...(admin.permissions || [])])
  }

  // ── Save permissions ──────────────────────────────────────────────────────────
  const handleSavePermissions = async () => {
    if (editedPerms.length === 0) {
      addToast('Select at least one permission', 'error')
      return
    }
    setEditPermLoading(true)
    try {
      await updatePermissions(editPermModal.id, editedPerms)
      setUsers(prev => prev.map(u => u.id === editPermModal.id ? { ...u, permissions: editedPerms } : u))
      addToast(`Permissions updated for ${editPermModal.name}`, 'success')
      setEditPermModal(null)
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update permissions', 'error')
    } finally {
      setEditPermLoading(false)
    }
  }

  // ── Toggle user active/inactive ───────────────────────────────────────────────
  const handleToggleActive = async (user) => {
    try {
      await updateAdmin(user.id, { isActive: !user.isActive })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      addToast(`${user.name} ${!user.isActive ? 'activated' : 'deactivated'}`, 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update', 'error')
    }
  }

  // ── Delete admin ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (deleteConfirm !== deleteModal.name) {
      addToast('Type the exact name to confirm', 'error')
      return
    }
    setDeleteLoading(true)
    try {
      await deleteAdmin(deleteModal.id)
      setUsers(prev => prev.filter(u => u.id !== deleteModal.id))
      addToast(`${deleteModal.name} deleted permanently`, 'success')
      setDeleteModal(null)
      setDeleteConfirm('')
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to delete', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const updateSetting = (key, value) => setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))

  const isSuperAdmin = me?.role === 'SUPER_ADMIN'

  return (
    <Layout title="Settings">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Settings</h1>
          <p className="text-sm text-slate-500">Admin users, roles, permissions, and platform configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-white/[0.06] mb-6">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={clsx('flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
              activeTab === tab ? 'text-white border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-200')}>
            {tab === 'Users & Roles'   && <Users    size={14} />}
            {tab === 'Permissions'     && <Shield   size={14} />}
            {tab === 'System Settings' && <Settings2 size={14} />}
            {tab}
          </button>
        ))}
      </div>

      {/* ── USERS & ROLES TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'Users & Roles' && (
        <div>
          {/* Summary + Add button */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'FINANCE'].map(role => (
                <span key={role} className={clsx('badge text-[10px] px-2.5 py-1', roleColors[role])}>
                  {users.filter(u => u.role === role).length} {role}
                </span>
              ))}
              <span className="text-xs text-slate-600">· {users.length} total</span>
            </div>
            {isSuperAdmin && (
              <button onClick={() => { resetInviteForm(); setInviteModal(true) }} className="btn-primary">
                <Plus size={13} /> Add Admin
              </button>
            )}
          </div>

          {/* Users table */}
          {loadingUsers ? (
            <div className="card overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04] animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-white/5 rounded" />
                    <div className="h-2.5 w-48 bg-white/5 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Admin', 'Email', 'Role', 'Permissions', 'Status', 'Last Login', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const isMe     = user.id === me?.id
                    const isSA     = user.role === 'SUPER_ADMIN'
                    const canEdit  = isSuperAdmin && !isMe
                    const canDelete = isSuperAdmin && !isMe && !isSA

                    return (
                      <tr key={user.id} className={clsx('border-b border-white/[0.04] table-row-hover', !user.isActive && 'opacity-50')}>
                        {/* Admin */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0', isSA ? 'bg-gradient-gold' : 'bg-gradient-indigo')}>
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white">{user.name}</p>
                                {isMe && <span className="badge bg-indigo-500/10 text-indigo-400 text-[9px] px-1.5 py-0.5">You</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4 text-slate-400 text-xs">{user.email}</td>

                        {/* Role */}
                        <td className="px-4 py-4">
                          <span className={clsx('badge text-[10px]', roleColors[user.role])}>{user.role}</span>
                        </td>

                        {/* Permissions */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(user.permissions || []).slice(0, 2).map(p => (
                              <span key={p} className="badge badge-gray text-[9px]">{p.replace(/_/g, ' ')}</span>
                            ))}
                            {(user.permissions || []).length > 2 && (
                              <span className="badge badge-gray text-[9px]">+{user.permissions.length - 2}</span>
                            )}
                            {(user.permissions || []).length === 0 && (
                              <span className="text-[10px] text-slate-600 italic">None</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => canEdit && handleToggleActive(user)}
                            disabled={!canEdit}
                            className={clsx(
                              'flex items-center gap-1.5 text-xs font-medium',
                              user.isActive ? 'text-emerald-400' : 'text-slate-500',
                              canEdit && 'hover:opacity-80 transition-opacity cursor-pointer'
                            )}
                          >
                            <span className={clsx('w-1.5 h-1.5 rounded-full', user.isActive ? 'bg-emerald-400' : 'bg-slate-600')} />
                            {user.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Last Login */}
                        <td className="px-4 py-4 text-xs text-slate-500">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : 'Never'}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            {/* Edit permissions */}
                            {canEdit && (
                              <button
                                onClick={() => openEditPerms(user)}
                                className="flex items-center gap-1 text-[10px] btn-ghost px-2 py-1.5"
                                title="Edit permissions"
                              >
                                <Key size={11} /> Permissions
                              </button>
                            )}

                            {/* Delete */}
                            {canDelete && (
                              <button
                                onClick={() => { setDeleteModal(user); setDeleteConfirm('') }}
                                className="flex items-center gap-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 px-2 py-1.5 rounded-lg transition-all"
                                title="Delete account"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}

                            {/* Lock icon for protected accounts */}
                            {(isMe || isSA) && (
                              <span className="text-slate-700" title={isMe ? 'Your own account' : 'Super admin protected'}>
                                <Lock size={12} />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {users.length === 0 && !loadingUsers && (
                <div className="py-10 text-center">
                  <Users size={28} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No admin users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PERMISSIONS TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'Permissions' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="section-title">Role-based Access Control Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Default permissions per role</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Resource</th>
                {['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'FINANCE'].map(role => (
                  <th key={role} className="px-5 py-3 text-center text-[10px]">
                    <span className={clsx('badge', roleColors[role])}>{role}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.04] table-row-hover">
                  <td className="px-5 py-3 text-sm text-white font-medium">{row.resource}</td>
                  {['superAdmin', 'admin', 'support', 'finance'].map(role => (
                    <td key={role} className="px-5 py-3 text-center">
                      {row[role]
                        ? <CheckCircle size={15} className="text-emerald-400 mx-auto" />
                        : <XCircle    size={15} className="text-slate-700 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SYSTEM SETTINGS TAB ───────────────────────────────────────────────── */}
      {activeTab === 'System Settings' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <Globe size={15} className="text-indigo-400" />
              <h3 className="section-title">Global Platform Settings</h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {settings.map(s => (
                <div key={s.key} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02]">
                  <p className="text-sm font-medium text-white">{s.label}</p>
                  <div className="flex items-center gap-3">
                    {s.type === 'toggle' ? (
                      <button
                        onClick={() => isSuperAdmin && updateSetting(s.key, !s.value)}
                        disabled={!isSuperAdmin}
                        className={clsx('w-10 h-5 rounded-full transition-all relative', s.value ? 'bg-indigo-600' : 'bg-white/10', !isSuperAdmin && 'cursor-not-allowed opacity-50')}>
                        <div className={clsx('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', s.value ? 'right-0.5' : 'left-0.5')} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input type="number" value={s.value}
                          onChange={e => isSuperAdmin && updateSetting(s.key, e.target.value)}
                          disabled={!isSuperAdmin}
                          className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-indigo-500/50 disabled:opacity-50" />
                        {s.unit && <span className="text-xs text-slate-500">{s.unit}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {isSuperAdmin && (
              <div className="px-5 py-4 border-t border-white/[0.06]">
                <button
                  onClick={() => addToast('Settings saved', 'success')}
                  className="btn-primary">
                  <Save size={13} /> Save All Settings
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5 border-red-500/10">
              <h3 className="text-sm font-semibold text-white mb-1">Danger Zone</h3>
              <p className="text-xs text-slate-500 mb-4">Irreversible — proceed with extreme caution</p>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 justify-start bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 px-3 py-2 rounded-lg text-xs font-medium transition-all">
                  <XCircle size={12} /> Clear All Alert History
                </button>
                <button className="w-full flex items-center gap-2 justify-start bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 px-3 py-2 rounded-lg text-xs font-medium transition-all">
                  <XCircle size={12} /> Reset Platform Settings to Default
                </button>
              </div>
            </div>
            <div className="card p-5 border-emerald-500/10">
              <h3 className="text-sm font-semibold text-white mb-1">Platform Health</h3>
              <p className="text-xs text-slate-500 mb-4">Live system status</p>
              <div className="space-y-3">
                {[
                  { label: 'API Gateway',        ok: true,  status: 'Operational' },
                  { label: 'Bot Engine',         ok: true,  status: 'Operational' },
                  { label: 'WhatsApp Webhook',   ok: true,  status: 'Operational' },
                  { label: 'Firebase Firestore', ok: true,  status: 'Operational' },
                  { label: 'Redis Cache',        ok: false, status: 'Unavailable (dev)' },
                  { label: 'Invoice Queue',      ok: false, status: '3 pending jobs' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{s.label}</span>
                    <span className={clsx('flex items-center gap-1', s.ok ? 'text-emerald-400' : 'text-amber-400')}>
                      <span className={clsx('w-1.5 h-1.5 rounded-full', s.ok ? 'bg-emerald-400' : 'bg-amber-400')} />
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          INVITE ADMIN MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal open={inviteModal} onClose={() => { setInviteModal(false); resetInviteForm() }} title="Add New Admin" size="lg">
        <div className="space-y-5">

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
            <input
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(e => ({ ...e, name: '' })) }}
              placeholder="e.g. Priya Sharma"
              className={clsx('input-field', formErrors.name && 'border-red-500/50')}
            />
            {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
          </div>

          {/* Email with OTP */}
          <div>
            <OtpField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={v => { setForm(f => ({ ...f, email: v })); setFormErrors(e => ({ ...e, email: '', emailVerify: '' })); setEmailOtp(s => ({ ...s, verified: false, devOtp: '' })) }}
              onSend={handleSendEmailOtp}
              onVerify={handleVerifyEmailOtp}
              sending={emailOtp.sending}
              verifying={emailOtp.verifying}
              verified={emailOtp.verified}
              devOtp={emailOtp.devOtp}
            />
            {(formErrors.email || formErrors.emailVerify || emailOtpError) && (
              <p className="text-xs text-red-400 mt-1">{formErrors.email || formErrors.emailVerify || emailOtpError}</p>
            )}
          </div>

          {/* Mobile with OTP */}
          <div>
            <OtpField
              label="Mobile Number"
              type="mobile"
              value={form.mobile}
              onChange={v => { setForm(f => ({ ...f, mobile: v })); setFormErrors(e => ({ ...e, mobile: '', mobileVerify: '' })); setMobileOtp(s => ({ ...s, verified: false, devOtp: '' })) }}
              onSend={handleSendMobileOtp}
              onVerify={handleVerifyMobileOtp}
              sending={mobileOtp.sending}
              verifying={mobileOtp.verifying}
              verified={mobileOtp.verified}
              devOtp={mobileOtp.devOtp}
            />
            {(formErrors.mobile || formErrors.mobileVerify || mobileOtpError) && (
              <p className="text-xs text-red-400 mt-1">{formErrors.mobile || formErrors.mobileVerify || mobileOtpError}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={clsx(
                    'py-2.5 rounded-xl text-xs font-medium transition-all border',
                    form.role === role ? `${roleColors[role]} border-current` : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Permissions
              {formErrors.permissions && <span className="text-red-400 ml-2 normal-case">{formErrors.permissions}</span>}
            </label>
            <PermissionGrid
              selected={form.permissions}
              onChange={perms => { setForm(f => ({ ...f, permissions: perms })); setFormErrors(e => ({ ...e, permissions: '' })) }}
            />
          </div>

          {/* Verification status summary */}
          <div className="flex items-center gap-4 px-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
            <div className={clsx('flex items-center gap-2 text-xs font-medium', emailOtp.verified ? 'text-emerald-400' : 'text-slate-500')}>
              {emailOtp.verified ? <CheckCircle size={13} /> : <Mail size={13} />}
              Email {emailOtp.verified ? 'Verified' : 'Not Verified'}
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className={clsx('flex items-center gap-2 text-xs font-medium', mobileOtp.verified ? 'text-emerald-400' : 'text-slate-500')}>
              {mobileOtp.verified ? <CheckCircle size={13} /> : <Phone size={13} />}
              Mobile {mobileOtp.verified ? 'Verified' : 'Not Verified'}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleInvite}
              disabled={inviteLoading}
              className={clsx(
                'btn-primary flex-1 justify-center',
                inviteLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {inviteLoading
                ? <><Loader2 size={14} className="animate-spin" /> Creating Admin...</>
                : <><Plus size={14} /> Create Admin Account</>}
            </button>
            <button onClick={() => { setInviteModal(false); resetInviteForm() }} className="btn-ghost flex-1 justify-center">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          EDIT PERMISSIONS MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal open={!!editPermModal} onClose={() => setEditPermModal(null)} title={`Edit Permissions — ${editPermModal?.name}`} size="md">
        {editPermModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
              <div className="w-9 h-9 rounded-full bg-gradient-indigo flex items-center justify-center text-xs font-bold text-white">
                {editPermModal.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{editPermModal.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={clsx('badge text-[10px]', roleColors[editPermModal.role])}>{editPermModal.role}</span>
                  <span className="text-xs text-slate-500">{editPermModal.email}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Permissions</p>
              <PermissionGrid selected={editedPerms} onChange={setEditedPerms} />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>{editedPerms.length} of {ALL_PERMISSIONS.length} permissions selected</span>
              <button
                onClick={() => setEditedPerms(ALL_PERMISSIONS.map(p => p.key))}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Select all
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSavePermissions}
                disabled={editPermLoading || editedPerms.length === 0}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {editPermLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  : <><Save size={14} /> Save Permissions</>}
              </button>
              <button onClick={() => setEditPermModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          DELETE ADMIN MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal open={!!deleteModal} onClose={() => { setDeleteModal(null); setDeleteConfirm('') }} title="Delete Admin Account" size="sm">
        {deleteModal && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">This action is permanent</p>
                  <p className="text-xs text-slate-400">
                    Deleting <span className="text-white font-semibold">{deleteModal.name}</span>'s account
                    cannot be undone. They will immediately lose access to the platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-400">
                  {deleteModal.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{deleteModal.name}</p>
                  <p className="text-xs text-slate-400">{deleteModal.email} · {deleteModal.role}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Type <span className="text-white font-bold">{deleteModal.name}</span> to confirm
              </label>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder={deleteModal.name}
                className={clsx(
                  'input-field',
                  deleteConfirm === deleteModal.name && 'border-red-500/40'
                )}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== deleteModal.name || deleteLoading}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  deleteConfirm === deleteModal.name && !deleteLoading
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'
                )}
              >
                {deleteLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Deleting...</>
                  : <><Trash2 size={14} /> Delete Permanently</>}
              </button>
              <button onClick={() => { setDeleteModal(null); setDeleteConfirm('') }} className="btn-ghost flex-1 justify-center">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}