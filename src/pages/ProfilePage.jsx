import { useState } from 'react'
import { MemberBasicFields, Select } from '../components/memberFormFields'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'

export default function ProfilePage({
  session,
  member,
  unclaimedMembers,
  isAdmin,
  onClose,
  onSave,
  onClaim,
  onSignOut,
  onOpenAdmin,
}) {
  useLockBodyScroll()
  const [form, setForm] = useState(
    member
      ? {
          number: member.number ?? '',
          birthYear: member.birthYear,
          positions: member.positions,
        }
      : null
  )
  const [claimId, setClaimId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: saveError } = await onSave(member.id, {
      number: form.number === '' ? null : Number(form.number),
      birthYear: Number(form.birthYear),
      positions: form.positions,
    })

    setSubmitting(false)
    if (saveError) {
      setError('저장에 실패했어요. 다시 시도해주세요.')
      return
    }
    onClose()
  }

  async function handleClaim(e) {
    e.preventDefault()
    if (!claimId) return
    setSubmitting(true)
    setError('')

    const { error: claimError } = await onClaim(Number(claimId))

    setSubmitting(false)
    if (claimError) {
      setError('연결에 실패했어요. 이미 다른 계정이 선택했을 수 있어요.')
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
          <h2 className="text-lg font-bold">내 정보</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">{session.user.email}</p>

        {member ? (
          <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
            <p className="text-lg font-bold">{member.name}</p>
            <MemberBasicFields form={form} setForm={setForm} showName={false} />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleClaim} className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-slate-300">
              아직 연결된 멤버가 없어요. 로스터에서 내 이름을 선택하면 등번호/출생년도/포지션을 직접 수정할 수 있어요 (이름은 관리자만 변경 가능).
            </p>
            <Select value={claimId} onChange={(e) => setClaimId(e.target.value)}>
              <option value="">이름 선택</option>
              {unclaimedMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !claimId}
              className="mt-1 rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
            >
              {submitting ? '연결 중...' : '연결하기'}
            </button>
          </form>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="mt-4 w-full rounded-full bg-white/10 py-2 text-sm text-slate-300 transition-colors hover:bg-white/20"
          >
            관리자 도구
          </button>
        )}

        <button
          type="button"
          onClick={onSignOut}
          className="mt-2 w-full rounded-full bg-white/10 py-2 text-sm text-slate-300 transition-colors hover:bg-white/20"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
