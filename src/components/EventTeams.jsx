import { useState } from 'react'

function groupByTeam(assignments) {
  const groups = new Map()
  for (const a of assignments) {
    if (!groups.has(a.teamIndex)) groups.set(a.teamIndex, [])
    groups.get(a.teamIndex).push(a)
  }
  return [...groups.entries()].sort(([a], [b]) => a - b)
}

export default function EventTeams({ event, match, myMemberId, voterId, votes, onCastVote, onRetractVote }) {
  const [pendingId, setPendingId] = useState(null)
  const attendeeById = new Map(event.attendees.map((a) => [a.id, a]))
  const teamGroups = groupByTeam(match.assignments)

  if (teamGroups.length === 0) return null

  const myAttendee = myMemberId != null ? event.attendees.find((a) => a.memberId === myMemberId) : null
  const myAssignment = myAttendee ? match.assignments.find((a) => a.attendeeId === myAttendee.id) : null
  const canVote = event.confirmed && myAssignment != null

  // 이미 투표한 사람을 다시 누르면 투표 취소(= 아무도 안 줌), 자기 자신에게는 투표 못 함
  async function handleVote(attendeeId, isMyVote) {
    setPendingId(attendeeId)
    if (isMyVote) {
      await onRetractVote(match.id)
    } else {
      await onCastVote(match.id, attendeeId)
    }
    setPendingId(null)
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      {teamGroups.map(([teamIndex, assignments]) => {
        const isMyTeam = canVote && myAssignment.teamIndex === teamIndex
        const teamVotes = votes.filter((v) => v.matchId === match.id && v.teamIndex === teamIndex)
        const myVote = teamVotes.find((v) => v.voterId === voterId)

        return (
          <div key={teamIndex} className="rounded-xl bg-[var(--color-surface-faint)] p-3">
            <p className="mb-2 text-xs font-semibold text-[var(--color-text-soft)]">
              {teamIndex + 1}팀 ({assignments.length}명)
            </p>
            <div className="flex flex-col gap-1.5">
              {assignments.map(({ attendeeId }) => {
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
