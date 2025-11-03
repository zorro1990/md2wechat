import { describe, expect, test } from 'vitest'

import { TEST_DOCUMENTS } from '@/fixtures/test-cases'
import { renderMarkdownDocument } from '@/conversion/render'

const longDoc = TEST_DOCUMENTS.find((doc) => doc.id === 'long-article')!

const CHUNK_SEPARATOR = /\n{2,}(?=#\s|##\s|###\s|!\[|\|)/g

describe('long document slicing diagnostics', () => {
  test('individual chunks render within budget', async () => {
    const chunks = longDoc.markdown
      .split(CHUNK_SEPARATOR)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0)

    const slowChunks: Array<{ index: number; duration: number; previewLength: number }> = []

    for (const [index, chunk] of chunks.entries()) {
      const result = await renderMarkdownDocument(chunk)
      if (result.durationMs > 500) {
        slowChunks.push({ index, duration: result.durationMs, previewLength: result.html.length })
      }
    }

    expect(slowChunks).toEqual([])
  })
})
