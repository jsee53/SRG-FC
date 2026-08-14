import { TIER_STYLES } from '../utils/tierStyles'
import { TIER_NAMES } from '../utils/tier'
import Avatar from './Avatar'

export default function AttendeeChip({ member, selected, onToggle }) {
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES.D

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex items-center gap-2 rounded-xl p-2 text-left transition-all ${
        selected
          ? 'bg-accent-500/20 ring-2 ring-accent-400/70'
          : 'bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] hover:-translate-y-0.5 hover:ring-[var(--color-border-strong)]'
      }`}
    >
      <Avatar name={member.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className={`truncate text-sm font-medium ${selected ? 'text-accent-300' : ''}`}>
            {member.name}
          </span>
          <span className={`flex-none rounded px-1 text-[10px] font-bold ${tier.badge}`}>{TIER_NAMES[member.tier][0]}</span>
        </div>
        <div className={`truncate text-xs ${selected ? 'text-accent-200/70' : 'text-[var(--color-text-muted)]'}`}>
          {member.positions.join('/')}
        </div>
      </div>
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-400/80 text-[10px] font-bold text-accent-950">
          ✓
        </span>
      )}
    </button>
  )
}
