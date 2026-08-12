const OPTIONS = [
  { key: 'overall', label: '전체 순위' },
  { key: 'name', label: '이름순' },
]

export default function SortToggle({ active, onChange }) {
  return (
    <div className="flex flex-none gap-1 rounded-full bg-white/10 p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            active === opt.key
              ? 'bg-emerald-400 text-emerald-950'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
