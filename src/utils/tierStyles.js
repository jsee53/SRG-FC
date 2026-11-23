export const TIER_STYLES = {
  S: { badge: 'bg-gradient-to-r from-amber-300 via-white to-amber-400 text-amber-950', ring: 'ring-amber-400/60', glow: 'from-amber-500/30', accent: '#fbbf24' },
  A: { badge: 'bg-gradient-to-r from-violet-300 via-white to-violet-400 text-violet-950', ring: 'ring-violet-400/60', glow: 'from-violet-500/30', accent: '#c084fc' },
  B: { badge: 'bg-gradient-to-r from-sky-300 via-white to-sky-400 text-sky-950', ring: 'ring-sky-400/60', glow: 'from-sky-500/30', accent: '#38bdf8' },
  C: { badge: 'bg-gradient-to-r from-emerald-300 via-white to-emerald-400 text-emerald-950', ring: 'ring-emerald-400/60', glow: 'from-emerald-500/30', accent: '#34d399' },
  D: { badge: 'bg-gradient-to-r from-cyan-300 via-white to-cyan-400 text-cyan-950', ring: 'ring-cyan-400/60', glow: 'from-cyan-500/30', accent: '#22d3ee' },
}

// 평등 모드에서 S급 외 멤버에게 보여주는 가상 등급 (실 데이터는 그대로)
// 기존 등급색과 구분되고 S급 금색보다 튀지 않게 차가운 실버 톤
export const DISTORTED_TIER_LABEL = 'DISTORTED'
export const DISTORTED_TIER_STYLE = {
  badge: 'bg-gradient-to-r from-slate-300 via-white to-slate-400 text-slate-900',
  ring: 'ring-slate-300/60',
  glow: 'from-slate-300/30',
  accent: '#cbd5e1',
}

// 이름순은 명단이라 등급색 대신 유니폼 메인 핑크(#EAC0D8)로 통일
// 배지는 색만 통일하고 글자는 알파벳(S/A/B/C/D)
export const UNIFORM_STYLE = {
  badge: 'bg-[#EAC0D8] text-[#1A161C]',
  ring: 'ring-[#EAC0D8]/75',
  glow: 'from-[#EAC0D8]/85',
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
