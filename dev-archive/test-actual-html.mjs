/**
 * 测试实际的 HTML 输出
 * 检查是否有多余的字符
 */

const testMarkdown = `*   **实时预览**：左侧编辑，右侧即时查看排版效果。`

// 模拟 Markdown 转 HTML 的过程
const expectedHTML = `<ul>
<li><strong>实时预览</strong>：左侧编辑，右侧即时查看排版效果。</li>
</ul>`

console.log('📄 Markdown:')
console.log(testMarkdown)
console.log('\n📄 预期的 HTML:')
console.log(expectedHTML)

// 检查 HTML 中的字符
console.log('\n🔍 字符分析:')
const strongEnd = expectedHTML.indexOf('</strong>')
const colonIndex = expectedHTML.indexOf('：', strongEnd)

console.log(`</strong> 位置: ${strongEnd}`)
console.log(`： 位置: ${colonIndex}`)
console.log(`之间的字符数: ${colonIndex - (strongEnd + 9)}`)

const between = expectedHTML.substring(strongEnd + 9, colonIndex)
console.log(`之间的内容: "${between}"`)
console.log(`之间的内容长度: ${between.length}`)
console.log(`之间的字符码:`, [...between].map(c => c.charCodeAt(0)))

// 测试应用 preventWechatPunctuationBreaks 后的结果
const WORD_JOINER = '\u2060'

// 模拟转换后的 HTML
const convertedHTML = expectedHTML.replace('</strong>：', `</strong>${WORD_JOINER}：`)

console.log('\n📄 转换后的 HTML:')
console.log(convertedHTML)

// 检查转换后的字符
const strongEnd2 = convertedHTML.indexOf('</strong>')
const colonIndex2 = convertedHTML.indexOf('：', strongEnd2)

console.log('\n🔍 转换后字符分析:')
console.log(`</strong> 位置: ${strongEnd2}`)
console.log(`： 位置: ${colonIndex2}`)
console.log(`之间的字符数: ${colonIndex2 - (strongEnd2 + 9)}`)

const between2 = convertedHTML.substring(strongEnd2 + 9, colonIndex2)
console.log(`之间的内容: "${between2}"`)
console.log(`之间的内容长度: ${between2.length}`)
console.log(`之间的字符码:`, [...between2].map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`))

// 检查是否有 U+2060
const hasWordJoiner = convertedHTML.includes('\u2060')
const wordJoinerCount = (convertedHTML.match(/\u2060/g) || []).length

console.log('\n✅ U+2060 检查:')
console.log(`包含 U+2060: ${hasWordJoiner}`)
console.log(`U+2060 数量: ${wordJoinerCount}`)

// 显示所有 U+2060 的位置
const positions = []
for (let i = 0; i < convertedHTML.length; i++) {
  if (convertedHTML[i] === '\u2060') {
    positions.push(i)
  }
}
console.log(`U+2060 位置:`, positions)

