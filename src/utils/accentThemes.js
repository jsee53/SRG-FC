// 다크 배경용 회색조
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
// 동호회 유니폼 색 (메인 핑크/어깨 라이트핑크/로고 블랙)
const PINK_ACCENT = { 200: '#F7E8F0', 300: '#F2DCE8', 400: '#EAC0D8', 500: '#D98CB3', 950: '#1A161C' }

// 다크 테마 3종 (그린/블루/핑크)
export const ACCENT_THEMES = {
  emerald: { label: '에메랄드', bg: '#0f172a', accent: EMERALD_ACCENT, ...DARK_NEUTRALS },
  blue: { label: '블루', bg: '#0e1a2e', accent: BLUE_ACCENT, ...DARK_NEUTRALS },
  // 배경은 그린/블루처럼 파란 쪽 남색. 무채색에 가까우면 핑크 포인트 옆에서 붉게 보임
  pink: { label: '핑크', bg: '#10152b', accent: PINK_ACCENT, ...DARK_NEUTRALS },
}

export const DEFAULT_ACCENT_THEME = 'emerald'
