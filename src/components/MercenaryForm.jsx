import { useState } from 'react'
import { TIER_ORDER, TIER_LABELS } from '../utils/tier'
import { TIER_STYLES } from '../utils/tierStyles'

export default function MercenaryForm({ mercenaries, onAdd, onRemove }) {
  const [count, setCount] = useState(1)
  const [tier, setTier] = useState('C')

  return (
    <div className="px-4 py-3">
      <h2 className="mb-2 text-sm font-semibold text-slate-300">용병 추가</h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-1">
          <button
            type="button"
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            −
          </button>
          <span className="w-5 text-center text-sm">{count}</span>
          <button
            type="button"
            onClick={() => setCount((c) => Math.min(10, c + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            +
          </button>
        </div>

        <div className="flex flex-1 gap-1 overflow-x-auto">
          {TIER_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`flex-none rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                tier === t ? TIER_STYLES[t].badge : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onAdd(count, tier)}
          className="flex-none rounded-full bg-emerald-400 px-3 py-1.5 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-300"
        >
          추가
        </button>
      </div>

      {mercenaries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {mercenaries.map((merc) => (
            <span
              key={merc.id}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TIER_STYLES[merc.tier].badge}`}
            >
              {merc.label} · {TIER_LABELS[merc.tier]}
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
