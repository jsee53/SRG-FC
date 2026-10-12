import { useState } from 'react'

// 이메일은 members 테이블에서 더 이상 공개 조회가 안 되므로(보안 수정으로 컬럼 접근 차단),
// 관리자 전용 RPC(admin_list_accounts)로 받아온 accounts 목록에서 찾아와 보여줌
export default function LinkedAccountsSection({ members, accounts, onUnlink }) {
  const [pendingId, setPendingId] = useState(null)

  function emailOf(member) {
    return accounts.find((a) => a.memberId === member.id)?.email
  }

  async function handleUnlink(member) {
    if (!window.confirm(`${member.name}님의 계정 연결을 끊을까요? (${emailOf(member) ?? '이메일 확인 불가'})`)) return
    setPendingId(member.id)
    await onUnlink(member.id)
    setPendingId(null)
  }

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-soft)]">계정 연결 관리</h3>
      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-surface-faint)] p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text)]">{member.name}</p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">{emailOf(member) ?? '연결 안 됨'}</p>
            </div>
            {member.userId && (
              <button
                type="button"
                onClick={() => handleUnlink(member)}
                disabled={pendingId === member.id}
                className="flex-none rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-xs text-[var(--color-text-soft)] transition-colors hover:bg-red-400 hover:text-red-950 disabled:opacity-40"
              >
                {pendingId === member.id ? '해제 중...' : '연결 해제'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
