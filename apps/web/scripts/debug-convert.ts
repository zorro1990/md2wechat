import { JSDOM } from 'jsdom'
import { convertToInlineStyles } from '../src/conversion/inline-style-converter'
import { getThemePreset } from '../src/themes/presets'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')

Object.defineProperty(globalThis, 'window', { value: dom.window })
Object.defineProperty(globalThis, 'document', { value: dom.window.document })
Object.defineProperty(globalThis, 'DOMParser', { value: dom.window.DOMParser })
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator })

const html = `
<div class="wx-content">
  <h1 class="wx-heading">标题</h1>
  <h2 class="wx-heading">副标题</h2>
  <p>正文段落</p>
</div>
`

const theme = getThemePreset('chinese')
const converted = convertToInlineStyles(html, theme)
console.log(converted)
