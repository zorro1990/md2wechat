import type { ThemePreset } from '@/types'

const buildTheme = (theme: {
  id: string
  name: string
  tokens: ThemePreset['tokens']
  components?: ThemePreset['components']
  structured?: ThemePreset['structured']
}): ThemePreset => ({
  id: theme.id,
  name: theme.name,
  tokens: theme.tokens,
  components: theme.components ?? {},
  structured: theme.structured,
  isBuiltin: true,
  createdAt: new Date('2024-01-01').toISOString(),
})

export const BUILTIN_THEMES: ThemePreset[] = [
  buildTheme({
    id: 'chinese',
    name: '中国风',
    tokens: {
      '--wx-surface': '#f7f6f2',
      '--wx-text': '#333333',
      '--wx-heading': '#a72f2f',
      '--wx-subheading': '#555555',
      '--wx-accent': '#a72f2f',
      '--wx-accent-contrast': '#ffffff',
      '--wx-link': '#a72f2f',
      '--wx-quote-border': '#a72f2f',
      '--wx-code-bg': '#f3f3f1',
      '--wx-code-text': '#555555',
    },
    structured: {
      // 页面全局样式（替代 body.theme-chinese）
      page: {
        styles: {
          fontFamily: '"Songti SC", "STSong", "KaiTi", "SimSun", serif, -apple-system, BlinkMacSystemFont, sans-serif',
          lineHeight: '1.9',
          color: '#333333',
          backgroundColor: '#f7f6f2',
        },
      },

      // 容器样式（替代 .content）
      container: {
        styles: {
          backgroundColor: '#ffffff',
          padding: '30px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          maxWidth: '800px',
          margin: '0 auto',
        },
      },

      // 标题样式
      headings: {
        h1: {
          styles: {
            fontSize: '1.9em',
            fontWeight: '500',
            textAlign: 'center',
            color: '#a72f2f',
            paddingBottom: '15px',
            margin: '25px 0 35px',
            // 使用 border-bottom 模拟虚线下划线
            borderBottom: '2px dashed rgba(167, 47, 47, 0.5)',
          },
        },
        h2: {
          styles: {
            fontSize: '1.5em',
            fontWeight: '600',
            color: '#ffffff',
            margin: '50px 0 25px',
            padding: '10px 20px',
            display: 'inline-block',
            backgroundColor: '#a72f2f',
          },
          // 渐变背景 - ✅ 支持 repeating-linear-gradient
          gradient: {
            type: 'repeating-linear',  // 关键：指定类型
            angle: '135deg',
            colors: [
              'rgba(255,255,255,0.05) 0 1px',  // ✅ 真实语法：颜色 + 位置范围
              'transparent 1px 4px',           // ✅ 真实语法：颜色 + 位置范围
            ],
          },
        },
        h3: {
          styles: {
            fontSize: '1.3em',
            fontWeight: '600',
            color: '#555555',
            margin: '35px 0 20px',
            padding: '10px 0',
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            textAlign: 'center',
          },
        },
        h4: {
          styles: {
            fontSize: '1.1em',
            fontWeight: '600',
            color: '#a72f2f',
            margin: '30px 0 15px',
            paddingLeft: '12px',
            borderLeft: '4px solid #a72f2f',
          },
        },
      },

      // 列表样式
      lists: {
        ul: {
          styles: {
            listStyle: 'none',
            paddingLeft: '0',
            margin: '30px 0',
          },
          listStyle: 'none',
          markers: {
            // 简单 marker（Chinese 使用 '·'）
            simple: {
              symbol: '·',
              color: '#a72f2f',
              position: { left: '8px' },
              styles: {
                fontSize: '1.2em',
                lineHeight: '1.4',
              },
            },
          },
        },
        ol: {
          styles: {
            margin: '30px 0',
            paddingLeft: '1.5em',
          },
          listStyle: 'decimal',
        },
        li: {
          styles: {
            marginBottom: '1.2em',
            paddingLeft: '28px', // 为 marker 留出空间
            position: 'relative',
            lineHeight: '1.8',
          },
        },
      },

      // 分隔符样式
      dividers: {
        styles: {
          border: 'none',
          height: '2px',
          margin: '50px 0',
          backgroundColor: 'transparent',
          // 可以添加虚线效果
        },
        hasPattern: false,
      },

      // 链接样式
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
        },
      },

      // 引用块样式
      blockquote: {
        styles: {
          backgroundColor: '#fdfdfb',
          color: '#666666',
          padding: '15px 20px',
          margin: '30px 0',
          borderLeft: '3px solid #a72f2f',
          fontSize: '0.95em',
          lineHeight: '1.7',
        },
      },

      // 代码块样式
      codeBlocks: {
        pre: {
          fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
          background: '#f3f3f1',
          color: '#333333',
          padding: '1.5em',
          margin: '25px 0',
          borderRadius: '4px',
          overflowX: 'auto',
          border: '1px solid #e0e0e0',
          lineHeight: '1.6',
        },
        code: {
          fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
          backgroundColor: '#f3f3f1',
          color: '#555555',
          padding: '0.2em 0.5em',
          margin: '0 2px',
          fontSize: '0.9em',
          borderRadius: '4px',
        },
      },

      // 表格样式
      tables: {
        table: {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '25px 0',
        },
        th: {
          backgroundColor: '#f5f5f5',
          color: '#333333',
          padding: '12px 16px',
          border: '1px solid #e0e0e0',
          textAlign: 'left',
          fontWeight: '600',
          verticalAlign: 'middle',
        },
        td: {
          padding: '12px 16px',
          border: '1px solid #e0e0e0',
          verticalAlign: 'top',
          lineHeight: '1.6',
          color: '#333333',
        },
        tr: {
          border: '1px solid #e0e0e0',
        },
      },

      // 组件模板
      components: {
        ctaLink: {
          display: 'inline-block',
          padding: '12px 28px',
          background: '#a72f2f',
          borderRadius: '999px',
          fontWeight: '600',
          color: '#ffffff',
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
        infoCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '16px',
          background: '#eff6ff',
          border: '1px solid rgba(59, 130, 246, 0.15)',
        },
        successCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '16px',
          background: '#f0fdf4',
          border: '1px solid rgba(34, 197, 94, 0.15)',
        },
        warningCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '16px',
          background: '#fefce8',
          border: '1px solid rgba(234, 179, 8, 0.15)',
        },
        errorCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '16px',
          background: '#fef2f2',
          border: '1px solid rgba(239, 68, 68, 0.15)',
        },
      },
    },
  }),
  buildTheme({
    id: 'bytedance',
    name: '字节风',
    tokens: {
      '--wx-surface': '#f4f5f5',
      '--wx-text': '#1f2329',
      '--wx-heading': '#1f2329',
      '--wx-subheading': '#4e5969',
      '--wx-accent': '#2970FF',
      '--wx-accent-contrast': '#ffffff',
      '--wx-link': '#2970FF',
      '--wx-quote-border': '#c9cdd4',
      '--wx-code-bg': '#f4f5f5',
      '--wx-code-text': '#1f2329',
    },
    structured: {
      // 页面全局样式（从 themes.css:129-134 提取）
      page: {
        styles: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", "WenQuanYi Micro Hei", sans-serif',
          lineHeight: '1.8',
          color: '#1f2329',
          backgroundColor: '#f4f5f5',
        },
      },

      // 容器样式（从 themes.css:136-143 提取）
      container: {
        styles: {
          backgroundColor: '#ffffff',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          maxWidth: '800px',
          margin: '0 auto',
        },
      },

      // 标题样式（从 themes.css:145-183 提取）
      headings: {
        h1: {
          styles: {
            fontSize: '1.8em',
            fontWeight: '600',
            textAlign: 'center',
            color: '#1f2329',
            paddingBottom: '20px',
            margin: '25px 0 35px',
            borderBottom: '1px solid #e5e6eb',
          },
        },
        h2: {
          styles: {
            fontSize: '1.5em',
            fontWeight: '500',
            color: '#fff',
            margin: '50px auto 25px',
            padding: '12px 25px',
            display: 'table',
            borderRadius: '100px',
            backgroundImage: 'linear-gradient(135deg, #2970FF 0%, #5A98FF 100%)',
            boxShadow: '0 4px 10px rgba(41, 112, 255, 0.3)',
          },
          gradient: {
            type: 'linear',
            angle: '135deg',
            colors: ['#2970FF', '#5A98FF'],
          },
          boxShadow: '0 4px 10px rgba(41, 112, 255, 0.3)',
        },
        h3: {
          styles: {
            fontSize: '1.25em',
            fontWeight: '500',
            color: '#1f2329',
            margin: '35px 0 20px',
            padding: '12px 18px',
            backgroundColor: '#f4f5f5',
            borderLeft: '4px solid #5A98FF',
            borderRadius: '6px',
          },
        },
        h4: {
          styles: {
            fontSize: '1.1em',
            fontWeight: '600',
            color: '#4e5969',
            margin: '30px 0 15px',
          },
        },
      },

      // 列表样式（从 themes.css:207-210 提取）
      lists: {
        ul: {
          styles: {
            listStyle: 'none',
            paddingLeft: '0',
            margin: '30px 0',
          },
          markers: {
            simple: {
              symbol: '●',
              color: '#5A98FF',
              styles: {
                position: 'absolute',
                left: '0',
                top: '0.6em',
                width: '6px',
                height: '6px',
                fontSize: '1.2em',
                transform: 'translateY(-50%)',
              },
            },
          },
        },
        ol: {
          styles: {
            margin: '30px 0',
            paddingLeft: '1.5em',
          },
          listStyle: 'decimal',
        },
        li: {
          styles: {
            marginBottom: '0.5em',
            paddingLeft: '28px',
            position: 'relative',
            lineHeight: '1.75',
          },
        },
      },

      // 链接样式（从 themes.css:185-195 提取）
      links: {
        styles: {
          color: '#2970FF',
          textDecoration: 'none',
          fontWeight: '500',
          borderBottom: '1px solid transparent',
        },
        hoverStyles: {
          borderBottomColor: '#2970FF',
        },
      },

      // 引用块样式（从 themes.css:197-205 提取）
      blockquote: {
        styles: {
          backgroundColor: '#f4f5f5',
          color: '#4e5969',
          padding: '15px 20px',
          margin: '30px 0',
          borderLeft: '4px solid #c9cdd4',
          borderRadius: '4px',
          fontSize: '0.95em',
        },
      },

      // 代码块样式（从 themes.css:212-231 提取）
      codeBlocks: {
        code: {
          fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
          backgroundColor: '#f4f5f5',
          color: '#1f2329',
          padding: '0.2em 0.5em',
          margin: '0 2px',
          fontSize: '0.9em',
          borderRadius: '4px',
        },
        pre: {
          fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
          background: '#f4f5f5',
          color: '#1f2329',
          padding: '1.5em',
          margin: '25px 0',
          borderRadius: '6px',
          overflowX: 'auto',
          border: '1px solid #e5e6eb',
        },
      },

      // 分隔符样式
      dividers: {
        styles: {
          border: 'none',
          height: '1px',
          backgroundColor: '#e5e6eb',
          margin: '30px 0',
        },
      },

      // 表格样式
      tables: {
        table: {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '25px 0',
        },
        th: {
          backgroundColor: '#f4f5f5',
          color: '#1f2329',
          padding: '12px 16px',
          border: '1px solid #e5e6eb',
          textAlign: 'left',
          fontWeight: '600',
          verticalAlign: 'middle',
        },
        td: {
          padding: '12px 16px',
          border: '1px solid #e5e6eb',
          verticalAlign: 'top',
          lineHeight: '1.6',
          color: '#1f2329',
        },
        tr: {
          border: '1px solid #e5e6eb',
        },
      },

      // 组件模板
      components: {
        ctaLink: {
          display: 'inline-block',
          padding: '12px 28px',
          background: '#2970FF',
          borderRadius: '100px',
          fontWeight: '500',
          color: '#ffffff',
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(41, 112, 255, 0.3)',
        },
        pill: {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '999px',
          background: '#EBF2FF',
          color: '#2970FF',
          fontSize: '0.875em',
          fontWeight: '500',
        },
        alertCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#FFF7ED',
          border: '1px solid rgba(234, 88, 12, 0.2)',
        },
        infoCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#EBF2FF',
          border: '1px solid rgba(41, 112, 255, 0.2)',
        },
        successCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#F0FDF4',
          border: '1px solid rgba(34, 197, 94, 0.2)',
        },
        warningCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#FFFBEB',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        },
        errorCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#FEF2F2',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        },
      },
    },
  }),
  buildTheme({
    id: 'memphis',
    name: '孟菲斯',
    tokens: {
      '--wx-surface': '#f7f7f7',
      '--wx-text': '#2c2c2c',
      '--wx-heading': '#000000',
      '--wx-subheading': '#2c2c2c',
      '--wx-accent': '#118AB2',
      '--wx-accent-contrast': '#ffffff',
      '--wx-link': '#118AB2',
      '--wx-quote-border': '#EF476F',
      '--wx-code-bg': '#ffffff',
      '--wx-code-text': '#000000',
    },
    structured: {
      // 页面全局样式（从 themes.css:236-244 提取）
      page: {
        styles: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif',
          lineHeight: '1.8',
          color: '#2c2c2c',
          backgroundColor: '#f7f7f7',
          backgroundImage: 'radial-gradient(#ffd166 15%, transparent 16%), radial-gradient(#06d6a0 15%, transparent 16%)',
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px',
        },
      },

      // 容器样式（从 themes.css:246-253 提取）
      container: {
        styles: {
          backgroundColor: '#ffffff',
          padding: '40px',
          border: '3px solid #000',
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
        },
        pseudoBefore: {
          content: '',
          styles: {
            position: 'absolute',
            top: '-25px',
            left: '20px',
            width: '120px',
            height: '15px',
            backgroundImage: 'repeating-linear-gradient(-45deg, #000, #000 10px, #ffd166 10px, #ffd166 20px)',
            zIndex: '1',
            transform: 'rotate(-3deg)',
          },
          positioning: 'absolute',
        },
        pseudoAfter: {
          content: '',
          styles: {
            position: 'absolute',
            bottom: '20px',
            right: '-30px',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: '0 30px 50px 30px',
            borderColor: 'transparent transparent #EF476F transparent',
            zIndex: '-1',
          },
          positioning: 'absolute',
        },
      },

      // 标题样式（从 themes.css:280-331 提取）
      headings: {
        h1: {
          styles: {
            fontSize: '2.5em',
            fontWeight: '900',
            textAlign: 'center',
            margin: '25px 0 40px',
            padding: '20px',
            lineHeight: '1.3',
            color: '#000',
            backgroundColor: '#fff',
            border: '3px solid #000',
            boxShadow: '8px 8px 0 #EF476F',
          },
          transforms: ['rotate(-2deg)'],
          boxShadow: '8px 8px 0 #EF476F',
        },
        h2: {
          styles: {
            fontSize: '1.8em',
            fontWeight: '800',
            color: '#fff',
            backgroundColor: '#118AB2',
            margin: '60px 0 30px',
            padding: '15px 25px',
            border: '3px solid #000',
            display: 'inline-block',
            boxShadow: '8px 8px 0 #FFD166',
          },
          transforms: ['rotate(1.5deg)'],
          boxShadow: '8px 8px 0 #FFD166',
        },
        h3: {
          styles: {
            fontSize: '1.4em',
            fontWeight: '700',
            color: '#000',
            margin: '45px 0 20px',
            padding: '10px 15px',
            display: 'inline-block',
            border: '2px solid #000',
            background: '#fff',
            position: 'relative',
            zIndex: '1',
          },
        },
        h4: {
          styles: {
            fontSize: '1.2em',
            fontWeight: '700',
            color: '#000',
            margin: '30px 0 15px',
            padding: '8px 30px 8px 15px',
            display: 'inline-block',
            backgroundColor: '#06D6A0',
            position: 'relative',
            border: '2px solid #000',
            boxShadow: '4px 4px 0px #000',
          },
          boxShadow: '4px 4px 0px #000',
        },
      },

      // 列表样式（从 themes.css:353-384 提取，修正 marker 结构）
      lists: {
        ul: {
          styles: {
            listStyle: 'none',
            paddingLeft: '0',
            margin: '30px 0',
          },
          listStyle: 'none',
          markers: {
            // 彩色 nthChild markers（从 themes.css:366-384 提取，添加 styles 字段）
            nthChild: [
              {
                pattern: '4n+1',
                content: '★',
                styles: {
                  backgroundColor: '#EF476F',
                  transform: 'rotate(-10deg)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  color: '#fff',
                  fontSize: '1.5em',
                  lineHeight: '40px',
                  textAlign: 'center',
                  position: 'absolute',
                  left: '0',
                  top: '-5px',
                }
              },
              {
                pattern: '4n+2',
                content: '★',
                styles: {
                  backgroundColor: '#06D6A0',
                  transform: 'rotate(-10deg)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  color: '#fff',
                  fontSize: '1.5em',
                  lineHeight: '40px',
                  textAlign: 'center',
                  position: 'absolute',
                  left: '0',
                  top: '-5px',
                }
              },
              {
                pattern: '4n+3',
                content: '★',
                styles: {
                  backgroundColor: '#FFD166',
                  transform: 'rotate(-10deg)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  color: '#fff',
                  fontSize: '1.5em',
                  lineHeight: '40px',
                  textAlign: 'center',
                  position: 'absolute',
                  left: '0',
                  top: '-5px',
                }
              },
              {
                pattern: '4n+4',
                content: '★',
                styles: {
                  backgroundColor: '#118AB2',
                  transform: 'rotate(-10deg)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  color: '#fff',
                  fontSize: '1.5em',
                  lineHeight: '40px',
                  textAlign: 'center',
                  position: 'absolute',
                  left: '0',
                  top: '-5px',
                }
              },
            ],
          },
        },
        li: {
          styles: {
            marginBottom: '1.2em',
            paddingLeft: '3.5em',
            position: 'relative',
            fontWeight: '500',
          },
        },
        ol: {
          styles: {
            margin: '30px 0',
            paddingLeft: '1.5em',
          },
          listStyle: 'decimal',
        },
      },

      // 分隔符样式（从 themes.css:386-392 提取）
      dividers: {
        styles: {
          border: 'none',
          height: '8px',
          backgroundColor: 'transparent',
          backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)',
          margin: '60px 0',
        },
        hasPattern: true,
      },

      // 链接样式（从 themes.css:333-338 提取）
      links: {
        styles: {
          color: '#118AB2',
          textDecoration: 'none',
          fontWeight: '600',
        },
      },

      // 引用块样式（从 themes.css:340-351 提取）
      blockquote: {
        styles: {
          backgroundColor: '#fff',
          color: '#000',
          padding: '25px',
          margin: '40px 0',
          border: '3px solid #000',
          borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
          fontSize: '1.1em',
          fontWeight: '600',
          position: 'relative',
          transform: 'rotate(1deg)',
        },
        transforms: ['rotate(1deg)'],
      },

      // 代码块样式（从 themes.css:394-413 提取）
      codeBlocks: {
        code: {
          fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
          backgroundColor: '#f4f5f5',
          color: '#1f2329',
          padding: '0.2em 0.5em',
          margin: '0 2px',
          fontSize: '0.9em',
          borderRadius: '4px',
        },
        pre: {
          fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
          background: '#f4f5f5',
          color: '#1f2329',
          padding: '1.5em',
          margin: '25px 0',
          borderRadius: '6px',
          overflowX: 'auto',
          border: '1px solid #e5e6eb',
        },
      },

      // 表格样式（从 CSS 推断或通用样式）
      tables: {
        table: {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '25px 0',
        },
        th: {
          backgroundColor: '#F0F8FF',
          color: '#2c2c2c',
          padding: '12px 16px',
          border: '2px solid #118AB2',
          textAlign: 'left',
          fontWeight: '600',
          verticalAlign: 'middle',
        },
        td: {
          padding: '12px 16px',
          border: '2px solid #e0e0e0',
          verticalAlign: 'top',
          lineHeight: '1.6',
          color: '#2c2c2c',
        },
        tr: {
          border: '2px solid #e0e0e0',
        },
      },

      // 组件模板
      components: {
        ctaLink: {
          display: 'inline-block',
          padding: '12px 28px',
          background: '#118AB2',
          borderRadius: '4px',
          fontWeight: '600',
          color: '#ffffff',
          textDecoration: 'none',
          textAlign: 'center',
          border: '2px solid #118AB2',
        },
        pill: {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '999px',
          background: '#FFD166',
          color: '#000000',
          fontSize: '0.875em',
          fontWeight: '600',
        },
        alertCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '4px',
          background: '#FFF5F7',
          border: '2px solid #EF476F',
        },
        infoCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '4px',
          background: '#F0F8FF',
          border: '2px solid #118AB2',
        },
        successCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '4px',
          background: '#F0FFF4',
          border: '2px solid #06D6A0',
        },
        warningCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '4px',
          background: '#FFFBF0',
          border: '2px solid #FFD166',
        },
        errorCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '4px',
          background: '#FFF5F7',
          border: '2px solid #EF476F',
        },
      },
    },
  }),
  buildTheme({
    id: 'renaissance',
    name: '文艺复兴',
    tokens: {
      '--wx-surface': '#fbf5e9',
      '--wx-text': '#3d3d3d',
      '--wx-heading': '#9B2226',
      '--wx-subheading': '#3d3d3d',
      '--wx-accent': '#003049',
      '--wx-accent-contrast': '#ffffff',
      '--wx-link': '#003049',
      '--wx-quote-border': '#e9c46a',
      '--wx-code-bg': 'rgba(233, 196, 106, 0.1)',
      '--wx-code-text': '#3d3d3d',
    },
    structured: {
      // 页面全局样式（从 themes.css:418-424 提取）
      page: {
        styles: {
          fontFamily: '"Garamond", "Palatino", "Georgia", "Times New Roman", "FangSong", "STFangsong", serif',
          lineHeight: '1.9',
          color: '#3d3d3d',
          backgroundColor: '#fbf5e9',
          backgroundImage: 'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Cg fill="%23ab987a" fill-opacity="0.07"%3E%3Cpath fill-rule="evenodd" d="M11 0l5 20-5-5-5 5L11 0zm28 28l5 20-5-5-5 5L39 28zm28 28l5 20-5-5-5 5L67 56zM0 28l5 20-5-5-5 5L0 28zm28 56l5 20-5-5-5 5L28 84zm28-28l5 20-5-5-5 5L56 56zM56 0l5 20-5-5-5 5L56 0z"/%3E%3C/g%3E%3C/svg%3E\')',
        },
      },

      // 容器样式（从 themes.css:426-435 提取）
      container: {
        styles: {
          backgroundColor: 'rgba(251, 245, 233, 0.8)',
          padding: '40px 50px',
          maxWidth: '800px',
          margin: '0 auto',
          border: '1px solid #e9c46a',
          outline: '1px solid #e9c46a',
          outlineOffset: '-8px',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.08)',
        },
      },

      // 标题样式（从 themes.css:437-471 提取）
      headings: {
        h1: {
          styles: {
            fontSize: '2.2em',
            fontWeight: '600',
            textAlign: 'center',
            color: '#9B2226',
            margin: '15px 0 15px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          },
        },
        h2: {
          styles: {
            fontSize: '1.1em',
            fontStyle: 'italic',
            fontWeight: 'normal',
            textAlign: 'center',
            color: '#003049',
            margin: '0 auto 40px',
          },
        },
        h3: {
          styles: {
            fontSize: '1.4em',
            fontWeight: '600',
            color: '#3d3d3d',
            margin: '50px 0 25px',
            textAlign: 'center',
            borderBottom: '2px solid #e9c46a',
            paddingBottom: '10px',
          },
        },
        h4: {
          styles: {
            fontSize: '1.2em',
            fontWeight: '600',
            color: '#3d3d3d',
            margin: '30px 0 15px',
          },
        },
      },

      // 列表样式（从 themes.css:500-519 提取）
      lists: {
        ul: {
          styles: {
            listStyleType: 'none',
            margin: '30px 0',
            paddingLeft: '0',
          },
          markers: {
            simple: {
              symbol: '⚜',
              color: '#003049',
              styles: {
                fontSize: '1.2em',
                position: 'absolute',
                left: '0',
                top: '2px',
              },
            },
          },
        },
        li: {
          styles: {
            marginBottom: '1.2em',
            paddingLeft: '2.8em',
            position: 'relative',
          },
        },
        ol: {
          styles: {
            margin: '30px 0',
            paddingLeft: '1.5em',
          },
          listStyle: 'decimal',
        },
      },

      // 链接样式（从 themes.css:473-483 提取）
      links: {
        styles: {
          color: '#003049',
          textDecoration: 'none',
          fontWeight: '600',
          borderBottom: '1px solid rgba(0, 48, 73, 0.4)',
        },
        hoverStyles: {
          backgroundColor: 'rgba(0, 48, 73, 0.05)',
        },
      },

      // 引用块样式（从 themes.css:485-498 提取）
      blockquote: {
        styles: {
          fontFamily: '"Georgia", "Times New Roman", "KaiTi", "STKaiti", serif',
          fontSize: '1.2em',
          fontStyle: 'italic',
          color: '#9B2226',
          padding: '20px',
          margin: '40px 0',
          textAlign: 'center',
          position: 'relative',
          lineHeight: '1.7',
          borderTop: '1px solid #e9c46a',
          borderBottom: '1px solid #e9c46a',
          backgroundColor: 'transparent',
        },
      },

      // 分隔符样式（从 themes.css:521-531 提取）
      dividers: {
        styles: {
          textAlign: 'center',
          color: '#e9c46a',
          margin: '40px 0',
          fontSize: '1.5em',
          fontWeight: 'normal',
        },
        pattern: {
          angle: '0deg',
          colors: ['#e9c46a'],
          size: '20px',
        },
      },

      // 代码块样式（从 themes.css:533-546 提取）
      codeBlocks: {
        code: {
          fontFamily: '"Courier New", "Menlo", monospace',
          backgroundColor: 'rgba(233, 196, 106, 0.1)',
          color: '#3d3d3d',
          padding: '0.2em 0.5em',
          borderRadius: '4px',
        },
        pre: {
          fontFamily: '"Courier New", "Menlo", monospace',
          backgroundColor: 'rgba(233, 196, 106, 0.1)',
          color: '#3d3d3d',
          padding: '1.5em',
          margin: '25px 0',
          border: '1px solid rgba(233, 196, 106, 0.4)',
        },
      },

      // 表格样式
      tables: {
        table: {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '25px 0',
        },
        th: {
          backgroundColor: 'rgba(233, 196, 106, 0.1)',
          color: '#3d3d3d',
          padding: '12px 16px',
          border: '1px solid rgba(233, 196, 106, 0.4)',
          textAlign: 'left',
          fontWeight: '600',
          verticalAlign: 'middle',
        },
        td: {
          padding: '12px 16px',
          border: '1px solid rgba(233, 196, 106, 0.4)',
          verticalAlign: 'top',
          lineHeight: '1.6',
          color: '#3d3d3d',
        },
        tr: {
          border: '1px solid rgba(233, 196, 106, 0.4)',
        },
      },

      // 组件模板
      components: {
        ctaLink: {
          display: 'inline-block',
          padding: '12px 28px',
          background: '#9B2226',
          borderRadius: '0',
          fontWeight: '600',
          color: '#ffffff',
          textDecoration: 'none',
          textAlign: 'center',
          border: '2px solid #9B2226',
        },
        pill: {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '0',
          background: '#e9c46a',
          color: '#003049',
          fontSize: '0.875em',
          fontWeight: '600',
        },
        alertCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(233, 196, 106, 0.1)',
          border: '2px solid #e9c46a',
        },
        infoCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(0, 48, 73, 0.05)',
          border: '2px solid #003049',
        },
        successCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(233, 196, 106, 0.1)',
          border: '2px solid #e9c46a',
        },
        warningCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(233, 196, 106, 0.1)',
          border: '2px solid #e9c46a',
        },
        errorCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(155, 34, 38, 0.1)',
          border: '2px solid #9B2226',
        },
      },
    },
  }),
  buildTheme({
    id: 'minimalist',
    name: '现代简约',
    tokens: {
      '--wx-surface': '#f8f9fa',
      '--wx-text': '#2c3e50',
      '--wx-heading': '#2c3e50',
      '--wx-subheading': '#34495e',
      '--wx-accent': '#3498db',
      '--wx-accent-contrast': '#ffffff',
      '--wx-link': '#3498db',
      '--wx-quote-border': '#95a5a6',
      '--wx-code-bg': '#e9ecef',
      '--wx-code-text': '#2c3e50',
    },
    structured: {
      // 页面全局样式（从 themes.css:551-556 提取）
      page: {
        styles: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", "WenQuanYi Micro Hei", sans-serif',
          lineHeight: '1.85',
          color: '#2c3e50',
          backgroundColor: '#f8f9fa',
        },
      },

      // 容器样式（从 themes.css:558-565 提取）
      container: {
        styles: {
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.07)',
          maxWidth: '800px',
          margin: '0 auto',
        },
      },

      // 标题样式（从 themes.css:567-613 提取）
      headings: {
        h1: {
          styles: {
            fontSize: '1.9em',
            fontWeight: '700',
            textAlign: 'center',
            color: '#2c3e50',
            margin: '20px 0 40px',
            paddingBottom: '25px',
            borderBottom: '1px solid #f1f1f1',
            letterSpacing: '1px',
          },
        },
        h2: {
          styles: {
            fontSize: '1.6em',
            fontWeight: '700',
            color: '#2c3e50',
            margin: '70px 0 30px',
            paddingBottom: '15px',
            borderBottom: '1px solid #f1f1f1',
            position: 'relative',
          },
          pseudoBefore: {
            content: '01.',
            styles: {
              fontSize: '0.9em',
              fontWeight: '400',
              color: '#95a5a6',
              position: 'absolute',
              left: '0',
              top: '-35px',
            },
            positioning: 'absolute',
          },
        },
        h3: {
          styles: {
            fontSize: '1.3em',
            fontWeight: '600',
            color: '#34495e',
            margin: '45px 0 20px',
            paddingLeft: '15px',
            borderLeft: '3px solid #3498db',
          },
        },
        h4: {
          styles: {
            fontSize: '1.15em',
            fontWeight: '600',
            color: '#34495e',
            margin: '30px 0 15px',
          },
        },
      },

      // 列表样式（从 themes.css:638-640 提取）
      lists: {
        ul: {
          styles: {
            listStyle: 'none',
            margin: '30px 0',
            paddingLeft: '0',
          },
          markers: {
            simple: {
              symbol: '●',
              color: '#3498db',
              styles: {
                position: 'absolute',
                left: '0',
                top: '0.6em',
                width: '6px',
                height: '6px',
                fontSize: '1.2em',
                transform: 'translateY(-50%)',
              },
            },
          },
        },
        ol: {
          styles: {
            margin: '30px 0',
            paddingLeft: '1.5em',
          },
          listStyle: 'decimal',
        },
        li: {
          styles: {
            marginBottom: '0.5em',
            paddingLeft: '28px',
            position: 'relative',
            lineHeight: '1.75',
          },
        },
      },

      // 链接样式（从 themes.css:615-625 提取）
      links: {
        styles: {
          color: '#3498db',
          textDecoration: 'none',
          borderBottom: '1.5px solid rgba(52, 152, 219, 0.2)',
        },
        hoverStyles: {
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderBottomColor: 'rgba(52, 152, 219, 0.8)',
        },
      },

      // 引用块样式（从 themes.css:627-636 提取）
      blockquote: {
        styles: {
          backgroundColor: '#f8f9fa',
          color: '#576574',
          padding: '20px',
          margin: '30px 0',
          border: '1px solid #e9ecef',
          borderLeft: '4px solid #95a5a6',
          borderRadius: '6px',
          fontSize: '0.95em',
        },
      },

      // 代码块样式（从 themes.css:642-661 提取）
      codeBlocks: {
        code: {
          fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
          backgroundColor: '#e9ecef',
          color: '#2c3e50',
          padding: '0.3em 0.6em',
          margin: '0 2px',
          fontSize: '0.9em',
          borderRadius: '4px',
        },
        pre: {
          fontFamily: '"SFMono-Regular", Consolas, Menlo, Courier, monospace',
          background: '#f8f9fa',
          color: '#2c3e50',
          padding: '1.5em',
          margin: '25px 0',
          borderRadius: '6px',
          overflowX: 'auto',
          border: '1px solid #e9ecef',
        },
      },

      // 分隔符样式（从 themes.css:663-668 提取）
      dividers: {
        styles: {
          border: 'none',
          height: '1px',
          backgroundColor: '#e9ecef',
          margin: '70px 0',
        },
      },

      // 表格样式
      tables: {
        table: {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '25px 0',
        },
        th: {
          backgroundColor: '#f8f9fa',
          color: '#2c3e50',
          padding: '12px 16px',
          border: '1px solid #e9ecef',
          textAlign: 'left',
          fontWeight: '600',
          verticalAlign: 'middle',
        },
        td: {
          padding: '12px 16px',
          border: '1px solid #e9ecef',
          verticalAlign: 'top',
          lineHeight: '1.6',
          color: '#2c3e50',
        },
        tr: {
          border: '1px solid #e9ecef',
        },
      },

      // 组件模板
      components: {
        ctaLink: {
          display: 'inline-block',
          padding: '12px 28px',
          background: '#3498db',
          borderRadius: '8px',
          fontWeight: '600',
          color: '#ffffff',
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
        },
        pill: {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '999px',
          background: '#e3f2fd',
          color: '#3498db',
          fontSize: '0.875em',
          fontWeight: '500',
        },
        alertCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#fff7ed',
          border: '1px solid rgba(234, 88, 12, 0.2)',
        },
        infoCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#e3f2fd',
          border: '1px solid rgba(52, 152, 219, 0.2)',
        },
        successCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#f0fdf4',
          border: '1px solid rgba(34, 197, 94, 0.2)',
        },
        warningCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#fffbeb',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        },
        errorCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '8px',
          background: '#fef2f2',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        },
      },
    },
  }),
  buildTheme({
    id: 'cyberpunk',
    name: '赛博朋克风',
    tokens: {
      '--wx-surface': '#1a1a2e',
      '--wx-text': '#cddc39',
      '--wx-heading': '#ffffff',
      '--wx-subheading': '#cddc39',
      '--wx-accent': '#00ffff',
      '--wx-accent-contrast': '#000000',
      '--wx-link': '#ff00ff',
      '--wx-quote-border': '#ffff00',
      '--wx-code-bg': '#000000',
      '--wx-code-text': '#cddc39',
    },
    structured: {
      // 页面全局样式（从 themes.css:673-679 提取）
      page: {
        styles: {
          fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, "PingFang SC", "Microsoft YaHei", sans-serif',
          lineHeight: '1.8',
          color: '#cddc39',
          backgroundColor: '#1a1a2e',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(22, 22, 47, 0.8), rgba(22, 22, 47, 0.8) 1px, transparent 1px, transparent 4px)',
        },
      },

      // 容器样式（从 themes.css:681-689 提取）
      container: {
        styles: {
          backgroundColor: 'rgba(16, 16, 32, 0.7)',
          padding: '28px',
          border: '1px solid #00ffff',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          maxWidth: '800px',
          margin: '0 auto',
        },
      },

      // 标题样式（从 themes.css:691-738 提取）
      headings: {
        h1: {
          styles: {
            fontSize: '2.2em',
            fontWeight: '700',
            textAlign: 'center',
            color: '#fff',
            backgroundColor: 'transparent',
            padding: '20px',
            margin: '25px 0 40px',
            border: '2px solid #f0f',
            textTransform: 'uppercase',
            position: 'relative',
          },
          textShadow: '0 0 5px #f0f, 0 0 10px #f0f',
        },
        h2: {
          styles: {
            fontSize: '1.6em',
            fontWeight: '700',
            color: '#00ffff',
            margin: '50px 0 25px',
            paddingBottom: '10px',
            borderBottom: '2px solid #00ffff',
            textTransform: 'uppercase',
          },
          textShadow: '0 0 8px rgba(0, 255, 255, 0.7)',
        },
        h3: {
          styles: {
            fontSize: '1.3em',
            fontWeight: '700',
            color: '#cddc39',
            margin: '30px 0 15px',
            textTransform: 'uppercase',
          },
          pseudoBefore: {
            content: '>> ',
            styles: {
              color: '#f0f',
            },
            positioning: 'absolute',
          },
        },
        h4: {
          styles: {
            fontSize: '1.1em',
            fontWeight: '700',
            color: '#f0f',
            textShadow: '0 0 5px rgba(255, 0, 255, 0.7)',
            margin: '25px 0 12px',
            padding: '5px 10px',
            borderLeft: '3px solid #f0f',
            backgroundColor: 'rgba(255, 0, 255, 0.1)',
          },
          textShadow: '0 0 5px rgba(255, 0, 255, 0.7)',
        },
      },

      // 列表样式（从 themes.css:770-792 提取）
      lists: {
        ul: {
          styles: {
            margin: '0 0 1.5em 0',
            paddingLeft: '0',
          },
          markers: {
            custom: (_index: number, element: HTMLElement) => {
              const marker = element.ownerDocument!.createElement('span')
              marker.setAttribute('data-wx-marker', 'true')
              marker.style.cssText = `
                position: absolute;
                left: 0;
                top: 0.6em;
                width: 8px;
                height: 8px;
                background-color: #00ffff;
                border-radius: 50%;
                box-shadow: 0 0 8px #00ffff, 0 0 12px rgba(0, 255, 255, 0.7);
              `
              return marker
            },
          },
        },
        ol: {
          styles: {
            margin: '30px 0',
            paddingLeft: '1.5em',
          },
          listStyle: 'decimal',
        },
        li: {
          styles: {
            marginBottom: '0.8em',
            listStyleType: 'none',
            position: 'relative',
            paddingLeft: '25px',
          },
        },
      },

      // 链接样式（从 themes.css:740-752 提取）
      links: {
        styles: {
          color: '#f0f',
          textDecoration: 'none',
          fontWeight: '700',
          textShadow: '0 0 5px rgba(255, 0, 255, 0.7)',
        },
        hoverStyles: {
          color: '#fff',
          backgroundColor: '#f0f',
          boxShadow: '0 0 15px #f0f',
        },
      },

      // 引用块样式（从 themes.css:754-768 提取）
      blockquote: {
        styles: {
          backgroundColor: 'rgba(255, 255, 0, 0.1)',
          color: '#ffff00',
          padding: '20px',
          margin: '30px 0',
          border: '2px solid #ffff00',
          borderLeftWidth: '10px',
          fontFamily: 'monospace',
        },
        pseudoBefore: {
          content: 'SYSTEM ALERT: ',
          styles: {
            fontWeight: 'bold',
            color: '#fff',
          },
          positioning: 'absolute',
        },
      },

      // 分隔符样式（从 themes.css:794-799 提取）
      dividers: {
        styles: {
          border: 'none',
          height: '2px',
          backgroundImage: 'linear-gradient(to right, transparent, #00ffff, transparent)',
          margin: '50px 0',
        },
      },

      // 代码块样式（从 themes.css:801-819 提取）
      codeBlocks: {
        code: {
          fontFamily: 'inherit',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          color: '#00ffff',
          padding: '0.2em 0.5em',
          margin: '0 2px',
          borderRadius: '4px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
        },
        pre: {
          background: '#000',
          color: '#cddc39',
          padding: '1.5em',
          margin: '25px 0',
          overflowX: 'auto',
          border: '1px solid #cddc39',
          boxShadow: 'inset 0 0 10px rgba(205, 220, 57, 0.3)',
        },
      },

      // 表格样式
      tables: {
        table: {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '25px 0',
        },
        th: {
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          color: '#cddc39',
          padding: '12px 16px',
          border: '1px solid #00ffff',
          textAlign: 'left',
          fontWeight: '600',
          verticalAlign: 'middle',
        },
        td: {
          padding: '12px 16px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          verticalAlign: 'top',
          lineHeight: '1.6',
          color: '#cddc39',
        },
        tr: {
          border: '1px solid rgba(0, 255, 255, 0.3)',
        },
      },

      // 组件模板
      components: {
        ctaLink: {
          display: 'inline-block',
          padding: '12px 28px',
          background: '#f0f',
          borderRadius: '0',
          fontWeight: '700',
          color: '#000',
          textDecoration: 'none',
          textAlign: 'center',
          border: '2px solid #f0f',
          boxShadow: '0 0 15px #f0f',
        },
        pill: {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '0',
          background: '#00ffff',
          color: '#000',
          fontSize: '0.875em',
          fontWeight: '700',
          boxShadow: '0 0 10px #00ffff',
        },
        alertCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(255, 255, 0, 0.1)',
          border: '2px solid #ffff00',
          boxShadow: '0 0 10px rgba(255, 255, 0, 0.5)',
        },
        infoCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(0, 255, 255, 0.1)',
          border: '2px solid #00ffff',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
        },
        successCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(0, 255, 0, 0.1)',
          border: '2px solid #00ff00',
          boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
        },
        warningCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(255, 255, 0, 0.1)',
          border: '2px solid #ffff00',
          boxShadow: '0 0 10px rgba(255, 255, 0, 0.5)',
        },
        errorCard: {
          margin: '24px 0',
          padding: '20px',
          borderRadius: '0',
          background: 'rgba(255, 0, 255, 0.1)',
          border: '2px solid #ff00ff',
          boxShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
        },
      },
    },
  }),
]

export const DEFAULT_THEME_ID = 'chinese'

export function getThemePreset(themeId: string): ThemePreset {
  return BUILTIN_THEMES.find((theme) => theme.id === themeId) ?? BUILTIN_THEMES[0]
}
