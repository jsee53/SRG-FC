import { useEffect, useRef, useState } from 'react'
import { buildBalancedTeams } from '../utils/teamBuilder'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'
import AttendeeChip from './AttendeeChip'
import MercenaryForm from './MercenaryForm'
import TeamResultCard from './TeamResultCard'
import TeamResultSkeleton from './TeamResultSkeleton'

const GENERATE_DELAY_MS = 500

function toggledSet(prev, key) {
  const next = new Set(prev)
  next.has(key) ? next.delete(key) : next.add(key)
  return next
}

// event_attendees 행을 팀 짜기 참가자 형태로 변환. id는 attendee id라 고정 배정 매칭용 멤버 id는 memberId로 보존
// 로스터에서 삭제된 멤버면 용병처럼 취급
function resolvePoolEntry(a, members) {
  const member = a.memberId != null ? members.find((m) => m.id === a.memberId) : null
  if (member) return { ...member, id: a.id, attendeeId: a.id, memberId: member.id }
  return { id: a.id, attendeeId: a.id, tier: a.tier ?? 'C', isMercenary: true, label: a.name }
}

// 팀 고정 배정은 관리자 전역 설정을 반영만 함
// 경기마다 참여자가 다를 수 있어 이벤트 참석자 풀에서 고르고, 로스터 멤버/용병도 경기별로 추가 가능
export default function EventTeamBuilderModal({ event, match, members, equalMode, teamPins, onClose, onSave }) {
  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const sheetRef = useRef(null)
  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = useSwipeToClose(sheetRef, requestClose)

  const poolEntries = event.attendees.map((a) => resolvePoolEntry(a, members))
  const poolRosterEntries = poolEntries.filter((e) => !e.isMercenary)
  const poolMercLikeEntries = poolEntries.filter((e) => e.isMercenary)

  const previousAssignedAttendeeIds = new Set((match.assignments ?? []).map((a) => a.attendeeId))
  const isRebuilding = previousAssignedAttendeeIds.size > 0

  // 저장된 배정이 있으면 그 인원만, 새 경기면 전체 참석자 기본 체크
  const [excludedAttendeeIds, setExcludedAttendeeIds] = useState(() => {
    if (!isRebuilding) return new Set()
    return new Set(poolEntries.filter((e) => !previousAssignedAttendeeIds.has(e.attendeeId)).map((e) => e.attendeeId))
  })
  // 풀에 없는 로스터 멤버 추가분 (저장 시 event_attendees에 등록)
  const [addedMemberIds, setAddedMemberIds] = useState(new Set())
  // 이번 경기용 신규 용병 (저장 시 event_attendees에 등록)
  const [newMercenaries, setNewMercenaries] = useState([])
  const mercIdRef = useRef(0)

  const [teamCount, setTeamCount] = useState(3)
  const [teams, setTeams] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function isMemberSelected(memberId) {
    const poolEntry = poolRosterEntries.find((e) => e.memberId === memberId)
    if (poolEntry) return !excludedAttendeeIds.has(poolEntry.attendeeId)
    return addedMemberIds.has(memberId)
  }

  function toggleMember(memberId) {
    setTeams(null)
    const poolEntry = poolRosterEntries.find((e) => e.memberId === memberId)
    if (poolEntry) {
      setExcludedAttendeeIds((prev) => toggledSet(prev, poolEntry.attendeeId))
      return
    }
    setAddedMemberIds((prev) => toggledSet(prev, memberId))
  }

  function toggleExcluded(attendeeId) {
    setTeams(null)
    setExcludedAttendeeIds((prev) => toggledSet(prev, attendeeId))
  }

  function handleAddMercenaries(count, tier) {
    setTeams(null)
    const added = Array.from({ length: count }, () => {
      mercIdRef.current += 1
      return { id: `merc-${mercIdRef.current}`, tier, isMercenary: true, label: `용병${mercIdRef.current}` }
    })
    setNewMercenaries((prev) => [...prev, ...added])
  }

  function handleRemoveMercenary(id) {
    setTeams(null)
    setNewMercenaries((prev) => prev.filter((m) => m.id !== id))
  }

  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  const memberParticipants = [
    ...poolRosterEntries.filter((e) => !excludedAttendeeIds.has(e.attendeeId)),
    ...members
      .filter((m) => addedMemberIds.has(m.id))
      .map((m) => ({ ...m, id: `new-m-${m.id}`, attendeeId: null, memberId: m.id })),
  ]
  const mercParticipants = [
    ...poolMercLikeEntries.filter((e) => !excludedAttendeeIds.has(e.attendeeId)),
    ...newMercenaries.map((m) => ({ ...m, attendeeId: null })),
  ]
  const participants = [...memberParticipants, ...mercParticipants]

  const canGenerate = participants.length >= teamCount

  function handleGenerate() {
    setIsGenerating(true)
    setError('')
    timeoutRef.current = setTimeout(() => {
      setTeams(buildBalancedTeams(participants, teamCount, teamPins, equalMode))
      setIsGenerating(false)
    }, GENERATE_DELAY_MS)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const participantPayload = teams.flatMap((team, teamIndex) =>
      team.members.map((m) => ({
        attendeeId: m.attendeeId ?? null,
        name: m.isMercenary ? m.label : m.name,
        memberId: m.isMercenary ? null : m.memberId,
        tier: m.isMercenary ? m.tier : null,
        teamIndex,
      }))
    )
    const { error: saveError } = await onSave(participantPayload)
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
          <h2 className="text-lg font-bold">{match.matchNumber != null ? `${match.matchNumber}경기 팀 짜기` : '팀 짜기'}</h2>
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
            평등 모드 — 능력치 비공개
          </p>
        )}

        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold text-[var(--color-text-soft)]">
            이 경기 참석자 ({participants.length}명)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {sortedMembers.map((member) => (
              <AttendeeChip
                key={member.id}
                member={member}
                selected={isMemberSelected(member.id)}
                equalMode={equalMode}
                onToggle={() => toggleMember(member.id)}
              />
            ))}
          </div>

          {poolMercLikeEntries.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {poolMercLikeEntries.map((entry) => {
                const excluded = excludedAttendeeIds.has(entry.attendeeId)
                return (
                  <button
                    key={entry.attendeeId}
                    type="button"
                    onClick={() => toggleExcluded(entry.attendeeId)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      excluded
                        ? 'bg-[var(--color-surface-soft)] text-[var(--color-text-muted)]'
                        : 'bg-accent-500/20 text-accent-300 ring-1 ring-accent-400/50'
                    }`}
                  >
                    {entry.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <MercenaryForm mercenaries={newMercenaries} onAdd={handleAddMercenaries} onRemove={handleRemoveMercenary} equalMode={equalMode} />

        <div className="mt-2 flex items-center gap-2">
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
