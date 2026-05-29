/**
 * @file        Layout.jsx
 * @module      Admin Layout
 * @project     Admin-FrontEnd
 * @layer       Component
 * @description Root page layout component that composes the fixed Sidebar and sticky TopNav around a scrollable main content area.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./Sidebar (fixed left navigation)
 *   - ./TopNav  (sticky top header bar)
 *
 * @sideEffects
 *   - None
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
import Sidebar from './Sidebar'
import TopNav from './TopNav'

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    Layout
 * @purpose     Wraps every authenticated page with the shared sidebar, top navigation, and scrollable content area
 * @param  {string}          title    - Page title displayed in the TopNav header
 * @param  {React.ReactNode} children - Page-specific content rendered inside the main scrollable region
 * @returns {JSX.Element} Full-screen layout shell with sidebar, header, and content slot
 */
export default function Layout({ title, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-navy">
      {/* [CONTEXT]: Persistent sidebar navigation — fixed position, 220px wide */}
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden ml-[220px]">
        {/* [CONTEXT]: Sticky top navigation bar with page title and actions */}
        <TopNav title={title} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
