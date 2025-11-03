import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkRehype from 'remark-rehype'

import { wechatMappingPlugin } from '@/conversion/plugins/wechat-mapping'

export interface PipelineOptions {
  enableFootnoteLinks?: boolean
  themeId?: string
}

export type MarkdownPipeline = ReturnType<typeof remark>

const defaultRemarkPlugins = [remarkParse, remarkGfm]
const defaultRehypePlugins = [
  [remarkRehype, { allowDangerousHtml: true }],
  rehypeRaw,
  rehypeStringify,
] as const

export function createMarkdownPipeline(options: PipelineOptions = {}): MarkdownPipeline {
  const unified = remark()
  for (const plugin of defaultRemarkPlugins) {
    unified.use(plugin as never)
  }
  for (const plugin of defaultRehypePlugins) {
    const [handler, config] = Array.isArray(plugin) ? plugin : [plugin, undefined]
    unified.use(handler as never, config as never)
  }
  const headingClasses = ['wx-heading']
  const codeClasses = ['wx-code']
  if (options.themeId) {
    headingClasses.push(`wx-heading--${options.themeId}`)
    codeClasses.push(`wx-code--${options.themeId}`)
  }
  const linkClass = options.enableFootnoteLinks === false ? 'wx-link' : 'wx-link-footnote'
  unified.use(wechatMappingPlugin, { headingClass: headingClasses, codeClass: codeClasses, linkClass })
  return unified
}
