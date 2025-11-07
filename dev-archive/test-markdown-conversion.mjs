/**
 * 测试 Markdown 转 HTML 的实际输出
 * 检查列表项的空格处理
 */

import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const testMarkdown = `*   **实时预览**：左侧编辑，右侧即时查看排版效果。`

console.log('📄 Markdown:')
console.log(testMarkdown)
console.log('\n🔍 Markdown 字符分析:')
console.log(`总长度: ${testMarkdown.length}`)
console.log(`* 后面的字符:`, [...testMarkdown.substring(1, 5)].map(c => `"${c}" (U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`))

// 转换 Markdown 到 HTML
const processor = remark()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)

const result = await processor.process(testMarkdown)
const html = String(result.value)

console.log('\n📄 转换后的 HTML:')
console.log(html)

// 分析 HTML 中的字符
const strongEnd = html.indexOf('</strong>')
const colonIndex = html.indexOf('：', strongEnd)

console.log('\n🔍 HTML 字符分析:')
console.log(`</strong> 位置: ${strongEnd}`)
console.log(`： 位置: ${colonIndex}`)

if (strongEnd !== -1 && colonIndex !== -1) {
  const between = html.substring(strongEnd + 9, colonIndex)
  console.log(`之间的字符数: ${between.length}`)
  console.log(`之间的内容: "${between}"`)
  console.log(`之间的字符码:`, [...between].map(c => `"${c}" (U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`))
}

// 检查整个 <li> 标签的内容
const liStart = html.indexOf('<li>')
const liEnd = html.indexOf('</li>')
if (liStart !== -1 && liEnd !== -1) {
  const liContent = html.substring(liStart + 4, liEnd)
  console.log('\n🔍 <li> 标签内容:')
  console.log(`"${liContent}"`)
  console.log(`长度: ${liContent.length}`)
  
  // 显示所有字符及其编码
  console.log('\n🔍 所有字符详细分析:')
  const chars = [...liContent]
  chars.forEach((c, i) => {
    const code = c.charCodeAt(0)
    const hex = code.toString(16).toUpperCase().padStart(4, '0')
    const display = c === ' ' ? '␣' : c === '\n' ? '↵' : c
    console.log(`  ${i.toString().padStart(3)}: "${display}" (U+${hex}) ${code === 0x0020 ? '← 空格' : code === 0x00A0 ? '← 不间断空格' : ''}`)
  })
}

