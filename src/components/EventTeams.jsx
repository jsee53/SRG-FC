import { useState } from 'react'

function groupByTeam(attendees) {
  const groups = new Map()
  for (const attendee of attendees) {
    if (attendee.teamIndex == null) continue
    if (!groups.has(attendee.teamIndex)) groups.set(attendee.teamIndex, [])
    groups.get(attendee.teamIndex).push(attendee)
  }
  return [...groups.entries()].sort(([a], [b]) => a - b)
}

export default function EventTeams({ event, myMemberId, voterId, votes, onCastVote, onRetractVote }) {
  const [pendingId, setPendingId] = useState(null)
  const teamGroups = groupByTeam(event.attendees)

  if (teamGroups.length === 0) return null

  const myAttendee = myMemberId != null ? event.attendees.find((a) => a.memberId === myMemberId) : null
  const canVote = event.confirmed && myAttendee != null

  // 이미 투표한 사람을 다시 누르면 투표 취소(= 아무도 안 줌), 자기 자신에게는 투표 못 함
  async function handleVote(attendeeId, isMyVote) {
    setPendingId(attendeeId)
    if (isMyVote) {
      await onRetractVote(event.id)
    } else {
      await onCastVote(event.id, attendeeId)
    }
    setPendingId(null)
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      {teamGroups.map(([teamIndex, attendees]) => {
        const isMyTeam = canVote && myAttendee.teamIndex === teamIndex
        const teamVotes = votes.filter((v) => v.eventId === event.id && v.teamIndex === teamIndex)
        const myVote = teamVotes.find((v) => v.voterId === voterId)

        return (
          <div key={teamIndex} className="rounded-xl bg-white/5 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-300">
              {teamIndex + 1}팀 ({attendees.length}명)
            </p>
            <div className="flex flex-col gap-1.5">
              {attendees.map((attendee) => {
                const voteCount = teamVotes.filter((v) => v.votedAttendeeId === attendee.id).length
                const isMyVote = myVote?.votedAttendeeId === attendee.id
                const isSelf = myAttendee != null && attendee.id === myAttendee.id
                return (
                  <div key={attendee.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-200">{attendee.name}</span>
                    <div className="flex items-center gap-2">
                      {event.confirmed && voteCount > 0 && (
                        <span className="text-xs text-amber-300">POM {voteCount}표</span>
                      )}
                      {isMyTeam && !isSelf && (
                        <button
                          type="button"
                          onClick={() => handleVote(attendee.id, isMyVote)}
                          disabled={pendingId === attendee.id}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-40 ${
                            isMyVote
                              ? 'bg-amber-400 text-amber-950'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
