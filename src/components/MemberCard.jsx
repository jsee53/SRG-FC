import { calcOvr } from '../utils/calcOvr'
import { calcAge } from '../utils/age'
import { TIER_STYLES, STAT_LABELS, DISTORTED_TIER_LABEL, DISTORTED_TIER_STYLE, UNIFORM_STYLE } from '../utils/tierStyles'
import { TIER_NAMES } from '../utils/tier'
import { ROLE_LABELS, ROLE_STYLES, ACE_LABEL, ACE_STYLE } from '../utils/roles'
import Avatar from './Avatar'

// brandMode: 이름순 정렬일 때만 켜짐 — 순위가 아니라 명단이라서, 등급색 대신 동호회
// 유니폼 색으로 카드를 통일함(등급 배지는 색만 바뀌고 글자는 S/A/B/C/D 그대로 유지)
export default function MemberCard({ member, rank, equalMode, brandMode, active, isAce, onClick }) {
  const hideStats = equalMode && member.tier !== 'S'
  const tier = hideStats ? DISTORTED_TIER_STYLE : brandMode ? UNIFORM_STYLE : TIER_STYLES[member.tier] ?? TIER_STYLES.D
  const tierLabel = hideStats ? DISTORTED_TIER_LABEL : brandMode ? member.tier : TIER_NAMES[member.tier]
  const ovr = calcOvr(member)
  const meta = [member.positions.join('/'), `${calcAge(member.birthYear)}세`, !hideStats && `OVR ${ovr}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-[var(--color-surface)] ${brandMode ? 'p-3' : 'p-4'} text-left ring-1 transition-all hover:-translate-y-0.5 hover:brightness-110 ${
        active
          ? '-translate-y-1 ring-2 ring-accent-400 shadow-[0_0_0_4px_rgba(52,211,153,0.25),0_8px_20px_-4px_rgba(52,211,153,0.5)]'
          : tier.ring
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tier.glow} to-transparent`} />
      {hideStats && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, var(--color-text) 0px, var(--color-text) 1px, transparent 1px, transparent 10px)',
          }}
        />
      )}

      <div className="relative flex items-start gap-3">
        {rank != null && (
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-surface-soft)] text-sm font-semibold">
            {rank}
          </div>
        )}
        <Avatar name={member.name} size="md" />
        <div className="min-w-0 flex-1">
          {!brandMode && (member.role || isAce) && (
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
            <span
              className={`ml-auto flex flex-none items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold ${tier.badge}`}
            >
              {hideStats && (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                  <path d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1Zm2 0h8V8a4 4 0 1 0-8 0v2Z" />
                </svg>
              )}
              {tierLabel}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">{meta}</div>
        </div>
      </div>

      {hideStats ? (
        <div className={`relative ${brandMode ? 'mt-2' : 'mt-3'} grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs`}>
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-14 flex-none whitespace-nowrap text-[var(--color-text-faint)]">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
                <div
                  className="h-full w-full rounded-full opacity-50"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(135deg, var(--color-text-faint) 0px, var(--color-text-faint) 3px, transparent 3px, transparent 6px)',
                  }}
                />
              </div>
              <span className="w-5 flex-none text-right text-[var(--color-text-faint)]">?</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={`relative ${brandMode ? 'mt-2' : 'mt-3'} grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs`}>
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
