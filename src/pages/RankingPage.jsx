import { useEffect, useState } from 'react'
import { filterMembers, sortMembersFlat } from '../utils/tier'
import { getAceMemberId } from '../utils/ace'
import PositionTabs from '../components/PositionTabs'
import SortToggle from '../components/SortToggle'
import RankingList from '../components/RankingList'
import MemberDetail from '../components/MemberDetail'
import MemberEditForm from '../components/MemberEditForm'

export default function RankingPage({ members, isAdmin, onSaveMember }) {
  const [filter, setFilter] = useState('전체')
  const [sortBy, setSortBy] = useState('overall')
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)

  // 관리자가 다른 곳에서 수정하고 members가 새로 로드되면, 열려있는 상세보기도 최신 값으로 갱신
  useEffect(() => {
    if (!selectedMember) return
    const updated = members.find((m) => m.id === selectedMember.id)
    if (updated) setSelectedMember(updated)
  }, [members])

  const ordered = sortMembersFlat(filterMembers(members, filter), sortBy)
  const selectedIndex = selectedMember ? ordered.findIndex((m) => m.id === selectedMember.id) : -1
  const aceId = getAceMemberId(members)

  function moveTo(offset) {
    const next = ordered[selectedIndex + offset]
    if (next) setSelectedMember(next)
  }

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
        aceId={aceId}
        onSelect={setSelectedMember}
      />

      <MemberDetail
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex !== -1 && selectedIndex < ordered.length - 1}
        onPrev={() => moveTo(-1)}
        onNext={() => moveTo(1)}
        isAce={selectedMember?.id === aceId}
        isAdmin={isAdmin}
        onEdit={() => setEditingMember(selectedMember)}
      />

      {editingMember && (
        <MemberEditForm member={editingMember} onClose={() => setEditingMember(null)} onSave={onSaveMember} />
      )}
    </>
  )
}
