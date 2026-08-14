import { useState } from 'react'
import { formatTimeRange } from '../utils/time'
import EventTeams from './EventTeams'

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`)
  const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' })
  return `${dateStr} (${weekday})`
}

export default function EventCard({
  event,
  session,
  myMemberId,
  isAdmin,
  canManageEvents,
  votes,
  onEdit,
  onDelete,
  onToggleConfirmed,
  onBuildTeams,
  onResetTeams,
  onCastVote,
  onRetractVote,
}) {
  const [expanded, setExpanded] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)

  const hasTeams = event.attendees.some((a) => a.teamIndex != null)
  const timeRange = formatTimeRange(event.startTime, event.endTime)
  const mercCount = event.attendees.filter((a) => a.memberId == null).length
  const rosterCount = event.attendees.length - mercCount

  async function handleToggleConfirmed() {
    setPendingConfirm(true)
    await onToggleConfirmed(event)
    setPendingConfirm(false)
  }

  async function handleResetTeams() {
    if (!window.confirm('팀 배정을 초기화할까요? 저장된 팀 구성과 POM 투표가 모두 사라집니다.')) return
    setResetting(true)
    setResetError('')
    const { error } = await onResetTeams(event.id)
    setResetting(false)
    if (error) {
      setResetError('초기화에 실패했어요. 다시 시도해주세요.')
    }
  }

  return (
    <div
      className="rounded-2xl bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-border)]"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[var(--color-text)]">{formatDate(event.eventDate)}</p>
            {event.confirmed && (
              <span className="rounded-full bg-accent-400/20 px-2 py-0.5 text-[10px] font-bold text-accent-300">
                경기 성사
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {timeRange && `${timeRange} · `}
            {event.location && `${event.location} · `}참석자 {rosterCount}명
            {mercCount > 0 && ` + 용병 ${mercCount}명`}
          </p>
        </div>

        <div className="flex flex-none items-center gap-2 text-xs">
          {canManageEvents && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(event)
                }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                수정
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(event.id)
                }}
                className="text-[var(--color-text-faint)] hover:text-red-400"
              >
                삭제
              </button>
            </>
          )}
          <span className="text-[var(--color-text-faint)]">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <>
          <p className="mt-3 text-sm text-[var(--color-text-soft)]">
            {event.attendees.length > 0 ? event.attendees.map((a) => a.name).join(', ') : '참석자 없음'}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isAdmin && (
              <button
                type="button"
                onClick={handleToggleConfirmed}
                disabled={pendingConfirm}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
                  event.confirmed
                    ? 'bg-[var(--color-surface-soft)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-soft-hover)]'
                    : 'bg-accent-400 text-accent-950 hover:bg-accent-300'
                }`}
              >
                {pendingConfirm ? '처리 중...' : event.confirmed ? '경기 성사 취소' : '경기 성사됨으로 등록'}
              </button>
            )}
            {canManageEvents && event.attendees.length > 0 && (
              <button
                type="button"
                onClick={() => onBuildTeams(event)}
                className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)]"
              >
                {hasTeams ? '팀 다시 짜기' : '팀 짜기'}
              </button>
            )}
            {canManageEvents && hasTeams && (
              <button
                type="button"
                onClick={handleResetTeams}
                disabled={resetting}
                className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--color-text-soft)] transition-colors hover:bg-red-400/20 hover:text-red-300 disabled:opacity-40"
              >
                {resetting ? '초기화 중...' : '팀 초기화'}
              </button>
            )}
          </div>

          {resetError && <p className="mt-1 text-xs text-red-400">{resetError}</p>}

          <div onClick={(e) => e.stopPropagation()}>
            <EventTeams
              event={event}
              myMemberId={myMemberId}
              voterId={session?.user?.id}
              votes={votes}
              onCastVote={onCastVote}
              onRetractVote={onRetractVote}
            />
          </div>
        </>
      )}
    </div>
  )
}
