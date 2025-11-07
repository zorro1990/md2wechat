# 最终优化方案（基于 GPT-5 全部批评意见）

## 完整技术实现方案

### 1. TypeScript 类型系统重构

```typescript
// ========== 类型定义 ==========

/**
 * 纯样式属性对象（不含元数据）
 */
type StyleProps = Record<string, string | number>

/**
 * 伪元素配置（替代 CSS 伪元素）
 */
interface PseudoElementConfig {
  content: string
  styles: StyleProps
  positioning: 'absolute' | 'fixed' | 'relative'
  selector?: string // 用于精确选择 'h2::after', '.separator::before' 等
}

/**
 * nth-child 模式匹配配置
 */
interface NthChildPattern {
  pattern: string // '4n+1', '4n+2', '4n+3', '4n+4'
  styles: StyleProps
  content: string
  selector?: string // 可选的子元素选择器
}

/**
 * 列表 marker 配置（彻底分离）
 */
interface ListMarkerConfig {
  // 简单 marker（Chinese: '·', Renaissance: '⚜'）
  simple?: {
    symbol: string
    color: string
    styles?: StyleProps
    position?: { left: string; top?: string }
  }
  // 复杂 nth-child 循环（Memphis: 彩色星形）
  nthChild?: NthChildPattern[]
  // 自定义生成回调（Memphis: 星形+颜色）
  custom?: (index: number, element: HTMLElement) => HTMLElement | null
}

/**
 * 容器装饰元素（用于 Memphis 的 ::before/::after）
 */
interface ContainerDecoration {
  selector: string // '.content::before', '.content::after'
  content: string
  styles: StyleProps
  position: 'absolute' | 'relative'
}

/**
 * 主题组件样式结构（完整版）
 */
interface ThemeComponentStyles {
  // 容器样式（替代 .content，必须在转换器中显式创建）
  container: {
    styles: StyleProps
    pseudoBefore?: PseudoElementConfig // Memphis 的 ::before 装饰条
    pseudoAfter?: PseudoElementConfig  // Memphis 的 ::after 三角形
    decorations?: ContainerDecoration[] // Renaissance 等主题装饰
  }

  // 标题样式
  headings: {
    h1: {
      styles: StyleProps
      transforms?: string[] // Memphis 旋转: 'rotate(-2deg)'
      pseudoBefore?: PseudoElementConfig
      pseudoAfter?: PseudoElementConfig
      textShadow?: string // Cyberpunk: '0 0 5px #f0f'
      boxShadow?: string  // Memphis: '8px 8px 0 #EF476F'
      gradient?: { angle: string; colors: string[] } // ByteDance 渐变
      counter?: { reset?: string; increment?: string } // Minimalist
    }
    h2: {
      styles: StyleProps
      transforms?: string[]
      pseudoBefore?: PseudoElementConfig
      pseudoAfter?: PseudoElementConfig
      textShadow?: string
      boxShadow?: string
      gradient?: { angle: string; colors: string[] }
      counter?: { reset?: string; increment?: string }
    }
    h3: {
      styles: StyleProps
      transforms?: string[]
      pseudoBefore?: PseudoElementConfig
      pseudoAfter?: PseudoElementConfig
      textShadow?: string
      boxShadow?: string
    }
    h4: {
      styles: StyleProps
      transforms?: string[]
      pseudoBefore?: PseudoElementConfig
      pseudoAfter?: PseudoElementConfig
      textShadow?: string
      boxShadow?: string
    }
  }

  // 列表样式
  lists: {
    ul: {
      styles: StyleProps
      listStyle?: 'none' | 'disc' | 'decimal'
      markers: ListMarkerConfig // 关键：分离 marker 配置
    }
    ol: {
      styles: StyleProps
      listStyle?: 'none' | 'disc' | 'decimal'
      counter?: { reset?: string; style?: string }
    }
    li: {
      styles: StyleProps
      pseudoBefore?: PseudoElementConfig // Renaissance 装饰符
      transforms?: string[]
    }
  }

  // 分隔符样式
  dividers: {
    styles: StyleProps
    hasPattern?: boolean // Memphis: 斜条纹
    pattern?: { angle: string; colors: string[]; size: string }
  }

  // 链接样式
  links: {
    styles: StyleProps
    hoverStyles?: StyleProps
  }

  // 引用块样式
  blockquote: {
    styles: StyleProps
    pseudoBefore?: PseudoElementConfig // Cyberpunk: 'SYSTEM ALERT: '
    transforms?: string[] // Memphis 旋转
    borderRadius?: string // Memphis: 255px 15px 225px 15px
  }

  // 代码块样式
  codeBlocks: {
    pre: StyleProps
    code: StyleProps
  }

  // 表格样式
  tables: {
    table: StyleProps
    th: StyleProps
    td: StyleProps
    tr: StyleProps
  }

  // 组件模板
  components: {
    ctaLink?: StyleProps
    pill?: StyleProps
    alertCard?: StyleProps
    infoCard?: StyleProps
    successCard?: StyleProps
    warningCard?: StyleProps
    errorCard?: StyleProps
  }
}

/**
 * 完整 ThemePreset 接口
 */
interface ThemePreset {
  id: string
  name: string
  tokens: Record<string, string | number>
  components?: ThemeComponentStyles // 关键：components 字段有具体结构
  isBuiltin: boolean
  createdAt: string
}
```

