// 점검 모드에서 관리자 외 사용자에게 표시. 관리자는 로그인하면 평소 화면으로 전환
export default function MaintenancePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-4xl">🛠️</span>
      <p className="text-lg font-bold text-[var(--color-text)]">점검 중이에요</p>
      <p className="text-sm text-[var(--color-text-muted)]">
        더 나은 서비스를 위해 잠시 점검하고 있어요.
        <br />
        조금만 기다려주세요!
      </p>
    </div>
  )
}
