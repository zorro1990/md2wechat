/// <reference lib="webworker" />

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  RenderRequest,
  RenderResponse,
  WorkerRequestMessage,
  WorkerResponseMessage,
} from '@/conversion/contracts'
import { decodeNamedCharacterReference } from '@/conversion/decodeNamed'

type RenderModule = typeof import('@/conversion/render')

const DEBUG = true
let inFlight = 0

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope

const entityCache = new Map<string, string>()

ensureDocumentShim()

if (DEBUG) {
  console.log('[worker] bootstrapped')
}

let renderModulePromise: Promise<RenderModule> | null = null

function loadRenderModule(): Promise<RenderModule> {
  if (!renderModulePromise) {
    renderModulePromise = import('@/conversion/render')
      .then((module) => {
        // Patch decodeNamedCharacterReference if the module exports a DOM-based version.
        const decoder = (module as unknown as { decodeNamedCharacterReference?: (value: string) => string | false })
          .decodeNamedCharacterReference
        if (decoder && decoder.length === 1) {
          ;(module as any).decodeNamedCharacterReference = (value: string) => {
            if (entityCache.has(value)) return entityCache.get(value) ?? false
            const decoded = decodeNamedCharacterReference(value)
            if (typeof decoded === 'string') {
              entityCache.set(value, decoded)
              return decoded
            }
            return false
          }
        }
        return module
      })
  }
  return renderModulePromise
}

ctx.addEventListener('message', async (event: MessageEvent<WorkerRequestMessage>) => {
  const { id, type, payload } = event.data
  const receivedAt = performance.now()
  inFlight += 1
  if (DEBUG) {
    console.log('[worker] received', { id, type, inFlight })
  }

  try {
    if (type === 'render') {
      const result = await handleRender(payload)
      respond({ id, type, payload: result })
      if (DEBUG) {
        console.log('[worker] render success', { id, duration: performance.now() - receivedAt })
      }
      return
    }

    if (type === 'analyze') {
      const result = await handleAnalyze(payload)
      respond({ id, type, payload: result })
      if (DEBUG) {
        console.log('[worker] analyze success', { id, duration: performance.now() - receivedAt })
      }
      return
    }

    respond({ id, type: 'error', error: `Unknown message type: ${type}` })
  } catch (error) {
    respond({ id, type: 'error', error: error instanceof Error ? error.message : String(error) })
    if (DEBUG) {
      console.error('[worker] error', { id, type, message: error instanceof Error ? error.message : error })
    }
  } finally {
    inFlight = Math.max(0, inFlight - 1)
  }
})

ctx.addEventListener('error', (event) => {
  if (DEBUG) {
    console.error('[worker] unhandled error', event.message)
  }
})

function respond(message: WorkerResponseMessage) {
  ctx.postMessage(message)
}

async function handleRender(request: RenderRequest): Promise<RenderResponse> {
  const module = await loadRenderModule()
  return module.renderMarkdownDocument(request.markdown, {
    themeId: request.themeId,
    enableFootnoteLinks: request.options?.enableFootnoteLinks,
    fontSize: request.options?.fontSize,
  })
}

async function handleAnalyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const module = await loadRenderModule()
  return module.analyzeMarkdownDocument(request.markdown)
}

