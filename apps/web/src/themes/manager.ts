import type { ThemePreset } from '@/types'
import { DEFAULT_THEME_ID, getThemePreset } from '@/themes/presets'

export function applyTheme(themeId: string) {
  const preset = getThemePreset(themeId)
  applyThemeTokens(preset)
}

export function applyThemeTokens(preset: ThemePreset) {
  if (typeof document === 'undefined') {
    return
  }
  const root = document.documentElement
  for (const [token, value] of Object.entries(preset.tokens)) {
    root.style.setProperty(token, String(value))
  }
  root.dataset.wxTheme = preset.id
}

export function ensureDefaultTheme() {
  if (typeof document === 'undefined') {
    return
  }
  const current = document.documentElement.dataset.wxTheme
  if (!current) {
    applyTheme(DEFAULT_THEME_ID)
  }
}
