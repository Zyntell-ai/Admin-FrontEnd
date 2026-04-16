import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

const TOKEN_KEY = 'zyntell_admin_token'
const USER_KEY  = 'zyntell_admin_user'

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [admin, setAdmin]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!token && !!admin

  const login = useCallback((tokenValue, adminData) => {
    localStorage.setItem(TOKEN_KEY, tokenValue)
    localStorage.setItem(USER_KEY, JSON.stringify(adminData))
    setToken(tokenValue)
    setAdmin(adminData)
  }, [])

  const logout = useCallback(() => {
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

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}