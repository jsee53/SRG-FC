export const POSITION_OPTIONS = ['GK', 'DF', 'MF', 'FW']

// 16px(text-base) 미만이면 iOS/Android가 이 입력칸에 포커스될 때 화면을 자동으로 확대해버려서
// (그 뒤로 비율이 깨진 것처럼 보임) 최소 16px을 유지해야 함 — text-sm(14px) 쓰지 말 것
export const inputClass =
  'rounded-lg bg-white/10 px-2.5 py-1.5 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400'

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      {children}
    </label>
  )
}

// 네이티브 select의 닫힌 상태를 다른 input들과 같은 스타일로 맞추고, 화살표는 앱 톤(slate)으로 직접 그림
export function Select({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={`w-full appearance-none pr-8 ${inputClass} ${className}`}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}

// number/birthYear/positions(+name) — 관리자 수정/추가, 본인 정보 수정에서 공통으로 쓰는 필드.
// 본인 정보 수정에서는 이름을 못 바꾸게 showName=false로 숨김(다른 멤버로 오인되는 걸 막기 위해)
export function MemberBasicFields({ form, setForm, showName = true }) {
  function togglePosition(pos) {
    setForm((prev) => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter((p) => p !== pos)
        : [...prev.positions, pos],
    }))
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {showName && (
          <Field label="이름">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </Field>
        )}
        <Field label="등번호 (없으면 빈칸)">
          <input
            type="number"
            className={inputClass}
            value={form.number}
            onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))}
          />
        </Field>
        <Field label="출생년도">
          <input
            type="number"
            className={inputClass}
            value={form.birthYear}
            onChange={(e) => setForm((p) => ({ ...p, birthYear: e.target.value }))}
            required
          />
        </Field>
      </div>

      <Field label="포지션 (여러 개 선택 가능)">
        <div className="flex gap-2">
          {POSITION_OPTIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => togglePosition(pos)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                form.positions.includes(pos) ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-slate-300'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </Field>
    </>
  )
}
