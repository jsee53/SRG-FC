import { useState } from 'react'

export default function LinkedAccountsSection({ members, onUnlink }) {
  const [pendingId, setPendingId] = useState(null)

  async function handleUnlink(member) {
    if (!window.confirm(`${member.name}님의 계정 연결을 끊을까요? (${member.linkedEmail})`)) return
    setPendingId(member.id)
    await onUnlink(member.id)
    setPendingId(null)
  }

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-slate-300">계정 연결 관리</h3>
      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{member.name}</p>
              <p className="truncate text-xs text-slate-400">{member.linkedEmail ?? '연결 안 됨'}</p>
            </div>
            {member.userId && (
              <button
                type="button"
                onClick={() => handleUnlink(member)}
                disabled={pendingId === member.id}
                className="flex-none rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-red-400 hover:text-red-950 disabled:opacity-40"
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
