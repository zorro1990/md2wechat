/**
 * Enhanced HTML to Inline Style Converter
 *
 * This utility converts HTML with CSS classes to inline styles,
 * which is necessary for WeChat compatibility since it strips out
 * <style> tags and external stylesheets.
 *
 * Features:
 * - Maps .wx-* classes to inline styles using ThemePreset.tokens
 * - Supports component templates (CTA links, pills, cards)
 * - Replaces icon fonts with inline SVGs
 * - Enhances tables with borders and zebra striping
 * - Preserves spacing and typography
 * - Automatically adds background colors from theme
 * - V2: Structured theme styles with pseudo-element support
 * - V2: Complex list markers with nth-child patterns
 * - V2: Gradients, transforms, and special effects
 */

import type { ThemePreset } from '@/types'
import type { StyleProps, PseudoElementConfig, NthChildPattern } from '@/types'

// ========== V2 核心工具函数 ==========

/**
 * 安全的样式应用函数
 * 仅应用 StyleProps，不处理元数据
 */
function safeApplyStyles(element: HTMLElement, styles: StyleProps): void {
  Object.entries(styles).forEach(([prop, value]) => {
    const kebabProp = prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    element.style.setProperty(kebabProp, String(value))
  })
}

/**
 * 解析 nth-child 模式
 * index 从 1 开始（人类计数）
 * 支持：an+b、odd、even、纯数字
 */
function matchesNthChildPattern(index1Based: number, pattern: string): boolean {
  const trimmed = pattern.trim().toLowerCase()

  // 1. odd/even 特殊处理
  if (trimmed === 'odd') {
    return index1Based % 2 === 1
  }
  if (trimmed === 'even') {
    return index1Based % 2 === 0
  }

  // 2. 纯数字（如 "3" 表示第 3 个）
  if (/^\d+$/.test(trimmed)) {
    return index1Based === parseInt(trimmed)
  }

  // 3. an+b 形式（如 "4n+1", "3n", "2n+2"）
  const match = trimmed.match(/^(\d*)n(?:\+(\d+))?$/)
  if (match) {
    const a = match[1] ? parseInt(match[1]) : 1 // 默认 a=1
    const b = match[2] ? parseInt(match[2]) : 0 // 默认 b=0

    // 检查 index 是否满足 a*n + b (n >= 0)
    if (b === 0) {
      return index1Based % a === 0 && index1Based >= a
    } else {
      return (index1Based - b) >= 0 && (index1Based - b) % a === 0
    }
  }

  return false
}

/**
 * 应用伪元素替代（实际 DOM 元素）
 * 注意：content 属性在真实元素上无效，使用 textContent
 */
function applyPseudoElement(
  element: HTMLElement,
  pseudoType: 'before' | 'after',
  config: PseudoElementConfig
): void {
  // 幂等性检查：避免重复插入
  const existing = element.querySelector(`[data-wx-pseudo="${pseudoType}"]`)
  if (existing) {
    return
  }

  const pseudoElement = document.createElement('span')
  pseudoElement.setAttribute('data-wx-pseudo', pseudoType)
  pseudoElement.setAttribute('data-wx-content', config.content)

  // 设置定位
  pseudoElement.style.position = config.positioning
  pseudoElement.style.display = 'block'

  // 应用样式
  safeApplyStyles(pseudoElement, config.styles)

  // 设置内容（伪元素的 content 只能通过 textContent/innerHTML）
  pseudoElement.textContent = config.content

  // 插入到 DOM
  if (pseudoType === 'before') {
    element.insertBefore(pseudoElement, element.firstChild)
  } else {
    element.appendChild(pseudoElement)
  }
}

/**
 * 创建简单 marker
 */
function createSimpleMarker(
  config: NonNullable<import('@/types').ListMarkerConfig['simple']>,
  _parent: HTMLElement
): HTMLElement | null {
  const marker = document.createElement('span')
  marker.setAttribute('data-wx-marker', 'true')
  marker.textContent = config.symbol

  // 默认样式
  marker.style.cssText = `
    position: absolute;
    left: ${config.position?.left || '8px'};
    color: ${config.color};
    font-size: 1.2em;
    line-height: 1.4;
  `

  // 应用自定义样式
  if (config.styles) {
    safeApplyStyles(marker, config.styles)
  }

  return marker
}

/**
 * 创建 nth-child marker
 */
function createNthChildMarker(
  config: NthChildPattern,
  _parent: HTMLElement
): HTMLElement | null {
  const marker = document.createElement('span')
  marker.setAttribute('data-wx-marker', 'true')
  marker.setAttribute('data-wx-pattern', config.pattern)
  marker.textContent = config.content

  // Memphis 默认样式（旋转星形）
  marker.style.cssText = `
    position: absolute;
    left: 0;
    top: -5px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: white;
    font-size: 1.5em;
    line-height: 40px;
    text-align: center;
    transform: rotate(-10deg);
  `

  // 应用自定义样式
  safeApplyStyles(marker, config.styles)

  return marker
}

/**
 * 处理复杂列表 marker
 * 支持 Memphis 的 4 色循环、自定义生成等
 */
