import { useEffect, useMemo, useState } from 'react'
import { drawTodayWaterRunner, getTodayWaterRunner } from '../utils/waterRunnerDaily'

export default function WaterRunnerCard({ title, description, candidates }) {
  const [todayRecord, setTodayRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadToday() {
      setIsLoading(true)
      setError('')

      try {
        const record = await getTodayWaterRunner()
        if (!cancelled) {
          setTodayRecord(record)
        }
      } catch {
        if (!cancelled) {
          setError('오늘 추천 결과를 불러오지 못했어요.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadToday()
    return () => {
      cancelled = true
    }
  }, [])

  const availableCandidates = useMemo(() => (candidates ?? []).filter(Boolean), [candidates])
  const recommendedMember =
    availableCandidates.find((member) => String(member.id) === todayRecord?.winnerId) ?? null
  const winnerLabel =
    todayRecord?.winnerName ?? recommendedMember?.name ?? recommendedMember?.label ?? '아직 추천된 사람이 없어요'
  const canDraw = !isLoading && !isDrawing && !todayRecord && availableCandidates.length > 0

  async function handleRecommend() {
    if (!canDraw) return
    setIsDrawing(true)
    setError('')

    try {
      const record = await drawTodayWaterRunner(availableCandidates)
      setTodayRecord(record)
    } catch {
      setError('추천 생성에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsDrawing(false)
    }
  }

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-emerald-200">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-emerald-100/80">{description}</p>
        </div>
        {todayRecord?.mode === 'local' && (
          <span className="rounded-full border border-amber-300/40 bg-amber-300/15 px-2.5 py-1 text-[11px] font-medium text-amber-100">
            데모 모드
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-950/40 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/70">오늘의 물 담당</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">
            {isLoading ? '불러오는 중...' : winnerLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRecommend}
          disabled={!canDraw}
          className="rounded-full bg-emerald-400 px-3.5 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isDrawing ? '추천 중...' : '오늘 추천 실행'}
        </button>
      </div>

      {todayRecord && (
        <p className="mt-2 text-xs text-emerald-100/80">오늘은 이미 추천이 확정되어 추가 실행할 수 없어요.</p>
      )}

      {error && <p className="mt-2 text-xs text-rose-200/90">{error}</p>}

      {availableCandidates.length === 0 && (
        <p className="mt-2 text-xs text-emerald-100/70">추천할 대상이 아직 없어요. 참석자를 먼저 선택해 주세요.</p>
      )}

      {todayRecord?.mode === 'local' && (
        <p className="mt-2 text-xs text-amber-100/90">공유 DB 미연동 상태라 현재 브라우저에서만 오늘 결과가 유지됩니다.</p>
      )}
    </div>
  )
}
