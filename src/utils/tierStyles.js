export const TIER_STYLES = {
  S: { badge: 'bg-gradient-to-r from-amber-300 via-white to-amber-400 text-amber-950', ring: 'ring-amber-400/60', glow: 'from-amber-500/30', accent: '#fbbf24' },
  A: { badge: 'bg-gradient-to-r from-violet-300 via-white to-violet-400 text-violet-950', ring: 'ring-violet-400/60', glow: 'from-violet-500/30', accent: '#c084fc' },
  B: { badge: 'bg-gradient-to-r from-sky-300 via-white to-sky-400 text-sky-950', ring: 'ring-sky-400/60', glow: 'from-sky-500/30', accent: '#38bdf8' },
  C: { badge: 'bg-gradient-to-r from-emerald-300 via-white to-emerald-400 text-emerald-950', ring: 'ring-emerald-400/60', glow: 'from-emerald-500/30', accent: '#34d399' },
  D: { badge: 'bg-gradient-to-r from-cyan-300 via-white to-cyan-400 text-cyan-950', ring: 'ring-cyan-400/60', glow: 'from-cyan-500/30', accent: '#22d3ee' },
}

// 평등 모드일 때 S급 외 멤버에게 실제 등급 대신 보여주는 가상의 등급(실 데이터는 안 바꿈).
// 기존 5개 등급 색과 안 헷갈리게 무채색 계열로 따로 두되, S급(금색)보다 튀면 안 되니까
// 따뜻한 금색 대신 차가운 실버/플래티넘 샤인 톤으로 가라앉힘
export const DISTORTED_TIER_LABEL = 'DISTORTED'
export const DISTORTED_TIER_STYLE = {
  badge: 'bg-gradient-to-r from-slate-300 via-white to-slate-400 text-slate-900',
  ring: 'ring-slate-300/60',
  glow: 'from-slate-300/30',
  accent: '#cbd5e1',
}

// 이름순 정렬은 등급(순위) 기준이 아니라 그냥 명단이라서, 사람마다 다른 등급색 대신
// 동호회 유니폼 색(핑크 몸판 + 차콜 로고)으로 카드를 통일해서 "우리 팀 명단" 느낌을 줌.
// 등급 배지는 색은 통일하되 글자는 긴 이름 대신 원래 알파벳(S/A/B/C/D)만 남김
export const UNIFORM_STYLE = {
  badge: 'bg-[#EAC0D8] text-[#1A161C]',
  ring: 'ring-[#EAC0D8]/75',
  glow: 'from-[#F2DCE8]/55',
  accent: '#EAC0D8',
}

export const STAT_LABELS = {
  passing: '패스',
  dribbling: '드리블',
  physical: '피지컬',
  defense: '수비',
  stamina: '활동량',
  finishing: '슛',
}