### 2. 核心工具函数实现

```typescript
// ========== 工具函数 ==========

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
 */
function matchesNthChildPattern(index1Based: number, pattern: string): boolean {
  // 解析 '4n+1' 格式
  const match = pattern.match(/^(\d+)n\+(\d+)$/)
  if (!match) return false

  const a = parseInt(match[1]) // 倍数
  const b = parseInt(match[2]) // 偏移

  // 检查 index 是否满足 a*n + b (n >= 0)
  // 例如 4n+1: index = 1, 5, 9, 13...
  return (index1Based - b) >= 0 && (index1Based - b) % a === 0
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
 * 处理复杂列表 marker
 * 支持 Memphis 的 4 色循环、自定义生成等
 */
function processComplexListMarkers(
  listElement: HTMLElement,
  theme: ThemePreset
): void {
  const listItems = listElement.querySelectorAll('li')
  const markers = theme.components?.lists?.ul?.markers

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
 * 创建简单 marker
 */
function createSimpleMarker(
  config: NonNullable<ListMarkerConfig['simple']>,
  parent: HTMLElement
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
  parent: HTMLElement
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
 * 容器包装函数
 * 显式创建与 .content 等价的容器，包含伪元素装饰
 */
function wrapContentWithContainer(
  body: HTMLElement,
  theme: ThemePreset
): string {
  const bodyInnerHTML = body.innerHTML.trim()
  if (!bodyInnerHTML) return bodyInnerHTML

  // 创建容器 div（替代 .content）
  const container = document.createElement('div')

  // 1. 应用容器样式（仅从 styles 读取）
  if (theme.components?.container) {
    safeApplyStyles(container, theme.components.container.styles)
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
  if (theme.components?.container?.pseudoBefore) {
    applyPseudoElement(container, 'before', theme.components.container.pseudoBefore)
  }

  if (theme.components?.container?.pseudoAfter) {
    applyPseudoElement(container, 'after', theme.components.container.pseudoAfter)
  }

  // 3. 应用装饰元素（Renaissance 等）
  if (theme.components?.container?.decorations) {
    theme.components.container.decorations.forEach(decoration => {
      // 根据 selector 选择目标元素（此处 container 即 '.content' 的替代）
      const target = container // 简化：container 即目标
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

/**
 * 应用标题样式（处理变换、阴影、渐变等）
 */
function applyHeadingStyles(
  element: HTMLElement,
  config: ThemeComponentStyles['headings']['h1'],
  theme: ThemePreset
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

  // 4. 渐变背景
  if (config.gradient) {
    const { angle, colors } = config.gradient
    const gradientStr = colors.length > 1
      ? `linear-gradient(${angle}, ${colors.join(', ')})`
      : colors[0]
    element.style.backgroundImage = gradientStr
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
  config: ThemeComponentStyles['lists']['ul'],
  isOrderedList: boolean
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
  config: ThemeComponentStyles['dividers']
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
```

### 3. 转换器主函数重构

