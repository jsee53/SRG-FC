import { useState } from 'react'
import RankingPage from './pages/RankingPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import WaterRunnerCard from './components/WaterRunnerCard'

const TABS = [
  { key: 'ranking', label: '랭킹' },
  { key: 'teams', label: '팀 짜기' },
]

function App() {
  const [page, setPage] = useState('ranking')
  const [rankingCandidates, setRankingCandidates] = useState([])
  const [teamCandidates, setTeamCandidates] = useState([])

  const sideCandidates = page === 'ranking' ? rankingCandidates : teamCandidates
  const sideTitle = page === 'ranking' ? '물 사올 사람 추천' : '물 사올 사람 추천'
  const sideDescription = page === 'ranking'
    ? '현재 랭킹 목록 기준으로 자동으로 한 명을 추천해 드려요.'
    : '참석자와 용병 목록을 기준으로 자동으로 한 명을 추천해 드려요.'

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-slate-900 text-white">
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

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className={page === 'ranking' ? '' : 'hidden'}>
            <RankingPage onCandidatesChange={setRankingCandidates} />
          </div>
          <div className={page === 'teams' ? '' : 'hidden'}>
            <TeamBuilderPage onCandidatesChange={setTeamCandidates} />
          </div>
        </div>

        {page === 'teams' && (
          <aside className="border-t border-white/10 px-4 py-4 lg:border-t-0 lg:border-l lg:px-4 lg:py-6">
            <div className="lg:sticky lg:top-4">
              <WaterRunnerCard title={sideTitle} description={sideDescription} candidates={sideCandidates} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default App
