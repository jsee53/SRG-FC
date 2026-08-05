import { useRef } from 'react'
import { calcOvr } from '../utils/calcOvr'
import { calcAge } from '../utils/age'
import { TIER_STYLES } from '../utils/tierStyles'
import { ROLE_LABELS, ROLE_STYLES, ACE_LABEL, ACE_STYLE } from '../utils/roles'
import { aceMemberId } from '../utils/ace'
import Avatar from './Avatar'
import RadarChart from './RadarChart'

export default function MemberDetail({ member, onClose, hasPrev, hasNext, onPrev, onNext }) {
  const touchStart = useRef(null)

  if (!member) return null
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES.D
  const ovr = calcOvr(member)
  const meta = [member.positions.join('/'), `${calcAge(member.birthYear)}세`, `OVR ${ovr}`]
    .filter(Boolean)
    .join(' · ')

  function handleTouchStart(e) {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  function handleTouchEnd(e) {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) onNext?.()
      else onPrev?.()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 [animation:overlay-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-800 p-5 pb-8 [animation:sheet-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-white/10"
          >
            ‹ 이전
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:hover:bg-white/10"
          >
            다음 ›
          </button>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <Avatar name={member.name} photo={member.photo} size="lg" />
          <div>
            {(member.role || member.id === aceMemberId) && (
              <div className="mb-1 flex gap-1">
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
              <h2 className="text-xl font-bold">{member.name}</h2>
              {member.number != null && <span className="text-slate-400">No.{member.number}</span>}
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${tier.badge}`}>{member.tier}</span>
            </div>
            <p className="mt-0.5 text-sm text-slate-400">{meta}</p>
          </div>
        </div>

        {member.intro && (
          <div className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-center">
            <p className="text-base font-semibold italic" style={{ color: tier.accent }}>
              “{member.intro}”
            </p>
          </div>
        )}

        <div className="mt-4">
          <RadarChart key={member.id} stats={member.stats} color={tier.accent} />
        </div>
      </div>
    </div>
  )
}
