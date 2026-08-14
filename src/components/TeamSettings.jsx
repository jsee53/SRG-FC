function SegmentGroup({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <div className="flex gap-1 rounded-full bg-[var(--color-surface-soft)] p-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value === opt ? 'bg-accent-400 text-accent-950' : 'text-[var(--color-text-soft)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function TeamSettings({ teamCount, onTeamCountChange, teamSize, onTeamSizeChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <SegmentGroup label="팀 수" options={[2, 3]} value={teamCount} onChange={onTeamCountChange} />
      <SegmentGroup label="인원" options={[5, 6]} value={teamSize} onChange={onTeamSizeChange} />
    </div>
  )
}
