/**
 * @file        Skeleton.jsx
 * @module      Skeleton Loaders
 * @project     Admin-FrontEnd
 * @layer       Component
 * @description Collection of animated skeleton placeholder components used during data loading states for cards, tables, charts, and table rows.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - clsx
 *
 * @sideEffects
 *   - None
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import clsx from 'clsx'

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    Bone
 * @purpose     Base animated skeleton element — a pulsing rounded rectangle used by all skeleton composites
 * @param  {string} className - Tailwind classes controlling the element's size and shape
 * @returns {JSX.Element} A single pulsing placeholder div
 */
function Bone({ className }) {
  return <div className={clsx('bg-white/[0.06] rounded-lg animate-pulse', className)} />
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    SkeletonCard
 * @purpose     Renders a metric card skeleton with label, value, and badge placeholders
 * @returns {JSX.Element} Card-shaped loading placeholder
 */
export function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <Bone className="h-3 w-20" />
        <Bone className="w-8 h-8 rounded-lg" />
      </div>
      <Bone className="h-8 w-28 mb-2" />
      <Bone className="h-3 w-16" />
    </div>
  )
}

/**
 * @function    SkeletonTable
 * @purpose     Renders a multi-row table skeleton with configurable row and column counts
 * @param  {number} [rows=5] - Number of body rows to render
 * @param  {number} [cols=7] - Number of columns to render per row
 * @returns {JSX.Element} Table-shaped loading placeholder
 */
export function SkeletonTable({ rows = 5, cols = 7 }) {
  return (
    <div className="card overflow-hidden">
      {/* [UI]: Header row */}
      <div className="border-b border-white/[0.06] px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => <Bone key={i} className="h-2.5 flex-1" />)}
      </div>
      {/* [UI]: Body rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-white/[0.04] px-4 py-4 flex items-center gap-6">
          <Bone className="h-2.5 w-5 flex-shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <Bone key={j} className={clsx('h-2.5 flex-1', j === 0 && 'w-32')} />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * @function    SkeletonChart
 * @purpose     Renders a bar chart skeleton with a configurable height
 * @param  {number} [height=200] - Height of the chart area in pixels
 * @returns {JSX.Element} Bar chart-shaped loading placeholder
 */
export function SkeletonChart({ height = 200 }) {
  const bars = [55, 80, 65, 90, 72, 88, 60, 95, 78]
  return (
    <div className="card p-5">
      <Bone className="h-4 w-32 mb-1" />
      <Bone className="h-3 w-20 mb-5" />
      <div className="flex items-end gap-2" style={{ height }}>
        {bars.map((h, i) => (
          <Bone key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

/**
 * @function    SkeletonRow
 * @purpose     Renders a single table row skeleton for use in incrementally loading lists
 * @returns {JSX.Element} Single row loading placeholder
 */
export function SkeletonRow() {
  return (
    <div className="px-4 py-4 flex items-center gap-6 border-b border-white/[0.04]">
      <Bone className="h-2.5 w-5 flex-shrink-0" />
      <Bone className="h-2.5 w-32" />
      <Bone className="h-2.5 flex-1" />
      <Bone className="h-2.5 flex-1" />
      <Bone className="h-2.5 w-16" />
      <Bone className="h-5 w-16 rounded-full" />
    </div>
  )
}
