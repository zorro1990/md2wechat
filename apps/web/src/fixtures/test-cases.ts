export interface TestDocument {
  id: string
  title: string
  markdown: string
  description: string
}

export interface ThemeMatrixEntry {
  id: string
  name: string
  description: string
}

const LONG_PARAGRAPH = `持续迭代内容与故事节点，构建可复用的排版模版，
让每位创作者都能在熟悉的节奏中完成排版调整，将注意力集中于内容质量。`

export const TEST_DOCUMENTS: TestDocument[] = [
  {
    id: 'short-intro',
    title: '短篇：功能介绍',
    description: '涵盖基础段落、列表与链接的短篇文稿',
    markdown: `# MD2WeChat 简介

欢迎使用 **MD2WeChat**！

## 功能亮点
- 实时预览
- 所见即所得主题
- 微信兼容脚注

访问 [产品主页](https://md2wechat.cn) 获取最新主题。`,
  },
  {
    id: 'long-article',
    title: '长篇：深度指南',
    description: '模拟 5000 字级别的长篇文章，含多图与多级标题',
    markdown: `# 创作者效率提升 30% 的实践手册

> 这份指南总结了 30+ 位创作者的排版经验。

## 第一章：写作准备

### 1.1 内容结构

| 模块 | 说明 |
| --- | --- |
| 主题 | 聚焦单一话题 |
| 节奏 | 控制段落长度 |

![流程草图](https://dummyimage.com/800x400/000/fff)

${Array.from({ length: 80 }, () => LONG_PARAGRAPH).join('\n\n')}
`,
  },
  {
    id: 'code-heavy',
    title: '代码片段与引用',
    description: '验证代码块、脚注与引用渲染的代码范例文档',
    markdown: `# 技术实现说明

> 注意：代码块需要在微信中保持 monospace 样式。


\`\`\`ts
export const createRenderer = () => {
  console.log('render markdown to wechat html')
}
\`\`\`

1. 引用脚注示例[^wechat]
2. 表格与代码混排场景

[^wechat]: 微信后台对外链较为敏感，建议转为脚注。
`,
  },
]

export const THEME_MATRIX: ThemeMatrixEntry[] = [
  { id: 'default', name: '经典黑金', description: '系统默认主题，侧重稳重的黑金配色' },
  { id: 'fresh', name: '清新绿意', description: '适合生活方式内容，轻盈配色' },
  { id: 'tech', name: '科技蓝', description: '适用于产品与技术文章，强化层次' },
  { id: 'edu', name: '教育蓝绿', description: '课程内容常用主题，强调可读性' },
  { id: 'warm', name: '暖色橙', description: '品牌故事类文章常见配色' },
  { id: 'minimal', name: '极简灰', description: '纯净背景，突出正文与图表' },
]
