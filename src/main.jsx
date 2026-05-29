/**
 * @file        main.jsx
 * @module      Admin App Root
 * @project     Admin-FrontEnd
 * @layer       Config
 * @description React application entry point that mounts the root component with all global providers.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react (React, StrictMode)
 *   - react-dom/client (ReactDOM)
 *   - react-router-dom (BrowserRouter)
 *   - ./App
 *   - ./context/ToastContext (ToastProvider)
 *   - ./context/AuthContext (AuthProvider)
 *   - ./index.css
 *
 * @sideEffects
 *   - Mounts the React application tree into the #root DOM element
 *   - Initialises AuthProvider (reads localStorage for persisted session)
 *   - Initialises ToastProvider (creates global toast notification state)
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

// [AUTH]: Provider order — AuthProvider wraps ToastProvider so toast callbacks
//         can reference auth state if needed in future
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