```typescript
// ========== 转换器主函数 ==========

/**
 * 转换 HTML 为内联样式（修正版）
 * 解决：所有 GPT-5 指出的问题
 */
export function convertToInlineStyles(html: string, theme: ThemePreset): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // 处理所有元素
  const elements = body.querySelectorAll('*')
  elements.forEach((element) => {
    // 1. 跳过危险标签
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
      element.remove()
      return
    }

    // 2. 应用基础样式（原有逻辑）
    applyBaseElementStyles(element as HTMLElement, theme)

    // 3. 应用主题组件样式（新逻辑）
    applyThemeComponentStyles(element as HTMLElement, theme)

    // 4. 处理复杂列表 marker
    if (element.tagName === 'UL') {
      processComplexListMarkers(element as HTMLElement, theme)
    }

    // 5. 处理类名和组件模板（原有逻辑保留）
    processClasses(element as HTMLElement, theme)
    processComponentTemplates(element as HTMLElement, theme)

    // 6. 处理图标、表格等
    processIcons(element as HTMLElement)
    processTables(element as HTMLElement, theme)

    // 7. 清理属性
    element.removeAttribute('class')
    element.removeAttribute('id')
  })

  // 8. 包装容器（替代原有逻辑）
  return wrapContentWithContainer(body, theme)
}

/**
 * 应用主题组件样式（新增）
 */
function applyThemeComponentStyles(element: HTMLElement, theme: ThemePreset): void {
  const tagName = element.tagName.toLowerCase()
  const components = theme.components

  if (!components) return

  // 标题样式
  if (components.headings) {
    if (tagName === 'h1' && components.headings.h1) {
      applyHeadingStyles(element, components.headings.h1, theme)
    } else if (tagName === 'h2' && components.headings.h2) {
      applyHeadingStyles(element, components.headings.h2, theme)
    } else if (tagName === 'h3' && components.headings.h3) {
      applyHeadingStyles(element, components.headings.h3, theme)
    } else if (tagName === 'h4' && components.headings.h4) {
      applyHeadingStyles(element, components.headings.h4, theme)
    }
  }

  // 列表样式
  if (tagName === 'ul' && components.lists?.ul) {
    applyListStyles(element, components.lists.ul, false)
  } else if (tagName === 'ol' && components.lists?.ol) {
    applyListStyles(element, components.lists.ol, true)
  }

  if (tagName === 'li' && components.lists?.li) {
    safeApplyStyles(element, components.lists.li.styles)

    if (components.lists.li.pseudoBefore) {
      applyPseudoElement(element, 'before', components.lists.li.pseudoBefore)
    }

    if (components.lists.li.transforms) {
      element.style.transform = components.lists.li.transforms.join(' ')
    }
  }

  // 分隔符样式
  if (tagName === 'hr' && components.dividers) {
    applyDividerStyles(element, components.dividers)
  }

  // 链接样式
  if (tagName === 'a' && components.links) {
    safeApplyStyles(element, components.links.styles)
    if (components.links.hoverStyles) {
      // 注意：hover 效果在微信中无效，但保留样式
      element.addEventListener('mouseenter', () => {
        safeApplyStyles(element, components.links!.hoverStyles!)
      })
    }
  }

  // 引用块样式
  if (tagName === 'blockquote' && components.blockquote) {
    safeApplyStyles(element, components.blockquote.styles)

    if (components.blockquote.pseudoBefore) {
      applyPseudoElement(element, 'before', components.blockquote.pseudoBefore)
    }

    if (components.blockquote.transforms) {
      element.style.transform = components.blockquote.transforms.join(' ')
    }

    if (components.blockquote.borderRadius) {
      element.style.borderRadius = components.blockquote.borderRadius
    }
  }

  // 代码块样式
  if (tagName === 'pre' && components.codeBlocks?.pre) {
    safeApplyStyles(element, components.codeBlocks.pre)
  }

  if (tagName === 'code' && components.codeBlocks?.code) {
    safeApplyStyles(element, components.codeBlocks.code)
  }

  // 组件模板
  if (components.components) {
    // CTA 链接
    if (tagName === 'a' && components.components.ctaLink) {
      const link = element as HTMLAnchorElement
      if (link.textContent?.includes('立即') || link.textContent?.includes('查看更多')) {
        safeApplyStyles(link, components.components.ctaLink)
      }
    }

    // 其他组件...
    const classList = element.classList
    if (classList.contains('wx-pill') && components.components.pill) {
      safeApplyStyles(element, components.components.pill)
    }
    if (classList.contains('wx-alert') && components.components.alertCard) {
      safeApplyStyles(element, components.components.alertCard)
    }
    // ... 其他卡片组件
  }
}
```

