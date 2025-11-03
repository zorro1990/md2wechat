import { useEffect } from 'react'

import { EditorPane } from '@/features/editor/EditorPane'
import { useEditorStore } from '@/features/editor/store'
import { CompatibilityPanel } from '@/features/compatibility/CompatibilityPanel'
import { PreviewPane } from '@/features/preview/PreviewPane'
import { ThemeSwitcher } from '@/features/themes/ThemeSwitcher'
import { applyTheme } from '@/themes/manager'

import './App.css'

function App() {
  const hydrate = useEditorStore((state) => state.hydrate)
  const activeThemeId = useEditorStore((state) => state.activeThemeId ?? 'default')

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    applyTheme(activeThemeId)
  }, [activeThemeId])

  return (
    <div className="app-shell">
      <aside className="app-panel">
        <EditorPane />
      </aside>
      <main className="app-panel">
        <header className="app-panel__header">
          <span className="app-panel__eyebrow">微信预览</span>
          <span className="app-panel__title">所见即所得</span>
          <ThemeSwitcher />
        </header>
        <PreviewPane className="app-preview" />
        <CompatibilityPanel />
      </main>
    </div>
  )
}

export default App
