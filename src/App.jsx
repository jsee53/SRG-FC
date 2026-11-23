import { useEffect, useMemo, useRef, useState } from 'react'
import RankingPage from './pages/RankingPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import BoardPage from './pages/BoardPage'
import SchedulePage from './pages/SchedulePage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AuthForm, { PENDING_CLAIM_KEY } from './components/AuthForm'
import MaintenancePage from './components/MaintenancePage'
import { useMembers } from './hooks/useMembers'
import { useAuth } from './hooks/useAuth'
import { useEvents } from './hooks/useEvents'
import { useEventLocations } from './hooks/useEventLocations'
import { useBestPlayerVotes } from './hooks/useBestPlayerVotes'
import { useAccentTheme } from './hooks/useAccentTheme'
import { useAppSettings } from './hooks/useAppSettings'

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
    refetch: refetchMembers,
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
    refetch: refetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setEventConfirmed,
    addMatch,
    saveMatchParticipants,
    moveAttendeeTeam,
    resetMatchTeams,
    deleteMatch,
  } = useEvents()
  const { locations: eventLocations, refetchLocations } = useEventLocations()
  const { votes, castVote, retractVote, refetch: refetchVotes } = useBestPlayerVotes()
  const { theme: accentTheme, changeTheme: changeAccentTheme } = useAccentTheme()
  const { settings: appSettings, setSetting: setAppSetting, refetch: refetchSettings } = useAppSettings()
  const equalMode = appSettings.equal_mode === true
  const teamPins = appSettings.team_pins ?? {}
  const maintenanceMode = appSettings.maintenance_mode === true

  const [refreshing, setRefreshing] = useState(false)

  async function refetchAll() {
    await Promise.all([refetchMembers(), refetchEvents(), refetchLocations(), refetchVotes(), refetchSettings()])
  }

  async function handleManualRefresh() {
    setRefreshing(true)
    await refetchAll()
    setRefreshing(false)
  }

  // PWA는 새로고침 제스처가 없어서 재진입 시 실패했거나 오래된 데이터를 다시 불러옴
  useEffect(() => {
    function handleWake() {
      if (document.visibilityState === 'visible') refetchAll()
    }
    document.addEventListener('visibilitychange', handleWake)
    window.addEventListener('focus', handleWake)
    return () => {
      document.removeEventListener('visibilitychange', handleWake)
      window.removeEventListener('focus', handleWake)
    }
  }, [])

  async function toggleEqualMode() {
    await setAppSetting('equal_mode', !equalMode)
  }

  async function toggleMaintenanceMode() {
    await setAppSetting('maintenance_mode', !maintenanceMode)
  }

  // 고정 배정은 누가 팀을 나누든 같게 적용돼야 해서 app_settings에 저장
  async function updateTeamPin(key, teamIndex) {
    const next = { ...teamPins }
    if (teamIndex == null) delete next[key]
    else next[key] = teamIndex
    await setAppSetting('team_pins', next)
  }

  async function clearTeamPins() {
    await setAppSetting('team_pins', {})
  }

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

  // 성사된 경기의 참석자만 참석 횟수로 집계
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

  // 참석률 표시용 분모(성사된 경기 수)
  const totalConfirmedEvents = useMemo(() => events.filter((e) => e.confirmed).length, [events])

  // 팀별 최다 득표자를 POM으로 보고 받은 횟수 집계
  const bestPlayerCountByMemberId = useMemo(() => {
    const attendeeById = new Map()
    for (const event of events) {
      for (const attendee of event.attendees) attendeeById.set(attendee.id, attendee)
    }

    const tallyByGroup = new Map()
    for (const vote of votes) {
      const key = `${vote.matchId}-${vote.teamIndex}`
      const tally = tallyByGroup.get(key) ?? new Map()
      tally.set(vote.votedAttendeeId, (tally.get(vote.votedAttendeeId) ?? 0) + 1)
      tallyByGroup.set(key, tally)
    }

    // 최다 득표자가 1~2명이면 모두 POM, 3명 이상 동률이면 그 팀은 POM 없음
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

  // 이메일 확인 가입은 로그인 시점에 세션이 생겨서 여기서 예약된 멤버 연결 처리
  // claim 실패는 재시도해도 같으므로 결과와 무관하게 예약 키 삭제 (내 정보에서 재선택 가능)
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

  // 탭 좌우 스와이프. 세로 스크롤 중 오판 방지를 위해 초반 10px에서 방향 고정
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
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-[var(--color-app-bg)] text-[var(--color-text)]">
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
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={refreshing}
          aria-label="새로고침"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-surface-soft)] text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] disabled:opacity-40"
        >
          <span className={`inline-block ${refreshing ? 'animate-spin' : ''}`}>↻</span>
        </button>
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

      {maintenanceMode && !isAdmin ? (
        <MaintenancePage />
      ) : (
        <>
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
          {showError && (
            <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
              <p className="text-red-400">멤버 정보를 불러오지 못했어요.</p>
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="rounded-full bg-accent-400 px-4 py-2 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300 disabled:opacity-40"
              >
                {refreshing ? '다시 시도 중...' : '다시 시도'}
              </button>
            </div>
          )}

      {/* 조상에 transform이 있으면 하위 position:fixed 모달이 뷰포트 기준이 아니게 돼서 left로 애니메이션 */}
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
                equalMode={equalMode}
                onSaveMember={updateMember}
                onAddMember={addMember}
                onDeleteMember={deleteMember}
                onSaveMemberStats={updateMemberStats}
                attendanceCountByMemberId={attendanceCountByMemberId}
                totalConfirmedEvents={totalConfirmedEvents}
                bestPlayerCountByMemberId={bestPlayerCountByMemberId}
              />
            </div>
            <div data-scroll-page className="h-full w-[25%] flex-none overflow-y-auto overscroll-contain">
              <TeamBuilderPage members={members} equalMode={equalMode} pins={teamPins} />
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
                equalMode={equalMode}
                teamPins={teamPins}
                onCreateEvent={createEventAndRefetchLocations}
                onUpdateEvent={updateEventAndRefetchLocations}
                onDeleteEvent={deleteEvent}
                onSetEventConfirmed={setEventConfirmed}
                onAddMatch={addMatch}
                onSaveMatchParticipants={saveMatchParticipants}
                onMoveAttendee={moveAttendeeTeam}
                onResetMatchTeams={resetMatchTeams}
                onDeleteMatch={deleteMatch}
                onCastVote={castVote}
                onRetractVote={retractVote}
                onRetry={refetchEvents}
              />
            </div>
          </div>
        </div>
      )}
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
        <AdminPage
          members={members}
          equalMode={equalMode}
          onToggleEqualMode={toggleEqualMode}
          maintenanceMode={maintenanceMode}
          onToggleMaintenanceMode={toggleMaintenanceMode}
          teamPins={teamPins}
          onChangeTeamPin={updateTeamPin}
          onClearTeamPins={clearTeamPins}
          onClose={() => setShowAdminPage(false)}
          onUnlinkMember={unlinkMember}
        />
      )}
    </div>
  )
}

export default App
