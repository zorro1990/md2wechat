/**
 * 验证主题修复
 */

import { getThemePreset } from './apps/web/src/themes/presets.ts'
import { convertToInlineStyles } from './apps/web/src/conversion/inline-style-converter.ts'

// 测试HTML
const testHtml = `
<h1>测试标题</h1>
<h2>测试副标题</h2>
<ul>
  <li>列表项目一</li>
  <li>列表项目二</li>
</ul>
<blockquote>这是一个引用块</blockquote>
<a href="#">链接文本</a>
`

console.log('🧪 验证主题修复...\n')

try {
  // 测试1: 获取主题
  console.log('1. 测试主题获取')
  const defaultTheme = getThemePreset('default')
  const chineseTheme = getThemePreset('chinese')

  console.log('  - default 主题ID:', defaultTheme?.id)
  console.log('  - chinese 主题ID:', chineseTheme?.id)
  console.log('  - 两者是否相同:', defaultTheme.id === chineseTheme.id ? '✅ 相同' : '❌ 不同')
  console.log('  - default 有 structured:', !!defaultTheme?.structured)
  console.log()

  // 测试2: 转换Chinese主题
  console.log('2. 转换 Chinese 主题')
  const resultChinese = convertToInlineStyles(testHtml, chineseTheme)
  console.log('  - 结果长度:', resultChinese.length)
  console.log('  - 包含容器:', resultChinese.includes('<div'))
  console.log('  - 包含容器样式:', resultChinese.includes('background-color: #ffffff'))
  console.log('  - 包含H1样式:', resultChinese.includes('color: #a72f2f'))
  console.log('  - 包含H1虚线:', resultChinese.includes('dashed'))
  console.log('  - 包含H2样式:', resultChinese.includes('background-color: #a72f2f'))
  console.log('  - 包含列表marker:', resultChinese.includes('data-wx-marker'))
  console.log('  - 包含引用块样式:', resultChinese.includes('border-left: 3px solid #a72f2f'))
  console.log()

  // 测试3: 检查关键样式
  console.log('3. 关键样式检查')
  const checks = [
    { name: '容器背景', check: resultChinese.includes('background-color: #ffffff') },
    { name: '容器内边距', check: resultChinese.includes('padding: 30px') },
    { name: '容器边框', check: resultChinese.includes('border: 1px solid #e0e0e0') },
    { name: '容器阴影', check: resultChinese.includes('box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05)') },
    { name: 'H1颜色', check: resultChinese.includes('color: #a72f2f') },
    { name: 'H1虚线', check: resultChinese.includes('border-bottom: 2px dashed rgba(167, 47, 47, 0.5)') },
    { name: 'H2背景', check: resultChinese.includes('background-color: #a72f2f') },
    { name: '列表无默认样式', check: resultChinese.includes('list-style: none') },
    { name: '引用块背景', check: resultChinese.includes('background-color: #fdfdfb') },
    { name: '链接颜色', check: resultChinese.includes('color: #a72f2f') },
  ]

  let passed = 0
  checks.forEach(check => {
    const status = check.check ? '✅' : '❌'
    console.log(`  ${status} ${check.name}: ${check.check ? '通过' : '失败'}`)
    if (check.check) passed++
  })

  console.log(`\n📊 通过率: ${passed}/${checks.length} (${(passed/checks.length*100).toFixed(1)}%)`)

  if (passed === checks.length) {
    console.log('\n🎉 所有检查都通过了！修复成功！')
  } else {
    console.log('\n⚠️  部分检查未通过，需要进一步调试')
  }

} catch (error) {
  console.error('❌ 验证失败:', error)
  console.error(error.stack)
}
