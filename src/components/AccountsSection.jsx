import { useState } from 'react'

function PermissionToggle({ label, active, onToggle, pending }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className={`flex-none rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
        active ? 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300' : 'bg-white/10 text-slate-300 hover:bg-white/20'
      }`}
    >
      {pending ? '처리 중...' : active ? `${label} 있음` : `${label} 주기`}
    </button>
  )
}

export default function AccountsSection({
  accounts,
  loading,
  error,
  onGrantEvent,
  onRevokeEvent,
  onGrantNotice,
  onRevokeNotice,
}) {
  const [pendingKey, setPendingKey] = useState(null)

  async function handleToggleEvent(account) {
    setPendingKey(`event-${account.userId}`)
    await (account.isEventManager ? onRevokeEvent(account.userId) : onGrantEvent(account.userId))
    setPendingKey(null)
  }

  async function handleToggleNotice(account) {
    setPendingKey(`notice-${account.userId}`)
    await (account.isNoticeManager ? onRevokeNotice(account.userId) : onGrantNotice(account.userId))
    setPendingKey(null)
  }

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-slate-300">가입 계정 / 권한</h3>
      {loading && <p className="py-4 text-center text-sm text-slate-400">불러오는 중...</p>}
      {error && (
        <p className="py-4 text-center text-sm text-red-400">계정 목록을 불러오지 못했어요: {error.message}</p>
      )}
      <div className="flex flex-col gap-2">
        {accounts.map((account) => (
          <div key={account.userId} className="flex flex-col gap-2 rounded-xl bg-white/5 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{account.memberName ?? '연결 안 됨'}</p>
              <p className="truncate text-xs text-slate-400">{account.email}</p>
            </div>
            <div className="flex gap-2">
              <PermissionToggle
                label="일정 권한"
                active={account.isEventManager}
                pending={pendingKey === `event-${account.userId}`}
                onToggle={() => handleToggleEvent(account)}
              />
              <PermissionToggle
                label="공지 권한"
                active={account.isNoticeManager}
                pending={pendingKey === `notice-${account.userId}`}
                onToggle={() => handleToggleNotice(account)}
              />
            </div>
          </div>
        ))}
        {!loading && !error && accounts.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">가입된 계정이 없어요.</p>
        )}
      </div>
    </section>
  )
}
