/**
 * @file        AuthContext.jsx
 * @module      Auth Context
 * @project     Admin-FrontEnd
 * @layer       Context
 * @description Provides global authentication state (token, admin profile, isAuthenticated) and login/logout actions to the entire application via React Context.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react (createContext, useContext, useState, useEffect, useCallback)
 *   - react-router-dom (useNavigate)
 *
 * @sideEffects
 *   - Reads 'zyntell_admin_token' and 'zyntell_admin_user' from localStorage on initialisation
 *   - Writes/removes both keys in localStorage on login and logout
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
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/** Context object — null default forces consumers to be inside the provider */
const AuthContext = createContext(null)

/** localStorage key for the JWT token */
const TOKEN_KEY = 'zyntell_admin_token'

/** localStorage key for the serialised admin profile */
const USER_KEY  = 'zyntell_admin_user'

// ─────────────────────────────────────────
// CONTEXT / STATE
// ─────────────────────────────────────────

/**
 * @function    AuthProvider
 * @purpose     Initialises and provides authentication state and actions to the component tree
 * @param  {React.ReactNode} children - Child components that will consume the auth context
 * @returns {JSX.Element} Context provider wrapping the application tree
 */
export function AuthProvider({ children }) {
  // [AUTH]: Hydrate token from localStorage so session survives page refresh
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  // [AUTH]: Hydrate admin profile from localStorage with safe JSON parse fallback
  const [admin, setAdmin]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  // [STATE]: Global loading flag consumed by pages that await async auth operations
  const [loading, setLoading] = useState(false)

  /** True only when both a valid token and admin profile are present */
  const isAuthenticated = !!token && !!admin

  /**
   * @function    login
   * @purpose     Persists the JWT token and admin profile to localStorage and updates context state
   * @param  {string} tokenValue - JWT token returned by the login API
   * @param  {Object} adminData  - Admin profile object returned by the login API
   * @returns {void}
   */
  const login = useCallback((tokenValue, adminData) => {
    // [AUTH]: Write credentials to localStorage for session persistence
    localStorage.setItem(TOKEN_KEY, tokenValue)
    localStorage.setItem(USER_KEY, JSON.stringify(adminData))
    setToken(tokenValue)
    setAdmin(adminData)
  }, [])

  /**
   * @function    logout
   * @purpose     Clears the JWT token and admin profile from localStorage and resets context state
   * @returns {void}
   */
  const logout = useCallback(() => {
    // [AUTH]: Remove credentials from localStorage and reset in-memory state
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    useAuth
 * @purpose     Custom hook to consume the AuthContext — throws if called outside AuthProvider
 * @returns {{ token: string|null, admin: Object|null, isAuthenticated: boolean, login: Function, logout: Function, loading: boolean, setLoading: Function }} Auth context value
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  // [GUARD]: Enforce correct provider usage — context will be null if called outside tree
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
