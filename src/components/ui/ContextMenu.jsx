import { useEffect, useRef } from 'react'
import clsx from 'clsx'

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // Clamp to viewport
  const menuW = 200
  const menuH = items.length * 36 + 16
  const clampedX = Math.min(x, window.innerWidth - menuW - 8)
  const clampedY = Math.min(y, window.innerHeight - menuH - 8)

  return (
    <div
      ref={ref}
      className="fixed z-[200] bg-[#0F1629] border border-white/[0.1] rounded-xl shadow-2xl py-1.5 animate-fade-in"
      style={{ left: clampedX, top: clampedY, width: menuW }}
    >
      {items.map((item, i) => {
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