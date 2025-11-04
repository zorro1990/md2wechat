import { useMemo } from 'react'

import { useEditorStore } from '@/features/editor/store'
import { BUILTIN_THEMES } from '@/themes/presets'
import { applyTheme } from '@/themes/manager'

export function ThemeSwitcher() {
  const themes = useMemo(() => BUILTIN_THEMES, [])
  const appSettings = useEditorStore((state) => state.appSettings)
  const setSelectedThemeId = useEditorStore((state) => state.setSelectedThemeId)
  const setActiveTheme = useEditorStore((state) => state.setActiveTheme)
  const activeThemeId = appSettings.selectedThemeId

  const handleChange = async (themeId: string) => {
    setSelectedThemeId(themeId)
    await setActiveTheme(themeId)
    applyTheme(themeId)
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