function processComplexListMarkers(
  listElement: HTMLElement,
  theme: ThemePreset
): void {
  const listItems = listElement.querySelectorAll('li')
  const markers = theme.structured?.lists?.ul?.markers

  if (!markers) return

  listItems.forEach((li, index) => {
    // 幂等性检查
    if (li.querySelector('[data-wx-marker="true"]')) {
      return
    }

    const listItem = li as HTMLElement
    listItem.style.position = 'relative'

    // 1. 简单 marker（Chinese/Renaissance）
    if (markers.simple) {
      const marker = createSimpleMarker(markers.simple, listItem)
      if (marker) {
        listItem.insertBefore(marker, listItem.firstChild)
        return // 命中即退出
      }
    }

    // 2. nth-child 循环（Memphis）
    if (markers.nthChild) {
      for (const nthConfig of markers.nthChild) {
        if (matchesNthChildPattern(index + 1, nthConfig.pattern)) {
          const marker = createNthChildMarker(nthConfig, listItem)
          if (marker) {
            listItem.insertBefore(marker, listItem.firstChild)
            break // 命中一个 pattern 后退出
          }
        }
      }
    }

    // 3. 自定义生成回调（Memphis: 星形+颜色）
    if (markers.custom) {
      const marker = markers.custom(index + 1, listItem)
      if (marker) {
        marker.setAttribute('data-wx-marker', 'true')
        listItem.insertBefore(marker, listItem.firstChild)
      }
    }
  })
}

/**
 * 获取转换后的容器
 * 避免依赖特定的 DOM 结构
 */
export function getConvertedContainer(result: string): HTMLElement {
  const parser = new DOMParser()
  const doc = parser.parseFromString(result, 'text/html')
  // 直接获取 body 的第一个子元素（包装容器）
  return doc.body.firstElementChild as HTMLElement
}

/**
 * 容器包装函数
 * 显式创建与 .content 等价的容器，包含伪元素装饰
 */
function wrapContentWithContainer(
  body: HTMLElement,
  theme: ThemePreset
): string {
  const bodyInnerHTML = body.innerHTML.trim()
  if (!bodyInnerHTML) return bodyInnerHTML

  // 获取文档对象（⚠️ 必须使用 doc.createElement，不能用全局 document）
  const doc = body.ownerDocument

  // 检查是否有 page 样式
  const hasPageStyles = !!theme.structured?.page

  if (hasPageStyles) {
    // ✅ 双层结构：外层页面 div + 内层内容容器 div
    const outerPage = doc.createElement('div')
    const innerContainer = doc.createElement('div')

    // 1. 应用页面样式到外层（替代 body.theme-chinese）
    if (theme.structured?.page?.styles) {
      safeApplyStyles(outerPage, theme.structured.page.styles)
    }

    // 2. 应用容器样式到内层（替代 .content）
    if (theme.structured?.container) {
      safeApplyStyles(innerContainer, theme.structured.container.styles)
    } else {
      // Fallback
      innerContainer.style.cssText = `
        background-color: ${theme.tokens['--wx-surface'] || '#ffffff'};
        padding: 30px;
        max-width: 800px;
        margin: 0 auto;
      `
    }

    // 3. 应用容器的伪元素到内层
    if (theme.structured?.container?.pseudoBefore) {
      applyPseudoElement(innerContainer, 'before', theme.structured.container.pseudoBefore)
    }
    if (theme.structured?.container?.pseudoAfter) {
      applyPseudoElement(innerContainer, 'after', theme.structured.container.pseudoAfter)
    }

    // 4. 应用装饰元素到内层
    if (theme.structured?.container?.decorations) {
      theme.structured.container.decorations.forEach(decoration => {
        const target = innerContainer
        const pseudoType = decoration.selector.includes('::before') ? 'before' : 'after'

        applyPseudoElement(target, pseudoType, {
          content: decoration.content,
          styles: decoration.styles,
          positioning: decoration.position
        })
      })
    }

    // 5. 包装内容到内层
    innerContainer.innerHTML = bodyInnerHTML

    // 6. 组装：内层放到外层
    outerPage.appendChild(innerContainer)

    return outerPage.outerHTML
  } else {
    // ✅ 单层结构：仅容器（向后兼容）
    const container = doc.createElement('div')

    // 1. 应用容器样式
    if (theme.structured?.container) {
      safeApplyStyles(container, theme.structured.container.styles)
    } else {
      // Fallback
      container.style.cssText = `
        background-color: ${theme.tokens['--wx-surface'] || '#ffffff'};
        padding: 30px;
        max-width: 800px;
        margin: 0 auto;
      `
    }

    // 2. 应用容器的伪元素（::before/::after）
    if (theme.structured?.container?.pseudoBefore) {
      applyPseudoElement(container, 'before', theme.structured.container.pseudoBefore)
    }
    if (theme.structured?.container?.pseudoAfter) {
      applyPseudoElement(container, 'after', theme.structured.container.pseudoAfter)
    }

    // 3. 应用装饰元素（Renaissance 等）
    if (theme.structured?.container?.decorations) {
      theme.structured.container.decorations.forEach(decoration => {
        const target = container
        const pseudoType = decoration.selector.includes('::before') ? 'before' : 'after'

        applyPseudoElement(target, pseudoType, {
          content: decoration.content,
          styles: decoration.styles,
          positioning: decoration.position
        })
      })
    }

    // 4. 包装内容
    container.innerHTML = bodyInnerHTML
    return container.outerHTML
  }
}

/**
 * 应用标题样式（处理变换、阴影、渐变等）
 */
