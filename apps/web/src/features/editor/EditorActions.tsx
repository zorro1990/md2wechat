import { useCallback } from 'react'

import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { useEditorStore } from '@/features/editor/store'

export function EditorActions() {
  const { notify } = useFeedback()
  const currentDraftId = useEditorStore((state) => state.currentDraftId)
  const drafts = useEditorStore((state) => state.drafts)

  const handleExport = useCallback(() => {
    if (!currentDraftId) {
      notify({ title: '暂无可导出的草稿', variant: 'warning' })
      return
    }
    const draft = drafts[currentDraftId]
    if (!draft) {
      notify({ title: '草稿不存在或已删除', variant: 'error' })
      return
    }
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
    const fileName = `md2wechat-draft-${draft.id}.json`
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
    notify({ title: '草稿已导出', description: fileName, variant: 'success' })
  }, [currentDraftId, drafts, notify])

  return (
    <button
      type="button"
      className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
      onClick={handleExport}
    >
      导出草稿 JSON
    </button>
  )
}
