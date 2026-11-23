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

// camelCase -> CSS 변수명 (surfaceSoftHover -> --color-surface-soft-hover)
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

// 강조색 테마는 기기별로 저장. 등급 배지 색은 테마와 무관하게 고정
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
