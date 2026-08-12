import { useState } from 'react'
import { STAT_LABELS } from '../utils/tierStyles'
import { TIER_ORDER } from '../utils/tier'
import { ROLE_LABELS } from '../utils/roles'

const POSITION_OPTIONS = ['GK', 'DF', 'MF', 'FW']

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      {children}
    </label>
  )
}

const inputClass =
  'rounded-lg bg-white/10 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400'

export default function MemberEditForm({ member, onClose, onSave }) {
  const [form, setForm] = useState({
    name: member.name,
    number: member.number ?? '',
    birthYear: member.birthYear,
    positions: member.positions,
    tier: member.tier,
    rank: member.rank,
    photo: member.photo ?? '',
    intro: member.intro ?? '',
    role: member.role ?? '',
    stats: { ...member.stats },
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function togglePosition(pos) {
    setForm((prev) => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter((p) => p !== pos)
        : [...prev.positions, pos],
    }))
  }

  function updateStat(key, value) {
    setForm((prev) => ({ ...prev, stats: { ...prev.stats, [key]: Number(value) } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: saveError } = await onSave(member.id, {
      name: form.name,
      number: form.number === '' ? null : Number(form.number),
      birthYear: Number(form.birthYear),
      positions: form.positions,
      tier: form.tier,
      rank: Number(form.rank),
      photo: form.photo,
      intro: form.intro,
      role: form.role === '' ? null : form.role,
      stats: form.stats,
    })

    setSubmitting(false)
    if (saveError) {
      setError('저장에 실패했어요. 다시 시도해주세요.')
      return
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 [animation:overlay-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-800 p-5 pb-8 [animation:sheet-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{member.name} 정보 수정</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="이름">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </Field>
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
            <Field label="티어">
              <select
                className={inputClass}
                value={form.tier}
                onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))}
              >
                {TIER_ORDER.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="같은 티어 안 등수">
              <input
                type="number"
                className={inputClass}
                value={form.rank}
                onChange={(e) => setForm((p) => ({ ...p, rank: e.target.value }))}
                required
              />
            </Field>
            <Field label="직책 칭호">
              <select
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="">없음</option>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
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

          <Field label="사진 URL (없으면 빈칸)">
            <input
              className={inputClass}
              value={form.photo}
              onChange={(e) => setForm((p) => ({ ...p, photo: e.target.value }))}
            />
          </Field>

          <Field label="한줄평 (상세보기에서만 표시)">
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={form.intro}
              onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
            />
          </Field>

          <div>
            <p className="mb-2 text-xs text-slate-400">능력치 (0~99)</p>
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
            className="mt-1 rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>
    </div>
  )
}
