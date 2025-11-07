/**
 * 测试完整的转换链路
 */

const { getThemePreset } = require('./apps/web/src/themes/presets.ts')
const { convertToInlineStyles } = require('./apps/web/src/conversion/inline-style-converter.ts')

// 测试HTML
const testHtml = `
<h1>测试标题</h1>
<h2>测试副标题</h2>
<ul>
  <li>列表项目一</li>
  <li>列表项目二</li>
  <li>列表项目三</li>
</ul>
<blockquote>这是一个引用块</blockquote>
<a href="#">链接文本</a>
<a class="wx-cta-link">立即注册</a>
`

console.log('🧪 开始测试完整转换链路...\n')

try {
  // 测试1: 获取主题
  console.log('1. 测试主题获取')
  const defaultTheme = getThemePreset('default')
  const chineseTheme = getThemePreset('chinese')

  console.log('  - default 主题:', defaultTheme?.id, defaultTheme?.name)
  console.log('  - chinese 主题:', chineseTheme?.id, chineseTheme?.name)
  console.log('  - default 有 structured:', !!defaultTheme?.structured)
  console.log('  - chinese 有 structured:', !!chineseTheme?.structured)
  console.log()

  // 测试2: 转换 default 主题
  console.log('2. 转换 default 主题')
  const resultDefault = convertToInlineStyles(testHtml, defaultTheme)
  console.log('  - 结果长度:', resultDefault.length)
  console.log('  - 包含容器样式:', resultDefault.includes('background-color'))
  console.log('  - 包含 H1:', resultDefault.includes('<h1'))
  console.log()

  // 测试3: 转换 chinese 主题
  console.log('3. 转换 chinese 主题')
  const resultChinese = convertToInlineStyles(testHtml, chineseTheme)
  console.log('  - 结果长度:', resultChinese.length)
  console.log('  - 包含容器样式:', resultChinese.includes('background-color'))
  console.log('  - 包含 H1:', resultChinese.includes('<h1'))
  console.log()

  // 测试4: 对比结果
  console.log('4. 对比转换结果')
  console.log('  - 两者是否相同:', resultDefault === resultChinese ? '✅ 相同' : '❌ 不同')

  if (resultDefault !== resultChinese) {
    console.log('\n  差异分析:')
    console.log('  - default 包含虚线:', resultDefault.includes('dashed'))
    console.log('  - chinese 包含虚线:', resultChinese.includes('dashed'))
    console.log('  - default 包含容器:', resultDefault.includes('<div'))
    console.log('  - chinese 包含容器:', resultChinese.includes('<div'))
  }

  console.log('\n✅ 测试完成！')

} catch (error) {
  console.error('❌ 测试失败:', error)
  console.error(error.stack)
}
