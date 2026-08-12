import { TIER_ORDER, TIER_LABELS, compareByTierRank } from '../utils/tier'
import MemberCard from './MemberCard'

function EmptyState() {
  return <p className="py-10 text-center text-slate-400">해당 포지션 멤버가 없습니다.</p>
}

export default function RankingList({ members, filter, sortBy, selectedId, aceId, onSelect }) {
  const filtered =
    filter === '전체' ? members : members.filter((m) => m.positions.includes(filter))

  if (sortBy === 'tier') {
    const groups = TIER_ORDER.map((tier) => ({
      tier,
      members: filtered.filter((m) => m.tier === tier).sort(compareByTierRank),
    })).filter((group) => group.members.length > 0)

    return (
      <div className="flex flex-col gap-5 px-4 pb-6">
        {groups.map((group) => (
          <section key={group.tier}>
            <h2 className="mb-2 text-sm font-semibold text-slate-400">{TIER_LABELS[group.tier]}</h2>
            <div className="flex flex-col gap-3">
              {group.members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  active={member.id === selectedId}
                  isAce={member.id === aceId}
                  onClick={() => onSelect(member)}
                />
              ))}
            </div>
          </section>
        ))}
        {groups.length === 0 && <EmptyState />}
      </div>
    )
  }

  const sorted = [...filtered].sort(compareByTierRank)

  return (
    <div className="flex flex-col gap-3 px-4 pb-6">
      {sorted.map((member, index) => (
        <MemberCard
          key={member.id}
          member={member}
          rank={index + 1}
          active={member.id === selectedId}
          isAce={member.id === aceId}
          onClick={() => onSelect(member)}
        />
      ))}
      {sorted.length === 0 && <EmptyState />}
    </div>
  )
}
