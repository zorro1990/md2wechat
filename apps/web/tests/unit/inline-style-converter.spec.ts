/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import { convertToInlineStyles } from '@/conversion/inline-style-converter'
import { getThemePreset } from '@/themes/presets'

describe('inline-style-converter', () => {
  beforeEach(() => {
    // 使用 JSDOM 提供真实的 DOM 环境
    const dom = new JSDOM('<!DOCTYPE html><html><body><div class="content"></div></body></html>')

    // 设置全局的 document 和 DOMParser
    global.document = dom.window.document
    global.DOMParser = dom.window.DOMParser

    // 提供 HTMLInputElement 等 Web API
    global.HTMLElement = dom.window.HTMLElement
    global.Element = dom.window.Element
    global.Node = dom.window.Node
  })

  describe('convertToInlineStyles', () => {
    it('should convert basic HTML elements', () => {
      const html = '<h1>Title</h1><p>Paragraph</p>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toBeDefined()
    })

    it('should apply theme tokens to headings', () => {
      const html = '<h1>Title</h1>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('h1')
    })

    it('should remove class and id attributes', () => {
      const html = '<div class="test" id="test">Content</div>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).not.toContain('class=')
      expect(result).not.toContain('id=')
    })

    // ========== V2: Chinese Theme Structured Styles Tests ==========

    it('should preserve Chinese theme container styles equivalent to .content', () => {
      const html = '<h1>标题</h1>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')

      // 验证容器存在且样式正确
      const container = doc.body.firstElementChild as HTMLElement
      expect(container).toBeTruthy()
      expect(container.tagName).toBe('DIV')

      const style = container.getAttribute('style') || ''
      expect(style).toContain('background-color: #ffffff')
      expect(style).toContain('padding: 30px')
      expect(style).toContain('box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05)')
      expect(style).toContain('max-width: 800px')
      expect(style).toContain('border: 1px solid #e0e0e0')
    })

    it('should apply H1 styles with dash border', () => {
      const html = '<h1>主标题</h1>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')

      const h1 = doc.querySelector('h1')
      expect(h1?.getAttribute('style')).toContain('color: #a72f2f')
      expect(h1?.getAttribute('style')).toContain('font-size: 1.9em')
      expect(h1?.getAttribute('style')).toContain('font-weight: 500')
      expect(h1?.getAttribute('style')).toContain('text-align: center')
      expect(h1?.getAttribute('style')).toContain('padding-bottom: 15px')
      expect(h1?.getAttribute('style')).toContain('margin: 25px 0 35px')
      // 虚线用 border-bottom 实现
      expect(h1?.getAttribute('style')).toContain('border-bottom:')
      expect(h1?.getAttribute('style')).toContain('dashed')
    })

    it('should apply H2 gradient background', () => {
      const html = '<h2>副标题</h2>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')

      const h2 = doc.querySelector('h2')
      expect(h2?.getAttribute('style')).toContain('background-image:')
      expect(h2?.getAttribute('style')).toContain('linear-gradient')
      expect(h2?.getAttribute('style')).toContain('135deg')
    })

    it('should apply UL marker with Chinese bullet', () => {
      const html = '<ul><li>项目一</li><li>项目二</li></ul>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')

      // 验证列表样式
      const ul = doc.querySelector('ul')
      expect(ul?.getAttribute('style')).toContain('list-style: none')
      expect(ul?.getAttribute('style')).toContain('padding-left: 0')

      // 验证 marker 存在且为 '·'
      const markers = doc.querySelectorAll('[data-wx-marker="true"]')
      expect(markers.length).toBe(2) // 两个 li
      expect(markers[0]?.textContent).toBe('·')
      expect(markers[1]?.textContent).toBe('·')

      // 验证 marker 样式
      const markerStyle = markers[0]?.getAttribute('style')
      expect(markerStyle).toContain('color: #a72f2f')
      expect(markerStyle).toContain('position: absolute')
      expect(markerStyle).toContain('left: 8px')
    })

    it('should apply blockquote left border', () => {
      const html = '<blockquote>引用内容</blockquote>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')

      const blockquote = doc.querySelector('blockquote')
      expect(blockquote?.getAttribute('style')).toContain('background-color: #fdfdfb')
      expect(blockquote?.getAttribute('style')).toContain('border-left: 3px solid #a72f2f')
    })

    it('should apply link styles with border bottom', () => {
      const html = '<a href="#">链接文本</a>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')

      const link = doc.querySelector('a')
      expect(link?.getAttribute('style')).toContain('color: #a72f2f')
      expect(link?.getAttribute('style')).toContain('text-decoration: none')
      expect(link?.getAttribute('style')).toContain('font-weight: 600')
      expect(link?.getAttribute('style')).toContain('border-bottom: 1px solid rgba(167, 47, 47, 0.3)')
    })

    it('should handle CTA link with proper template', () => {
      const html = '<a class="wx-cta-link">立即注册</a>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')

      const cta = doc.querySelector('a')
      expect(cta?.getAttribute('style')).toContain('display: inline-block')
      expect(cta?.getAttribute('style')).toContain('padding: 12px 28px')
      expect(cta?.getAttribute('style')).toContain('background: #a72f2f')
      expect(cta?.getAttribute('style')).toContain('border-radius: 999px')
      expect(cta?.getAttribute('style')).toContain('font-weight: 600')
      expect(cta?.getAttribute('style')).toContain('color: #ffffff')
    })

    it('should handle CTA links', () => {
      const html = '<a class="wx-cta-link">立即注册</a>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('display: inline-block')
      expect(result).toContain('border-radius')
    })

    it('should handle pills', () => {
      const html = '<span class="wx-pill">标签</span>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('display: inline-flex')
      expect(result).toContain('border-radius')
    })

    it('should handle alert cards', () => {
      const html = '<div class="wx-alert">提示信息</div>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('margin: 24px 0')
      expect(result).toContain('border-radius')
    })

    it('should handle tables', () => {
      const html = `
        <table>
          <tr><th>Header</th></tr>
          <tr><td>Cell</td></tr>
        </table>
      `
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('border-collapse')
      expect(result).toContain('width: 100%')
    })

    it('should replace icon fonts with SVG', () => {
      const html = '<i class="icon-check"></i>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('<svg')
      expect(result).toContain('</svg>')
    })

    it('should apply base styles to paragraphs', () => {
      const html = '<p>Paragraph text</p>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('margin: 16px 0')
      expect(result).toContain('line-height')
    })

    it('should apply list styles', () => {
      const html = '<ul><li>Item</li></ul>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('padding-left')
    })

    it('should apply code block styles', () => {
      const html = '<pre><code>code</code></pre>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('font-family')
      expect(result).toContain('background')
    })

    it('should remove script and style tags', () => {
      const html = '<script>alert("test")</script><style>body{color:red}</style><p>Content</p>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).not.toContain('<script')
      expect(result).not.toContain('<style')
      expect(result).toContain('<p>')
    })
  })

  describe('theme-specific styles', () => {
    const themes = ['chinese', 'bytedance', 'memphis', 'renaissance', 'minimalist', 'cyberpunk']

    themes.forEach((themeId) => {
      it(`should apply ${themeId} theme styles`, () => {
        const html = '<h1>Title</h1><p>Paragraph</p>'
        const theme = getThemePreset(themeId)

        const result = convertToInlineStyles(html, theme)

        expect(result).toBeDefined()
        expect(result).toContain('h1')
        expect(result).toContain('p')
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty HTML', () => {
      const html = ''
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toBeDefined()
    })

    it('should handle nested elements', () => {
      const html = '<div><p>Text</p><a>Link</a></div>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).toContain('<p>')
      expect(result).toContain('<a>')
    })

    it('should handle elements with multiple classes', () => {
      const html = '<div class="wx-theme chinese wx-heading">Content</div>'
      const theme = getThemePreset('chinese')

      const result = convertToInlineStyles(html, theme)

      expect(result).not.toContain('class=')
    })
  })

  // ========== Global Styles Tests (ChatGPT-5 Feedback) ==========

  it('should apply global page styles (font, background)', () => {
    const html = '<h1>标题</h1>'
    const theme = getThemePreset('chinese')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    // ✅ 验证外层页面div存在
    const outerPage = doc.body.firstElementChild as HTMLElement
    expect(outerPage).toBeTruthy()

    // ✅ 验证页面样式：字体、行高、颜色、背景色
    const pageStyle = outerPage.getAttribute('style')
    expect(pageStyle).toContain('font-family:')
    expect(pageStyle).toContain('line-height: 1.9')
    expect(pageStyle).toContain('color: #333333')
    expect(pageStyle).toContain('background-color: #f7f6f2')
  })

  it('should wrap content in double-layer container', () => {
    const html = '<h1>标题</h1>'
    const theme = getThemePreset('chinese')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    // ✅ 验证外层页面div（浅米色背景）
    const outerPage = doc.body.firstElementChild as HTMLElement
    expect(outerPage?.getAttribute('style')).toContain('background-color: #f7f6f2')

    // ✅ 验证内层容器div（白色内容背景）
    const innerContainer = outerPage?.firstElementChild as HTMLElement
    expect(innerContainer?.getAttribute('style')).toContain('background-color: #ffffff')

    // ✅ 验证内层容器有内容
    expect(innerContainer?.innerHTML).toContain('<h1>标题</h1>')
  })

  it('should apply repeating-linear-gradient to H2', () => {
    const html = '<h2>副标题</h2>'
    const theme = getThemePreset('chinese')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    const h2 = doc.querySelector('h2')
    const h2Style = h2?.getAttribute('style')

    // ✅ 验证使用 repeating-linear-gradient（不是普通 linear-gradient）
    expect(h2Style).toContain('repeating-linear-gradient')
    expect(h2Style).toContain('135deg')
  })

  // ========== V2: All Themes Structured Styles Tests ==========

  it('should apply Memphis theme with colorful list markers', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li></ul>'
    const theme = getThemePreset('memphis')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    // 验证 list markers 存在且有样式
    const markers = doc.querySelectorAll('[data-wx-marker="true"]')
    expect(markers.length).toBe(4)

    // 验证每个标记都有样式
    markers.forEach(marker => {
      const style = marker.getAttribute('style') || ''
      expect(style).toBeTruthy()
      // 应该有position, background-color, border-radius等
      expect(style).toContain('position:')
      expect(style).toContain('background-color:')
      expect(style).toContain('border-radius:')
    })
  })

  it('should apply ByteDance theme with gradient H2', () => {
    const html = '<h2>ByteDance标题</h2>'
    const theme = getThemePreset('bytedance')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    const h2 = doc.querySelector('h2')
    const style = h2?.getAttribute('style') || ''

    // 验证渐变背景
    expect(style).toContain('background-image:')
    expect(style).toContain('linear-gradient')
    expect(style).toContain('135deg')
    expect(style).toContain('#2970FF')
    expect(style).toContain('#5A98FF')
  })

  it('should apply Cyberpunk theme with glow effects', () => {
    const html = '<h1>Cyber Title</h1>'
    const theme = getThemePreset('cyberpunk')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    const h1 = doc.querySelector('h1')
    const style = h1?.getAttribute('style') || ''

    // 验证发光效果
    expect(style).toContain('text-shadow')
    expect(style).toContain('#f0f')
  })

  it('should apply Renaissance theme with decorative elements', () => {
    const html = '<h1>Renaissance Title</h1>'
    const theme = getThemePreset('renaissance')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    const h1 = doc.querySelector('h1')
    const style = h1?.getAttribute('style') || ''

    // 验证装饰样式
    expect(style).toContain('color: #9B2226')
    expect(style).toContain('text-transform: uppercase')
    expect(style).toContain('letter-spacing')
  })

  it('should apply Minimalist theme with counter', () => {
    const html = '<h2>Minimalist H2</h2>'
    const theme = getThemePreset('minimalist')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    const h2 = doc.querySelector('h2')
    const style = h2?.getAttribute('style') || ''

    // 验证计数器相关样式
    expect(style).toContain('counter-increment')
  })

  it('should apply double-layer container for all themes with page styles', () => {
    const html = '<p>Content</p>'
    const themes = ['chinese', 'memphis', 'bytedance', 'renaissance', 'minimalist', 'cyberpunk']

    themes.forEach(themeId => {
      const theme = getThemePreset(themeId)
      const result = convertToInlineStyles(html, theme)
      const parser = new DOMParser()
      const doc = parser.parseFromString(result, 'text/html')

      const outerContainer = doc.body.firstElementChild as HTMLElement
      const innerContainer = outerContainer?.firstElementChild as HTMLElement

      // 验证双层容器结构
      expect(outerContainer?.tagName).toBe('DIV')
      expect(innerContainer?.tagName).toBe('DIV')
    })
  })
})
