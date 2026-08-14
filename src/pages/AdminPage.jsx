import { useRef } from 'react'
import LinkedAccountsSection from '../components/LinkedAccountsSection'
import AccountsSection from '../components/AccountsSection'
import { useAccounts } from '../hooks/useAccounts'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'

export default function AdminPage({ members, onClose, onUnlinkMember }) {
  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const sheetRef = useRef(null)
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeToClose(sheetRef, requestClose)
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
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 ${
        closing ? '[animation:overlay-out_0.22s_ease-in_forwards]' : '[animation:overlay-in_0.2s_ease-out]'
      }`}
      onClick={requestClose}
    >
      <div
        ref={sheetRef}
        className={`max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-800 p-5 pb-8 ${
          closing
            ? '[animation:sheet-out_0.22s_cubic-bezier(0.32,0.72,0,1)_forwards]'
            : '[animation:sheet-in_0.32s_cubic-bezier(0.32,0.72,0,1)]'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">관리자 도구</h2>
          <button
            type="button"
            onClick={requestClose}
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
