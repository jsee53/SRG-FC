import { useEffect, useMemo, useState } from 'react'
import RankingPage from './pages/RankingPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import BoardPage from './pages/BoardPage'
import SchedulePage from './pages/SchedulePage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AuthForm, { PENDING_CLAIM_KEY } from './components/AuthForm'
import { useMembers } from './hooks/useMembers'
import { useAuth } from './hooks/useAuth'
import { useEvents } from './hooks/useEvents'
import { useBestPlayerVotes } from './hooks/useBestPlayerVotes'

const TABS = [
  { key: 'ranking', label: '랭킹' },
  { key: 'teams', label: '팀 짜기' },
  { key: 'board', label: '게시판' },
  { key: 'schedule', label: '일정' },
]

function App() {
  const [page, setPage] = useState('ranking')
  const [showAuth, setShowAuth] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAdminPage, setShowAdminPage] = useState(false)
  const {
    members,
    loading,
    error,
    updateMember,
    addMember,
    deleteMember,
    updateOwnMember,
    updateMemberStats,
    claimMember,
    unlinkMember,
  } = useMembers()
  const { session, isAdmin, canManageEvents, canPostNotice, canManageStats, signIn, signUp, signOut } = useAuth()
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    createEvent,
    updateEvent,
    deleteEvent,
    setEventConfirmed,
    saveEventTeams,
    resetEventTeams,
  } = useEvents()
  const { votes, castVote, retractVote } = useBestPlayerVotes()

  // 성사된 경기의 참석자만 참석 횟수로 집계 (멤버 규모가 작아 그때그때 계산해도 충분히 가벼움)
  const attendanceCountByMemberId = useMemo(() => {
    const counts = {}
    for (const event of events) {
      if (!event.confirmed) continue
      for (const attendee of event.attendees) {
        if (attendee.memberId == null) continue
        counts[attendee.memberId] = (counts[attendee.memberId] ?? 0) + 1
      }
    }
    return counts
  }, [events])

  // 팀별 최다 득표자(동률이면 전부)를 그 팀의 "베스트 플레이어"로 치고, 받은 횟수를 집계
  const bestPlayerCountByMemberId = useMemo(() => {
    const attendeeById = new Map()
    for (const event of events) {
      for (const attendee of event.attendees) attendeeById.set(attendee.id, attendee)
    }

    const tallyByGroup = new Map()
    for (const vote of votes) {
      const key = `${vote.eventId}-${vote.teamIndex}`
      const tally = tallyByGroup.get(key) ?? new Map()
      tally.set(vote.votedAttendeeId, (tally.get(vote.votedAttendeeId) ?? 0) + 1)
      tallyByGroup.set(key, tally)
    }

    const counts = {}
    for (const tally of tallyByGroup.values()) {
      const maxVotes = Math.max(...tally.values())
      for (const [attendeeId, count] of tally.entries()) {
        if (count !== maxVotes) continue
        const memberId = attendeeById.get(attendeeId)?.memberId
        if (memberId == null) continue
        counts[memberId] = (counts[memberId] ?? 0) + 1
      }
    }
    return counts
  }, [events, votes])

  // 이메일 확인이 필요한 가입이었다면 로그인 시점에야 세션이 생기므로, 그때 예약된 멤버 연결을 처리.
  // 그 사이 다른 사람이 같은 이름을 먼저 선택했다면 claim은 실패하는데, 재시도해도 계속 실패할
  // 뿐이니 예약 키는 성공/실패 여부와 상관없이 지운다 (실패 시엔 "내 정보"에서 다시 선택 가능)
  useEffect(() => {
    if (!session) return
    const pendingId = localStorage.getItem(PENDING_CLAIM_KEY)
    if (!pendingId) return
    localStorage.removeItem(PENDING_CLAIM_KEY)
    claimMember(Number(pendingId))
  }, [session, claimMember])

  const hasData = members.length > 0
  const showLoader = loading && !hasData
  const showError = Boolean(error) && !hasData
  const myMember = session ? members.find((m) => m.userId === session.user.id) : null
  const unclaimedMembers = members.filter((m) => !m.userId)

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-900 text-white">
      <header className="flex items-center gap-3 px-4 pt-6 pb-2">
        <img
          src={`${import.meta.env.BASE_URL}emblem.png`}
          alt="SRG-FC 엠블럼"
          className="h-12 w-12 flex-none object-contain"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">SRG-FC</h1>
          <p className="text-sm text-slate-400">새릉골 풋살 동호회</p>
        </div>
        {session ? (
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="flex-none rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/20"
          >
            {myMember ? myMember.name : session.user.email.split('@')[0]}
            {isAdmin ? ' (관리자)' : ''}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="flex-none rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/20"
          >
            로그인
          </button>
        )}
      </header>

      <nav className="flex gap-2 px-4 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setPage(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              page === tab.key ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {showLoader && <p className="px-4 py-16 text-center text-slate-400">불러오는 중...</p>}
      {showError && <p className="px-4 py-16 text-center text-red-400">멤버 정보를 불러오지 못했어요. 새로고침 해주세요.</p>}

      {!showLoader && !showError && (
        <>
          <div className={page === 'ranking' ? '' : 'hidden'}>
            <RankingPage
              members={members}
              isAdmin={isAdmin}
              canManageStats={canManageStats}
              onSaveMember={updateMember}
              onAddMember={addMember}
              onDeleteMember={deleteMember}
              onSaveMemberStats={updateMemberStats}
              attendanceCountByMemberId={attendanceCountByMemberId}
              bestPlayerCountByMemberId={bestPlayerCountByMemberId}
            />
          </div>
          <div className={page === 'teams' ? '' : 'hidden'}>
            <TeamBuilderPage members={members} />
          </div>
          <div className={page === 'board' ? '' : 'hidden'}>
            <BoardPage
              members={members}
              session={session}
              isAdmin={isAdmin}
              canPostNotice={canPostNotice}
              onRequireLogin={() => setShowAuth(true)}
            />
          </div>
          <div className={page === 'schedule' ? '' : 'hidden'}>
            <SchedulePage
              members={members}
              session={session}
              myMemberId={myMember?.id}
              isAdmin={isAdmin}
              canManageEvents={canManageEvents}
              events={events}
              loading={eventsLoading}
              error={eventsError}
              votes={votes}
              onCreateEvent={createEvent}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
              onSetEventConfirmed={setEventConfirmed}
              onSaveEventTeams={saveEventTeams}
              onResetEventTeams={resetEventTeams}
              onCastVote={castVote}
              onRetractVote={retractVote}
            />
          </div>
        </>
      )}

      {showAuth && (
        <AuthForm members={members} onClose={() => setShowAuth(false)} onSignIn={signIn} onSignUp={signUp} />
      )}

      {showProfile && session && (
        <ProfilePage
          session={session}
          member={myMember}
          unclaimedMembers={unclaimedMembers}
          isAdmin={isAdmin}
          onClose={() => setShowProfile(false)}
          onSave={updateOwnMember}
          onClaim={claimMember}
          onSignOut={() => {
            signOut()
            setShowProfile(false)
          }}
          onOpenAdmin={() => {
            setShowProfile(false)
            setShowAdminPage(true)
          }}
        />
      )}

      {showAdminPage && (
        <AdminPage members={members} onClose={() => setShowAdminPage(false)} onUnlinkMember={unlinkMember} />
      )}
    </div>
  )
}

export default App
