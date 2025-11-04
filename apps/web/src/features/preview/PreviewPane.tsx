import { useEffect, useRef, useState } from 'react'

import { renderMarkdown } from '@/conversion/workerClient'
import { useEditorStore } from '@/features/editor/store'
import { recordRenderMetric } from '@/utils/perf-metrics'

// ✅ 默认主题ID常量
const DEFAULT_THEME_ID = 'chinese'

export function PreviewPane() {
  const currentDraftId = useEditorStore((state) => state.currentDraftId)
  const drafts = useEditorStore((state) => state.drafts)
  const activeThemeId = useEditorStore((state) => state.activeThemeId ?? DEFAULT_THEME_ID)
  const upsertDraft = useEditorStore((state) => state.upsertDraft)
  const [html, setHtml] = useState('')
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
      })
  }, [activeThemeId, currentDraft, currentDraftId, markdown, upsertDraft])

  const themeClass = `wx-theme wx-theme-${activeThemeId}`

  return (
    <section
      className="preview-container"
      data-testid="wechat-preview"
    >
      <article
        className={themeClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}