function applyHeadingStyles(
  element: HTMLElement,
  config: NonNullable<ThemePreset['structured']>['headings']['h1'],
  _theme: ThemePreset
): void {
  // 1. 基础样式
  safeApplyStyles(element, config.styles)

  // 2. 变换（旋转等）
  if (config.transforms && config.transforms.length > 0) {
    element.style.transform = config.transforms.join(' ')
  }

  // 3. 阴影效果
  if (config.textShadow) {
    element.style.textShadow = config.textShadow
  }

  if (config.boxShadow) {
    element.style.boxShadow = config.boxShadow
  }

  // 4. 渐变背景 - ✅ 支持普通和 repeating 两种类型
  if (config.gradient) {
    const { type = 'linear', angle, colors } = config.gradient
    if (colors.length > 1) {
      const gradientType = type === 'repeating-linear' ? 'repeating-linear-gradient' : 'linear-gradient'
      const gradientStr = `${gradientType}(${angle}, ${colors.join(', ')})`
      element.style.backgroundImage = gradientStr
    }
  }

  // 5. Counter（Minimalist）
  if (config.counter?.reset) {
    element.style.counterReset = config.counter.reset
  }
  if (config.counter?.increment) {
    element.style.counterIncrement = config.counter.increment
  }

  // 6. 伪元素
  if (config.pseudoBefore) {
    applyPseudoElement(element, 'before', config.pseudoBefore)
  }
  if (config.pseudoAfter) {
    applyPseudoElement(element, 'after', config.pseudoAfter)
  }
}

/**
 * 应用列表样式
 */
function applyListStyles(
  element: HTMLElement,
  config: NonNullable<ThemePreset['structured']>['lists']['ul'],
  _isOrderedList: boolean
): void {
  // 1. 基础样式
  safeApplyStyles(element, config.styles)

  // 2. 列表样式
  if (config.listStyle) {
    element.style.listStyle = config.listStyle
  }
}

/**
 * 应用分隔符样式
 */
function applyDividerStyles(
  element: HTMLElement,
  config: NonNullable<ThemePreset['structured']>['dividers']
): void {
  // 1. 基础样式
  safeApplyStyles(element, config.styles)

  // 2. 斜条纹图案（Memphis）
  if (config.hasPattern && config.pattern) {
    const { angle, colors, size } = config.pattern
    const stripeStr = colors.map((color, i) =>
      `${color} ${i * parseInt(size) / colors.length}px, ${color} ${(i + 1) * parseInt(size) / colors.length}px`
    ).join(', ')
    element.style.backgroundImage = `repeating-linear-gradient(${angle}, ${stripeStr})`
    element.style.height = '8px'
  }
}

/**
 * 应用主题组件样式（新增）
 */
function applyThemeComponentStyles(element: HTMLElement, theme: ThemePreset): void {
  const tagName = element.tagName.toLowerCase()
  const structured = theme.structured

  if (!structured) return

  // 标题样式
  if (structured.headings) {
    if (tagName === 'h1' && structured.headings.h1) {
      applyHeadingStyles(element, structured.headings.h1, theme)
    } else if (tagName === 'h2' && structured.headings.h2) {
      applyHeadingStyles(element, structured.headings.h2, theme)
    } else if (tagName === 'h3' && structured.headings.h3) {
      applyHeadingStyles(element, structured.headings.h3, theme)
    } else if (tagName === 'h4' && structured.headings.h4) {
      applyHeadingStyles(element, structured.headings.h4, theme)
    }
  }

  // 列表样式
  if (tagName === 'ul' && structured.lists?.ul) {
    applyListStyles(element, structured.lists.ul, false)
  } else if (tagName === 'ol' && structured.lists?.ol) {
    applyListStyles(element, structured.lists.ol as any, true)
  }

  if (tagName === 'li' && structured.lists?.li) {
    safeApplyStyles(element, structured.lists.li.styles)

    if (structured.lists.li.pseudoBefore) {
      applyPseudoElement(element, 'before', structured.lists.li.pseudoBefore)
    }

    if (structured.lists.li.transforms) {
      element.style.transform = structured.lists.li.transforms.join(' ')
    }
  }

  // 分隔符样式
  if (tagName === 'hr' && structured.dividers) {
    applyDividerStyles(element, structured.dividers)
  }

  // 链接样式
  if (tagName === 'a' && structured.links) {
    safeApplyStyles(element, structured.links.styles)
    // 注意：hover 效果在微信中无效，但保留样式
  }

  // 引用块样式
  if (tagName === 'blockquote' && structured.blockquote) {
    safeApplyStyles(element, structured.blockquote.styles)

    if (structured.blockquote.pseudoBefore) {
      applyPseudoElement(element, 'before', structured.blockquote.pseudoBefore)
    }

    if (structured.blockquote.transforms) {
      element.style.transform = structured.blockquote.transforms.join(' ')
    }

    if (structured.blockquote.borderRadius) {
      element.style.borderRadius = structured.blockquote.borderRadius
    }
  }

  // 代码块样式
  if (tagName === 'pre' && structured.codeBlocks?.pre) {
    safeApplyStyles(element, structured.codeBlocks.pre)
  }

  if (tagName === 'code' && structured.codeBlocks?.code) {
    safeApplyStyles(element, structured.codeBlocks.code)
  }

  // 组件模板
  if (structured.components) {
    // CTA 链接
    if (tagName === 'a' && structured.components.ctaLink) {
      const link = element as HTMLAnchorElement
      if (link.textContent?.includes('立即') || link.textContent?.includes('查看更多')) {
        safeApplyStyles(link, structured.components.ctaLink)
      }
    }

    // 其他组件...
    const classList = element.classList
    if (classList.contains('wx-pill') && structured.components.pill) {
      safeApplyStyles(element, structured.components.pill)
    }
    if (classList.contains('wx-alert') && structured.components.alertCard) {
      safeApplyStyles(element, structured.components.alertCard)
    }
    // ... 其他卡片组件
  }
}

