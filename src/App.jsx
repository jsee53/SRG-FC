import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useEventLocations } from './hooks/useEventLocations'
import { useBestPlayerVotes } from './hooks/useBestPlayerVotes'
import { useAccentTheme } from './hooks/useAccentTheme'

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
  const { locations: eventLocations, refetchLocations } = useEventLocations()
  const { votes, castVote, retractVote } = useBestPlayerVotes()
  const { theme: accentTheme, changeTheme: changeAccentTheme } = useAccentTheme()

  async function createEventAndRefetchLocations(...args) {
    const result = await createEvent(...args)
    if (!result.error) await refetchLocations()
    return result
  }

  async function updateEventAndRefetchLocations(...args) {
    const result = await updateEvent(...args)
    if (!result.error) await refetchLocations()
    return result
  }

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

    // 팀별 최다 득표자가 1명이면 그 사람만, 정확히 2명이 공동 최다면 둘 다 POM으로 인정.
    // 3명 이상이 공동 최다면(득표가 너무 갈려서 확정할 수 없는 경우) 그 팀은 아무도 인정하지 않음
    const counts = {}
    for (const tally of tallyByGroup.values()) {
      const maxVotes = Math.max(...tally.values())
      const winners = [...tally.entries()].filter(([, count]) => count === maxVotes)
      if (winners.length > 2) continue

      for (const [attendeeId] of winners) {
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

  // 랭킹/팀 짜기/게시판/일정 탭을 좌우 스와이프로도 넘길 수 있게 함.
  // 스크롤이 긴 페이지(게시판/일정)에서는 세로로 긴 드래그 중 손이 살짝 옆으로 흔들리기만 해도
  // 가로 스와이프로 오판(또는 반대로 누락)하기 쉬워서, 이동 초반(10px)에 방향을 먼저 정하고
  // 그 뒤로는 그 방향을 고정해서 판정함
  const pageTouchStart = useRef(null)
  const pageSwipeAxis = useRef(null)
  const pageIndex = TABS.findIndex((tab) => tab.key === page)

  function handlePageTouchStart(e) {
    const t = e.touches[0]
    pageTouchStart.current = { x: t.clientX, y: t.clientY }
    pageSwipeAxis.current = null
  }

  function handlePageTouchMove(e) {
    if (!pageTouchStart.current || pageSwipeAxis.current) return
    const t = e.touches[0]
    const dx = t.clientX - pageTouchStart.current.x
    const dy = t.clientY - pageTouchStart.current.y
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
    pageSwipeAxis.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
  }

  function handlePageTouchEnd(e) {
    if (!pageTouchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - pageTouchStart.current.x
    const wasHorizontal = pageSwipeAxis.current === 'horizontal'
    pageTouchStart.current = null
    pageSwipeAxis.current = null

    if (!wasHorizontal || Math.abs(dx) < 60) return

    const nextIndex = dx < 0 ? pageIndex + 1 : pageIndex - 1
    if (nextIndex >= 0 && nextIndex < TABS.length) {
      setPage(TABS[nextIndex].key)
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-[var(--color-app-bg)] text-[var(--color-text)]">
      <header className="flex flex-none items-center gap-3 px-4 pt-6 pb-2">
        <img
          src={`${import.meta.env.BASE_URL}emblem.png`}
          alt="SRG-FC 엠블럼"
          className="h-12 w-12 flex-none object-contain"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">SRG-FC</h1>
          <p className="text-sm text-[var(--color-text-muted)]">새릉골 풋살 동호회</p>
        </div>
        {session ? (
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="flex-none rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)]"
          >
            {myMember ? myMember.name : session.user.email.split('@')[0]}
            {isAdmin ? ' (관리자)' : ''}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="flex-none rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)]"
          >
            로그인
          </button>
        )}
      </header>

      <nav className="flex flex-none border-b border-[var(--color-border)] px-4 pt-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setPage(tab.key)}
            className={`flex-1 border-b-2 pb-2 text-sm font-semibold transition-colors ${
              page === tab.key
                ? 'border-accent-400 text-[var(--color-text)]'
                : 'border-transparent text-[var(--color-text-faint)] hover:text-[var(--color-text-soft)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {showLoader && <p className="px-4 py-16 text-center text-[var(--color-text-muted)]">불러오는 중...</p>}
      {showError && <p className="px-4 py-16 text-center text-red-400">멤버 정보를 불러오지 못했어요. 새로고침 해주세요.</p>}

      {/* transform은 조상에 걸리면 하위의 position:fixed 모달들이 뷰포트가 아니라
          이 요소를 기준으로 배치되어버리는 CSS 부작용이 있어서, 슬라이드는 transform이 아니라
          left로 애니메이션함 (left는 그런 부작용이 없음) */}
      {!showLoader && !showError && (
        <div className="flex-1 overflow-hidden">
          <div
            className="relative flex h-full w-[400%] transition-[left] duration-300 ease-out"
            style={{ left: `-${pageIndex * 100}%` }}
            onTouchStart={handlePageTouchStart}
            onTouchMove={handlePageTouchMove}
            onTouchEnd={handlePageTouchEnd}
          >
            <div data-scroll-page className="h-full w-[25%] flex-none overflow-y-auto overscroll-contain">
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
            <div data-scroll-page className="h-full w-[25%] flex-none overflow-y-auto overscroll-contain">
              <TeamBuilderPage members={members} />
            </div>
            <div data-scroll-page className="h-full w-[25%] flex-none overflow-y-auto overscroll-contain">
              <BoardPage
                members={members}
                session={session}
                isAdmin={isAdmin}
                canPostNotice={canPostNotice}
                onRequireLogin={() => setShowAuth(true)}
              />
            </div>
            <div data-scroll-page className="h-full w-[25%] flex-none overflow-y-auto overscroll-contain">
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
                locations={eventLocations}
                onCreateEvent={createEventAndRefetchLocations}
                onUpdateEvent={updateEventAndRefetchLocations}
                onDeleteEvent={deleteEvent}
                onSetEventConfirmed={setEventConfirmed}
                onSaveEventTeams={saveEventTeams}
                onResetEventTeams={resetEventTeams}
                onCastVote={castVote}
                onRetractVote={retractVote}
              />
            </div>
          </div>
        </div>
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
          accentTheme={accentTheme}
          onChangeAccentTheme={changeAccentTheme}
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
