import { useEffect, useMemo, useState, useRef } from 'react'

import { useAutosave } from '@/features/editor/autosave'
import { useEditorStore } from '@/features/editor/store'
import type { DraftUpdate } from '@/features/editor/store'
import { analyzeMarkdownDocument } from '@/conversion/render'
import { EditorActions } from './EditorActions'

const EMPTY_MARKDOWN_PLACEHOLDER = '# 开始写作\n\n在此处输入 Markdown 内容……'

export function EditorPane() {
  const hydrate = useEditorStore((state) => state.hydrate)
  const isHydrated = useEditorStore((state) => state.isHydrated)
  const currentDraftId = useEditorStore((state) => state.currentDraftId)
  const drafts = useEditorStore((state) => state.drafts)
  const upsertDraft = useEditorStore((state) => state.upsertDraft)
  const setActiveTheme = useEditorStore((state) => state.setActiveTheme)
  const { schedule: scheduleAutosave, forceSave } = useAutosave({ delayMs: 800 })
  const [value, setValue] = useState('')
  const currentDraft = useMemo(() => (currentDraftId ? drafts[currentDraftId] : null), [currentDraftId, drafts])
  const isReady = isHydrated && Boolean(currentDraftId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!isHydrated) {
      return
    }
    if (!currentDraft) {
      void upsertDraft({}).then((draft) => {
        setValue(draft.markdown)
        void setActiveTheme(draft.themeId)
      })
      return
    }
    setValue(currentDraft.markdown)
  }, [currentDraft, isHydrated, setActiveTheme, upsertDraft])

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const nextValue = event.target.value
    setValue(nextValue)
    persistMarkdown(nextValue)
  }

  const persistMarkdown = (markdown: string) => {
    if (!currentDraftId && !isHydrated) {
      return
    }
    const analytics = analyzeMarkdownDocument(markdown)
    const update: DraftUpdate = {
      markdown,
      wordCount: analytics.wordCount,
      mediaStats: analytics.mediaStats,
      title: deriveTitle(markdown) ?? currentDraft?.title ?? '未命名草稿',
      previewHtml: currentDraft?.previewHtml ?? '',
    }
    scheduleAutosave(update)
  }

  const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = () => {
    void forceSave()
  }

  return (
    <div
      className="editor-pane"
      data-testid="markdown-panel"
      data-hydrated={isHydrated ? 'true' : 'false'}
      data-ready={isReady ? 'true' : 'false'}
    >
      <header className="editor-pane__header">
        <div className="editor-pane__title">
          <span className="editor-pane__eyebrow">Markdown 编辑区</span>
        </div>
        <EditorActions textareaRef={textareaRef} value={value} onChange={setValue} />
      </header>
      <textarea
        ref={textareaRef}
        data-testid="markdown-editor"
        className="editor-pane__textarea"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={EMPTY_MARKDOWN_PLACEHOLDER}
        spellCheck={false}
        aria-label="Markdown 编辑器"
      />
    </div>
  )
}

function deriveTitle(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.+)$/m)
  if (match?.[1]) {
    return match[1].trim()
  }
  const firstLine = markdown.split('\n').find((line) => line.trim().length > 0)
  return firstLine?.slice(0, 30)
}
