import { useState } from 'react'
import { TIER_ORDER, TIER_NAMES } from '../utils/tier'
import { TIER_STYLES, DISTORTED_TIER_LABEL, DISTORTED_TIER_STYLE } from '../utils/tierStyles'

const DEFAULT_NON_S_TIER = 'C'

export default function MercenaryForm({ mercenaries, onAdd, onRemove, equalMode }) {
  const [count, setCount] = useState(1)
  const [tier, setTier] = useState('C')

  // 평등 모드에서는 S급 여부만 실력 배정에 영향을 주니, 나머지 등급을 다 보여줄 필요 없이
  // "S" / "DISTORTED" 둘 중 하나만 고르게 함
  const tierOptions = equalMode ? ['S', DEFAULT_NON_S_TIER] : TIER_ORDER

  function tierLabel(t) {
    return equalMode && t !== 'S' ? DISTORTED_TIER_LABEL : TIER_NAMES[t]
  }

  function tierStyle(t) {
    return equalMode && t !== 'S' ? DISTORTED_TIER_STYLE : TIER_STYLES[t]
  }

  return (
    <div className="px-4 py-3">
      <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-soft)]">용병 추가</h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-[var(--color-surface-soft)] px-1">
          <button
            type="button"
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
          >
            −
          </button>
          <span className="w-5 text-center text-sm">{count}</span>
          <button
            type="button"
            onClick={() => setCount((c) => Math.min(10, c + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
          >
            +
          </button>
        </div>

        <div className="flex flex-1 gap-1 overflow-x-auto">
          {tierOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`flex-none rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                tier === t ? tierStyle(t).badge : 'bg-[var(--color-surface-soft)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-soft-hover)]'
              }`}
            >
              {tierLabel(t)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onAdd(count, tier)}
          className="flex-none rounded-full bg-accent-400 px-3 py-1.5 text-sm font-medium text-accent-950 transition-colors hover:bg-accent-300"
        >
          추가
        </button>
      </div>

      {mercenaries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {mercenaries.map((merc) => (
            <span
              key={merc.id}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tierStyle(merc.tier).badge}`}
            >
              {merc.label} · {tierLabel(merc.tier)}
              <button
                type="button"
                onClick={() => onRemove(merc.id)}
                className="font-bold transition-opacity hover:opacity-60"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
