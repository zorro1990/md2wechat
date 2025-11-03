import { nanoid } from 'nanoid/non-secure'

import { analyzeMarkdownDocument, renderMarkdownDocument } from '@/conversion/render'
import type { ArticleDraft, CompatibilityIssue, CompatibilityReport } from '@/types'

const EXTERNAL_LINK_REGEX = /\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/gi
const RAW_HTML_TAG_REGEX = /<\/?(iframe|script|style|form|input|video|audio)[^>]*>/gi
const INLINE_HTML_REGEX = /<\/?[a-z][^>]*>/gi

interface EvaluateOptions {
  themeId: string
}

export async function evaluateCompatibility(
  draft: ArticleDraft,
  options: EvaluateOptions,
): Promise<CompatibilityReport> {
  const [analysis, renderResult] = await Promise.all([
    Promise.resolve(analyzeMarkdownDocument(draft.markdown)),
    renderMarkdownDocument(draft.markdown, { themeId: options.themeId }),
  ])

  const issues: CompatibilityIssue[] = []

  for (const hint of analysis.compatibilityHints) {
    issues.push({
      type: mapWarningType(hint.type),
      description: hint.message,
      severity: hint.severity,
    })
  }

  const externalLinks = countExternalLinks(draft.markdown)
  if (externalLinks > 8) {
    issues.push({
      type: 'link',
      severity: 'warning',
      description: `检测到 ${externalLinks} 个外部链接，微信可能追加安全提示，可考虑转为脚注。`,
    })
  }

  const rawHtmlMatches = draft.markdown.match(RAW_HTML_TAG_REGEX)
  if (rawHtmlMatches?.length) {
    issues.push({
      type: 'media',
      severity: 'critical',
      description: '检测到微信不支持的嵌入标签（如 iframe/script），建议改用截图或链接。',
    })
  } else {
    const inlineHtmlMatches = draft.markdown.match(INLINE_HTML_REGEX)
    if (inlineHtmlMatches && inlineHtmlMatches.length > 10) {
      issues.push({
        type: 'style',
        severity: 'warning',
        description: '文稿包含较多行内 HTML，可能导致粘贴后样式丢失。',
      })
    }
  }

  if (analysis.mediaStats.images > 30) {
    issues.push({
      type: 'media',
      severity: 'warning',
      description: '图片数量较多，建议在微信后台压缩或拆分部分素材。',
    })
  }

  if (analysis.mediaStats.tables > 6) {
    issues.push({
      type: 'style',
      severity: 'warning',
      description: '复杂表格超过 6 个，粘贴后建议逐一检查对齐情况。',
    })
  }

  if (renderResult.durationMs > 1000) {
    issues.push({
      type: 'style',
      severity: 'info',
      description: `渲染耗时 ${Math.round(renderResult.durationMs)}ms，可适度拆分章节以提升体验。`,
    })
  }

  let successRate = computeSuccessRate(issues)
  if (successRate < 95 && issues.length === 0) {
    successRate = 95
  }

  const report: CompatibilityReport = {
    id: nanoid(),
    draftId: draft.id,
    themeId: options.themeId,
    successRate,
    issues,
    testedAt: new Date().toISOString(),
    testSource: 'manual',
    evidenceUrl: null,
    recommendedActions: analysis.recommendedActions,
  }

  return report
}

function computeSuccessRate(issues: CompatibilityIssue[]): number {
  let score = 100
  for (const issue of issues) {
    if (issue.severity === 'critical') {
      score -= 25
    } else if (issue.severity === 'warning') {
      score -= 8
    } else if (issue.severity === 'info') {
      score -= 3
    }
  }
  return Math.max(50, Math.min(100, score))
}

function countExternalLinks(markdown: string): number {
  const matches = markdown.match(EXTERNAL_LINK_REGEX) ?? []
  return matches.filter((match) => !match.includes('mp.weixin.qq.com')).length
}

function mapWarningType(type: 'link' | 'style' | 'media' | 'unknown'): CompatibilityIssue['type'] {
  switch (type) {
    case 'link':
    case 'style':
    case 'media':
      return type
    default:
      return 'unknown'
  }
}
