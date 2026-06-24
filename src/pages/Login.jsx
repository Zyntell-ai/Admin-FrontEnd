import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { loginApi } from '../api/auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

// Particle positions for logo convergence
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle  = (i / 18) * Math.PI * 2
  const radius = 28 + Math.random() * 22
  return {
    x:     Math.cos(angle) * radius,
    y:     Math.sin(angle) * radius,
    delay: Math.random() * 400,
    size:  Math.random() > 0.5 ? 3 : 2,
  }
})

function ParticleLogo() {
  const [active, setActive] = useState(false)
  useEffect(() => { setTimeout(() => setActive(true), 80) }, [])
  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      {/* Particles converging to centre */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          style={{
            position:  'absolute',
            width:     p.size,
            height:    p.size,
            borderRadius: '50%',
            background: i % 3 === 0 ? 'var(--aurora-light)' : i % 3 === 1 ? 'var(--violet-light)' : 'var(--emerald-light)',
            '--px': `${p.x}px`,
            '--py': `${p.y}px`,
            animation: active
              ? `particle-in 0.8s cubic-bezier(0.4,0,0.2,1) ${p.delay}ms both`
              : 'none',
          }}
        />
      ))}
      {/* Central icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10"
        style={{
          background: 'linear-gradient(145deg, #1a2235, #0d1117)',
          border: '1px solid rgba(59,130,246,0.25)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.6)',
          animation: 'logo-materialize 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <img src="/logo.png" alt="Zyntell" style={{ width: 28, height: 28, objectFit: 'contain' }} />
      </div>
      {/* Ambient glow ring */}
      <div
        style={{
          position:   'absolute',
          inset:      -4,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          animation:  'logo-materialize 1s 0.5s both',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export default function Login() {
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [panelPos,    setPanelPos]    = useState({ x: 0, y: 0 })
  const panelRef   = useRef(null)
  const { login }    = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()

  // Subtle magnetic hover on the panel
  const handleMouseMove = (e) => {
    if (!panelRef.current) return
    const rect   = panelRef.current.getBoundingClientRect()
    const cx     = rect.left + rect.width  / 2
    const cy     = rect.top  + rect.height / 2
    const dx     = (e.clientX - cx) / (rect.width  / 2)
    const dy     = (e.clientY - cy) / (rect.height / 2)
    setPanelPos({ x: dx * 3, y: dy * 2 })
  }
  const handleMouseLeave = () => setPanelPos({ x: 0, y: 0 })

  const validate = () => {
    const e = {}
    if (!email.trim())                     e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))  e.email    = 'Enter a valid email'
    if (!password)                          e.password = 'Password is required'
    else if (password.length < 6)           e.password = 'Minimum 6 characters'
    setFieldErrors(e)
    return !Object.keys(e).length
  }

  const clearErr = (f) => { if (fieldErrors[f]) setFieldErrors(p => ({ ...p, [f]: '' })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const data = await loginApi(email.trim().toLowerCase(), password)
      if (data.token && data.admin) {
        login(data.token, data.admin)
        addToast(`Welcome back, ${data.admin.name}!`, 'success')
        navigate('/', { replace: true })
      } else {
        setError(data.error || 'Login failed — unexpected response')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-6"
      style={{ background: 'var(--obsidian)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Aurora background waves ─────────────────────────── */}
      <div className="aurora-bg" aria-hidden>
        <div className="aurora-band aurora-band-1" />
        <div className="aurora-band aurora-band-2" />
        <div className="aurora-band aurora-band-3" />
      </div>

      {/* ── Subtle grid overlay ─────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      {/* ── Login panel ─────────────────────────────────────── */}
      <div
        ref={panelRef}
        style={{
          width: '100%',
          maxWidth: 440,
          transform: `translate(${panelPos.x * 0.4}px, ${panelPos.y * 0.4}px)`,
          transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
          animation: 'page-in 0.6s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Card */}
        <div
          style={{
            background: 'linear-gradient(160deg, rgba(20,30,48,0.98) 0%, rgba(13,17,24,0.99) 100%)',
            border:     '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            boxShadow: `
              0 40px 80px rgba(0,0,0,0.8),
              0 0 0 1px rgba(59,130,246,0.08),
              inset 0 1px 0 rgba(255,255,255,0.08),
              inset 0 -1px 0 rgba(0,0,0,0.4)
            `,
            padding: '42px 40px 36px',
          }}
        >
          {/* Logo + brand */}
          <div className="flex flex-col items-center mb-8">
            <ParticleLogo />
            <h1
              className="mt-5 text-xl font-bold tracking-wide"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--silver)', letterSpacing: '0.06em' }}
            >
              ZYNTELL
            </h1>
            <p className="mt-1 text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--silver-4)', letterSpacing: '0.14em' }}>
              AI Operations Platform
            </p>
            <p className="mt-1.5 text-[11px]" style={{ color: 'var(--silver-5)' }}>
              Unified control for modern healthcare automation
            </p>
          </div>

          {/* Divider */}
          <div className="divider mb-6" />

          {/* Error */}
          {error && (
            <div
              className="mb-5 px-3.5 py-2.5 rounded-lg flex items-start gap-2.5 text-xs"
              style={{
                background: 'var(--crimson-dim)',
                border:     '1px solid rgba(239,68,68,0.2)',
                color:      'var(--crimson-light)',
                animation:  'fade-up 150ms both',
              }}
            >
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--silver-4)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearErr('email') }}
                  placeholder="you@zyntell.in"
                  autoComplete="email"
                  autoFocus
                  className="input-field"
                  style={fieldErrors.email ? { borderColor: 'rgba(239,68,68,0.5)', boxShadow: '0 0 0 3px rgba(239,68,68,0.08)' } : {}}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-[11px]" style={{ color: 'var(--crimson-light)' }}>{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--silver-4)' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearErr('password') }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="input-field pr-10"
                    style={fieldErrors.password ? { borderColor: 'rgba(239,68,68,0.5)', boxShadow: '0 0 0 3px rgba(239,68,68,0.08)' } : {}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--silver-5)' }}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-[11px]" style={{ color: 'var(--crimson-light)' }}>{fieldErrors.password}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-6 py-3"
              style={loading ? { opacity: 0.6, pointerEvents: 'none' } : {}}
            >
              {loading
                ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Signing in...</>
                : 'Sign In to Platform'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px]" style={{ color: 'var(--silver-5)' }}>
            JWT secured · Authorized admins only · Zyntell © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
