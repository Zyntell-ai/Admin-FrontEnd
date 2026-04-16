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

// Protects all dashboard routes — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Save where they were trying to go — redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Prevents logged-in users from seeing the login page
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      {/* Command palette only shown when authenticated */}
      {isAuthenticated && <CommandPalette />}

      <Routes>
        {/* Public route — login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected routes — require login */}
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
        {/* Catch all — redirect to dashboard or login */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </>
  )
}