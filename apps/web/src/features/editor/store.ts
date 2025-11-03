import { nanoid } from 'nanoid/non-secure'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import type { ArticleDraft, CompatibilityReport } from '@/types'
import {
  deleteDraft,
  deleteReportsForDraft,
  getDraft,
  listDrafts,
  listReportsByDraft,
  persistAppState,
  saveCompatibilityReport,
  saveDraft,
  loadAppState,
} from '@/utils/storage'

const ACTIVE_THEME_KEY = 'activeThemeId'

export type DraftUpdate = Partial<
  Pick<
    ArticleDraft,
    'title' | 'markdown' | 'previewHtml' | 'wordCount' | 'mediaStats' | 'astVersion' | 'themeId'
  >
>

interface EditorStoreState {
  drafts: Record<string, ArticleDraft>
  compatibilityReports: Record<string, CompatibilityReport[]>
  currentDraftId: string | null
  activeThemeId: string | null
  isHydrated: boolean
  hydrate: () => Promise<void>
  setCurrentDraft: (draftId: string) => Promise<void>
  upsertDraft: (input: { draft?: ArticleDraft; update?: DraftUpdate }) => Promise<ArticleDraft>
  removeDraft: (draftId: string) => Promise<void>
  recordCompatibility: (report: CompatibilityReport) => Promise<void>
  listCompatibilityReports: (draftId: string) => CompatibilityReport[]
  setActiveTheme: (themeId: string) => Promise<void>
}

const buildDraft = (overrides?: Partial<ArticleDraft>): ArticleDraft => {
  const now = new Date().toISOString()
  const id = nanoid()
  return {
    id,
    title: '未命名草稿',
    markdown: '',
    astVersion: 0,
    previewHtml: '',
    wordCount: 0,
    mediaStats: { images: 0, tables: 0, codeBlocks: 0 },
    themeId: 'default',
    updatedAt: now,
    ...overrides,
  }
}

export const useEditorStore = create<EditorStoreState>()(
  immer((set, get) => ({
    drafts: {},
    compatibilityReports: {},
    currentDraftId: null,
    activeThemeId: null,
    isHydrated: false,
    hydrate: async () => {
      if (get().isHydrated) return
      const [storedDrafts, activeTheme] = await Promise.all([
        listDrafts(),
        loadAppState<string>(ACTIVE_THEME_KEY),
      ])
      set((state) => {
        state.drafts = Object.fromEntries(storedDrafts.map((draft) => [draft.id, draft]))
        state.currentDraftId = storedDrafts[0]?.id ?? null
        state.activeThemeId = activeTheme ?? storedDrafts[0]?.themeId ?? 'default'
        state.isHydrated = true
      })
      const current = get().currentDraftId
      if (current) {
        const reports = await listReportsByDraft(current)
        set((state) => {
          state.compatibilityReports[current] = reports
        })
      }
    },
    setCurrentDraft: async (draftId: string) => {
      const existing = get().drafts[draftId] ?? (await getDraft(draftId))
      if (!existing) {
        throw new Error(`Draft ${draftId} not found`)
      }
      const reports = await listReportsByDraft(draftId)
      set((state) => {
        state.drafts[draftId] = existing
        state.currentDraftId = draftId
        state.compatibilityReports[draftId] = reports
        state.activeThemeId = existing.themeId
      })
    },
    upsertDraft: async ({ draft, update }) => {
      const state = get()
      const baseDraft =
        draft ??
        (update && state.currentDraftId ? state.drafts[state.currentDraftId] : undefined) ??
        buildDraft()

      const nextDraft = {
        ...baseDraft,
        ...update,
        updatedAt: new Date().toISOString(),
      }

      await saveDraft(nextDraft)

      set((mut) => {
        mut.drafts[nextDraft.id] = nextDraft
        mut.currentDraftId = nextDraft.id
        mut.activeThemeId = nextDraft.themeId
      })

      return nextDraft
    },
    removeDraft: async (draftId: string) => {
      await Promise.all([deleteDraft(draftId), deleteReportsForDraft(draftId)])
      set((state) => {
        delete state.drafts[draftId]
        delete state.compatibilityReports[draftId]
        if (state.currentDraftId === draftId) {
          const remainingIds = Object.keys(state.drafts)
          state.currentDraftId = remainingIds[0] ?? null
        }
      })
    },
    recordCompatibility: async (report: CompatibilityReport) => {
      await saveCompatibilityReport(report)
      set((state) => {
        const list = state.compatibilityReports[report.draftId] ?? []
        const withoutSameId = list.filter((item) => item.id !== report.id)
        state.compatibilityReports[report.draftId] = [report, ...withoutSameId]
      })
    },
    listCompatibilityReports: (draftId: string) => {
      return get().compatibilityReports[draftId] ?? []
    },
    setActiveTheme: async (themeId: string) => {
      await persistAppState(ACTIVE_THEME_KEY, themeId)
      set((state) => {
        state.activeThemeId = themeId
        const currentId = state.currentDraftId
        if (currentId && state.drafts[currentId]) {
          state.drafts[currentId].themeId = themeId
        }
      })
    },
  })),
)
