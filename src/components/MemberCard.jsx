import { calcOvr } from '../utils/calcOvr'
import { calcAge } from '../utils/age'
import { TIER_STYLES, STAT_LABELS } from '../utils/tierStyles'
import { ROLE_LABELS, ROLE_STYLES, ACE_LABEL, ACE_STYLE } from '../utils/roles'
import { aceMemberId } from '../utils/ace'
import Avatar from './Avatar'

export default function MemberCard({ member, rank, active, onClick }) {
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES.D
  const ovr = calcOvr(member)
  const meta = [member.positions.join('/'), `${calcAge(member.birthYear)}세`, `OVR ${ovr}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-slate-800/60 p-4 text-left ring-1 transition-all hover:-translate-y-0.5 hover:brightness-110 ${
        active
          ? '-translate-y-1 ring-2 ring-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.25),0_8px_20px_-4px_rgba(52,211,153,0.5)]'
          : tier.ring
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tier.glow} to-transparent`} />

      <div className="relative flex items-start gap-3">
        {rank != null && (
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            {rank}
          </div>
        )}
        <Avatar name={member.name} photo={member.photo} size="md" />
        <div className="min-w-0 flex-1">
          {(member.role || member.id === aceMemberId) && (
            <div className="mb-0.5 flex gap-1">
              {member.id === aceMemberId && (
                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${ACE_STYLE}`}>
                  {ACE_LABEL}
                </span>
              )}
              {member.role && (
                <span
                  className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${ROLE_STYLES[member.role]}`}
                >
                  {ROLE_LABELS[member.role]}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{member.name}</span>
            {member.number != null && <span className="text-sm text-slate-400">No.{member.number}</span>}
            <span className={`ml-auto rounded-md px-1.5 py-0.5 text-xs font-bold ${tier.badge}`}>
              {member.tier}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-slate-400">{meta}</div>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {Object.entries(STAT_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-14 flex-none whitespace-nowrap text-slate-400">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white/70"
                style={{ width: `${member.stats[key]}%` }}
              />
            </div>
            <span className="w-5 flex-none text-right text-slate-300">{member.stats[key]}</span>
          </div>
        ))}
      </div>
    </button>
  )
}