function ensureDocumentShim(): void {
  const globalScope = globalThis as typeof globalThis & {
    document?: unknown
    window?: typeof globalThis
  }

  if (typeof globalScope.document !== 'undefined') {
    return
  }

  const ELEMENT_NODE = 1
  const TEXT_NODE = 3

  class NodeShim {
    protected _textContent = ''
    public readonly nodeType: number
    public readonly ownerDocument: DocumentShim

    constructor(nodeType: number, ownerDocument: DocumentShim) {
      this.nodeType = nodeType
      this.ownerDocument = ownerDocument
    }

    get textContent(): string {
      return this._textContent
    }

    set textContent(value: string | null) {
      this._textContent = value ?? ''
    }
  }

  class TextNodeShim extends NodeShim {
    constructor(text: string, ownerDocument: DocumentShim) {
      super(TEXT_NODE, ownerDocument)
      this.textContent = text
    }

    get data(): string {
      return this.textContent
    }

    set data(value: string) {
      this.textContent = value
    }

    get nodeValue(): string {
      return this.textContent
    }

    set nodeValue(value: string) {
      this.textContent = value
    }
  }

  class ElementShim extends NodeShim {
    private _innerHTML = ''
    private _children: NodeShim[] = []
    private readonly _attributes = new Map<string, string>()
    public readonly tagName: string

    constructor(tagName: string, ownerDocument: DocumentShim) {
      super(ELEMENT_NODE, ownerDocument)
      this.tagName = tagName
    }

    get innerHTML(): string {
      return this._innerHTML
    }

    set innerHTML(value: string | null) {
      const normalized = value ?? ''
      this._innerHTML = normalized
      const decoded = decodeHtmlFragment(normalized)
      this._children = decoded ? [new TextNodeShim(decoded, this.ownerDocument)] : []
      this.textContent = decoded
    }

    appendChild<T extends NodeShim>(child: T): T {
      this._children.push(child)
      this.textContent = this._children.map((node) => node.textContent).join('')
      return child
    }

    cloneNode(deep = false): ElementShim {
      const clone = new ElementShim(this.tagName, this.ownerDocument)
      clone._innerHTML = this._innerHTML
      clone.textContent = this.textContent
      this._attributes.forEach((value, key) => {
        clone._attributes.set(key, value)
      })
      if (deep) {
        this._children.forEach((child) => {
          if (child instanceof ElementShim) {
            clone.appendChild(child.cloneNode(true))
          } else {
            clone.appendChild(new TextNodeShim(child.textContent, this.ownerDocument))
          }
        })
      }
      return clone
    }

    get firstChild(): NodeShim | null {
      return this._children[0] ?? null
    }

    setAttribute(name: string, value: string) {
      this._attributes.set(name, String(value))
    }

    getAttribute(name: string): string | null {
      return this._attributes.has(name) ? this._attributes.get(name)! : null
    }
  }

  class DocumentShim {
    readonly head: ElementShim
    readonly body: ElementShim
    readonly documentElement: ElementShim
    readonly defaultView: typeof globalThis

    constructor() {
      this.documentElement = new ElementShim('html', this)
      this.head = new ElementShim('head', this)
      this.body = new ElementShim('body', this)
      this.documentElement.appendChild(this.head)
      this.documentElement.appendChild(this.body)
      this.defaultView = globalScope as any
    }

    createElement(tagName: string): ElementShim {
      return new ElementShim(tagName, this)
    }

    createTextNode(text: string): TextNodeShim {
      return new TextNodeShim(text, this)
    }
  }

  function decodeHtmlFragment(fragment: string): string {
    if (!fragment) return ''
    const withoutTags = fragment.replace(/<\/?[^>]+>/g, '')
    if (!withoutTags.includes('&')) {
      return withoutTags
    }
    return decodeEntities(withoutTags)
  }

  function decodeEntities(value: string): string {
    let result = ''
    let index = 0
    while (index < value.length) {
      const char = value[index]
      if (char !== '&') {
        result += char
        index += 1
        continue
      }

      const semicolonIndex = value.indexOf(';', index + 1)
      if (semicolonIndex === -1) {
        result += '&'
        index += 1
        continue
      }

      const raw = value.slice(index + 1, semicolonIndex)
      const resolved = resolveEntity(raw)
      if (resolved) {
        result += resolved
        index = semicolonIndex + 1
      } else {
        result += '&'
        index += 1
      }
    }
    return result
  }

  function resolveEntity(raw: string): string | null {
    if (!raw) return null

    if (raw[0] === '#') {
      const isHex = raw[1]?.toLowerCase() === 'x'
      const numeric = Number.parseInt(raw.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      if (Number.isNaN(numeric)) {
        return null
      }
      try {
        return String.fromCodePoint(numeric)
      } catch {
        return null
      }
    }

    const direct = decodeNamedCharacterReference(raw)
    if (typeof direct === 'string') {
      return direct
    }

    for (let index = raw.length - 1; index > 0; index -= 1) {
      const candidate = raw.slice(0, index)
      const decoded = decodeNamedCharacterReference(candidate)
      if (typeof decoded === 'string') {
        const remainder = raw.slice(index)
        return decoded + (remainder ? remainder + ';' : ';')
      }
    }

    return null
  }

  const documentShim = new DocumentShim()
  ;(globalScope as any).document = documentShim
  if (typeof globalScope.window === 'undefined') {
    ;(globalScope as any).window = globalScope
  }
}