// ========== Component Templates ==========

/**
 * CTA链接模板
 */
const CTA_LINK_TEMPLATE = {
  'display': 'inline-block',
  'padding': '12px 28px',
  'background': 'var(--wx-accent)',
  'border-radius': '999px',
  'font-weight': '600',
  'color': 'var(--wx-accent-contrast)',
  'text-decoration': 'none',
  'text-align': 'center',
}

/**
 * 标签Pill模板
 */
const PILL_TEMPLATE = {
  'display': 'inline-flex',
  'align-items': 'center',
  'padding': '4px 12px',
  'border-radius': '999px',
  'background': '#fef3c7',
  'color': '#92400e',
  'font-size': '0.875em',
  'font-weight': '500',
}

/**
 * 提示卡片模板
 */
const ALERT_CARD_TEMPLATE = {
  'margin': '24px 0',
  'padding': '20px',
  'border-radius': '16px',
  'background': '#fff7ed',
  'border': '1px solid rgba(231, 111, 0, 0.15)',
}

/**
 * 信息卡片模板
 */
const INFO_CARD_TEMPLATE = {
  'margin': '24px 0',
  'padding': '20px',
  'border-radius': '16px',
  'background': '#eff6ff',
  'border': '1px solid rgba(59, 130, 246, 0.15)',
}

/**
 * 成功卡片模板
 */
const SUCCESS_CARD_TEMPLATE = {
  'margin': '24px 0',
  'padding': '20px',
  'border-radius': '16px',
  'background': '#f0fdf4',
  'border': '1px solid rgba(34, 197, 94, 0.15)',
}

/**
 * 警告卡片模板
 */
const WARNING_CARD_TEMPLATE = {
  'margin': '24px 0',
  'padding': '20px',
  'border-radius': '16px',
  'background': '#fefce8',
  'border': '1px solid rgba(234, 179, 8, 0.15)',
}

/**
 * 错误卡片模板
 */
const ERROR_CARD_TEMPLATE = {
  'margin': '24px 0',
  'padding': '20px',
  'border-radius': '16px',
  'background': '#fef2f2',
  'border': '1px solid rgba(239, 68, 68, 0.15)',
}

// ========== Icon Mapping ==========

/**
 * 图标字体映射到SVG
 */
const ICON_MAPPING: Record<string, string> = {
  'icon-arrow-right': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 3L5 4L8 7H2V9H8L5 12L6 13L11 8L6 3Z"/></svg>`,
  'icon-check': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 4.5L6 12L2.5 8.5L3.5 7.5L6 10L12.5 3.5L13.5 4.5Z"/></svg>`,
  'icon-warning': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L14 14H2L8 2ZM7 7H9V11H7V7ZM7 5H9V6H7V5Z"/></svg>`,
  'icon-error': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L14 14H2L8 2ZM6 5H10V6H6V5ZM6 7H10V11H6V7Z"/></svg>`,
  'icon-info': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.314 14 14 11.314 14 8C14 4.686 11.314 2 8 2ZM7 5H9V7H7V5ZM7 9H9V11H7V9Z"/></svg>`,
  'icon-star': `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L9.5 6.5H14.5L10.5 9.5L12 14L8 11L4 14L5.5 9.5L1.5 6.5H6.5L8 2Z"/></svg>`,
}

// ========== Core Conversion Functions ==========

/**
 * 转换HTML为内联样式（V2 重构版）
 * 实现渐进式迁移：V1 原有逻辑 + V2 结构化样式增强
 */
export function convertToInlineStyles(html: string, theme: ThemePreset): string {
  // 🔍 DEBUG: 验证调用和参数
  console.log('🔍 [DEBUG] convertToInlineStyles called', {
    htmlLength: html.length,
    themeId: theme.id,
    hasStructured: !!theme.structured,
    hasPage: !!theme.structured?.page,
    pageStyles: theme.structured?.page?.styles || null,
  })

  // 创建临时容器解析HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // Step 1: 应用 V1 基础样式（保持向后兼容）
  const elements = body.querySelectorAll('*')
  elements.forEach((element) => {
    // 跳过脚本和样式标签
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
      element.remove()
      return
    }

    // V1: 应用元素基础样式
    applyBaseElementStyles(element as HTMLElement, theme)

    // V1: 处理原有的 wx- 类名（保持兼容）
    processClasses(element as HTMLElement, theme)

    // V1: 处理组件模板（保持兼容）
    processComponentTemplates(element as HTMLElement, theme)

    // V1: 处理图标和表格（保持兼容）
    processIcons(element as HTMLElement)
    processTables(element as HTMLElement, theme)
  })

  // Step 2: 应用 V2 结构化主题样式（渐进增强）
  if (theme.structured) {
    const enhancedElements = body.querySelectorAll('*')
    enhancedElements.forEach((element) => {
      // V2: 应用结构化样式（覆盖或增强原有样式）
      applyThemeComponentStyles(element as HTMLElement, theme)

      // V2: 处理复杂列表 marker
      if (element.tagName === 'UL') {
        processComplexListMarkers(element as HTMLElement, theme)
      }
    })
  }

  // Step 3: 清理属性（V1 + V2）
  const finalElements = body.querySelectorAll('*')
  finalElements.forEach((element) => {
    element.removeAttribute('class')
    element.removeAttribute('id')
  })

  // Step 4: 包装容器（V2: 显式创建与 .content 等价的容器）
  const result = wrapContentWithContainer(body, theme)

  // 🔍 DEBUG: 验证输出结果
  if (import.meta.env.DEV) {
    console.log('📤 [DEBUG] convertToInlineStyles result', {
      resultLength: result.length,
      hasFontFamily: result.includes('font-family'),
      hasPageBackground: result.includes('background-color: #f7f6f2'),
      hasContainerBackground: result.includes('background-color: #ffffff'),
      hasRepeatingGradient: result.includes('repeating-linear-gradient'),
      snippet: result.substring(0, 500)
    })
  }

  return result
}

