/**
 * @file        ContextMenu.jsx
 * @module      Context Menu
 * @project     Admin-FrontEnd
 * @layer       Component
 * @description Floating right-click context menu component that renders a viewport-clamped action list and closes on outside click or Escape key.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react (useEffect, useRef)
 *   - clsx
 *
 * @sideEffects
 *   - Attaches and removes 'mousedown' and 'keydown' document event listeners
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import { useEffect, useRef } from 'react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    ContextMenu
 * @purpose     Renders a positioned context menu at (x, y) clamped to the viewport, dismisses on outside click or Escape
 * @param  {number}   x       - Desired horizontal position in pixels (from left)
 * @param  {number}   y       - Desired vertical position in pixels (from top)
 * @param  {Array}    items   - Array of menu item objects with { label, action, icon?, shortcut?, danger?, disabled?, divider? }
 * @param  {Function} onClose - Callback invoked when the menu should be dismissed
 * @returns {JSX.Element} Fixed-position context menu element
 */
export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    // [GUARD]: Dismiss when user clicks outside the menu
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    // [GUARD]: Dismiss on Escape key press
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // ─────────────────────────────────────────
  // CORE LOGIC / HANDLER FUNCTIONS
  // ─────────────────────────────────────────

  // [UI]: Clamp menu position to viewport boundaries
  const menuW = 200
  const menuH = items.length * 36 + 16
  // [GUARD]: Prevent menu from overflowing the right or bottom edge of the viewport
  const clampedX = Math.min(x, window.innerWidth - menuW - 8)
  const clampedY = Math.min(y, window.innerHeight - menuH - 8)

  return (
    <div
      ref={ref}
      className="fixed z-[200] bg-[#0F1629] border border-white/[0.1] rounded-xl shadow-2xl py-1.5 animate-fade-in"
      style={{ left: clampedX, top: clampedY, width: menuW }}
    >
      {items.map((item, i) => {
        // [UI]: Render a divider line for separator entries
        if (item.divider) return <div key={i} className="my-1 border-t border-white/[0.06]" />
        return (
          <button
            key={i}
            onClick={() => { item.action(); onClose() }}
            disabled={item.disabled}
            className={clsx(
              'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left',
              item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
              item.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {item.icon && <item.icon size={12} className="flex-shrink-0" />}
            <span>{item.label}</span>
            {item.shortcut && <span className="ml-auto text-slate-600 font-mono text-[10px]">{item.shortcut}</span>}
          </button>
        )
      })}
    </div>
  )
}
