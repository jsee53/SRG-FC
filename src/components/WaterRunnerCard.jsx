import { useEffect, useMemo, useState } from 'react'
import { pickWaterRunner } from '../utils/waterRunner'

const STORAGE_KEY = 'srgfc-water-runner-history'

export default function WaterRunnerCard({ title, description, candidates }) {
  const [recommendedId, setRecommendedId] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 8)))
    } catch {
      // ignore storage errors
    }
  }, [history])

  const availableCandidates = useMemo(() => (candidates ?? []).filter(Boolean), [candidates])
  const recommendedMember = availableCandidates.find((member) => member.id === recommendedId) ?? null

  function handleRecommend() {
    const next = pickWaterRunner(availableCandidates, history)

    if (!next) {
      setRecommendedId(null)
      return
    }

    setRecommendedId(next.id)
    setHistory((prev) => [next.id, ...prev].slice(0, 8))
  }

  function handleReset() {
    setRecommendedId(null)
    setHistory([])
  }

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-emerald-200">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-emerald-100/80">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-emerald-100/80 transition-colors hover:bg-white/10"
        >
          초기화
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-950/40 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/70">추천 결과</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">
            {recommendedMember ? recommendedMember.name : '아직 추천된 사람이 없어요'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRecommend}
          disabled={availableCandidates.length === 0}
          className="rounded-full bg-emerald-400 px-3.5 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          추천 받기
        </button>
      </div>

      {availableCandidates.length === 0 && (
        <p className="mt-2 text-xs text-emerald-100/70">추천할 대상이 아직 없어요. 참석자나 멤버를 먼저 선택해 주세요.</p>
      )}
    </div>
  )
}
