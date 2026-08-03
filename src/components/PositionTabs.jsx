const POSITIONS = ['전체', 'GK', 'DF', 'MF', 'FW']

export default function PositionTabs({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3">
      {POSITIONS.map((pos) => (
        <button
          key={pos}
          type="button"
          onClick={() => onChange(pos)}
          className={`flex-none rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === pos
              ? 'bg-emerald-400 text-emerald-950'
              : 'bg-white/10 text-slate-300 hover:bg-white/20'
          }`}
        >
          {pos}
        </button>
      ))}
    </div>
  )
}
