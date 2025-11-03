import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { useEditorStore } from '@/features/editor/store'
import type { DraftUpdate } from '@/features/editor/store'
import { getDraft } from '@/utils/storage'
import { useCallback, useEffect, useRef } from 'react'

export interface AutosaveConfig {
  delayMs?: number
}

interface PendingSave {
  draftId: string
  update: DraftUpdate
}

export function useAutosave(config: AutosaveConfig = {}) {
  const delay = config.delayMs ?? 400
  const scheduleRef = useRef<number | null>(null)
  const pendingRef = useRef<PendingSave | null>(null)
  const { notify } = useFeedback()
  const upsertDraft = useEditorStore((state) => state.upsertDraft)
  const currentDraftId = useEditorStore((state) => state.currentDraftId)

  const flush = useCallback(async () => {
    if (!pendingRef.current) return
    const payload = pendingRef.current
    pendingRef.current = null
    scheduleRef.current = null
    try {
      const snapshot = useEditorStore.getState()
      let baseDraft = snapshot.drafts[payload.draftId]
      if (!baseDraft) {
        baseDraft = (await getDraft(payload.draftId)) ?? undefined
      }
      const themeId = snapshot.activeThemeId ?? baseDraft?.themeId ?? 'default'
      await upsertDraft({
        draft: baseDraft ?? {
          id: payload.draftId,
          title: '未命名草稿',
          markdown: '',
          astVersion: 0,
          previewHtml: '',
          wordCount: 0,
          mediaStats: { images: 0, tables: 0, codeBlocks: 0 },
          themeId,
          updatedAt: new Date().toISOString(),
        },
        update: payload.update,
      })
    } catch (error) {
      notify({
        title: '自动保存失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'error',
        dismissAfterMs: 6000,
      })
    }
  }, [notify, upsertDraft])

  useEffect(() => () => {
    if (scheduleRef.current) {
      clearTimeout(scheduleRef.current)
    }
  }, [])

  const schedule = useCallback(
    (update: DraftUpdate) => {
      if (!currentDraftId) {
        return
      }
      useEditorStore.setState((state) => {
        const id = state.currentDraftId
        if (!id) return
        const draft =
          state.drafts[id] ??
          {
            id,
            title: '未命名草稿',
            markdown: '',
            astVersion: 0,
            previewHtml: '',
            wordCount: 0,
            mediaStats: { images: 0, tables: 0, codeBlocks: 0 },
            themeId: state.activeThemeId ?? 'default',
            updatedAt: new Date().toISOString(),
          }
        state.drafts[id] = {
          ...draft,
          ...update,
          updatedAt: new Date().toISOString(),
        }
      })
      pendingRef.current = { draftId: currentDraftId, update }
      if (scheduleRef.current) {
        clearTimeout(scheduleRef.current)
      }
      scheduleRef.current = window.setTimeout(() => {
        void flush()
      }, delay)
    },
    [currentDraftId, delay, flush],
  )

  const forceSave = useCallback(async () => {
    await flush()
  }, [flush])

  return { schedule, forceSave }
}
