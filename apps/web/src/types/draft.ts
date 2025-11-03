export interface MediaStats {
  images: number
  tables: number
  codeBlocks: number
}

export interface ArticleDraft {
  id: string
  title: string
  markdown: string
  astVersion: number
  previewHtml: string
  wordCount: number
  mediaStats: MediaStats
  themeId: string
  updatedAt: string
}

export interface ThemeTokens {
  [token: string]: string | number
}

export interface ThemeComponentConfig {
  [component: string]: Record<string, string | number>
}

export interface ThemePreset {
  id: string
  name: string
  tokens: ThemeTokens
  components: ThemeComponentConfig
  isBuiltin: boolean
  createdAt: string
}

export type CompatibilityIssueType = 'link' | 'style' | 'media' | 'unknown'
export type CompatibilityIssueSeverity = 'info' | 'warning' | 'critical'

export interface CompatibilityIssue {
  type: CompatibilityIssueType
  description: string
  severity: CompatibilityIssueSeverity
}

export interface CompatibilityReport {
  id: string
  draftId: string
  themeId: string
  successRate: number
  issues: CompatibilityIssue[]
  testedAt: string
  testSource: 'playwright' | 'manual'
  evidenceUrl?: string | null
  recommendedActions?: string[]
}
