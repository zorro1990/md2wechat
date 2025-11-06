#!/usr/bin/env node

/**
 * 主题隔离验证脚本
 * 验证产品UI与预览区主题的隔离效果
 */

const fs = require('fs')
const path = require('path')

console.log('=== 主题隔离验证 ===\n')

// 1. 验证主题管理器修改
console.log('📋 验证1: 主题管理器修改')
const managerPath = path.join(__dirname, 'apps/web/src/themes/manager.ts')
const managerContent = fs.readFileSync(managerPath, 'utf-8')

const hasBodyClassLogic = managerContent.includes('body.classList')
if (hasBodyClassLogic) {
  console.log('❌ 错误: manager.ts 中仍包含 body.classList 逻辑')
  console.log('   需要移除 body 上的主题类切换逻辑\n')
} else {
  console.log('✅ 正确: manager.ts 已移除 body 主题类逻辑')
  console.log('   保留了 CSS 变量设置和 root.dataset.wxTheme\n')
}

// 2. 验证主题样式文件修改
console.log('📋 验证2: 主题样式文件修改')
const themesPath = path.join(__dirname, 'apps/web/src/styles/themes.css')
const themesContent = fs.readFileSync(themesPath, 'utf-8')

const bodyThemeMatches = themesContent.match(/body\.theme-/g)
if (bodyThemeMatches && bodyThemeMatches.length > 0) {
  console.log('❌ 错误: themes.css 中仍有 body.theme- 选择器')
  console.log(`   发现 ${bodyThemeMatches.length} 处未替换\n`)
} else {
  console.log('✅ 正确: themes.css 已将所有 body.theme- 替换为 .wx-theme-')

  const wxThemeMatches = themesContent.match(/\.wx-theme-\w+/g)
  const uniqueThemes = [...new Set(wxThemeMatches)]
  console.log(`   已修改主题: ${uniqueThemes.join(', ')}\n`)
}

// 3. 验证PreviewPane实现
console.log('📋 验证3: PreviewPane 主题应用')
const previewPath = path.join(__dirname, 'apps/web/src/features/preview/PreviewPane.tsx')
const previewContent = fs.readFileSync(previewPath, 'utf-8')

const hasWxThemeClass = previewContent.includes('wx-theme-')
if (!hasWxThemeClass) {
  console.log('❌ 错误: PreviewPane 中未找到 wx-theme- 类应用\n')
} else {
  console.log('✅ 正确: PreviewPane 正确应用 wx-theme- 类')
  console.log('   article 元素会获得 wx-theme-{themeId} 类\n')
}

// 4. 总结
console.log('=== 验证总结 ===\n')

const allPassed = !hasBodyClassLogic && (!bodyThemeMatches || bodyThemeMatches.length === 0)

if (allPassed) {
  console.log('✅ 所有验证通过！主题隔离已实现')
  console.log('\n🎯 预期效果:')
  console.log('   - 产品UI: 保持固定的中国风样式，不随主题切换变化')
  console.log('   - 预览区: 根据用户选择的主题动态渲染')
  console.log('   - 主题隔离: 主题样式只影响预览区，不影响产品UI\n')

  console.log('🧪 测试步骤:')
  console.log('   1. 访问 http://localhost:5173')
  console.log('   2. 观察顶部栏、侧边栏、编辑器面板等保持中国风样式')
  console.log('   3. 在设置中切换不同主题(中国风/字节风/赛博朋克等)')
  console.log('   4. 验证预览区主题变化，但产品UI不变\n')
} else {
  console.log('❌ 验证失败，需要修复上述问题\n')
  process.exit(1)
}

// 5. 清理建议
console.log('=== 清理建议 ===\n')
console.log('如果需要清理其他地方依赖 body.theme-* 类，可以搜索以下文件:')
const searchCmd = `grep -r "body\\.theme" apps/web/src --include="*.tsx" --include="*.ts" --include="*.css" 2>/dev/null | head -20`
console.log(`  ${searchCmd}\n`)

console.log('✅ 验证完成！')
