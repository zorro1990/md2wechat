import { openDB } from 'idb'
import { createStore, del, entries, get, getMany, set, setMany } from 'idb-keyval'
import type {
  ArticleDraft,
  CompatibilityReport,
  ThemePreset,
} from '@/types'

const dbName = 'md2wechat'

const STORE_NAMES = ['drafts', 'themes', 'compatibilityReports', 'state'] as const

const initPromise = openDB(dbName, 1, {
  upgrade(db) {
    for (const name of STORE_NAMES) {
      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name)
      }
    }
  },
})

async function ensureInitialized() {
  await initPromise
}

const draftStore = createStore(dbName, 'drafts')
const themeStore = createStore(dbName, 'themes')
const reportStore = createStore(dbName, 'compatibilityReports')
const stateStore = createStore(dbName, 'state')

export async function saveDraft(draft: ArticleDraft): Promise<void> {
  await ensureInitialized()
  await set(draft.id, draft, draftStore)
}

export async function getDraft(id: string): Promise<ArticleDraft | undefined> {
  await ensureInitialized()
  return get<ArticleDraft>(id, draftStore)
}

export async function listDrafts(): Promise<ArticleDraft[]> {
  await ensureInitialized()
  const all = await entries<string, ArticleDraft>(draftStore)
  return all.map(([, value]) => value).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function deleteDraft(id: string): Promise<void> {
  await ensureInitialized()
  await del(id, draftStore)
}

export async function saveThemePreset(theme: ThemePreset): Promise<void> {
  await ensureInitialized()
  await set(theme.id, theme, themeStore)
}

export async function saveThemePresets(themes: ThemePreset[]): Promise<void> {
  await ensureInitialized()
  await setMany(
    themes.map((theme) => [theme.id, theme] as const),
    themeStore,
  )
}

export async function getThemePreset(id: string): Promise<ThemePreset | undefined> {
  await ensureInitialized()
  return get<ThemePreset>(id, themeStore)
}

export async function listThemePresets(): Promise<ThemePreset[]> {
  await ensureInitialized()
  const all = await entries<string, ThemePreset>(themeStore)
  return all.map(([, value]) => value)
}

export async function saveCompatibilityReport(report: CompatibilityReport): Promise<void> {
  await ensureInitialized()
  await set(report.id, report, reportStore)
}

export async function listReportsByDraft(draftId: string): Promise<CompatibilityReport[]> {
  await ensureInitialized()
  const all = await entries<string, CompatibilityReport>(reportStore)
  return all
    .map(([, value]) => value)
    .filter((report) => report.draftId === draftId)
    .sort((a, b) => (a.testedAt < b.testedAt ? 1 : -1))
}

export async function deleteReportsForDraft(draftId: string): Promise<void> {
  await ensureInitialized()
  const all = await entries<string, CompatibilityReport>(reportStore)
  await Promise.all(
    all
      .filter(([, report]) => report.draftId === draftId)
      .map(([key]) => del(key, reportStore)),
  )
}

export async function loadAppState<T>(key: string): Promise<T | undefined> {
  await ensureInitialized()
  return get<T>(key, stateStore)
}

export async function persistAppState<T>(key: string, value: T): Promise<void> {
  await ensureInitialized()
  await set(key, value, stateStore)
}

export async function loadAppStateMany(keys: string[]): Promise<unknown[]> {
  await ensureInitialized()
  return getMany(keys, stateStore)
}

export async function clearAllStores(): Promise<void> {
  await ensureInitialized()
  await Promise.all([
    entries(draftStore).then((items) => Promise.all(items.map(([key]) => del(key, draftStore)))),
    entries(themeStore).then((items) => Promise.all(items.map(([key]) => del(key, themeStore)))),
    entries(reportStore).then((items) => Promise.all(items.map(([key]) => del(key, reportStore)))),
    entries(stateStore).then((items) => Promise.all(items.map(([key]) => del(key, stateStore)))),
  ])
}
