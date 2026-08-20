import { pinKey } from '../utils/teamBuilder'

// 관리자가 특정 인원을 특정 팀에 미리 고정해두는 도구. 여기서 정한 배정은 팀 나누기 알고리즘이
// 그대로 반영하고, 나머지 인원만 (평등 모드면 S급만 실력 기준/나머지 무작위, 아니면 전체 실력 기준으로) 채움
export default function TeamPinEditor({ entries, teamCount, pins, onChangePin }) {
  if (entries.length === 0) return null

  return (
    <div className="mt-4">
      <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-soft)]">팀 고정 배정 (선택, 관리자용)</h2>
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
