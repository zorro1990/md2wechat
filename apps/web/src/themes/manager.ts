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
  const body = document.body

  // 应用 CSS 变量
  for (const [token, value] of Object.entries(preset.tokens)) {
    root.style.setProperty(token, String(value))
  }
  root.dataset.wxTheme = preset.id

  // 切换 body 上的主题类
  // 移除所有 theme- 开头的类
  const classesToRemove = Array.from(body.classList).filter(cls => cls.startsWith('theme-'))
  classesToRemove.forEach(cls => body.classList.remove(cls))
  // 添加当前主题类
  body.classList.add(`theme-${preset.id}`)
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