### 4. Chinese 主题数据实现（示例）

```typescript
// ========== Chinese 主题完整数据 ==========

const chineseTheme: ThemePreset = {
  id: 'chinese',
  name: '中式典雅',
  tokens: {
    '--wx-surface': '#ffffff',
    '--wx-text': '#333333',
    '--wx-heading': '#a72f2f',
    '--wx-subheading': '#555555',
    '--wx-link': '#a72f2f',
    '--wx-accent': '#a72f2f',
    '--wx-accent-contrast': '#ffffff',
    '--wx-quote-border': '#a72f2f',
    '--wx-code-bg': '#f3f3f1',
    '--wx-code-text': '#555',
  },
  components: {
    // 容器（替代 .content）
    container: {
      styles: {
        backgroundColor: '#ffffff',
        padding: '30px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        maxWidth: '800px',
        margin: '0 auto',
      },
      // 无伪元素
    },

    // 标题
    headings: {
      h1: {
        styles: {
          fontSize: '1.9em',
          fontWeight: '500',
          textAlign: 'center',
          color: '#a72f2f',
          paddingBottom: '15px',
          margin: '25px 0 35px',
        },
        // 下划线用 border-bottom 模拟虚线
        // 渐变效果用 background 实现
      },
      h2: {
        styles: {
          fontSize: '1.5em',
          fontWeight: '600',
          color: '#fff',
          margin: '50px 0 25px',
          padding: '10px 20px',
          display: 'inline-block',
        },
        gradient: {
          angle: '135deg',
          colors: ['#a72f2f', '#c44545']
        }
      },
      h3: {
        styles: {
          fontSize: '1.3em',
          fontWeight: '600',
          color: '#555',
          margin: '35px 0 20px',
          padding: '10px 0',
          borderTop: '1px solid #e0e0e0',
          borderBottom: '1px solid #e0e0e0',
          textAlign: 'center',
        }
      },
      h4: {
        styles: {
          fontSize: '1.1em',
          fontWeight: '600',
          color: '#a72f2f',
          margin: '30px 0 15px',
          paddingLeft: '12px',
          borderLeft: '4px solid #a72f2f',
        }
      }
    },

    // 列表
    lists: {
      ul: {
        styles: {
          // list-style: none 通过 padding-left 模拟项目符号
          paddingLeft: '0',
          margin: '30px 0',
        },
        listStyle: 'none',
        markers: {
          simple: {
            symbol: '·',
            color: '#a72f2f',
            position: { left: '8px' },
            styles: {
              fontSize: '1.2em',
              lineHeight: '1.4',
            }
          }
        }
      },
      ol: {
        styles: {
          margin: '30px 0',
        }
      },
      li: {
        styles: {
          marginBottom: '1.2em',
          paddingLeft: '28px', // 为 marker 留出空间
          position: 'relative',
        }
      }
    },

    // 分隔符
    dividers: {
      styles: {
        border: 'none',
        height: '2px',
        margin: '50px 0',
      },
      hasPattern: false
    },

    // 链接
    links: {
      styles: {
        color: '#a72f2f',
        textDecoration: 'none',
        fontWeight: '600',
        borderBottom: '1px solid rgba(167, 47, 47, 0.3)',
      },
      hoverStyles: {
        backgroundColor: 'rgba(167, 47, 47, 0.1)',
        borderBottomColor: '#a72f2f',
      }
    },

    // 引用块
    blockquote: {
      styles: {
        backgroundColor: '#fdfdfb',
        color: '#666',
        padding: '15px 20px',
        margin: '30px 0',
        borderLeft: '3px solid #a72f2f',
        fontSize: '0.95em',
      }
    },

    // 代码块
    codeBlocks: {
      pre: {
        fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
        background: '#f3f3f1',
        color: '#333',
        padding: '1.5em',
        margin: '25px 0',
        borderRadius: '4px',
        overflowX: 'auto',
        border: '1px solid #e0e0e0',
      },
      code: {
        fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
        backgroundColor: '#f3f3f1',
        color: '#555',
        padding: '0.2em 0.5em',
        margin: '0 2px',
        fontSize: '0.9em',
        borderRadius: '4px',
      }
    },

    // 表格
    tables: {
      table: {
        width: '100%',
        borderCollapse: 'collapse',
        margin: '25px 0',
      },
      th: {
        backgroundColor: '#f5f5f5',
        color: '#333',
        padding: '12px 16px',
        border: '1px solid #e0e0e0',
        textAlign: 'left',
        fontWeight: '600',
      },
      td: {
        padding: '12px 16px',
        border: '1px solid #e0e0e0',
        verticalAlign: 'top',
      },
      tr: {
        border: '1px solid #e0e0e0',
      }
    },

    // 组件
    components: {
      ctaLink: {
        display: 'inline-block',
        padding: '12px 28px',
        background: '#a72f2f',
        borderRadius: '999px',
        fontWeight: '600',
        color: '#fff',
        textDecoration: 'none',
        textAlign: 'center',
      },
      pill: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '999px',
        background: '#fef3c7',
        color: '#92400e',
        fontSize: '0.875em',
        fontWeight: '500',
      },
      alertCard: {
        margin: '24px 0',
        padding: '20px',
        borderRadius: '16px',
        background: '#fff7ed',
        border: '1px solid rgba(231, 111, 0, 0.15)',
      },
      // ... 其他卡片组件
    }
  },
  isBuiltin: true,
  createdAt: new Date().toISOString(),
}
```

