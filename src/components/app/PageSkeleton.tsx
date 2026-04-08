export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-8 animate-pulse">
      <div className="h-8 w-48 rounded" style={{ background: 'var(--color-surface-2)' }} />
      <div className="flex flex-col gap-3">
        {[80, 60, 90, 50, 70].map((w, i) => (
          <div key={i} className="h-4 rounded" style={{ width: `${w}%`, background: 'var(--color-surface-2)' }} />
        ))}
      </div>
    </div>
  )
}
