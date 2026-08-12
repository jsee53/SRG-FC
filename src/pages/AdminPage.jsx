import LinkedAccountsSection from '../components/LinkedAccountsSection'
import AccountsSection from '../components/AccountsSection'
import { useAccounts } from '../hooks/useAccounts'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'

export default function AdminPage({ members, onClose, onUnlinkMember }) {
  useLockBodyScroll()
  const {
    accounts,
    loading,
    error,
    grantEventManager,
    revokeEventManager,
    grantNoticeManager,
    revokeNoticeManager,
    grantStatsManager,
    revokeStatsManager,
  } = useAccounts()

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
          <h2 className="text-lg font-bold">관리자 도구</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          <LinkedAccountsSection members={members} onUnlink={onUnlinkMember} />
          <AccountsSection
            accounts={accounts}
            loading={loading}
            error={error}
            onGrantEvent={grantEventManager}
            onRevokeEvent={revokeEventManager}
            onGrantNotice={grantNoticeManager}
            onRevokeNotice={revokeNoticeManager}
            onGrantStats={grantStatsManager}
            onRevokeStats={revokeStatsManager}
          />
        </div>
      </div>
    </div>
  )
}
