/**
 * @file        Modal.jsx
 * @module      Modal Dialog
 * @project     Admin-FrontEnd
 * @layer       Component
 * @description Accessible modal dialog component with backdrop blur, size variants, Escape key dismissal, and an animated content panel.
 *
 * @updated     2026-05-28
 * @version     1.0.0
 *
 * @dependencies
 *   - react (useEffect)
 *   - lucide-react (X)
 *   - clsx
 *
 * @sideEffects
 *   - Attaches and removes a 'keydown' event listener when the modal is open
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
import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    Modal
 * @purpose     Renders a centred modal dialog with a blurred backdrop, title bar, close button, and Escape key support
 * @param  {boolean}         isOpen   - Controls whether the modal is rendered
 * @param  {Function}        onClose  - Callback invoked to close the modal
 * @param  {string}          title    - Title displayed in the modal header
 * @param  {React.ReactNode} children - Content rendered inside the modal body
 * @param  {string}          [size]   - Size variant: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @returns {JSX.Element|null} Modal overlay when open, null when closed
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    // [GUARD]: Allow keyboard dismissal only while the modal is open
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // [GUARD]: Render nothing when closed to avoid dead DOM nodes
  if (!isOpen) return null

  /** Tailwind max-width class mapped from the size prop */
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop — clicking closes the modal */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative w-full card border border-white/10 shadow-2xl animate-fade-in', sizes[size])}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-base font-semibold text-white font-display">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
