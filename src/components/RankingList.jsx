import { compareByOvr, compareByName } from '../utils/tier'
import MemberCard from './MemberCard'

function EmptyState() {
  return <p className="py-10 text-center text-[var(--color-text-muted)]">해당 포지션 멤버가 없습니다.</p>
}

export default function RankingList({ members, filter, sortBy, selectedId, aceId, onSelect }) {
  const filtered =
    filter === '전체' ? members : members.filter((m) => m.positions.includes(filter))

  const sorted = [...filtered].sort(sortBy === 'name' ? compareByName : compareByOvr)

  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      {sorted.map((member, index) => (
        <MemberCard
          key={member.id}
          member={member}
          rank={sortBy === 'overall' ? index + 1 : undefined}
          active={member.id === selectedId}
          isAce={member.id === aceId}
          onClick={() => onSelect(member)}
        />
      ))}
      {sorted.length === 0 && <EmptyState />}
    </div>
  )
}
