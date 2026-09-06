import { useState } from 'react'
import { formatTimeRange } from '../utils/time'
import EventTeams from './EventTeams'

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`)
  const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' })
  return `${dateStr} (${weekday})`
}

// 경기가 하나도 없는 이벤트는 "1경기" 탭을 가상으로 보여주고, 실제로 팀을 짜는 순간에야
// event_matches 행을 만듦(관리자가 일정을 등록만 하고 팀은 안 짤 수도 있어서 미리 만들어두지 않음)
const VIRTUAL_FIRST_MATCH = { id: null, matchNumber: 1, assignments: [] }

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
  onAddMatch,
  onBuildTeams,
  onResetTeams,
  onDeleteMatch,
  onCastVote,
  onRetractVote,
}) {
  const [expanded, setExpanded] = useState(false)
  const [pendingConfirm, setPendingConfirm] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)
  const [deletingMatch, setDeletingMatch] = useState(false)
  const [creatingMatch, setCreatingMatch] = useState(false)
  const [addingMatch, setAddingMatch] = useState(false)
  const [activeMatchIndex, setActiveMatchIndex] = useState(0)

  const realMatches = event.matches ?? []
  const displayMatches = realMatches.length > 0 ? realMatches : [VIRTUAL_FIRST_MATCH]
  const safeActiveIndex = Math.min(activeMatchIndex, displayMatches.length - 1)
  const activeMatch = displayMatches[safeActiveIndex]
  const hasTeams = activeMatch.assignments.length > 0
  const showTabs = canManageEvents || displayMatches.length > 1
  const timeRange = formatTimeRange(event.startTime, event.endTime)
  const mercCount = event.attendees.filter((a) => a.memberId == null).length
  const rosterCount = event.attendees.length - mercCount

  async function handleToggleConfirmed() {
    setPendingConfirm(true)
    await onToggleConfirmed(event)
    setPendingConfirm(false)
  }

  async function handleOpenBuilder() {
    if (activeMatch.id != null) {
      onBuildTeams(event, activeMatch)
      return
    }
    setCreatingMatch(true)
    const { matchId, error } = await onAddMatch(event.id)
    setCreatingMatch(false)
    if (error || matchId == null) return
    onBuildTeams(event, { id: matchId, matchNumber: activeMatch.matchNumber, assignments: [] })
  }

  async function handleAddMatch() {
    setAddingMatch(true)
    const newIndex = displayMatches.length
    const { error } = await onAddMatch(event.id)
    setAddingMatch(false)
    if (!error) setActiveMatchIndex(newIndex)
  }

  async function handleResetTeams() {
    if (!window.confirm('팀 배정을 초기화할까요? 저장된 팀 구성과 POM 투표가 모두 사라집니다.')) return
    setResetting(true)
    setResetError('')
    const { error } = await onResetTeams(activeMatch.id)
    setResetting(false)
    if (error) {
      setResetError('초기화에 실패했어요. 다시 시도해주세요.')
    }
  }

  async function handleDeleteMatch() {
    if (!window.confirm(`${activeMatch.matchNumber}경기를 삭제할까요? 저장된 팀 구성과 POM 투표가 모두 사라집니다.`)) return
    setDeletingMatch(true)
    setResetError('')
    const { error } = await onDeleteMatch(activeMatch.id)
    setDeletingMatch(false)
    if (error) {
      setResetError('삭제에 실패했어요. 다시 시도해주세요.')
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

          <div onClick={(e) => e.stopPropagation()}>
            {isAdmin && (
              <div className="mt-2">
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
              </div>
            )}

            {showTabs && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {displayMatches.map((match, i) => (
                  <button
                    key={match.id ?? 'virtual-1'}
                    type="button"
                    onClick={() => setActiveMatchIndex(i)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      i === safeActiveIndex
                        ? 'bg-accent-400 text-accent-950'
                        : 'bg-[var(--color-surface-soft)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-soft-hover)]'
                    }`}
                  >
                    {match.matchNumber}경기
                  </button>
                ))}
                {!event.confirmed && canManageEvents && realMatches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddMatch}
                    disabled={addingMatch}
                    className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] disabled:opacity-40"
                  >
                    {addingMatch ? '추가 중...' : '+ 경기추가'}
                  </button>
                )}
              </div>
            )}

            {!event.confirmed && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {canManageEvents && event.attendees.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenBuilder}
                    disabled={creatingMatch}
                    className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] disabled:opacity-40"
                  >
                    {creatingMatch ? '준비 중...' : hasTeams ? '팀 다시 짜기' : '팀 짜기'}
                  </button>
                )}
                {canManageEvents && hasTeams && activeMatch.id != null && (
                  <button
                    type="button"
                    onClick={handleResetTeams}
                    disabled={resetting}
                    className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--color-text-soft)] transition-colors hover:bg-red-400/20 hover:text-red-300 disabled:opacity-40"
                  >
                    {resetting ? '초기화 중...' : '팀 초기화'}
                  </button>
                )}
                {canManageEvents && activeMatch.id != null && displayMatches.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteMatch}
                    disabled={deletingMatch}
                    className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--color-text-soft)] transition-colors hover:bg-red-400/20 hover:text-red-300 disabled:opacity-40"
                  >
                    {deletingMatch ? '삭제 중...' : '경기 삭제'}
                  </button>
                )}
              </div>
            )}

            {resetError && <p className="mt-1 text-xs text-red-400">{resetError}</p>}

            <EventTeams
              event={event}
              match={activeMatch}
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
