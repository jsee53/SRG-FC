import { useState } from 'react'
import { powerScore } from '../utils/teamBuilder'

function groupByTeam(assignments) {
  const groups = new Map()
  for (const a of assignments) {
    if (!groups.has(a.teamIndex)) groups.set(a.teamIndex, [])
    groups.get(a.teamIndex).push(a)
  }
  return [...groups.entries()].sort(([a], [b]) => a - b)
}

// 팀 짜기 결과 화면(TeamResultCard)과 같은 기준(실력순)으로 보이게 함 — 안 그러면 팀을
// 수동으로 옮겼을 때 그 사람이 저장 순서상 맨 끝에 붙어 보여서 뒤죽박죽으로 보임
function resolvePowerScore(attendee, members) {
  if (!attendee) return 0
  if (attendee.memberId == null) return powerScore({ isMercenary: true, tier: attendee.tier ?? 'C' })
  const member = members.find((m) => m.id === attendee.memberId)
  if (!member) return powerScore({ isMercenary: true, tier: attendee.tier ?? 'C' })
  return powerScore(member)
}

export default function EventTeams({ event, match, members, myMemberId, voterId, votes, isAdmin, teamEditMode, onMoveAttendee, onCastVote, onRetractVote }) {
  const [pendingId, setPendingId] = useState(null)
  const [movingId, setMovingId] = useState(null)
  const [voteError, setVoteError] = useState('')
  const attendeeById = new Map(event.attendees.map((a) => [a.id, a]))
  const teamGroups = groupByTeam(match.assignments)

  if (teamGroups.length === 0) return null

  const teamIndexes = teamGroups.map(([teamIndex]) => teamIndex)

  // 관리자가 전체를 다시 안 짜고 한 명만 다른 팀으로 바로 옮길 때 씀
  async function handleMove(attendeeId, newTeamIndex) {
    setMovingId(attendeeId)
    await onMoveAttendee(match.id, attendeeId, newTeamIndex)
    setMovingId(null)
  }

  const myAttendee = myMemberId != null ? event.attendees.find((a) => a.memberId === myMemberId) : null
  const myAssignment = myAttendee ? match.assignments.find((a) => a.attendeeId === myAttendee.id) : null
  const canVote = event.confirmed && myAssignment != null

  // 이미 투표한 사람을 다시 누르면 투표 취소(= 아무도 안 줌), 자기 자신에게는 투표 못 함
  async function handleVote(attendeeId, isMyVote) {
    setPendingId(attendeeId)
    setVoteError('')
    const { error } = isMyVote ? await onRetractVote(match.id) : await onCastVote(match.id, attendeeId)
    setPendingId(null)
    if (error) {
      setVoteError(error.message ?? '투표 처리에 실패했어요. 다시 시도해주세요.')
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      {voteError && <p className="text-xs text-red-400">{voteError}</p>}
      {teamGroups.map(([teamIndex, assignments]) => {
        const isMyTeam = canVote && myAssignment.teamIndex === teamIndex
        const teamVotes = votes.filter((v) => v.matchId === match.id && v.teamIndex === teamIndex)
        const myVote = teamVotes.find((v) => v.voterId === voterId)
        const sortedAssignments = [...assignments].sort(
          (a, b) =>
            resolvePowerScore(attendeeById.get(b.attendeeId), members) -
            resolvePowerScore(attendeeById.get(a.attendeeId), members)
        )

        return (
          <div key={teamIndex} className="rounded-xl bg-[var(--color-surface-faint)] p-3">
            <p className="mb-2 text-xs font-semibold text-[var(--color-text-soft)]">
              {teamIndex + 1}팀 ({assignments.length}명)
            </p>
            <div className="flex flex-col gap-1.5">
              {sortedAssignments.map(({ attendeeId }) => {
                const attendee = attendeeById.get(attendeeId)
                if (!attendee) return null
                const voteCount = teamVotes.filter((v) => v.votedAttendeeId === attendeeId).length
                const isMyVote = myVote?.votedAttendeeId === attendeeId
                const isSelf = myAttendee != null && attendeeId === myAttendee.id
                return (
                  <div key={attendeeId} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[var(--color-text-soft)]">{attendee.name}</span>
                    <div className="flex items-center gap-2">
                      {event.confirmed && voteCount > 0 && (
                        <span className="text-xs text-amber-300">POM {voteCount}표</span>
                      )}
                      {isMyTeam && !isSelf && (
                        <button
                          type="button"
                          onClick={() => handleVote(attendeeId, isMyVote)}
                          disabled={pendingId === attendeeId}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-40 ${
                            isMyVote
                              ? 'bg-amber-400 text-amber-950'
                              : 'bg-[var(--color-surface-soft)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-soft-hover)]'
                          }`}
                        >
                          {isMyVote ? '투표 취소' : '투표'}
                        </button>
                      )}
                      {isAdmin && teamEditMode && (
                        <select
                          value={teamIndex}
                          disabled={movingId === attendeeId}
                          onChange={(e) => handleMove(attendeeId, Number(e.target.value))}
                          className="rounded-full bg-[var(--color-surface-soft)] px-1.5 py-0.5 text-xs text-[var(--color-text-soft)] disabled:opacity-40"
                        >
                          {teamIndexes.map((idx) => (
                            <option key={idx} value={idx}>
                              {idx + 1}팀
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
