import { useEffect, useRef, useState } from 'react'
import { calcOvr } from '../utils/calcOvr'
import { calcAge } from '../utils/age'
import { TIER_STYLES } from '../utils/tierStyles'
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
  onEdit,
  onEditStats,
  attendanceCount,
  bestPlayerCount,
}) {
  const touchStart = useRef(null)
  const sheetRef = useRef(null)
  const [closing, setClosing] = useState(false)

  useLockBodyScroll(Boolean(member))

  // 이 컴포넌트는 부모가 항상 마운트해두고 member로만 표시를 켜고 끄므로,
  // 새 멤버가 열릴 때마다 이전 닫기 애니메이션 상태를 초기화해야 함
  useEffect(() => {
    if (member) setClosing(false)
  }, [member])

  if (!member) return null
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES.D
  const ovr = calcOvr(member)
  const meta = [member.positions.join('/'), `${calcAge(member.birthYear)}세`, `OVR ${ovr}`]
    .filter(Boolean)
    .join(' · ')
  const activityMeta = [`참석 ${attendanceCount ?? 0}회`, `POM ${bestPlayerCount ?? 0}회`].join(' · ')

  function goPrev() {
    onPrev?.()
  }

  function goNext() {
    onNext?.()
  }

  function requestClose() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, 220)
  }

  // 드래그 중 실시간으로 시트를 손가락에 맞춰 움직이는 방식은(inline transform)
  // 제스처가 touchcancel로 중간에 끊기거나(카카오톡 인앱 브라우저 등에서 흔함) 방향
  // 오판이 겹치면 정리가 안 된 채로 남아 시트가 치우쳐 보이는 문제가 반복됐음.
  // 그래서 손을 뗄 때 한 번에만 판정하는 단순한 방식으로 되돌림 — inline style을
  // 아예 건드리지 않으니 중간에 끊겨도 남는 게 없음
  function handleTouchStart(e) {
    // 뒤에 있는 페이지의 좌우 스와이프 탭 전환으로 이벤트가 새어나가지 않게 막음
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

    // 맨 위까지 스크롤된 상태에서 아래로 당기면 닫기 (당겨서 새로고침과 비슷한 제스처)
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

        {/* 이전엔 멤버 전환 시 좌우 슬라이드 애니메이션(slide-next-in/prev-in)을 줬는데,
            그 안의 RadarChart(SVG scale 애니메이션)와 겹쳐서 저사양 모바일/인앱 브라우저에서
            버벅이며 어긋나 보이는 문제가 반복돼서, 신뢰성을 위해 애니메이션 없이 즉시 전환하도록 함 */}
        <div key={member.id}>
          <div className="mt-2 flex items-center gap-4">
            <Avatar name={member.name} size="lg" />
            <div>
              {/* 칭호가 없는 선수도 상세보기 높이가 같도록, 뱃지가 없어도 이 줄의 높이는 항상 고정해둠 */}
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
                <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${tier.badge}`}>{TIER_NAMES[member.tier]}</span>
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
            <RadarChart stats={member.stats} color={tier.accent} />
          </div>
        </div>
      </div>
    </div>
  )
}
