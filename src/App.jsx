import { useState } from 'react'
import RankingPage from './pages/RankingPage'
import TeamBuilderPage from './pages/TeamBuilderPage'

const TABS = [
  { key: 'ranking', label: '랭킹' },
  { key: 'teams', label: '팀 짜기' },
]

function App() {
  const [page, setPage] = useState('ranking')

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-900 text-white">
      <header className="flex items-center gap-3 px-4 pt-6 pb-2">
        <img
          src={`${import.meta.env.BASE_URL}emblem.png`}
          alt="SRG-FC 엠블럼"
          className="h-12 w-12 flex-none object-contain"
        />
        <div>
          <h1 className="text-2xl font-bold">SRG-FC</h1>
          <p className="text-sm text-slate-400">새릉골 풋살 동호회</p>
        </div>
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

      <div className={page === 'ranking' ? '' : 'hidden'}>
        <RankingPage />
      </div>
      <div className={page === 'teams' ? '' : 'hidden'}>
        <TeamBuilderPage />
      </div>
    </div>
  )
}

export default App
