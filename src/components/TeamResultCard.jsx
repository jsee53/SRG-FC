import { TIER_STYLES } from '../utils/tierStyles'
import { powerScore } from '../utils/teamBuilder'
import Avatar from './Avatar'

export default function TeamResultCard({ index, team }) {
  const sortedMembers = [...team.members].sort((a, b) => powerScore(b) - powerScore(a))

  return (
    <div className="rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{index + 1}팀</h3>
        <span className="text-xs text-slate-400">
          {team.members.length}명 · 평균 능력치 {team.avgScore}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {sortedMembers.map((entry) =>
          entry.isMercenary ? (
            <div key={entry.id} className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-white/30 text-xs text-slate-300">
                용병
              </div>
              <span className="flex-1 text-slate-300">{entry.label}</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${TIER_STYLES[entry.tier].badge}`}>
                {entry.tier}
              </span>
            </div>
          ) : (
            <div key={entry.id} className="flex items-center gap-2 text-sm">
              <Avatar name={entry.name} size="xs" />
              <span className="flex-1 truncate">{entry.name}</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${TIER_STYLES[entry.tier].badge}`}>
                {entry.tier}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
