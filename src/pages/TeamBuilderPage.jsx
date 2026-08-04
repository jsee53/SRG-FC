import { useRef, useState } from 'react'
import { members } from '../data/members'
import { buildBalancedTeams } from '../utils/teamBuilder'
import AttendeeChip from '../components/AttendeeChip'
import MercenaryForm from '../components/MercenaryForm'
import TeamSettings from '../components/TeamSettings'
import TeamResultCard from '../components/TeamResultCard'

export default function TeamBuilderPage() {
  const [attendingIds, setAttendingIds] = useState(new Set())
  const [mercenaries, setMercenaries] = useState([])
  const [teamCount, setTeamCount] = useState(3)
  const [teamSize, setTeamSize] = useState(6)
  const [teams, setTeams] = useState(null)
  const mercIdRef = useRef(0)

  const attendingMembers = members.filter((m) => attendingIds.has(m.id))
  const totalAttendees = attendingMembers.length + mercenaries.length
  const canGenerate = totalAttendees >= teamCount

  function toggleAttendee(id) {
    setAttendingIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleAddMercenaries(count, tier) {
    const added = Array.from({ length: count }, () => {
      mercIdRef.current += 1
      return { id: `merc-${mercIdRef.current}`, tier, isMercenary: true, label: `용병${mercIdRef.current}` }
    })
    setMercenaries((prev) => [...prev, ...added])
  }

  function handleRemoveMercenary(id) {
    setMercenaries((prev) => prev.filter((m) => m.id !== id))
  }

  function handleGenerate() {
    setTeams(buildBalancedTeams([...attendingMembers, ...mercenaries], teamCount))
  }

  return (
    <>
      <div className="px-4 py-3">
        <h2 className="mb-2 text-sm font-semibold text-slate-300">참석자 선택 ({totalAttendees}명)</h2>
        <div className="grid grid-cols-2 gap-2">
          {members.map((member) => (
            <AttendeeChip
              key={member.id}
              member={member}
              selected={attendingIds.has(member.id)}
              onToggle={() => toggleAttendee(member.id)}
            />
          ))}
        </div>
      </div>

      <MercenaryForm mercenaries={mercenaries} onAdd={handleAddMercenaries} onRemove={handleRemoveMercenary} />

      <TeamSettings
        teamCount={teamCount}
        onTeamCountChange={setTeamCount}
        teamSize={teamSize}
        onTeamSizeChange={setTeamSize}
      />

      {!teams && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className="flex-1 rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40 disabled:hover:bg-emerald-400"
            >
              팀 나누기
            </button>
            <span className="flex-none text-sm text-slate-400">{totalAttendees}명</span>
          </div>
          {!canGenerate && (
            <p className="mt-1 text-center text-xs text-slate-400">최소 {teamCount}명은 있어야 팀을 나눌 수 있어요.</p>
          )}
        </div>
      )}

      {teams && (
        <div className="flex flex-col gap-3 px-4 pb-6">
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
        </div>
      )}
    </>
  )
}
