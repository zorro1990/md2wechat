import type { ThemePreset } from '@/types'

const buildTheme = (theme: {
  id: string
  name: string
  tokens: ThemePreset['tokens']
  components?: ThemePreset['components']
}): ThemePreset => ({
  id: theme.id,
  name: theme.name,
  tokens: theme.tokens,
  components: theme.components ?? {},
  isBuiltin: true,
  createdAt: new Date('2024-01-01').toISOString(),
})

export const BUILTIN_THEMES: ThemePreset[] = [
  buildTheme({
    id: 'default',
    name: '经典黑金',
    tokens: {
      '--wx-surface': '#ffffff',
      '--wx-text': '#18181b',
      '--wx-heading': '#0f172a',
      '--wx-subheading': '#334155',
      '--wx-accent': '#ca8a04',
      '--wx-accent-contrast': '#0f172a',
      '--wx-link': '#ca8a04',
      '--wx-quote-border': '#ca8a04',
      '--wx-code-bg': '#111827',
      '--wx-code-text': '#facc15',
    },
  }),
  buildTheme({
    id: 'fresh',
    name: '清新绿意',
    tokens: {
      '--wx-surface': '#fcfffa',
      '--wx-text': '#14532d',
      '--wx-heading': '#065f46',
      '--wx-subheading': '#047857',
      '--wx-accent': '#10b981',
      '--wx-accent-contrast': '#064e3b',
      '--wx-link': '#059669',
      '--wx-quote-border': '#34d399',
      '--wx-code-bg': '#d1fae5',
      '--wx-code-text': '#064e3b',
    },
  }),
  buildTheme({
    id: 'tech',
    name: '科技蓝',
    tokens: {
      '--wx-surface': '#f8fbff',
      '--wx-text': '#0f172a',
      '--wx-heading': '#1d4ed8',
      '--wx-subheading': '#2563eb',
      '--wx-accent': '#3b82f6',
      '--wx-accent-contrast': '#0b1120',
      '--wx-link': '#2563eb',
      '--wx-quote-border': '#60a5fa',
      '--wx-code-bg': '#0f172a',
      '--wx-code-text': '#bfdbfe',
    },
  }),
  buildTheme({
    id: 'edu',
    name: '教育蓝绿',
    tokens: {
      '--wx-surface': '#ffffff',
      '--wx-text': '#0f172a',
      '--wx-heading': '#0ea5e9',
      '--wx-subheading': '#0284c7',
      '--wx-accent': '#14b8a6',
      '--wx-accent-contrast': '#0b3a42',
      '--wx-link': '#0ea5e9',
      '--wx-quote-border': '#38bdf8',
      '--wx-code-bg': '#e0f2fe',
      '--wx-code-text': '#0369a1',
    },
  }),
  buildTheme({
    id: 'warm',
    name: '暖色橙',
    tokens: {
      '--wx-surface': '#fff7ed',
      '--wx-text': '#7c2d12',
      '--wx-heading': '#9a3412',
      '--wx-subheading': '#ea580c',
      '--wx-accent': '#fb923c',
      '--wx-accent-contrast': '#431407',
      '--wx-link': '#f97316',
      '--wx-quote-border': '#fb7185',
      '--wx-code-bg': '#431407',
      '--wx-code-text': '#fed7aa',
    },
  }),
  buildTheme({
    id: 'minimal',
    name: '极简灰',
    tokens: {
      '--wx-surface': '#ffffff',
      '--wx-text': '#1f2937',
      '--wx-heading': '#111827',
      '--wx-subheading': '#4b5563',
      '--wx-accent': '#6b7280',
      '--wx-accent-contrast': '#111827',
      '--wx-link': '#4b5563',
      '--wx-quote-border': '#9ca3af',
      '--wx-code-bg': '#f4f4f5',
      '--wx-code-text': '#111827',
    },
  }),
]

export const DEFAULT_THEME_ID = 'default'

export function getThemePreset(themeId: string): ThemePreset {
  return BUILTIN_THEMES.find((theme) => theme.id === themeId) ?? BUILTIN_THEMES[0]
}
