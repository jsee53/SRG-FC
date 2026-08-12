import { useEffect, useRef, useState } from 'react'
import { buildBalancedTeams } from '../utils/teamBuilder'
import TeamResultCard from './TeamResultCard'
import TeamResultSkeleton from './TeamResultSkeleton'

const GENERATE_DELAY_MS = 500

function toParticipants(event, members) {
  return event.attendees.map((a) => {
    const member = a.memberId != null ? members.find((m) => m.id === a.memberId) : null
    if (member) return { ...member, id: a.id, attendeeId: a.id }
    return { id: a.id, attendeeId: a.id, tier: a.tier ?? 'C', isMercenary: true, label: a.name }
  })
}

export default function EventTeamBuilderModal({ event, members, onClose, onSave }) {
  const participants = toParticipants(event, members)
  const [teamCount, setTeamCount] = useState(2)
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
      setTeams(buildBalancedTeams(participants, teamCount))
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
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 [animation:overlay-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-800 p-5 pb-8 [animation:sheet-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">팀 짜기</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-slate-400">팀 수</span>
          <div className="flex gap-1 rounded-full bg-white/10 p-1">
            {[2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTeamCount(n)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  teamCount === n ? 'bg-emerald-400 text-emerald-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {n}팀
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">참석자 {participants.length}명</span>
        </div>

        {!teams && !isGenerating && (
          <button
            type="button"
            disabled={!canGenerate}
            onClick={handleGenerate}
            className="mt-4 w-full rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
          >
            팀 나누기
          </button>
        )}
        {!canGenerate && !teams && (
          <p className="mt-1 text-center text-xs text-slate-400">최소 {teamCount}명은 있어야 팀을 나눌 수 있어요.</p>
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
              <TeamResultCard key={i} index={i} team={team} />
            ))}

            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-full bg-white/10 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/20"
            >
              다시 나누기
            </button>

            {error && <p className="text-center text-xs text-red-400">{error}</p>}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
            >
              {saving ? '저장 중...' : '이 팀으로 저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
