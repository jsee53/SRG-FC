import { useEffect, useRef, useState } from 'react'
import { buildBalancedTeams } from '../utils/teamBuilder'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'
import TeamResultCard from './TeamResultCard'
import TeamResultSkeleton from './TeamResultSkeleton'

const GENERATE_DELAY_MS = 500

function toParticipants(event, members) {
  return event.attendees.map((a) => {
    const member = a.memberId != null ? members.find((m) => m.id === a.memberId) : null
    // id/attendeeId는 팀 저장에 쓰이는 event_attendees 행의 id로 덮어써야 해서, 관리자 도구의
    // 고정 배정과 매칭할 실제 로스터 멤버 id는 memberId로 따로 보존해둠 (teamBuilder.js의 pinKey 참고)
    if (member) return { ...member, id: a.id, attendeeId: a.id, memberId: member.id }
    return { id: a.id, attendeeId: a.id, tier: a.tier ?? 'C', isMercenary: true, label: a.name }
  })
}

// 팀 고정 배정(pins)은 관리자 도구에서만 설정 가능 — 일정 관리 권한자도 여기서 직접
// 고정시킬 수는 없고, 관리자가 미리 정해둔 전역 설정을 그대로 받아서 반영만 함
export default function EventTeamBuilderModal({ event, matchNumber, members, equalMode, teamPins, onClose, onSave }) {
  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const sheetRef = useRef(null)
  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = useSwipeToClose(sheetRef, requestClose)
  const participants = toParticipants(event, members)
  const [teamCount, setTeamCount] = useState(3)
  const [teams, setTeams] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const canGenerate = participants.length >= teamCount

  function handleGenerate() {
    setIsGenerating(true)
    setError('')
    timeoutRef.current = setTimeout(() => {
      setTeams(buildBalancedTeams(participants, teamCount, equalMode, teamPins))
      setIsGenerating(false)
    }, GENERATE_DELAY_MS)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const assignments = teams.flatMap((team, i) => team.members.map((m) => ({ attendeeId: m.attendeeId, teamIndex: i })))
    const { error: saveError } = await onSave(assignments)
    setSaving(false)
    if (saveError) {
      setError('저장에 실패했어요. 다시 시도해주세요.')
      return
    }
    requestClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-backdrop)] ${
        closing ? '[animation:overlay-out_0.22s_ease-in_forwards]' : '[animation:overlay-in_0.2s_ease-out]'
      }`}
      onClick={requestClose}
    >
      <div
        ref={sheetRef}
        className={`max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--color-sheet)] p-5 pb-8 ${
          closing
            ? '[animation:sheet-out_0.22s_cubic-bezier(0.32,0.72,0,1)_forwards]'
            : '[animation:sheet-in_0.32s_cubic-bezier(0.32,0.72,0,1)]'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{matchNumber != null ? `${matchNumber}경기 팀 짜기` : '팀 짜기'}</h2>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] hover:text-[var(--color-text)]"
          >
            닫기
          </button>
        </div>

        {equalMode && (
          <p className="mt-3 rounded-lg bg-[var(--color-surface-soft)] px-3 py-2 text-center text-xs text-[var(--color-text-muted)]">
            평등 모드 — S급 외 무작위 배정
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">팀 수</span>
          <div className="flex gap-1 rounded-full bg-[var(--color-surface-soft)] p-1">
            {[2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTeamCount(n)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  teamCount === n ? 'bg-accent-400 text-accent-950' : 'text-[var(--color-text-soft)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]'
                }`}
              >
                {n}팀
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">참석자 {participants.length}명</span>
        </div>

        {!teams && !isGenerating && (
          <button
            type="button"
            disabled={!canGenerate}
            onClick={handleGenerate}
            className="mt-4 w-full rounded-full bg-accent-400 py-2.5 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300 disabled:opacity-40"
          >
            팀 나누기
          </button>
        )}
        {!canGenerate && !teams && (
          <p className="mt-1 text-center text-xs text-[var(--color-text-muted)]">최소 {teamCount}명은 있어야 팀을 나눌 수 있어요.</p>
        )}

        {isGenerating && (
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: teamCount }).map((_, i) => (
              <TeamResultSkeleton key={i} rows={Math.ceil(participants.length / teamCount)} />
            ))}
          </div>
        )}

        {teams && !isGenerating && (
          <div className="mt-4 flex flex-col gap-3">
            {teams.map((team, i) => (
              <TeamResultCard key={i} index={i} team={team} equalMode={equalMode} />
            ))}

            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-full bg-[var(--color-surface-soft)] py-2 text-sm font-medium text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)]"
            >
              다시 나누기
            </button>

            {error && <p className="text-center text-xs text-red-400">{error}</p>}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-accent-400 py-2.5 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300 disabled:opacity-40"
            >
              {saving ? '저장 중...' : '이 팀으로 저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
