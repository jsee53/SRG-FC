import { compareByOvr, compareByName, sortByAttendance, computeAttendanceRanks } from '../utils/tier'
import MemberCard from './MemberCard'
import AttendanceRankCard from './AttendanceRankCard'

function EmptyState() {
  return <p className="py-10 text-center text-[var(--color-text-muted)]">해당 포지션 멤버가 없습니다.</p>
}

export default function RankingList({
  members,
  filter,
  sortBy,
  equalMode,
  attendanceCountByMemberId,
  totalConfirmedEvents,
  selectedId,
  aceId,
  onSelect,
}) {
  const filtered =
    filter === '전체' ? members : members.filter((m) => m.positions.includes(filter))

  if (sortBy === 'attendance') {
    const sorted = sortByAttendance(filtered, attendanceCountByMemberId)
    const ranks = computeAttendanceRanks(sorted, attendanceCountByMemberId)
    const rankCounts = new Map()
    for (const rank of ranks.values()) rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1)

    return (
      <div className="flex flex-col gap-2 px-4 pb-6">
        {sorted.map((member) => {
          const rank = ranks.get(member.id)
          return (
            <AttendanceRankCard
              key={member.id}
              member={member}
              rank={rank}
              tied={rankCounts.get(rank) > 1}
              attendanceCount={attendanceCountByMemberId[member.id] ?? 0}
              totalEvents={totalConfirmedEvents}
              active={member.id === selectedId}
              onClick={() => onSelect(member)}
            />
          )
        })}
        {sorted.length === 0 && <EmptyState />}
      </div>
    )
  }

  const sorted = [...filtered].sort(
    sortBy === 'name' ? compareByName : (a, b) => compareByOvr(a, b, equalMode)
  )

  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      {sorted.map((member, index) => (
        <MemberCard
          key={member.id}
          member={member}
          rank={sortBy === 'overall' && (!equalMode || member.tier === 'S') ? index + 1 : undefined}
          equalMode={equalMode}
          brandMode={sortBy === 'name'}
          active={member.id === selectedId}
          isAce={member.id === aceId}
          onClick={() => onSelect(member)}
        />
      ))}
      {sorted.length === 0 && <EmptyState />}
    </div>
  )
}
