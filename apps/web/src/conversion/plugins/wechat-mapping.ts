import { visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'
import type { Plugin } from 'unified'

export interface WechatMappingOptions {
  headingClass?: string | string[]
  codeClass?: string | string[]
  linkClass?: string | string[]
}

const DEFAULT_OPTIONS: Required<WechatMappingOptions> = {
  headingClass: 'wx-heading',
  codeClass: 'wx-code',
  linkClass: 'wx-link-footnote',
}

export const wechatMappingPlugin: Plugin<[WechatMappingOptions?], Root> = (options = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options }

  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName?.startsWith('h')) {
        addClasses(node, config.headingClass)
      }
      if (node.tagName === 'code' || node.tagName === 'pre') {
        addClasses(node, config.codeClass)
      }
      if (node.tagName === 'a') {
        addClasses(node, config.linkClass)
        scrubExternalLink(node)
      }
      if ('properties' in node) {
        delete node.properties?.style
        ensureWechatSafeAttributes(node)
      }
    })
  }
}

function addClasses(node: Element, className: string | string[]) {
  const classesToAdd = normalizeClasses(className)
  if (classesToAdd.length === 0) return
  const properties = node.properties ?? {}
  const existing = Array.isArray(properties.className)
    ? (properties.className as string[])
    : typeof properties.className === 'string'
      ? (properties.className as string).split(/\s+/).filter(Boolean)
      : []
  const merged = new Set([...existing, ...classesToAdd])
  node.properties = { ...properties, className: Array.from(merged) }
}

function normalizeClasses(input?: string | string[]): string[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.flatMap((item) => item.split(/\s+/).map((token) => token.trim())).filter(Boolean)
  }
  return input.split(/\s+/).map((token) => token.trim()).filter(Boolean)
}

function scrubExternalLink(node: Element) {
  if (!node.properties) {
    node.properties = {}
  }
  node.properties.target = '_blank'
  node.properties.rel = 'noopener noreferrer nofollow'
}

const ALLOWED_ATTRIBUTES = new Set(['href', 'src', 'alt', 'title', 'rowspan', 'colspan', 'target', 'rel', 'className'])

function ensureWechatSafeAttributes(node: Element) {
  if (!node.properties) return
  for (const key of Object.keys(node.properties)) {
    if (!ALLOWED_ATTRIBUTES.has(key)) {
      delete node.properties[key]
    }
  }
}
