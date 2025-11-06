import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

import { createMarkdownPipeline, type MarkdownPipeline, type PipelineOptions } from '@/conversion/pipeline'
import { convertToInlineStyles } from '@/conversion/inline-style-converter'
import { getThemePreset } from '@/themes/presets'
import type { AnalyzeResponse, CompatibilityWarning, RenderResponse } from '@/conversion/contracts'

const analyzer = remark().use(remarkParse).use(remarkGfm)
const pipelineCache = new Map<string, MarkdownPipeline>()
const EXTERNAL_LINK_REGEX = /\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/gi
const RAW_HTML_TAG_REGEX = /<\/?(iframe|script|style|form|input|video|audio)[^>]*>/gi
const INLINE_HTML_REGEX = /<\/?[a-z][^>]*>/gi

function getPipeline(options: PipelineOptions): MarkdownPipeline {
  const key = JSON.stringify(options)
  const existing = pipelineCache.get(key)
  if (existing) {
    return existing
  }
  const next = createMarkdownPipeline(options)
  pipelineCache.set(key, next)
  return next
}

export interface RenderMarkdownOptions {
  themeId?: string
  enableFootnoteLinks?: boolean
  fontSize?: 'small' | 'medium' | 'large'
}

// 字体大小映射表
export const FONT_SIZE_MAP = {
  small: '14px',
  medium: '15px',
  large: '16px',
} as const

export async function renderMarkdownDocument(
  markdown: string,
  options: RenderMarkdownOptions = {},
): Promise<RenderResponse> {
  const pipeline = getPipeline({
    enableFootnoteLinks: options.enableFootnoteLinks ?? true,
    themeId: options.themeId,
  })
  const startedAt = performance.now()
  const file = await pipeline.process(markdown)

  // 🔧 关键修复：应用内联样式转换器
  const themeId = options.themeId ?? 'chinese'
  const theme = getThemePreset(themeId)
  const htmlWithInlineStyles = convertToInlineStyles(String(file.value), theme)

  // 🎨 应用用户选择的字体大小
  const fontSizeValue = FONT_SIZE_MAP[options.fontSize ?? 'medium']
  const htmlWithFontSize = `<div style="font-size: ${fontSizeValue};">${htmlWithInlineStyles}</div>`

  const durationMs = performance.now() - startedAt
  if (import.meta.env?.DEV) {
    console.debug('[renderMarkdownDocument] completed', {
      durationMs: Number(durationMs.toFixed(2)),
      length: markdown.length,
      themeId,
      originalHtmlLength: String(file.value).length,
      convertedHtmlLength: htmlWithInlineStyles.length,
    })
  }

  return {
    html: htmlWithFontSize, // ✅ 使用包含字体大小的HTML
    astVersion: Date.now(),
    durationMs,
    warnings: [],
  }
}

export function analyzeMarkdownDocument(
  markdown: string,
): Pick<AnalyzeResponse, 'wordCount' | 'mediaStats' | 'compatibilityHints' | 'recommendedActions'> {
  const ast = analyzer.parse(markdown)
  let imageCount = 0
  let tableCount = 0
  let codeBlockCount = 0

  visit(ast, (node) => {
    switch (node.type) {
      case 'image':
      case 'imageReference':
        imageCount += 1
        break
      case 'table':
        tableCount += 1
        break
      case 'code':
        codeBlockCount += 1
        break
      default:
    }
  })

  const wordCount = countWords(markdown)
  const compatibilityHints: CompatibilityWarning[] = []
  const recommendedActions = new Set<string>()

  const externalLinks = (markdown.match(EXTERNAL_LINK_REGEX) ?? []).filter(
    (match) => !match.includes('mp.weixin.qq.com'),
  ).length
  if (externalLinks > 8) {
    compatibilityHints.push({
      type: 'link',
      severity: 'warning',
      message: `检测到 ${externalLinks} 个外部链接，建议转为脚注以避免被微信拦截。`,
    })
    recommendedActions.add('将部分外部链接改为脚注或正文说明。')
  } else if (externalLinks > 4) {
    compatibilityHints.push({
      type: 'link',
      severity: 'info',
      message: `外部链接数量为 ${externalLinks}，请确认均指向可信站点。`,
    })
  }

  const rawHtmlMatches = markdown.match(RAW_HTML_TAG_REGEX)
  if (rawHtmlMatches?.length) {
    compatibilityHints.push({
      type: 'media',
      severity: 'critical',
      message: '检测到微信不支持的 iframe/script 等标签，粘贴后会被直接移除。',
    })
    recommendedActions.add('删除 iframe/script 等嵌入标签或改为截图/文字链接。')
  } else {
    const inlineHtmlMatches = markdown.match(INLINE_HTML_REGEX)
    if (inlineHtmlMatches && inlineHtmlMatches.length > 40) {
      compatibilityHints.push({
        type: 'style',
        severity: 'warning',
        message: '文稿包含大量自定义 HTML，可能与微信样式冲突。',
      })
      recommendedActions.add('尽量减少自定义 HTML，改用 Markdown 语法或内置组件。')
    }
  }

  if (imageCount > 30) {
    compatibilityHints.push({
      type: 'media',
      severity: 'warning',
      message: '图片数量超过 30 张，建议压缩或拆分章节以保证加载体验。',
    })
  }

  if (tableCount > 6) {
    compatibilityHints.push({
      type: 'style',
      severity: 'warning',
      message: '复杂表格超过 6 个，粘贴后需逐一核对边框与合并单元格。',
    })
    recommendedActions.add('考虑将部分表格转为图片或列表形式。')
  }

  if (codeBlockCount > 12) {
    compatibilityHints.push({
      type: 'style',
      severity: 'info',
      message: '代码块数量较多，微信粘贴后建议切换等宽字体核对缩进。',
    })
  }

  if (wordCount > 6000) {
    compatibilityHints.push({
      type: 'style',
      severity: 'info',
      message: '长文篇幅较大，建议按章节拆分发布以降低加载时间。',
    })
    recommendedActions.add('将长篇内容拆分为多篇系列文章或添加目录。')
  }

  return {
    wordCount,
    mediaStats: {
      images: imageCount,
      tables: tableCount,
      codeBlocks: codeBlockCount,
    },
    compatibilityHints,
    recommendedActions: Array.from(recommendedActions),
  }
}

function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
}
