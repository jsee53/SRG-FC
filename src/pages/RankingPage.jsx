import { useState } from 'react'
import { members } from '../data/members'
import PositionTabs from '../components/PositionTabs'
import SortToggle from '../components/SortToggle'
import RankingList from '../components/RankingList'
import MemberDetail from '../components/MemberDetail'

export default function RankingPage() {
  const [filter, setFilter] = useState('전체')
  const [sortBy, setSortBy] = useState('overall')
  const [selectedMember, setSelectedMember] = useState(null)

  return (
    <>
      <PositionTabs active={filter} onChange={setFilter} />
      <div className="flex items-center justify-end gap-2 px-4 pb-2">
        <span className="text-xs text-slate-400">정렬</span>
        <SortToggle active={sortBy} onChange={setSortBy} />
      </div>
      <RankingList
        members={members}
        filter={filter}
        sortBy={sortBy}
        selectedId={selectedMember?.id}
        onSelect={setSelectedMember}
      />

      <MemberDetail member={selectedMember} onClose={() => setSelectedMember(null)} />
    </>
  )
}
