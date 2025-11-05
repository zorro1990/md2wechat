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

  // 应用 CSS 变量（保留）
  for (const [token, value] of Object.entries(preset.tokens)) {
    root.style.setProperty(token, String(value))
  }
  root.dataset.wxTheme = preset.id

  // 移除 body 上的主题类切换逻辑
  // 现在主题样式只在预览区应用，不影响产品UI
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
