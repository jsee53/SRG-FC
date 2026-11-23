import { pinKey } from '../utils/teamBuilder'

// 팀 고정 배정 편집. 고정 인원 외 나머지는 팀 나누기 알고리즘이 채움
export default function TeamPinEditor({ entries, teamCount, pins, onChangePin, onClearAll, clearing }) {
  if (entries.length === 0) return null
  const hasPins = Object.keys(pins).length > 0

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-text-soft)]">팀 고정 배정 (선택, 관리자용)</h2>
        {hasPins && (
          <button
            type="button"
            onClick={onClearAll}
            disabled={clearing}
            className="flex-none text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:text-red-300 disabled:opacity-40"
          >
            {clearing ? '초기화 중...' : '전체 초기화'}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {entries.map((entry) => {
          const key = pinKey(entry)
          const pinned = pins[key] ?? null
          const label = entry.isMercenary ? entry.label : entry.name

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2 rounded-lg bg-[var(--color-surface-soft)] px-3 py-1.5"
            >
              <span className="truncate text-sm">{label}</span>
              <div className="flex flex-none gap-1">
                <button
                  type="button"
                  onClick={() => onChangePin(key, null)}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                    pinned == null
                      ? 'bg-accent-400 text-accent-950'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft-hover)]'
                  }`}
                >
                  미지정
                </button>
                {Array.from({ length: teamCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChangePin(key, i)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                      pinned === i
                        ? 'bg-accent-400 text-accent-950'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft-hover)]'
                    }`}
                  >
                    {i + 1}팀
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
