/**
 * @file        App.jsx
 * @module      Admin App Root
 * @project     Admin-FrontEnd
 * @layer       Config
 * @description Root application component that defines all client-side routes and enforces authentication guards.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react-router-dom (Routes, Route, Navigate, useLocation)
 *   - ./context/AuthContext (useAuth)
 *   - ./components/ui/CommandPalette
 *   - ./pages/* (Login, Dashboard, Bookings, Analytics, Billing, Commissions,
 *                Businesses, BusinessDetail, Categories, Alerts, Settings, Profile)
 *
 * @sideEffects
 *   - Redirects unauthenticated users to /login
 *   - Redirects authenticated users away from /login
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import CommandPalette from './components/ui/CommandPalette'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Analytics from './pages/Analytics'
import Billing from './pages/Billing'
import Commissions from './pages/Commissions'
import Businesses from './pages/Businesses'
import BusinessDetail from './pages/BusinessDetail'
import Categories from './pages/Categories'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    ProtectedRoute
 * @purpose     Wraps private routes — redirects to /login if user is not authenticated
 * @param  {React.ReactNode} children - The protected page component to render
 * @returns {React.ReactNode} Children if authenticated, otherwise a Navigate redirect
 */
// [GUARD]: Block unauthenticated access and preserve the intended destination
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // [GUARD]: Block unauthenticated access and preserve the intended destination
  if (!isAuthenticated) {
    // Save where they were trying to go — redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * @function    PublicRoute
 * @purpose     Wraps public routes — redirects authenticated users away from /login
 * @param  {React.ReactNode} children - The public page component to render
 * @returns {React.ReactNode} Children if not authenticated, otherwise a Navigate redirect
 */
// [GUARD]: Bounce already-authenticated admins to the dashboard
function PublicRoute({ children }) {
  // [GUARD]: Bounce already-authenticated admins to the dashboard
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    App
 * @purpose     Root component that renders the command palette and all application routes
 * @returns {JSX.Element} The full route tree wrapped with authentication guards
 */
export default function App() {
  // [AUTH]: Determine whether to render the command palette
  const { isAuthenticated } = useAuth()

  return (
    <>
      {/* Command palette only shown when authenticated */}
      {isAuthenticated && <CommandPalette />}

      <Routes>
        {/* [ROUTE]: Public route — login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* [ROUTE]: Protected routes — require login */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/commissions" element={<ProtectedRoute><Commissions /></ProtectedRoute>} />
        <Route path="/businesses" element={<ProtectedRoute><Businesses /></ProtectedRoute>} />
        <Route path="/businesses/:id" element={<ProtectedRoute><BusinessDetail /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        {/* [ROUTE]: Catch all — redirect to dashboard or login */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </>
  )
}
