export default function TeamResultSkeleton({ rows = 4 }) {
  return (
    <div className="animate-pulse rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
      <div className="flex items-center justify-between">
        <div className="h-4 w-10 rounded bg-[var(--color-surface-soft)]" />
        <div className="h-3 w-24 rounded bg-[var(--color-surface-soft)]" />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 flex-none rounded-full bg-[var(--color-surface-soft)]" />
            <div className="h-3 flex-1 rounded bg-[var(--color-surface-soft)]" />
            <div className="h-4 w-6 flex-none rounded bg-[var(--color-surface-soft)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
