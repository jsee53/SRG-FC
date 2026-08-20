import { TIER_STYLES, DISTORTED_TIER_LABEL, DISTORTED_TIER_STYLE } from '../utils/tierStyles'
import { TIER_NAMES } from '../utils/tier'
import { powerScore } from '../utils/teamBuilder'
import Avatar from './Avatar'

export default function TeamResultCard({ index, team, equalMode }) {
  const sortedMembers = [...team.members].sort((a, b) => powerScore(b) - powerScore(a))

  function tierBadge(entry) {
    const hidden = equalMode && entry.tier !== 'S'
    const style = hidden ? DISTORTED_TIER_STYLE : TIER_STYLES[entry.tier]
    const label = hidden ? DISTORTED_TIER_LABEL : TIER_NAMES[entry.tier]
    return (
      <span className={`flex-none rounded px-1.5 py-0.5 text-xs font-bold ${style.badge}`}>{label}</span>
    )
  }

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{index + 1}팀</h3>
        <span className="text-xs text-[var(--color-text-muted)]">{team.members.length}명</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {sortedMembers.map((entry) =>
          entry.isMercenary ? (
            <div key={entry.id} className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[var(--color-border-strong)] text-xs text-[var(--color-text-soft)]">
                용병
              </div>
              <span className="flex-1 text-[var(--color-text-soft)]">{entry.label}</span>
              {tierBadge(entry)}
            </div>
          ) : (
            <div key={entry.id} className="flex items-center gap-2 text-sm">
              <Avatar name={entry.name} size="xs" />
              <span className="flex-1 truncate">{entry.name}</span>
              {tierBadge(entry)}
            </div>
          ),
        )}
      </div>
    </div>
  )
}
