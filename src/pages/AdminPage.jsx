import { useRef, useState } from 'react'
import LinkedAccountsSection from '../components/LinkedAccountsSection'
import AccountsSection from '../components/AccountsSection'
import TeamPinEditor from '../components/TeamPinEditor'
import { useAccounts } from '../hooks/useAccounts'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'

// 팀 짜기 탭이 보통 2~3팀으로 나누니, 고정 배정도 그 범위만큼만 미리 준비해둠
// (더 많은 팀으로 나누면 그 이상 팀 번호로 고정된 사람은 자동으로 무시됨)
const MAX_PIN_TEAM_COUNT = 3

export default function AdminPage({
  members,
  equalMode,
  onToggleEqualMode,
  teamPins,
  onChangeTeamPin,
  onClearTeamPins,
  onClose,
  onUnlinkMember,
}) {
  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const sheetRef = useRef(null)
  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = useSwipeToClose(sheetRef, requestClose)
  const [togglingEqualMode, setTogglingEqualMode] = useState(false)
  const [clearingPins, setClearingPins] = useState(false)
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

  async function handleToggleEqualMode() {
    setTogglingEqualMode(true)
    await onToggleEqualMode()
    setTogglingEqualMode(false)
  }

  async function handleClearTeamPins() {
    if (!window.confirm('설정해둔 팀 고정 배정을 모두 초기화할까요?')) return
    setClearingPins(true)
    await onClearTeamPins()
    setClearingPins(false)
  }

  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

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
          <h2 className="text-lg font-bold">관리자 도구</h2>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-full bg-[var(--color-surface-soft)] px-3 py-1 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] hover:text-[var(--color-text)]"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          <div className="rounded-xl bg-[var(--color-surface-soft)] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">평등 모드</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  S급 외 능력치를 랭킹에서 숨기고, 팀 짜기는 S급만 실력 기준으로 배정하고 나머지는 무작위로 나눠요.
                  데이터는 그대로 유지되니 언제든 다시 꺼서 원래대로 되돌릴 수 있어요.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleEqualMode}
                disabled={togglingEqualMode}
                aria-pressed={equalMode}
                className={`relative h-7 w-12 flex-none overflow-hidden rounded-full transition-colors disabled:opacity-40 ${
                  equalMode ? 'bg-accent-400' : 'bg-[var(--color-surface-soft-hover)]'
                }`}
              >
                <span
                  className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-[var(--color-sheet)] transition-transform"
                  style={{ transform: equalMode ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>

          <TeamPinEditor
            entries={sortedMembers}
            teamCount={MAX_PIN_TEAM_COUNT}
            pins={teamPins}
            onChangePin={onChangeTeamPin}
            onClearAll={handleClearTeamPins}
            clearing={clearingPins}
          />

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
