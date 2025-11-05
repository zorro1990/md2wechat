import { JSDOM } from 'jsdom'
import { convertToInlineStyles } from '../src/conversion/inline-style-converter'
import { getThemePreset } from '../src/themes/presets'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
Object.defineProperty(globalThis, 'window', { value: dom.window })
Object.defineProperty(globalThis, 'document', { value: dom.window.document })
Object.defineProperty(globalThis, 'DOMParser', { value: dom.window.DOMParser })
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator })

const theme = getThemePreset('chinese')
const sourceHtml = `
<div class="wx-content">
  <h1 class="wx-heading">标题</h1>
  <h2 class="wx-heading">副标题</h2>
  <a class="wx-cta-link">立即查看</a>
</div>
`

const first = convertToInlineStyles(sourceHtml, theme)
console.log('--- first pass snippet ---')
console.log(first.substring(0, 400))

const second = convertToInlineStyles(first, theme)
console.log('\n--- second pass snippet ---')
console.log(second.substring(0, 400))
