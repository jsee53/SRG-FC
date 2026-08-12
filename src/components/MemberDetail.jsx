import { useRef, useState } from 'react'
import { calcOvr } from '../utils/calcOvr'
import { calcAge } from '../utils/age'
import { TIER_STYLES } from '../utils/tierStyles'
import { ROLE_LABELS, ROLE_STYLES, ACE_LABEL, ACE_STYLE } from '../utils/roles'
import Avatar from './Avatar'
import RadarChart from './RadarChart'

function NavArrow({ side, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      className={`fixed top-1/2 z-[60] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl text-white shadow-lg backdrop-blur transition-all hover:bg-black/80 disabled:pointer-events-none disabled:opacity-0 ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
    >
      {children}
    </button>
  )
}

export default function MemberDetail({
  member,
  onClose,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  isAce,
  isAdmin,
  onEdit,
  attendanceCount,
  bestPlayerCount,
}) {
  const touchStart = useRef(null)
  const [direction, setDirection] = useState('next')

  if (!member) return null
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES.D
  const ovr = calcOvr(member)
  const meta = [member.positions.join('/'), `${calcAge(member.birthYear)}세`, `OVR ${ovr}`]
    .filter(Boolean)
    .join(' · ')
  const activityMeta = [`참석 ${attendanceCount ?? 0}회`, `POM ${bestPlayerCount ?? 0}회`].join(' · ')

  function goPrev() {
    setDirection('prev')
    onPrev?.()
  }

  function goNext() {
    setDirection('next')
    onNext?.()
  }

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
      if (dx < 0) goNext()
      else goPrev()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 [animation:overlay-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <NavArrow side="left" onClick={goPrev} disabled={!hasPrev}>
        ‹
      </NavArrow>
      <NavArrow side="right" onClick={goNext} disabled={!hasNext}>
        ›
      </NavArrow>

      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-800 p-5 pb-8 [animation:sheet-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-end gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full bg-emerald-400 px-3 py-1 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300"
            >
              수정
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>

        <div
          key={member.id}
          className={direction === 'next' ? '[animation:slide-next-in_0.55s_cubic-bezier(0.22,1,0.36,1)]' : '[animation:slide-prev-in_0.55s_cubic-bezier(0.22,1,0.36,1)]'}
        >
          <div className="mt-2 flex items-center gap-4">
            <Avatar name={member.name} size="lg" />
            <div>
              {(member.role || isAce) && (
                <div className="mb-1 flex gap-1">
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
                <h2 className="text-xl font-bold">{member.name}</h2>
                {member.number != null && <span className="text-slate-400">No.{member.number}</span>}
                <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${tier.badge}`}>{member.tier}</span>
              </div>
              <p className="mt-0.5 text-sm text-slate-400">{meta}</p>
              <p className="mt-0.5 text-sm text-slate-400">{activityMeta}</p>
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
            <RadarChart stats={member.stats} color={tier.accent} />
          </div>
        </div>
      </div>
    </div>
  )
}
