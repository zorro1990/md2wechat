import { useEffect } from 'react'

import { EditorPane } from '@/features/editor/EditorPane'
import { useEditorStore } from '@/features/editor/store'
import { PreviewPane } from '@/features/preview/PreviewPane'
import { applyTheme } from '@/themes/manager'
import { HeaderBar } from '@/components/layout/HeaderBar'
import { SettingsPanel } from '@/features/settings/SettingsPanel'

import './App.css'

function App() {
  const hydrate = useEditorStore((state) => state.hydrate)
  const activeThemeId = useEditorStore((state) => state.activeThemeId ?? 'default')
  const appSettings = useEditorStore((state) => state.appSettings)
  const isSettingsOpen = useEditorStore((state) => state.isSettingsOpen)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    applyTheme(activeThemeId)
  }, [activeThemeId])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', appSettings.themeMode === 'dark')
  }, [appSettings.themeMode])

  return (
    <div className={`app-shell ${appSettings.themeMode === 'dark' ? 'dark' : ''}`}>
      <HeaderBar />
      <div className={`app-container ${isSettingsOpen ? 'is-settings-open' : ''}`}>
        <aside className="app-panel">
          <EditorPane />
        </aside>
        <main className="app-panel">
          <header className="app-panel__header">
            <span className="app-panel__eyebrow">微信预览</span>
            {/* 移除副标题和风格切换按钮 */}
          </header>
          <PreviewPane />
        </main>
        {isSettingsOpen && (
          <aside className="app-panel settings-panel">
            <SettingsPanel />
          </aside>
        )}
      </div>
    </div>
  )
}

export default App
