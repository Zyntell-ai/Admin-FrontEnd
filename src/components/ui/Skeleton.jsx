import clsx from 'clsx'

function Bone({ className }) {
  return <div className={clsx('bg-white/[0.06] rounded-lg animate-pulse', className)} />
}

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

export function SkeletonTable({ rows = 5, cols = 7 }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-white/[0.06] px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => <Bone key={i} className="h-2.5 flex-1" />)}
      </div>
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