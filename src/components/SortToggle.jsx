const OPTIONS = [
  { key: 'overall', label: '전체 순위' },
  { key: 'name', label: '이름순' },
]

export default function SortToggle({ active, onChange }) {
  return (
    <div className="flex flex-none gap-1 rounded-full bg-[var(--color-surface-soft)] p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            active === opt.key
              ? 'bg-accent-400 text-accent-950'
              : 'text-[var(--color-text-soft)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
