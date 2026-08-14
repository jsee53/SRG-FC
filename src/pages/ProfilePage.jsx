import { useRef, useState } from 'react'
import { MemberBasicFields, Select } from '../components/memberFormFields'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'
import { ACCENT_THEMES } from '../utils/accentThemes'

export default function ProfilePage({
  session,
  member,
  unclaimedMembers,
  isAdmin,
  accentTheme,
  onChangeAccentTheme,
  onClose,
  onSave,
  onClaim,
  onSignOut,
  onOpenAdmin,
}) {
  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const sheetRef = useRef(null)
  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = useSwipeToClose(sheetRef, requestClose)
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
    requestClose()
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
          <h2 className="text-lg font-bold">내 정보</h2>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] hover:text-[var(--color-text)]"
          >
            닫기
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{session.user.email}</p>

        {member ? (
          <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
            <p className="text-lg font-bold">{member.name}</p>
            <MemberBasicFields form={form} setForm={setForm} showName={false} />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-full bg-accent-400 py-2.5 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300 disabled:opacity-40"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleClaim} className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-[var(--color-text-soft)]">
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
              className="mt-1 rounded-full bg-accent-400 py-2.5 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300 disabled:opacity-40"
            >
              {submitting ? '연결 중...' : '연결하기'}
            </button>
          </form>
        )}

        <div className="mt-4">
          <p className="mb-2 text-xs text-[var(--color-text-muted)]">테마 색상</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(ACCENT_THEMES).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChangeAccentTheme(key)}
                title={t.label}
                aria-label={t.label}
                className={`relative h-9 w-9 flex-none rounded-full transition-transform ${
                  accentTheme === key ? 'scale-110' : ''
                }`}
                style={{ backgroundColor: t.accent[400], boxShadow: `0 0 0 3px ${t.bg}` }}
              >
                {accentTheme === key && (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                    style={{ color: t.accent[950] }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="mt-4 w-full rounded-full bg-[var(--color-surface-soft)] py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)]"
          >
            관리자 도구
          </button>
        )}

        <button
          type="button"
          onClick={onSignOut}
          className="mt-2 w-full rounded-full bg-[var(--color-surface-soft)] py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)]"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