/**
 * 应用元素基础样式
 */
function applyBaseElementStyles(element: HTMLElement, theme: ThemePreset): void {
  const tagName = element.tagName.toLowerCase()

  switch (tagName) {
    case 'h1':
      element.style.cssText = `
        font-size: 1.9em;
        font-weight: 500;
        text-align: center;
        color: ${theme.tokens['--wx-heading']};
        margin: 24px 0 16px;
        line-height: 1.3;
        word-break: keep-all;
      `
      break

    case 'h2':
      element.style.cssText = `
        font-size: 1.5em;
        font-weight: 600;
        color: ${theme.tokens['--wx-heading']};
        margin: 32px 0 16px;
        line-height: 1.4;
        word-break: keep-all;
      `
      break

    case 'h3':
      element.style.cssText = `
        font-size: 1.3em;
        font-weight: 600;
        color: ${theme.tokens['--wx-subheading']};
        margin: 24px 0 12px;
        line-height: 1.4;
        word-break: keep-all;
      `
      break

    case 'h4':
      element.style.cssText = `
        font-size: 1.1em;
        font-weight: 600;
        color: ${theme.tokens['--wx-subheading']};
        margin: 20px 0 10px;
        line-height: 1.5;
        word-break: keep-all;
      `
      break

    case 'p':
      element.style.cssText = `
        margin: 16px 0;
        line-height: 1.75;
        color: ${theme.tokens['--wx-text']};
        font-size: 1em;
        word-break: keep-all;
      `
      break

    case 'ul':
    case 'ol':
      element.style.cssText = `
        margin: 16px 0;
        padding-left: 1.5em;
        color: ${theme.tokens['--wx-text']};
      `
      break

    case 'li':
      element.style.cssText = `
        margin: 8px 0;
        line-height: 1.75;
        word-break: keep-all;
      `
      break

    case 'a':
      element.style.cssText = `
        color: ${theme.tokens['--wx-link']};
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: all 0.2s;
      `
      break

    case 'blockquote':
      element.style.cssText = `
        margin: 24px 0;
        padding: 16px 20px;
        background: ${theme.tokens['--wx-surface']};
        border-left: 4px solid ${theme.tokens['--wx-quote-border']};
        color: ${theme.tokens['--wx-text']};
        font-style: italic;
        line-height: 1.75;
        word-break: keep-all;
      `
      break

    case 'strong':
      // 🔧 强制 <strong> 标签为 inline，防止微信换行
      element.style.display = 'inline'
      break

    case 'em':
      // 🔧 强制 <em> 标签为 inline，防止微信换行
      element.style.display = 'inline'
      break

    case 'code':
      element.style.cssText = `
        font-family: "SFMono-Regular", Consolas, Menlo, Courier, monospace;
        background: ${theme.tokens['--wx-code-bg']};
        color: ${theme.tokens['--wx-code-text']};
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.875em;
        display: inline;
      `
      break

    case 'pre':
      element.style.cssText = `
        margin: 24px 0;
        padding: 16px;
        background: ${theme.tokens['--wx-code-bg']};
        color: ${theme.tokens['--wx-code-text']};
        border-radius: 8px;
        overflow-x: auto;
        font-family: "SFMono-Regular", Consolas, Menlo, Courier, monospace;
        line-height: 1.6;
      `
      break

    case 'hr':
      element.style.cssText = `
        margin: 32px 0;
        border: none;
        border-top: 1px solid ${theme.tokens['--wx-surface']};
      `
      break
  }
}

/**
 * 处理类名
 */
function processClasses(element: HTMLElement, theme: ThemePreset): void {
  const classList = element.classList

  // 检查是否包含 wx- 类名
  classList.forEach((className) => {
    // wx-theme-xxx 是主题类，跳过
    if (className.startsWith('wx-theme-')) {
      return
    }

    // wx- 前缀的类名可能映射到tokens
    if (className.startsWith('wx-')) {
      const tokenName = `--${className.replace('wx-', '').replace(/-/g, '_')}`
      if (theme.tokens[tokenName]) {
        // 根据类名类型应用样式
        applyTokenBasedStyle(element, className, theme.tokens[tokenName])
      }
    }
  })
}

/**
 * 根据token应用样式
 */
