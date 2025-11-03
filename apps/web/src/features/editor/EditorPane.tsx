import { useEffect, useMemo, useState } from 'react'

import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { useAutosave } from '@/features/editor/autosave'
import { useEditorStore } from '@/features/editor/store'
import type { DraftUpdate } from '@/features/editor/store'
import { EditorActions } from '@/features/editor/EditorActions'
import { analyzeMarkdownDocument } from '@/conversion/render'

const EMPTY_MARKDOWN_PLACEHOLDER = '# 开始写作\n\n在此处输入 Markdown 内容……'

export function EditorPane() {
  const hydrate = useEditorStore((state) => state.hydrate)
  const isHydrated = useEditorStore((state) => state.isHydrated)
  const currentDraftId = useEditorStore((state) => state.currentDraftId)
  const drafts = useEditorStore((state) => state.drafts)
  const upsertDraft = useEditorStore((state) => state.upsertDraft)
  const setActiveTheme = useEditorStore((state) => state.setActiveTheme)
  const { notify } = useFeedback()
  const { schedule: scheduleAutosave, forceSave } = useAutosave({ delayMs: 800 })
  const [value, setValue] = useState('')
  const currentDraft = useMemo(() => (currentDraftId ? drafts[currentDraftId] : null), [currentDraftId, drafts])
  const isReady = isHydrated && Boolean(currentDraftId)

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

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(value)
      notify({ title: '已复制 Markdown 内容', variant: 'success' })
    } catch (error) {
      notify({
        title: '复制失败',
        description: error instanceof Error ? error.message : '请检查浏览器权限设置',
        variant: 'error',
      })
    }
  }

  return (
    <div
      className="flex h-full flex-col gap-4"
      data-testid="markdown-panel"
      data-hydrated={isHydrated ? 'true' : 'false'}
      data-ready={isReady ? 'true' : 'false'}
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Markdown</span>
          <span className="text-lg font-bold text-zinc-900">{currentDraft?.title ?? '未命名草稿'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <EditorActions />
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
            onClick={handleCopyMarkdown}
          >
            复制 Markdown
          </button>
        </div>
      </header>
      <textarea
        data-testid="markdown-editor"
        className="h-full w-full resize-none rounded-2xl border border-zinc-200 bg-white p-6 font-mono text-sm leading-relaxed text-zinc-900 shadow-inner focus:border-zinc-400 focus:outline-none"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={EMPTY_MARKDOWN_PLACEHOLDER}
        spellCheck={false}
        aria-label="Markdown 编辑器"
        disabled={!isReady}
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
