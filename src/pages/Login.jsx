import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { loginApi } from '../api/auth'
import { Eye, EyeOff, Zap, Shield, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function Login() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const validate = () => {
    const errors = {}
    if (!email.trim())                    errors.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email   = 'Enter a valid email'
    if (!password)                        errors.password = 'Password is required'
    else if (password.length < 6)         errors.password = 'Password must be at least 6 characters'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      // Backend returns { token, admin } (no `success` field)
      const data = await loginApi(email.trim().toLowerCase(), password)

      if (data.token && data.admin) {
        login(data.token, data.admin)
        addToast(`Welcome back, ${data.admin.name}!`, 'success')
        navigate('/', { replace: true })
      } else {
        setError(data.error || 'Login failed — unexpected response')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to connect to server. Make sure backend is running.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const clearFieldError = (field) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }} />

      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(79,70,229,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-indigo flex items-center justify-center shadow-indigo mb-4">
            <Zap size={26} className="text-white" fill="white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-wide">ZYNTELL</h1>
          <p className="text-slate-500 text-sm mt-1 tracking-widest uppercase text-xs">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="card border border-white/[0.08] rounded-2xl p-8 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white font-display">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the platform</p>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
              <Shield size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearFieldError('email') }}
                placeholder="you@zyntell.in"
                autoComplete="email"
                autoFocus
                className={clsx(
                  'w-full bg-white/[0.06] border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600',
                  'focus:outline-none transition-all duration-150',
                  fieldErrors.email
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/[0.08] focus:border-indigo-500/60 focus:bg-white/[0.08]'
                )}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearFieldError('password') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={clsx(
                    'w-full bg-white/[0.06] border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600',
                    'focus:outline-none transition-all duration-150',
                    fieldErrors.password
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/[0.08] focus:border-indigo-500/60 focus:bg-white/[0.08]'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-150',
                loading
                  ? 'bg-indigo-600/50 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-indigo text-white hover:shadow-indigo hover:scale-[1.01] active:scale-[0.99]'
              )}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Signing in...</>
                : 'Sign In to Dashboard'
              }
            </button>

          </form>

          {/* Divider */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 justify-center">
              <Shield size={12} className="text-slate-600" />
              <p className="text-[11px] text-slate-600 text-center">
                Secured with JWT Authentication · Access restricted to authorized admins only
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 mt-6">
          ZYNTELL Admin © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  )
}