function applyTokenBasedStyle(element: HTMLElement, className: string, value: string | number): void {
  if (typeof value !== 'string') {
    value = String(value)
  }

  // 根据类名推断样式属性
  if (className.includes('bg') || className.includes('background')) {
    element.style.backgroundColor = value
  } else if (className.includes('color') || className.includes('text')) {
    element.style.color = value
  } else if (className.includes('border')) {
    element.style.border = `1px solid ${value}`
  } else {
    // 默认为颜色属性
    element.style.color = value
  }
}

/**
 * 处理组件模板
 */
function processComponentTemplates(element: HTMLElement, theme: ThemePreset): void {
  const classList = element.classList

  // CTA链接
  if (classList.contains('wx-cta-link') || element.tagName === 'A' && element.textContent?.includes('立即') || element.textContent?.includes('查看更多')) {
    Object.entries(CTA_LINK_TEMPLATE).forEach(([prop, value]) => {
      const strValue = String(value)
      const accentColor = String(theme.tokens['--wx-accent'])
      element.style.setProperty(prop, strValue.replace('var(--wx-accent)', accentColor))
    })
    element.style.setProperty('color', String(theme.tokens['--wx-accent-contrast']))
    element.style.setProperty('background', String(theme.tokens['--wx-accent']))
  }

  // 标签Pill
  if (classList.contains('wx-pill')) {
    Object.entries(PILL_TEMPLATE).forEach(([prop, value]) => {
      element.style.setProperty(prop, String(value))
    })
  }

  // 提示卡片
  if (classList.contains('wx-alert')) {
    Object.entries(ALERT_CARD_TEMPLATE).forEach(([prop, value]) => {
      element.style.setProperty(prop, String(value))
    })
  }

  // 信息卡片
  if (classList.contains('wx-info-card')) {
    Object.entries(INFO_CARD_TEMPLATE).forEach(([prop, value]) => {
      element.style.setProperty(prop, String(value))
    })
  }

  // 成功卡片
  if (classList.contains('wx-success-card')) {
    Object.entries(SUCCESS_CARD_TEMPLATE).forEach(([prop, value]) => {
      element.style.setProperty(prop, String(value))
    })
  }

  // 警告卡片
  if (classList.contains('wx-warning-card')) {
    Object.entries(WARNING_CARD_TEMPLATE).forEach(([prop, value]) => {
      element.style.setProperty(prop, String(value))
    })
  }

  // 错误卡片
  if (classList.contains('wx-error-card')) {
    Object.entries(ERROR_CARD_TEMPLATE).forEach(([prop, value]) => {
      element.style.setProperty(prop, String(value))
    })
  }
}

/**
 * 处理图标字体替换为SVG
 */
function processIcons(element: HTMLElement): void {
  if (element.tagName === 'I') {
    const classList = element.classList
    let iconClass = ''

    // 查找图标类名
    for (const cls of classList) {
      if (cls.startsWith('icon-') || cls.startsWith('wx-icon-')) {
        iconClass = cls
        break
      }
    }

    if (iconClass && ICON_MAPPING[iconClass]) {
      // 替换为SVG
      element.outerHTML = ICON_MAPPING[iconClass]
    }
  }
}

/**
 * 处理表格增强
 */
