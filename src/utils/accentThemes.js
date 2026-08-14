// 어두운 배경(기존 다크모드)에서 쓰던 회색조 값들
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

// 밝은 배경(라이트 테마)에서 쓰는 값들 — 같은 역할의 변수를 반대로 뒤집은 버전
const LIGHT_NEUTRALS = {
  text: '#0f172a',
  textSoft: '#334155',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  sheet: '#ffffff',
  surface: 'rgba(15,23,42,0.05)',
  surfaceSoft: 'rgba(15,23,42,0.06)',
  surfaceSoftHover: 'rgba(15,23,42,0.12)',
  surfaceFaint: 'rgba(15,23,42,0.03)',
  surfaceStrong: 'rgba(15,23,42,0.55)',
  border: 'rgba(15,23,42,0.1)',
  borderStrong: 'rgba(15,23,42,0.2)',
  backdrop: 'rgba(15,23,42,0.35)',
  backdropStrong: 'rgba(15,23,42,0.55)',
}

// accent는 버튼/포인트 색상이라 밝기 모드와 무관하게 색상만 유지
const EMERALD_ACCENT = { 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 950: '#022c22' }
const BLUE_ACCENT = { 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 950: '#172554' }
const ROSE_ACCENT = { 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 950: '#4c0519' }

export const ACCENT_THEMES = {
  // 배경은 처음부터 정한 대로 초록빛 안 도는 중립적인 남색 톤 유지 (버튼만 초록)
  emerald: { label: '에메랄드', mode: 'dark', bg: '#0f172a', accent: EMERALD_ACCENT, ...DARK_NEUTRALS },
  'emerald-light': { label: '에메랄드 (밝게)', mode: 'light', bg: '#effdf5', accent: EMERALD_ACCENT, ...LIGHT_NEUTRALS },
  blue: { label: '블루', mode: 'dark', bg: '#0e1a2e', accent: BLUE_ACCENT, ...DARK_NEUTRALS },
  'blue-light': { label: '블루 (밝게)', mode: 'light', bg: '#eef4ff', accent: BLUE_ACCENT, ...LIGHT_NEUTRALS },
  rose: { label: '로즈', mode: 'dark', bg: '#24121a', accent: ROSE_ACCENT, ...DARK_NEUTRALS },
  'rose-light': { label: '로즈 (밝게)', mode: 'light', bg: '#fff1f4', accent: ROSE_ACCENT, ...LIGHT_NEUTRALS },
}

export const DEFAULT_ACCENT_THEME = 'emerald'
