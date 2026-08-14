import { useRef, useState } from 'react'
import { STAT_LABELS } from '../utils/tierStyles'
import { TIER_ORDER, TIER_NAMES } from '../utils/tier'
import { ROLE_LABELS } from '../utils/roles'
import { Field, inputClass, MemberBasicFields, Select } from './memberFormFields'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'

const EMPTY_STATS = Object.fromEntries(Object.keys(STAT_LABELS).map((key) => [key, 60]))

export default function AddMemberForm({ onClose, onAdd }) {
  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const sheetRef = useRef(null)
  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = useSwipeToClose(sheetRef, requestClose)
  const [form, setForm] = useState({
    name: '',
    number: '',
    birthYear: '',
    positions: [],
    tier: TIER_ORDER[TIER_ORDER.length - 1],
    intro: '',
    role: '',
    stats: { ...EMPTY_STATS },
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateStat(key, value) {
    setForm((prev) => ({ ...prev, stats: { ...prev.stats, [key]: Number(value) } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: addError } = await onAdd({
      name: form.name,
      number: form.number === '' ? null : Number(form.number),
      birthYear: Number(form.birthYear),
      positions: form.positions,
      tier: form.tier,
      intro: form.intro,
      role: form.role === '' ? null : form.role,
      stats: form.stats,
    })

    setSubmitting(false)
    if (addError) {
      setError('추가에 실패했어요. 다시 시도해주세요.')
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
          <h2 className="text-lg font-bold">새 멤버 추가</h2>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] hover:text-[var(--color-text)]"
          >
            닫기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <MemberBasicFields form={form} setForm={setForm} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="티어">
              <Select value={form.tier} onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))}>
                {TIER_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {TIER_NAMES[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="직책 칭호">
              <Select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="">없음</option>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="한줄평 (상세보기에서만 표시)">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.intro}
              onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
            />
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
                    value={form.stats[key]}
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
            {submitting ? '추가 중...' : '추가'}
          </button>
        </form>
      </div>
    </div>
  )
}
