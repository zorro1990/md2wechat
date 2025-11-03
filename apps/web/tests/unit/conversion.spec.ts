import { describe, expect, test } from 'vitest'

import { TEST_DOCUMENTS } from '@/fixtures/test-cases'
import { analyzeMarkdownDocument, renderMarkdownDocument } from '@/conversion/render'

const shortDoc = TEST_DOCUMENTS.find((doc) => doc.id === 'short-intro')!

describe('renderMarkdownDocument', () => {
  test('converts headings, emphasis and links', async () => {
    const result = await renderMarkdownDocument(shortDoc.markdown)
    expect(result.html).toMatch(/<h1[^>]*class="[^"]*wx-heading[^"]*">MD2WeChat 简介<\/h1>/)
    expect(result.html).toContain('<strong>MD2WeChat</strong>')
    expect(result.html).toContain('class="wx-link-footnote"')
    expect(result.warnings).toEqual([])
  })

  test('produces deterministic astVersion progression', async () => {
    const first = await renderMarkdownDocument('# Title')
    const second = await renderMarkdownDocument('# Title')
    expect(second.astVersion).toBeGreaterThanOrEqual(first.astVersion)
  })

  test('respects footnote link toggle', async () => {
    const result = await renderMarkdownDocument('[产品主页](https://md2wechat.cn)', {
      enableFootnoteLinks: false,
    })
    expect(result.html).toContain('class="wx-link"')
    expect(result.html).not.toContain('wx-link-footnote')
  })

  test('includes theme-specific classes when requested', async () => {
    const result = await renderMarkdownDocument('# 标题', { themeId: 'tech' })
    expect(result.html).toMatch(/wx-heading--tech/)
  })
})

describe('analyzeMarkdownDocument', () => {
  test('calculates media statistics', () => {
    const sample = `![图示](https://example.com/image.png)\n\n| h | h |\n| - | - |\n| a | b |\n\n\`\`\`ts\nconst value = 1\n\`\`\``
    const result = analyzeMarkdownDocument(sample)
    expect(result.mediaStats.images).toBe(1)
    expect(result.mediaStats.tables).toBe(1)
    expect(result.mediaStats.codeBlocks).toBe(1)
    expect(result.compatibilityHints).toEqual([])
  })
})
