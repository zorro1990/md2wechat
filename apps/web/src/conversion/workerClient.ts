import { nanoid } from 'nanoid/non-secure'

import { renderMarkdownDocument } from '@/conversion/render'
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  RenderRequest,
  RenderResponse,
  WorkerRequestMessage,
  WorkerResponseMessage,
} from '@/conversion/contracts'

const worker = new Worker(new URL('@/workers/conversion.worker.ts', import.meta.url), {
  type: 'module',
})

if (import.meta.env.DEV) {
  worker.addEventListener('error', (event) => {
    console.error('[workerClient] worker error', {
      type: event.type,
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error?.stack,
      event,
    })
  })
  worker.addEventListener('messageerror', (event) => {
    console.error('[workerClient] worker messageerror', event.data)
  })
}

const pending = new Map<string, (message: WorkerResponseMessage) => void>()
const requestTimings = new Map<string, number>()

worker.addEventListener('message', (event: MessageEvent<WorkerResponseMessage>) => {
  const resolver = pending.get(event.data.id)
  if (resolver) {
    pending.delete(event.data.id)
    resolver(event.data)
  }
})

function postToWorker(message: WorkerRequestMessage): Promise<WorkerResponseMessage> {
  return new Promise((resolve, reject) => {
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
    requestTimings.set(message.id, startedAt)

    const timeoutId = window.setTimeout(() => {
      if (pending.delete(message.id)) {
        if (import.meta.env.DEV) {
          console.warn('[workerClient] request timed out', message.type)
        }
        requestTimings.delete(message.id)
        reject(new Error(`[workerClient] request timed out for ${message.type}`))
      }
    }, 7000)

    pending.set(message.id, (response) => {
      clearTimeout(timeoutId)
      if (response.type === 'error') {
        reject(new Error(response.error))
      } else {
        if (import.meta.env.DEV) {
          const started = requestTimings.get(message.id) ?? startedAt
          const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
          const elapsed = finishedAt - started
          console.debug('[workerClient] response', response.type, `${elapsed.toFixed(1)}ms`)
        }
        requestTimings.delete(message.id)
        resolve(response)
      }
    })
    if (import.meta.env.DEV) {
      console.debug('[workerClient] send', message.type, message.id)
    }
    worker.postMessage(message)
  })
}

export async function renderMarkdown(payload: RenderRequest): Promise<RenderResponse> {
  try {
    const message: WorkerRequestMessage = { id: nanoid(), type: 'render', payload }
    const response = await postToWorker(message)
    if (response.type !== 'render') {
      throw new Error(`Unexpected worker response type: ${response.type}`)
    }
    return response.payload
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[workerClient] render fallback', error)
    }
    return renderMarkdownDocument(payload.markdown, {
      themeId: payload.themeId,
      enableFootnoteLinks: payload.options?.enableFootnoteLinks,
    })
  }
}

export async function analyzeMarkdown(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
  const message: WorkerRequestMessage = { id: nanoid(), type: 'analyze', payload }
  const response = await postToWorker(message)
  if (response.type !== 'analyze') {
    throw new Error(`Unexpected worker response type: ${response.type}`)
  }
  return response.payload
}
