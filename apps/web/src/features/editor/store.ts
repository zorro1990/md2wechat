import { nanoid } from 'nanoid/non-secure'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import type { ArticleDraft, CompatibilityReport, AppSettings } from '@/types'
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
const APP_SETTINGS_KEY = 'appSettings'

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'light',
  scrollSync: true,
  fontSize: 'medium',
  exportBackground: 'warm',
  selectedThemeId: 'chinese',
}

// 从 markdown 中提取标题
function deriveTitleFromMarkdown(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.+)$/m)
  if (match?.[1]) {
    return match[1].trim()
  }
  const firstLine = markdown.split('\n').find((line) => line.trim().length > 0)
  return firstLine?.slice(0, 30)
}

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
  appSettings: AppSettings
  isSettingsDrawerOpen: boolean
  isSettingsOpen: boolean
  isHydrated: boolean
  hydrate: () => Promise<void>
  setCurrentDraft: (draftId: string) => Promise<void>
  upsertDraft: (input: { draft?: ArticleDraft; update?: DraftUpdate }) => Promise<ArticleDraft>
  removeDraft: (draftId: string) => Promise<void>
  recordCompatibility: (report: CompatibilityReport) => Promise<void>
  listCompatibilityReports: (draftId: string) => CompatibilityReport[]
  setActiveTheme: (themeId: string) => Promise<void>
  setThemeMode: (mode: 'light' | 'dark') => void
  toggleScrollSync: () => void
  setFontSize: (size: AppSettings['fontSize']) => void
  setExportBackground: (background: AppSettings['exportBackground']) => void
  setSelectedThemeId: (themeId: string) => void
  setSettingsDrawerOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  toggleSettings: () => void
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
    themeId: 'chinese',
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
    appSettings: DEFAULT_SETTINGS,
    isSettingsDrawerOpen: false,
    isSettingsOpen: false,
    isHydrated: false,
    hydrate: async () => {
      if (get().isHydrated) return
      const [storedDrafts, activeTheme, appSettings] = await Promise.all([
        listDrafts(),
        loadAppState<string>(ACTIVE_THEME_KEY),
        loadAppState<AppSettings>(APP_SETTINGS_KEY),
      ])

      set((state) => {
        state.drafts = Object.fromEntries(storedDrafts.map((draft) => [draft.id, draft]))
        state.appSettings = appSettings ?? DEFAULT_SETTINGS
        state.isHydrated = true
      })

      // 如果没有草稿或者第一个草稿为空，加载默认 markdown
      const hasNoDrafts = storedDrafts.length === 0
      const firstDraftIsEmpty = storedDrafts[0]?.markdown?.trim() === ''

      if (hasNoDrafts || firstDraftIsEmpty) {
        try {
          // 尝试加载默认 markdown 文件
          const response = await fetch('/default-markdown.md')
          if (response.ok) {
            const defaultMarkdown = await response.text()
            // 创建带默认内容的新草稿
            await get().upsertDraft({
              update: {
                markdown: defaultMarkdown,
                title: deriveTitleFromMarkdown(defaultMarkdown) ?? '欢迎使用微信 Markdown 编辑器',
              },
            })
          } else {
            // 如果加载失败，使用第一个草稿
            set((state) => {
              state.currentDraftId = storedDrafts[0]?.id ?? null
              state.activeThemeId = activeTheme ?? storedDrafts[0]?.themeId ?? 'chinese'
            })
          }
        } catch (error) {
          console.error('Failed to load default markdown:', error)
          // 如果加载失败，使用第一个草稿
          set((state) => {
            state.currentDraftId = storedDrafts[0]?.id ?? null
            state.activeThemeId = activeTheme ?? storedDrafts[0]?.themeId ?? 'chinese'
          })
        }
      } else {
        // 有草稿且不为空，正常设置
        set((state) => {
          state.currentDraftId = storedDrafts[0]?.id ?? null
          state.activeThemeId = activeTheme ?? storedDrafts[0]?.themeId ?? 'chinese'
        })
      }

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
    setThemeMode: (mode: 'light' | 'dark') => {
      const settings = { ...get().appSettings, themeMode: mode }
      set((state) => {
        state.appSettings = settings
      })
      void persistAppState(APP_SETTINGS_KEY, settings)
    },
    toggleScrollSync: () => {
      const settings = { ...get().appSettings, scrollSync: !get().appSettings.scrollSync }
      set((state) => {
        state.appSettings = settings
      })
      void persistAppState(APP_SETTINGS_KEY, settings)
    },
    setFontSize: (size: AppSettings['fontSize']) => {
      const settings = { ...get().appSettings, fontSize: size }
      set((state) => {
        state.appSettings = settings
      })
      void persistAppState(APP_SETTINGS_KEY, settings)
    },
    setExportBackground: (background: AppSettings['exportBackground']) => {
      const settings = { ...get().appSettings, exportBackground: background }
      set((state) => {
        state.appSettings = settings
      })
      void persistAppState(APP_SETTINGS_KEY, settings)
    },
    setSelectedThemeId: (themeId: string) => {
      const settings = { ...get().appSettings, selectedThemeId: themeId }
      set((state) => {
        state.appSettings = settings
      })
      void persistAppState(APP_SETTINGS_KEY, settings)
    },
    setSettingsDrawerOpen: (open: boolean) => {
      set((state) => {
        state.isSettingsDrawerOpen = open
      })
    },
    setSettingsOpen: (open: boolean) => {
      set((state) => {
        state.isSettingsOpen = open
      })
    },
    toggleSettings: () => {
      set((state) => {
        state.isSettingsOpen = !state.isSettingsOpen
      })
    },
  })),
)