function processTables(element: HTMLElement, theme: ThemePreset): void {
  if (element.tagName === 'TABLE') {
    // 设置表格整体样式
    element.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      table-layout: fixed;
    `

    // 处理表头
    const headers = element.querySelectorAll('th')
    headers.forEach((th) => {
      const header = th as HTMLElement
      header.style.cssText = `
        background: ${theme.tokens['--wx-surface']};
        color: ${theme.tokens['--wx-heading']};
        font-weight: 600;
        text-align: left;
        padding: 12px 16px;
        border: 1px solid #e5e7eb;
        vertical-align: middle;
      `
    })

    // 处理单元格
    const cells = element.querySelectorAll('td')
    cells.forEach((td, index) => {
      const cell = td as HTMLElement
      const rowIndex = Math.floor(index / element.querySelectorAll('tr').length)
      const isEvenRow = rowIndex % 2 === 1

      cell.style.cssText = `
        padding: 12px 16px;
        border: 1px solid #e5e7eb;
        vertical-align: top;
        line-height: 1.6;
        color: ${theme.tokens['--wx-text']};
        ${isEvenRow ? `background: #f9fafb;` : ''}
      `
    })

    // 确保表格行有正确样式
    const rows = element.querySelectorAll('tr')
    rows.forEach((tr) => {
      tr.style.border = '1px solid #e5e7eb'
    })
  }
}

// ========== Clipboard Functions ==========

/**
 * 防止微信后台在中文标点前换行：
 * - 在「字/词」与中文标点之间插入 WORD JOINER (U+2060)
 * - 对于以标点开头的文本节点（如 </strong>：），在该文本节点前插入 WORD JOINER
 * 注意：仅处理文本节点，不影响标签与属性。
 */
function preventWechatPunctuationBreaks(html: string): string {
  try {
    const WORD_JOINER = '\u2060'
    // 包含中文标点 + 各种破折号（半角、全角、长、短）
    const PUNCTS = new Set(['：', '，', '。', '！', '？', '；', '、', '）', '】', '》', '」', '』', '-', '－', '—', '–'])

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // 遍历所有文本节点
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text)
    }

    // 🔍 DEBUG: 统计信息
    let insertCount = 0
    let nodeWithPunctCount = 0

    for (const t of textNodes) {
      if (!t.nodeValue) continue

      const originalValue = t.nodeValue

      // 1) 同一文本节点内部：在“字/词 + 标点”之间插入 WORD_JOINER
      //    覆盖：中日韩、拉丁、数字
      const re = /([\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AFA-Za-z0-9])([：，。！？；、）】》」』])/g
      let val = t.nodeValue.replace(re, (match, p1, p2) => {
        insertCount++
        if (import.meta.env?.DEV) {
          console.log(`🔍 [DEBUG] 在文本节点内部插入 U+2060: "${p1}" + "${p2}"`)
        }
        return `${p1}${WORD_JOINER}${p2}`
      })

      // 2) 如果文本以标点开头（常见于 </b>： 这样的结构），在文本开头添加 WORD_JOINER
      //    🔧 修复：直接添加到文本节点开头，而不是创建新节点，避免微信在节点间换行
      if (val.length > 0 && PUNCTS.has(val[0])) {
        nodeWithPunctCount++
        val = WORD_JOINER + val
        insertCount++
        if (import.meta.env?.DEV) {
          console.log(`🔍 [DEBUG] 在文本开头添加 U+2060: 节点内容="${val.substring(0, 20)}"`)
        }
      }

      // 3) 🔧 新增：如果文本以空格开头，检查第一个非空格字符是否是标点
      //    处理 </strong> - 这样的结构（空格 + 破折号）
      const trimmed = val.trimStart()
      const leadingSpaces = val.length - trimmed.length
      if (leadingSpaces > 0 && trimmed.length > 0 && PUNCTS.has(trimmed[0])) {
        nodeWithPunctCount++
        val = WORD_JOINER + val
        insertCount++
        if (import.meta.env?.DEV) {
          console.log(`🔍 [DEBUG] 在空格前添加 U+2060: 节点内容="${val.substring(0, 20)}"`)
        }
      }

      if (originalValue !== val && import.meta.env?.DEV) {
        console.log(`🔍 [DEBUG] 文本节点变化:`, {
          before: originalValue,
          after: val
        })
      }

      t.nodeValue = val
    }

    if (import.meta.env?.DEV) {
      console.log(`🔍 [DEBUG] preventWechatPunctuationBreaks 统计:`, {
        totalTextNodes: textNodes.length,
        insertCount,
        nodeWithPunctCount
      })
    }

    return doc.body.innerHTML
  } catch (e) {
    if (import.meta.env?.DEV) {
      console.warn('preventWechatPunctuationBreaks failed', e)
    }
    return html
  }
}


/**
 * 将HTML和纯文本复制到剪贴板
 */
async function copyToClipboard(html: string, plainText: string): Promise<void> {
  // 优先使用现代 Clipboard API
  if (navigator.clipboard && window.ClipboardItem) {
    try {
      const data = {
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      }
      await navigator.clipboard.write([new ClipboardItem(data)])

      if (import.meta.env?.DEV) {
        console.log('✅ [DEBUG] 使用 Clipboard API 复制成功')
      }
      return
    } catch (error) {
      console.warn('❌ Clipboard API failed, falling back to execCommand', error)
    }
  }

  // 兜底方案：使用 execCommand（支持富文本）
  if (import.meta.env?.DEV) {
    console.log('⚠️ [DEBUG] 使用 execCommand 兜底方案')
  }

  // 创建一个临时的 div 元素来承载 HTML
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.contentEditable = 'true'
  document.body.appendChild(container)

  // 选中整个容器
  const range = document.createRange()
  range.selectNodeContents(container)
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }

  try {
    document.execCommand('copy')
    if (import.meta.env?.DEV) {
      console.log('✅ [DEBUG] execCommand 复制成功')
    }
  } finally {
    if (selection) {
      selection.removeAllRanges()
    }
    document.body.removeChild(container)
  }
}

/**
 * 复制转换后的HTML到剪贴板
 */
export async function copyConvertedHTML(html: string, theme: ThemePreset): Promise<{ success: boolean; message: string }> {
  try {
    // 转换HTML为内联样式
    const convertedHTML = convertToInlineStyles(html, theme)

    // 🔍 DEBUG: 检查转换后的HTML
    if (import.meta.env?.DEV) {
      console.log('🔍 [DEBUG] 转换后的HTML (before preventWechat):', convertedHTML.substring(0, 500))

      // 🔍 新增：检查 <li> 标签的内容
      const liMatches = convertedHTML.match(/<li[^>]*>([^<]*)<strong>/g)
      if (liMatches) {
        console.log('\n🔍 [DEBUG] <li> 和 <strong> 之间的内容:')
        liMatches.slice(0, 5).forEach((match, i) => {
          const between = match.replace(/<li[^>]*>/, '').replace(/<strong>/, '')
          const chars = [...between].map(c => {
            const code = c.charCodeAt(0)
            const hex = code.toString(16).toUpperCase().padStart(4, '0')
            const name = code === 0x0020 ? 'SPACE' : code === 0x00A0 ? 'NBSP' : code === 0x2060 ? 'WORD_JOINER' : ''
            return `U+${hex}${name ? ` (${name})` : ''}`
          })
          console.log(`  ${i + 1}. 长度=${between.length}, 内容="${between}", 字符=[${chars.join(', ')}]`)
        })
      }
    }

    // 🔧 [方案 E] 将标点符号移到 <strong> 内，防止微信换行
    // 例如：<strong>实时预览</strong>：... → <strong>实时预览：</strong>...
    // 处理两种情况：
    // 1. </strong>： → ：</strong>
    // 2. </strong> - → -</strong> （空格 + 破折号）
    let wechatSafeHTML = convertedHTML
      // 先处理 空格 + 标点 的情况
      .replace(/<\/strong>(\s+)([：，。！？；、）】》」』\-－—–])/g, '$2</strong>$1')
      // 再处理 直接标点 的情况
      .replace(/<\/strong>([：，。！？；、）】》」』\-－—–])/g, '$1</strong>')

    // 🔧 [方案 F] 在列表项中，将 </strong> 后面的文本包裹在 <span style="display: inline;"> 中
    // 这样可以防止微信在 </strong> 后换行
    // 例如：<li>...<strong>实时预览：</strong>左侧编辑...</li>
    //   → <li>...<strong>实时预览：</strong><span style="display: inline;">左侧编辑...</span></li>
    wechatSafeHTML = wechatSafeHTML.replace(
      /(<li[^>]*>.*?<strong[^>]*>.*?<\/strong>)([^<]+)(<\/li>)/g,
      '$1<span style="display: inline;">$2</span>$3'
    )

    // 🔍 DEBUG: 检查是否插入了 U+2060
    if (import.meta.env?.DEV) {
      const hasWordJoiner = wechatSafeHTML.includes('\u2060')
      const wordJoinerCount = (wechatSafeHTML.match(/\u2060/g) || []).length
      console.log('🔍 [DEBUG] U+2060 检查:', {
        hasWordJoiner,
        wordJoinerCount,
        sample: wechatSafeHTML.substring(0, 500),
        // 显示 U+2060 的位置
        positions: [...wechatSafeHTML.matchAll(/\u2060/g)].map(m => m.index).slice(0, 10)
      })

      // 显示包含冒号的部分
      const colonMatches = wechatSafeHTML.match(/.{0,20}[：].{0,20}/g)
      if (colonMatches) {
        console.log('🔍 [DEBUG] 冒号周围的内容:', colonMatches.slice(0, 5))
      }

      // 🔍 新增：检查 </span> 和 <strong> 之间的字符（在插入 U+2060 之后）
      const spanToStrongPattern = /<\/span>([^<]*?)<strong>/g
      const spanMatches = [...wechatSafeHTML.matchAll(spanToStrongPattern)]
      if (spanMatches.length > 0) {
        console.log('\n🔍 [DEBUG] </span> 和 <strong> 之间的字符（插入 U+2060 后）:')
        spanMatches.slice(0, 5).forEach((match, i) => {
          const between = match[1]
          const chars = [...between].map(c => {
            const code = c.charCodeAt(0)
            const hex = code.toString(16).toUpperCase().padStart(4, '0')
            let name = ''
            if (code === 0x0020) name = 'SPACE'
            else if (code === 0x00A0) name = 'NBSP'
            else if (code === 0x2060) name = 'WORD_JOINER'
            else if (code === 0x200B) name = 'ZERO_WIDTH_SPACE'
            return `U+${hex}${name ? ` (${name})` : ''}`
          })
          console.log(`  ${i + 1}. 长度=${between.length}, 字符=[${chars.join(', ')}]`)
        })
      }

      // 🔍 新增：详细分析 </strong> 和 ： 之间的字符
      const strongPattern = /<\/strong>([^<]*?)：/g
      const strongMatches = [...wechatSafeHTML.matchAll(strongPattern)]
      if (strongMatches.length > 0) {
        console.log('\n🔍 [DEBUG] </strong> 和 ： 之间的字符详细分析:')
        strongMatches.slice(0, 5).forEach((match, i) => {
          const between = match[1]
          const chars = [...between].map(c => {
            const code = c.charCodeAt(0)
            const hex = code.toString(16).toUpperCase().padStart(4, '0')
            return `U+${hex}`
          })
          console.log(`  ${i + 1}. 长度=${between.length}, 字符=[${chars.join(', ')}]`)
        })
      }
    }

    // 提取纯文本内容（移除不可见的 U+2060）
    const parser = new DOMParser()
    const doc = parser.parseFromString(wechatSafeHTML, 'text/html')
    const plainText = (doc.body.textContent || '').replace(/\u2060/g, '')

    // 复制到剪贴板
    await copyToClipboard(wechatSafeHTML, plainText)

    // 🔍 DEBUG: 验证剪贴板内容
    if (import.meta.env?.DEV && navigator.clipboard && navigator.clipboard.read) {
      try {
        const clipboardItems = await navigator.clipboard.read()
        for (const item of clipboardItems) {
          if (item.types.includes('text/html')) {
            const blob = await item.getType('text/html')
            const text = await blob.text()
            const hasWordJoinerInClipboard = text.includes('\u2060')
            console.log('🔍 [DEBUG] 剪贴板中的HTML:', {
              hasWordJoiner: hasWordJoinerInClipboard,
              sample: text.substring(0, 500)
            })
          }
        }
      } catch (e) {
        console.warn('无法读取剪贴板内容进行验证:', e)
      }
    }

    return {
      success: true,
      message: '已复制转换后的HTML到剪贴板，可以直接粘贴到微信公众号后台',
    }
  } catch (error) {
    console.error('Copy failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '复制失败，请重试',
    }
  }
}
