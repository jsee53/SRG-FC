import { calcOvr } from '../utils/calcOvr'
import { calcAge } from '../utils/age'
import { TIER_STYLES, STAT_LABELS, DISTORTED_TIER_LABEL, DISTORTED_TIER_STYLE } from '../utils/tierStyles'
import { TIER_NAMES } from '../utils/tier'
import { ROLE_LABELS, ROLE_STYLES, ACE_LABEL, ACE_STYLE } from '../utils/roles'
import Avatar from './Avatar'

export default function MemberCard({ member, rank, equalMode, active, isAce, onClick }) {
  const hideStats = equalMode && member.tier !== 'S'
  const tier = hideStats ? DISTORTED_TIER_STYLE : TIER_STYLES[member.tier] ?? TIER_STYLES.D
  const tierLabel = hideStats ? DISTORTED_TIER_LABEL : TIER_NAMES[member.tier]
  const ovr = calcOvr(member)
  const meta = [member.positions.join('/'), `${calcAge(member.birthYear)}세`, !hideStats && `OVR ${ovr}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-[var(--color-surface)] p-4 text-left ring-1 transition-all hover:-translate-y-0.5 hover:brightness-110 ${
        active
          ? '-translate-y-1 ring-2 ring-accent-400 shadow-[0_0_0_4px_rgba(52,211,153,0.25),0_8px_20px_-4px_rgba(52,211,153,0.5)]'
          : tier.ring
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tier.glow} to-transparent`} />

      <div className="relative flex items-start gap-3">
        {rank != null && (
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-surface-soft)] text-sm font-semibold">
            {rank}
          </div>
        )}
        <Avatar name={member.name} size="md" />
        <div className="min-w-0 flex-1">
          {(member.role || isAce) && (
            <div className="mb-0.5 flex gap-1">
              {isAce && (
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
            {member.number != null && <span className="text-sm text-[var(--color-text-muted)]">No.{member.number}</span>}
            <span className={`ml-auto flex-none rounded-md px-1.5 py-0.5 text-xs font-bold ${tier.badge}`}>
              {tierLabel}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">{meta}</div>
        </div>
      </div>

      {hideStats ? (
        <p className="relative mt-3 text-center text-xs font-semibold tracking-wider text-[var(--color-text-muted)]">Undefined</p>
      ) : (
        <div className="relative mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-14 flex-none whitespace-nowrap text-[var(--color-text-muted)]">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--color-surface-strong)]"
                  style={{ width: `${member.stats[key]}%` }}
                />
              </div>
              <span className="w-5 flex-none text-right text-[var(--color-text-soft)]">{member.stats[key]}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}
