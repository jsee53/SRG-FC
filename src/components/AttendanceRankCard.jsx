import { calcAge } from '../utils/age'
import Avatar from './Avatar'

// 등급 뱃지(S급=골드)와 같은 샤인 그라데이션 방식을 그대로 재사용: 1위는 골드, 나머지는 실버
const GOLD_STYLE = {
  ring: 'ring-amber-400/60',
  glow: 'from-amber-500/30',
  number: 'bg-gradient-to-r from-amber-300 via-white to-amber-400 bg-clip-text text-transparent',
  bar: 'bg-gradient-to-r from-amber-300 via-white to-amber-400',
  pill: 'bg-amber-400/15 text-amber-300',
}
const SILVER_STYLE = {
  ring: 'ring-slate-300/60',
  glow: 'from-slate-300/30',
  number: 'bg-gradient-to-r from-slate-300 via-white to-slate-400 bg-clip-text text-transparent',
  bar: 'bg-gradient-to-r from-slate-300 via-white to-slate-400',
  pill: 'bg-slate-300/15 text-slate-200',
}

export default function AttendanceRankCard({ member, rank, tied, attendanceCount, totalEvents, active, onClick }) {
  const style = rank === 1 ? GOLD_STYLE : SILVER_STYLE
  const rate = totalEvents > 0 ? Math.round((attendanceCount / totalEvents) * 100) : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 overflow-hidden rounded-2xl bg-[var(--color-surface)] p-2.5 text-left ring-1 transition-all hover:-translate-y-0.5 hover:brightness-110 ${
        active
          ? '-translate-y-1 ring-2 ring-accent-400 shadow-[0_0_0_4px_rgba(52,211,153,0.25),0_8px_20px_-4px_rgba(52,211,153,0.5)]'
          : style.ring
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent`} />

      <div className="relative flex w-10 flex-none flex-col items-center justify-center leading-none">
        <span className={`text-xl font-black ${style.number}`}>{rank}</span>
        {tied && <span className="mt-0.5 text-[9px] font-semibold text-[var(--color-text-faint)]">공동</span>}
      </div>

      <Avatar name={member.name} size="sm" />

      <div className="relative min-w-0 flex-1">
        <span className="truncate font-semibold">{member.name}</span>
        <div className="text-xs text-[var(--color-text-muted)]">
          {member.positions.join('/')} · {calcAge(member.birthYear)}세
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
          <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${rate}%` }} />
        </div>
      </div>

      <div className={`relative flex-none rounded-full px-3 py-1 text-xs font-semibold ${style.pill}`}>
        {attendanceCount}/{totalEvents}회
      </div>
    </button>
  )
}
