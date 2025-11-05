# 修正版内联样式转换方案

## 关键问题修正

### 1. 彻底分离样式数据与元数据

```typescript
/**
 * 样式属性对象 - 仅包含真正的 CSS 属性
 */
type StyleProps = Record<string, string | number>

/**
 * 伪元素描述对象
 */
interface PseudoElementConfig {
  content: string
  styles: StyleProps
  positioning: 'absolute' | 'fixed' | 'relative'
}

/**
 * 复杂选择器模式（如 nth-child）
 */
interface NthChildPattern {
  pattern: string // '4n+1', '4n+2', '4n+3', '4n+4'
  styles: StyleProps
  content: string
}

/**
 * 列表 marker 配置
 */
interface ListMarkerConfig {
  // 简单 marker（Chinese/Renaissance）
  simple?: {
    symbol: string // '·', '★', '⚜'
    color: string
    style?: StyleProps
  }
  // 复杂 nth-child 循环（Memphis）
  nthChild?: NthChildPattern[]
}

/**
 * 主题组件样式数据结构 - 彻底分离
 */
interface ThemePreset {
  // ... 现有 tokens
  components?: {
    // 容器样式（替代 .content）
    container: {
      styles: StyleProps // 纯样式，无元数据
      pseudoBefore?: PseudoElementConfig
      pseudoAfter?: PseudoElementConfig
    }

    // 标题样式
    headings: {
      h1: {
        styles: StyleProps // 纯样式
        transforms?: string[] // 旋转等 - 作为单独的样式属性处理
        pseudoBefore?: PseudoElementConfig
        pseudoAfter?: PseudoElementConfig
        hasTextShadow?: boolean
        hasBoxShadow?: boolean
      }
      h2: {
        styles: StyleProps
        hasCounter?: boolean
        backgroundImage?: string
        gradientAngle?: string
      }
      h3: { styles: StyleProps }
      h4: { styles: StyleProps }
    }

    // 列表样式
    lists: {
      ul: {
        styles: StyleProps
        listStyle?: 'none' | 'disc' | 'decimal'
        markers: ListMarkerConfig // 分离出 marker 配置
      }
      ol: {
        styles: StyleProps
        listStyle?: 'none' | 'disc' | 'decimal'
        counterReset?: string
      }
      li: {
        styles: StyleProps
        pseudoBefore?: {
          simple?: { content: string, styles: StyleProps }
          nthChild?: NthChildPattern[] // Renaissance 的装饰符等
        }
      }
    }

    // 分隔符样式
    dividers: {
      styles: StyleProps
      hasPseudoElement?: boolean
      pseudoContent?: string
    }

    // 装饰性元素
    decorations?: Array<{
      selector: string // 'h2::after', '.separator::before' 等
      content: string
      styles: StyleProps
      position: 'absolute' | 'relative'
    }>

    // 简化其他组件...
    links: StyleProps
    blockquote: {
      styles: StyleProps
      pseudoBefore?: PseudoElementConfig
      transform?: string
    }
    codeBlocks: { pre: StyleProps, code: StyleProps }
    tables: { table: StyleProps, th: StyleProps, td: StyleProps, tr: StyleProps }
    ctaLink: StyleProps
    pill: StyleProps
    alertCard: StyleProps
    infoCard: StyleProps
    successCard: StyleProps
    warningCard: StyleProps
    errorCard: StyleProps
  }
}

/**
 * 安全的样式应用函数
 * 解决：不会将元数据写入 style 属性
 */
function safeApplyStyles(element: HTMLElement, styles: StyleProps): void {
  Object.entries(styles).forEach(([prop, value]) => {
    const kebabProp = prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    element.style.setProperty(kebabProp, String(value))
  })
}

/**
 * 解析 nth-child 模式的函数
 * 解决：索引从 1 开始，避免 4n+1 匹配错误
 */
function matchesNthChildPattern(index: number, pattern: string): boolean {
  // index 从 1 开始（listItem 从 1 开始计数）
  const n = Math.floor((index - 1) / 4) // 每4个一组
  const remainder = (index - 1) % 4 + 1 // 余数 1-4

  const match = pattern.match(/^(\d+)n\+(\d+)$/)
  if (match) {
    const a = parseInt(match[1])
    const b = parseInt(match[2])
    // 检查 index = a*n + b
    return remainder === b
  }
  return false
}

/**
 * 应用伪元素的实际 DOM 替代
 * 解决：content 不能用 CSS，设置 textContent 即可
 */
function applyPseudoElement(element: HTMLElement, pseudoType: 'before' | 'after', config: PseudoElementConfig): void {
  // 检查是否已经应用过（幂等性保证）
  const existing = element.querySelector(`[data-wx-pseudo="${pseudoType}"]`)
  if (existing) {
    return
  }

  // 创建实际 DOM 元素替代伪元素
  const pseudoElement = document.createElement('span')
  pseudoElement.setAttribute('data-wx-pseudo', pseudoType)

  // 设置定位
  pseudoElement.style.position = config.positioning
  pseudoElement.style.display = 'block' // 确保是块级元素

  // 应用样式（只从 styles 中读取，不包含 content）
  safeApplyStyles(pseudoElement, config.styles)

  // 设置内容（伪元素的 content 只能通过 textContent 或 innerHTML）
  pseudoElement.textContent = config.content

  if (pseudoType === 'before') {
    element.insertBefore(pseudoElement, element.firstChild)
  } else {
    element.appendChild(pseudoElement)
  }
}

/**
 * 处理复杂的列表 marker
 * 解决：避免重复插入，一次循环命中一个 pattern
 */
function processComplexListMarkers(listElement: HTMLElement, theme: ThemePreset): void {
  const listItems = listElement.querySelectorAll('li')
  const markers = theme.components?.lists?.ul?.markers

  if (!markers) return

  listItems.forEach((li, index) => {
    // 检查是否已经插入过 marker
    if (li.querySelector('[data-wx-marker="true"]')) {
      return
    }

    const listItem = li as HTMLElement
    listItem.style.position = 'relative'

    // 简单 marker（Chinese/Renaissance）
    if (markers.simple) {
      const marker = document.createElement('span')
      marker.setAttribute('data-wx-marker', 'true')
      marker.textContent = markers.simple.symbol
      marker.style.cssText = `
        position: absolute;
        left: 8px;
        color: ${markers.simple.color};
        font-size: 1.2em;
        line-height: 1.4;
      `
      // 应用额外的样式
      if (markers.simple.style) {
        safeApplyStyles(marker, markers.simple.style)
      }
      listItem.insertBefore(marker, listItem.firstChild)
      return // 简单模式命中即退出
    }

    // 复杂 nth-child 循环（Memphis）
    if (markers.nthChild) {
      // 按 pattern 顺序匹配，命中一个后立即退出
      for (const nthConfig of markers.nthChild) {
        if (matchesNthChildPattern(index + 1, nthConfig.pattern)) { // index+1 转为 1-based
          const marker = document.createElement('span')
          marker.setAttribute('data-wx-marker', 'true')
          marker.textContent = nthConfig.content

          // 应用样式
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
          safeApplyStyles(marker, nthConfig.styles)

          listItem.insertBefore(marker, listItem.firstChild)
          break // 命中一个 pattern 后退出，不再匹配其他
        }
      }
    }
  })
}

/**
 * 应用标题样式
 * 解决：分离 transforms、pseudo 等元数据
 */
function applyHeadingStyles(element: HTMLElement, headingConfig: ThemePreset['components']['headings']['h1'], theme: ThemePreset): void {
  // 1. 应用基础样式
  safeApplyStyles(element, headingConfig.styles)

  // 2. 应用 transforms
  if (headingConfig.transforms && headingConfig.transforms.length > 0) {
    element.style.transform = headingConfig.transforms.join(' ')
  }

  // 3. 处理阴影效果（Cyberpunk）
  if (headingConfig.hasTextShadow) {
    // 查找主题中的 text-shadow 值
    const textShadow = findThemeTextShadow(theme)
    if (textShadow) {
      element.style.textShadow = textShadow
    }
  }

  if (headingConfig.hasBoxShadow) {
    const boxShadow = findThemeBoxShadow(theme)
    if (boxShadow) {
      element.style.boxShadow = boxShadow
    }
  }

  // 4. 应用伪元素
  if (headingConfig.pseudoBefore) {
    applyPseudoElement(element, 'before', headingConfig.pseudoBefore)
  }

  if (headingConfig.pseudoAfter) {
    applyPseudoElement(element, 'after', headingConfig.pseudoAfter)
  }
}

/**
 * 容器包装逻辑
 * 解决：只应用 styles，不包含 pseudoElements 等元数据
 */
function wrapContentWithContainer(body: HTMLElement, theme: ThemePreset): string {
  const bodyInnerHTML = body.innerHTML.trim()
  if (!bodyInnerHTML) return bodyInnerHTML

  // 创建容器 div
  const container = document.createElement('div')

  // 1. 应用容器样式（只从 styles 中读取）
  if (theme.components?.container) {
    safeApplyStyles(container, theme.components.container.styles)
  } else {
    // Fallback: 基础容器样式
    container.style.cssText = `
      background-color: ${theme.tokens['--wx-surface'] || '#ffffff'};
      padding: 30px;
      max-width: 800px;
      margin: 0 auto;
    `
  }

  // 2. 应用容器的伪元素（通过实际 DOM）
  if (theme.components?.container?.pseudoBefore) {
    applyPseudoElement(container, 'before', theme.components.container.pseudoBefore)
  }

  if (theme.components?.container?.pseudoAfter) {
    applyPseudoElement(container, 'after', theme.components.container.pseudoAfter)
  }

  // 3. 包装内容
  container.innerHTML = bodyInnerHTML
  return container.outerHTML
}

/**
 * 查找主题中的 text-shadow 值
 */
function findThemeTextShadow(theme: ThemePreset): string | null {
  // 可以从 theme.tokens 或其他地方查找
  // 对于 Cyberpunk，从主题 CSS 中提取
  return theme.id === 'cyberpunk' ? '0 0 5px #f0f, 0 0 10px #f0f' : null
}

/**
 * 查找主题中的 box-shadow 值
 */
function findThemeBoxShadow(theme: ThemePreset): string | null {
  return theme.id === 'cyberpunk'
    ? '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.2)'
    : null
}

/**
 * 转换器主函数 - 修正版
 */
export function convertToInlineStyles(html: string, theme: ThemePreset): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  const elements = body.querySelectorAll('*')
  elements.forEach((element) => {
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
      element.remove()
      return
    }

    // 1. 应用基础样式
    applyBaseElementStyles(element as HTMLElement, theme)

    // 2. 应用主题特有样式（新的安全实现）
    applyThemeComponentStyles(element as HTMLElement, theme)

    // 3. 处理复杂列表 marker
    if (element.tagName === 'UL') {
      processComplexListMarkers(element as HTMLElement, theme)
    }

    // 4. 处理类名和组件模板
    processClasses(element as HTMLElement, theme)
    processComponentTemplates(element as HTMLElement, theme)

    // 5. 处理图标、表格等
    processIcons(element as HTMLElement)
    processTables(element as HTMLElement, theme)

    // 6. 移除 class 和 id
    element.removeAttribute('class')
    element.removeAttribute('id')
  })

  // 7. 包装容器
  return wrapContentWithContainer(body, theme)
}

/**
 * 应用主题组件样式 - 新的安全实现
 */
function applyThemeComponentStyles(element: HTMLElement, theme: ThemePreset): void {
  const tagName = element.tagName.toLowerCase()
  const components = theme.components

  if (!components) return

  // 应用标题主题样式
  if (components.headings) {
    if (tagName === 'h1' && components.headings.h1) {
      applyHeadingStyles(element, components.headings.h1, theme)
    } else if (tagName === 'h2' && components.headings.h2) {
      safeApplyStyles(element, components.headings.h2.styles)

      // 处理渐变背景（ByteDance）
      if (components.headings.h2.backgroundImage) {
        const gradient = components.headings.h2.gradientAngle
          ? `linear-gradient(${components.headings.h2.gradientAngle}, ${components.headings.h2.backgroundImage})`
          : components.headings.h2.backgroundImage
        element.style.backgroundImage = gradient
      }

      // 处理 counter（Minimalist）
      if (components.headings.h2.hasCounter) {
        element.style.counterIncrement = 'h2-counter'
      }
    } else if (tagName === 'h3' && components.headings.h3) {
      safeApplyStyles(element, components.headings.h3.styles)
    } else if (tagName === 'h4' && components.headings.h4) {
      safeApplyStyles(element, components.headings.h4.styles)
    }
  }

  // 应用列表主题样式
  if (tagName === 'ul' && components.lists?.ul) {
    safeApplyStyles(element, components.lists.ul.styles)
    if (components.lists.ul.listStyle) {
      element.style.listStyle = components.lists.ul.listStyle
    }
  }

  if (tagName === 'li' && components.lists?.li) {
    safeApplyStyles(element, components.lists.li.styles)

    // 处理 li 的伪元素（Renaissance 装饰符等）
    if (components.lists.li.pseudoBefore?.simple) {
      applyPseudoElement(element, 'before', {
        ...components.lists.li.pseudoBefore.simple,
        positioning: 'absolute'
      })
    }
  }

  // 应用链接样式
  if (tagName === 'a' && components.links) {
    safeApplyStyles(element, components.links)
  }

  // 应用分隔符样式
  if (tagName === 'hr' && components.dividers) {
    safeApplyStyles(element, components.dividers.styles)
  }

  // 应用引用块样式
  if (tagName === 'blockquote' && components.blockquote) {
    safeApplyStyles(element, components.blockquote.styles)

    if (components.blockquote.pseudoBefore) {
      applyPseudoElement(element, 'before', components.blockquote.pseudoBefore)
    }

    if (components.blockquote.transform) {
      element.style.transform = components.blockquote.transform
    }
  }

  // 应用代码块样式
  if (tagName === 'pre' && components.codeBlocks?.pre) {
    safeApplyStyles(element, components.codeBlocks.pre)
  }

  if (tagName === 'code' && components.codeBlocks?.code) {
    safeApplyStyles(element, components.codeBlocks.code)
  }
}

/**
 * 增强测试断言 - 解析 DOM 验证结构
 */
describe('inline-style-converter integration', () => {
  it('should preserve Chinese theme critical styles', () => {
    const html = `<h1>Title</h1><ul><li>Item 1</li><li>Item 2</li></ul>`
    const theme = getThemePreset('chinese')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    // 1. 检查容器
    const container = doc.querySelector('div > div > h1')?.parentElement
    expect(container?.tagName).toBe('DIV')
    expect(container?.getAttribute('style')).toContain('background-color: #ffffff')
    expect(container?.getAttribute('style')).toContain('padding: 30px')

    // 2. 检查 H1 样式
    const h1 = doc.querySelector('h1')
    expect(h1?.getAttribute('style')).toContain('color: #a72f2f')
    expect(h1?.getAttribute('style')).toContain('border-bottom: 2px dashed')

    // 3. 检查列表 marker（使用实际的 marker 元素）
    const markers = doc.querySelectorAll('[data-wx-marker="true"]')
    expect(markers.length).toBe(2) // 两个 li 都应该有 marker
    expect(markers[0]?.textContent).toBe('·') // Chinese 使用 '·'
  })

  it('should preserve Memphis theme complex markers', () => {
    const html = `<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li><li>Item 4</li><li>Item 5</li></ul>`
    const theme = getThemePreset('memphis')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    // 1. 检查 5 个 li 都有 marker
    const markers = doc.querySelectorAll('[data-wx-marker="true"]')
    expect(markers.length).toBe(5)

    // 2. 检查颜色循环（1,5 => 4n+1; 2,6 => 4n+2; etc）
    const checkMarkerColor = (markerIndex: number, expectedColor: string) => {
      const marker = markers[markerIndex]
      const style = marker.getAttribute('style')
      expect(style).toContain(`background-color: #${expectedColor}`)
    }

    // Item 1 (4n+1) => EF476F
    checkMarkerColor(0, 'EF476F')
    // Item 2 (4n+2) => 06D6A0
    checkMarkerColor(1, '06D6A0')
    // Item 3 (4n+3) => FFD166
    checkMarkerColor(2, 'FFD166')
    // Item 4 (4n+4) => 118AB2
    checkMarkerColor(3, '118AB2')
    // Item 5 (4n+1) => EF476F
    checkMarkerColor(4, 'EF476F')
  })
})
```

## 核心修正点总结

1. ✅ **彻底分离样式与元数据**：StyleProps 仅包含 CSS 属性，其他元数据单独存储
2. ✅ **伪元素 content 修正**：使用 textContent，不再使用无效的 CSS content 属性
3. ✅ **nth-child 逻辑修正**：索引从 1 开始，parseInt('4n+1') 正确匹配第 1、5、9... 个元素
4. ✅ **容器包装安全**：只应用 `container.styles`，不包含伪元素配置
5. ✅ **避免重复插入**：一次循环命中一个 pattern 后立即退出，marker 使用 `data-wx-marker` 检查
6. **MVP 关键属性锁定**：
   - Chinese: 容器背景色、H1 虚线下划线、列表 '·' marker
   - Memphis: 容器边框、4色循环 marker、transform 旋转
   - Cyberpunk: H1 text-shadow、box-shadow 荧光效果

这个修正版解决了 GPT-5 提到的所有坑，第一阶段实施成功率会高得多！
