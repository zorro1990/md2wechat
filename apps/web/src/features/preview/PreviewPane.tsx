import { useEffect, useRef, useState } from 'react'

import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { renderMarkdown } from '@/conversion/workerClient'
import { useEditorStore } from '@/features/editor/store'
import { recordRenderMetric } from '@/utils/perf-metrics'

interface PreviewPaneProps {
  className?: string
}

export function PreviewPane({ className }: PreviewPaneProps) {
  const { notify } = useFeedback()
  const currentDraftId = useEditorStore((state) => state.currentDraftId)
  const drafts = useEditorStore((state) => state.drafts)
  const activeThemeId = useEditorStore((state) => state.activeThemeId ?? 'default')
  const upsertDraft = useEditorStore((state) => state.upsertDraft)
  const [html, setHtml] = useState('')
  const [isRendering, setIsRendering] = useState(false)
  const lastRequestRef = useRef<number>(0)

  const currentDraft = currentDraftId ? drafts[currentDraftId] : null
  const markdown = currentDraft?.markdown ?? ''

  useEffect(() => {
    if (!currentDraftId) {
      setHtml('')
      return
    }
    const requestId = Date.now()
    lastRequestRef.current = requestId
    setIsRendering(true)
    renderMarkdown({ markdown, themeId: activeThemeId, options: { enableFootnoteLinks: true } })
      .then(async (result) => {
        if (lastRequestRef.current !== requestId) {
          return
        }
        setHtml(result.html)
        if (!currentDraft) {
          return
        }
        const base = { ...currentDraft }
        await upsertDraft({
          draft: base,
          update: {
            previewHtml: result.html,
            astVersion: result.astVersion,
          },
        })
        recordRenderMetric({
          draftId: currentDraftId,
          themeId: activeThemeId,
          durationMs: result.durationMs,
          timestamp: Date.now(),
        })
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error('renderMarkdown failed', error)
        }
        notify({
          title: '预览渲染失败',
          description: error instanceof Error ? error.message : '请稍后重试',
          variant: 'error',
          dismissAfterMs: 6000,
        })
      })
      .finally(() => {
        if (lastRequestRef.current === requestId) {
          setIsRendering(false)
        }
      })
  }, [activeThemeId, currentDraft, currentDraftId, markdown, notify, upsertDraft])

  const themeClass = `wx-theme wx-theme-${activeThemeId}`

  return (
    <section
      className={`relative h-full overflow-y-auto rounded-2xl border border-zinc-200 p-6 shadow-sm ${className ?? ''}`.trim()}
      style={{ backgroundColor: 'var(--wx-surface)', color: 'var(--wx-text)' }}
      data-testid="wechat-preview"
    >
      {isRendering ? (
        <p className="text-sm text-zinc-500">生成预览中…</p>
      ) : null}
      <article
        className={`prose prose-zinc max-w-none ${themeClass}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}
