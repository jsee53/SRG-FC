export const TIER_STYLES = {
  S: { badge: 'bg-amber-400 text-amber-950', ring: 'ring-amber-400/60', glow: 'from-amber-500/20', accent: '#fbbf24' },
  A: { badge: 'bg-violet-400 text-violet-950', ring: 'ring-violet-400/60', glow: 'from-violet-500/20', accent: '#c084fc' },
  B: { badge: 'bg-sky-400 text-sky-950', ring: 'ring-sky-400/60', glow: 'from-sky-500/20', accent: '#38bdf8' },
  C: { badge: 'bg-emerald-400 text-emerald-950', ring: 'ring-emerald-400/60', glow: 'from-emerald-500/20', accent: '#34d399' },
  D: { badge: 'bg-cyan-400 text-cyan-950', ring: 'ring-cyan-400/60', glow: 'from-cyan-500/20', accent: '#22d3ee' },
}

// 평등 모드일 때 S급 외 멤버에게 실제 등급 대신 보여주는 가상의 등급(실 데이터는 안 바꿈).
// 기존 5개 등급 색과 안 헷갈리게 무채색 계열로 따로 둠
export const DISTORTED_TIER_LABEL = 'DISTORTED'
export const DISTORTED_TIER_STYLE = {
  badge: 'bg-slate-400 text-slate-950',
  ring: 'ring-slate-400/60',
  glow: 'from-slate-500/20',
  accent: '#94a3b8',
}

export const STAT_LABELS = {
  passing: '패스',
  dribbling: '드리블',
  physical: '피지컬',
  defense: '수비',
  stamina: '활동량',
  finishing: '슛',
}
