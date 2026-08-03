import { TIER_STYLES } from '../utils/tierStyles'
import Avatar from './Avatar'

export default function AttendeeChip({ member, selected, onToggle }) {
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES.D

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex items-center gap-2 rounded-xl p-2 text-left transition-all ${
        selected
          ? 'bg-emerald-400 ring-2 ring-emerald-300'
          : 'bg-slate-800/60 ring-1 ring-white/10 hover:-translate-y-0.5 hover:ring-white/30'
      }`}
    >
      <Avatar name={member.name} photo={member.photo} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className={`truncate text-sm font-medium ${selected ? 'text-emerald-950' : ''}`}>
            {member.name}
          </span>
          <span className={`rounded px-1 text-[10px] font-bold ${tier.badge}`}>{member.tier}</span>
        </div>
        <div className={`truncate text-xs ${selected ? 'text-emerald-900' : 'text-slate-400'}`}>
          {member.positions.join('/')}
        </div>
      </div>
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-950 text-[10px] font-bold text-emerald-50">
          ✓
        </span>
      )}
    </button>
  )
}
