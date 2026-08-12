import { useEffect, useState } from 'react'
import { filterMembers, sortMembersFlat } from '../utils/tier'
import { getAceMemberId } from '../utils/ace'
import PositionTabs from '../components/PositionTabs'
import SortToggle from '../components/SortToggle'
import RankingList from '../components/RankingList'
import MemberDetail from '../components/MemberDetail'
import MemberEditForm from '../components/MemberEditForm'
import AddMemberForm from '../components/AddMemberForm'
import StatsEditForm from '../components/StatsEditForm'

export default function RankingPage({
  members,
  isAdmin,
  canManageStats,
  onSaveMember,
  onAddMember,
  onDeleteMember,
  onSaveMemberStats,
  attendanceCountByMemberId,
  bestPlayerCountByMemberId,
}) {
  const [filter, setFilter] = useState('전체')
  const [sortBy, setSortBy] = useState('name')
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember] = useState(null)
  const [editingStatsMember, setEditingStatsMember] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)

  // 관리자가 다른 곳에서 수정하고 members가 새로 로드되면, 열려있는 상세보기도 최신 값으로 갱신.
  // 삭제됐다면(더 이상 목록에 없으면) 상세보기를 닫음
  useEffect(() => {
    if (!selectedMember) return
    const updated = members.find((m) => m.id === selectedMember.id)
    setSelectedMember(updated ?? null)
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
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            className="mr-auto rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/20"
          >
            멤버 추가
          </button>
        )}
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
        canManageStats={canManageStats}
        onEdit={() => setEditingMember(selectedMember)}
        onEditStats={() => setEditingStatsMember(selectedMember)}
        attendanceCount={selectedMember ? attendanceCountByMemberId[selectedMember.id] ?? 0 : 0}
        bestPlayerCount={selectedMember ? bestPlayerCountByMemberId[selectedMember.id] ?? 0 : 0}
      />

      {editingMember && (
        <MemberEditForm
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={onSaveMember}
          onDelete={onDeleteMember}
        />
      )}

      {editingStatsMember && (
        <StatsEditForm
          member={editingStatsMember}
          onClose={() => setEditingStatsMember(null)}
          onSave={onSaveMemberStats}
        />
      )}

      {showAddMember && <AddMemberForm onClose={() => setShowAddMember(false)} onAdd={onAddMember} />}
    </>
  )
}
