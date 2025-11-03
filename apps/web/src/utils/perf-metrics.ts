interface RenderMetric {
  draftId: string
  themeId: string
  durationMs: number
  timestamp: number
}

const renderMetrics: RenderMetric[] = []

export function recordRenderMetric(metric: RenderMetric) {
  renderMetrics.push(metric)
  if (renderMetrics.length > 100) {
    renderMetrics.shift()
  }
  if (typeof window !== 'undefined') {
    ;(window as unknown as { __renderMetrics?: RenderMetric[] }).__renderMetrics = [...renderMetrics]
  }
}

export function getRecentRenderMetrics(limit = 10): RenderMetric[] {
  return renderMetrics.slice(-limit)
}

export function getAverageRenderDuration(): number {
  if (renderMetrics.length === 0) return 0
  const total = renderMetrics.reduce((sum, item) => sum + item.durationMs, 0)
  return total / renderMetrics.length
}

export function resetRenderMetrics() {
  renderMetrics.length = 0
  if (typeof window !== 'undefined') {
    ;(window as unknown as { __renderMetrics?: RenderMetric[] }).__renderMetrics = []
  }
}
