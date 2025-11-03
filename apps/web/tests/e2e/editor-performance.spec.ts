import { expect, test } from '@playwright/test'

import { TEST_DOCUMENTS } from '../../src/fixtures/test-cases'

const longDoc = TEST_DOCUMENTS.find((doc) => doc.id === 'long-article')!

test.describe('Editor performance', () => {
  test('renders long article within 1s', async ({ page }) => {
    await page.goto('/')

    const editorSelector = '[data-testid="markdown-editor"]'
    await page.waitForSelector('[data-testid="markdown-panel"][data-ready="true"]', { timeout: 10_000 })
    await page.fill(editorSelector, longDoc.markdown)

    await page.waitForFunction(
      () => {
        const metrics = (window as unknown as { __renderMetrics?: { durationMs: number }[] }).__renderMetrics ?? []
        return metrics.length > 0
      },
      undefined,
      { timeout: 8000 },
    )

    const { latestDuration, previewHtml } = await page.evaluate(() => {
      const metrics = (window as unknown as { __renderMetrics?: { durationMs: number }[] }).__renderMetrics ?? []
      const duration = metrics.at(-1)?.durationMs ?? Number.POSITIVE_INFINITY
      const preview = document.querySelector('[data-testid="wechat-preview"]')
      return { latestDuration: duration, previewHtml: preview?.innerHTML ?? '' }
    })

    expect(previewHtml).toContain('<h1')
    expect(latestDuration).toBeLessThanOrEqual(1000)
  })
})
