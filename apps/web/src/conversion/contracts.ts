export interface RenderRequest {
  markdown: string
  themeId: string
  options?: {
    enableFootnoteLinks?: boolean
    format?: 'wechat-html'
    fontSize?: 'small' | 'medium' | 'large'
  }
}

export interface CompatibilityWarning {
  type: 'link' | 'style' | 'media' | 'unknown'
  message: string
  severity: 'info' | 'warning' | 'critical'
}

export interface RenderResponse {
  html: string
  astVersion: number
  durationMs: number
  warnings: CompatibilityWarning[]
}

export interface AnalyzeRequest {
  markdown: string
  themeId?: string
}

export interface AnalyzeResponse {
  wordCount: number
  mediaStats: {
    images: number
    tables: number
    codeBlocks: number
  }
  compatibilityHints: CompatibilityWarning[]
  recommendedActions: string[]
}

export type WorkerRequestMessage =
  | { id: string; type: 'render'; payload: RenderRequest }
  | { id: string; type: 'analyze'; payload: AnalyzeRequest }

export type WorkerResponseMessage =
  | { id: string; type: 'render'; payload: RenderResponse }
  | { id: string; type: 'analyze'; payload: AnalyzeResponse }
  | { id: string; type: 'error'; error: string }
