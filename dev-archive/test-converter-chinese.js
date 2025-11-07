/**
 * 测试 Chinese 主题的结构化样式转换
 */

const { convertToInlineStyles } = require('./dist/conversion/inline-style-converter.js')
const { getThemePreset } = require('./dist/themes/presets.js')

// 测试 HTML
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

console.log('🧪 开始测试 Chinese 主题转换...\n')

try {
  const theme = getThemePreset('chinese')

  console.log('📝 输入 HTML:')
  console.log(testHtml)
  console.log('\n' + '='.repeat(80) + '\n')

  const result = convertToInlineStyles(testHtml, theme)

  console.log('✅ 转换成功！')
  console.log('\n📤 输出结果:')
  console.log(result)
  console.log('\n' + '='.repeat(80) + '\n')

  // 验证关键样式
  const checks = [
    { name: '容器背景色', check: result.includes('background-color: #ffffff') },
    { name: '容器内边距', check: result.includes('padding: 30px') },
    { name: '容器阴影', check: result.includes('box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05)') },
    { name: 'H1 颜色', check: result.includes('color: #a72f2f') },
    { name: 'H1 虚线下划线', check: result.includes('border-bottom: 2px dashed') },
    { name: 'H2 渐变背景', check: result.includes('background-image:') },
    { name: '列表 marker', check: result.includes('data-wx-marker="true"') },
    { name: '引用块左边框', check: result.includes('border-left: 3px solid #a72f2f') },
    { name: '链接颜色', check: result.includes('color: #a72f2f') },
    { name: 'CTA 按钮样式', check: result.includes('background: #a72f2f') },
  ]

  console.log('🔍 验证结果:')
  checks.forEach(check => {
    const status = check.check ? '✅' : '❌'
    console.log(`${status} ${check.name}: ${check.check ? '通过' : '失败'}`)
  })

  console.log('\n' + '='.repeat(80) + '\n')
  console.log('🎉 测试完成！')

  // 统计通过率
  const passed = checks.filter(c => c.check).length
  const total = checks.length
  console.log(`📊 通过率: ${passed}/${total} (${(passed/total*100).toFixed(1)}%)`)

  if (passed === total) {
    console.log('✨ 所有检查都通过了！')
  } else {
    console.log('⚠️  部分检查未通过，需要调试')
  }

} catch (error) {
  console.error('❌ 测试失败:', error)
  process.exit(1)
}