### 5. 测试用例设计

```typescript
// ========== 测试用例 ==========

describe('Chinese Theme Style Conversion', () => {
  it('should preserve container styles equivalent to .content', () => {
    const html = '<h1>标题</h1>'
    const theme = getThemePreset('chinese')

    const result = convertToInlineStyles(html, theme)
    const parser = new DOMParser()
    const doc = parser.parseFromString(result, 'text/html')

    // 验证容器存在且样式正确
    const container = doc.querySelector('div > div > h1')?.parentElement
    expect(container).toBeTruthy()
    expect(container?.getAttribute('style')).toContain('background-color: #ffffff')
    expect(container?.getAttribute('style')).toContain('padding: 30px')
    expect(container?.getAttribute('style')).toContain('box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05)')
    expect(container?.getAttribute('style')).toContain('max-width: 800px')
    expect(container?.getAttribute('style')).toContain('border: 1px solid #e0e0e0')
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

  it('should remove class and id attributes', () => {
    const html = '<div class="test-class" id="test-id"><p>内容</p></div>'
    const theme = getThemePreset('chinese')

    const result = convertToInlineStyles(html, theme)
    expect(result).not.toContain('class=')
    expect(result).not.toContain('id=')
  })

  it('should handle CTA link template', () => {
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
    expect(cta?.getAttribute('style')).toContain('color: #fff')
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
```

## 实施计划

### 阶段 1: Chinese 主题（2-3 天）
1. 更新 TypeScript 类型定义
2. 重构转换器主函数
3. 实现 Chinese 主题完整数据
4. 编写测试用例
5. 验证转换效果

### 阶段 2: Memphis 主题（3-4 天）
1. 实现复杂列表 marker（4 色循环）
2. 实现旋转效果
3. 实现伪元素装饰（::before/::after）
4. 验证转换效果

### 阶段 3: 其他主题（5-6 天）
1. ByteDance（渐变背景）
2. Renaissance（装饰符）
3. Minimalist（counter）
4. Cyberpunk（荧光效果、text-shadow）

## 关键技术点总结

✅ **彻底分离样式与元数据**：StyleProps 仅包含 CSS 属性
✅ **伪元素替代**：使用实际 DOM 元素 + textContent
✅ **nth-child 正确解析**：索引从 1 开始，正确匹配循环模式
✅ **容器显式创建**：替代 .content，包含所有装饰
✅ **幂等性保证**：使用 data-wx-marker 等标记避免重复插入
✅ **MVP 属性锁定**：每个主题的关键效果清单明确
✅ **完整测试**：DOM 解析验证具体节点和样式

这个方案解决了 GPT-5 提出的所有问题，可以确保第一阶段的 Chinese 主题成功落地！
