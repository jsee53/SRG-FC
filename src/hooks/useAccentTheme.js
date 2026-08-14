import { useCallback, useEffect, useState } from 'react'
import { ACCENT_THEMES, DEFAULT_ACCENT_THEME } from '../utils/accentThemes'

const STORAGE_KEY = 'srgfc_accent_theme'

const NEUTRAL_KEYS = [
  'text',
  'textSoft',
  'textMuted',
  'textFaint',
  'sheet',
  'surface',
  'surfaceSoft',
  'surfaceSoftHover',
  'surfaceFaint',
  'surfaceStrong',
  'border',
  'borderStrong',
  'backdrop',
  'backdropStrong',
]

// camelCase -> kebab-case로 CSS 변수 이름 맞춤 (surfaceSoftHover -> --color-surface-soft-hover)
function toCssVarName(key) {
  return `--color-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`
}

function applyTheme(themeKey) {
  const theme = ACCENT_THEMES[themeKey] ?? ACCENT_THEMES[DEFAULT_ACCENT_THEME]
  const root = document.documentElement
  for (const shade of [200, 300, 400, 500, 950]) {
    root.style.setProperty(`--color-accent-${shade}`, theme.accent[shade])
  }
  root.style.setProperty('--color-app-bg', theme.bg)
  for (const key of NEUTRAL_KEYS) {
    root.style.setProperty(toCssVarName(key), theme[key])
  }
}

// 앱 전체 강조색(브랜드 컬러)을 기기별로 저장해서 다음 방문에도 유지함.
// 등급(S~D) 배지 색상은 이 테마와 무관하게 그대로 고정.
export function useAccentTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_ACCENT_THEME)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const changeTheme = useCallback((key) => {
    localStorage.setItem(STORAGE_KEY, key)
    setTheme(key)
  }, [])

  return { theme, changeTheme }
}
