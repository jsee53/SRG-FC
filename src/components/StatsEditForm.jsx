import { useRef, useState } from 'react'
import { STAT_LABELS } from '../utils/tierStyles'
import { TIER_ORDER, TIER_NAMES } from '../utils/tier'
import { Field, inputClass, Select } from './memberFormFields'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'

export default function StatsEditForm({ member, onClose, onSave }) {
  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const sheetRef = useRef(null)
  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = useSwipeToClose(sheetRef, requestClose)
  const [tier, setTier] = useState(member.tier)
  const [stats, setStats] = useState({ ...member.stats })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateStat(key, value) {
    setStats((prev) => ({ ...prev, [key]: Number(value) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: saveError } = await onSave(member.id, tier, stats)

    setSubmitting(false)
    if (saveError) {
      setError('저장에 실패했어요. 다시 시도해주세요.')
      return
    }
    requestClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-backdrop)] ${
        closing ? '[animation:overlay-out_0.22s_ease-in_forwards]' : '[animation:overlay-in_0.2s_ease-out]'
      }`}
      onClick={requestClose}
    >
      <div
        ref={sheetRef}
        className={`max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--color-sheet)] p-5 pb-8 ${
          closing
            ? '[animation:sheet-out_0.22s_cubic-bezier(0.32,0.72,0,1)_forwards]'
            : '[animation:sheet-in_0.32s_cubic-bezier(0.32,0.72,0,1)]'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{member.name} 등급/능력치 수정</h2>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] hover:text-[var(--color-text)]"
          >
            닫기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field label="등급">
            <Select value={tier} onChange={(e) => setTier(e.target.value)}>
              {TIER_ORDER.map((t) => (
                <option key={t} value={t}>
                  {TIER_NAMES[t]}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <p className="mb-2 text-xs text-[var(--color-text-muted)]">능력치 (0~99)</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(STAT_LABELS).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    className={inputClass}
                    value={stats[key]}
                    onChange={(e) => updateStat(key, e.target.value)}
                  />
                </Field>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full bg-accent-400 py-2.5 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300 disabled:opacity-40"
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>
    </div>
  )
}
