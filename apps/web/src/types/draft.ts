export interface MediaStats {
  images: number
  tables: number
  codeBlocks: number
}

export interface ArticleDraft {
  id: string
  title: string
  markdown: string
  astVersion: number
  previewHtml: string
  wordCount: number
  mediaStats: MediaStats
  themeId: string
  updatedAt: string
}

export interface ThemeTokens {
  [token: string]: string | number
}

export interface ThemeComponentConfig {
  [component: string]: Record<string, string | number>
}

/**
 * 纯样式属性对象（不含元数据）
 */
export type StyleProps = Record<string, string | number>

/**
 * 伪元素配置（替代 CSS 伪元素）
 */
export interface PseudoElementConfig {
  content: string
  styles: StyleProps
  positioning: 'absolute' | 'fixed' | 'relative'
  selector?: string // 用于精确选择 'h2::after', '.separator::before' 等
}

/**
 * nth-child 模式匹配配置
 */
export interface NthChildPattern {
  pattern: string // '4n+1', '4n+2', 'odd', 'even', '3' 等
  styles: StyleProps
  content: string
  selector?: string // 可选的子元素选择器
}

/**
 * 列表 marker 配置（彻底分离）
 */
export interface ListMarkerConfig {
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
export interface ContainerDecoration {
  selector: string // '.content::before', '.content::after'
  content: string
  styles: StyleProps
  position: 'absolute' | 'relative'
}

/**
 * 主题组件样式结构（完整版）
 */
export interface ThemeComponentStyles {
  // 页面全局样式（替代 body.theme-xxx） - ✅ 必须为可选，否则未迁移主题被迫补齐
  page?: {
    styles: StyleProps
  }

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
      gradient?: {
        type?: 'linear' | 'repeating-linear'  // ✅ 支持 repeating-linear 类型
        angle: string
        colors: string[]
      }
      counter?: { reset?: string; increment?: string } // Minimalist
    }
    h2: {
      styles: StyleProps
      transforms?: string[]
      pseudoBefore?: PseudoElementConfig
      pseudoAfter?: PseudoElementConfig
      textShadow?: string
      boxShadow?: string
      gradient?: {
        type?: 'linear' | 'repeating-linear'  // ✅ 支持 repeating-linear 类型
        angle: string
        colors: string[]
      }
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
 * 完整 ThemePreset 接口 - 渐进式扩展保持向后兼容
 */
export interface ThemePreset {
  id: string
  name: string
  tokens: ThemeTokens
  // V1 兼容：原有的简单组件配置继续工作
  components?: ThemeComponentConfig
  // V2 新增：结构化的组件样式（可选）
  structured?: ThemeComponentStyles
  isBuiltin: boolean
  createdAt: string
}

export type CompatibilityIssueType = 'link' | 'style' | 'media' | 'unknown'
export type CompatibilityIssueSeverity = 'info' | 'warning' | 'critical'

export interface CompatibilityIssue {
  type: CompatibilityIssueType
  description: string
  severity: CompatibilityIssueSeverity
}

export interface CompatibilityReport {
  id: string
  draftId: string
  themeId: string
  successRate: number
  issues: CompatibilityIssue[]
  testedAt: string
  testSource: 'playwright' | 'manual'
  evidenceUrl?: string | null
  recommendedActions?: string[]
}

export interface AppSettings {
  themeMode: 'light' | 'dark'
  scrollSync: boolean
  fontSize: 'small' | 'medium' | 'large'
  exportBackground: 'warm' | 'grid' | 'none'
  selectedThemeId: string
}

export type ThemeStyle = 'default' | 'tech' | 'apple' | 'sports' | 'chinese' | 'cyberpunk'
