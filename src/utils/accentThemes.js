// 어두운 배경(다크 전용으로 전환 — 라이트 모드는 제거)에서 쓰는 회색조 값들
const DARK_NEUTRALS = {
  text: '#ffffff',
  textSoft: '#cbd5e1',
  textMuted: '#94a3b8',
  textFaint: '#64748b',
  sheet: '#1e293b',
  surface: 'rgba(30,41,59,0.6)',
  surfaceSoft: 'rgba(255,255,255,0.1)',
  surfaceSoftHover: 'rgba(255,255,255,0.2)',
  surfaceFaint: 'rgba(255,255,255,0.05)',
  surfaceStrong: 'rgba(255,255,255,0.7)',
  border: 'rgba(255,255,255,0.1)',
  borderStrong: 'rgba(255,255,255,0.25)',
  backdrop: 'rgba(0,0,0,0.6)',
  backdropStrong: 'rgba(0,0,0,0.8)',
}

// accent는 버튼/포인트 색상
const EMERALD_ACCENT = { 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 950: '#022c22' }
const BLUE_ACCENT = { 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 950: '#172554' }
// 동호회 유니폼 실제 색상(메인 핑크/어깨 라이트핑크/로고 트림 블랙) 그대로 가져다 씀
const PINK_ACCENT = { 200: '#F7E8F0', 300: '#F2DCE8', 400: '#EAC0D8', 500: '#D98CB3', 950: '#1A161C' }

// 라이트 모드는 제거(흰/옅은 배경에서 포인트 색/테두리 대비가 약해 보인다는 피드백으로 폐기),
// 다크 테마 3종(그린/블루/핑크)만 유지
export const ACCENT_THEMES = {
  emerald: { label: '에메랄드', bg: '#0f172a', accent: EMERALD_ACCENT, ...DARK_NEUTRALS },
  blue: { label: '블루', bg: '#0e1a2e', accent: BLUE_ACCENT, ...DARK_NEUTRALS },
  // 배경은 그린/블루와 똑같이 색빛 안 도는 중립 남색 톤 유지. 이전 값(#13111a)은 RGB 채널 차이가
  // 작아서(파랑-빨강 차=7) 무채색에 가까웠고, 그래서 옆의 핑크 포인트 색 때문에 오히려 붉게 보였음.
  // 그린/블루(파랑-빨강 차=27~32)만큼 파란 쪽으로 확실히 치우친 값으로 수정 — 포인트 색만 핑크로 도드라지게 함
  pink: { label: '핑크', bg: '#10152b', accent: PINK_ACCENT, ...DARK_NEUTRALS },
}

export const DEFAULT_ACCENT_THEME = 'emerald'
