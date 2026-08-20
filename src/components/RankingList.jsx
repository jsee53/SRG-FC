import { compareByOvr, compareByName } from '../utils/tier'
import MemberCard from './MemberCard'

function EmptyState() {
  return <p className="py-10 text-center text-[var(--color-text-muted)]">해당 포지션 멤버가 없습니다.</p>
}

export default function RankingList({ members, filter, sortBy, equalMode, selectedId, aceId, onSelect }) {
  const filtered =
    filter === '전체' ? members : members.filter((m) => m.positions.includes(filter))

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
          active={member.id === selectedId}
          isAce={member.id === aceId}
          onClick={() => onSelect(member)}
        />
      ))}
      {sorted.length === 0 && <EmptyState />}
    </div>
  )
}
