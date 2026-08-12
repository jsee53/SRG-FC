import { useState } from 'react'
import RankingPage from './pages/RankingPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import AdminLoginForm from './components/AdminLoginForm'
import { useMembers } from './hooks/useMembers'
import { useAuth } from './hooks/useAuth'

const TABS = [
  { key: 'ranking', label: '랭킹' },
  { key: 'teams', label: '팀 짜기' },
]

function App() {
  const [page, setPage] = useState('ranking')
  const [showLogin, setShowLogin] = useState(false)
  const { members, loading, error, updateMember } = useMembers()
  const { isAdmin, signIn, signOut } = useAuth()

  const hasData = members.length > 0
  const showLoader = loading && !hasData
  const showError = Boolean(error) && !hasData

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
        {isAdmin ? (
          <button
            type="button"
            onClick={signOut}
            className="flex-none rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/20"
          >
            관리자 로그아웃
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="flex-none rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/20"
          >
            관리자
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
            <RankingPage members={members} isAdmin={isAdmin} onSaveMember={updateMember} />
          </div>
          <div className={page === 'teams' ? '' : 'hidden'}>
            <TeamBuilderPage members={members} />
          </div>
        </>
      )}

      {showLogin && <AdminLoginForm onClose={() => setShowLogin(false)} onSignIn={signIn} />}
    </div>
  )
}

export default App
