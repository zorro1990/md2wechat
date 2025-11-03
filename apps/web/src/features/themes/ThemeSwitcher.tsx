import { useMemo } from 'react'

import { useEditorStore } from '@/features/editor/store'
import { BUILTIN_THEMES } from '@/themes/presets'
import { applyTheme } from '@/themes/manager'

export function ThemeSwitcher() {
  const themes = useMemo(() => BUILTIN_THEMES, [])
  const activeThemeId = useEditorStore((state) => state.activeThemeId ?? themes[0]?.id ?? 'default')
  const setActiveTheme = useEditorStore((state) => state.setActiveTheme)

  const handleChange = async (themeId: string) => {
    applyTheme(themeId)
    await setActiveTheme(themeId)
  }

  return (
    <div className="theme-switcher" role="group" aria-label="主题切换">
      {themes.map((theme) => {
        const isActive = theme.id === activeThemeId
        return (
          <button
            key={theme.id}
            type="button"
            className={`theme-switcher__option ${isActive ? 'is-active' : ''}`}
            onClick={() => handleChange(theme.id)}
          >
            <span className="theme-switcher__name">{theme.name}</span>
          </button>
        )
      })}
    </div>
  )
}
