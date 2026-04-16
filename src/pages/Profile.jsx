import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMyProfile, updateMyProfile, changeMyPassword } from '../api/profile'
import {
  User, Mail, Shield, Calendar, Clock, Edit2,
  Check, X, Lock, Eye, EyeOff, Loader2,
  ChevronRight, LogOut, Key, AlertCircle,
  CheckCircle, ArrowLeft
} from 'lucide-react'
import clsx from 'clsx'

// ── Password strength checker ──────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8)              score++
  if (password.length >= 12)             score++
  if (/[A-Z]/.test(password))           score++
  if (/[0-9]/.test(password))           score++
  if (/[^A-Za-z0-9]/.test(password))   score++

  const map = {
    0: { label: '',          color: 'bg-white/10'      },
    1: { label: 'Very Weak', color: 'bg-red-500'       },
    2: { label: 'Weak',      color: 'bg-orange-500'    },
    3: { label: 'Fair',      color: 'bg-amber-500'     },
    4: { label: 'Strong',    color: 'bg-indigo-500'    },
    5: { label: 'Very Strong', color: 'bg-emerald-500' },
  }

  return { score, ...map[score] }
}

// ── Editable field component ───────────────────────────────────────────────────
function EditableField({ label, value, icon: Icon, type = 'text', onSave, saving }) {
  const [editing, setEditing]   = useState(false)
  const [inputVal, setInputVal] = useState(value)
  const [error, setError]       = useState('')

  const handleSave = async () => {
    if (!inputVal.trim()) { setError(`${label} cannot be empty`); return }
    if (inputVal === value) { setEditing(false); return }
    const err = await onSave(inputVal.trim())
    if (err) { setError(err) } else { setEditing(false) }
  }

  const handleCancel = () => { setInputVal(value); setEditing(false); setError('') }

  const handleKey = (e) => {
    if (e.key === 'Enter')  handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0">
      <div className="flex items-center gap-3 flex-shrink-0 w-40">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Icon size={14} className="text-indigo-400" />
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>

      <div className="flex-1 mx-4">
        {editing ? (
          <div>
            <input
              type={type}
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setError('') }}
              onKeyDown={handleKey}
              autoFocus
              className={clsx(
                'w-full bg-white/[0.07] border rounded-lg px-3 py-2 text-sm text-white',
                'focus:outline-none transition-all',
                error ? 'border-red-500/50' : 'border-indigo-500/40 focus:border-indigo-500'
              )}
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
        ) : (
          <span className="text-sm text-white font-medium">{value}</span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-8 h-8 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 flex items-center justify-center transition-all"
            >
              {saving ? <Loader2 size={13} className="text-emerald-400 animate-spin" /> : <Check size={13} className="text-emerald-400" />}
            </button>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-all"
            >
              <X size={13} className="text-red-400" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center transition-all group"
          >
            <Edit2 size={12} className="text-slate-500 group-hover:text-white" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Profile Page ──────────────────────────────────────────────────────────
export default function Profile() {
  const { admin: authAdmin, login, token, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  // Password form state
  const [pwForm, setPwForm]           = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwErrors, setPwErrors]       = useState({})
  const [pwLoading, setPwLoading]     = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwSuccess, setPwSuccess]     = useState(false)

  const strength = getPasswordStrength(pwForm.newPassword)

  // ── Load profile ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const data = await getMyProfile()
        if (data.success) setProfile(data.admin)
      } catch (err) {
        addToast('Could not load profile', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Save name or email ────────────────────────────────────────────────────────
  const handleSaveField = async (field, value) => {
    setSaving(true)
    try {
      const payload = field === 'name' ? { name: value } : { email: value }
      const data    = await updateMyProfile(payload)

      if (data.success) {
        setProfile(prev => ({ ...prev, [field]: value }))
        // Update auth context too so sidebar/topnav reflect changes immediately
        login(token, { ...authAdmin, [field]: value })
        addToast(`${field === 'name' ? 'Name' : 'Email'} updated successfully`, 'success')
        return null // no error
      } else {
        return data.error
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update'
      addToast(msg, 'error')
      return msg
    } finally {
      setSaving(false)
    }
  }

  // ── Change password ───────────────────────────────────────────────────────────
  const validatePassword = () => {
    const errors = {}
    if (!pwForm.currentPassword)  errors.currentPassword = 'Current password is required'
    if (!pwForm.newPassword)      errors.newPassword     = 'New password is required'
    else if (pwForm.newPassword.length < 8) errors.newPassword = 'Must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwForm.newPassword)) {
      errors.newPassword = 'Must have uppercase, lowercase, and a number'
    }
    if (!pwForm.confirmPassword)  errors.confirmPassword = 'Please confirm your new password'
    else if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    if (pwForm.currentPassword === pwForm.newPassword && pwForm.newPassword) {
      errors.newPassword = 'New password cannot be the same as current'
    }
    setPwErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!validatePassword()) return

    setPwLoading(true)
    try {
      const data = await changeMyPassword({
        currentPassword:  pwForm.currentPassword,
        newPassword:      pwForm.newPassword,
        confirmPassword:  pwForm.confirmPassword,
      })

      if (data.success) {
        setPwSuccess(true)
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        addToast('Password changed! Please log in again.', 'success')
        // Log out after 2 seconds so they log in with new password
        setTimeout(() => {
          logout()
          navigate('/login', { replace: true })
        }, 2000)
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to change password'
      if (msg.includes('Current password')) {
        setPwErrors({ currentPassword: msg })
      } else {
        addToast(msg, 'error')
      }
    } finally {
      setPwLoading(false)
    }
  }

  const clearPwError = (field) => {
    if (pwErrors[field]) setPwErrors(prev => ({ ...prev, [field]: '' }))
  }

  // ── Format date helper ────────────────────────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return 'Never'
    const d = new Date(iso)
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const roleColors = {
    SUPER_ADMIN: 'bg-gold-muted text-gold border border-gold/30',
    ADMIN:       'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    SUPPORT:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    FINANCE:     'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  }

  if (loading) {
    return (
      <Layout title="My Profile">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 w-32 bg-white/5 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-white/5 rounded-lg" />
                <div className="h-10 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="My Profile">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header card */}
        <div className="card p-6 mb-5 animate-fade-in">
          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-indigo flex items-center justify-center text-xl font-bold text-white shadow-indigo flex-shrink-0">
                {profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0F1629]" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold font-display text-white">{profile?.name}</h1>
              <p className="text-sm text-slate-400 mt-0.5">{profile?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={clsx('badge text-[10px] px-2.5 py-1', roleColors[profile?.role] || 'badge-gray')}>
                  {profile?.role}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right space-y-2 flex-shrink-0">
              <div>
                <p className="stat-label">Member Since</p>
                <p className="text-xs text-white font-medium">{formatDate(profile?.createdAt)}</p>
              </div>
              <div>
                <p className="stat-label">Last Login</p>
                <p className="text-xs text-white font-medium">{formatDate(profile?.lastLoginAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="card p-6 mb-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-indigo-400" />
            <h3 className="section-title">Personal Information</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">Click the edit icon to update your name or email</p>

          <EditableField
            label="Full Name"
            value={profile?.name || ''}
            icon={User}
            onSave={(val) => handleSaveField('name', val)}
            saving={saving}
          />
          <EditableField
            label="Email"
            value={profile?.email || ''}
            icon={Mail}
            type="email"
            onSave={(val) => handleSaveField('email', val)}
            saving={saving}
          />

          {/* Role — read only */}
          <div className="flex items-center justify-between py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3 w-40">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Shield size={14} className="text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</span>
            </div>
            <div className="flex-1 mx-4">
              <span className={clsx('badge text-[10px] px-2.5 py-1', roleColors[profile?.role] || 'badge-gray')}>
                {profile?.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
              <Lock size={11} className="text-slate-700" />
            </div>
          </div>

          {/* Permissions — read only */}
          <div className="flex items-start justify-between py-4">
            <div className="flex items-center gap-3 w-40 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Key size={14} className="text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Permissions</span>
            </div>
            <div className="flex-1 mx-4 flex flex-wrap gap-1.5">
              {(profile?.permissions || []).map(p => (
                <span key={p} className="badge badge-indigo text-[10px]">{p.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card p-6 mb-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-indigo-400" />
            <h3 className="section-title">Change Password</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Use a strong password with uppercase, lowercase, and numbers
          </p>

          {/* Success state */}
          {pwSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Password changed!</p>
              <p className="text-xs text-slate-500">Logging you out in a moment...</p>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4" noValidate>

              {/* Current Password */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={pwForm.currentPassword}
                    onChange={e => { setPwForm(p => ({ ...p, currentPassword: e.target.value })); clearPwError('currentPassword') }}
                    placeholder="Enter current password"
                    className={clsx(
                      'w-full bg-white/[0.06] border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none transition-all',
                      pwErrors.currentPassword ? 'border-red-500/50' : 'border-white/[0.08] focus:border-indigo-500/60'
                    )}
                  />
                  <button type="button" onClick={() => setShowCurrent(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors" tabIndex={-1}>
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwErrors.currentPassword && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> {pwErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => { setPwForm(p => ({ ...p, newPassword: e.target.value })); clearPwError('newPassword') }}
                    placeholder="Enter new password"
                    className={clsx(
                      'w-full bg-white/[0.06] border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none transition-all',
                      pwErrors.newPassword ? 'border-red-500/50' : 'border-white/[0.08] focus:border-indigo-500/60'
                    )}
                  />
                  <button type="button" onClick={() => setShowNew(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors" tabIndex={-1}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength bar */}
                {pwForm.newPassword && (
                  <div className="mt-2 animate-fade-in">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={clsx(
                            'flex-1 h-1 rounded-full transition-all duration-300',
                            i <= strength.score ? strength.color : 'bg-white/10'
                          )}
                        />
                      ))}
                    </div>
                    <p className={clsx('text-[10px] font-medium', {
                      'text-red-400':     strength.score <= 1,
                      'text-orange-400':  strength.score === 2,
                      'text-amber-400':   strength.score === 3,
                      'text-indigo-400':  strength.score === 4,
                      'text-emerald-400': strength.score === 5,
                    })}>
                      {strength.label}
                    </p>
                  </div>
                )}

                {pwErrors.newPassword && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> {pwErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={e => { setPwForm(p => ({ ...p, confirmPassword: e.target.value })); clearPwError('confirmPassword') }}
                    placeholder="Repeat new password"
                    className={clsx(
                      'w-full bg-white/[0.06] border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none transition-all',
                      pwErrors.confirmPassword
                        ? 'border-red-500/50'
                        : pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword
                        ? 'border-emerald-500/40'
                        : 'border-white/[0.08] focus:border-indigo-500/60'
                    )}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors" tabIndex={-1}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Match indicator */}
                {pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword && (
                  <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1 animate-fade-in">
                    <CheckCircle size={11} /> Passwords match
                  </p>
                )}
                {pwErrors.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> {pwErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password rules reminder */}
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Password Requirements</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'At least 8 characters',   pass: pwForm.newPassword.length >= 8 },
                    { label: 'Uppercase letter (A-Z)',   pass: /[A-Z]/.test(pwForm.newPassword) },
                    { label: 'Lowercase letter (a-z)',   pass: /[a-z]/.test(pwForm.newPassword) },
                    { label: 'Number (0-9)',              pass: /[0-9]/.test(pwForm.newPassword) },
                  ].map(({ label, pass }) => (
                    <div key={label} className={clsx('flex items-center gap-1.5 text-[11px]', pass ? 'text-emerald-400' : 'text-slate-600')}>
                      {pass ? <CheckCircle size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-600" />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
                  pwLoading
                    ? 'bg-indigo-600/40 text-white/50 cursor-not-allowed'
                    : 'bg-gradient-indigo text-white hover:shadow-indigo hover:scale-[1.01] active:scale-[0.99]'
                )}
              >
                {pwLoading
                  ? <><Loader2 size={15} className="animate-spin" /> Changing Password...</>
                  : <><Lock size={15} /> Change Password</>
                }
              </button>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border border-red-500/10 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-red-400" />
            <h3 className="section-title text-red-400">Session</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Sign out of this device</p>
          <button
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

      </div>
    </Layout>
  )
}