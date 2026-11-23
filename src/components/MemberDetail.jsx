import { useEffect, useRef, useState } from 'react'
import { calcOvr } from '../utils/calcOvr'
import { calcAge } from '../utils/age'
import { TIER_STYLES, DISTORTED_TIER_LABEL, DISTORTED_TIER_STYLE } from '../utils/tierStyles'
import { TIER_NAMES } from '../utils/tier'
import { ROLE_LABELS, ROLE_STYLES, ACE_LABEL, ACE_STYLE } from '../utils/roles'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
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
      className={`fixed top-1/2 z-[60] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-backdrop)] text-2xl text-[var(--color-text)] shadow-lg backdrop-blur transition-all hover:bg-[var(--color-backdrop-strong)] disabled:pointer-events-none disabled:opacity-0 ${
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
  canManageStats,
  equalMode,
  onEdit,
  onEditStats,
  attendanceCount,
  bestPlayerCount,
}) {
  const touchStart = useRef(null)
  const sheetRef = useRef(null)
  const [direction, setDirection] = useState('next')
  const [closing, setClosing] = useState(false)
  // 렌더 중 ref를 mutate하면 StrictMode 이중 렌더에서 값이 꼬여서 state로 추적
  const [prevMemberId, setPrevMemberId] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)

  useLockBodyScroll(Boolean(member))

  // 항상 마운트된 상태라 새 멤버가 열릴 때 닫기 애니메이션 상태 초기화
  useEffect(() => {
    if (member) setClosing(false)
  }, [member])

  if (!member) {
    // 다음에 열릴 때 처음 여는 것으로 인식하도록 초기화
    if (prevMemberId !== null) setPrevMemberId(null)
    return null
  }
  // 처음 열릴 땐 시트가 올라오는 중이라 좌우 슬라이드 없음, 이전/다음 이동 시에만 적용
  if (member.id !== prevMemberId) {
    setIsNavigating(prevMemberId !== null)
    setPrevMemberId(member.id)
  }
  const hideStats = equalMode && member.tier !== 'S'
  const tier = hideStats ? DISTORTED_TIER_STYLE : TIER_STYLES[member.tier] ?? TIER_STYLES.D
  const tierLabel = hideStats ? DISTORTED_TIER_LABEL : TIER_NAMES[member.tier]
  const ovr = calcOvr(member)
  const meta = [member.positions.join('/'), `${calcAge(member.birthYear)}세`, !hideStats && `OVR ${ovr}`]
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

  function requestClose() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, 220)
  }

  // 드래그 중 inline transform을 쓰면 touchcancel(카카오톡 인앱 등)로 끊길 때 시트가 치우친 채 남음
  // 그래서 손을 뗄 때 한 번만 판정함
  function handleTouchStart(e) {
    // 뒤 페이지의 탭 스와이프로 이벤트 전파 방지
    e.stopPropagation()
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, scrollTop: sheetRef.current?.scrollTop ?? 0 }
  }

  function handleTouchCancel(e) {
    e.stopPropagation()
    touchStart.current = null
  }

  function handleTouchEnd(e) {
    e.stopPropagation()
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    const startScrollTop = touchStart.current.scrollTop
    touchStart.current = null

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext()
      else goPrev()
      return
    }

    // 맨 위에서 아래로 당기면 닫기
    if (dy > 80 && dy > Math.abs(dx) * 1.5 && startScrollTop <= 0) {
      requestClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-backdrop)] ${
        closing ? '[animation:overlay-out_0.22s_ease-in_forwards]' : '[animation:overlay-in_0.2s_ease-out]'
      }`}
      onClick={requestClose}
    >
      <NavArrow side="left" onClick={goPrev} disabled={!hasPrev}>
        ‹
      </NavArrow>
      <NavArrow side="right" onClick={goNext} disabled={!hasNext}>
        ›
      </NavArrow>

      <div
        ref={sheetRef}
        className={`max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--color-sheet)] p-5 pb-8 ${
          closing
            ? '[animation:sheet-out_0.22s_cubic-bezier(0.32,0.72,0,1)_forwards]'
            : '[animation:sheet-in_0.32s_cubic-bezier(0.32,0.72,0,1)]'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="flex justify-end gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full bg-accent-400 px-3 py-1 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300"
            >
              수정
            </button>
          )}
          {canManageStats && !isAdmin && (
            <button
              type="button"
              onClick={onEditStats}
              className="rounded-full bg-accent-400 px-3 py-1 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300"
            >
              능력치 수정
            </button>
          )}
          <button
            type="button"
            onClick={requestClose}
            className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] hover:text-[var(--color-text)]"
          >
            닫기
          </button>
        </div>

        <div
          key={member.id}
          className={
            !isNavigating
              ? ''
              : direction === 'next'
                ? '[animation:slide-next-in_0.5s_cubic-bezier(0.22,1,0.36,1)]'
                : '[animation:slide-prev-in_0.5s_cubic-bezier(0.22,1,0.36,1)]'
          }
        >
          <div className="mt-2 flex items-center gap-4">
            <Avatar name={member.name} size="lg" />
            <div>
              {/* 칭호 없는 선수도 상세보기 높이가 같도록 줄 높이 고정 */}
              <div className="mb-1 flex h-5 gap-1">
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
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{member.name}</h2>
                {member.number != null && <span className="text-[var(--color-text-muted)]">No.{member.number}</span>}
                <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold ${tier.badge}`}>
                  {hideStats && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                      <path d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1Zm2 0h8V8a4 4 0 1 0-8 0v2Z" />
                    </svg>
                  )}
                  {tierLabel}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{meta}</p>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{activityMeta}</p>
            </div>
          </div>

          {member.intro && (
            <div className="mt-4 rounded-xl bg-[var(--color-surface-faint)] px-4 py-3 text-center">
              <p className="text-base font-semibold italic" style={{ color: tier.accent }}>
                “{member.intro}”
              </p>
            </div>
          )}

          <div className="mt-4">
            <RadarChart stats={member.stats} color={tier.accent} locked={hideStats} />
          </div>
        </div>
      </div>
    </div>
  )
}
